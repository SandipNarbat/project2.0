import React, { useState, useEffect, useRef } from "react";
import { IconBranch, IconCopy, IconExcel, IconGraph, IconPdf, IconTeller, IconUp, IconDay, IconNight } from "../components/Icons";
import "./NeftInvalid.css";
import { useNavigate, useLocation } from 'react-router-dom';
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
const IconCalendar = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);
function DateFormatter(marketDate) {
  const year = marketDate.getFullYear();
  const month = String(marketDate.getMonth() + 1).padStart(2, '0');
  const day = String(marketDate.getDate()).padStart(2, '0');
  const formattedDate = `${year}-${month}-${day}`;
  return formattedDate
}
function DateFormatter2(marketDate) {
  if (marketDate.includes("-")) {
    const parts = marketDate.split("-")
    const formattedDate = `${parts[0]}${parts[1]}${parts[2]}`;
    return formattedDate
  }
  else {
    return marketDate
  }
}
export default function NeftInvalid({ data = {} }) {
  const [marketDate, setMarketDate] = React.useState(DateFormatter(new Date()));
  const [replicaData, setReplicaData] = useState(null);
  const [day, setDay] = useState(true);
  const finalDate = DateFormatter2(marketDate)
  useEffect(() => {
    const ac = new AbortController();
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/neft-invalid', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ date: finalDate, isDay: day }),
          signal: ac.signal,
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setReplicaData(data);
      } catch (error) {
        if (error.name !== 'AbortError') console.error('POST request failed:', error);
      }
    };
    fetchData();
    return () => ac.abort();
  }, [finalDate, day]);
  const sourceData = replicaData?.data || {};
  const dataEntries = Object.entries(replicaData?.data || {});
  // if (dataEntries.length === 0) {
  //   console.log("no data found")
  // }
  // console.log(sourceData)
  const neftKey = Object.keys(replicaData?.data || {})
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [copySuccess, setCopySuccess] = useState("");
  const handleCopy = async () => {
    const table = document.getElementById("my-table");
    if (!table) return;
    try {
      const text = table.innerText;
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => {
        setCopySuccess("");
      }, 2000);
    } catch (err) {
      console.error("Failed to copy", err);
      setCopySuccess("Failed to copy");
    }
  };
  const filterData = neftKey.filter((key) => {
    const rowData = sourceData[key];
    if (!rowData) return false;
    return Object.values(rowData)
      .join("")
      .toLowerCase()
      .includes(search.toLowerCase());
  });
  const [isVisible, setIsVisible] = useState(false);
  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };
  useEffect(() => {
    window.addEventListener("scroll", toggleVisibility);
    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []);
  const handleDownloadExcel = () => {
    const keysToExport = filterData;
    if (keysToExport.length === 0) {
      alert("No visible rows to export");
      return;
    }
    let tableHTML = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office"
          xmlns:x="urn:schemas-microsoft-com:office:excel"
          xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>Queue Data</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <meta charset="UTF-8">
      </head>
      <body>
      <table border="1">
        <thead>
          <tr style="background:#f0f0f0; font-weight:bold;">
            <th>Queue Key</th>
            <th>Data 1</th>
            <th>Data 2</th>
            <th>Circle Name</th>
            <th>Circle Value</th>
            <th>Other Data</th>
          </tr>
        </thead>
        <tbody>
  `;
    keysToExport.forEach((key) => {
      const rowData = sourceData[key];
      tableHTML += `<tr>`;
      tableHTML += `<td>${key.toUpperCase()}</td>`;
      if (Array.isArray(rowData)) {
        rowData.forEach((val) => {
          const safeVal = String(val).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
          tableHTML += `<td>${safeVal}</td>`;   // was computed but never appended → empty exports
        });
      }
      tableHTML += `</tr>`;
    });
    tableHTML += `</tbody></table></body></html>`;
    const blob = new Blob(['\ufeff' + tableHTML], {
      type: 'application/vnd.ms-excel'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Branch_loggedIn${new Date().getTime()}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  return (
    <div className="div1">
      <div className="div3">
        <h2>NEFT Invalid UTR Monitoring Dashboard</h2>
        <div className="div5">
          <div className="container1">
            <div className="DN_buttons">
              <button onClick={() => setDay(true)}>
                <IconDay /> Day
              </button>
              <button onClick={() => setDay(false)}>
                <IconNight /> Night
              </button>
            </div>
            <div className="calender">
              <div className="date-picker-wrapper">
                <label htmlFor="market-date-picker" className="change-date-btn">
                  <IconCalendar /> Calender
                </label>
                <input
                  type="date"
                  id="market-date-picker"
                  className="hidden-date-input"
                  value={marketDate}
                  onChange={(e) => setMarketDate(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="mainContainer">
          <div className="container2">
            <div className="buttons">
              <button onClick={handleCopy}><IconCopy />{copySuccess ? 'Copied' : 'Copy'}</button>
              <button><IconPdf />PDF</button>
              <button onClick={handleDownloadExcel} ><IconExcel />Excel</button>
            </div>
            <div className="searchTable">
              <label style={{ fontSize: "12px" }}>Search:</label>
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
          <div className="branch-table">
            <table>
              <thead>
                <tr>
                  <th>UTR</th>
                  <th>BANCS_DQTYPE</th>
                  <th>IN_OUT</th>
                  <th>STATUS </th>
                  <th>TRAN_DATE</th>
                  <th>AMOUNT</th>
                  <th>ACCOUNT_NO</th>
                  <th>BENEF_ACCT_NO</th>
                  <th>JRNL_NO</th>
                  <th>BRANCH </th>
                  <th>IFSC_SENDER</th>
                  <th>IFSC_RECVR</th>
                  <th>CREDIT_BGL</th>
                  <th>DEBIT_BGL</th>
                </tr>
              </thead>
              <tbody id="my-table">
                {search
                  ? (filterData.length > 0 ? (
                    filterData.map((key) => {
                      const rowData = sourceData[key];
                      return (
                        <tr key={key}>
                          <td>{key.toUpperCase()}</td>
                          {Array.isArray(rowData)
                            ? rowData.map((val, i) => {
                              return <QueueAnimatedCell key={i} value={val} />;
                            })
                            : null}
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={14} className="text-center opacity-50">No data for the date {finalDate}</td>
                    </tr>
                  ))
                  : (neftKey.length > 0 ? (
                    neftKey.map((key) => {
                      const rowData = sourceData[key];
                      return (
                        <tr key={key}>
                          <td>{key.toUpperCase()}</td>
                          {Array.isArray(rowData)
                            ? rowData.map((val, i) => {
                                return <QueueAnimatedCell key={i} value={val} />;
                            })
                            : null}
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={14} className="text-center opacity-50">No data for the date {finalDate}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="scroll-to-top" >
          {isVisible && (
            <button className="scroll-to-top" onClick={scrollToTop}>
              <IconUp />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
