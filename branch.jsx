import React, { useState, useEffect, useRef } from "react";
import "./BranchLoggedIn.css";
import { IconBranch, IconCopy, IconExcel, IconGraph, IconPdf, IconTeller, IconUp } from "../components/Icons";


function QueueAnimatedCell({ value }) {
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
}

export default function BranchLoggedIn({ data = {} }) {
  const sourceData = data.branchLoggedIn || {};
  // console.log(sourceData)
  const queueKeys = Object.keys(sourceData)
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")

  const [copySuccess, setCopySuccess] = useState("");

  const handleCopy = async () => {
    const table = document.getElementById("my-table");
    if (!table) return;

    try {

      const text = table.innerText;

      await navigator.clipboard.writeText(text);
      setCopySuccess("Copied!");
      setTimeout(() => {
        setCopySuccess("");
      }, 2000);
    } catch (err) {
      console.error("Failed to copy", err);
      setCopySuccess("Failed to copy");
    }
  };
  const filterData = queueKeys.filter((key) => {
    const rowData = sourceData[key];
    if (!rowData) return false;

    return Object.values(rowData)

      .join("")
      .toLowerCase()
      .includes(search.toLowerCase());
  });

  const handleInputChange = (e) => {
    setSearchInput(e.target.value);
    const tableBody = document.getElementById('my-table');
    if (tableBody) {

      console.log("Table has", tableBody.rows.length, "rows");
    }
  };

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
    "027": "MUMBAI METRO ABU"
  }
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
              <button
                className="hamburgerBtn"
                onClick={() => setOpen(!open)}
              >
                {open ? "✖" : "☰"}
              </button>
              <button onClick={handleCopy}><IconCopy />Copy</button>
              <button><IconPdf />PDF</button>
              <button ><IconExcel />Excel</button>
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
                  <th>Sr No</th>
                  <th>BRANCH CODE</th>
                  <th>BRANCH</th>
                  <th>CIRCLE NAME </th>
                  <th>CIRCLE CODE</th>
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
                              if (i === 2) {
                                return (
                                  <React.Fragment key={i}>
                                    <td>{CircleName[val]}</td>
                                    <td>{val}</td>
                                  </React.Fragment>
                                );
                              }
                              return <QueueAnimatedCell key={i} value={val} />;
                            })
                            : null}
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={14} className="text-center opacity-50">No results found</td>
                    </tr>
                  ))
                  : (queueKeys.length > 0 ? (
                    queueKeys.map((key) => {
                      const rowData = sourceData[key];
                      return (
                        <tr key={key}>
                          <td>{key.toUpperCase()}</td>
                          {Array.isArray(rowData)
                            ? rowData.map((val, i) => {
                              if (i === 2) {
                                return (
                                  <React.Fragment key={i}>
                                    <td>{CircleName[val]}</td>
                                    <td>{val}</td>
                                  </React.Fragment>
                                );
                              }
                              return <QueueAnimatedCell key={i} value={val} />;
                            })
                            : null}
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={14} className="text-center opacity-50">Waiting for data...</td>
                    </tr>
                  ))}
              </tbody>

            </table>

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
    </div>
  );
}




