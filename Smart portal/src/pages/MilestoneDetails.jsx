import React from 'react';
export default function MilestoneDetails() {
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
            <h2 style={{ marginTop: 0 }}>Milestone Details</h2>
        </div>
        <div style={{ marginTop: '1rem', marginBottom: '2rem', lineHeight: '1.5' }}>
            <p>
              This is a placeholder for the <strong>Milestone Details</strong> explanation.<br/>
              Add your content here.
              Lorem ipsum dolor sit amet, consectetur adipisicing elit. Fugit, rerum, omnis debitis at eveniet, repellendus inventore iure molestiae dolorem quo dolorum!
            </p>
        </div>
      </div>
  );
}
