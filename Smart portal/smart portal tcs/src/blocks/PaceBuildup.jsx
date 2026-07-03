import { useEffect, useState } from 'react';
import './QueueReplica.css';
import './PaceBuildup.css';
function DateFormatter(marketDate) {
    const year = marketDate.getFullYear();
    const month = String(marketDate.getMonth() + 1).padStart(2, '0');
    const day = String(marketDate.getDate()).padStart(2, '0');
    const formattedDate = `${year}${month}${day}`;
    return formattedDate
}
const ServerDQTType = {
    0: "i",
    1: "I",
    2: "a",
    3: "b",
    4: "c",
    5: "d",
    6: "e",
    7: "f",
    8: "g",
    9: "h",
    10: "j",
    11: "k",
    12: "m",
    13: "n",
    14: "p",
    15: "q"
}
function AlertColor({value , i}) {
    const displayValue = (value === '0') ? "-" : value;
    const statusClass = value === '0' ? "pill pill-green" : "pill pill-red";
    if (i === 0 ){
        return(
            <td key={i} ><span>{value}</span></td>
        )
    }
    if(value === "NQKE"){
        return (
            <td key={i}><span className='pill pill-green'>-</span></td>
        )
    }
    return (
        <td key={i}><span className={statusClass}>{displayValue}</span></td>
    )
}
export default function PaceBuildup({ server }) {
    const [replicaData, setReplicaData] = useState(null);
    const [loading, setLoading] = useState(true);
    const today = DateFormatter(new Date())
    const servername = `pace_buildup_${ServerDQTType[server]}.txt.${today}`;
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/pace_buildup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ flag: servername }),
                });
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();
                setReplicaData(data);
            } catch (error) {
                console.error('POST request failed:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [server]);
    const dataEntries = replicaData?.data || {};
    const dataKeys = Object.keys(dataEntries)
    const head = dataEntries[1] || []
    if (dataEntries.length === 0) {
        return <div>NO data Found</div>;
    }
    return (
        <div className='queue-replica'>
            <h1 className="replica-title">{`Queue Buildup Detailed Status ${(ServerDQTType[server]).toUpperCase()}`}</h1>
            <div className="table-container">
                <table className="queue-replica-table pace-table">
                    <thead>
                        <tr>
                            {head.map((value, i) => (
                                <th key={i}>{value}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {dataKeys.slice(1).map((index) => {
                            const rawValue = dataEntries[index] || [];
                            const replicaIds = Array.isArray(rawValue) ? rawValue : [];
                            return (
                                <tr key={index}>
                                    {replicaIds.map((values, i) => (
                                        <AlertColor value = {values} i = {i} />
                                    ))}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
