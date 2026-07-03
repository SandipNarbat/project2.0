import './QueueAlerts.css';
import { IconAlertCircle, IconAlertTriangle } from '../components/Icons';
import React, { useMemo, useRef } from 'react';
import AlertPopup from './AlertPopup';
const QueueAlerts = ({ data }) => {
    const panelRef = useRef(null);
    const alertsList = useMemo(() => {
        if (!data) return [];
        return Object.keys(data).flatMap(key => {
            const array = data[key];
            if (!Array.isArray(array)) return [];
            return array
                .map((val, idx) => ({ val, idx }))
                .filter(item => item.val > 100)
                .map(item => ({
                    key: key,
                    value: item.val,
                    serverIndex: item.idx,
                    isCritical: item.val >= 500
                }));
        }).sort((a, b) => b.value - a.value);
    }, [data]);
    const totalAlerts = alertsList.length;
    const criticalCount = alertsList.filter(a => a.value >= 500).length;
    const highCount = alertsList.filter(a => a.value > 100 && a.value < 500).length;
    const handleBellOpen = () => {
        panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    if (totalAlerts === 0) {
        return null;
    }
    return (
        <>
            <AlertPopup
                totalAlerts={totalAlerts}
                criticalCount={criticalCount}
                highCount={highCount}
                onOpen={handleBellOpen}
                alertsList ={alertsList}
            />
        </>
    );
};
export default QueueAlerts;
