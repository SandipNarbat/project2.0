import './AlertBar.css';
import QueueAlerts from '../blocks/QueueAlerts';
import Test from './test'
import { useLocation } from 'react-router-dom';
export default function AlertBar({dataToAlert = {}}) {
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
  )
}
