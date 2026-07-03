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
