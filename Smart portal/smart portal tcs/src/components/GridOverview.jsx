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
