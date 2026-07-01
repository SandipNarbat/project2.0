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
                queueKeys.map((key) => {
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
