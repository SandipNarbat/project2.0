import React, { useEffect, useRef, useState } from "react";
import { Routes, Route } from "react-router-dom";
import Dashboard from "./Dashboard";
import NightDashboard from "./NightDashboard"
import Legend from "./pages/legend";
import CBSFlow from "./pages/CBSFlow";
import BranchTellerInterval from "./pages/BranchTellerInterval";
import MilestoneDetails from "./pages/MilestoneDetails";
import BranchLoggedIn from "./pages/BranchLoggedIn";
import TellerLoggedIn from "./pages/TellerLoggedIn";
import TxnDesc from "./pages/TxnDesc";
import AllFiles from "./pages/AllFiles";
import UpiMr from "./pages/UpiMr";
import NeftInvalid from "./pages/NeftInvalid";
import RepostingStatus from "./pages/RepostingStatus";
import RepostFail from "./pages/RepostFail";
import RtgsIncomingGateway from "./pages/RtgsIncomingGateway";
// import RtgsIncomingAck from "./pages/RtgsIncomingAck";
import TopNavBar from "./components/TopNavBar";
import QueueReplica from "./blocks/QueueReplica";
const SOURCES = [
  "jobs",
  "queue",
  "context",
  "trickle",
  "space",
  "branchLoggedInNo",
  "tellerLoggedInNo",
  "branchLoggedIn",
  "repostingFail",
  "neftInvalidNight",
  "neftInvalidDay",
  "UpiMrMax",
  "RTGSngingGateway12Apps",
  "PrLegend",
  "NrLegend",
  "DrLegend",
  "RtgsIncoming",
  "Mflags_d",
  "RtgsOutgoing",
  "rtgsIncomingPend",
  "rtgsOutgoingPend",
  "RTGSACKngingGateway12Apps",
  "system",
  "MQStatus",
  "OCRNEFT",
  "miscTxtCount",
  "batchUpload",
  "resourse",
  "neftRepostFailPage",
  "neftIncomingCount",
  //night
  "jobsNight",
  "queueNight",
  "in0800",
  "BR0501",
  "activeJobM",
  "activeJobS1"
];
const UNIFIED_URL = import.meta.env.VITE_SSE_URL || "http://localhost:8080/events";

// Incoming SSE events are buffered and applied in one batch every FLUSH_MS.
// The message handlers themselves do no JSON.parse and no setState — a burst
// of messages (initial sync, reconnect, busy files) costs two state updates
// per flush instead of two per message. This is what removes the
// "[Violation] 'message' handler took NNNNms" freezes.
const FLUSH_MS = 150;
const MAX_BUFFER = 2000;   // hard cap: flush immediately if a burst piles up

// Apply an array of deltas to one source's state (pure, single copy).
// Tolerates both the new array payload and the old single-delta object.
function applyDeltas(sourceState, deltas) {
  const next = { ...(sourceState || {}) };
  for (const delta of deltas) {
    if (delta.type === "new") {
      next[delta.key] = delta.metrics;
    } else if (delta.type === "update") {
      if (Array.isArray(next[delta.key])) {
        const arr = [...next[delta.key]];
        delta.changes.forEach((change) => {
          arr[change.index] = change.new;
        });
        next[delta.key] = arr;
      } else {
        next[delta.key] = delta.changes[0]?.new;
      }
    }
  }
  return next;
}

