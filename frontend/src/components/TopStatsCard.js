import React from 'react';

export default function TopStatsCard({ title, value }) {
  return (
    <div className="col-md-4 mb-3">
      <div className="stats-card">
        <h6>{title}</h6>
        <h2 style={{ color: "#020202ff" }}>{value}</h2>
      </div>
    </div>
  );
}
