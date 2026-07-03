import { IconList } from "./Icons";
import './SystemUtilization.css';
import { useState, useEffect, useRef } from "react";
const cleanVal = (val) => val ? String(val).replace(/\u0000/g, '').trim() : val;
function getBarColor(val) {
    const n = parseFloat(val);
    if (isNaN(n)) return "bg-gray-500";
    if (n >= 25.0 && n <= 34.99) return "bar-yellow";
    if (n >= 35.0 && n <= 49.99) return "bar-orange";
    if (n >= 50.0) return "bar-green";
    return "bar-red";
}
function TimeStyle({ value, i }) {
    if (i === 1) {
        return (
            <span className="time">{value === 0 ? '-' : value}</span>
        )
    }
    else {
        return (
            <span>{value === 0 ? '-' : value}</span>
        )
    }
}
function AlertColors() {
}
function GridAnimatedCell({ value, i }) {
    const clean = cleanVal(value);
    const [highlight, setHighlight] = useState(false);
    const prev = useRef(clean);
    useEffect(() => {
        if (prev.current !== clean) {
            setHighlight(true);
            const timer = setTimeout(() => setHighlight(false), 800);
            prev.current = clean;
            return () => clearTimeout(timer);
        }
    }, [clean]);
    if (i === 1) {
        return (
            <td className={highlight ? "highlight-row" : ""}>
                <span className="time">{clean === 0 ? '-' : clean}</span>
            </td>
        )
    }
    if (i === 2) {
        if (value > 2500 && value < 3000) {
            return (
                <td className={highlight ? "highlight-row" : ""}>
                    <span className="sys-orange">{clean}</span>
                </td>
            )
        }
        if (value > 3000) {
            return (
                <td className={highlight ? "highlight-row" : ""}>
                    <span className="sys-red">{clean}</span>
                </td>
            )
        }
        else{
                    return (
            <td className={highlight ? "highlight-row" : ""}>
                <span>{clean}</span>
            </td>
        )
        }
    }
    else {
        return (
            <td className={highlight ? "highlight-row" : ""}>
                <span>{clean === 0 ? '-' : clean}</span>
            </td>
        )
    }
}
export default function SystemUtilization({ data, lastUpdated }) {
    const sourceData = data || {};
    const stations = Object.keys(sourceData);
    const MAX_VAL = 100;
    return (
        <div className="card" style={{ height: '100%' }}>
            <div className="card-header border-b border-[var(--border-color)] pb-4 mb-0 flex justify-between">
                <div className="card-title text-[14px]">
                    <IconList />
                    <h2 className="text-[14px]">SYSTEM UTILIZATION</h2>
                </div>
                <div className="timestamp">
                    <p><span>•</span> {lastUpdated}</p>
                </div>
            </div>
            <div className=" sysut">
                <table >
                    <thead>
                        <tr>
                            {/* <th>#</th> */}
                            <th>SERVER</th>
                            <th>TIME</th>
                            <th>TOTAL PROCESS</th>
                            <th>ZOMBIES</th>
                            <th>IDLE%</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stations.length > 0 ? (
                            stations.map((key) => {
                                const rowData = sourceData[key];
                                if (!Array.isArray(rowData)) return null;
                                const idleValue = cleanVal(rowData[rowData.length - 1]);
                                const idleNum = parseFloat(idleValue);
                                const barWidth = isNaN(idleNum) ? 0 : Math.min((idleNum / MAX_VAL) * 100, 100);
                                const barColor = getBarColor(idleNum);
                                return (
                                    <tr key={key}>
                                        {rowData.slice(0, -1).map((val, i) => (
                                            <GridAnimatedCell value={cleanVal(val)} i={i} key={i} />
                                        ))}
                                        <td className="sysutil-bar-row">
                                            <div className="bar-container">
                                                <div className="bar-track">
                                                    <div
                                                        className={`bar-fill ${barColor}`}
                                                        style={{ width: `${barWidth}%` }}
                                                    />
                                                </div>
                                                <span className="bar-label">
                                                    {idleValue === 0 ? '-' : idleValue}%
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={6} className="text-center opacity-50">Waiting for data...</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
