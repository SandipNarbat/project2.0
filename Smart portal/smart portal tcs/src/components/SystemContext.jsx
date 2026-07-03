import { IconList } from "./Icons";
import './SystemContext.css'
function SystemContext({ data ,lastUpdated }) {
  const sourceData = data || {};
  const keys = Object.keys(sourceData);
  let maxCols = 0;
  keys.forEach(k => {
    if (Array.isArray(sourceData[k]) && sourceData[k].length > maxCols) maxCols = sourceData[k].length;
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
export default React.memo(SystemContext);
