import React, { useState, useEffect, useRef } from "react";
import "./BranchLoggedIn.css";
import { IconBranch, IconCopy, IconExcel, IconGraph, IconPdf, IconTeller, IconUp, IconSearch } from "../components/Icons";
const PAGE_SIZE = 20;
// Matches the Express API commented at the top of this file.
const API_URL = "http://localhost:5000/api/branches";
const CircleName = {
  "001": "KOLKATA",
  "002": "MUMBAI",
  "003": "CHENNAI",
  "004": "NEW DELHI",
  "005": "LUCKNOW",
  "006": "AHMEDABAD",
  "007": "HYDERABAD",
  "008": "BHOPAL",
  "009": "PATNA",
  "010": "CHANDIGARH",
  "011": "BHUBANESWAR",
  "012": "GUWAHATI",
  "013": "BANGALORE",
  "014": "KERALA",
  "015": "CAG",
  "016": "MCG",
  "017": "SAMG",
  "018": "CORPORATE CENTRE -CAO I",
  "020": "CAO-II",
  "021": "GLOBAL LINK SERVICES",
  "022": "SECURITY SERVICE BRANCH",
  "023": "JAIPUR",
  "024": "AMRAVATHI",
  "027": "MUMBAI METRO ABU",
};
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
      <span>{value}</span>
    </td>
  );
});
export default function BranchLoggedIn({ data = {} }) {
  const sourceData = data.branchLoggedIn || {};
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [copySuccess, setCopySuccess] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [remote, setRemote] = useState(null);
  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams({
      page: String(page),
      limit: String(PAGE_SIZE),
      search,
    });
    fetch(`${API_URL}?${params.toString()}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((json) => {
        if (!cancelled) setRemote(json);
      })
      .catch(() => {
        if (!cancelled) setRemote(null);
      });
    return () => {
      cancelled = true;
    };
  }, [page, search]);
  const allEntries = Object.entries(sourceData);
  const filteredEntries = search
    ? allEntries.filter(([key, rowData]) => {
        const circle = Array.isArray(rowData) ? CircleName[rowData[2]] || "" : "";
        const haystack = [key, ...(Array.isArray(rowData) ? rowData : []), circle]
          .join(" ")
          .toLowerCase();
        return haystack.includes(search.toLowerCase());
      })
    : allEntries;
  const usingApi = remote !== null;
  const total = usingApi ? remote.total : filteredEntries.length;
  const pageEntries = usingApi
    ? remote.rows.map((r) => [r[0], r.slice(1)])
    : filteredEntries.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);
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
  const renderRow = (key, rowData) => (
    <tr key={key}>
      <td>{String(key).toUpperCase()}</td>
      {Array.isArray(rowData)
        ? rowData.map((val, i) =>
            i === 2 ? (
              <React.Fragment key={i}>
                <td>{CircleName[val] || "-"}</td>
                <td>{val}</td>
              </React.Fragment>
            ) : (
              <QueueAnimatedCell key={i} value={val} />
            )
          )
        : null}
    </tr>
  );
  const firstShown = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const lastShown = Math.min(page * PAGE_SIZE, total);
  return (
    <div className="div1">
      <div className={`div2 ${open ? "open" : "close"}`}>
        <div className="menuSection">
          <div className="menuItem activeMenu">
            <span><IconBranch /></span>
            {open && <p>Branches Online</p>}
          </div>
          <div className="menuItem">
            <span><IconTeller /></span>
            {open && <p>Branch & Teller Details</p>}
          </div>
          <div className="menuItem">
            <span><IconGraph /></span>
            {open && <p>Login Graph</p>}
          </div>
        </div>
      </div>
      <div className="div3">
        <div className="div5">
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
              {/* <label style={{ fontSize: "12px" }}>Search:</label> */}
              <input type="text" value={search} onChange={onSearchChange} placeholder="Search here ..."/>
              <div className="search_icon">
              <IconSearch />
              </div>
            </div>
          </div>
          <div className="branch-table">
            <table>
              <thead>
                <tr>
                  <th>SR NO</th>
                  <th>BRANCH CODE</th>
                  <th>BRANCH</th>
                  <th>CIRCLE NAME </th>
                  <th>CIRCLE CODE</th>
                </tr>
              </thead>
              <tbody id="my-table">
                {pageEntries.length > 0 ? (
                  pageEntries.map(([key, rowData]) => renderRow(key, rowData))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center opacity-50">
                      {search ? "No results found" : "Waiting for data..."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination — 20 entries per page */}
          <div
            className="pagination">
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
        </div>
      </div>
    </div>
  );
}
