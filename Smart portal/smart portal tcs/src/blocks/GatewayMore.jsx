import { useEffect, useState } from 'react';
import './QueueReplica.css';
function GatewayNames({job, i}){
    const jobname = i === 0 ? "M" : `SLAVE ${i}`
    return(
        <h1>{`${job} - ${jobname}`}</h1>
    )
}
export default function GatewayMore({ job }) {
    const [jobData, setJobData] = useState(null);
    const [loading, setLoading] = useState(true);
    // const rows = Array.from({ length: 16 }, (_, i) => i === 0 ? "MASTER" : `SLAVE ${i}`);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/jobs', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ jobName: job }),
                });
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();
                setJobData(data);
            } catch (error) {
                console.error('POST request failed:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [job]);
    const dataEntries = jobData?.data || {};
    const dataEntriesKeys = Object.keys(jobData?.data || []);
    if (dataEntries.length === 0) {
        return <div>No data found </div>;
    }
    return (
        <div className='gateway-wrapper'>
            <h1>{(`${job} Status`).toUpperCase()}</h1>
            <div className="gateway-wrapper-inner">
                {
                    dataEntriesKeys.map((key, index) => {
                        const gateway = dataEntries[key] || {}
                        console.log(gateway)
                        return (
                            <div className='queue-replica jobs'>
                                <GatewayNames job = {job} i= {index}/>
                                <div className="table-container gateway-container">
                                    <table className="queue-replica-table gateway-table">
                                        <thead>
                                            <tr>
                                                <th>Gateway Name</th>
                                                <th>System Time</th>
                                                <th>Last Update Time</th>
                                                <th>Start Time</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {Object.entries(gateway).map(([fileName, fileArray], index) => (
                                                <tr key={fileName}>
                                                    <td>{fileName}</td>
                                                    {Array.isArray(fileArray) ? fileArray.map((item, i) => (
                                                        <td key={i}>{item}</td>
                                                    )): <td>{gateway[fileName]}</td>}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )
                    }
                    )
                }
            </div>
        </div>
    );
}
