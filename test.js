import React, { useState, useEffect, useRef } from 'react';
import { IconAlertCircle, IconAlertTriangle, IconWarning } from '../components/Icons';
import './AlertPopup.css';

const BellIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
);

const AlertPopup = ({ totalAlerts, criticalCount, highCount, onOpen, alertsList }) => {
    const [visible, setVisible] = useState(false);     // popup toast visible
    const [collapsed, setCollapsed] = useState(false); // collapsed into bell button
    const [prevTotal, setPrevTotal] = useState(totalAlerts);
    const timerRef = useRef(null);

    // Trigger popup whenever alert count changes (and > 0)
    useEffect(() => {
        if (totalAlerts > 0 && totalAlerts !== prevTotal) {
            showPopup();
        }
        // Also show on first load if there are alerts
        if (prevTotal === 0 && totalAlerts > 0 && !visible && !collapsed) {
            showPopup();
        }
        setPrevTotal(totalAlerts);
    }, [totalAlerts]);

    // Show on mount if alerts exist
    useEffect(() => {
        if (totalAlerts > 0) {
            showPopup();
        }
    }, []);

    const showPopup = () => {
        setCollapsed(false);
        setVisible(true);
        clearTimeout(timerRef.current);
        // Auto-dismiss after 5 seconds → collapse into bell
        timerRef.current = setTimeout(() => {
            setVisible(false);
            setCollapsed(true);
        }, 5000);
    };

    const handleDismiss = () => {
        clearTimeout(timerRef.current);
        setVisible(false);
        setCollapsed(true);
    };

    const handleBellClick = () => {
        setCollapsed(false);
        if (onOpen) onOpen(); // optionally scroll/open full panel
        showPopup();
    };

    if (totalAlerts === 0) return null;

    return (
        <>
            {/* Toast Popup */}
            <div className={`alert-popup ${visible ? 'popup-enter' : 'popup-exit'}`}>
                <div className="popup-header">
                    <span className="popup-title">⚠ Queue Buildup Alerts</span>
                    <button className="popup-close" onClick={handleDismiss}>✕</button>
                </div>

                <div className="queue-alert">

                    <div className="middle-queue">
                        <div className="total-que red">
                            <h2>{totalAlerts}</h2>
                            <p className='white'>TOTAL ALERTS</p>
                        </div>

                        <div className='line'></div>

                        <div className="que-block">
                            <div className="icon"><IconAlertTriangle /></div>
                            <div className='middle-block red'>
                                <h2>{criticalCount}</h2>
                                <p>CRITICAL</p>
                                <p className='white'>{"> 500"}</p>
                            </div>
                        </div>

                        <div className='line'></div>

                        <div className="que-block">
                            <div className="icon"><IconAlertCircle /></div>
                            <div className='middle-block orange'>
                                <h2>{highCount}</h2>
                                <p>HIGH</p>
                                <p className='white'>{"200 - 499"}</p>
                            </div>
                        </div>
                    </div>

                    <div className="lower-queue">
                        <p>TOP QUEUE BUILDUPS</p>
                        <div className="queue-tiles">
                            {alertsList.map((alert, index) => {
                                const { key, value, serverIndex, isCritical } = alert;

                                const tileClass = isCritical ? 'tile-red' : 'tile-orange';
                                const serverClass = isCritical ? 'server-red' : 'server-orange';
                                const uniqueKey = `${key}-${serverIndex}-${index}`;

                                return (
                                    <div key={uniqueKey} className={`tile ${tileClass}`}>
                                        <div className='tile-'>
                                            <h3>{key}</h3>
                                            <h3 className={serverClass}>{serverIndex === 0 ? 'M' : `S${serverIndex}`}</h3>
                                        </div>
                                        <h1>{value}</h1>
                                    </div>
                                );
                            })}

                            {alertsList.length === 0 && (
                                <p style={{ color: 'green' }}>No alerts found.</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="popup-footer">
                    <div className="popup-timer-bar" />
                    <span className="popup-hint">Dismissing in 5s…</span>
                </div>
            </div>

            {/* Bell button — shown after popup collapses */}
            {collapsed && (
                <button className="alert-bell-btn" onClick={handleBellClick} title="View alerts">
                    <BellIcon />
                    <span className="bell-badge">{totalAlerts}</span>
                </button>
            )}
        </>
    );
};

export default AlertPopup;
