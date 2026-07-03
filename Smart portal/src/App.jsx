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
const UNIFIED_URL = "http://localhost:8080/events";
function App() {
  const [data, setData] = useState({});
  const [lastUpdated, setlastUpdated] = useState({});
  const [status, setStatus] = useState("disconnected");
  const reconnectTimer = useRef(null);
  const stampTime = (source, time) => {
    if (!time) return;
    setlastUpdated((prev) => ({ ...prev, [source]:time }));
  };
  const applyDelta = (source, delta, time) => {
    stampTime(source, time);
    setData((prev) => {
      const updated = { ...prev };
      const sourceData = { ...(updated[source] || {}) };
      if (delta.type === "new") {
        sourceData[delta.key] = delta.metrics;
      }
      if (delta.type === "update") {
        if (Array.isArray(sourceData[delta.key])) {
          const arr = [...sourceData[delta.key]];
          delta.changes.forEach((change) => {
            arr[change.index] = change.new;
          });
          sourceData[delta.key] = arr;
        } else {
          sourceData[delta.key] = delta.changes[0].new;
        }
      }
      updated[source] = sourceData;
      return updated;
    });
  };
  const connectToUnifiedStream = (retry = 0) => {
    setStatus("connecting");
    const es = new EventSource(UNIFIED_URL);
    es.onopen = () => {
      setStatus("connected");
    };
    es.onerror = () => {
      es.close();
      setStatus("disconnected");
      const timeout = Math.min(5000, 1000 * (retry + 1));
      reconnectTimer.current = setTimeout(() => {
        connectToUnifiedStream(retry + 1);
      }, timeout);
    };
    SOURCES.forEach((source) => {
      es.addEventListener(source, (e) => {
        try {
          const { type, payload, last_updated_time } = JSON.parse(e.data);
          if (type === "snapshot") {
            stampTime(source, last_updated_time)
            setData((prev) => ({
              ...prev,
              [source]: payload,
            }));
          } else if (type === "delta") {
            applyDelta(source, payload, last_updated_time);
          }
        } catch (err) {
          console.error(`Error parsing message for ${source}:`, err);
        }
      });
    });
    return es;
  };
  useEffect(() => {
    const es = connectToUnifiedStream();
    return () => {
      es.close();
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current);
      }
    };
  }, []);
  const branchCount = data.branchLoggedInNo?.["branch logged in No"] || "0";
  const tellerCount = data.tellerLoggedInNo?.["teller logged in No"] || "0";
  const repostingCount = data.repostingFail?.["repost fail"] || "0";
  const neftInvalidDay = data.neftInvalidDay?.["NEFT INVALID COUNT(In 9Apps) "] || "0";
  const neftInvalidNight = data.neftInvalidNight?.["NEFT NIGHT INVALID COUNT(In 9Apps) "] || "0";
  const Mflags_d = data.Mflags_d || "20260525";
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
