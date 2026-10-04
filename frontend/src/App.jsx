import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Header from './components/Header';
import StatusCard from './components/StatusCard';
import ServerCard from './components/ServerCard';
import ResilienceFlow from './components/ResilienceFlow';
import FisExperiment from './components/FisExperiment';
import NetworkBackground from './components/NetworkBackground';

// API Base URL from environment variable
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function App() {
  // Backend dynamic state fetched from /api/status
  const [backendStatus, setBackendStatus] = useState({
    applicationStatus: 'HEALTHY',
    serverName: 'EC2-SERVER-1',
    serverId: 'server-1',
    loadBalancerStatus: 'ACTIVE',
    autoScalingStatus: 'ENABLED',
    fisStatus: 'NOT RUNNING'
  });

  // Registered EC2 instances state from backend
  const [servers, setServers] = useState([
    {
      id: 'server-1',
      name: 'EC2-SERVER-1',
      status: 'HEALTHY',
      zone: 'us-east-1a'
    },
    {
      id: 'server-2',
      name: 'EC2-SERVER-2',
      status: 'HEALTHY',
      zone: 'us-east-1b'
    }
  ]);

  // Telemetry logs
  const [logs, setLogs] = useState([]);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Theme state: defaults to dark mode
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('cloudshield-theme');
    return saved !== null ? saved === 'dark' : true;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('cloudshield-theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('cloudshield-theme', 'light');
    }
  }, [darkMode]);

  /**
   * Query status from backend API using Axios
   */
  const fetchStatus = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setErrorMessage(null);

    try {
      const response = await axios.get(`${API_URL}/api/status`, {
        timeout: 5000
      });

      if (response.data) {
        setBackendStatus(response.data);
        if (response.data.servers) setServers(response.data.servers);
        if (response.data.logs) setLogs(response.data.logs);
      }
    } catch (err) {
      console.error('Failed to query backend status:', err);
      const detail = err.response?.data?.message || err.message || 'Connection refused';
      setErrorMessage(`Backend unavailable: ${detail} (Endpoint: ${API_URL}/api/status). Ensure backend server is running.`);
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  // Initial fetch and auto-polling every 2.5 seconds to keep simulator status updated
  useEffect(() => {
    fetchStatus();
    const interval = setInterval(() => {
      fetchStatus(true);
    }, 2500);

    return () => clearInterval(interval);
  }, [fetchStatus]);

  /**
   * Trigger AWS FIS Fault Injection on active EC2 server
   */
  const handleInjectFault = async () => {
    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/simulator/fis-inject`, {
        targetServerId: backendStatus.serverId
      });
      await fetchStatus();
    } catch (err) {
      console.error('FIS injection failed:', err);
      alert(`FIS Injection failed: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Reset simulation state to 2 initial healthy instances
   */
  const handleResetSimulation = async () => {
    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/simulator/reset`);
      await fetchStatus();
    } catch (err) {
      console.error('Simulation reset failed:', err);
      alert(`Reset failed: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Toggle server health state for individual EC2 server card
   */
  const handleToggleServerStatus = async (serverId) => {
    try {
      await axios.post(`${API_URL}/api/simulator/toggle-server`, { serverId });
      await fetchStatus();
    } catch (err) {
      console.error('Failed to toggle server status:', err);
      // Local fallback if backend toggle fails
      setServers((prev) =>
        prev.map((srv) => {
          if (srv.id === serverId) {
            const newStatus = srv.status === 'HEALTHY' ? 'FAILED' : 'HEALTHY';
            return { ...srv, status: newStatus };
          }
          return srv;
        })
      );
    }
  };

  // Helper to format values to Title Case (e.g. "HEALTHY" -> "Healthy")
  const toTitleCase = (str) => {
    if (!str) return '—';
    return str.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const isAppHealthy = (backendStatus.applicationStatus || '').toUpperCase().includes('HEALTHY');
  const isLbActive = (backendStatus.loadBalancerStatus || '').toUpperCase().includes('ACTIVE');
  const isAsgEnabled = (backendStatus.autoScalingStatus || '').toUpperCase().includes('ENABLED') ||
    (backendStatus.autoScalingStatus || '').toUpperCase().includes('SCALING');
  const isFisRunning = (backendStatus.fisStatus || '').toUpperCase().includes('RUNNING') &&
    !(backendStatus.fisStatus || '').toUpperCase().includes('NOT');

  return (
    <div className="dashboard-layout">
      {/* Subtle Animated Cloud/Network Infrastructure Background */}
      <NetworkBackground isDarkMode={darkMode} />

      {/* Main Centered Content */}
      <main className="main-content">
        {/* Bordered Header Container Card */}
        <Header 
          onRefresh={() => fetchStatus(false)} 
          loading={loading} 
          isDarkMode={darkMode} 
          onToggleTheme={() => setDarkMode(!darkMode)} 
        />

        {/* Error notification if backend is unreachable */}
        {errorMessage && (
          <div className="alert-banner" role="alert">
            <div className="alert-banner-left">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{errorMessage}</span>
            </div>
            <button
              className="alert-close-btn"
              onClick={() => setErrorMessage(null)}
              title="Dismiss error message"
            >
              ✕
            </button>
          </div>
        )}

        {/* Page Title Section */}
        <section className="page-heading-section">
          <div className="page-title-row">
            <div>
              <h1 className="page-title">Cloud Resilience Overview</h1>
              <p className="page-desc">
                Monitor application health, infrastructure availability, and fault-injection status.
              </p>
            </div>
            <span className="mode-badge">
              <span className="mode-dot"></span>
              AWS Simulator Mode Active
            </span>
          </div>
        </section>

        {/* 5-Card Status Overview Row with Defined Borders */}
        <section className="status-grid" aria-label="Resilience Status Overview">
          <StatusCard
            label="Application"
            value={toTitleCase(backendStatus.applicationStatus)}
            indicatorText={isAppHealthy ? "Operational" : "Degraded"}
            indicatorState={isAppHealthy ? "healthy" : "failed"}
          />
          <StatusCard
            label="Current Active Server"
            value={backendStatus.serverName || "EC2-SERVER-1"}
            isMono={true}
            indicatorText="Serving Traffic"
            indicatorState="healthy"
          />
          <StatusCard
            label="Load Balancer"
            value={toTitleCase(backendStatus.loadBalancerStatus)}
            indicatorText={isLbActive ? "Operational" : "Inactive"}
            indicatorState={isLbActive ? "healthy" : "failed"}
          />
          <StatusCard
            label="Auto Scaling"
            value={toTitleCase(backendStatus.autoScalingStatus)}
            indicatorText={isAsgEnabled ? "Configured" : "Disabled"}
            indicatorState={isAsgEnabled ? "healthy" : "neutral"}
          />
          <StatusCard
            label="FIS Experiment"
            value={toTitleCase(backendStatus.fisStatus)}
            indicatorText={isFisRunning ? "Running" : "Idle"}
            indicatorState={isFisRunning ? "warning" : "neutral"}
          />
        </section>

        {/* AWS Fault Injection Service Section Card & Telemetry Console */}
        <FisExperiment 
          fisStatus={backendStatus.fisStatus}
          onInjectFault={handleInjectFault}
          onResetSimulation={handleResetSimulation}
          logs={logs}
          activeServerName={backendStatus.serverName}
          loading={loading}
        />

        {/* EC2 Instances Section Cards */}
        <section className="instances-section">
          <div className="section-header-block">
            <div>
              <h2 className="section-title">EC2 Compute Instances</h2>
              <p className="section-subtitle">Instances registered with the Application Load Balancer Target Group</p>
            </div>
          </div>

          <div className="instances-grid">
            {servers.map((server) => (
              <ServerCard
                key={server.id}
                server={server}
                isCurrentServed={server.id === backendStatus.serverId || server.name === backendStatus.serverName}
                onToggleStatus={handleToggleServerStatus}
              />
            ))}
          </div>
        </section>

        {/* Resilience Architecture Flow Diagram */}
        <ResilienceFlow 
          activeServerName={backendStatus.serverName}
          isAppHealthy={isAppHealthy}
          isLbActive={isLbActive}
          isFisRunning={isFisRunning}
        />

        {/* Minimal Footer Container */}
        <footer className="dashboard-footer">
          <p>
            <strong>CloudShield</strong> &bull; AWS Fault Injection Service Resilience Experiment Dashboard
          </p>
        </footer>
      </main>
    </div>
  );
}

