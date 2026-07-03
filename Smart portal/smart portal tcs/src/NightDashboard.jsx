import GridOverview from "./components/GridOverview";
import QueueMetrics from "./components/QueueMetrics";
import SystemContext from "./components/SystemContext";
import TrickleMetrics from "./components/TrickleMetrics";
import SpaceMetrics from "./components/SpaceMetrics";
import AlertBar from "./components/AlertBar";
import "./Dashboard.css";
import SystemUtilization from "./components/SystemUtilization";
import MqStatus from "./components/MqStatus";
import OcrNeft from "./components/OcrNeft";
import MiscTransactionCount from "./components/MiscTransactionCount";
import BatchUploads from "./components/BatchUpload";
import HighResourceReplica from "./components/HighResourceReplica";
import RTGSMetrics from "./components/RTGSMertrics"

// Night view: identical layout to Dashboard, fed by the night sources
// (jobsNight / queueNight) where they exist.
export default function NightDashboard({ data = {}, lastUpdated = {} }) {
    return (
        <div className="app-root">
            <AlertBar dataToAlert={data} />
            <div className="dashboard-content-wrapper">
                <div className="dashboard">
                    <GridOverview data={data.jobsNight} lastUpdated={lastUpdated.jobsNight} />
                    <QueueMetrics data={data.queueNight} lastUpdated={lastUpdated.queueNight} />
                </div>
                <div className="dashboard-secondary">
                    <SpaceMetrics data={data.space} lastUpdated={lastUpdated.space} />
                    <TrickleMetrics data={data.trickle} lastUpdated={lastUpdated.trickle} />
                </div>
                <div className="dashboard-third">
                    <SystemUtilization data={data.system} lastUpdated={lastUpdated.system} />
                    <SystemContext data={data.context} lastUpdated={lastUpdated.context} />
                </div>
                <div className="dashboard-fourth">
                    <OcrNeft data={data.OCRNEFT} lastUpdated={lastUpdated.OCRNEFT} />
                    <BatchUploads data={data.batchUpload} lastUpdated={lastUpdated.batchUpload} />
                    <HighResourceReplica data={data.resourse} lastUpdated={lastUpdated.resourse} />
                </div>
                <div className="dashboard-fifth">
                    <MqStatus data={data.MQStatus} lastUpdated={lastUpdated.MQStatus} />
                    <MiscTransactionCount data={data.miscTxtCount} lastUpdated={lastUpdated.miscTxtCount} neftCount={data.neftIncomingCount} />
                </div>
                <div className="dashboard-sixth">
                    <RTGSMetrics data={data} lastUpdated={lastUpdated} />
                </div>
            </div>
        </div>
    );
}
