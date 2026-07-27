
    import React, { useState, useEffect, useRef, useMemo } from "react";
    import { IconCheck, IconDownNew, IconUpNew } from "../components/Icons";
    import './RepostFail.css';
    const PAGE_SIZE = 24;
    const QueueAnimatedCell = React.memo(function QueueAnimatedCell({ value }) {
        const [highlight, setHighlight] = useState(false);
        const prev = useRef(value);
        useEffect(() => {
            if (prev.current !== value) {
                setHighlight(true);
                const timer = setTimeout(() => setHighlight(false), 800);
                prev.current = value;
                return () => clearTimeout(timer);
            }
        }, [value]);
        return (
            <td className={highlight ? "highlight-row" : ""}>
                <span>{value === -1 ? <IconUp /> : value}</span>
            </td>
        );
    });
    export default function RepostFail({ data = {}, lastUpdated }) {
        const sourceData3 = data.neftRepostFailKrishna || {};
        const sourceData1 = data.neftRepostFailHimalaya || {};
        const sourceData2 = data.neftRepostFailSutlej || {};

        const Sources = [sourceData1, sourceData2, sourceData3]
        const queueKeys = Object.keys(sourceData3);
        // const queueKeys1 = Object.keys(sourceData1);
        // const queueKeys2 = Object.keys(sourceData2);

        const [search, setSearch] = useState("");
        const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
        const [isVisible, setIsVisible] = useState(false);
        const [page, setPage] = useState(1);
        // Filter Data
        const filterData = useMemo(() => {
            return queueKeys.filter((key) => {
                const rowData = sourceData[key];
                if (!rowData) return false;
                return Object.values(rowData)
                    .join("")
                    .toLowerCase()
                    .includes(search.toLowerCase());
            });
        }, [queueKeys, sourceData, search]);
        // Sorting Logic
        const sortedKeys = useMemo(() => {
            let sortableKeys = [...(search ? filterData : queueKeys)];
            if (sortConfig.key !== null) {
                sortableKeys.sort((a, b) => {
                    const rowA = sourceData[a];
                    const rowB = sourceData[b];
                    if (!rowA || !rowB) return 0;
                    let valueA = rowA[sortConfig.key];
                    let valueB = rowB[sortConfig.key];
                    if (valueA === undefined || valueB === undefined) return 0;
                    const isNumeric = !isNaN(valueA) && !isNaN(valueB) && valueA !== '' && valueB !== '';
                    if (isNumeric) {
                        valueA = Number(valueA);
                        valueB = Number(valueB);
                    } else {
                        valueA = String(valueA).toLowerCase();
                        valueB = String(valueB).toLowerCase();
                    }
                    if (valueA < valueB) {
                        return sortConfig.direction === 'ascending' ? -1 : 1;
                    }
                    if (valueA > valueB) {
                        return sortConfig.direction === 'ascending' ? 1 : -1;
                    }
                    return 0;
                });
            }
            return sortableKeys;
        }, [search, filterData, queueKeys, sortConfig, sourceData]);
        const total = sortedKeys.length;
        const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
        useEffect(() => {
            if (page > totalPages) setPage(totalPages);
        }, [page, totalPages]);
        const pageKeys = sortedKeys.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
        const firstShown = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
        const lastShown = Math.min(page * PAGE_SIZE, total);
        const requestSort = (key) => {

            setSortConfig((prev) => ({
                key,
                direction: prev.key === key && prev.direction === 'ascending' ? 'descending' : 'ascending',
            }));
            setPage(1);
        };
        const getSortIcon = (columnName) => {
            if (sortConfig.key !== columnName) {
                return <IconUpNew />;
            }
            return sortConfig.direction === 'ascending' ? <IconUpNew /> : <IconDownNew />;
        };
        const toggleVisibility = () => {
            setIsVisible(window.pageYOffset > 300);
        };
        const scrollToTop = () => {
            window.scrollTo({ top: 0, behavior: "smooth" });
        };
        useEffect(() => {
            window.addEventListener("scroll", toggleVisibility);
            return () => window.removeEventListener("scroll", toggleVisibility);
        }, []);
        const renderRows = (keysToRender) => (
            keysToRender.length > 0 ? (
                keysToRender.map((key) => {
                    const rowData = sourceData[key];
                    if (!Array.isArray(rowData)) return null;
                    return (
                        <tr key={key}>
                            {rowData.map((val, i) => {
                                if (i === 2) {
                                    return <td key={i}>{val}</td>;
                                }
                                return <QueueAnimatedCell key={i} value={val} />;
                            })}
                        </tr>
                    );
                })
            ) : (
                <tr>
                    <td colSpan={6} className="empty-message">
                        {search ? "No results found" : "Waiting for data..."}
                    </td>
                </tr>
            )
        );
        return (
            <div className="repost-fail-container">
                {Sources.map((val, i) => {
                    const sourceData = val || {};
                    const jobKeys = Object.keys(val);
                    return (
                        <div className="repostcard">
                            <div className="card-header">
                                <div className="card-title">
                                    <h2>NEFT REPOST FAIL Night TOTAL</h2>
                                </div>
                                <div className="server">
                                    <button>HIMALAYA</button>
                                    <button>SUTLEJ</button>
                                    <button>KRISHNA</button>

                                </div>
                                <div className="searchTable">
                                    <label>Search:</label>
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                                        placeholder="Filter table..."
                                    />
                                </div>
                            </div>
                            <div className="legend-table-wrapper">
                                <table className="legend-table repost-fail">
                                    <thead>
                                        <tr>
                                            <th onClick={() => requestSort(0)} className="sortable"><div className="th"><span>DATE</span> {getSortIcon(0)}</div></th>
                                            <th onClick={() => requestSort(1)} className="sortable"><div className="th"><span>JOURNAL NO</span> {getSortIcon(1)}</div></th>
                                            <th onClick={() => requestSort(2)} className="sortable"><div className="th"><span>ERROR CODE</span> {getSortIcon(2)}</div></th>
                                            <th onClick={() => requestSort(3)} className="sortable"><div className="th"><span>TXN</span> {getSortIcon(3)}</div></th>
                                            <th onClick={() => requestSort(4)} className="sortable"><div className="th"><span>VIRTUAL DATE</span> {getSortIcon(4)}</div></th>
                                            <th onClick={() => requestSort(5)} className="sortable"><div className="th"><span>UTR</span> {getSortIcon(5)}</div></th>
                                        </tr>
                                    </thead>
                                    <tbody id="my-table">
                                        {renderRows(pageKeys)}
                                    </tbody>
                                </table>
                            </div>

                            <div className="pagination">
                                <span>
                                    {total === 0 ? "No entries" : `Showing ${firstShown} – ${lastShown} of ${total}`}
                                </span>
                                <div className="page-button" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                    <button onClick={() => setPage(1)} disabled={page <= 1}>First</button>
                                    <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>Prev</button>
                                    <span>Page {page} of {totalPages}</span>
                                    <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>Next</button>
                                    <button onClick={() => setPage(totalPages)} disabled={page >= totalPages}>Last</button>
                                </div>
                            </div>
                            <div className="scroll-to-top-container">
                                {isVisible && (
                                    <button className="scroll-to-top" onClick={scrollToTop} aria-label="Scroll to top">
                                        <IconUp />
                                    </button>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        );
    }
