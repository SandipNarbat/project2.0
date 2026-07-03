import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './TopNavBar.css';
import { IconCalendar } from "./Icons";
export default function TopNavBar({ branchCount = "0", tellerCount = "0", repostingCount = "0", neftInvalidDay = "0", neftInvalidNight = "0", MFLAGS_D }) {
  const [marketDate, setMarketDate] = React.useState("2025-11-17");
  const navigate = useNavigate();
  const location = useLocation();
  const formattedMarketDate = marketDate.replace(/-/g, "");
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);
  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };
  return (
    <div className="top-navbar-container">
      {/* Top Tabs Row */}
      <div className="top-nav-tabs-row">
        <div className="tabs-left">
          <div className="logo-container">
            {/* <img src={logo} alt="Company Logo" className="nav-logo" /> */}
          </div>
          <div className={`tab ${location.pathname === '/' ? 'active' : ''}`} onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>Dashboard</div>
          <div className={`tab ${location.pathname === '/night' ? 'active' : ''}`} onClick={() => navigate('/night', { state: { isNightActive: true } })} style={{ cursor: 'pointer' }}>Night Region</div>
          {/* <div className="tab">We Are in PR</div> */}
          {/* <div className="tab">Enquiry In DR</div> */}
          {location.pathname !== '/night' && (<div className={`tab ${location.pathname === '/cbs-flow' ? 'active' : ''}`} onClick={() => navigate('/cbs-flow')} style={{ cursor: 'pointer' }}>CBS Flow</div>)}
          <div className={`tab ${location.pathname === '/legend' ? 'active' : ''}`} onClick={() => navigate('/legend')} style={{ cursor: 'pointer' }}>Legends</div>
          {location.pathname !== '/night' && (<div className={`tab ${location.pathname === '/neft-invalid' ? 'active' : ''}`} onClick={() => navigate('/neft-invalid')} style={{ cursor: 'pointer' }}><span className="text-red">NEFT Invalid (D/N): <strong>{neftInvalidDay}/{neftInvalidNight}</strong></span>
          </div>)}
          {location.pathname !== '/night' && (<div className={`tab ${location.pathname === '/repost-fail' ? 'active' : ''}`} onClick={() => navigate('/repost-fail')} style={{ cursor: 'pointer' }}><span className="text-orange">Repost Fail: <strong>{repostingCount}</strong></span></div>)}
          {location.pathname !== '/night' && (<div className={`tab ${location.pathname === '/rtgs-incoming-gateway' ? 'active' : ''}`} onClick={() => navigate('/rtgs-incoming-gateway')} style={{ cursor: 'pointer' }}>RTGS INCOMING GATEWAY</div>)}
        </div>
        <div className="tabs-right">
          <div className="branch-log">
            {location.pathname !== '/night' && (<div className={`badge dark ${location.pathname === '/branch-logged-in' ? 'active' : ''}`} onClick={() => navigate('/branch-logged-in')} style={{ cursor: 'pointer' }} className="teller branch">
              <div className="circle"><div className="circle2"></div></div>
              <div className="inner-teller">
                <span className='flag-label'>Branch logged in</span>
                <strong className="flag-count">{branchCount}</strong>
              </div>
            </div>)}
          </div>
          <div className="teller-log">
            {location.pathname !== '/night' && (
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
                <span className="flag-date">{MFLAGS_D}</span></div>
            </label>
            <input
              type="date"
              id="market-date-picker"
              className="hidden-date-input"
              value={marketDate}
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
          {/* {location.pathname !== '/night' && (<div className={`badge dark ${location.pathname === '/branch-logged-in' ? 'active' : ''}`} onClick={() => navigate('/branch-logged-in')} style={{ cursor: 'pointer' }}>Branch logged in: <strong>{branchCount}</strong></div>)} */}
          {/* {location.pathname !== '/night' && (<div className={`badge dark border-right ${location.pathname === '/teller-logged-in' ? 'active' : ''}`} onClick={() => navigate('/teller-logged-in')} style={{ cursor: 'pointer' }}>Teller logged in: <strong>{tellerCount}</strong></div>)} */}
          {/* {location.pathname !== '/night' && (<div className={`badge light ${location.pathname === '/txn-desc' ? 'active' : ''}`} onClick={() => navigate('/txn-desc')} style={{ cursor: 'pointer' }}>TXN DESC</div>)} */}
          {/* {location.pathname !== '/night' && (<div className={`badge light ${location.pathname === '/all-files' ? 'active' : ''}`} onClick={() => navigate('/all-files')} style={{ cursor: 'pointer' }}>ALL FILES</div>)} */}
          {/* {location.pathname !== '/night' && (<div className={`badge light ${location.pathname === '/upi-mr' ? 'active' : ''}`} onClick={() => navigate('/upi-mr')} style={{ cursor: 'pointer' }}>UPI(MR)</div>)} */}
          {/* {location.pathname !== '/night' && (<div className={`badge light outline-red outline ${location.pathname === '/neft-invalid' ? 'active' : ''}`} onClick={() => navigate('/neft-invalid')} style={{ cursor: 'pointer' }}><span className="text-red">NEFT Invalid (D/N): <strong>{neftInvalidDay}/{neftInvalidNight}</strong></span></div>)} */}
          {/* {location.pathname !== '/night' && (<div className={`badge light ${location.pathname === '/NEFT' ? 'active' : ''}`} onClick={() => navigate('/NEFT')} style={{ cursor: 'pointer' }}>NEFT INVALID</div>)} */}
          {/* <div className={`badge light ${location.pathname === '/reposting-status' ? 'active' : ''}`} onClick={() => navigate('/reposting-status')} style={{ cursor: 'pointer' }}>REPOSTING STATUS</div> */}
          {/* {location.pathname !== '/night' && (<div className={`badge light outline-orange outline ${location.pathname === '/repost-fail' ? 'active' : ''}`} onClick={() => navigate('/repost-fail')} style={{ cursor: 'pointer' }}><span className="text-orange">Repost Fail: <strong>{repostingCount}</strong></span></div>)} */}
          {/* {location.pathname !== '/night' && (<div className={`badge light ${location.pathname === '/rtgs-incoming-gateway' ? 'active' : ''}`} onClick={() => navigate('/rtgs-incoming-gateway')} style={{ cursor: 'pointer' }}>RTGS INCOMING GATEWAY</div>)} */}
          {/* <div className={`badge light ${location.pathname === '/rtgs-incoming-ack' ? 'active' : ''}`} onClick={() => navigate('/rtgs-incoming-ack')} style={{ cursor: 'pointer' }}>RTGS INCOMING ACK C54</div> */}
        {/* </div> */}
      {/* </div> */}
    </div>
  );
}
// import { IconList } from "./Icons";
