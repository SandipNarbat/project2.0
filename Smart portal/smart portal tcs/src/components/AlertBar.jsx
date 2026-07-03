import './AlertBar.css';
import React from 'react';
import QueueAlerts from '../blocks/QueueAlerts';
import { useLocation } from 'react-router-dom';

function AlertBar({ dataToAlert = {} }) {
  const location = useLocation();
  const isNightActive = location.state?.isNightActive || false;
  return (
    <div className="alert-bar">
      {isNightActive === false ? (
        <QueueAlerts data={dataToAlert.queue} />
      ) : (
        <QueueAlerts data={dataToAlert.queueNight} />
      )}
    </div>
  );
}

// dataToAlert is the whole data object (new ref every flush) — only re-render
// when the queue slices actually changed.
export default React.memo(AlertBar, (prev, next) =>
  prev.dataToAlert?.queue === next.dataToAlert?.queue &&
  prev.dataToAlert?.queueNight === next.dataToAlert?.queueNight
);
