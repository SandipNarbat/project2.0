import { useEffect, useState } from 'react';
import './TrickleSummary.css'
export default function TrickleSummary() {
    const [trickleSumm, setTrickleSumm] = useState(null);
    const [loading, setLoading] = useState(true);
    const rows = Array.from({ length: 16 }, (_, i) => i === 0 ? "MASTER" : `SLAVE ${i}`);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/trickle-summ');
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();
                setTrickleSumm(data);
            } catch (error) {
                console.error('POST request failed:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);
    const dataEntries = trickleSumm?.data || {};
    const countkey = Object.keys(trickleSumm?.data || {});
    const alldataEntries = trickleSumm?.data2 || {};
    const allkeys = Object.keys(trickleSumm?.data2 || {});
    const table3 = trickleSumm?.data3 || {};
    const table3keys = Object.keys(trickleSumm?.data3 || {});
    console.log(alldataEntries)
    if (dataEntries.length === 0) {
        return <div>No data found</div>;
    }
    return (
        <div className="trickle-summary-wrapper">
            <div className="sum-head">
                <h1>Trickle Feed Summary</h1>
            </div>
            <div className="summary-table-wrapper">
                <div className="table1">
                    <h1>New Architecture Count File Type Wise TF Summary</h1>
                    <table className='table-wrap'>
                        <thead>
                            <tr>
                                <th>File Type</th>
                                <th>Total files Processed</th>
                            </tr>
                        </thead>
                        <tbody>
                            {countkey.map((key) => {
                                return (
                                    <tr key={key}>
                                        <td>{key}</td>
                                        <td>{dataEntries[key]}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                <div className="table2">
                    <h1>New Architecture File Type Wise Trickle Feed Summary</h1>
                    <table className='table-wrap'>
                        <thead>
                            <tr>
                                <th>Table ID</th>
                                <th>File Type</th>
                                <th>Total files Processed</th>
                                <th>Total Records</th>
                                <th>Processed Max Records In A Fill</th>
                                <th>Min Records In A File</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allkeys.map((key) => {
                                const rowData = alldataEntries[key];
                                return (
                                    <tr key={key}>
                                        {Array.isArray(rowData) ? rowData.slice(0, -1).map((val, i) => (
                                            <td>{val}</td>
                                        )) : null}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                <div className="table3">
                    <h1>New Architecture File Type Wise Trickle Feed Summary</h1>
                    <table className='table-wrap'>
                        <thead>
                            <tr>
                                <th>Server Name</th>
                                <th>Total files Processed</th>
                                <th>Total Records</th>
                            </tr>
                        </thead>
                        <tbody>
                            {table3keys.map((key) => {
                                const rowData = table3[key];
                                return (
                                    <tr key={key}>
                                        <td>{key}</td>
                                        {Array.isArray(rowData)
                                            ? rowData.map((val, i) => (
                                                <td>{val}</td>
                                            ))
                                            : null}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
