import { useEffect, useState } from 'react';
import './QueueReplica.css';
export default function QueueReplica({ queue }) {
    const [replicaData, setReplicaData] = useState(null);
    const [loading, setLoading] = useState(true);
    const rows = Array.from({ length: 16 }, (_, i) => i === 0 ? "MASTER" : `SLAVE ${i}`);
    useEffect(() => {
        const ac = new AbortController();
        const fetchData = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/process-files', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ queue: queue }),
                    signal: ac.signal,
                });
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();
                setReplicaData(data);
            } catch (error) {
                if (error.name !== 'AbortError') console.error('POST request failed:', error);
            } finally {
                if (!ac.signal.aborted) setLoading(false);
            }
        };
        fetchData();
        return () => ac.abort();
    }, [queue]);
    const dataEntries = Object.entries(replicaData?.data || {});
    if (dataEntries.length === 0) {
        return <div>No replica data found for {queue}</div>;
    }
    return (
        <div className='queue-replica'>
            <h1 className="replica-title">Replica Data for {queue}</h1>
            <div className="table-container">
                <table className="queue-replica-table">
                    <thead>
                        <tr>
                            <th>SERVER</th>
                            <th>COUNT</th>
                            <th>REPLICA PID</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((serverName, index) => {
                            const replicaIds = dataEntries[index]?.[1] || [];
                            return (
                                <tr key={serverName}>
                                    <td>{serverName}</td>
                                    <td>{dataEntries[index]?.[1]?.length || 0}</td>
                                    <td>{replicaIds.join(', ')}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
