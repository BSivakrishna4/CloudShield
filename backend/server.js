const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware for debugging and demonstration
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

/**
 * In-Memory AWS Resilience Simulation State
 */
const initialServers = [
  {
    id: 'server-1',
    name: 'EC2-SERVER-1',
    status: 'HEALTHY',
    zone: 'us-east-1a',
    ip: '10.0.1.42',
    type: 't3.micro'
  },
  {
    id: 'server-2',
    name: 'EC2-SERVER-2',
    status: 'HEALTHY',
    zone: 'us-east-1b',
    ip: '10.0.2.88',
    type: 't3.micro'
  }
];

let simulationState = {
  applicationStatus: 'HEALTHY',
  loadBalancerStatus: 'ACTIVE',
  autoScalingStatus: 'ENABLED',
  fisStatus: 'NOT RUNNING',
  activeServerId: 'server-1',
  servers: JSON.parse(JSON.stringify(initialServers)),
  logs: [
    {
      id: 1,
      timestamp: new Date().toISOString(),
      type: 'INFO',
      source: 'ALB',
      message: 'Application Load Balancer initialized. Target Group registered 2 healthy targets.'
    },
    {
      id: 2,
      timestamp: new Date().toISOString(),
      type: 'INFO',
      source: 'ASG',
      message: 'Auto Scaling Group steady state: Minimum=2, Desired=2, Maximum=4.'
    }
  ]
};

let autoScalingTimer = null;

// Helper to log AWS Telemetry events
function addTelemetryLog(source, type, message) {
  const newLog = {
    id: Date.now() + Math.floor(Math.random() * 1000),
    timestamp: new Date().toISOString(),
    type, // 'INFO', 'WARN', 'ERROR', 'SUCCESS'
    source, // 'ALB', 'ASG', 'FIS', 'HEALTH'
    message
  };
  simulationState.logs.unshift(newLog);
  // Keep max 50 log events
  if (simulationState.logs.length > 50) {
    simulationState.logs.pop();
  }
}

// Recalculate system status based on current server states
function updateSystemHealth() {
  const healthyServers = simulationState.servers.filter(s => s.status === 'HEALTHY');

  if (healthyServers.length === 0) {
    simulationState.applicationStatus = 'CRITICAL (ALL INSTANCES FAILED)';
    simulationState.activeServerId = null;
    simulationState.loadBalancerStatus = 'DEGRADED (NO HEALTHY TARGETS)';
  } else {
    // If active server is no longer healthy, perform failover to another healthy server
    const currentActive = simulationState.servers.find(s => s.id === simulationState.activeServerId);
    if (!currentActive || currentActive.status !== 'HEALTHY') {
      const newActive = healthyServers[0];
      simulationState.activeServerId = newActive.id;
      simulationState.applicationStatus = 'HEALTHY (FAILOVER ACTIVE)';
      simulationState.loadBalancerStatus = 'ACTIVE (REROUTED)';

      addTelemetryLog(
        'ALB',
        'WARN',
        `ALB Target Group Health Check failed for previous instance. Traffic rerouted to ${newActive.name} (${newActive.zone}).`
      );
    } else {
      if (simulationState.servers.some(s => s.status === 'FAILED')) {
        simulationState.applicationStatus = 'DEGRADED (1 INSTANCE DOWN)';
      } else {
        simulationState.applicationStatus = 'HEALTHY';
        simulationState.loadBalancerStatus = 'ACTIVE';
      }
    }
  }
}

/**
 * @route   GET /api/health
 * @desc    Load Balancer health check endpoint
 */
