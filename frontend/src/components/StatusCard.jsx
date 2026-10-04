import React from 'react';

/**
 * StatusCard Component
 * Displays a compact status metric with small uppercase label, crisp value, and status dot indicator.
 */
export default function StatusCard({ label, value, isMono = false, indicatorText, indicatorState = 'healthy' }) {
  // Determine dot color class based on state or value
  const getDotClass = () => {
    if (indicatorState === 'failed') return 'failed';
    if (indicatorState === 'warning') return 'warning';
    if (indicatorState === 'neutral') return 'neutral';
    return 'healthy';
  };

  return (
    <div className="status-card">
      <div className="status-card-label">{label}</div>
      <div className={`status-card-value ${isMono ? 'mono' : ''}`}>{value || '—'}</div>
      <div className="status-indicator-line">
        <span className={`status-dot ${getDotClass()}`}></span>
        <span>{indicatorText}</span>
      </div>
    </div>
  );
}
