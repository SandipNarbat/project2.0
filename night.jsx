import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './TopNavBar.css';
import { IconCalendar } from "./Icons";



const formatDateToYYYYMMDD = (dateInput) => {
  if (typeof dateInput === 'string' && /^\d{8}$/.test(dateInput)) {
    return dateInput;
  }

  const dateObj = dateInput instanceof Date ? dateInput : new Date(dateInput);

  if (isNaN(dateObj.getTime())) {
    return null;
  }

  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');

  return `${year}${month}${day}`;
};

const formatDateForInput = (dateInput) => {

  const year = dateInput.slice(0, 4);
  const mm = dateInput.slice(4, 6);
  const dd = dateInput.slice(6,);

  return `${year}-${mm}-${dd}`;
}


export default function TopNavBar({ branchCount = "0", tellerCount = "0", repostingCount = "0", neftInvalidDay = "0", neftInvalidNight = "0", MFLAGS_D, sendDataUp }) {
  const [marketDate, setMarketDate] = React.useState(new Date());
  const navigate = useNavigate();
  const location = useLocation();
  // Night context = the Night dashboard and its EOD/SOD sub-page. In this
  // context only the common tabs (Legends + EOD/SOD, plus the Dashboard /
  // Night Region nav) are shown; the day-region options are hidden here and
  // reappear on the Dashboard.
  const isNightActive = location.pathname === '/night' || location.pathname === '/eodsod';
  const formattedMarketDate = formatDateToYYYYMMDD(marketDate)
  const [dateWiseData, setDateWiseData] = useState({})
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });
  useEffect(() => {
    if (MFLAGS_D && /^\d{8}$/.test(MFLAGS_D)) {
      const formatted = `${MFLAGS_D.slice(0, 4)}-${MFLAGS_D.slice(4, 6)}-${MFLAGS_D.slice(6, 8)}`;
      setMarketDate(formatted);
    }
  }, [MFLAGS_D]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);
  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    sendDataUp(formattedMarketDate)
  }, [formattedMarketDate])


  return (
    <div className="top-navbar-container">
      {/* Top Tabs Row */}
      <div className="top-nav-tabs-row">
        <div className="tabs-left">
          <div className="logo-container">
            {/* <img src={logo} alt="Company Logo" className="nav-logo" /> */}
          </div>
          <div className={`tab ${location.pathname === '/' ? 'active' : ''}`} onClick={() => navigate('/', { state: { isDayActive: true } })} style={{ cursor: 'pointer' }}>Dashboard</div>
          <div className={`tab ${location.pathname === '/night' ? 'active' : ''}`} onClick={() => navigate('/night', { state: { isNightActive: true } })} style={{ cursor: 'pointer' }}>Night Region</div>
          {/* <div className="tab">We Are in PR</div>
          <div className="tab">Enquiry In DR</div> */}
          {!isNightActive && (<div className={`tab ${location.pathname === '/cbs-flow' ? 'active' : ''}`} onClick={() => navigate('/cbs-flow')} style={{ cursor: 'pointer' }}>CBS Flow</div>)}

          <div className={`tab ${location.pathname === '/legend' ? 'active' : ''}`} onClick={() => navigate('/legend')} style={{ cursor: 'pointer' }}>Legends</div>
          {isNightActive && (<div className={`tab ${location.pathname === '/eodsod' ? 'active' : ''}`} onClick={() => navigate('/eodsod', { state: { isNightActive: true } })} style={{ cursor: 'pointer' }}>EOD/SOD</div>)}
          {!isNightActive && (<div className={`tab ${location.pathname === '/txn-desc' ? 'active' : ''}`} onClick={() => navigate('/txn-desc')} style={{ cursor: 'pointer' }}>TXN DESC</div>)}
          {!isNightActive && (<div className={`tab ${location.pathname === '/neft-invalid' ? 'active' : ''}`} onClick={() => navigate('/neft-invalid')} style={{ cursor: 'pointer' }}><span className="text-red">NEFT Invalid (D/N): <strong>{neftInvalidDay}/{neftInvalidNight}</strong></span>
          </div>)}
          {!isNightActive && (<div className={`tab ${location.pathname === '/repost-fail' ? 'active' : ''}`} onClick={() => navigate('/repost-fail')} style={{ cursor: 'pointer' }}><span className="text-orange">Repost Fail: <strong>{repostingCount}</strong></span></div>)}
          {!isNightActive && (<div className={`tab ${location.pathname === '/rtgs-incoming-gateway' ? 'active' : ''}`} onClick={() => navigate('/rtgs-incoming-gateway')} style={{ cursor: 'pointer' }}>RTGS INCOMING GATEWAY</div>)}
        </div>
        <div className="tabs-right">
          <div className="branch-log">
            {!isNightActive && (<div className={`badge dark ${location.pathname === '/branch-logged-in' ? 'active' : ''} teller branch`} onClick={() => navigate('/branch-logged-in')} style={{ cursor: 'pointer' }}>
              <div className="circle"><div className="circle2"></div></div>
              <div className="inner-teller">
                <span className='flag-label'>Branch logged in</span>
                <strong className="flag-count">{branchCount}</strong>
              </div>
            </div>)}
          </div>
          <div className="teller-log">
            {!isNightActive && (
              <div className="teller">
                <div className="circle"><div className="circle2"></div></div>
                <div className="inner-teller">
                  <span className='flag-label'>Teller logged in</span>
                  <strong className="flag-count">{tellerCount}</strong>
                </div>
              </div>
            )}
          </div>
          <div className="date-picker-wrapper">
            <label htmlFor="market-date-picker" className="change-date-btn">
              <IconCalendar /> <div className="market-flag"><span className="flag-label">Change Date</span>
                <span className="flag-date">{formattedMarketDate}</span></div>
            </label>
            <input
              type="date"
              id="market-date-picker"
              className="hidden-date-input"
              value={formatDateForInput(formattedMarketDate)}
              onChange={(e) => setMarketDate(e.target.value)}
            />
          </div>
          <button
            className="app-nav-btn"
            onClick={toggleTheme}
            title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {theme === 'dark' ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
        </div>
      </div>
      {/* Metric Badges / Buttons Rows */}
      {/* <div className="metrics-badges-container"> */}
      {/* <div className="badges-row"> */}
      {/* {!isNightActive && (<div className={`badge dark ${location.pathname === '/branch-logged-in' ? 'active' : ''}`} onClick={() => navigate('/branch-logged-in')} style={{ cursor: 'pointer' }}>Branch logged in: <strong>{branchCount}</strong></div>)} */}
      {/* {!isNightActive && (<div className={`badge dark border-right ${location.pathname === '/teller-logged-in' ? 'active' : ''}`} onClick={() => navigate('/teller-logged-in')} style={{ cursor: 'pointer' }}>Teller logged in: <strong>{tellerCount}</strong></div>)} */}
      {/* {!isNightActive && (<div className={`badge light ${location.pathname === '/txn-desc' ? 'active' : ''}`} onClick={() => navigate('/txn-desc')} style={{ cursor: 'pointer' }}>TXN DESC</div>)} */}
      {/* {!isNightActive && (<div className={`badge light ${location.pathname === '/all-files' ? 'active' : ''}`} onClick={() => navigate('/all-files')} style={{ cursor: 'pointer' }}>ALL FILES</div>)} */}
      {/* {!isNightActive && (<div className={`badge light ${location.pathname === '/upi-mr' ? 'active' : ''}`} onClick={() => navigate('/upi-mr')} style={{ cursor: 'pointer' }}>UPI(MR)</div>)} */}
      {/* {!isNightActive && (<div className={`badge light outline-red outline ${location.pathname === '/neft-invalid' ? 'active' : ''}`} onClick={() => navigate('/neft-invalid')} style={{ cursor: 'pointer' }}><span className="text-red">NEFT Invalid (D/N): <strong>{neftInvalidDay}/{neftInvalidNight}</strong></span></div>)} */}
      {/* {!isNightActive && (<div className={`badge light ${location.pathname === '/NEFT' ? 'active' : ''}`} onClick={() => navigate('/NEFT')} style={{ cursor: 'pointer' }}>NEFT INVALID</div>)} */}
      {/* <div className={`badge light ${location.pathname === '/reposting-status' ? 'active' : ''}`} onClick={() => navigate('/reposting-status')} style={{ cursor: 'pointer' }}>REPOSTING STATUS</div> */}
      {/* {!isNightActive && (<div className={`badge light outline-orange outline ${location.pathname === '/repost-fail' ? 'active' : ''}`} onClick={() => navigate('/repost-fail')} style={{ cursor: 'pointer' }}><span className="text-orange">Repost Fail: <strong>{repostingCount}</strong></span></div>)} */}
      {/* {!isNightActive && (<div className={`badge light ${location.pathname === '/rtgs-incoming-gateway' ? 'active' : ''}`} onClick={() => navigate('/rtgs-incoming-gateway')} style={{ cursor: 'pointer' }}>RTGS INCOMING GATEWAY</div>)} */}
      {/* <div className={`badge light ${location.pathname === '/rtgs-incoming-ack' ? 'active' : ''}`} onClick={() => navigate('/rtgs-incoming-ack')} style={{ cursor: 'pointer' }}>RTGS INCOMING ACK C54</div> */}
      {/* </div> */}
      {/* </div> */}
    </div>
  );
}
// import { IconList } from "./Icons";
