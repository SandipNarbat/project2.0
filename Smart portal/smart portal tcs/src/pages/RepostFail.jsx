import React, { useState, useEffect, useRef, useMemo } from "react";
import { IconCheck, IconDown, IconUp } from "../components/Icons";
// import './RepostFail.css';
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
  const sourceData = data.neftRepostFailPage || {};
  const queueKeys = Object.keys(sourceData);
  const [search, setSearch] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [isVisible, setIsVisible] = useState(false);
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
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  const getSortIcon = (columnName) => {
    if (sortConfig.key !== columnName) {
      return <IconUp />;
    }
    return sortConfig.direction === 'ascending' ? <IconUp/> : <IconDown />;
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
      <div className="repostcard">
        <div className="card-header">
          <div className="card-title">
            <h2>NEFT REPOST FAIL Night TOTAL</h2>
          </div>
          <div className="searchTable">
            <label>Search:</label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter table..."
            />
          </div>
          <div className="header-meta">
            {/* Extra meta info can go here */}
          </div>
        </div>
        <div className="legend-table-wrapper">
          <table className="legend-table">
            <thead>
              <tr>
                <th onClick={() => requestSort(0)} className="sortable">DATE {getSortIcon(0)}</th>
                <th onClick={() => requestSort(1)} className="sortable">JOURNAL NO {getSortIcon(1)}</th>
                <th onClick={() => requestSort(2)} className="sortable">ERROR CODE {getSortIcon(2)}</th>
                <th onClick={() => requestSort(3)} className="sortable">TXN {getSortIcon(3)}</th>
                <th onClick={() => requestSort(4)} className="sortable">VIRTUAL DATE {getSortIcon(4)}</th>
                <th onClick={() => requestSort(5)} className="sortable">UTR {getSortIcon(5)}</th>
              </tr>
            </thead>
            <tbody id="my-table">
              {renderRows(sortedKeys)}
            </tbody>
          </table>
        </div>
        <div className="scroll-to-top-container">
          {isVisible && (
            <button className="scroll-to-top" onClick={scrollToTop} aria-label="Scroll to top">
              <IconUp />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
