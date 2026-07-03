import React from 'react';
export default function CBSFlow() {
  return (
    <div style={{
        padding: '2rem',
        fontFamily: 'sans-serif',
        color: 'white',
        backgroundColor: '#1e1e1e',
        borderRadius: '0',
        minWidth: '300px',
        maxWidth: 'none',
        maxHeight: 'none',
        width: '100%',
        boxShadow: 'none',
        overflowY: 'auto',
        boxSizing: 'border-box'
      }}>
        <div style={{ paddingBottom: "1rem", borderBottom: "1px solid #333", marginBottom: "1rem" }}>
            <h2 style={{ marginTop: 0 }}>CBS Flow</h2>
        </div>
        <div style={{ marginTop: '1rem', marginBottom: '2rem', lineHeight: '1.5' }}>
            <p>
              All_Region_Bounce	Region_Switch	Interfaces	Reposting	PostSod	SI	Night_EOD	Night_SOD	Branch_Cut_Off	Sweeps	Region_Switch
            </p>
        </div>
      </div>
  );
}
