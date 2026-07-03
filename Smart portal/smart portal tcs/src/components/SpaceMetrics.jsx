import { IconList } from "./Icons";
import React, { useState, useEffect, useRef } from "react";
function getPillClass(val) {
  if (val === 0) return "text-secondary opacity-50"; // Dim zeros/nulls
  if (val > 0 && val <= 20) return "text-green font-bold";
  if (val > 20 && val <= 50) return "text-yellow font-bold";
  if (val > 50) return "text-red font-bold";
  return "";
}
const GridAnimatedCell = React.memo(function GridAnimatedCell({ value, index }) {
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
});
function SpaceMetrics({ data, lastUpdated }) {
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
export default React.memo(SpaceMetrics);
