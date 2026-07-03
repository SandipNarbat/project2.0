import React, { useEffect, useState } from "react";
import { IconList, IconThumbDown, IconCross } from "./Icons";
import TrickleSummary from "../blocks/TrickleSummary"
export default function TrickleMetrics({ data, lastUpdated }) {
    const sourceData = data || {};
    const keys = Object.keys(sourceData);
    const [showPopup, setShowPopup] = useState(false);
    const renderHeaders = () => {
        if (keys.length === 0 || !sourceData[keys[0]] || !Array.isArray(sourceData[keys[0]])) {
            return <th>APP</th>;
        }
        return sourceData[keys[0]].map((_, index) => (
            <th key={index} colSpan="2" className="text-center">
                {`APP ${index + 1}`}
                <div className="flex">
                    <th className="sub-header pill pill-yellow">proc</th>
                    <th className="sub-header">pen</th>
                </div>
            </th>
        ));
    };
    const renderRows = () => {
        // Create a new keys array with the last key duplicated at the start
        const orderedKeys = [...keys];
        if (keys.length > 0) {
            const lastKey = keys[keys.length - 1];
            orderedKeys.unshift(lastKey);
        }
        return orderedKeys.map((key, index) => {
            const values = sourceData[key];
            const pairs = [];
            for (let i = 0; i < values.length; i += 2) {
                pairs.push({
                    proc: values[i],
                    pen: values[i + 1] !== undefined ? values[i + 1] : ''
                });
            }
            return (
                <tr key={`${key}-${index}`}>
                    <td>{key}</td>
                    {pairs.map((pair, i) => (
                        <React.Fragment key={i}>
                            <td>
                                <span className={pair.proc > 0 ? 'pill-trickle-green' : 'pill-zero'}>{pair.proc}</span>
                            </td>
                            <td>
                                <span className={pair.pen > 0 ? 'pill-trickle-red' : 'pill-zero'}>{pair.pen}</span>
                            </td>
                        </React.Fragment>
                    ))}
                </tr>
            );
        });
    };
    return (
        <div className="card trickle" style={{ overflow: 'auto' }}>
            <div className="card-header">
                <div className="card-title text-[14px]">
                    <IconList />
                    <h2 className="text-[14px]">TRICKLE FEED METRICS</h2>
                </div>
                <div className="trickle-right">
                    <button onClick={() => {
                        setShowPopup(true);
                        // setQueue(key);
                    }} >trickle feed summary</button>
                    <div className="timestamp">
                        <p><span>•</span> {lastUpdated}</p>
                    </div>
                </div>
            </div>
            {showPopup && (
                <div className="popup-overlay popup-trickle" onClick={() => setShowPopup(false)}>
                    <div className="popup-content" onClick={(e) => e.stopPropagation()}>
                        <TrickleSummary />
                        <button className="close-button" onClick={() => setShowPopup(false)}><IconCross /></button>
                    </div>
                </div>
            )}
            <div className="trickle-table">
                <table>
                    <thead>
                        <tr>
                            <th rowSpan="2">File Type</th>
                            {keys.length > 0 && sourceData[keys[0]] && Array.isArray(sourceData[keys[0]]) &&
                                Array.from({ length: Math.ceil(sourceData[keys[0]].length / 2) }).map((_, appIndex) => (
                                    <th key={appIndex} colSpan="2" className="text-center">{`APP ${appIndex + 1}`}</th>
                                ))
                            }
                        </tr>
                        <tr>
                            {keys.length > 0 && sourceData[keys[0]] && Array.isArray(sourceData[keys[0]]) &&
                                Array.from({ length: Math.ceil(sourceData[keys[0]].length / 2) }).map((_, appIndex) => (
                                    <React.Fragment key={appIndex}>
                                        <th className="pill-green">proc</th>
                                        <th className="pill-darkred">pen</th>
                                    </React.Fragment>
                                ))
                            }
                        </tr>
                    </thead>
                    <tbody>
                        {keys.length > 0 ? (
                            renderRows()
                        ) : (
                            <tr>
                                <td colSpan="15" className="text-center opacity-50">
                                    Waiting for data...
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
