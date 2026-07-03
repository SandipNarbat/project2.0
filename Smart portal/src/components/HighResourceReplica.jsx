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