function App() {
  const [data, setData] = useState({});
  const [lastUpdated, setlastUpdated] = useState({});
  const [status, setStatus] = useState("disconnected");
  const esRef = useRef(null);
  const bufRef = useRef([]);
  const flushTimerRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const retryRef = useRef(0);

  useEffect(() => {
    let closed = false;

    const flush = () => {
      flushTimerRef.current = null;
      const events = bufRef.current;
      bufRef.current = [];
      if (events.length === 0) return;

      // Parse everything OUTSIDE setState. One bad event is skipped, not fatal.
      let initSources = null;              // last init wins wholesale
      const perSource = new Map();         // source -> envelopes in arrival order
      const stamps = {};
      for (const { source, raw } of events) {
        try {
          const msg = JSON.parse(raw);
          if (source === "__init") {
            // A fresh connection's init supersedes anything buffered before it.
            initSources = msg.sources || {};
            perSource.clear();
            for (const [s, v] of Object.entries(initSources)) {
              if (v?.last_updated_time) stamps[s] = v.last_updated_time;
            }
          } else if (msg.type === "snapshot" || msg.type === "delta") {
            let list = perSource.get(source) || [];
            if (msg.type === "snapshot") list = [];   // snapshot supersedes buffered deltas
            list.push(msg);
            perSource.set(source, list);
            if (msg.last_updated_time) stamps[source] = msg.last_updated_time;
          }
          // other types (rollover, fileRemoved, …) are informational — ignored
        } catch (err) {
          console.error(`Error parsing message for ${source}:`, err);
        }
      }

      setData((prev) => {
        const next = { ...prev };
        if (initSources) {
          for (const [s, v] of Object.entries(initSources)) next[s] = v.payload;
        }
        for (const [s, msgs] of perSource) {
          let cur = next[s];
          for (const msg of msgs) {
            if (msg.type === "snapshot") {
              cur = msg.payload;
            } else {
              const deltas = Array.isArray(msg.payload) ? msg.payload : [msg.payload];
              cur = applyDeltas(cur, deltas);
            }
          }
          next[s] = cur;
        }
        return next;
      });
      if (Object.keys(stamps).length > 0) {
        setlastUpdated((prev) => ({ ...prev, ...stamps }));
      }
    };

    const enqueue = (source, raw) => {
      bufRef.current.push({ source, raw });
      if (bufRef.current.length >= MAX_BUFFER) {
        if (flushTimerRef.current) clearTimeout(flushTimerRef.current);
        flush();
        return;
      }
      if (!flushTimerRef.current) flushTimerRef.current = setTimeout(flush, FLUSH_MS);
    };

    const connect = () => {
      if (closed) return;
      setStatus("connecting");
      const es = new EventSource(UNIFIED_URL);
      esRef.current = es;   // ALWAYS in the ref so cleanup can reach reconnects
      es.onopen = () => {
        retryRef.current = 0;
        setStatus("connected");
      };
      es.onerror = () => {
        es.close();
        if (esRef.current === es) esRef.current = null;
        setStatus("disconnected");
        if (closed) return;
        const timeout = Math.min(5000, 1000 * (retryRef.current + 1));
        retryRef.current += 1;
        reconnectTimerRef.current = setTimeout(connect, timeout);
      };
      es.addEventListener("init", (e) => enqueue("__init", e.data));
      SOURCES.forEach((source) => {
        es.addEventListener(source, (e) => enqueue(source, e.data));
      });
    };

    connect();

    return () => {
      closed = true;
      if (esRef.current) { esRef.current.close(); esRef.current = null; }
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      if (flushTimerRef.current) { clearTimeout(flushTimerRef.current); flushTimerRef.current = null; }
      bufRef.current = [];
    };
  }, []);
  const branchCount = data.branchLoggedInNo?.["branch logged in No"] || "0";
  const tellerCount = data.tellerLoggedInNo?.["teller logged in No"] || "0";
  const repostingCount = data.repostingFail?.["repost fail"] || "0";
  const neftInvalidDay = data.neftInvalidDay?.["NEFT INVALID COUNT(In 9Apps) "] || "0";
  const neftInvalidNight = data.neftInvalidNight?.["NEFT NIGHT INVALID COUNT(In 9Apps) "] || "0";
  // Server sends { MFLAGS_D: "yyyymmdd" }; older builds sent a raw string.
  // Never pass an object to TopNavBar (it rendered "[object Object]").
  const Mflags_d = typeof data.Mflags_d === "string"
    ? data.Mflags_d
    : (data.Mflags_d && Object.values(data.Mflags_d)[0]) || "";
  return (
    <>
      <TopNavBar branchCount={branchCount} tellerCount={tellerCount} repostingCount={repostingCount} neftInvalidDay={neftInvalidDay} neftInvalidNight={neftInvalidNight} MFLAGS_D={Mflags_d}/>
      <Routes>
        <Route path="/" element={<Dashboard data={data} lastUpdated = {lastUpdated}/>} />
        <Route path="/night" element={<NightDashboard data={data} lastUpdated = {lastUpdated}/>} />
        <Route path="/legend" element={<Legend data={data} />} />
        <Route path="/cbs-flow" element={<CBSFlow />} />
        <Route path="/queue_replica" element={<QueueReplica />} />
        {/* <Route path="/branch-teller-interval" element={<BranchTellerInterval />} /> */}
        {/* <Route path="/milestone-details" element={<MilestoneDetails />} /> */}
        <Route path="/branch-logged-in" element={<BranchLoggedIn data={data} />} />
        <Route path="/teller-logged-in" element={<TellerLoggedIn />} />
        <Route path="/txn-desc" element={<TxnDesc />} />
        <Route path="/all-files" element={<AllFiles />} />
        {/* <Route path="/upi-mr" element={<UpiMr data= {data}/>} /> */}
        <Route path="/neft-invalid" element={<NeftInvalid />} />
        {/* <Route path="/reposting-status" element={<RepostingStatus />} /> */}
        <Route path="/repost-fail" element={<RepostFail data={data} lastUpdated = {lastUpdated} />} />
        <Route path="/rtgs-incoming-gateway" element={<RtgsIncomingGateway data={data} />} />
        {/* <Route path="/rtgs-incoming-ack" element={<RtgsIncomingAck />} /> */}
      </Routes>
    </>
  );
}
export default App;
// App.js end
