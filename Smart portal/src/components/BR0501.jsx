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
