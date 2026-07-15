import React, { useState, useEffect, useRef, useMemo } from "react";
import { IconAlertTriangle, IconCopy, IconPdf, IconExcel, IconSearch, IconDown, IconUp } from "../components/Icons";
import "./RepostFail.css";
import "./BranchLoggedIn.css";

const PAGE_SIZE = 20;

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

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "ascending" });
  const [page, setPage] = useState(1);
  const [copySuccess, setCopySuccess] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  // Filter
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

  // Sort (search+sort combined, then paginated below)
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
        const isNumeric = !isNaN(valueA) && !isNaN(valueB) && valueA !== "" && valueB !== "";
        if (isNumeric) {
          valueA = Number(valueA);
          valueB = Number(valueB);
        } else {
          valueA = String(valueA).toLowerCase();
          valueB = String(valueB).toLowerCase();
        }
        if (valueA < valueB) return sortConfig.direction === "ascending" ? -1 : 1;
        if (valueA > valueB) return sortConfig.direction === "ascending" ? 1 : -1;
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

  // Functional update: always toggles off the FRESHEST sortConfig instead of
  // one captured in the render closure — this is what fixes the "takes two
  // clicks" bug (a click landing right as a re-render was in flight could
  // read a one-tick-stale sortConfig and appear to do nothing).
  const requestSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "ascending" ? "descending" : "ascending",
    }));
    setPage(1);
  };

  const getSortIcon = (columnIndex) => {
    if (sortConfig.key !== columnIndex) return <IconUp />;
    return sortConfig.direction === "ascending" ? <IconUp /> : <IconDown />;
  };

  const onSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleCopy = async () => {
    const table = document.getElementById("my-table");
    if (!table) return;
    try {
      await navigator.clipboard.writeText(table.innerText);
      setCopySuccess("Copied!");
      setTimeout(() => setCopySuccess(""), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
      setCopySuccess("Failed to copy");
    }
  };

  const toggleVisibility = () => setIsVisible(window.pageYOffset > 300);
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  useEffect(() => {
    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const renderRows = () =>
    pageKeys.length > 0 ? (
      pageKeys.map((key) => {
        const rowData = sourceData[key];
        if (!Array.isArray(rowData)) return null;
        return (
          <tr key={key}>
            {rowData.map((val, i) =>
              i === 2 ? <td key={i}>{val}</td> : <QueueAnimatedCell key={i} value={val} />
            )}
          </tr>
        );
      })
    ) : (
      <tr>
        <td colSpan={6} className="empty-message">
          {search ? "No results found" : "Waiting for data..."}
        </td>
      </tr>
    );

  const firstShown = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const lastShown = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="div1">
      <div className={`div2 ${open ? "open" : "close"}`}>
        <div className="menuSection">
          <div className="menuItem activeMenu">
            <span><IconAlertTriangle /></span>
            {open && <p>NEFT Repost Fail</p>}
          </div>
        </div>
      </div>

      <div className="div3">
        <div className="div5">
          <h2>NEFT REPOST FAIL Night TOTAL</h2>

          <div className="tableToolbar">
            <div className="toolbarBtns">
              <button className="hamburgerBtn" onClick={() => setOpen(!open)}>
                {open ? "✖" : "☰"}
              </button>
              <button onClick={handleCopy}><IconCopy />Copy</button>
              <button><IconPdf />PDF</button>
              <button><IconExcel />Excel</button>
              {copySuccess && <span className="copyStatus">{copySuccess}</span>}
            </div>
            <div className="searchTable">
              <input type="text" value={search} onChange={onSearchChange} placeholder="Search here ..." />
              <div className="search_icon">
                <IconSearch />
              </div>
            </div>
          </div>

          <div className="branch-table legend-table-wrapper">
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
              <tbody id="my-table">{renderRows()}</tbody>
            </table>
          </div>

          {/* Pagination — 20 entries per page, same as Branch Logged In */}
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
      </div>
    </div>
  );
}
