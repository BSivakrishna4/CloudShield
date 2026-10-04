# CloudShield Backend

**AWS Fault Injection Service Resilience Experiment**

Node.js and Express backend service providing health check and infrastructure resilience status APIs.

## Quick Start
```bash
npm install
node server.js
```

## API Endpoints
- `GET /api/health` -> Returns JSON `{ "status": "healthy", "serverName": "EC2-SERVER-1" }`
- `GET /api/status` -> Returns detailed system state for the dashboard

## Environment Variables
Configured in `.env`:
- `PORT=5000`
- `SERVER_NAME=EC2-SERVER-1`
- `SERVER_ID=server-1`
- `APPLICATION_STATUS=HEALTHY`
- `LOAD_BALANCER_STATUS=ACTIVE`
- `AUTO_SCALING_STATUS=ENABLED`
- `FIS_STATUS=NOT RUNNING`
