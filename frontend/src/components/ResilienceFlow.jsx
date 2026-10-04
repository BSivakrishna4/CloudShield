import React from 'react';

/**
 * ResilienceFlow Component
 * Minimal enterprise diagram representing the cloud fault tolerance pipeline:
 * User -> Application Load Balancer -> Active EC2 Compute Fleet -> Auto Scaling -> Recovery
 */
export default function ResilienceFlow({ activeServerName, isAppHealthy, isLbActive, isFisRunning }) {
  const steps = [
    { title: 'User / Client', desc: 'Inbound HTTP Traffic', status: 'active' },
    { title: 'AWS ALB', desc: isLbActive ? 'Target Group Active' : 'Rerouting Traffic', status: isLbActive ? 'active' : 'warning' },
    { title: 'EC2 Compute Fleet', desc: `Serving: ${activeServerName || 'EC2-SERVER-1'}`, status: isAppHealthy ? 'active' : 'failed' },
    { title: 'Auto Scaling', desc: isFisRunning ? 'Scaling Out / Healing' : 'ASG Desired State (2)', status: isFisRunning ? 'warning' : 'active' },
    { title: 'Self-Healing', desc: 'Automated Recovery', status: 'active' }
  ];

  return (
    <section className="architecture-section">
      <div className="section-header-block">
        <div>
          <h2 className="section-title">Resilience Architecture</h2>
          <p className="section-subtitle">Dynamic traffic flow and fault mitigation pipeline under AWS FIS</p>
        </div>
      </div>

      <div className="diagram-card">
        <div className="diagram-flow-row">
          {steps.map((step, idx) => (
            <React.Fragment key={step.title}>
              <div className={`diagram-node node-${step.status}`}>
                <div className="diagram-node-title">{step.title}</div>
                <div className="diagram-node-desc">{step.desc}</div>
              </div>

              {idx < steps.length - 1 && (
                <div className="diagram-arrow" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}

