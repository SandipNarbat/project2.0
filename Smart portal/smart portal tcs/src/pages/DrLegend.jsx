import { useState, useEffect, useRef } from "react";
import { IconList, IconThumbDown } from "../components/Icons";
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
export default function DrLegend({ drdata }) {
    const sourceData = drdata || {};
    const queueKeys = Object.keys(sourceData)
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="legendcard">
                <div className="card-header border-b border-[var(--border-color)] pb-4 mb-0 flex justify-between">
                    <div className="card-title text-[14px]">
                        <h2 className="text-[14px]">DR Servers</h2>
                    </div>
                    <div className="flex items-center gap-6 text-[12px] font-semibold text-secondary" style={{ display: 'flex', alignItems: 'center', gap: '24px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    </div>
                </div>
                <div className="legend-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Hostname</th>
                                <th>DQP Type</th>
                                <th>Logical IP</th>
                                <th>S No</th>
                                <th>Physical IP</th>
                                <th>Back Haul IO IP</th>
                            </tr>
                        </thead>
                        <tbody>
                            {queueKeys.length > 0 ? (
                                queueKeys.map((key) => {
                                    const rowData = sourceData[key];
                                    return (
                                        <tr key={key}>
                                            <td>{key.toUpperCase()}</td>
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
                </div>
            </div>
        </div>
    );
}
