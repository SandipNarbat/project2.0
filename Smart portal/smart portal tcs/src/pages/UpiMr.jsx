import React from "react";
import { useState, useEffect } from 'react';
// import "./UpiMr.css";
export default function UpiMr({ data = {} }) {
  const sourceData = data.UpiMrMax || {};
  const dataKeys = sourceData ? Object.keys(sourceData) : [];
  return (
    <div className="container">
      <div className="main-card">
        <div className="main-content">
          <h1 className="main-title">UPI(MR) Max Connection Status for {dataKeys ? dataKeys.length : 0} APPS</h1>
          <div className="stats">
            <div className="stat-item">
              <p className="label">ACTIVE APPS</p>
              <h3>{dataKeys && dataKeys.length > 0 ? dataKeys.length : "No data available"}</h3>
            </div>
          </div>
        </div>
      </div>
      <div className="cluster-header">
        <h3>Clusters Status</h3>
      </div>
      <div className="grid">
        {dataKeys.length > 0 ? (
          dataKeys.map((key, index) => {
            const match = key.match(/\d+/);
            const appNumber = match ? match[0] : index + 1;
            const value = sourceData[key];
            return (
              <div key={key} className="card1">
                <div className="card-top">
                  <div className="card-info">
                    <p className="node-text">
                      Server-APP Number {String(appNumber).padStart(2, "0")}
                    </p>
                    <h3>{key}</h3>
                  </div>
                </div>
                <div className="card-body">
                  <div className="conn">
                    <span>{value} </span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center opacity-50" style={{ gridColumn: '1 / -1' }}>
            Waiting for data...
          </div>
        )}
      </div>
    </div>
  );
}
