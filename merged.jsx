import { useState, useEffect, useRef } from "react";
import { IconCheck, IconWarning, IconError, IconLock, IconSlash, IconSnow, IconZap, IconGrid, IconCross } from "./Icons";
import './ActiveJobs.css'
function GridAnimatedCell({ jobName, value, index }) {
    const [highlight, setHighlight] = useState(false);
    const prev = useRef(value);
    useEffect(() => {
        if (prev.current !== value) {
            setHighlight(true);
            const timer = setTimeout(() => setHighlight(false), 800);
            prev.current = value;
            return () => clearTimeout(timer);
        }
    }, [value]);
    return (
        <td className={highlight ? "highlight-row" : ""}>
            <span>{value}</span>
        </td>
    );
}
const list = {
    0: "M",
    1: "S1",
    2: "S2",
    3: "S3",
    4: "S4",
    5: "S5",
    6: "S6",
    7: "S7",
    8: "S8",
    9: "S9",
    10: "S10",
    11: "S11",
    12: "S12",
    13: "S13",
    14: "S14",
    15: "S15",
}
export default function ActiveJobs({ data, lastUpdated }) {
    const sourceDataM = data.activeJobM || {};
    const sourceDataS1 = data.activeJobS1 || {};
    const jobKeys = Object.keys(sourceDataM);
    const activeJob = [sourceDataM, sourceDataS1, sourceDataM, sourceDataS1, sourceDataM, sourceDataS1, sourceDataM, sourceDataS1, sourceDataM, sourceDataS1, sourceDataM, sourceDataS1, sourceDataM, sourceDataS1, sourceDataM, sourceDataS1]
    return (
        <div className="active-job-block">
            {activeJob.map((val, i) => {
                const sourceData = val || {};
                const jobKeys = Object.keys(val);
                return (
                    <div className="active-jobs" key={i}>
                        <div className="card-header">
                            <div className="active-jobs-card-title">
                                {/* <IconGrid /> */}
                                <h2>{`${list[i]} Active Jobs`}</h2>
                            </div>
                            <div className="timestamp">
                                <p><span>•</span> {lastUpdated.activeJobM}</p>
                            </div>
                        </div>
                        <div className="table-wrap">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Server</th>
                                        <th>No of Stream</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {jobKeys.length > 0 ? (
                                        jobKeys.map((key) => {
                                            return (
                                                <tr key={key}>
                                                    <td>{key}</td>
                                                    <td>{sourceData[key]}</td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={13} className="text-center opacity-50">Waiting for data...</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )
            })}
        </div>
    );
}
import './AlertBar.css';
import QueueAlerts from '../blocks/QueueAlerts';
import Test from './test'
import { useLocation } from 'react-router-dom';
export default function AlertBar({dataToAlert = {}}) {
    const location = useLocation();
  const isNightActive = location.state?.isNightActive || false;
  return (
    <div className="alert-bar">
      {isNightActive === false ? (
        <QueueAlerts data={dataToAlert.queue} />
      ) : (
        <QueueAlerts data={dataToAlert.queueNight} />
      )}
    </div>
  )
}
import React, { useState, useEffect, useRef } from 'react';
import { IconAlertCircle, IconAlertTriangle, IconWarning } from '../components/Icons';
import './AlertPopup.css';
const BellIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
);
const AlertPopup = ({ totalAlerts, criticalCount, highCount, onOpen, alertsList }) => {
    const [visible, setVisible] = useState(false);     // popup toast visible
    const [collapsed, setCollapsed] = useState(false); // collapsed into bell button
    const [prevTotal, setPrevTotal] = useState(totalAlerts);
    const [prevCriticalCount, SetPrevCriticalCount] = useState(criticalCount);
    const timerRef = useRef(null);
    const alarmRef = useRef(null);
    useEffect(() => {
        alarmRef.current = new Audio('/alarm.wav');
        alarmRef.current.load();
        const unlock = () => {
            const a = alarmRef.current;
            if (!a) return;
            a.play().then(() => { a.pause(); a.currentTime = 0; }).catch(() => { });
            window.removeEventListener('click', unlock);
            window.removeEventListener('keydown', unlock);
        };
        window.addEventListener('click', unlock);
        window.addEventListener('keydown', unlock);
        return () => {
            window.removeEventListener('click', unlock);
            window.removeEventListener('keydown', unlock);
        };
    }, []);
    const playAlarm = () => {
        const a = alarmRef.current;
        if (!a) return;
        a.currentTime = 0; // rewind so rapid alerts always replay
        a.play().catch((err) => console.warn('Alarm blocked:', err));
    };
    // Trigger popup whenever alert count changes (and > 0)
    useEffect(() => {
        if (totalAlerts > 0 && totalAlerts !== prevTotal) {
            showPopup();
        }
        // Also show on first load if there are alerts
        if (prevTotal === 0 && totalAlerts > 0 && !visible && !collapsed) {
            showPopup();
        }
        if (criticalCount > prevCriticalCount) {
            playAlarm();
            showPopup();
        }
        if (prevCriticalCount > 0 && criticalCount > prevCriticalCount) {
            playAlarm();
            showPopup();
        }
        setPrevTotal(totalAlerts);
        SetPrevCriticalCount(criticalCount)
    }, [totalAlerts, criticalCount]);
    // Show on mount if alerts exist
    useEffect(() => {
        if (totalAlerts > 0) {
            showPopup();
        }
    }, []);
    const showPopup = () => {
        setCollapsed(false);
        setVisible(true);
        clearTimeout(timerRef.current);
        // Auto-dismiss after 5 seconds → collapse into bell
        timerRef.current = setTimeout(() => {
            setVisible(false);
            setCollapsed(true);
        }, 5000);
    };
    const handleDismiss = () => {
        clearTimeout(timerRef.current);
        setVisible(false);
        setCollapsed(true);
    };
    const handleBellClick = () => {
        setCollapsed(false);
        if (onOpen) onOpen(); // optionally scroll/open full panel
        showPopup();
    };
    if (totalAlerts === 0) return null;
    return (
        <>
            {/* Toast Popup */}
            <div className={`alert-popup ${visible ? 'popup-enter' : 'popup-exit'}`}>
                <div className="popup-header">
                    <span className="popup-title">⚠ Queue Buildup Alerts</span>
                    <button className="popup-close" onClick={handleDismiss}>✕</button>
                </div>
                <div className="queue-alert">
                    <div className="middle-queue">
                        <div className="total-que red">
                            <h2>{totalAlerts}</h2>
                            <p className='white'>TOTAL ALERTS</p>
                        </div>
                        <div className='line'></div>
                        <div className="que-block">
                            <div className="icon"><IconAlertTriangle /></div>
                            <div className='middle-block red'>
                                <h2>{criticalCount}</h2>
                                <p>CRITICAL</p>
                                <p className='white'>{"> 500"}</p>
                            </div>
                        </div>
                        <div className='line'></div>
                        <div className="que-block">
                            <div className="icon"><IconAlertCircle /></div>
                            <div className='middle-block orange'>
                                <h2>{highCount}</h2>
                                <p>HIGH</p>
                                <p className='white'>{"200 - 499"}</p>
                            </div>
                        </div>
                    </div>
                    <div className="lower-queue">
                        <p>TOP QUEUE BUILDUPS</p>
                        <div className="queue-tiles">
                            {alertsList.map((alert, index) => {
                                const { key, value, serverIndex, isCritical } = alert;
                                const tileClass = isCritical ? 'tile-red' : 'tile-orange';
                                const serverClass = isCritical ? 'server-red' : 'server-orange';
                                const uniqueKey = `${key}-${serverIndex}-${index}`;
                                return (
                                    <div key={uniqueKey} className={`tile ${tileClass}`}>
                                        <div className='tile-'>
                                            <h3>{key}</h3>
                                            <h3 className={serverClass}>{serverIndex === 0 ? 'M' : `S${serverIndex}`}</h3>
                                        </div>
                                        <h1>{value}</h1>
                                    </div>
                                );
                            })}
                            {alertsList.length === 0 && (
                                <p style={{ color: 'green' }}>No alerts found.</p>
                            )}
                        </div>
                    </div>
                </div>
                <div className="popup-footer">
                    <div className="popup-timer-bar" />
                    <span className="popup-hint">Dismissing in 5s…</span>
                </div>
            </div>
            {/* Bell button — shown after popup collapses */}
            {collapsed && (
                <button className="alert-bell-btn" onClick={handleBellClick} title="View alerts">
                    <BellIcon />
                    <span className="bell-badge">{totalAlerts}</span>
                </button>
            )}
        </>
    );
};
export default AlertPopup;
import React, { useState, useEffect, useRef } from 'react';
import { IconAlertCircle, IconAlertTriangle, IconWarning } from '../components/Icons';
import './AlertPopup.css';
const BellIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
);
const AlertPopup = ({ totalAlerts, criticalCount, highCount, onOpen, alertsList }) => {
    const [visible, setVisible] = useState(false);     // popup toast visible
    const [collapsed, setCollapsed] = useState(false); // collapsed into bell button
    const [prevTotal, setPrevTotal] = useState(totalAlerts);
    const timerRef = useRef(null);
    // Trigger popup whenever alert count changes (and > 0)
    useEffect(() => {
        if (totalAlerts > 0 && totalAlerts !== prevTotal) {
            showPopup();
        }
        // Also show on first load if there are alerts
        if (prevTotal === 0 && totalAlerts > 0 && !visible && !collapsed) {
            showPopup();
        }
        setPrevTotal(totalAlerts);
    }, [totalAlerts]);
    // Show on mount if alerts exist
    useEffect(() => {
        if (totalAlerts > 0) {
            showPopup();
        }
    }, []);
    const showPopup = () => {
        setCollapsed(false);
        setVisible(true);
        clearTimeout(timerRef.current);
        // Auto-dismiss after 5 seconds → collapse into bell
        timerRef.current = setTimeout(() => {
            setVisible(false);
            setCollapsed(true);
        }, 5000);
    };
    const handleDismiss = () => {
        clearTimeout(timerRef.current);
        setVisible(false);
        setCollapsed(true);
    };
    const handleBellClick = () => {
        setCollapsed(false);
        if (onOpen) onOpen(); // optionally scroll/open full panel
        showPopup();
    };
    if (totalAlerts === 0) return null;
    return (
        <>
            {/* Toast Popup */}
            <div className={`alert-popup ${visible ? 'popup-enter' : 'popup-exit'}`}>
                <div className="popup-header">
                    <span className="popup-title">⚠ Queue Buildup Alerts</span>
                    <button className="popup-close" onClick={handleDismiss}>✕</button>
                </div>
                <div className="queue-alert">
                    <div className="middle-queue">
                        <div className="total-que red">
                            <h2>{totalAlerts}</h2>
                            <p className='white'>TOTAL ALERTS</p>
                        </div>
                        <div className='line'></div>
                        <div className="que-block">
                            <div className="icon"><IconAlertTriangle /></div>
                            <div className='middle-block red'>
                                <h2>{criticalCount}</h2>
                                <p>CRITICAL</p>
                                <p className='white'>{"> 500"}</p>
                            </div>
                        </div>
                        <div className='line'></div>
                        <div className="que-block">
                            <div className="icon"><IconAlertCircle /></div>
                            <div className='middle-block orange'>
                                <h2>{highCount}</h2>
                                <p>HIGH</p>
                                <p className='white'>{"200 - 499"}</p>
                            </div>
                        </div>
                    </div>
                    <div className="lower-queue">
                        <p>TOP QUEUE BUILDUPS</p>
                        <div className="queue-tiles">
                            {alertsList.map((alert, index) => {
                                const { key, value, serverIndex, isCritical } = alert;
                                const tileClass = isCritical ? 'tile-red' : 'tile-orange';
                                const serverClass = isCritical ? 'server-red' : 'server-orange';
                                const uniqueKey = `${key}-${serverIndex}-${index}`;
                                return (
                                    <div key={uniqueKey} className={`tile ${tileClass}`}>
                                        <div className='tile-'>
                                            <h3>{key}</h3>
                                            <h3 className={serverClass}>{serverIndex === 0 ? 'M' : `S${serverIndex}`}</h3>
                                        </div>
                                        <h1>{value}</h1>
                                    </div>
                                );
                            })}
                            {alertsList.length === 0 && (
                                <p style={{ color: 'green' }}>No alerts found.</p>
                            )}
                        </div>
                    </div>
                </div>
                <div className="popup-footer">
                    <div className="popup-timer-bar" />
                    <span className="popup-hint">Dismissing in 5s…</span>
                </div>
            </div>
            {/* Bell button — shown after popup collapses */}
            {collapsed && (
                <button className="alert-bell-btn" onClick={handleBellClick} title="View alerts">
                    <BellIcon />
                    <span className="bell-badge">{totalAlerts}</span>
                </button>
            )}
        </>
    );
};
export default AlertPopup;
import React from 'react';
export default function AllFiles() {
  return (
    <div style={{
        padding: '2rem',
        fontFamily: 'sans-serif',
        color: 'white',
        backgroundColor: '#1e1e1e',
        borderRadius: '0',
        minWidth: '300px',
        maxWidth: 'none',
        maxHeight: 'none',
        width: '100%',
        boxShadow: 'none',
        overflowY: 'auto',
        boxSizing: 'border-box'
      }}>
        <div style={{ paddingBottom: "1rem", borderBottom: "1px solid #333", marginBottom: "1rem" }}>
            <h2 style={{ marginTop: 0 }}>ALL FILES</h2>
        </div>
        <div style={{ marginTop: '1rem', marginBottom: '2rem', lineHeight: '1.5' }}>
            <p>
              This is a placeholder for the <strong>ALL FILES</strong> explanation.<br/>
              Add your content here.
              Lorem ipsum dolor sit amet, consectetur adipisicing elit. Fugit, rerum, omnis debitis at eveniet, repellendus inventore iure molestiae dolorem quo dolorum!
            </p>
        </div>
      </div>
  );
}
// App.js start
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
import { useState, useEffect, useRef } from "react";
import { IconCheck, IconWarning, IconError, IconLock, IconSlash, IconSnow, IconZap, IconGrid } from "./Icons";
import './MqStatus.css'
function renderJobCell(jobName, val, index) {
 if (val === "OK"){
  return <span className="pill-none bu-ok">{val}</span>;
 }
 if (index ===2){
  return <span className="time">{val}</span>;
 }
 else{
  return <span>{val}</span>;
}}
function GridAnimatedCell({ jobName, value,index }) {
  const [highlight, setHighlight] = useState(false);
  const prev = useRef(value);
  useEffect(() => {
    if (prev.current !== value) {
      setHighlight(true);
      const timer = setTimeout(() => setHighlight(false), 800);
      prev.current = value;
      return () => clearTimeout(timer);
    }
  }, [value]);
  return (
    <td className={highlight ? "highlight-row" : ""}>
      {renderJobCell(jobName, value, index)}
    </td>
  );
}
export default function BatchUploads({ data , lastUpdated}) {
  const sourceData = data || {};
  const keys = Object.keys(sourceData);
  let maxCols = 0;
  keys.forEach(k => {
    if (sourceData[k].length > maxCols) maxCols = sourceData[k].length;
  });
  return (
    <div className="batch-uploads">
      <div className="card-header">
        <div className="card-title">
          <IconGrid />
          <h2>Batch Uploads</h2>
        </div>
        <div className="timestamp">
          <p><span>•</span> {lastUpdated}</p>
        </div>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>FILE</th>
              {Array.from({ length: maxCols-1 }).map((_, i) => (
                      <th key={i}>{i === 0 ? "M" : `S${i}`}</th>
              ))}
              <th>SF</th>
            </tr>
          </thead>
          <tbody>
            {keys.length > 0 ? (
              keys.map((key) => {
                const rowData = sourceData[key];
                return (
                  <tr key={key}>
                    <td>{key}</td>
                    {Array.isArray(rowData)
                      ? rowData.map((val, i) => (
                          <GridAnimatedCell key={i} jobName={key} value={val} index={i} />
                        ))
                      : null}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={13} className="text-center opacity-50">Waiting for data...</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
import { useState, useEffect, useRef } from "react";
import { IconList, IconThumbDown, IconCross } from "./Icons";
// import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
// import QueueReplica from "../blocks/QueueReplica";
function getPillClass(val) {
  if (val === 0) return "pill pill-zero";
  if (val <= 99) return "pill pill-yellow";
  if (val <= 499) return "pill pill-orange";
  return "pill pill-red";
}
function QueueAnimatedCell({ value }) {
  const [highlight, setHighlight] = useState(false);
  const prev = useRef(value);
  useEffect(() => {
    if (prev.current !== value) {
      setHighlight(true);
      const timer = setTimeout(() => setHighlight(false), 800);
      prev.current = value;
      return () => clearTimeout(timer);
    }
  }, [value]);
  return (
    <td className={highlight ? "highlight-row" : ""}>
      <span>{value === -1 ? <IconThumbDown /> : value}</span>
    </td>
  );
}
export default function BR0501({ data, lastUpdated }) {
  const sourceData = data || {};
  const queueKeys = Object.keys(sourceData)
//   const columns = Array.from({ length: 16 }, (_, i) => i === 0 ? "M" : `S${i}`);
  const [showPopup, setShowPopup] = useState(false);
  const [queue, setQueue] = useState(null);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="queuecard" style={{width: "100%" }}>
        <div className="card-header border-b border-[var(--border-color)] pb-4 mb-0 flex justify-between">
          <div className="card-title text-[14px]">
            <IconList />
            <h2 className="text-[14px]">BR0501 Status</h2>
          </div>
          <div className="flex items-center gap-6 text-[12px] font-semibold text-secondary" style={{ display: 'flex', alignItems: 'center', gap: '24px', fontSize: '11px', color: 'var(--text-secondary)' }}>
            <div className="timestamp">
              <p><span>•</span> {lastUpdated}</p>
            </div>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Server</th>
                <th>Start Time</th>
                <th>Current Time</th>
                <th>Duration</th>
                <th>Last Update</th>
                <th>End Time</th>
                <th>Total Record</th>
                <th>Record Processed</th>
                <th>Record Pending</th>
                <th>Speed(/Sec)</th>
                <th>Percentage Complete</th>
                <th>Running</th>
                <th>Completed</th>
                <th>No of RC {'>'} 0</th>
                {/* {queueKeys.length > 0 && sourceData[queueKeys[0]]
                  ? sourceData[queueKeys[0]].map((_, i) => (
                    <th key={i}>{i === 0 ? "M" : `S${i}`}</th>
                  ))
                  : columns.map((c) => <th key={c}>{c}</th>)} */}
              </tr>
            </thead>
            <tbody>
              {queueKeys.length > 0 ? (
                queueKeys.map((key) => {
                  const rowData = sourceData[key];
                  return (
                    <tr key={key} >
                      <td className="queues" onClick={() => {
                        setShowPopup(true);
                        setQueue(key);
                      }}>{key.toUpperCase()}</td>
                      {Array.isArray(rowData)
                        ? rowData.slice(0, -1).map((val, i) => (
                          <QueueAnimatedCell key={i} value={val} />
                        ))
                        : null}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={14} className="text-center opacity-50">Waiting for data...</td>
                </tr>
              )}
            </tbody>
          </table>
          {showPopup && (
            <div className="popup-overlay" onClick={() => setShowPopup(false)}>
              <div className="popup-content" onClick={(e) => e.stopPropagation()}>
                <QueueReplica queue={queue} />
                <button className="close-button" onClick={() => setShowPopup(false)}><IconCross /></button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
/*
=============================================================================
 EXPRESS API — server-side pagination for the branch table
 (no extra node modules beyond express/cors; reads a plain text/CSV file and
  returns ONLY the entries needed for the requested page)
 Data file format — one branch per line:
     srNo,branchCode,branchName,circleCode
 e.g.
     1,00221,MUMBAI MAIN,002
     2,00435,ANDHERI WEST,002
 Request:  GET /api/branches?page=1&limit=20&search=mumbai
 Response: { rows: [[srNo, branchCode, branchName, circleCode], ...],
             total, page, limit }
 ---------------------------------------------------------------------------
 const express = require("express");
 const fsp = require("fs/promises");
 const cors = require("cors");
 const app = express();
 app.use(cors({ origin: ["http://localhost:5173"] }));
 const DATA_FILE = "branchLoggedIn.txt";
 app.get("/api/branches", async (req, res) => {
   try {
     const page   = Math.max(1, parseInt(req.query.page, 10) || 1);
     const limit  = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
     const search = (req.query.search || "").toString().trim().toLowerCase();
     const content = await fsp.readFile(DATA_FILE, "utf8");
     let rows = content
       .split("\n")
       .map((l) => l.trim())
       .filter(Boolean)
       .map((l) => l.split(","));
     if (search) {
       rows = rows.filter((cols) => cols.join(" ").toLowerCase().includes(search));
     }
     const total = rows.length;
     const start = (page - 1) * limit;
     const pageRows = rows.slice(start, start + limit); // only the entries needed
     res.json({ rows: pageRows, total, page, limit });
   } catch (err) {
     if (err.code === "ENOENT") {
       return res.json({ rows: [], total: 0, page: 1, limit: 20 });
     }
     res.status(500).json({ error: "Failed to read branch data", details: err.message });
   }
 });
 app.listen(5000, () => console.log("Branch API on http://localhost:5000"));
 ---------------------------------------------------------------------------
=============================================================================
*/
import React, { useState, useEffect, useRef } from "react";
import "./BranchLoggedIn.css";
import { IconBranch, IconCopy, IconExcel, IconGraph, IconPdf, IconTeller, IconUp, IconSearch } from "../components/Icons";
const PAGE_SIZE = 20;
// Matches the Express API commented at the top of this file.
const API_URL = "http://localhost:5000/api/branches";
const CircleName = {
  "001": "KOLKATA",
  "002": "MUMBAI",
  "003": "CHENNAI",
  "004": "NEW DELHI",
  "005": "LUCKNOW",
  "006": "AHMEDABAD",
  "007": "HYDERABAD",
  "008": "BHOPAL",
  "009": "PATNA",
  "010": "CHANDIGARH",
  "011": "BHUBANESWAR",
  "012": "GUWAHATI",
  "013": "BANGALORE",
  "014": "KERALA",
  "015": "CAG",
  "016": "MCG",
  "017": "SAMG",
  "018": "CORPORATE CENTRE -CAO I",
  "020": "CAO-II",
  "021": "GLOBAL LINK SERVICES",
  "022": "SECURITY SERVICE BRANCH",
  "023": "JAIPUR",
  "024": "AMRAVATHI",
  "027": "MUMBAI METRO ABU",
};
function QueueAnimatedCell({ value }) {
  const [highlight, setHighlight] = useState(false);
  const prev = useRef(value);
  useEffect(() => {
    if (prev.current !== value) {
      setHighlight(true);
      const timer = setTimeout(() => setHighlight(false), 800);
      prev.current = value;
      return () => clearTimeout(timer);
    }
  }, [value]);
  return (
    <td className={highlight ? "highlight-row" : ""}>
      <span>{value}</span>
    </td>
  );
}
export default function BranchLoggedIn({ data = {} }) {
  const sourceData = data.branchLoggedIn || {};
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [copySuccess, setCopySuccess] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [remote, setRemote] = useState(null);
  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams({
      page: String(page),
      limit: String(PAGE_SIZE),
      search,
    });
    fetch(`${API_URL}?${params.toString()}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((json) => {
        if (!cancelled) setRemote(json);
      })
      .catch(() => {
        if (!cancelled) setRemote(null);
      });
    return () => {
      cancelled = true;
    };
  }, [page, search]);
  const allEntries = Object.entries(sourceData);
  const filteredEntries = search
    ? allEntries.filter(([key, rowData]) => {
        const circle = Array.isArray(rowData) ? CircleName[rowData[2]] || "" : "";
        const haystack = [key, ...(Array.isArray(rowData) ? rowData : []), circle]
          .join(" ")
          .toLowerCase();
        return haystack.includes(search.toLowerCase());
      })
    : allEntries;
  const usingApi = remote !== null;
  const total = usingApi ? remote.total : filteredEntries.length;
  const pageEntries = usingApi
    ? remote.rows.map((r) => [r[0], r.slice(1)])
    : filteredEntries.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);
  const onSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };
  const handleCopy = async () => {
    const table = document.getElementById("my-table");
    if (!table) return;
    try {
      await navigator.clipboard.writeText(table.innerText);
      setCopySuccess("Copied!");
      setTimeout(() => setCopySuccess(""), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
      setCopySuccess("Failed to copy");
    }
  };
  const renderRow = (key, rowData) => (
    <tr key={key}>
      <td>{String(key).toUpperCase()}</td>
      {Array.isArray(rowData)
        ? rowData.map((val, i) =>
            i === 2 ? (
              <React.Fragment key={i}>
                <td>{CircleName[val] || "-"}</td>
                <td>{val}</td>
              </React.Fragment>
            ) : (
              <QueueAnimatedCell key={i} value={val} />
            )
          )
        : null}
    </tr>
  );
  const firstShown = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const lastShown = Math.min(page * PAGE_SIZE, total);
  return (
    <div className="div1">
      <div className={`div2 ${open ? "open" : "close"}`}>
        <div className="menuSection">
          <div className="menuItem activeMenu">
            <span><IconBranch /></span>
            {open && <p>Branches Online</p>}
          </div>
          <div className="menuItem">
            <span><IconTeller /></span>
            {open && <p>Branch & Teller Details</p>}
          </div>
          <div className="menuItem">
            <span><IconGraph /></span>
            {open && <p>Login Graph</p>}
          </div>
        </div>
      </div>
      <div className="div3">
        <div className="div5">
          <div className="tableToolbar">
            <div className="toolbarBtns">
              <button className="hamburgerBtn" onClick={() => setOpen(!open)}>
                {open ? "✖" : "☰"}
              </button>
              <button onClick={handleCopy}><IconCopy />Copy</button>
              <button><IconPdf />PDF</button>
              <button><IconExcel />Excel</button>
              {copySuccess && <span className="copyStatus">{copySuccess}</span>}
            </div>
            <div className="searchTable">
              {/* <label style={{ fontSize: "12px" }}>Search:</label> */}
              <input type="text" value={search} onChange={onSearchChange} placeholder="Search here ..."/>
              <div className="search_icon">
              <IconSearch />
              </div>
            </div>
          </div>
          <div className="branch-table">
            <table>
              <thead>
                <tr>
                  <th>SR NO</th>
                  <th>BRANCH CODE</th>
                  <th>BRANCH</th>
                  <th>CIRCLE NAME </th>
                  <th>CIRCLE CODE</th>
                </tr>
              </thead>
              <tbody id="my-table">
                {pageEntries.length > 0 ? (
                  pageEntries.map(([key, rowData]) => renderRow(key, rowData))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center opacity-50">
                      {search ? "No results found" : "Waiting for data..."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination — 20 entries per page */}
          <div
            className="pagination">
            <span>
              {total === 0 ? "No entries" : `Showing ${firstShown} – ${lastShown} of ${total}`}
            </span>
            <div className="page-button" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <button onClick={() => setPage(1)} disabled={page <= 1}>First</button>
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>Prev</button>
              <span>Page {page} of {totalPages}</span>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>Next</button>
              <button onClick={() => setPage(totalPages)} disabled={page >= totalPages}>Last</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
import React from 'react';
export default function BranchTellerInterval() {
  return (
    <div style={{
        padding: '2rem',
        fontFamily: 'sans-serif',
        color: 'white',
        backgroundColor: '#1e1e1e',
        borderRadius: '0',
        minWidth: '300px',
        maxWidth: 'none',
        maxHeight: 'none',
        width: '100%',
        boxShadow: 'none',
        overflowY: 'auto',
        boxSizing: 'border-box'
      }}>
        <div style={{ paddingBottom: "1rem", borderBottom: "1px solid #333", marginBottom: "1rem" }}>
            <h2 style={{ marginTop: 0 }}>Branch Teller Interval</h2>
        </div>
        <div style={{ marginTop: '1rem', marginBottom: '2rem', lineHeight: '1.5' }}>
            <p>
              This is a placeholder for the <strong>Branch Teller Interval</strong> explanation.<br/>
              Add your content here.
              Lorem ipsum dolor sit amet, consectetur adipisicing elit. Fugit, rerum, omnis debitis at eveniet, repellendus inventore iure molestiae dolorem quo dolorum!
            </p>
        </div>
      </div>
  );
}
import React from 'react';
export default function CBSFlow() {
  return (
    <div style={{
        padding: '2rem',
        fontFamily: 'sans-serif',
        color: 'white',
        backgroundColor: '#1e1e1e',
        borderRadius: '0',
        minWidth: '300px',
        maxWidth: 'none',
        maxHeight: 'none',
        width: '100%',
        boxShadow: 'none',
        overflowY: 'auto',
        boxSizing: 'border-box'
      }}>
        <div style={{ paddingBottom: "1rem", borderBottom: "1px solid #333", marginBottom: "1rem" }}>
            <h2 style={{ marginTop: 0 }}>CBS Flow</h2>
        </div>
        <div style={{ marginTop: '1rem', marginBottom: '2rem', lineHeight: '1.5' }}>
            <p>
              All_Region_Bounce	Region_Switch	Interfaces	Reposting	PostSod	SI	Night_EOD	Night_SOD	Branch_Cut_Off	Sweeps	Region_Switch
            </p>
        </div>
      </div>
  );
}
// Dashboard.jsx start
import { useEffect, useRef, useState } from "react";
import GridOverview from "./components/GridOverview";
import QueueMetrics from "./components/QueueMetrics";
import SystemContext from "./components/SystemContext";
import TrickleMetrics from "./components/TrickleMetrics";
import SpaceMetrics from "./components/SpaceMetrics";
import AlertBar from "./components/AlertBar";
import "./Dashboard.css";
import SystemUtilization from "./components/SystemUtilization";
import MqStatus from "./components/MqStatus";
import OcrNeft from "./components/OcrNeft";
import MiscTransactionCount from "./components/MiscTransactionCount";
import BatchUploads from "./components/BatchUpload";
import HighResourceReplica from "./components/HighResourceReplica";
import RTGSMetrics from "./components/RTGSMertrics"
export default function Dashboard({ data = {}, lastUpdated }) {
    return (
        <div className="app-root">
            <AlertBar dataToAlert={data} />
            <div className="dashboard-content-wrapper">
                <div className="dashboard">
                    <GridOverview data={data.jobs} lastUpdated={lastUpdated.jobs} />
                    <QueueMetrics data={data.queue} lastUpdated={lastUpdated.queue} />
                </div>
                {/* New Data Modules Side-by-Side (3 columns) */}
                <div className="dashboard-secondary">
                    <SpaceMetrics data={data.space} lastUpdated={lastUpdated.space} />
                    <TrickleMetrics data={data.trickle} lastUpdated={lastUpdated.trickle} />
                </div>
                <div className="dashboard-third">
                    <SystemUtilization data={data.system} lastUpdated={lastUpdated.system} />
                    <SystemContext data={data.context} lastUpdated= {lastUpdated.context} />
                </div>
                <div className="dashboard-fourth">
                    <OcrNeft data={data.OCRNEFT} lastUpdated= {lastUpdated.OCRNEFT} />
                    <BatchUploads data={data.batchUpload} lastUpdated= {lastUpdated.batchUpload} />
                    <HighResourceReplica data={data.resourse} lastUpdated= {lastUpdated.resourse} />
                </div>
                <div className="dashboard-fifth">
                    <MqStatus data={data.MQStatus} lastUpdated= {lastUpdated.MQStatus} />
                    <MiscTransactionCount data={data.miscTxtCount} lastUpdated= {lastUpdated.miscTxtCount} neftCount = {data.neftIncomingCount}/>
                </div>
                <div className="dashboard-sixth">
                    <RTGSMetrics data={data} lastUpdated = {lastUpdated} />
                </div>
            </div>
        </div>
    );
}
// Dashboard.jsx end
import { useState, useEffect, useRef } from "react";
import { IconList, IconThumbDown } from "../components/Icons";
function QueueAnimatedCell({ value }) {
    const [highlight, setHighlight] = useState(false);
    const prev = useRef(value);
    useEffect(() => {
        if (prev.current !== value) {
            setHighlight(true);
            const timer = setTimeout(() => setHighlight(false), 800);
            prev.current = value;
            return () => clearTimeout(timer);
        }
    }, [value]);
    return (
        <td className={highlight ? "highlight-row" : ""}>
            <span>{value === -1 ? <IconThumbDown /> : value}</span>
        </td>
    );
}
export default function DrLegend({ drdata }) {
    const sourceData = drdata || {};
    const queueKeys = Object.keys(sourceData)
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="legendcard">
                <div className="card-header border-b border-[var(--border-color)] pb-4 mb-0 flex justify-between">
                    <div className="card-title text-[14px]">
                        <h2 className="text-[14px]">DR Servers</h2>
                    </div>
                    <div className="flex items-center gap-6 text-[12px] font-semibold text-secondary" style={{ display: 'flex', alignItems: 'center', gap: '24px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    </div>
                </div>
                <div className="legend-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Hostname</th>
                                <th>DQP Type</th>
                                <th>Logical IP</th>
                                <th>S No</th>
                                <th>Physical IP</th>
                                <th>Back Haul IO IP</th>
                            </tr>
                        </thead>
                        <tbody>
                            {queueKeys.length > 0 ? (
                                queueKeys.map((key) => {
                                    const rowData = sourceData[key];
                                    return (
                                        <tr key={key}>
                                            <td>{key.toUpperCase()}</td>
                                            {Array.isArray(rowData)
                                                ? rowData.map((val, i) => (
                                                    <QueueAnimatedCell key={i} value={val} />
                                                ))
                                                : null}
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={14} className="text-center opacity-50">Waiting for data...</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
import { useEffect, useState } from 'react';
import './QueueReplica.css';
function GatewayNames({job, i}){
    const jobname = i === 0 ? "M" : `SLAVE ${i}`
    return(
        <h1>{`${job} - ${jobname}`}</h1>
    )
}
export default function GatewayMore({ job }) {
    const [jobData, setJobData] = useState(null);
    const [loading, setLoading] = useState(true);
    // const rows = Array.from({ length: 16 }, (_, i) => i === 0 ? "MASTER" : `SLAVE ${i}`);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/jobs', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ jobName: job }),
                });
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();
                setJobData(data);
            } catch (error) {
                console.error('POST request failed:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [job]);
    const dataEntries = jobData?.data || {};
    const dataEntriesKeys = Object.keys(jobData?.data || []);
    if (dataEntries.length === 0) {
        return <div>No data found </div>;
    }
    return (
        <div className='gateway-wrapper'>
            <h1>{(`${job} Status`).toUpperCase()}</h1>
            <div className="gateway-wrapper-inner">
                {
                    dataEntriesKeys.map((key, index) => {
                        const gateway = dataEntries[key] || {}
                        console.log(gateway)
                        return (
                            <div className='queue-replica jobs'>
                                <GatewayNames job = {job} i= {index}/>
                                <div className="table-container gateway-container">
                                    <table className="queue-replica-table gateway-table">
                                        <thead>
                                            <tr>
                                                <th>Gateway Name</th>
                                                <th>System Time</th>
                                                <th>Last Update Time</th>
                                                <th>Start Time</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {Object.entries(gateway).map(([fileName, fileArray], index) => (
                                                <tr key={fileName}>
                                                    <td>{fileName}</td>
                                                    {Array.isArray(fileArray) ? fileArray.map((item, i) => (
                                                        <td key={i}>{item}</td>
                                                    )): <td>{gateway[fileName]}</td>}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )
                    }
                    )
                }
            </div>
        </div>
    );
}
import { useState, useEffect, useRef } from "react";
import { IconCheck, IconWarning, IconError, IconLock, IconSlash, IconSnow, IconZap, IconGrid, IconCross } from "./Icons";
import GatewayMore from "../blocks/GatewayMore";
function renderJobCell(jobName, val, index) {
  if (jobName === "Check RC" || jobName === "CHECK RC") {
    return val === "NO CHECK RC" ? <span className="pill pill-none">NONE</span> : <span className="pill pill-yellow-check">CHECK RC</span>;
  }
  if (jobName === "CONNECTIVITY") {
    return <span className={val === "Y" ? "text-green font-bold" : "text-red font-bold"}>{val}</span>;
  }
  if (jobName === "System Idle" || jobName === "Misc Job") {
    return <span className="font-bold">{val}</span>;
  }
  if (jobName === "LAST UPDATE" || jobName === "Last Update") {
    return <span className="time">{val}</span>
  }
  if (jobName === "TF Gateway") {
    return <span className="text-secondary">—</span>;
  }
  if (jobName === "Trickle Feed" && index === 12 || jobName === "Trickle Feed" && index === 13 || jobName === "Trickle Feed" && index === 14 || jobName === "Trickle Feed" && index === 15) {
    return <span className="text-secondary">—</span>;
  }
  // Gateway status icons
  if (val === "RUNNING") {
    return <IconCheck />;
  } else if (val === "NOT RUNNING") {
    return <IconError />;
  } else if (val === "NEW ARCH NOT UPDATING") {
    return <IconWarning />;
  } else if (val === "MAXTCP") {
    return <IconZap />;
  } else if (val === "NOT UPDATING") {
    return <IconWarning />;
  } else if (val === "ERROR") {
    return <IconError />;
  } else if (val === "NA" || val === "SUNDAY") {
    return <span className="text-secondary">—</span>;
  } else if (val === "NO TXN") {
    return <IconSlash />;
  } else if (val === "TIMESTAMP FREEZED") {
    return <IconSnow />;
  } else if (val === "ABORT") {
    return <span className="text-secondary">{val}</span>;
  } else if (val === "NOT ENCRYPTED") {
    return <IconLock />;
  } else if (val === "UTP TXN") {
    return <span className="text-secondary">{val}</span>;
  }
  return <span>{val}</span>;
}
function GridAnimatedCell({ jobName, value, index }) {
  const [highlight, setHighlight] = useState(false);
  const prev = useRef(value);
  useEffect(() => {
    if (prev.current !== value) {
      setHighlight(true);
      const timer = setTimeout(() => setHighlight(false), 800);
      prev.current = value;
      return () => clearTimeout(timer);
    }
  }, [value]);
  return (
    <td className={highlight ? "highlight-row" : ""}>
      {renderJobCell(jobName, value, index)}
    </td>
  );
}
export default function GridOverview({ data, lastUpdated }) {
  const sourceData = data || {};
  const jobKeys = Object.keys(sourceData);
    const [showPopup, setShowPopup] = useState(false);
  const [jobName, setJobName] = useState(null);
  // Fallback headers if data empty
  const columns = Array.from({ length: 16 }, (_, i) => i === 0 ? "M" : `S${i}`);
  return (
    <div className="card grid">
      <div className="card-header">
        <div className="card-title">
          <IconGrid />
          <h2>JOBS MATRICS</h2>
        </div>
        <div className="timestamp">
          <p><span>•</span> {lastUpdated}</p>
        </div>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>JOB NAME</th>
              {jobKeys.length > 0 && sourceData[jobKeys[0]]
                ? sourceData[jobKeys[0]].map((_, i) => (
                  <th key={i}>{i === 0 ? "M" : `S${i}`}</th>
                ))
                : columns.map((c) => <th key={c}>{c}</th>)}
            </tr>
          </thead>
          <tbody>
            {jobKeys.length > 0 ? (
              jobKeys.map((key) => {
                const rowData = sourceData[key];
                return (
                  <tr key={key}>
                    <td onClick={() => {
                      setShowPopup(true);
                      setJobName(key);
                    }}>{key}</td>
                    {Array.isArray(rowData)
                      ? rowData.map((val, i) => (
                        <GridAnimatedCell key={i} jobName={key} value={val} index={i} />
                      ))
                      : null}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={13} className="text-center opacity-50">Waiting for data...</td>
              </tr>
            )}
          </tbody>
        </table>
        {showPopup && (
          <div className="popup-overlay gateway_overlay" onClick={() => setShowPopup(false)}>
            <div className="popup-content" onClick={(e) => e.stopPropagation()}>
              <GatewayMore job={jobName} />
              <button className="close-button" onClick={() => setShowPopup(false)}><IconCross /></button>
            </div>
          </div>
        )}
      </div>
      <div className="grid-footer" style={{ gridTemplateColumns: '1fr', marginTop: '0' }}>
        <div className="info legend-card" style={{ padding: '12px 20px' }}>
          <div className="legend-grid" style={{ gridTemplateColumns: 'repeat(8, 1fr)', marginTop: 0 }}>
            <div className="legend-item"><IconCheck /> <span>System OK</span></div>
            <div className="legend-item"><IconWarning /> <span>No Data / Warn</span></div>
            <div className="legend-item"><IconError /> <span>App Down</span></div>
            <div className="legend-item text-secondary font-bold"> — <span className="font-normal text-primary ml-1">N/A</span></div>
            <div className="legend-item"><IconLock /> <span>No Encrypt</span></div>
            <div className="legend-item"><IconSlash /> <span>No Transact</span></div>
            <div className="legend-item"><IconSnow /> <span>Time Frozen</span></div>
            <div className="legend-item"><IconZap /> <span>Max TCP</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect, useRef } from "react";
import { IconCheck, IconWarning, IconError, IconLock, IconSlash, IconSnow, IconZap, IconGrid } from "./Icons";
import './MqStatus.css'
function renderJobCell(jobName, val, index) {
    if (index === 1){
        return <span className="time">{val}</span>;
    }
    if (index === 3 && val === "no_rows_selected"){
        return <span> </span>;
    }else if (index == 3){
        return <span className="blue">{val}</span>
    }
  return <span>{val}</span>;
}
function GridAnimatedCell({ jobName, value, index }) {
  const [highlight, setHighlight] = useState(false);
  const prev = useRef(value);
  useEffect(() => {
    if (prev.current !== value) {
      setHighlight(true);
      const timer = setTimeout(() => setHighlight(false), 800);
      prev.current = value;
      return () => clearTimeout(timer);
    }
  }, [value]);
  return (
    <td className={highlight ? "highlight-row" : ""}>
      {renderJobCell(jobName, value , index)}
    </td>
  );
}
export default function HighResourceReplica({ data , lastUpdated}) {
  const sourceData = data || {};
  const jobKeys = Object.keys(sourceData);
  // Fallback headers if data empty
  const columns = Array.from({ length: 16 }, (_, i) => i === 0 ? "M" : `S${i}`);
  return (
    <div className="high-resource">
      <div className="card-header">
        <div className="card-title">
          <IconGrid />
          <h2>High Resource Replica</h2>
        </div>
        <div className="timestamp">
          <p><span>•</span> {lastUpdated}</p>
        </div>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
            <th>SERVER</th>
            <th>TIME</th>
            <th>REPLICA</th>
            <th>TXN</th>
            <th>PID</th>
            </tr>
          </thead>
          <tbody>
            {jobKeys.length > 0 ? (
              jobKeys.map((key) => {
                const rowData = sourceData[key];
                return (
                  <tr key={key}>
                    {/* <td>{key}</td> */}
                    {Array.isArray(rowData)
                      ? rowData.map((val, i) => (
                          <GridAnimatedCell key={i} jobName={key} value={val} index={i}/>
                        ))
                      : null}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={13} className="text-center opacity-50">Waiting for data...</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
export const IconCheck = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0" ></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M16.0303 10.0303C16.3232 9.73744 16.3232 9.26256 16.0303 8.96967C15.7374 8.67678 15.2626 8.67678 14.9697 8.96967L10.5 13.4393L9.03033 11.9697C8.73744 11.6768 8.26256 11.6768 7.96967 11.9697C7.67678 12.2626 7.67678 12.7374 7.96967 13.0303L9.96967 15.0303C10.2626 15.3232 10.7374 15.3232 11.0303 15.0303L16.0303 10.0303Z" fill="#2ea043"></path> <path fillRule="evenodd" clipRule="evenodd" d="M12.0574 1.25H11.9426C9.63424 1.24999 7.82519 1.24998 6.41371 1.43975C4.96897 1.63399 3.82895 2.03933 2.93414 2.93414C2.03933 3.82895 1.63399 4.96897 1.43975 6.41371C1.24998 7.82519 1.24999 9.63422 1.25 11.9426V12.0574C1.24999 14.3658 1.24998 16.1748 1.43975 17.5863C1.63399 19.031 2.03933 20.1711 2.93414 21.0659C3.82895 21.9607 4.96897 22.366 6.41371 22.5603C7.82519 22.75 9.63423 22.75 11.9426 22.75H12.0574C14.3658 22.75 16.1748 22.75 17.5863 22.5603C19.031 22.366 20.1711 21.9607 21.0659 21.0659C21.9607 20.1711 22.366 19.031 22.5603 17.5863C22.75 16.1748 22.75 14.3658 22.75 12.0574V11.9426C22.75 9.63423 22.75 7.82519 22.5603 6.41371C22.366 4.96897 21.9607 3.82895 21.0659 2.93414C20.1711 2.03933 19.031 1.63399 17.5863 1.43975C16.1748 1.24998 14.3658 1.24999 12.0574 1.25ZM3.9948 3.9948C4.56445 3.42514 5.33517 3.09825 6.61358 2.92637C7.91356 2.75159 9.62177 2.75 12 2.75C14.3782 2.75 16.0864 2.75159 17.3864 2.92637C18.6648 3.09825 19.4355 3.42514 20.0052 3.9948C20.5749 4.56445 20.9018 5.33517 21.0736 6.61358C21.2484 7.91356 21.25 9.62177 21.25 12C21.25 14.3782 21.2484 16.0864 21.0736 17.3864C20.9018 18.6648 20.5749 19.4355 20.0052 20.0052C19.4355 20.5749 18.6648 20.9018 17.3864 21.0736C16.0864 21.2484 14.3782 21.25 12 21.25C9.62177 21.25 7.91356 21.2484 6.61358 21.0736C5.33517 20.9018 4.56445 20.5749 3.9948 20.0052C3.42514 19.4355 3.09825 18.6648 2.92637 17.3864C2.75159 16.0864 2.75 14.3782 2.75 12C2.75 9.62177 2.75159 7.91356 2.92637 6.61358C3.09825 5.33517 3.42514 4.56445 3.9948 3.9948Z" fill="#2ea043"></path> </g></svg>
);
export const IconWarning = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
    <line x1="12" y1="9" x2="12" y2="13"></line>
    <line x1="12" y1="17" x2="12.01" y2="17"></line>
  </svg>
);
export const IconError = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="15" y1="9" x2="9" y2="15"></line>
    <line x1="9" y1="9" x2="15" y2="15"></line>
  </svg>
);
export const IconLock = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </svg>
);
export const IconSlash = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
  </svg>
);
export const IconSnow = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue">
    <line x1="12" y1="2" x2="12" y2="22"></line>
    <line x1="18" y1="20" x2="6" y2="4"></line>
    <line x1="6" y1="20" x2="18" y2="4"></line>
    <polyline points="16 2 16 8 22 8"></polyline>
    <polyline points="8 2 8 8 2 8"></polyline>
    <polyline points="2 16 8 16 8 22"></polyline>
    <polyline points="22 16 16 16 16 22"></polyline>
  </svg>
);
export const IconZap = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
  </svg>
);
export const IconGrid = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="text-blue">
    <rect x="3" y="3" width="7" height="7"></rect>
    <rect x="14" y="3" width="7" height="7"></rect>
    <rect x="14" y="14" width="7" height="7"></rect>
    <rect x="3" y="14" width="7" height="7"></rect>
  </svg>
);
export const IconList = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue">
    <line x1="8" y1="6" x2="21" y2="6"></line>
    <line x1="8" y1="12" x2="21" y2="12"></line>
    <line x1="8" y1="18" x2="21" y2="18"></line>
    <line x1="3" y1="6" x2="3.01" y2="6"></line>
    <line x1="3" y1="12" x2="3.01" y2="12"></line>
    <line x1="3" y1="18" x2="3.01" y2="18"></line>
  </svg>
);
export const IconClock = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue">
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);
export const IconSync = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"></polyline>
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
  </svg>
);
export const IconAlertTriangle = () => (
  <svg viewBox="-0.5 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-orange" width="40" height="40" stroke="none">
    <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
    <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
    <g id="SVGRepo_iconCarrier">
      <path d="M18.2202 21.25H5.78015C5.14217 21.2775 4.50834 21.1347 3.94373 20.8364C3.37911 20.5381 2.90402 20.095 2.56714 19.5526C2.23026 19.0101 2.04372 18.3877 2.02667 17.7494C2.00963 17.111 2.1627 16.4797 2.47015 15.92L8.69013 5.10999C9.03495 4.54078 9.52077 4.07013 10.1006 3.74347C10.6804 3.41681 11.3346 3.24518 12.0001 3.24518C12.6656 3.24518 13.3199 3.41681 13.8997 3.74347C14.4795 4.07013 14.9654 4.54078 15.3102 5.10999L21.5302 15.92C21.8376 16.4797 21.9907 17.111 21.9736 17.7494C21.9566 18.3877 21.7701 19.0101 21.4332 19.5526C21.0963 20.095 20.6211 20.5381 20.0565 20.8364C19.4919 21.1347 18.8581 21.2775 18.2202 21.25V21.25Z" stroke="#f70000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
      <path d="M10.8809 17.15C10.8809 17.0021 10.9102 16.8556 10.9671 16.7191C11.024 16.5825 11.1074 16.4586 11.2125 16.3545C11.3175 16.2504 11.4422 16.1681 11.5792 16.1124C11.7163 16.0567 11.8629 16.0287 12.0109 16.03C12.2291 16.034 12.4413 16.1021 12.621 16.226C12.8006 16.3499 12.9398 16.5241 13.0211 16.7266C13.1023 16.9292 13.122 17.1512 13.0778 17.3649C13.0335 17.5786 12.9272 17.7745 12.7722 17.9282C12.6172 18.0818 12.4203 18.1863 12.2062 18.2287C11.9921 18.2711 11.7703 18.2494 11.5685 18.1663C11.3666 18.0833 11.1938 17.9426 11.0715 17.7618C10.9492 17.5811 10.8829 17.3683 10.8809 17.15ZM11.2409 14.42L11.1009 9.20001C11.0876 9.07453 11.1008 8.94766 11.1398 8.82764C11.1787 8.70761 11.2424 8.5971 11.3268 8.5033C11.4112 8.40949 11.5144 8.33449 11.6296 8.28314C11.7449 8.2318 11.8697 8.20526 11.9959 8.20526C12.1221 8.20526 12.2469 8.2318 12.3621 8.28314C12.4774 8.33449 12.5805 8.40949 12.6649 8.5033C12.7493 8.5971 12.8131 8.70761 12.852 8.82764C12.8909 8.94766 12.9042 9.07453 12.8909 9.20001L12.7609 14.42C12.7609 14.6215 12.6808 14.8149 12.5383 14.9574C12.3957 15.0999 12.2024 15.18 12.0009 15.18C11.7993 15.18 11.606 15.0999 11.4635 14.9574C11.321 14.8149 11.2409 14.6215 11.2409 14.42Z" fill="#ff0000"></path>
    </g>
  </svg>);
export const IconAlertCircle = () => (
  <svg viewBox="-0.5 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-orange" width="40" height="40" stroke="none">
    <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
    <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
    <g id="SVGRepo_iconCarrier">
      <path d="M10.8809 16.15C10.8809 16.0021 10.9101 15.8556 10.967 15.7191C11.024 15.5825 11.1073 15.4586 11.2124 15.3545C11.3175 15.2504 11.4422 15.1681 11.5792 15.1124C11.7163 15.0567 11.8629 15.0287 12.0109 15.03C12.2291 15.034 12.4413 15.1021 12.621 15.226C12.8006 15.3499 12.9399 15.5241 13.0211 15.7266C13.1024 15.9292 13.122 16.1512 13.0778 16.3649C13.0335 16.5786 12.9272 16.7745 12.7722 16.9282C12.6172 17.0818 12.4204 17.1863 12.2063 17.2287C11.9922 17.2711 11.7703 17.2494 11.5685 17.1663C11.3666 17.0833 11.1938 16.9426 11.0715 16.7618C10.9492 16.5811 10.8829 16.3683 10.8809 16.15ZM11.2408 13.42L11.1008 8.20001C11.0875 8.07453 11.1008 7.94766 11.1398 7.82764C11.1787 7.70761 11.2424 7.5971 11.3268 7.5033C11.4112 7.40949 11.5144 7.33449 11.6296 7.28314C11.7449 7.2318 11.8697 7.20526 11.9958 7.20526C12.122 7.20526 12.2468 7.2318 12.3621 7.28314C12.4773 7.33449 12.5805 7.40949 12.6649 7.5033C12.7493 7.5971 12.813 7.70761 12.8519 7.82764C12.8909 7.94766 12.9042 8.07453 12.8909 8.20001L12.7609 13.42C12.7609 13.6215 12.6809 13.8149 12.5383 13.9574C12.3958 14.0999 12.2024 14.18 12.0009 14.18C11.7993 14.18 11.606 14.0999 11.4635 13.9574C11.321 13.8149 11.2408 13.6215 11.2408 13.42Z" fill="#EC5912"></path>
      <path d="M12 21.5C17.1086 21.5 21.25 17.3586 21.25 12.25C21.25 7.14137 17.1086 3 12 3C6.89137 3 2.75 7.14137 2.75 12.25C2.75 17.3586 6.89137 21.5 12 21.5Z" stroke="#EC5912" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
    </g>
  </svg>);
export const IconThumbDown = () => (
  <svg viewBox="-0.64 -0.64 65.28 65.28" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" xmlns:sketch="http://www.bohemiancoding.com/sketch/ns" fill="#000000" width="16px"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round" stroke="#CCCCCC" strokeWidth="12.8"> <title>Thumb-down</title> <desc>Created with Sketch.</desc> <defs> </defs> <g id="Page-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd" sketch:type="MSPage"> <g id="Thumb-down" sketch:type="MSLayerGroup" transform="translate(2.000000, 1.000000)" stroke="#e5c07b" strokeWidth="2"> <path d="M43,36 L58.1,36 C60.9,36 61,33.9 61,31.2 L61,6.9 C61,4.3 60.9,2.1 58.1,2.1 L43,2.1 C40.2,2.1 40.1,4.2 40.1,6.9 L40.1,31.2 C40.1,33.8 40.2,36 43,36 L43,36 Z" id="Shape" sketch:type="MSShapeGroup"> </path> <path d="M40.3,5.7 L38.9,5.7 C35.1,5.8 32.6,0 29.7,0 L7.1,0 C4.3,0 3.7,4.2 3.8,6 C3.8,6 0.3,7.6 1.9,14 C1.7,14.1 -0.1,15.8 -0.1,19.1 C-0.1,22.4 1.8,24 1.8,24 C1.8,24 -0.1,26.1 -0.1,29.2 C-0.1,32.3 2.6,34 5.4,34 L13.7,34 C20.9,34 20.3,37.9 20.3,37.9 C20.3,37.9 21.1,48 23.7,52.7 C26.9,58.5 33.3,56.6 30.9,49 C29.1,43.4 37.2,35 40.2,32.2" id="Shape" sketch:type="MSShapeGroup"> </path> </g> </g> </g><g id="SVGRepo_iconCarrier"> <title>Thumb-down</title> <desc>Created with Sketch.</desc> <defs> </defs> <g id="Page-1" strokeWidth="2.6879999999999997" fill="none" fillRule="evenodd" sketch:type="MSPage"> <g id="Thumb-down" sketch:type="MSLayerGroup" transform="translate(2.000000, 1.000000)" stroke="#e5c07b" strokeWidth="2.6879999999999997"> <path d="M43,36 L58.1,36 C60.9,36 61,33.9 61,31.2 L61,6.9 C61,4.3 60.9,2.1 58.1,2.1 L43,2.1 C40.2,2.1 40.1,4.2 40.1,6.9 L40.1,31.2 C40.1,33.8 40.2,36 43,36 L43,36 Z" id="Shape" sketch:type="MSShapeGroup"> </path> <path d="M40.3,5.7 L38.9,5.7 C35.1,5.8 32.6,0 29.7,0 L7.1,0 C4.3,0 3.7,4.2 3.8,6 C3.8,6 0.3,7.6 1.9,14 C1.7,14.1 -0.1,15.8 -0.1,19.1 C-0.1,22.4 1.8,24 1.8,24 C1.8,24 -0.1,26.1 -0.1,29.2 C-0.1,32.3 2.6,34 5.4,34 L13.7,34 C20.9,34 20.3,37.9 20.3,37.9 C20.3,37.9 21.1,48 23.7,52.7 C26.9,58.5 33.3,56.6 30.9,49 C29.1,43.4 37.2,35 40.2,32.2" id="Shape" sketch:type="MSShapeGroup"> </path> </g> </g> </g></svg>
)
export const IconPdf = () => (
  <svg height="18" width="18" version="1.1" id="_x32_" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" xmlSpace="preserve" fill="#58a6ff"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <path className="st0" d="M378.413,0H208.297h-13.182L185.8,9.314L57.02,138.102l-9.314,9.314v13.176v265.514 c0,47.36,38.528,85.895,85.896,85.895h244.811c47.353,0,85.881-38.535,85.881-85.895V85.896C464.294,38.528,425.766,0,378.413,0z M432.497,426.105c0,29.877-24.214,54.091-54.084,54.091H133.602c-29.884,0-54.098-24.214-54.098-54.091V160.591h83.716 c24.885,0,45.077-20.178,45.077-45.07V31.804h170.116c29.87,0,54.084,24.214,54.084,54.092V426.105z"></path> <path className="st0" d="M171.947,252.785h-28.529c-5.432,0-8.686,3.533-8.686,8.825v73.754c0,6.388,4.204,10.599,10.041,10.599 c5.711,0,9.914-4.21,9.914-10.599v-22.406c0-0.545,0.279-0.817,0.824-0.817h16.436c20.095,0,32.188-12.226,32.188-29.612 C204.136,264.871,192.182,252.785,171.947,252.785z M170.719,294.888h-15.208c-0.545,0-0.824-0.272-0.824-0.81v-23.23 c0-0.545,0.279-0.816,0.824-0.816h15.208c8.42,0,13.447,5.027,13.447,12.498C184.167,290,179.139,294.888,170.719,294.888z"></path> <path className="st0" d="M250.191,252.785h-21.868c-5.432,0-8.686,3.533-8.686,8.825v74.843c0,5.3,3.253,8.693,8.686,8.693h21.868 c19.69,0,31.923-6.249,36.81-21.324c1.76-5.3,2.723-11.681,2.723-24.857c0-13.175-0.964-19.557-2.723-24.856 C282.113,259.034,269.881,252.785,250.191,252.785z M267.856,316.896c-2.318,7.331-8.965,10.459-18.21,10.459h-9.23 c-0.545,0-0.824-0.272-0.824-0.816v-55.146c0-0.545,0.279-0.817,0.824-0.817h9.23c9.245,0,15.892,3.128,18.21,10.46 c0.95,3.128,1.62,8.56,1.62,17.93C269.476,308.336,268.805,313.768,267.856,316.896z"></path> <path className="st0" d="M361.167,252.785h-44.812c-5.432,0-8.7,3.533-8.7,8.825v73.754c0,6.388,4.218,10.599,10.055,10.599 c5.697,0,9.914-4.21,9.914-10.599v-26.351c0-0.538,0.265-0.81,0.81-0.81h26.086c5.837,0,9.23-3.532,9.23-8.56 c0-5.028-3.393-8.553-9.23-8.553h-26.086c-0.545,0-0.81-0.272-0.81-0.817v-19.425c0-0.545,0.265-0.816,0.81-0.816h32.733 c5.572,0,9.245-3.666,9.245-8.553C370.411,256.45,366.738,252.785,361.167,252.785z"></path> </g> </g></svg>
)
export const IconCopy = () => (
  <svg height="24" width="24" viewBox="0 -0.5 25 25" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fillRule="evenodd" clipRule="evenodd" d="M8.94605 4.99995L13.2541 4.99995C14.173 5.00498 15.0524 5.37487 15.6986 6.02825C16.3449 6.68163 16.7051 7.56497 16.7001 8.48395V12.716C16.7051 13.6349 16.3449 14.5183 15.6986 15.1717C15.0524 15.825 14.173 16.1949 13.2541 16.2H8.94605C8.02707 16.1949 7.14773 15.825 6.50148 15.1717C5.85522 14.5183 5.495 13.6349 5.50005 12.716L5.50005 8.48495C5.49473 7.5658 5.85484 6.6822 6.50112 6.0286C7.1474 5.375 8.0269 5.00498 8.94605 4.99995Z" stroke="#58a6ff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path> <path d="M10.1671 19H14.9371C17.4857 18.9709 19.5284 16.8816 19.5001 14.333V9.666" stroke="#58a6ff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path> </g></svg>
)
export const IconExcel = () => (
  <svg height="18" width="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fillRule="evenodd" clipRule="evenodd" d="M9.29289 1.29289C9.48043 1.10536 9.73478 1 10 1H18C19.6569 1 21 2.34315 21 4V9C21 9.55228 20.5523 10 20 10C19.4477 10 19 9.55228 19 9V4C19 3.44772 18.5523 3 18 3H11V8C11 8.55228 10.5523 9 10 9H5V20C5 20.5523 5.44772 21 6 21H7C7.55228 21 8 21.4477 8 22C8 22.5523 7.55228 23 7 23H6C4.34315 23 3 21.6569 3 20V8C3 7.73478 3.10536 7.48043 3.29289 7.29289L9.29289 1.29289ZM6.41421 7H9V4.41421L6.41421 7ZM19 12C19.5523 12 20 12.4477 20 13V19H23C23.5523 19 24 19.4477 24 20C24 20.5523 23.5523 21 23 21H19C18.4477 21 18 20.5523 18 20V13C18 12.4477 18.4477 12 19 12ZM11.8137 12.4188C11.4927 11.9693 10.8682 11.8653 10.4188 12.1863C9.96935 12.5073 9.86526 13.1318 10.1863 13.5812L12.2711 16.5L10.1863 19.4188C9.86526 19.8682 9.96935 20.4927 10.4188 20.8137C10.8682 21.1347 11.4927 21.0307 11.8137 20.5812L13.5 18.2205L15.1863 20.5812C15.5073 21.0307 16.1318 21.1347 16.5812 20.8137C17.0307 20.4927 17.1347 19.8682 16.8137 19.4188L14.7289 16.5L16.8137 13.5812C17.1347 13.1318 17.0307 12.5073 16.5812 12.1863C16.1318 11.8653 15.5073 11.9693 15.1863 12.4188L13.5 14.7795L11.8137 12.4188Z" fill="#58a6ff"></path> </g></svg>
)
export const IconIp = () => (
  <svg
    height="20"
    width="20"
    version="1.1"
    id="Capa_1"
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    viewBox="0 0 20.234 20.234"
    xmlSpace="preserve"
    fill="#000000"
  >
    <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
    <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
    <g id="SVGRepo_iconCarrier">
      <g>
        {/* Fixed style prop below */}
        <path
          style={{ fill: '#58a6ff' }}
          d="M6.776,4.72h1.549v6.827H6.776V4.72z M11.751,4.669c-0.942,0-1.61,0.061-2.087,0.143v6.735h1.53 V9.106c0.143,0.02,0.324,0.031,0.527,0.031c0.911,0,1.691-0.224,2.218-0.721c0.405-0.386,0.628-0.952,0.628-1.621 c0-0.668-0.295-1.234-0.729-1.579C13.382,4.851,12.702,4.669,11.751,4.669z M11.709,7.95c-0.222,0-0.385-0.01-0.516-0.041V5.895 c0.111-0.03,0.324-0.061,0.639-0.061c0.769,0,1.205,0.375,1.205,1.002C13.037,7.535,12.53,7.95,11.709,7.95z M10.117,0 C5.523,0,1.8,3.723,1.8,8.316s8.317,11.918,8.317,11.918s8.317-7.324,8.317-11.917S14.711,0,10.117,0z M10.138,13.373 c-3.05,0-5.522-2.473-5.522-5.524c0-3.05,2.473-5.522,5.522-5.522c3.051,0,5.522,2.473,5.522,5.522 C15.66,10.899,13.188,13.373,10.138,13.373z"
        />
      </g>
    </g>
  </svg>
);
export const IconUp = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" height="20" width="20"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fillRule="evenodd" clipRule="evenodd" d="M12 3C12.2652 3 12.5196 3.10536 12.7071 3.29289L19.7071 10.2929C20.0976 10.6834 20.0976 11.3166 19.7071 11.7071C19.3166 12.0976 18.6834 12.0976 18.2929 11.7071L13 6.41421V20C13 20.5523 12.5523 21 12 21C11.4477 21 11 20.5523 11 20V6.41421L5.70711 11.7071C5.31658 12.0976 4.68342 12.0976 4.29289 11.7071C3.90237 11.3166 3.90237 10.6834 4.29289 10.2929L11.2929 3.29289C11.4804 3.10536 11.7348 3 12 3Z" fill="#58a6ff"></path> </g></svg>
)
export const IconDown = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" height="20" width="20" transform="rotate(180)"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fillRule="evenodd" clipRule="evenodd" d="M12 3C12.2652 3 12.5196 3.10536 12.7071 3.29289L19.7071 10.2929C20.0976 10.6834 20.0976 11.3166 19.7071 11.7071C19.3166 12.0976 18.6834 12.0976 18.2929 11.7071L13 6.41421V20C13 20.5523 12.5523 21 12 21C11.4477 21 11 20.5523 11 20V6.41421L5.70711 11.7071C5.31658 12.0976 4.68342 12.0976 4.29289 11.7071C3.90237 11.3166 3.90237 10.6834 4.29289 10.2929L11.2929 3.29289C11.4804 3.10536 11.7348 3 12 3Z" fill="#58a6ff"></path> </g></svg>
)
export const IconBranch = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" height="18" width="18"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fillRule="evenodd" clipRule="evenodd" d="M10.8321 1.24802C11.5779 0.917327 12.4221 0.917327 13.1679 1.24802L21.7995 5.0754C23.7751 5.95141 23.1703 9 21.0209 9H2.97906C0.829669 9 0.224891 5.9514 2.20047 5.0754L10.8321 1.24802ZM12.3893 3.12765C12.1407 3.01742 11.8593 3.01742 11.6107 3.12765L3.41076 6.76352C3.31198 6.80732 3.34324 6.95494 3.45129 6.95494H20.5487C20.6568 6.95494 20.688 6.80732 20.5892 6.76352L12.3893 3.12765Z" fill="#58a6ff"></path> <path d="M2 22C2 21.4477 2.44772 21 3 21H21C21.5523 21 22 21.4477 22 22C22 22.5523 21.5523 23 21 23H3C2.44772 23 2 22.5523 2 22Z" fill="#58a6ff"></path> <path d="M11 19C11 19.5523 11.4477 20 12 20C12.5523 20 13 19.5523 13 19V11C13 10.4477 12.5523 10 12 10C11.4477 10 11 10.4477 11 11V19Z" fill="#58a6ff"></path> <path d="M6 20C5.44772 20 5 19.5523 5 19L5 11C5 10.4477 5.44771 10 6 10C6.55228 10 7 10.4477 7 11L7 19C7 19.5523 6.55229 20 6 20Z" fill="#58a6ff"></path> <path d="M17 19C17 19.5523 17.4477 20 18 20C18.5523 20 19 19.5523 19 19V11C19 10.4477 18.5523 10 18 10C17.4477 10 17 10.4477 17 11V19Z" fill="#58a6ff"></path> </g></svg>
)
export const IconTeller = () => (
  <svg fill="#58a6ff" height="200px" width="200px" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 193.5 193.5" xmlSpace="preserve" stroke="#58a6ff" height="18" width="18"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M147.988,189.003H45.512c-8.011,0-14.529-6.518-14.529-14.529V63.554h-13.35C7.91,63.554,0,55.644,0,45.921V22.13 C0,12.407,7.91,4.497,17.633,4.497h158.233c9.723,0,17.633,7.91,17.633,17.633v23.791c0,9.723-7.91,17.633-17.633,17.633h-13.35 v110.92C162.517,182.486,155.999,189.003,147.988,189.003z M36.983,38.593v135.881c0,4.703,3.826,8.529,8.529,8.529h102.476 c4.703,0,8.529-3.826,8.529-8.529V61.646c-0.132-0.338-0.205-0.707-0.205-1.091V38.593H36.983z M162.517,57.554h13.35 c6.415,0,11.633-5.219,11.633-11.633V22.13c0-6.415-5.219-11.633-11.633-11.633H17.633C11.219,10.497,6,15.715,6,22.13v23.791 c0,6.415,5.219,11.633,11.633,11.633h13.146V45.265H30.56c-4.575,0-8.296-3.722-8.296-8.296v-5.887c0-4.575,3.722-8.296,8.296-8.296 H162.94c4.575,0,8.296,3.722,8.296,8.296v5.887c0,4.575-3.722,8.296-8.296,8.296h-0.424V57.554z M162.517,39.265h0.424 c1.266,0,2.296-1.03,2.296-2.296v-5.887c0-1.266-1.03-2.296-2.296-2.296H30.56c-1.266,0-2.296,1.03-2.296,2.296v5.887 c0,1.266,1.03,2.296,2.296,2.296h0.219v-3.74c0-1.657,1.343-3,3-3h0h125.533c0.369,0,0.722,0.066,1.048,0.188 c1.246,0.365,2.156,1.516,2.156,2.879V39.265z M96.75,132.794c-27.37,0-49.637-18.565-49.637-41.385S69.38,50.024,96.75,50.024 s49.637,18.565,49.637,41.385S124.12,132.794,96.75,132.794z M96.75,56.024c-24.062,0-43.637,15.874-43.637,35.385 s19.576,35.385,43.637,35.385s43.637-15.874,43.637-35.385S120.812,56.024,96.75,56.024z M118.753,114.531c-1.657,0-3-1.343-3-3 V94.409H97.562v5.029c0,8.322-6.771,15.093-15.093,15.093c-8.327,0-15.098-6.771-15.098-15.093v-5.029h-4.038c-1.657,0-3-1.343-3-3 s1.343-3,3-3h4.038V71.058c0-1.657,1.343-3,3-3s3,1.343,3,3v17.351h18.191v-5.256c0-8.324,6.772-15.095,15.096-15.095 s15.096,6.771,15.096,15.095v5.256h5.343c1.657,0,3,1.343,3,3s-1.343,3-3,3h-5.343v17.122 C121.753,113.188,120.41,114.531,118.753,114.531z M73.371,94.409v5.029c0,5.014,4.079,9.093,9.093,9.093 c5.019,0,9.098-4.079,9.098-9.093v-5.029H73.371z M97.562,88.409h18.191v-5.256c0-5.015-4.081-9.095-9.096-9.095 c-5.016,0-9.096,4.08-9.096,9.095V88.409z"></path> </g></svg>
)
export const IconGraph = () => (
  <svg
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    height="18"
    width="18"
  >
    <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
    <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
    <g id="SVGRepo_iconCarrier">
      <path
        id="graph1"
        fill="#58a6ff"
        fillRule="evenodd"
        d="M1163.46,251.089l-7.75,4.592h0a0.981,0.981,0,0,1-.56.263,0.859,0.859,0,0,1-.88-0.281l-4.27-4.228-4.28,4.246a1.018,1.018,0,0,1-1.43,0h0a1,1,0,0,1,0-1.414l4.99-4.95a1.031,1.031,0,0,1,1.44,0l4.33,4.293,7.53-4.467a0.917,0.917,0,0,1,1.33.444h0A1.207,1.207,0,0,1,1163.46,251.089ZM1163,262a1,1,0,0,1,0,2h-22a1,1,0,0,1-1-1V241a1,1,0,0,1,2,0v21h21Z"
        transform="translate(-1140 -240)"
      />
    </g>
  </svg>
);
export const IconCross = () => (
  <svg height="24" width="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fillRule="evenodd" clipRule="evenodd" d="M5.46967 5.46967C5.76256 5.17678 6.23744 5.17678 6.53033 5.46967L18.5303 17.4697C18.8232 17.7626 18.8232 18.2374 18.5303 18.5303C18.2374 18.8232 17.7626 18.8232 17.4697 18.5303L5.46967 6.53033C5.17678 6.23744 5.17678 5.76256 5.46967 5.46967Z" fill="#ffffff"></path> <path fillRule="evenodd" clipRule="evenodd" d="M18.5303 5.46967C18.8232 5.76256 18.8232 6.23744 18.5303 6.53033L6.53035 18.5303C6.23745 18.8232 5.76258 18.8232 5.46969 18.5303C5.17679 18.2374 5.17679 17.7626 5.46968 17.4697L17.4697 5.46967C17.7626 5.17678 18.2374 5.17678 18.5303 5.46967Z" fill="#ffffff"></path> </g></svg>
)
export const IconCalendar = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);
export const IconDay = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);
export const IconNight = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);
export const IconSearch = () =>(
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M15.7955 15.8111L21 21M18 10.5C18 14.6421 14.6421 18 10.5 18C6.35786 18 3 14.6421 3 10.5C3 6.35786 6.35786 3 10.5 3C14.6421 3 18 6.35786 18 10.5Z" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path> </g></svg>
)
import { useState, useEffect, useRef } from "react";
import { IconList, IconThumbDown, IconCross } from "./Icons";
// import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
// import QueueReplica from "../blocks/QueueReplica";
function getPillClass(val) {
  if (val === 0) return "pill pill-zero";
  if (val <= 99) return "pill pill-yellow";
  if (val <= 499) return "pill pill-orange";
  return "pill pill-red";
}
function QueueAnimatedCell({ value }) {
  const [highlight, setHighlight] = useState(false);
  const prev = useRef(value);
  useEffect(() => {
    if (prev.current !== value) {
      setHighlight(true);
      const timer = setTimeout(() => setHighlight(false), 800);
      prev.current = value;
      return () => clearTimeout(timer);
    }
  }, [value]);
  return (
    <td className={highlight ? "highlight-row" : ""}>
      <span>{value === -1 ? <IconThumbDown /> : value}</span>
    </td>
  );
}
export default function In0800({ data, lastUpdated }) {
  const sourceData = data || {};
  const queueKeys = Object.keys(sourceData)
//   const columns = Array.from({ length: 16 }, (_, i) => i === 0 ? "M" : `S${i}`);
  const [showPopup, setShowPopup] = useState(false);
  const [queue, setQueue] = useState(null);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="queuecard" style={{width: "100%" }}>
        <div className="card-header border-b border-[var(--border-color)] pb-4 mb-0 flex justify-between">
          <div className="card-title text-[14px]">
            <IconList />
            <h2 className="text-[14px]">IN0800 Status</h2>
          </div>
          <div className="flex items-center gap-6 text-[12px] font-semibold text-secondary" style={{ display: 'flex', alignItems: 'center', gap: '24px', fontSize: '11px', color: 'var(--text-secondary)' }}>
            <div className="timestamp">
              <p><span>•</span> {lastUpdated}</p>
            </div>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Server</th>
                <th>Start Time</th>
                <th>Current Time</th>
                <th>Duration</th>
                <th>Last Update</th>
                <th>End Time</th>
                <th>Total Record</th>
                <th>Record Processed</th>
                <th>Record Pending</th>
                <th>Speed(/Sec)</th>
                <th>Percentage Complete</th>
                <th>Running</th>
                <th>Completed</th>
                <th>No of RC {'>'} 0</th>
                {/* {queueKeys.length > 0 && sourceData[queueKeys[0]]
                  ? sourceData[queueKeys[0]].map((_, i) => (
                    <th key={i}>{i === 0 ? "M" : `S${i}`}</th>
                  ))
                  : columns.map((c) => <th key={c}>{c}</th>)} */}
              </tr>
            </thead>
            <tbody>
              {queueKeys.length > 0 ? (
                queueKeys.map((key) => {
                  const rowData = sourceData[key];
                  return (
                    <tr key={key} >
                      <td className="queues" onClick={() => {
                        setShowPopup(true);
                        setQueue(key);
                      }}>{key.toUpperCase()}</td>
                      {Array.isArray(rowData)
                        ? rowData.slice(0, -1).map((val, i) => (
                          <QueueAnimatedCell key={i} value={val} />
                        ))
                        : null}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={14} className="text-center opacity-50">Waiting for data...</td>
                </tr>
              )}
            </tbody>
          </table>
          {showPopup && (
            <div className="popup-overlay" onClick={() => setShowPopup(false)}>
              <div className="popup-content" onClick={(e) => e.stopPropagation()}>
                <QueueReplica queue={queue} />
                <button className="close-button" onClick={() => setShowPopup(false)}><IconCross /></button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
import React from "react";
import "./legend.css";
import PrLegend from "./PrLegend";
import NrLegend from "./NrLegend";
import DrLegend from "./DrLegend";
import { IconIp } from "../components/Icons";
export default function Legend({ data = {} }) {
  return (
    <>
      <div className="legend-wrapper">
        <div style={{ width: "100%", paddingLeft: "20px"}}>
            <h2 style={{marginTop:"1rem"}}><IconIp/> IPs and Server Names:</h2>
        </div>
        <div className="legend-flex">
          <PrLegend prdata={data.PrLegend} />
          <NrLegend nrdata={data.NrLegend} />
          <DrLegend drdata={data.DrLegend} />
        </div >
      </div>
    </>
  )
};
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
import React from 'react';
export default function MilestoneDetails() {
  return (
    <div style={{
        padding: '2rem',
        fontFamily: 'sans-serif',
        color: 'white',
        backgroundColor: '#1e1e1e',
        borderRadius: '0',
        minWidth: '300px',
        maxWidth: 'none',
        maxHeight: 'none',
        width: '100%',
        boxShadow: 'none',
        overflowY: 'auto',
        boxSizing: 'border-box'
      }}>
        <div style={{ paddingBottom: "1rem", borderBottom: "1px solid #333", marginBottom: "1rem" }}>
            <h2 style={{ marginTop: 0 }}>Milestone Details</h2>
        </div>
        <div style={{ marginTop: '1rem', marginBottom: '2rem', lineHeight: '1.5' }}>
            <p>
              This is a placeholder for the <strong>Milestone Details</strong> explanation.<br/>
              Add your content here.
              Lorem ipsum dolor sit amet, consectetur adipisicing elit. Fugit, rerum, omnis debitis at eveniet, repellendus inventore iure molestiae dolorem quo dolorum!
            </p>
        </div>
      </div>
  );
}
import { useState, useEffect, useRef } from "react";
import { IconCheck, IconWarning, IconError, IconLock, IconSlash, IconSnow, IconZap, IconGrid } from "./Icons";
import './MqStatus.css'
function GridAnimatedCell({ value, i }) {
  const [highlight, setHighlight] = useState(false);
  const prev = useRef(value);
  useEffect(() => {
    if (prev.current !== value) {
      setHighlight(true);
      const timer = setTimeout(() => setHighlight(false), 800);
      prev.current = value;
      return () => clearTimeout(timer);
    }
  }, [value]);
  if (i === 1 && value > 100) {
    return (
      <td className={highlight ? "highlight-row" : ""}>
        <span className="sys-red">{value}</span>
      </td>
    )
  }
  if (i === 0 && value < 1) {
    return (
      <td className={highlight ? "highlight-row" : ""}>
        <span className="sys-green">Please Check</span>
      </td>
    )
  }
  else {
    return (
      <td className={highlight ? "highlight-row" : ""}>
        <span>{value}</span>
      </td>
    )
  };
}
export default function MiscTransactionCount({ data, lastUpdated, neftCount }) {
  const sourceData = data || {};
  const sourceData2 = neftCount || {};
  const jobKeys = Object.keys(sourceData);
  // Fallback headers if data empty
  const columns = Array.from({ length: 16 }, (_, i) => i === 0 ? "M" : `S${i}`);
  const NeftCount = sourceData2["neft incoming count"]
  return (
    <div className="misc">
      <div className="card-header">
        <div className="card-title">
          <IconGrid />
          <h2>MISC Transaction Count</h2>
        </div>
        <div className="timestamp">
          <p><span>•</span> {lastUpdated}</p>
        </div>
      </div>
      <div className="table-wrap misc-table">
        <table>
          <thead>
            <tr>
              <th>TXN TYPE</th>
              <th>PROCESSED</th>
              <th>WAIT</th>
              <th>UNPROCESSED</th>
              <th>MQ ERR</th>
            </tr>
          </thead>
          <tbody>
            {jobKeys.length > 0 ? (
              jobKeys.map((key) => {
                const rowData = sourceData[key];
                return (
                  <tr key={key}>
                    <td>{key}</td>
                    {Array.isArray(rowData)
                      ? rowData.map((val, i) => (
                        <GridAnimatedCell key={i} value={val} i={i} />
                      ))
                      : null}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={13} className="text-center opacity-50">Waiting for data...</td>
              </tr>
            )}
            <tr><td>NEFT INCOMING PROCESSED COUNT</td><td>{NeftCount}</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
import { useState, useEffect, useRef } from "react";
import { IconCheck, IconWarning, IconError, IconLock, IconSlash, IconSnow, IconZap, IconGrid } from "./Icons";
import './MqStatus.css'
function renderJobCell(jobName, val) {
  if (jobName === "Check RC") {
    return val === "NO CHECK RC" ? <span className="pill pill-none">NONE</span> : <span className="pill pill-yellow-check">CHECK RC</span>;
  }
  if (jobName === "CONNECTIVITY") {
    // Usually Y is green, N is red
    return <span className={val === "Y" ? "text-green font-bold" : "text-red font-bold"}>{val}</span>;
  }
  if (jobName === "System Idle" || jobName === "Misc Job") {
    return <span className="font-bold">{val}</span>;
  }
  if (jobName === "LAST UPDATE"){
    return <span className="time">{val}</span>
  }
  // Gateway status icons
  if (val === "RUNNING" || val === "ON") {
    return <IconCheck />;
  } else if (val === "NOT RUNNING" || val === "OFF") {
    return <IconWarning />;
  } else if (val === "NEW ARCH NOT UPDATING" || val === "OFF") {
    return <IconWarning />;
  } else if (val === "NOT UPDATING" || val === "OFF") {
    return <IconWarning />;
  }  else if (val === "ERROR" || val === "DOWN") {
    return <IconError />;
  } else if (val === "-" || val === "NA") {
    return <span className="text-secondary">—</span>;
  }
  return <span>{val}</span>;
}
function GridAnimatedCell({ jobName, value }) {
  const [highlight, setHighlight] = useState(false);
  const prev = useRef(value);
  useEffect(() => {
    if (prev.current !== value) {
      setHighlight(true);
      const timer = setTimeout(() => setHighlight(false), 800);
      prev.current = value;
      return () => clearTimeout(timer);
    }
  }, [value]);
  return (
    <td className={highlight ? "highlight-row" : ""}>
      {renderJobCell(jobName, value)}
    </td>
  );
}
export default function MqStatus({ data , lastUpdated}) {
  const sourceData = data || {};
  const jobKeys = Object.keys(sourceData);
  // Fallback headers if data empty
  const columns = Array.from({ length: 16 }, (_, i) => i === 0 ? "M" : `S${i}`);
  return (
    <div className="mq-status">
      <div className="card-header">
        <div className="card-title">
          <IconGrid />
          <h2>MQ Status</h2>
        </div>
        <div className="timestamp">
          <p><span>•</span> {lastUpdated}</p>
        </div>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>SERVER</th>
              {jobKeys.length > 0 && sourceData[jobKeys[0]]
                ? sourceData[jobKeys[0]].map((_, i) => (
                    <th key={i}>{i === 0 ? "M" : `S${i}`}</th>
                  ))
                : columns.map((c) => <th key={c}>{c}</th>)}
            </tr>
          </thead>
          <tbody>
            {jobKeys.length > 0 ? (
              jobKeys.map((key) => {
                const rowData = sourceData[key];
                return (
                  <tr key={key}>
                    <td>{key}</td>
                    {Array.isArray(rowData)
                      ? rowData.map((val, i) => (
                          <GridAnimatedCell key={i} jobName={key} value={val} />
                        ))
                      : null}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={13} className="text-center opacity-50">Waiting for data...</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
import React, { useState, useEffect, useRef } from "react";
import { IconBranch, IconCopy, IconExcel, IconGraph, IconPdf, IconTeller, IconUp, IconDay, IconNight } from "../components/Icons";
import "./NeftInvalid.css";
import { useNavigate, useLocation } from 'react-router-dom';
function QueueAnimatedCell({ value }) {
  const [highlight, setHighlight] = useState(false);
  const prev = useRef(value);
  useEffect(() => {
    if (prev.current !== value) {
      setHighlight(true);
      const timer = setTimeout(() => setHighlight(false), 800);
      prev.current = value;
      return () => clearTimeout(timer);
    }
  }, [value]);
  return (
    <td className={highlight ? "highlight-row" : ""}>
      <span>{value}</span>
    </td>
  );
}
const IconCalendar = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);
function DateFormatter(marketDate) {
  const year = marketDate.getFullYear();
  const month = String(marketDate.getMonth() + 1).padStart(2, '0');
  const day = String(marketDate.getDate()).padStart(2, '0');
  const formattedDate = `${year}${month}${day}`;
  return formattedDate
}
function DateFormatter2(marketDate) {
  if (marketDate.includes("-")) {
    const parts = marketDate.split("-")
    const formattedDate = `${parts[0]}${parts[1]}${parts[2]}`;
    return formattedDate
  }
  else {
    return marketDate
  }
}
export default function NeftInvalid({ data = {} }) {
  const [marketDate, setMarketDate] = React.useState(DateFormatter(new Date()));
  const [replicaData, setReplicaData] = useState(null);
  const [day, setDay] = useState(true);
  const finalDate = DateFormatter2(marketDate)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/neft-invalid', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ date: finalDate, isDay: day }),
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setReplicaData(data);
      } catch (error) {
        console.error('POST request failed:', error);
      }
    };
    fetchData();
  }, [finalDate, day]);
  const sourceData = replicaData?.data || {};
  const dataEntries = Object.entries(replicaData?.data || {});
  // if (dataEntries.length === 0) {
  //   console.log("no data found")
  // }
  // console.log(sourceData)
  const neftKey = Object.keys(replicaData?.data || {})
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [copySuccess, setCopySuccess] = useState("");
  const handleCopy = async () => {
    const table = document.getElementById("my-table");
    if (!table) return;
    try {
      const text = table.innerText;
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => {
        setCopySuccess("");
      }, 2000);
    } catch (err) {
      console.error("Failed to copy", err);
      setCopySuccess("Failed to copy");
    }
  };
  const filterData = neftKey.filter((key) => {
    const rowData = sourceData[key];
    if (!rowData) return false;
    return Object.values(rowData)
      .join("")
      .toLowerCase()
      .includes(search.toLowerCase());
  });
  const handleInputChange = (e) => {
    setSearchInput(e.target.value);
    const tableBody = document.getElementById('my-table');
    if (tableBody) {
      console.log("Table has", tableBody.rows.length, "rows");
    }
  };
  const [isVisible, setIsVisible] = useState(false);
  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };
  useEffect(() => {
    window.addEventListener("scroll", toggleVisibility);
    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []);
  const handleDownloadExcel = () => {
    const keysToExport = filterData;
    if (keysToExport.length === 0) {
      alert("No visible rows to export");
      return;
    }
    let tableHTML = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office"
          xmlns:x="urn:schemas-microsoft-com:office:excel"
          xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>Queue Data</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <meta charset="UTF-8">
      </head>
      <body>
      <table border="1">
        <thead>
          <tr style="background:#f0f0f0; font-weight:bold;">
            <th>Queue Key</th>
            <th>Data 1</th>
            <th>Data 2</th>
            <th>Circle Name</th>
            <th>Circle Value</th>
            <th>Other Data</th>
          </tr>
        </thead>
        <tbody>
  `;
    keysToExport.forEach((key) => {
      const rowData = sourceData[key];
      tableHTML += `<tr>`;
      tableHTML += `<td>${key.toUpperCase()}</td>`;
      if (Array.isArray(rowData)) {
        rowData.forEach((val, i) => {
          const safeVal = String(val).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        });
      }
      tableHTML += `</tr>`;
    });
    tableHTML += `</tbody></table></body></html>`;
    const blob = new Blob(['\ufeff' + tableHTML], {
      type: 'application/vnd.ms-excel'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Branch_loggedIn${new Date().getTime()}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  return (
    <div className="div1">
      <div className="div3">
        <h2>NEFT Invalid UTR Monitoring Dashboard</h2>
        <div className="div5">
          <div className="container1">
            <div className="DN_buttons">
              <button onClick={() => setDay(true)}>
                <IconDay /> Day
              </button>
              <button onClick={() => setDay(false)}>
                <IconNight /> Night
              </button>
            </div>
            <div className="calender">
              <div className="date-picker-wrapper">
                <label htmlFor="market-date-picker" className="change-date-btn">
                  <IconCalendar /> Calender
                </label>
                <input
                  type="date"
                  id="market-date-picker"
                  className="hidden-date-input"
                  value={marketDate}
                  onChange={(e) => setMarketDate(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="mainContainer">
          <div className="container2">
            <div className="buttons">
              <button onClick={handleCopy}><IconCopy />{copySuccess ? 'Copied' : 'Copy'}</button>
              <button><IconPdf />PDF</button>
              <button onClick={handleDownloadExcel} ><IconExcel />Excel</button>
            </div>
            <div className="searchTable">
              <label style={{ fontSize: "12px" }}>Search:</label>
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
          <div className="branch-table">
            <table>
              <thead>
                <tr>
                  <th>UTR</th>
                  <th>BANCS_DQTYPE</th>
                  <th>IN_OUT</th>
                  <th>STATUS </th>
                  <th>TRAN_DATE</th>
                  <th>AMOUNT</th>
                  <th>ACCOUNT_NO</th>
                  <th>BENEF_ACCT_NO</th>
                  <th>JRNL_NO</th>
                  <th>BRANCH </th>
                  <th>IFSC_SENDER</th>
                  <th>IFSC_RECVR</th>
                  <th>CREDIT_BGL</th>
                  <th>DEBIT_BGL</th>
                </tr>
              </thead>
              <tbody id="my-table">
                {search
                  ? (filterData.length > 0 ? (
                    filterData.map((key) => {
                      const rowData = sourceData[key];
                      return (
                        <tr key={key}>
                          <td>{key.toUpperCase()}</td>
                          {Array.isArray(rowData)
                            ? rowData.map((val, i) => {
                              return <QueueAnimatedCell key={i} value={val} />;
                            })
                            : null}
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={14} className="text-center opacity-50">No data for the date {finalDate}</td>
                    </tr>
                  ))
                  : (neftKey.length > 0 ? (
                    neftKey.map((key) => {
                      const rowData = sourceData[key];
                      return (
                        <tr key={key}>
                          <td>{key.toUpperCase()}</td>
                          {Array.isArray(rowData)
                            ? rowData.map((val, i) => {
                                return <QueueAnimatedCell key={i} value={val} />;
                            })
                            : null}
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={14} className="text-center opacity-50">No data for the date {finalDate}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="scroll-to-top" >
          {isVisible && (
            <button className="scroll-to-top" onClick={scrollToTop}>
              <IconUp />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect, useRef } from "react";
import { IconList, IconThumbDown } from "../components/Icons";
function QueueAnimatedCell({ value }) {
    const [highlight, setHighlight] = useState(false);
    const prev = useRef(value);
    useEffect(() => {
        if (prev.current !== value) {
            setHighlight(true);
            const timer = setTimeout(() => setHighlight(false), 800);
            prev.current = value;
            return () => clearTimeout(timer);
        }
    }, [value]);
    return (
        <td className={highlight ? "highlight-row" : ""}>
            <span>{value === -1 ? <IconThumbDown /> : value}</span>
        </td>
    );
}
export default function NrLegend({ nrdata }) {
    const sourceData = nrdata || {};
    const queueKeys = Object.keys(sourceData)
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="legendcard">
                <div className="card-header border-b border-[var(--border-color)] pb-4 mb-0 flex justify-between">
                    <div className="card-title text-[14px]">
                        <h2 className="text-[14px]">NR Servers</h2>
                    </div>
                    <div className="flex items-center gap-6 text-[12px] font-semibold text-secondary" style={{ display: 'flex', alignItems: 'center', gap: '24px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    </div>
                </div>
                <div className="legend-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Hostname</th>
                                <th>DQP Type</th>
                                <th>Logical IP</th>
                                <th>S No</th>
                                <th>Physical IP</th>
                                <th>Back Haul IO IP</th>
                            </tr>
                        </thead>
                        <tbody>
                            {queueKeys.length > 0 ? (
                                queueKeys.map((key) => {
                                    const rowData = sourceData[key];
                                    return (
                                        <tr key={key}>
                                            <td>{key.toUpperCase()}</td>
                                            {Array.isArray(rowData)
                                                ? rowData.map((val, i) => (
                                                    <QueueAnimatedCell key={i} value={val} />
                                                ))
                                                : null}
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={14} className="text-center opacity-50">Waiting for data...</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
import { IconList } from "./Icons";
import './SystemContext.css'
function Conditioning({ val, i, job }) {
  if (job === "L.Update") {
    return (
      <td key={i}>
        <span className="time">{val}</span>
      </td>
    )
  }if (job === 'Pending' && val > 99){
      return (
    <td key={i}>
      <span className="pill pill-red">{val}</span>
    </td>
  )
  }
  return (
    <td key={i}>
      <span>{val}</span>
    </td>
  )
}
export default function OcrNeft({ data, lastUpdated }) {
  const sourceData = data || {};
  const keys = Object.keys(sourceData);
  let maxCols = 0;
  keys.forEach(k => {
    if (sourceData[k].length > maxCols) maxCols = sourceData[k].length;
  });
  return (
    <div className="ocr-neft" style={{ height: '100%' }}>
      <div className="card-header border-b border-[var(--border-color)] pb-4 mb-0 flex justify-between">
        <div className="card-title text-[14px]">
          <IconList />
          <h2 className="text-[14px]">OCR and NEFT (OUTGOING) / OCR_NEFT Summary</h2>
        </div>
        <div className="timestamp">
          <p><span>•</span> {lastUpdated}</p>
        </div>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th></th>
              <th>OCR</th>
              <th colSpan={16}>NEFT</th>
            </tr>
            <tr>
              <th>STATUS</th>
              <th>Table Count</th>
              {Array.from({ length: maxCols - 1 }).map((_, i) => (
                <th key={i}>{i === 0 ? "M" : `S${i}`}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {keys.length > 0 ? (
              keys.map((key) => {
                const rowData = sourceData[key] || [];
                return (
                  <tr key={key}>
                    <td>{key}</td>
                    {rowData.map((val, i) => (
                      <Conditioning val={val} i={i} job={key} />
                    ))}
                    {Array.from({ length: maxCols - rowData.length }).map((_, i) => (
                      <td key={`empty-${i}`}>-</td>
                    ))}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={maxCols + 1} className="text-center opacity-50">Waiting for data...</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
import { useEffect, useState } from 'react';
import './QueueReplica.css';
import './PaceBuildup.css';
function DateFormatter(marketDate) {
    const year = marketDate.getFullYear();
    const month = String(marketDate.getMonth() + 1).padStart(2, '0');
    const day = String(marketDate.getDate()).padStart(2, '0');
    const formattedDate = `${year}${month}${day}`;
    return formattedDate
}
const ServerDQTType = {
    0: "i",
    1: "I",
    2: "a",
    3: "b",
    4: "c",
    5: "d",
    6: "e",
    7: "f",
    8: "g",
    9: "h",
    10: "j",
    11: "k",
    12: "m",
    13: "n",
    14: "p",
    15: "q"
}
function AlertColor({value , i}) {
    const displayValue = (value === '0') ? "-" : value;
    const statusClass = value === '0' ? "pill pill-green" : "pill pill-red";
    if (i === 0 ){
        return(
            <td key={i} ><span>{value}</span></td>
        )
    }
    if(value === "NQKE"){
        return (
            <td key={i}><span className='pill pill-green'>-</span></td>
        )
    }
    return (
        <td key={i}><span className={statusClass}>{displayValue}</span></td>
    )
}
export default function PaceBuildup({ server }) {
    const [replicaData, setReplicaData] = useState(null);
    const [loading, setLoading] = useState(true);
    const today = DateFormatter(new Date())
    const servername = `pace_buildup_${ServerDQTType[server]}.txt.${today}`;
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/pace_buildup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ flag: servername }),
                });
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();
                setReplicaData(data);
            } catch (error) {
                console.error('POST request failed:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [server]);
    const dataEntries = replicaData?.data || {};
    const dataKeys = Object.keys(dataEntries)
    const head = dataEntries[1] || []
    if (dataEntries.length === 0) {
        return <div>NO data Found</div>;
    }
    return (
        <div className='queue-replica'>
            <h1 className="replica-title">{`Queue Buildup Detailed Status ${(ServerDQTType[server]).toUpperCase()}`}</h1>
            <div className="table-container">
                <table className="queue-replica-table pace-table">
                    <thead>
                        <tr>
                            {head.map((value, i) => (
                                <th key={i}>{value}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {dataKeys.slice(1).map((index) => {
                            const rawValue = dataEntries[index] || [];
                            const replicaIds = Array.isArray(rawValue) ? rawValue : [];
                            return (
                                <tr key={index}>
                                    {replicaIds.map((values, i) => (
                                        <AlertColor value = {values} i = {i} />
                                    ))}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
export default function Pagination({
  currentPage,
  totalPages,
  onNext,
  onPrev,
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "flex-end",
        gap: "10px",
        marginTop: "15px",
      }}
    >
      <button
        onClick={onPrev}
        disabled={currentPage === 1}
      >
        Previous
      </button>
      <span>
        Page {currentPage} of {totalPages}
      </span>
      <button
        onClick={onNext}
        disabled={currentPage === totalPages}
      >
        Next
      </button>
    </div>
  );
}
import { useState, useEffect, useRef } from "react";
import { IconList, IconThumbDown } from "../components/Icons";
function QueueAnimatedCell({ value }) {
    const [highlight, setHighlight] = useState(false);
    const prev = useRef(value);
    useEffect(() => {
        if (prev.current !== value) {
            setHighlight(true);
            const timer = setTimeout(() => setHighlight(false), 800);
            prev.current = value;
            return () => clearTimeout(timer);
        }
    }, [value]);
    return (
        <td className={highlight ? "highlight-row" : ""}>
            <span>{value === -1 ? <IconThumbDown /> : value}</span>
        </td>
    );
}
export default function PrLegend({ prdata }) {
    const sourceData = prdata || {};
    const queueKeys = Object.keys(sourceData)
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="legendcard">
                <div className="card-header border-b border-[var(--border-color)] pb-4 mb-0 flex justify-between">
                    <div className="card-title text-[14px]">
                        <h2 className="text-[14px]">PR Servers</h2>
                    </div>
                    <div className="flex items-center gap-6 text-[12px] font-semibold text-secondary" style={{ display: 'flex', alignItems: 'center', gap: '24px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    </div>
                </div>
                <div className="legend-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Hostname</th>
                                <th>DQP Type</th>
                                <th>Logical IP</th>
                                <th>S No</th>
                                <th>Physical IP</th>
                                <th>Back Haul IO IP</th>
                            </tr>
                        </thead>
                        <tbody>
                            {queueKeys.length > 0 ? (
                                queueKeys.map((key) => {
                                    const rowData = sourceData[key];
                                    return (
                                        <tr key={key}>
                                            <td>{key.toUpperCase()}</td>
                                            {Array.isArray(rowData)
                                                ? rowData.map((val, i) => (
                                                    <QueueAnimatedCell key={i} value={val} />
                                                ))
                                                : null}
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={14} className="text-center opacity-50">Waiting for data...</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
import './QueueAlerts.css';
import { IconAlertCircle, IconAlertTriangle } from '../components/Icons';
import React, { useMemo, useRef } from 'react';
import AlertPopup from './AlertPopup';
const QueueAlerts = ({ data }) => {
    const panelRef = useRef(null);
    const alertsList = useMemo(() => {
        if (!data) return [];
        return Object.keys(data).flatMap(key => {
            const array = data[key];
            if (!Array.isArray(array)) return [];
            return array
                .map((val, idx) => ({ val, idx }))
                .filter(item => item.val > 100)
                .map(item => ({
                    key: key,
                    value: item.val,
                    serverIndex: item.idx,
                    isCritical: item.val >= 500
                }));
        }).sort((a, b) => b.value - a.value);
    }, [data]);
    const totalAlerts = alertsList.length;
    const criticalCount = alertsList.filter(a => a.value >= 500).length;
    const highCount = alertsList.filter(a => a.value > 100 && a.value < 500).length;
    const handleBellOpen = () => {
        panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    if (totalAlerts === 0) {
        return null;
    }
    return (
        <>
            <AlertPopup
                totalAlerts={totalAlerts}
                criticalCount={criticalCount}
                highCount={highCount}
                onOpen={handleBellOpen}
                alertsList ={alertsList}
            />
        </>
    );
};
export default QueueAlerts;
import { useState, useEffect, useRef } from "react";
import { IconList, IconThumbDown, IconCross } from "./Icons";
// import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import QueueReplica from "../blocks/QueueReplica";
import PaceBuildup from "../blocks/PaceBuildup";
function getPillClass(val) {
  if (val === 0) return "pill pill-zero";
  if (val <= 99) return "pill pill-yellow";
  if (val <= 499) return "pill pill-orange";
  return "pill pill-red";
}
function QueueAnimatedCell({ value }) {
  const [highlight, setHighlight] = useState(false);
  const prev = useRef(value);
  useEffect(() => {
    if (prev.current !== value) {
      setHighlight(true);
      const timer = setTimeout(() => setHighlight(false), 800);
      prev.current = value;
      return () => clearTimeout(timer);
    }
  }, [value]);
  return (
    <td className={highlight ? "highlight-row" : ""}>
      <span className={getPillClass(value)}>{value === -1 ? <IconThumbDown /> : value}</span>
    </td>
  );
}
export default function QueueMetrics({ data, lastUpdated }) {
  const sourceData = data || {};
  const queueKeys = Object.keys(sourceData)
  const columns = Array.from({ length: 16 }, (_, i) => i === 0 ? "M" : `S${i}`);
  // Rows containing any value greater than THRESHOLD float to the top, sorted
  // by their highest value (highest first). All other rows keep their original
  // order (Array.prototype.sort is stable).
  const THRESHOLD = 200;
  const rowMax = (key) => {
    const row = sourceData[key];
    if (!Array.isArray(row)) return -Infinity;
    return row.reduce((m, v) => (typeof v === "number" && v > m ? v : m), -Infinity);
  };
  const sortedKeys = [...queueKeys].sort((a, b) => {
    const aHot = rowMax(a) >= THRESHOLD;
    const bHot = rowMax(b) >= THRESHOLD;
    if (aHot && bHot) return rowMax(b) - rowMax(a);
    if (aHot) return -1;
    if (bHot) return 1;
    return 0;
  });
  const [showPopup, setShowPopup] = useState(false);
  const [showPopup2, setShowPopup2] = useState(false);
  const [queue, setQueue] = useState(null);
    const [server, setServer] = useState(null);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="queuecard">
        <div className="card-header border-b border-[var(--border-color)] pb-4 mb-0 flex justify-between">
          <div className="card-title text-[14px]">
            <IconList />
            <h2 className="text-[14px]">QUEUE BUILDUP METRICS</h2>
          </div>
          <div className="flex items-center gap-6 text-[12px] font-semibold text-secondary" style={{ display: 'flex', alignItems: 'center', gap: '24px', fontSize: '11px', color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <span className="flex items-center gap-2" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: '#484f58', display: 'inline-block' }}></div> ZERO</span>
              <span className="flex items-center gap-2" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-orange)', display: 'inline-block' }}></div> 200-499</span>
              <span className="flex items-center gap-2" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-red)', display: 'inline-block' }}></div> 500+</span>
            </div>
            <div className="timestamp">
              <p><span>•</span> {lastUpdated}</p>
            </div>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>QUEUE</th>
                {queueKeys.length > 0 && sourceData[queueKeys[0]]
                  ? sourceData[queueKeys[0]].map((_, i) => (
                    <th key={i} onClick={() => { setShowPopup2(true);setServer(i); }}>{i === 0 ? "M" : `S${i}`}</th>
                  ))
                  : columns.map((c) => <th key={c}>{c}</th>)}
              </tr>
            </thead>
            <tbody>
              {queueKeys.length > 0 ? (
                sortedKeys.map((key) => {
                  const rowData = sourceData[key];
                  return (
                    <tr key={key} >
                      <td className="queues" onClick={() => {
                        setShowPopup(true);
                        setQueue(key);
                      }}>{key.toUpperCase()}</td>
                      {Array.isArray(rowData)
                        ? rowData.map((val, i) => (
                          <QueueAnimatedCell key={i} value={val} />
                        ))
                        : null}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={14} className="text-center opacity-50">Waiting for data...</td>
                </tr>
              )}
            </tbody>
          </table>
          {showPopup && (
            <div className="popup-overlay" onClick={() => setShowPopup(false)}>
              <div className="popup-content" onClick={(e) => e.stopPropagation()}>
                <QueueReplica queue={queue} />
                <button className="close-button" onClick={() => setShowPopup(false)}><IconCross /></button>
              </div>
            </div>
          )}
          {showPopup2 && (
            <div className="popup-overlay" onClick={() => setShowPopup2(false)}>
              <div className="popup-content" onClick={(e) => e.stopPropagation()}>
                <PaceBuildup server={server} />
                <button className="close-button" onClick={() => setShowPopup2(false)}><IconCross /></button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
import { useEffect, useState } from 'react';
import './QueueReplica.css';
export default function QueueReplica({ queue }) {
    const [replicaData, setReplicaData] = useState(null);
    const [loading, setLoading] = useState(true);
    const rows = Array.from({ length: 16 }, (_, i) => i === 0 ? "MASTER" : `SLAVE ${i}`);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/process-files', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ queue: queue }),
                });
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();
                setReplicaData(data);
            } catch (error) {
                console.error('POST request failed:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [queue]);
    const dataEntries = Object.entries(replicaData?.data || {});
    console.log(dataEntries)
    if (dataEntries.length === 0) {
        return <div>No replica data found for {queue}</div>;
    }
    return (
        <div className='queue-replica'>
            <h1 className="replica-title">Replica Data for {queue}</h1>
            <div className="table-container">
                <table className="queue-replica-table">
                    <thead>
                        <tr>
                            <th>SERVER</th>
                            <th>COUNT</th>
                            <th>REPLICA PID</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((serverName, index) => {
                            const replicaIds = dataEntries[index]?.[1] || [];
                            return (
                                <tr key={serverName}>
                                    <td>{serverName}</td>
                                    <td>{dataEntries[index]?.[1]?.length || 0}</td>
                                    <td>{replicaIds.join(', ')}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
import React, { useState, useEffect, useRef, useMemo } from "react";
import { IconCheck, IconDown, IconUp } from "../components/Icons";
// import './RepostFail.css';
function QueueAnimatedCell({ value }) {
  const [highlight, setHighlight] = useState(false);
  const prev = useRef(value);
  useEffect(() => {
    if (prev.current !== value) {
      setHighlight(true);
      const timer = setTimeout(() => setHighlight(false), 800);
      prev.current = value;
      return () => clearTimeout(timer);
    }
  }, [value]);
  return (
    <td className={highlight ? "highlight-row" : ""}>
      <span>{value === -1 ? <IconUp /> : value}</span>
    </td>
  );
}
export default function RepostFail({ data = {}, lastUpdated }) {
  const sourceData = data.neftRepostFailPage || {};
  const queueKeys = Object.keys(sourceData);
  const [search, setSearch] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [isVisible, setIsVisible] = useState(false);
  // Filter Data
  const filterData = useMemo(() => {
    return queueKeys.filter((key) => {
      const rowData = sourceData[key];
      if (!rowData) return false;
      return Object.values(rowData)
        .join("")
        .toLowerCase()
        .includes(search.toLowerCase());
    });
  }, [queueKeys, sourceData, search]);
  // Sorting Logic
  const sortedKeys = useMemo(() => {
    let sortableKeys = [...(search ? filterData : queueKeys)];
    if (sortConfig.key !== null) {
      sortableKeys.sort((a, b) => {
        const rowA = sourceData[a];
        const rowB = sourceData[b];
        if (!rowA || !rowB) return 0;
        let valueA = rowA[sortConfig.key];
        let valueB = rowB[sortConfig.key];
        if (valueA === undefined || valueB === undefined) return 0;
        const isNumeric = !isNaN(valueA) && !isNaN(valueB) && valueA !== '' && valueB !== '';
        if (isNumeric) {
          valueA = Number(valueA);
          valueB = Number(valueB);
        } else {
          valueA = String(valueA).toLowerCase();
          valueB = String(valueB).toLowerCase();
        }
        if (valueA < valueB) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (valueA > valueB) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableKeys;
  }, [search, filterData, queueKeys, sortConfig, sourceData]);
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  const getSortIcon = (columnName) => {
    if (sortConfig.key !== columnName) {
      return <IconUp />;
    }
    return sortConfig.direction === 'ascending' ? <IconUp/> : <IconDown />;
  };
  const toggleVisibility = () => {
    setIsVisible(window.pageYOffset > 300);
  };
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  useEffect(() => {
    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);
  const renderRows = (keysToRender) => (
    keysToRender.length > 0 ? (
      keysToRender.map((key) => {
        const rowData = sourceData[key];
        if (!Array.isArray(rowData)) return null;
        return (
          <tr key={key}>
            {rowData.map((val, i) => {
              if (i === 2) {
                return <td key={i}>{val}</td>;
              }
              return <QueueAnimatedCell key={i} value={val} />;
            })}
          </tr>
        );
      })
    ) : (
      <tr>
        <td colSpan={6} className="empty-message">
          {search ? "No results found" : "Waiting for data..."}
        </td>
      </tr>
    )
  );
  return (
    <div className="repost-fail-container">
      <div className="repostcard">
        <div className="card-header">
          <div className="card-title">
            <h2>NEFT REPOST FAIL Night TOTAL</h2>
          </div>
          <div className="searchTable">
            <label>Search:</label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter table..."
            />
          </div>
          <div className="header-meta">
            {/* Extra meta info can go here */}
          </div>
        </div>
        <div className="legend-table-wrapper">
          <table className="legend-table">
            <thead>
              <tr>
                <th onClick={() => requestSort(0)} className="sortable">DATE {getSortIcon(0)}</th>
                <th onClick={() => requestSort(1)} className="sortable">JOURNAL NO {getSortIcon(1)}</th>
                <th onClick={() => requestSort(2)} className="sortable">ERROR CODE {getSortIcon(2)}</th>
                <th onClick={() => requestSort(3)} className="sortable">TXN {getSortIcon(3)}</th>
                <th onClick={() => requestSort(4)} className="sortable">VIRTUAL DATE {getSortIcon(4)}</th>
                <th onClick={() => requestSort(5)} className="sortable">UTR {getSortIcon(5)}</th>
              </tr>
            </thead>
            <tbody id="my-table">
              {renderRows(sortedKeys)}
            </tbody>
          </table>
        </div>
        <div className="scroll-to-top-container">
          {isVisible && (
            <button className="scroll-to-top" onClick={scrollToTop} aria-label="Scroll to top">
              <IconUp />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
import React from 'react';
export default function RepostingStatus() {
  return (
    <div style={{
        padding: '2rem',
        fontFamily: 'sans-serif',
        color: 'white',
        backgroundColor: '#1e1e1e',
        borderRadius: '0',
        minWidth: '300px',
        maxWidth: 'none',
        maxHeight: 'none',
        width: '100%',
        boxShadow: 'none',
        overflowY: 'auto',
        boxSizing: 'border-box'
      }}>
        <div style={{ paddingBottom: "1rem", borderBottom: "1px solid #333", marginBottom: "1rem" }}>
            <h2 style={{ marginTop: 0 }}>Reposting Status</h2>
        </div>
        <div style={{ marginTop: '1rem', marginBottom: '2rem', lineHeight: '1.5' }}>
            <p>
              This is a placeholder for the <strong>Reposting Status</strong> explanation.<br/>
              Add your content here.
              Lorem ipsum dolor sit amet, consectetur adipisicing elit. Fugit, rerum, omnis debitis at eveniet, repellendus inventore iure molestiae dolorem quo dolorum!
            </p>
        </div>
      </div>
  );
}
import React from 'react';
export default function RtgsIncomingAck() {
  return (
    <div style={{
        padding: '2rem',
        fontFamily: 'sans-serif',
        color: 'white',
        backgroundColor: '#1e1e1e',
        borderRadius: '0',
        minWidth: '300px',
        maxWidth: 'none',
        maxHeight: 'none',
        width: '100%',
        boxShadow: 'none',
        overflowY: 'auto',
        boxSizing: 'border-box'
      }}>
        <div style={{ paddingBottom: "1rem", borderBottom: "1px solid #333", marginBottom: "1rem" }}>
            <h2 style={{ marginTop: 0 }}>RTGS Incoming ACK C54</h2>
        </div>
        <div style={{ marginTop: '1rem', marginBottom: '2rem', lineHeight: '1.5' }}>
            <p>
              This is a placeholder for the <strong>RTGS Incoming ACK C54</strong> explanation.<br/>
              Add your content here.
              Lorem ipsum dolor sit amet, consectetur adipisicing elit. Fugit, rerum, omnis debitis at eveniet, repellendus inventore iure molestiae dolorem quo dolorum!
            </p>
        </div>
      </div>
  );
}
import React, { Fragment } from 'react';
import './RtgsIncomingGateway.css'
import { useState, useRef, useEffect } from 'react';
import { IconCheck, IconWarning, IconError, IconLock, IconSlash, IconSnow, IconZap, IconGrid } from "../components/Icons.jsx";
function Render12Apps({ value }) {
  if (value === "0") {
    return (
      <td><IconCheck /></td>
    )
  }
  else if (value === "NA") {
    return (
      <td><span className="text-secondary">—</span></td>
    )
  }
  else return (
    <td>{value}</td>
  )
}
function PendingFiles({ value }) {
  if (value > 0) {
    return (
      <td><span className='highlight-red'>{value}</span></td>
    )
  }
  else return (
    <td>{value}</td>
  )
}
function RtgsIn({ value, i }) {
  if (value > 0 && i === 1) {
    return (
      <td><span className='laal'>{value}</span></td>
    )
  } else if (value > 0 && i === 3) {
    return (
      <td><span className='hara'>{value}</span></td>
    )
  }
  else return (
    <td><span>{value}</span></td>
  )
}
function RtgsOut({ value, i }) {
  if (value > 0 && i === 1) {
    return (
      <td><span className='laal'>{value}</span></td>
    )
  } else if (value > 0 && i === 4) {
    return (
      <td><span className='hara'>{value}</span></td>
    )
  }
  else return (
    <td><span>{value}</span></td>
  )
}
export default function RtgsIncomingGateway({ data = {} }) {
  const RtgsIncoming = data.RtgsIncoming || {};
  const RtgsOutgoing = data.RtgsOutgoing || {};
  const rtgsIncomingPend = data.rtgsIncomingPend || {};
  const rtgsOutgoingPend = data.rtgsOutgoingPend || {};
  const rtgs12Apps = data.RTGSngingGateway12Apps || {};
  const rtgsAck12Apps = data.RTGSACKngingGateway12Apps || {};
  const rtgs12appskeys = Object.keys(rtgs12Apps)
  const rtgsAck12AppsKeys = Object.keys(rtgsAck12Apps)
  const rtgsIncomingKeys = Object.keys(RtgsIncoming)
  const rtgsOutgoingKeys = Object.keys(RtgsOutgoing)
  const IncomingPendingKeys = Object.keys(rtgsIncomingPend)
  const OutgoingPendingKeys = Object.keys(rtgsOutgoingPend)
  const columns = ["M", "S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8", "S9", "S10", "S11", "S12", "S13", "S14", "S15"];
  return (
    <>
      <div className="rtgs-panel">
        <div className="rtgs-head">
          <h2> RTGS Monitoring Dashboard</h2>
        </div>
        <div className='rtgs-div1'>
          <div className='rtgs-div2'>
            <div className="card-header">
              <div className="card-title">
                <IconGrid />
                <h2>RTGS INCOMING</h2>
              </div>
            </div>
            <table>
              <thead className="branch-head">
                <tr>
                  <th>Time</th>
                  <th className="Pending">Pending</th>
                  <th className="Reversal">Reversal</th>
                  <th className="Processed">Processed</th>
                  <th className="UNPR">UNPR</th>
                </tr>
              </thead>
              <tbody>
                {rtgsIncomingKeys.length > 0 ? (
                  rtgsIncomingKeys.map((key) => {
                    const rowData = RtgsIncoming[key];
                    return (
                      <tr key={key}>
                        {Array.isArray(rowData)
                          ? rowData.map((val, i) => (
                            <RtgsIn value={val} i={i} key={i} />
                          ))
                          : null}
                      </tr>
                    );
                  })
                ) : (
                  <tr className='row'>
                    <td colSpan={14} className="text-center opacity-50">Waiting for data...</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className='rtgs-div3'>
            <div className="card-header">
              <div className="card-title">
                <IconGrid />
                <h2>RTGS OUTGOING</h2>
              </div>
            </div>
            <table>
              <thead className="branch-head">
                <tr>
                  <th>Time</th>
                  <th className="Pending">Pending</th>
                  <th className="Wait">Wait</th>
                  <th className="Return">Return</th>
                  <th className="Processed">Processed</th>
                  <th className="UNPR">UNPR</th>
                </tr>
              </thead>
              <tbody>
                {rtgsOutgoingKeys.length > 0 ? (
                  rtgsOutgoingKeys.map((key) => {
                    const rowData = RtgsOutgoing[key];
                    return (
                      <tr key={key}>
                        {Array.isArray(rowData)
                          ? rowData.map((val, i) => (
                            <RtgsOut value={val} i={i} key={i} />
                          ))
                          : null}
                      </tr>
                    );
                  })
                ) : (
                  <tr className='row'>
                    <td colSpan={14} className="text-center opacity-50">Waiting for data...</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className='rtgs-div4'>
          <div className="card-header">
            <div className="card-title">
              <IconGrid />
              <h2>RTGS PENDING FILES</h2>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>File</th>
                {IncomingPendingKeys.length > 0 && rtgsIncomingPend[IncomingPendingKeys[0]]
                  ? rtgsIncomingPend[IncomingPendingKeys[0]].map((_, i) => (
                    <th key={i}>{i === 0 ? "M" : `S${i}`}</th>
                  ))
                  : columns.map((c) => <th key={c}>{c}</th>)}
              </tr>
            </thead>
            <tbody>
              {IncomingPendingKeys.map((key) => {
                const rowIncomingData = rtgsIncomingPend[key];
                return (
                  <Fragment key={key}>
                    <tr>
                      <td>RTGS INCOMING RBI</td>
                      {Array.isArray(rowIncomingData)
                        ? rowIncomingData.map((val, i) => (
                          <PendingFiles value={val} key={i} />
                        ))
                        : null}
                    </tr>
                  </Fragment>
                );
              })}
              {OutgoingPendingKeys.map((key) => {
                const rowOutgoingData = rtgsOutgoingPend[key];
                return (
                  <Fragment key={`out-${key}`}>
                    <tr>
                      <td>RTGS OUTGOING PSG</td>
                      {Array.isArray(rowOutgoingData)
                        ? rowOutgoingData.map((val, i) => (
                          <PendingFiles value={val} key={i} />
                        ))
                        : null}
                    </tr>
                  </Fragment>
                );
              })}
              {IncomingPendingKeys.length === 0 && OutgoingPendingKeys.length === 0 && (
                <tr>
                  <td colSpan={14} className="text-center opacity-50">
                    Waiting for data...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className='rtgs-div4'>
          <div className="card-header">
            <div className="card-title">
              <IconGrid />
              <h2>GATEWAY & ACK MONITORING</h2>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>File</th>
                <th>ERROR</th>
                {columns.map((c) => <th key={c}>{c}</th>)}
              </tr>
            </thead>
            <tbody>
              {
                rtgs12appskeys.map((key) => (
                  <tr key={`gw-${key}`}>
                    <td>Gateway Monitoring</td>
                    <td>{key.toUpperCase()}</td>
                    {Array.isArray(rtgs12Apps[key])
                      ? rtgs12Apps[key].map((val, i) => (
                        <Render12Apps value={val} key={i} />
                      ))
                      : null}
                  </tr>
                ))
              }
              {
                rtgsAck12AppsKeys.map((key) => (
                  <tr key={`gw-${key}`}>
                    <td>ACK Monitoring</td>
                    <td>{key.toUpperCase()}</td>
                    {Array.isArray(rtgsAck12Apps[key])
                      ? rtgsAck12Apps[key].map((val, i) => (
                        <Render12Apps value={val} key={i} />
                      ))
                      : null}
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
import React, { Fragment } from 'react';
import './RTGSMetrics.css'
import { useState, useRef, useEffect } from 'react';
import { IconCheck, IconWarning, IconError, IconLock, IconSlash, IconSnow, IconZap, IconGrid } from "../components/Icons.jsx";
function Render12Apps({ value }) {
  if (value === "0") {
    return (
      <td><IconCheck /></td>
    )
  }
  else if (value === "NA") {
    return (
      <td><span className="text-secondary">—</span></td>
    )
  }
  else return (
    <td>{value}</td>
  )
}
function PendingFiles({ value }) {
  if (value > 0) {
    return (
      <td><span className='highlight-red'>{value}</span></td>
    )
  }
  else return (
    <td>{value}</td>
  )
}
function RtgsIn({ value, i }) {
  if (value > 0 && i === 1) {
    return (
      <td><span className='laal'>{value}</span></td>
    )
  } else if (value > 0 && i === 3) {
    return (
      <td><span className='hara'>{value}</span></td>
    )
  }
  else return (
    <td><span>{value}</span></td>
  )
}
function RtgsOut({ value, i }) {
  if (value > 0 && i === 1) {
    return (
      <td><span className='laal'>{value}</span></td>
    )
  } else if (value > 0 && i === 4) {
    return (
      <td><span className='hara'>{value}</span></td>
    )
  }
  else return (
    <td><span>{value}</span></td>
  )
}
export default function RTGSMetrics({ data = {}, lastUpdated }) {
  const RtgsIncoming = data.RtgsIncoming || {};
  const RtgsOutgoing = data.RtgsOutgoing || {};
  const rtgsIncomingPend = data.rtgsIncomingPend || {};
  const rtgsOutgoingPend = data.rtgsOutgoingPend || {};
  const rtgs12Apps = data.RTGSngingGateway12Apps || {};
  const rtgsAck12Apps = data.RTGSACKngingGateway12Apps || {};
  const rtgs12appskeys = Object.keys(rtgs12Apps)
  const rtgsAck12AppsKeys = Object.keys(rtgsAck12Apps)
  const rtgsIncomingKeys = Object.keys(RtgsIncoming)
  const rtgsOutgoingKeys = Object.keys(RtgsOutgoing)
  const IncomingPendingKeys = Object.keys(rtgsIncomingPend)
  const OutgoingPendingKeys = Object.keys(rtgsOutgoingPend)
  const columns = ["M", "S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8", "S9", "S10", "S11", "S12", "S13", "S14", "S15"];
  return (
    <div className="rgts-wrapper">
      <div className='in-out-wrapper'>
        <div className='rtgs-div2'>
          <div className="card-header">
            <div className="card-title">
              <IconGrid />
              <h2>RTGS INCOMING</h2>
            </div>
            <div className="timestamp">
              <p><span>•</span> {lastUpdated.RtgsIncoming}</p>
            </div>
          </div>
          <table>
            <thead className="branch-head">
              <tr>
                <th>Time</th>
                <th className="Pending">Pending</th>
                <th className="Reversal">Reversal</th>
                <th className="Processed">Processed</th>
                <th className="UNPR">UNPR</th>
              </tr>
            </thead>
            <tbody>
              {rtgsIncomingKeys.length > 0 ? (
                rtgsIncomingKeys.map((key) => {
                  const rowData = RtgsIncoming[key];
                  return (
                    <tr key={key}>
                      {Array.isArray(rowData)
                        ? rowData.map((val, i) => (
                          <RtgsIn value={val} i={i} key={i} />
                        ))
                        : null}
                    </tr>
                  );
                })
              ) : (
                <tr className='row'>
                  <td colSpan={14} className="text-center opacity-50">Waiting for data...</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className='rtgs-div3'>
          <div className="card-header">
            <div className="card-title">
              <IconGrid />
              <h2>RTGS OUTGOING</h2>
            </div>
            <div className="timestamp">
              <p><span>•</span> {lastUpdated.RtgsOutgoing}</p>
            </div>
          </div>
          <table>
            <thead className="branch-head">
              <tr>
                <th>Time</th>
                <th className="Pending">Pending</th>
                <th className="Wait">Wait</th>
                <th className="Return">Return</th>
                <th className="Processed">Processed</th>
                <th className="UNPR">UNPR</th>
              </tr>
            </thead>
            <tbody>
              {rtgsOutgoingKeys.length > 0 ? (
                rtgsOutgoingKeys.map((key) => {
                  const rowData = RtgsOutgoing[key];
                  return (
                    <tr key={key}>
                      {Array.isArray(rowData)
                        ? rowData.map((val, i) => (
                          <RtgsOut value={val} i={i} key={i} />
                        ))
                        : null}
                    </tr>
                  );
                })
              ) : (
                <tr className='row'>
                  <td colSpan={14} className="text-center opacity-50">Waiting for data...</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div className="pending-wrapper">
        <div className='rtgs-gateway'>
          <div className="card-header">
            <div className="card-title">
              <IconGrid />
              <h2>RTGS PENDING FILES</h2>
            </div>
            <div className="timestamp">
              <p><span>•</span> {lastUpdated.rtgsIncomingPend}</p>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>File</th>
                {IncomingPendingKeys.length > 0 && rtgsIncomingPend[IncomingPendingKeys[0]]
                  ? rtgsIncomingPend[IncomingPendingKeys[0]].map((_, i) => (
                    <th key={i}>{i === 0 ? "M" : `S${i}`}</th>
                  ))
                  : columns.map((c) => <th key={c}>{c}</th>)}
              </tr>
            </thead>
            <tbody>
              {IncomingPendingKeys.map((key) => {
                const rowIncomingData = rtgsIncomingPend[key];
                return (
                  <Fragment key={key}>
                    <tr>
                      <td>RTGS INCOMING RBI</td>
                      {Array.isArray(rowIncomingData)
                        ? rowIncomingData.map((val, i) => (
                          <PendingFiles value={val} key={i} />
                        ))
                        : null}
                    </tr>
                  </Fragment>
                );
              })}
              {OutgoingPendingKeys.map((key) => {
                const rowOutgoingData = rtgsOutgoingPend[key];
                return (
                  <Fragment key={`out-${key}`}>
                    <tr>
                      <td>RTGS OUTGOING PSG</td>
                      {Array.isArray(rowOutgoingData)
                        ? rowOutgoingData.map((val, i) => (
                          <PendingFiles value={val} key={i} />
                        ))
                        : null}
                    </tr>
                  </Fragment>
                );
              })}
              {IncomingPendingKeys.length === 0 && OutgoingPendingKeys.length === 0 && (
                <tr>
                  <td colSpan={14} className="text-center opacity-50">
                    Waiting for data...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className='rtgs-gateway error'>
          <div className="card-header">
            <div className="card-title">
              <IconGrid />
              <h2>GATEWAY & ACK MONITORING</h2>
            </div>
            <div className="timestamp">
              <p><span>•</span> {lastUpdated.RTGSngingGateway12Apps}</p>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>File</th>
                <th>ERROR</th>
                {columns.map((c) => <th key={c}>{c}</th>)}
              </tr>
            </thead>
            <tbody>
              {
                rtgs12appskeys.map((key) => (
                  <tr key={`gw-${key}`}>
                    <td>Gateway Monitoring</td>
                    <td>{key.toUpperCase()}</td>
                    {Array.isArray(rtgs12Apps[key])
                      ? rtgs12Apps[key].map((val, i) => (
                        <Render12Apps value={val} key={i} />
                      ))
                      : null}
                  </tr>
                ))
              }
              {
                rtgsAck12AppsKeys.map((key) => (
                  <tr key={`gw-${key}`}>
                    <td>ACK Monitoring</td>
                    <td>{key.toUpperCase()}</td>
                    {Array.isArray(rtgsAck12Apps[key])
                      ? rtgsAck12Apps[key].map((val, i) => (
                        <Render12Apps value={val} key={i} />
                      ))
                      : null}
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
import { IconList } from "./Icons";
import { useState, useEffect, useRef } from "react";
function getPillClass(val) {
  if (val === 0) return "text-secondary opacity-50"; // Dim zeros/nulls
  if (val > 0 && val <= 20) return "text-green font-bold";
  if (val > 20 && val <= 50) return "text-yellow font-bold";
  if (val > 50) return "text-red font-bold";
  return "";
}
function GridAnimatedCell({ value, index }) {
  const [highlight, setHighlight] = useState(false);
  const prev = useRef(value);
  useEffect(() => {
    if (prev.current !== value) {
      setHighlight(true);
      const timer = setTimeout(() => setHighlight(false), 800);
      prev.current = value;
      return () => clearTimeout(timer);
    }
  }, [value]);
  return (
    <td className={highlight ? "highlight-row" : "" }>
      <span className={getPillClass(value)}>{value}</span>
    </td>
  );
}
export default function SpaceMetrics({ data, lastUpdated }) {
  const sourceData = data || {};
  const keys = Object.keys(sourceData);
  return (
    <div className="card space" style={{ height: '100%' }}>
      <div className="card-header border-b border-[var(--border-color)] pb-4 mb-0 flex justify-between">
        <div className="card-title text-[14px]">
          <IconList />
          <h2 className="text-[14px]">SPACE UTILIZATION METRICS</h2>
        </div>
        <div className="timestamp">
          <p><span>•</span> {lastUpdated}</p>
        </div>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>SERVER</th>
              <th>Data(D)</th>
              <th>Spool(D)</th>
              <th>Sysout(D)</th>
              <th>\Tmp</th>
              <th>\home(id)</th>
              <th>Sys(C)</th>
              <th>Sys(N)</th>
              <th>Data(N)</th>
              <th>Spool(C)</th>
              <th>Ftparea</th>
              <th>/Opt</th>
              <th>/var</th>
            </tr>
          </thead>
          <tbody>
            {keys.length > 0 ? (
              keys.map((key) => {
                const rowData = sourceData[key];
                return (
                  <tr key={key}>
                    <td>{key}</td>
                    {Array.isArray(rowData)
                      ? rowData.map((val, i) => (
                        <GridAnimatedCell key={`${key}-${i}`} value={val} index={i}  />
                      ))
                      : null}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={10} className="text-center opacity-50">Waiting for data...</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
import { IconList } from "./Icons";
import './SystemContext.css'
export default function SystemContext({ data ,lastUpdated }) {
  const sourceData = data || {};
  const keys = Object.keys(sourceData);
  let maxCols = 0;
  keys.forEach(k => {
    if (sourceData[k].length > maxCols) maxCols = sourceData[k].length;
  });
  return (
    <div className="card system-context" style={{ height: '100%' }}>
      <div className="card-header border-b border-[var(--border-color)] pb-4 mb-0 flex justify-between">
        <div className="card-title text-[14px]">
          <IconList />
          <h2 className="text-[14px]">SYSTEM CONTEXT</h2>
        </div>
                <div className="timestamp">
          <p><span>•</span> {lastUpdated}</p>
        </div>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>PROPERTY</th>
              {Array.from({ length: maxCols }).map((_, i) => (
                      <th key={i}>{i === 0 ? "M" : `S${i}`}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {keys.length > 0 ? (
              keys.map((key) => {
                const rowData = sourceData[key] || [];
                return (
                  <tr key={key}>
                    <td>{key}</td>
                    {rowData.map((val, i) => (
                      <td key={i}>
                        <span className="green-system">
                          {val}
                        </span>
                      </td>
                    ))}
                    {/* Fill empty cells if row is shorter than maxCols */}
                    {Array.from({ length: maxCols - rowData.length }).map((_, i) => (
                      <td key={`empty-${i}`}>-</td>
                    ))}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={maxCols + 1} className="text-center opacity-50">Waiting for data...</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
import { IconList } from "./Icons";
import './SystemUtilization.css';
import { useState, useEffect, useRef } from "react";
const cleanVal = (val) => val ? String(val).replace(/\u0000/g, '').trim() : val;
function getBarColor(val) {
    const n = parseFloat(val);
    if (isNaN(n)) return "bg-gray-500";
    if (n >= 25.0 && n <= 34.99) return "bar-yellow";
    if (n >= 35.0 && n <= 49.99) return "bar-orange";
    if (n >= 50.0) return "bar-green";
    return "bar-red";
}
function TimeStyle({ value, i }) {
    if (i === 1) {
        return (
            <span className="time">{value === 0 ? '-' : value}</span>
        )
    }
    else {
        return (
            <span>{value === 0 ? '-' : value}</span>
        )
    }
}
function AlertColors() {
}
function GridAnimatedCell({ value, i }) {
    const clean = cleanVal(value);
    const [highlight, setHighlight] = useState(false);
    const prev = useRef(clean);
    useEffect(() => {
        if (prev.current !== clean) {
            setHighlight(true);
            const timer = setTimeout(() => setHighlight(false), 800);
            prev.current = clean;
            return () => clearTimeout(timer);
        }
    }, [clean]);
    if (i === 1) {
        return (
            <td className={highlight ? "highlight-row" : ""}>
                <span className="time">{clean === 0 ? '-' : clean}</span>
            </td>
        )
    }
    if (i === 2) {
        if (value > 2500 && value < 3000) {
            return (
                <td className={highlight ? "highlight-row" : ""}>
                    <span className="sys-orange">{clean}</span>
                </td>
            )
        }
        if (value > 3000) {
            return (
                <td className={highlight ? "highlight-row" : ""}>
                    <span className="sys-red">{clean}</span>
                </td>
            )
        }
        else{
                    return (
            <td className={highlight ? "highlight-row" : ""}>
                <span>{clean}</span>
            </td>
        )
        }
    }
    else {
        return (
            <td className={highlight ? "highlight-row" : ""}>
                <span>{clean === 0 ? '-' : clean}</span>
            </td>
        )
    }
}
export default function SystemUtilization({ data, lastUpdated }) {
    const sourceData = data || {};
    const stations = Object.keys(sourceData);
    const MAX_VAL = 100;
    return (
        <div className="card" style={{ height: '100%' }}>
            <div className="card-header border-b border-[var(--border-color)] pb-4 mb-0 flex justify-between">
                <div className="card-title text-[14px]">
                    <IconList />
                    <h2 className="text-[14px]">SYSTEM UTILIZATION</h2>
                </div>
                <div className="timestamp">
                    <p><span>•</span> {lastUpdated}</p>
                </div>
            </div>
            <div className=" sysut">
                <table >
                    <thead>
                        <tr>
                            {/* <th>#</th> */}
                            <th>SERVER</th>
                            <th>TIME</th>
                            <th>TOTAL PROCESS</th>
                            <th>ZOMBIES</th>
                            <th>IDLE%</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stations.length > 0 ? (
                            stations.map((key) => {
                                const rowData = sourceData[key];
                                if (!Array.isArray(rowData)) return null;
                                const idleValue = cleanVal(rowData[rowData.length - 1]);
                                const idleNum = parseFloat(idleValue);
                                const barWidth = isNaN(idleNum) ? 0 : Math.min((idleNum / MAX_VAL) * 100, 100);
                                const barColor = getBarColor(idleNum);
                                return (
                                    <tr key={key}>
                                        {rowData.slice(0, -1).map((val, i) => (
                                            <GridAnimatedCell value={cleanVal(val)} i={i} key={i} />
                                        ))}
                                        <td className="sysutil-bar-row">
                                            <div className="bar-container">
                                                <div className="bar-track">
                                                    <div
                                                        className={`bar-fill ${barColor}`}
                                                        style={{ width: `${barWidth}%` }}
                                                    />
                                                </div>
                                                <span className="bar-label">
                                                    {idleValue === 0 ? '-' : idleValue}%
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={6} className="text-center opacity-50">Waiting for data...</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
import React from 'react';
export default function TellerLoggedIn() {
  return (
    <div style={{
        padding: '2rem',
        fontFamily: 'sans-serif',
        color: 'white',
        backgroundColor: '#1e1e1e',
        borderRadius: '0',
        minWidth: '300px',
        maxWidth: 'none',
        maxHeight: 'none',
        width: '100%',
        boxShadow: 'none',
        overflowY: 'auto',
        boxSizing: 'border-box'
      }}>
        <div style={{ paddingBottom: "1rem", borderBottom: "1px solid #333", marginBottom: "1rem" }}>
            <h2 style={{ marginTop: 0 }}>Teller Logged In</h2>
        </div>
        <div style={{ marginTop: '1rem', marginBottom: '2rem', lineHeight: '1.5' }}>
            <p>
              This is a placeholder for the <strong>Teller Logged In</strong> explanation.<br/>
              Add your content here.
              Lr sit amet, consectetur adipisicing elit. Fugit, rerum, omnis debitis at eveniet, repellendus inventore iure molestiae dolorem quo dolorum!
            </p>
        </div>
      </div>
  );
}
import React, { useState, useEffect, useRef } from "react";
// 1. Point directly to the specific source URL
const SOURCE_URL = "http://localhost:8080/events/jobs";
const TARGET_SOURCE = "jobs"; // Just for labeling your state
function Test() {
  const [data, setData] = useState({});
  const [status, setStatus] = useState("disconnected");
  const reconnectTimer = useRef(null);
  const applyDelta = (source, delta) => {
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
  const connectToStream = (retry = 0) => {
    setStatus("connecting");
    // 2. Connect ONLY to the jobs URL
    const es = new EventSource(SOURCE_URL);
    console.log(es)
    es.onopen = () => {
      setStatus("connected");
    };
    es.onerror = () => {
      es.close();
      setStatus("disconnected");
      const timeout = Math.min(5000, 1000 * (retry + 1));
      reconnectTimer.current = setTimeout(() => {
        connectToStream(retry + 1);
      }, timeout);
    };
    es.onmessage = (e) => {
      try {
        const { type, payload } = JSON.parse(e.data);
        if (type === "snapshot") {
          setData((prev) => ({
            ...prev,
            [TARGET_SOURCE]: payload,
          }));
        } else if (type === "delta") {
          applyDelta(TARGET_SOURCE, payload);
        }
      } catch (err) {
        console.error(`Error parsing message from ${SOURCE_URL}:`, err);
      }
    };
    return es;
  };
  useEffect(() => {
    const es = connectToStream();
    return () => {
      es.close();
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current);
      }
    };
  }, []);
  console.log(data || {})
  return (
    <div>
      <h1>Listening to: {TARGET_SOURCE}</h1>
      <p>URL: {SOURCE_URL}</p>
      <p>Status: {status}</p>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
export default Test;
import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './TopNavBar.css';
import { IconCalendar } from "./Icons";
export default function TopNavBar({ branchCount = "0", tellerCount = "0", repostingCount = "0", neftInvalidDay = "0", neftInvalidNight = "0", MFLAGS_D }) {
  const [marketDate, setMarketDate] = React.useState("2025-11-17");
  const navigate = useNavigate();
  const location = useLocation();
  const formattedMarketDate = marketDate.replace(/-/g, "");
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);
  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };
  return (
    <div className="top-navbar-container">
      {/* Top Tabs Row */}
      <div className="top-nav-tabs-row">
        <div className="tabs-left">
          <div className="logo-container">
            {/* <img src={logo} alt="Company Logo" className="nav-logo" /> */}
          </div>
          <div className={`tab ${location.pathname === '/' ? 'active' : ''}`} onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>Dashboard</div>
          <div className={`tab ${location.pathname === '/night' ? 'active' : ''}`} onClick={() => navigate('/night', { state: { isNightActive: true } })} style={{ cursor: 'pointer' }}>Night Region</div>
          {/* <div className="tab">We Are in PR</div> */}
          {/* <div className="tab">Enquiry In DR</div> */}
          {location.pathname !== '/night' && (<div className={`tab ${location.pathname === '/cbs-flow' ? 'active' : ''}`} onClick={() => navigate('/cbs-flow')} style={{ cursor: 'pointer' }}>CBS Flow</div>)}
          <div className={`tab ${location.pathname === '/legend' ? 'active' : ''}`} onClick={() => navigate('/legend')} style={{ cursor: 'pointer' }}>Legends</div>
          {location.pathname !== '/night' && (<div className={`tab ${location.pathname === '/neft-invalid' ? 'active' : ''}`} onClick={() => navigate('/neft-invalid')} style={{ cursor: 'pointer' }}><span className="text-red">NEFT Invalid (D/N): <strong>{neftInvalidDay}/{neftInvalidNight}</strong></span>
          </div>)}
          {location.pathname !== '/night' && (<div className={`tab ${location.pathname === '/repost-fail' ? 'active' : ''}`} onClick={() => navigate('/repost-fail')} style={{ cursor: 'pointer' }}><span className="text-orange">Repost Fail: <strong>{repostingCount}</strong></span></div>)}
          {location.pathname !== '/night' && (<div className={`tab ${location.pathname === '/rtgs-incoming-gateway' ? 'active' : ''}`} onClick={() => navigate('/rtgs-incoming-gateway')} style={{ cursor: 'pointer' }}>RTGS INCOMING GATEWAY</div>)}
        </div>
        <div className="tabs-right">
          <div className="branch-log">
            {location.pathname !== '/night' && (<div className={`badge dark ${location.pathname === '/branch-logged-in' ? 'active' : ''}`} onClick={() => navigate('/branch-logged-in')} style={{ cursor: 'pointer' }} className="teller branch">
              <div className="circle"><div className="circle2"></div></div>
              <div className="inner-teller">
                <span className='flag-label'>Branch logged in</span>
                <strong className="flag-count">{branchCount}</strong>
              </div>
            </div>)}
          </div>
          <div className="teller-log">
            {location.pathname !== '/night' && (
              <div className="teller">
                <div className="circle"><div className="circle2"></div></div>
                <div className="inner-teller">
                  <span className='flag-label'>Teller logged in</span>
                  <strong className="flag-count">{tellerCount}</strong>
                </div>
              </div>
            )}
          </div>
          <div className="date-picker-wrapper">
            <label htmlFor="market-date-picker" className="change-date-btn">
              <IconCalendar /> <div className="market-flag"><span className="flag-label">Change Date</span>
                <span className="flag-date">{MFLAGS_D}</span></div>
            </label>
            <input
              type="date"
              id="market-date-picker"
              className="hidden-date-input"
              value={marketDate}
              onChange={(e) => setMarketDate(e.target.value)}
            />
          </div>
          <button
            className="app-nav-btn"
            onClick={toggleTheme}
            title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {theme === 'dark' ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
        </div>
      </div>
      {/* Metric Badges / Buttons Rows */}
      {/* <div className="metrics-badges-container"> */}
        {/* <div className="badges-row"> */}
          {/* {location.pathname !== '/night' && (<div className={`badge dark ${location.pathname === '/branch-logged-in' ? 'active' : ''}`} onClick={() => navigate('/branch-logged-in')} style={{ cursor: 'pointer' }}>Branch logged in: <strong>{branchCount}</strong></div>)} */}
          {/* {location.pathname !== '/night' && (<div className={`badge dark border-right ${location.pathname === '/teller-logged-in' ? 'active' : ''}`} onClick={() => navigate('/teller-logged-in')} style={{ cursor: 'pointer' }}>Teller logged in: <strong>{tellerCount}</strong></div>)} */}
          {/* {location.pathname !== '/night' && (<div className={`badge light ${location.pathname === '/txn-desc' ? 'active' : ''}`} onClick={() => navigate('/txn-desc')} style={{ cursor: 'pointer' }}>TXN DESC</div>)} */}
          {/* {location.pathname !== '/night' && (<div className={`badge light ${location.pathname === '/all-files' ? 'active' : ''}`} onClick={() => navigate('/all-files')} style={{ cursor: 'pointer' }}>ALL FILES</div>)} */}
          {/* {location.pathname !== '/night' && (<div className={`badge light ${location.pathname === '/upi-mr' ? 'active' : ''}`} onClick={() => navigate('/upi-mr')} style={{ cursor: 'pointer' }}>UPI(MR)</div>)} */}
          {/* {location.pathname !== '/night' && (<div className={`badge light outline-red outline ${location.pathname === '/neft-invalid' ? 'active' : ''}`} onClick={() => navigate('/neft-invalid')} style={{ cursor: 'pointer' }}><span className="text-red">NEFT Invalid (D/N): <strong>{neftInvalidDay}/{neftInvalidNight}</strong></span></div>)} */}
          {/* {location.pathname !== '/night' && (<div className={`badge light ${location.pathname === '/NEFT' ? 'active' : ''}`} onClick={() => navigate('/NEFT')} style={{ cursor: 'pointer' }}>NEFT INVALID</div>)} */}
          {/* <div className={`badge light ${location.pathname === '/reposting-status' ? 'active' : ''}`} onClick={() => navigate('/reposting-status')} style={{ cursor: 'pointer' }}>REPOSTING STATUS</div> */}
          {/* {location.pathname !== '/night' && (<div className={`badge light outline-orange outline ${location.pathname === '/repost-fail' ? 'active' : ''}`} onClick={() => navigate('/repost-fail')} style={{ cursor: 'pointer' }}><span className="text-orange">Repost Fail: <strong>{repostingCount}</strong></span></div>)} */}
          {/* {location.pathname !== '/night' && (<div className={`badge light ${location.pathname === '/rtgs-incoming-gateway' ? 'active' : ''}`} onClick={() => navigate('/rtgs-incoming-gateway')} style={{ cursor: 'pointer' }}>RTGS INCOMING GATEWAY</div>)} */}
          {/* <div className={`badge light ${location.pathname === '/rtgs-incoming-ack' ? 'active' : ''}`} onClick={() => navigate('/rtgs-incoming-ack')} style={{ cursor: 'pointer' }}>RTGS INCOMING ACK C54</div> */}
        {/* </div> */}
      {/* </div> */}
    </div>
  );
}
// import { IconList } from "./Icons";
import React, { useEffect, useState } from "react";
import { IconList, IconThumbDown, IconCross } from "./Icons";
import TrickleSummary from "../blocks/TrickleSummary"
export default function TrickleMetrics({ data, lastUpdated }) {
    const sourceData = data || {};
    const keys = Object.keys(sourceData);
    const [showPopup, setShowPopup] = useState(false);
    const renderHeaders = () => {
        if (keys.length === 0 || !sourceData[keys[0]] || !Array.isArray(sourceData[keys[0]])) {
            return <th>APP</th>;
        }
        return sourceData[keys[0]].map((_, index) => (
            <th key={index} colSpan="2" className="text-center">
                {`APP ${index + 1}`}
                <div className="flex">
                    <th className="sub-header pill pill-yellow">proc</th>
                    <th className="sub-header">pen</th>
                </div>
            </th>
        ));
    };
    const renderRows = () => {
        // Create a new keys array with the last key duplicated at the start
        const orderedKeys = [...keys];
        if (keys.length > 0) {
            const lastKey = keys[keys.length - 1];
            orderedKeys.unshift(lastKey);
        }
        return orderedKeys.map((key, index) => {
            const values = sourceData[key];
            const pairs = [];
            for (let i = 0; i < values.length; i += 2) {
                pairs.push({
                    proc: values[i],
                    pen: values[i + 1] !== undefined ? values[i + 1] : ''
                });
            }
            return (
                <tr key={`${key}-${index}`}>
                    <td>{key}</td>
                    {pairs.map((pair, i) => (
                        <React.Fragment key={i}>
                            <td>
                                <span className={pair.proc > 0 ? 'pill-trickle-green' : 'pill-zero'}>{pair.proc}</span>
                            </td>
                            <td>
                                <span className={pair.pen > 0 ? 'pill-trickle-red' : 'pill-zero'}>{pair.pen}</span>
                            </td>
                        </React.Fragment>
                    ))}
                </tr>
            );
        });
    };
    return (
        <div className="card trickle" style={{ overflow: 'auto' }}>
            <div className="card-header">
                <div className="card-title text-[14px]">
                    <IconList />
                    <h2 className="text-[14px]">TRICKLE FEED METRICS</h2>
                </div>
                <div className="trickle-right">
                    <button onClick={() => {
                        setShowPopup(true);
                        // setQueue(key);
                    }} >trickle feed summary</button>
                    <div className="timestamp">
                        <p><span>•</span> {lastUpdated}</p>
                    </div>
                </div>
            </div>
            {showPopup && (
                <div className="popup-overlay popup-trickle" onClick={() => setShowPopup(false)}>
                    <div className="popup-content" onClick={(e) => e.stopPropagation()}>
                        <TrickleSummary />
                        <button className="close-button" onClick={() => setShowPopup(false)}><IconCross /></button>
                    </div>
                </div>
            )}
            <div className="trickle-table">
                <table>
                    <thead>
                        <tr>
                            <th rowSpan="2">File Type</th>
                            {keys.length > 0 && sourceData[keys[0]] && Array.isArray(sourceData[keys[0]]) &&
                                Array.from({ length: Math.ceil(sourceData[keys[0]].length / 2) }).map((_, appIndex) => (
                                    <th key={appIndex} colSpan="2" className="text-center">{`APP ${appIndex + 1}`}</th>
                                ))
                            }
                        </tr>
                        <tr>
                            {keys.length > 0 && sourceData[keys[0]] && Array.isArray(sourceData[keys[0]]) &&
                                Array.from({ length: Math.ceil(sourceData[keys[0]].length / 2) }).map((_, appIndex) => (
                                    <React.Fragment key={appIndex}>
                                        <th className="pill-green">proc</th>
                                        <th className="pill-darkred">pen</th>
                                    </React.Fragment>
                                ))
                            }
                        </tr>
                    </thead>
                    <tbody>
                        {keys.length > 0 ? (
                            renderRows()
                        ) : (
                            <tr>
                                <td colSpan="15" className="text-center opacity-50">
                                    Waiting for data...
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
import { useEffect, useState } from 'react';
import './TrickleSummary.css'
export default function TrickleSummary() {
    const [trickleSumm, setTrickleSumm] = useState(null);
    const [loading, setLoading] = useState(true);
    const rows = Array.from({ length: 16 }, (_, i) => i === 0 ? "MASTER" : `SLAVE ${i}`);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/trickle-summ');
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();
                setTrickleSumm(data);
            } catch (error) {
                console.error('POST request failed:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);
    const dataEntries = trickleSumm?.data || {};
    const countkey = Object.keys(trickleSumm?.data || {});
    const alldataEntries = trickleSumm?.data2 || {};
    const allkeys = Object.keys(trickleSumm?.data2 || {});
    const table3 = trickleSumm?.data3 || {};
    const table3keys = Object.keys(trickleSumm?.data3 || {});
    console.log(alldataEntries)
    if (dataEntries.length === 0) {
        return <div>No data found</div>;
    }
    return (
        <div className="trickle-summary-wrapper">
            <div className="sum-head">
                <h1>Trickle Feed Summary</h1>
            </div>
            <div className="summary-table-wrapper">
                <div className="table1">
                    <h1>New Architecture Count File Type Wise TF Summary</h1>
                    <table className='table-wrap'>
                        <thead>
                            <tr>
                                <th>File Type</th>
                                <th>Total files Processed</th>
                            </tr>
                        </thead>
                        <tbody>
                            {countkey.map((key) => {
                                return (
                                    <tr key={key}>
                                        <td>{key}</td>
                                        <td>{dataEntries[key]}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                <div className="table2">
                    <h1>New Architecture File Type Wise Trickle Feed Summary</h1>
                    <table className='table-wrap'>
                        <thead>
                            <tr>
                                <th>Table ID</th>
                                <th>File Type</th>
                                <th>Total files Processed</th>
                                <th>Total Records</th>
                                <th>Processed Max Records In A Fill</th>
                                <th>Min Records In A File</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allkeys.map((key) => {
                                const rowData = alldataEntries[key];
                                return (
                                    <tr key={key}>
                                        {Array.isArray(rowData) ? rowData.slice(0, -1).map((val, i) => (
                                            <td>{val}</td>
                                        )) : null}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                <div className="table3">
                    <h1>New Architecture File Type Wise Trickle Feed Summary</h1>
                    <table className='table-wrap'>
                        <thead>
                            <tr>
                                <th>Server Name</th>
                                <th>Total files Processed</th>
                                <th>Total Records</th>
                            </tr>
                        </thead>
                        <tbody>
                            {table3keys.map((key) => {
                                const rowData = table3[key];
                                return (
                                    <tr key={key}>
                                        <td>{key}</td>
                                        {Array.isArray(rowData)
                                            ? rowData.map((val, i) => (
                                                <td>{val}</td>
                                            ))
                                            : null}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
import React from 'react';
export default function TxnDesc() {
  return (
    <div style={{
        padding: '2rem',
        fontFamily: 'sans-serif',
        color: 'white',
        backgroundColor: '#1e1e1e',
        borderRadius: '0',
        minWidth: '300px',
        maxWidth: 'none',
        maxHeight: 'none',
        width: '100%',
        boxShadow: 'none',
        overflowY: 'auto',
        boxSizing: 'border-box'
      }}>
        <div style={{ paddingBottom: "1rem", borderBottom: "1px solid #333", marginBottom: "1rem" }}>
            <h2 style={{ marginTop: 0 }}>TXN DESC</h2>
        </div>
        <div style={{ marginTop: '1rem', marginBottom: '2rem', lineHeight: '1.5' }}>
            <p>
              This is a placeholder for the <strong>TXN DESC</strong> explanation.<br/>
              Add your content here.
              Lorem ipsum dolor sit amet, consectetur adipisicing elit. Fugit, rerum, omnis debitis at eveniet, repellendus inventore iure molestiae dolorem quo dolorum!
            </p>
        </div>
      </div>
  );
}
import React from "react";
import { useState, useEffect } from 'react';
// import "./UpiMr.css";
export default function UpiMr({ data = {} }) {
  const sourceData = data.UpiMrMax || {};
  console.log(sourceData)
  const dataKeys = sourceData ? Object.keys(sourceData) : [];
  return (
    <div className="container">
      <div className="main-card">
        <div className="main-content">
          <h1 className="main-title">UPI(MR) Max Connection Status for {dataKeys ? dataKeys.length : 0} APPS</h1>
          <div className="stats">
            <div className="stat-item">
              <p className="label">ACTIVE APPS</p>
              <h3>{dataKeys && dataKeys.length > 0 ? dataKeys.length : "No data available"}</h3>
            </div>
          </div>
        </div>
      </div>
      <div className="cluster-header">
        <h3>Clusters Status</h3>
      </div>
      <div className="grid">
        {dataKeys.length > 0 ? (
          dataKeys.map((key, index) => {
            const match = key.match(/\d+/);
            const appNumber = match ? match[0] : index + 1;
            const value = sourceData[key];
            return (
              <div key={key} className="card1">
                <div className="card-top">
                  <div className="card-info">
                    <p className="node-text">
                      Server-APP Number {String(appNumber).padStart(2, "0")}
                    </p>
                    <h3>{key}</h3>
                  </div>
                </div>
                <div className="card-body">
                  <div className="conn">
                    <span>{value} </span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center opacity-50" style={{ gridColumn: '1 / -1' }}>
            Waiting for data...
          </div>
        )}
      </div>
    </div>
  );
}
