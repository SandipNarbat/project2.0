import { IconList } from "./Icons";
import './SystemContext.css'
function Conditioning({ val, i, job }) {
  if (job === "L.Update") {
    return (
      <td key={i}>
        <span className="time">{val}</span>
      </td>
    )
  }if (job === 'Pending' && val > 99){
      return (
    <td key={i}>
      <span className="pill pill-red">{val}</span>
    </td>
  )
  }
  return (
    <td key={i}>
      <span>{val}</span>
    </td>
  )
}
function OcrNeft({ data, lastUpdated }) {
  const sourceData = data || {};
  const keys = Object.keys(sourceData);
  let maxCols = 0;
  keys.forEach(k => {
    if (Array.isArray(sourceData[k]) && sourceData[k].length > maxCols) maxCols = sourceData[k].length;
  });
  return (
    <div className="ocr-neft" style={{ height: '100%' }}>
      <div className="card-header border-b border-[var(--border-color)] pb-4 mb-0 flex justify-between">
        <div className="card-title text-[14px]">
          <IconList />
          <h2 className="text-[14px]">OCR and NEFT (OUTGOING) / OCR_NEFT Summary</h2>
        </div>
        <div className="timestamp">
          <p><span>•</span> {lastUpdated}</p>
        </div>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th></th>
              <th>OCR</th>
              <th colSpan={16}>NEFT</th>
            </tr>
            <tr>
              <th>STATUS</th>
              <th>Table Count</th>
              {Array.from({ length: maxCols - 1 }).map((_, i) => (
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
                    {(Array.isArray(rowData) ? rowData : []).map((val, i) => (
                      <Conditioning val={val} i={i} job={key} key={i} />
                    ))}
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
export default React.memo(OcrNeft);
