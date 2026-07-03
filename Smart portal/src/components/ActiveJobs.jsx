import { useState, useEffect, useRef } from "react";
import { IconCheck, IconWarning, IconError, IconLock, IconSlash, IconSnow, IconZap, IconGrid, IconCross } from "./Icons";
import './ActiveJobs.css'
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
            <span>{value}</span>
        </td>
    );
}
const list = {
    0: "M",
    1: "S1",
    2: "S2",
    3: "S3",
    4: "S4",
    5: "S5",
    6: "S6",
    7: "S7",
    8: "S8",
    9: "S9",
    10: "S10",
    11: "S11",
    12: "S12",
    13: "S13",
    14: "S14",
    15: "S15",
}
export default function ActiveJobs({ data, lastUpdated }) {
    const sourceDataM = data.activeJobM || {};
    const sourceDataS1 = data.activeJobS1 || {};
    const jobKeys = Object.keys(sourceDataM);
    const activeJob = [sourceDataM, sourceDataS1, sourceDataM, sourceDataS1, sourceDataM, sourceDataS1, sourceDataM, sourceDataS1, sourceDataM, sourceDataS1, sourceDataM, sourceDataS1, sourceDataM, sourceDataS1, sourceDataM, sourceDataS1]
    return (
        <div className="active-job-block">
            {activeJob.map((val, i) => {
                const sourceData = val || {};
                const jobKeys = Object.keys(val);
                return (
                    <div className="active-jobs" key={i}>
                        <div className="card-header">
                            <div className="active-jobs-card-title">
                                {/* <IconGrid /> */}
                                <h2>{`${list[i]} Active Jobs`}</h2>
                            </div>
                            <div className="timestamp">
                                <p><span>•</span> {lastUpdated.activeJobM}</p>
                            </div>
                        </div>
                        <div className="table-wrap">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Server</th>
                                        <th>No of Stream</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {jobKeys.length > 0 ? (
                                        jobKeys.map((key) => {
                                            return (
                                                <tr key={key}>
                                                    <td>{key}</td>
                                                    <td>{sourceData[key]}</td>
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
                )
            })}
        </div>
    );
}
