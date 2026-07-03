import React, { useState, useEffect, useRef } from "react";
import { IconList, IconThumbDown, IconCross } from "./Icons";
// import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import QueueReplica from "../blocks/QueueReplica";
function getPillClass(val) {
  if (val === 0) return "pill pill-zero";
  if (val <= 99) return "pill pill-yellow";
  if (val <= 499) return "pill pill-orange";
  return "pill pill-red";
}
const QueueAnimatedCell = React.memo(function QueueAnimatedCell({ value }) {
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
});
function BR0501({ data, lastUpdated }) {
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
export default React.memo(BR0501);
