# CloudShield

## Official Project Title
**AWS Fault Injection Service Resilience Experiment**

---

## Purpose
CloudShield is designed to demonstrate and monitor cloud application resilience. It tests system fault tolerance by observing how the application architecture behaves when controlled infrastructure failures (such as EC2 instance terminations, network latency, or CPU stress) are intentionally introduced using AWS Fault Injection Service (FIS).

---

## Technologies
- **Frontend**: React, Vite, JavaScript, Axios, CSS (Dark-themed Glassmorphism Dashboard)
- **Backend**: Node.js, Express.js, CORS, dotenv
- **Cloud Architecture (Target Deployment)**:
  - AWS Application Load Balancer (ALB)
  - Amazon EC2 Instances
  - Auto Scaling Group (ASG)
  - Amazon CloudWatch
  - AWS Fault Injection Service (FIS)

---

## Project Structure
```text
CloudShield/
├── backend/
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   ├── README.md
│   └── server.js
├── frontend/
│   ├── .env
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx
│       ├── index.css
│       ├── main.jsx
│       └── components/
│           ├── FisExperiment.jsx
│           ├── Header.jsx
│           ├── ResilienceFlow.jsx
│           ├── ServerCard.jsx
│           └── StatusCard.jsx
└── README.md
```

---

## Running the Application Locally

### 1. Run Backend
Open a terminal in the `backend` directory:
```bash
cd backend
npm install
node server.js
```
The backend server starts on `http://localhost:5000`.

### 2. Run Frontend
Open a second terminal in the `frontend` directory:
```bash
cd frontend
npm install
npm run dev
```
The frontend dashboard will be available at `http://localhost:3000`.

---

## API Endpoints

### 1. `GET /api/health`
Lightweight health check endpoint designed for AWS Application Load Balancer (ALB) target group health checks.
- **Sample Response**:
  ```json
  {
    "status": "healthy",
    "serverName": "EC2-SERVER-1"
  }
  ```

### 2. `GET /api/status`
Comprehensive resilience status endpoint consumed dynamically by the CloudShield frontend dashboard.
- **Sample Response**:
  ```json
  {
    "applicationStatus": "HEALTHY",
    "serverName": "EC2-SERVER-1",
    "serverId": "server-1",
    "loadBalancerStatus": "ACTIVE",
    "autoScalingStatus": "ENABLED",
    "fisStatus": "NOT RUNNING"
  }
  ```

---

## Environment Variables

### Backend (`backend/.env`)
| Variable | Default Value | Description |
|---|---|---|
| `PORT` | `5000` | Port for the Express server |
| `SERVER_NAME` | `EC2-SERVER-1` | Identifier for the running server instance |
| `SERVER_ID` | `server-1` | Unique ID of the node |
| `APPLICATION_STATUS` | `HEALTHY` | System health status |
| `LOAD_BALANCER_STATUS` | `ACTIVE` | Status of load balancer routing |
| `AUTO_SCALING_STATUS` | `ENABLED` | Auto Scaling Group state |
| `FIS_STATUS` | `NOT RUNNING` | Current AWS FIS experiment state |

### Frontend (`frontend/.env`)
| Variable | Default Value | Description |
|---|---|---|
| `VITE_API_URL` | `http://localhost:5000` | Base URL of the backend API service |

---

## Future AWS Deployment Architecture
When deployed to AWS:
1. **Frontend**: Hosted on S3 + CloudFront or served via static hosting.
2. **Application Load Balancer (ALB)**: Receives client traffic and performs `/api/health` target checks.
3. **EC2 Instances & Auto Scaling**: Express backend instances across multiple Availability Zones with custom `SERVER_NAME` configured per instance.
4. **AWS Fault Injection Service (FIS)**: Injects targeted outages (e.g., stopping an EC2 instance) to validate zero-downtime failover and automated ASG instance replacement.
