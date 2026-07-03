import React, { useState, useEffect, useRef } from "react";
import { IconCheck, IconWarning, IconError, IconLock, IconSlash, IconSnow, IconZap, IconGrid } from "./Icons";
import './MqStatus.css'
const GridAnimatedCell = React.memo(function GridAnimatedCell({ value, i }) {
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
});
function MiscTransactionCount({ data, lastUpdated, neftCount }) {
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
export default React.memo(MiscTransactionCount);
