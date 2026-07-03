import React, { useState, useEffect, useRef } from "react";
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
const GridAnimatedCell = React.memo(function GridAnimatedCell({ jobName, value,index }) {
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
});
function BatchUploads({ data , lastUpdated}) {
  const sourceData = data || {};
  const keys = Object.keys(sourceData);
  let maxCols = 0;
  keys.forEach(k => {
    if (Array.isArray(sourceData[k]) && sourceData[k].length > maxCols) maxCols = sourceData[k].length;
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
export default React.memo(BatchUploads);
