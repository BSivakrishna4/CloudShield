import React from 'react';

/**
 * ServerCard Component
 * Displays clean professional infrastructure details for an EC2 instance registered with the ALB.
 */
export default function ServerCard({ server, onToggleStatus, isCurrentServed }) {
  const isHealthy = server.status === 'HEALTHY';

  return (
    <div className="server-card">
      <div>
        <div className="server-card-top">
          <div className="server-title-group">
            <svg className="server-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
              <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
              <line x1="6" y1="6" x2="6.01" y2="6" />
              <line x1="6" y1="18" x2="6.01" y2="18" />
            </svg>
            <span className="server-name">{server.name}</span>
          </div>

          <div className={`server-badge ${isHealthy ? 'healthy' : 'failed'}`}>
            <span className={`status-dot ${isHealthy ? 'healthy' : 'failed'}`}></span>
            <span>{isHealthy ? 'Healthy' : 'Failed'}</span>
          </div>
        </div>

        <table className="server-table">
          <tbody>
            <tr>
              <td className="label-col">Availability Zone</td>
              <td className="val-col">{server.zone || 'us-east-1a'}</td>
            </tr>
            <tr>
              <td className="label-col">Target Port</td>
              <td className="val-col">5000</td>
            </tr>
            <tr>
              <td className="label-col">Health Check</td>
              <td className="val-col">/api/health</td>
            </tr>
          </tbody>
        </table>

        <div className="server-tag-bar">
          {isCurrentServed ? (
            <span className="tag-active-target">Active Traffic Target</span>
          ) : (
            <span className="tag-standby-target">Standby Target</span>
          )}
        </div>
      </div>

      <div className="server-actions-box">
        <button
          type="button"
          className={`btn-simulation ${!isHealthy ? 'is-failed' : ''}`}
          onClick={() => onToggleStatus(server.id)}
          title="Toggle failure state for presentation demo"
        >
          {isHealthy ? 'Simulate FIS Failure' : 'Restore Healthy State'}
        </button>
        <span className="simulation-disclaimer">Frontend simulation for demonstration purposes.</span>
      </div>
    </div>
  );
}
