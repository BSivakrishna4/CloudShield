import React from 'react';

/**
 * FisExperiment Component
 * Displays AWS Fault Injection Service experiment specifications,
 * interactive simulation trigger controls, and real-time AWS Telemetry logs.
 */
export default function FisExperiment({ fisStatus, onInjectFault, onResetSimulation, logs = [], activeServerName, loading }) {
  const currentStatus = (fisStatus || 'NOT RUNNING').toUpperCase();
  const isRunning = currentStatus.includes('RUNNING') && !currentStatus.includes('NOT');
  const isCompleted = currentStatus.includes('COMPLETED');

  return (
    <section className="fis-section">
      <div className="section-header-block">
        <div>
          <h2 className="section-title">AWS Fault Injection Service & Telemetry</h2>
          <p className="section-subtitle">Controlled chaos experiment engine and real-time infrastructure logs</p>
        </div>
      </div>

      <div className="fis-card">
        <div className="fis-details-grid">
          <span className="fis-field-label">Experiment Target</span>
          <span className="fis-field-value">
            <strong>EC2 Auto Scaling Group ({activeServerName || 'EC2-SERVER-1'})</strong>
          </span>

          <span className="fis-field-label">Fault Action</span>
          <div>
            <code className="fis-action-code">aws:ec2:terminate-instances</code>
          </div>

          <span className="fis-field-label">Simulated Scenario</span>
          <span className="fis-field-value">
            Injects instance termination fault, tests ALB zero-downtime traffic rerouting, and observes Auto Scaling Group self-healing.
          </span>
        </div>

        <div className="fis-status-container">
          <span className="fis-status-heading">Experiment Execution</span>
          <div className={`fis-status-badge ${isRunning ? 'running' : isCompleted ? 'completed' : 'not-running'}`}>
            <span className={`status-dot ${isRunning ? 'warning' : isCompleted ? 'healthy' : 'neutral'}`}></span>
            <span>{currentStatus}</span>
          </div>

          {/* Interactive Simulation Controls */}
          <div className="fis-action-buttons">
            <button
              type="button"
              className="btn-fis-inject"
              onClick={onInjectFault}
              disabled={loading || isRunning}
              title="Inject EC2 termination fault via AWS FIS"
            >
              {isRunning ? (
                <>
                  <span className="spinner-small"></span> Executing FIS Action...
                </>
              ) : (
                '⚡ Inject FIS EC2 Fault'
              )}
            </button>

            <button
              type="button"
              className="btn-fis-reset"
              onClick={onResetSimulation}
              disabled={loading}
              title="Reset simulation to initial 2 healthy servers"
            >
              ↺ Reset Cloud State
            </button>
          </div>
        </div>
      </div>

      {/* Real-time AWS Telemetry Log Terminal */}
      <div className="telemetry-console">
        <div className="telemetry-header">
          <div className="telemetry-title">
            <span className="terminal-dot red"></span>
            <span className="terminal-dot yellow"></span>
            <span className="terminal-dot green"></span>
            <span className="telemetry-label">AWS CloudWatch / ALB Telemetry Event Stream</span>
          </div>
          <span className="telemetry-badge">Live Log Feed ({logs.length} events)</span>
        </div>

        <div className="telemetry-log-body">
          {logs.length === 0 ? (
            <div className="log-empty">No telemetry events logged yet.</div>
          ) : (
            logs.map((log) => {
              const timeStr = new Date(log.timestamp).toLocaleTimeString();
              return (
                <div key={log.id} className={`log-line log-type-${(log.type || 'info').toLowerCase()}`}>
                  <span className="log-time">[{timeStr}]</span>
                  <span className={`log-source source-${(log.source || 'sys').toLowerCase()}`}>
                    [{log.source}]
                  </span>
                  <span className="log-msg">{log.message}</span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}