app.get('/api/health', (req, res) => {
  try {
    const activeServer = simulationState.servers.find(s => s.id === simulationState.activeServerId);
    if (!activeServer || activeServer.status !== 'HEALTHY') {
      return res.status(503).json({
        status: 'unhealthy',
        message: 'No healthy EC2 target available in load balancer target group'
      });
    }

    res.status(200).json({
      status: 'healthy',
      serverName: activeServer.name,
      serverId: activeServer.id,
      zone: activeServer.zone
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Health check failed',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/status
 * @desc    Get comprehensive infrastructure resilience status and active simulation state
 */
app.get('/api/status', (req, res) => {
  try {
    updateSystemHealth();
    const activeServer = simulationState.servers.find(s => s.id === simulationState.activeServerId);

    const statusPayload = {
      applicationStatus: simulationState.applicationStatus,
      serverName: activeServer ? activeServer.name : 'NO_ACTIVE_SERVER',
      serverId: simulationState.activeServerId || 'none',
      loadBalancerStatus: simulationState.loadBalancerStatus,
      autoScalingStatus: simulationState.autoScalingStatus,
      fisStatus: simulationState.fisStatus,
      servers: simulationState.servers,
      logs: simulationState.logs
    };

    res.status(200).json(statusPayload);
  } catch (error) {
    res.status(500).json({
      applicationStatus: 'ERROR',
      message: 'Failed to retrieve application status',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/simulator/fis-inject
 * @desc    Simulate AWS FIS experiment injection (e.g. aws:ec2:stop-instances / terminate)
 */
app.post('/api/simulator/fis-inject', (req, res) => {
  try {
    const { targetServerId } = req.body;
    const targetId = targetServerId || simulationState.activeServerId || 'server-1';
    const targetServer = simulationState.servers.find(s => s.id === targetId);

    if (!targetServer) {
      return res.status(404).json({ error: 'Target instance not found' });
    }

    // Mark FIS as running
    simulationState.fisStatus = 'RUNNING (aws:ec2:terminate-instances)';
    targetServer.status = 'FAILED';

    addTelemetryLog(
      'FIS',
      'ERROR',
      `[AWS FIS Experiment EXP-8821] Fault Action aws:ec2:terminate-instances injected on ${targetServer.name} (${targetServer.id}). Instance state: SHUTTING-DOWN.`
    );

    // Update ALB status
    updateSystemHealth();

    // Trigger Auto Scaling Group self-healing simulation
    simulationState.autoScalingStatus = 'SCALING_OUT (REPLACING_INSTANCE)';
    addTelemetryLog(
      'ASG',
      'WARN',
      `CloudWatch Alarm EC2_Unhealthy_Host triggered. Auto Scaling launching replacement instance in ${targetServer.zone}.`
    );

    // Clear any existing timer
    if (autoScalingTimer) clearTimeout(autoScalingTimer);

    // Simulate ASG provisioning replacement instance after 6 seconds
    autoScalingTimer = setTimeout(() => {
      const newServerNum = simulationState.servers.length + 1;
      const newServer = {
        id: `server-${Date.now().toString().slice(-4)}`,
        name: `EC2-SERVER-${newServerNum}`,
        status: 'HEALTHY',
        zone: targetServer.zone || 'us-east-1a',
        ip: `10.0.${newServerNum}.15`,
        type: 't3.micro'
      };

      simulationState.servers.push(newServer);
      simulationState.autoScalingStatus = 'ENABLED (RECOVERY_COMPLETE)';
      simulationState.fisStatus = 'COMPLETED';

      addTelemetryLog(
        'ASG',
        'SUCCESS',
        `Auto Scaling Group successfully launched replacement instance ${newServer.name} (${newServer.id}). Target group health check PASSED.`
      );

      updateSystemHealth();
    }, 6000);

    res.status(200).json({
      message: `FIS Fault injected successfully on ${targetServer.name}`,
      simulationState
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to inject FIS experiment', message: error.message });
  }
});

/**
 * @route   POST /api/simulator/toggle-server
 * @desc    Toggle health state of a specific EC2 server
 */
app.post('/api/simulator/toggle-server', (req, res) => {
  try {
    const { serverId } = req.body;
    const server = simulationState.servers.find(s => s.id === serverId);

    if (!server) {
      return res.status(404).json({ error: 'Server not found' });
    }

    server.status = server.status === 'HEALTHY' ? 'FAILED' : 'HEALTHY';
    addTelemetryLog(
      'HEALTH',
      server.status === 'HEALTHY' ? 'SUCCESS' : 'ERROR',
      `Manual status change: ${server.name} marked as ${server.status}.`
    );

    updateSystemHealth();

    res.status(200).json({
      message: `Status updated for ${server.name}`,
      server,
      simulationState
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle server status', message: error.message });
  }
});

/**
 * @route   POST /api/simulator/reset
 * @desc    Reset simulation state to original 2 healthy servers
 */
app.post('/api/simulator/reset', (req, res) => {
  try {
    if (autoScalingTimer) clearTimeout(autoScalingTimer);

    simulationState = {
      applicationStatus: 'HEALTHY',
      loadBalancerStatus: 'ACTIVE',
      autoScalingStatus: 'ENABLED',
      fisStatus: 'NOT RUNNING',
      activeServerId: 'server-1',
      servers: JSON.parse(JSON.stringify(initialServers)),
      logs: [
        {
          id: Date.now(),
          timestamp: new Date().toISOString(),
          type: 'INFO',
          source: 'SYSTEM',
          message: 'Simulator state reset. Initial 2 EC2 instances restored to HEALTHY state.'
        }
      ]
    };

    res.status(200).json({
      message: 'Simulation reset successfully',
      simulationState
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reset simulation', message: error.message });
  }
});

/**
 * @route   GET /api/simulator/logs
 * @desc    Fetch telemetry logs
 */
app.get('/api/simulator/logs', (req, res) => {
  res.status(200).json({ logs: simulationState.logs });
});

// Root route for quick verification
app.get('/', (req, res) => {
  res.json({
    project: 'CloudShield',
    title: 'AWS Fault Injection Service Resilience Experiment Backend',
    mode: 'AWS Interactive Resilience Simulator',
    endpoints: [
      '/api/health',
      '/api/status',
      '/api/simulator/fis-inject',
      '/api/simulator/toggle-server',
      '/api/simulator/reset',
      '/api/simulator/logs'
    ]
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`CloudShield Backend Server Running (Simulator Mode)`);
  console.log(`Port: ${PORT}`);
  console.log(`Health: http://localhost:${PORT}/api/health`);
  console.log(`Status: http://localhost:${PORT}/api/status`);
  console.log(`====================================================`);
});
