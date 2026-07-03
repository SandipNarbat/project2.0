import React, { Fragment } from 'react';
import './RtgsIncomingGateway.css'
import { useState, useRef, useEffect } from 'react';
import { IconCheck, IconWarning, IconError, IconLock, IconSlash, IconSnow, IconZap, IconGrid } from "../components/Icons.jsx";
function Render12Apps({ value }) {
  if (value === "0") {
    return (
      <td><IconCheck /></td>
    )
  }
  else if (value === "NA") {
    return (
      <td><span className="text-secondary">—</span></td>
    )
  }
  else return (
    <td>{value}</td>
  )
}
function PendingFiles({ value }) {
  if (value > 0) {
    return (
      <td><span className='highlight-red'>{value}</span></td>
    )
  }
  else return (
    <td>{value}</td>
  )
}
function RtgsIn({ value, i }) {
  if (value > 0 && i === 1) {
    return (
      <td><span className='laal'>{value}</span></td>
    )
  } else if (value > 0 && i === 3) {
    return (
      <td><span className='hara'>{value}</span></td>
    )
  }
  else return (
    <td><span>{value}</span></td>
  )
}
function RtgsOut({ value, i }) {
  if (value > 0 && i === 1) {
    return (
      <td><span className='laal'>{value}</span></td>
    )
  } else if (value > 0 && i === 4) {
    return (
      <td><span className='hara'>{value}</span></td>
    )
  }
  else return (
    <td><span>{value}</span></td>
  )
}
export default function RtgsIncomingGateway({ data = {} }) {
  const RtgsIncoming = data.RtgsIncoming || {};
  const RtgsOutgoing = data.RtgsOutgoing || {};
  const rtgsIncomingPend = data.rtgsIncomingPend || {};
  const rtgsOutgoingPend = data.rtgsOutgoingPend || {};
  const rtgs12Apps = data.RTGSngingGateway12Apps || {};
  const rtgsAck12Apps = data.RTGSACKngingGateway12Apps || {};
  const rtgs12appskeys = Object.keys(rtgs12Apps)
  const rtgsAck12AppsKeys = Object.keys(rtgsAck12Apps)
  const rtgsIncomingKeys = Object.keys(RtgsIncoming)
  const rtgsOutgoingKeys = Object.keys(RtgsOutgoing)
  const IncomingPendingKeys = Object.keys(rtgsIncomingPend)
  const OutgoingPendingKeys = Object.keys(rtgsOutgoingPend)
  const columns = ["M", "S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8", "S9", "S10", "S11", "S12", "S13", "S14", "S15"];
  return (
    <>
      <div className="rtgs-panel">
        <div className="rtgs-head">
          <h2> RTGS Monitoring Dashboard</h2>
        </div>
        <div className='rtgs-div1'>
          <div className='rtgs-div2'>
            <div className="card-header">
              <div className="card-title">
                <IconGrid />
                <h2>RTGS INCOMING</h2>
              </div>
            </div>
            <table>
              <thead className="branch-head">
                <tr>
                  <th>Time</th>
                  <th className="Pending">Pending</th>
                  <th className="Reversal">Reversal</th>
                  <th className="Processed">Processed</th>
                  <th className="UNPR">UNPR</th>
                </tr>
              </thead>
              <tbody>
                {rtgsIncomingKeys.length > 0 ? (
                  rtgsIncomingKeys.map((key) => {
                    const rowData = RtgsIncoming[key];
                    return (
                      <tr key={key}>
                        {Array.isArray(rowData)
                          ? rowData.map((val, i) => (
                            <RtgsIn value={val} i={i} key={i} />
                          ))
                          : null}
                      </tr>
                    );
                  })
                ) : (
                  <tr className='row'>
                    <td colSpan={14} className="text-center opacity-50">Waiting for data...</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className='rtgs-div3'>
            <div className="card-header">
              <div className="card-title">
                <IconGrid />
                <h2>RTGS OUTGOING</h2>
              </div>
            </div>
            <table>
              <thead className="branch-head">
                <tr>
                  <th>Time</th>
                  <th className="Pending">Pending</th>
                  <th className="Wait">Wait</th>
                  <th className="Return">Return</th>
                  <th className="Processed">Processed</th>
                  <th className="UNPR">UNPR</th>
                </tr>
              </thead>
              <tbody>
                {rtgsOutgoingKeys.length > 0 ? (
                  rtgsOutgoingKeys.map((key) => {
                    const rowData = RtgsOutgoing[key];
                    return (
                      <tr key={key}>
                        {Array.isArray(rowData)
                          ? rowData.map((val, i) => (
                            <RtgsOut value={val} i={i} key={i} />
                          ))
                          : null}
                      </tr>
                    );
                  })
                ) : (
                  <tr className='row'>
                    <td colSpan={14} className="text-center opacity-50">Waiting for data...</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className='rtgs-div4'>
          <div className="card-header">
            <div className="card-title">
              <IconGrid />
              <h2>RTGS PENDING FILES</h2>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>File</th>
                {IncomingPendingKeys.length > 0 && rtgsIncomingPend[IncomingPendingKeys[0]]
                  ? rtgsIncomingPend[IncomingPendingKeys[0]].map((_, i) => (
                    <th key={i}>{i === 0 ? "M" : `S${i}`}</th>
                  ))
                  : columns.map((c) => <th key={c}>{c}</th>)}
              </tr>
            </thead>
            <tbody>
              {IncomingPendingKeys.map((key) => {
                const rowIncomingData = rtgsIncomingPend[key];
                return (
                  <Fragment key={key}>
                    <tr>
                      <td>RTGS INCOMING RBI</td>
                      {Array.isArray(rowIncomingData)
                        ? rowIncomingData.map((val, i) => (
                          <PendingFiles value={val} key={i} />
                        ))
                        : null}
                    </tr>
                  </Fragment>
                );
              })}
              {OutgoingPendingKeys.map((key) => {
                const rowOutgoingData = rtgsOutgoingPend[key];
                return (
                  <Fragment key={`out-${key}`}>
                    <tr>
                      <td>RTGS OUTGOING PSG</td>
                      {Array.isArray(rowOutgoingData)
                        ? rowOutgoingData.map((val, i) => (
                          <PendingFiles value={val} key={i} />
                        ))
                        : null}
                    </tr>
                  </Fragment>
                );
              })}
              {IncomingPendingKeys.length === 0 && OutgoingPendingKeys.length === 0 && (
                <tr>
                  <td colSpan={14} className="text-center opacity-50">
                    Waiting for data...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className='rtgs-div4'>
          <div className="card-header">
            <div className="card-title">
              <IconGrid />
              <h2>GATEWAY & ACK MONITORING</h2>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>File</th>
                <th>ERROR</th>
                {columns.map((c) => <th key={c}>{c}</th>)}
              </tr>
            </thead>
            <tbody>
              {
                rtgs12appskeys.map((key) => (
                  <tr key={`gw-${key}`}>
                    <td>Gateway Monitoring</td>
                    <td>{key.toUpperCase()}</td>
                    {Array.isArray(rtgs12Apps[key])
                      ? rtgs12Apps[key].map((val, i) => (
                        <Render12Apps value={val} key={i} />
                      ))
                      : null}
                  </tr>
                ))
              }
              {
                rtgsAck12AppsKeys.map((key) => (
                  <tr key={`gw-${key}`}>
                    <td>ACK Monitoring</td>
                    <td>{key.toUpperCase()}</td>
                    {Array.isArray(rtgsAck12Apps[key])
                      ? rtgsAck12Apps[key].map((val, i) => (
                        <Render12Apps value={val} key={i} />
                      ))
                      : null}
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
