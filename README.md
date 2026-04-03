<div align="center">
  <br />
  <img src="https://img.icons8.com/nolan/128/cyber-security.png" alt="NeuroX Logo" width="128" />
  <h1><b>NeuroX: Secure AI Assessment Platform</b></h1>
  <h3><i>"Next-Generation Integrity for Technical Hiring"</i></h3>

  <p align="center">
    <img src="https://img.shields.io/badge/Security-Enterprise--Grade-00FF41?style=for-the-badge&logo=shield&logoColor=black" alt="Security" />
    <img src="https://img.shields.io/badge/Architecture-Distributed-00BFFF?style=for-the-badge&logo=kubernetes&logoColor=white" alt="Architecture" />
    <img src="https://img.shields.io/badge/Status-Active-success?style=for-the-badge" alt="Status" />
  </p>

  <p align="center">
    <b>A comprehensive ecosystem for cheat-proof, AI-driven candidate evaluations.</b>
  </p>

  ---
</div>

## 🛡️ Overview

**NeuroX** is a sophisticated platform designed to revolutionize online technical assessments. By leveraging advanced AI and behavioral biometrics, NeuroX ensures total fairness and integrity in the hiring process. Beyond simple browser locking, it monitors real-time candidate behavior, verifies skill authenticity, and automates job-matching with precision.


---

## 🚀 Key Capabilities

### 1. Advanced Anti-Cheat Ecosystem
- **Behavioral Biometrics:** Tracks typing cadence and interaction patterns to distinguish between human and automated input.
- **Active Threat Mitigation:** Real-time blocking of `Ctrl+C`, `Ctrl+V`, and system shortcuts (`Alt+Tab`, `Cmd+S`).
- **Focus Tracking:** Immediate flagging of tab switches, window minimization, or loss of browser focus.
- **Session Integrity:** Automated session termination for repeated policy violations.

### 2. AI-Driven Intelligence
- **JD Parser:** Automatically extracts key skills and requirements from complex Job Descriptions using LLMs.
- **Skill Integrity Model:** Evaluates the "naturalness" of candidate responses to detect AI-generated or copy-pasted solutions.
- **Automated Assessment Generation:** Generates tailored technical questions based on specific job requirements.

### 3. Enterprise Infrastructure
- **Security Command Center:** Forensic-level logs for Admins to investigate every keystroke and system event.
- **Identity Assurance:** Device fingerprinting and session history tracking to prevent account sharing.
- **OTP Verification:** Secure authentication flow using Brevo for transactional email alerts.

---

## 🛠️ Technical Ecosystem

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, Context API |
| **Backend** | Node.js, Express, Supabase (PostgreSQL), Redis |
| **AI/ML** | Python (Flask), Scikit-learn, Groq Llama 3.3, JD Parsing Models |
| **Execution** | Piston Code Execution Engine (Isolated Runtimes) |
| **Infrastructure** | Kubernetes (K8s) Orchestration, Docker |
| **Integrations** | Brevo (SMTP/Email), Groq (LLM Inference) |

---

## 📂 Project Structure

```text
NeuroX/
├── backend/          # Node.js API Service (Auth, Audit, Assessments)
├── frontend/         # React SPA (Vite-powered Dashboard & Editor)
├── ml/               # Python Services (JD Parser, Integrity Evaluation)
├── k8s/              # Kubernetes Deployment Configurations
├── tests/            # Automated Testing Suites
└── SUPABASE_SETUP.md # Database Schema & Supabase Configuration
```

---

## ⚙️ Quick Start

### 1. Prerequisites
- Node.js (v18+)
- Python (v3.9+)
- Redis Server (Running locally or via Docker)
- Supabase Account & Project

### 2. Environment Configuration
Create `.env` files in both `backend/` and `frontend/` directories:

**Backend (`backend/.env`):**
```env
PORT=4000
JWT_SECRET=your_secret_key
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_key
REDIS_URL=redis://localhost:6379
GROQ_API_KEY=your_groq_key
BREVO_API_KEY=your_brevo_key
PISTON_API_URL=https://emkc.org/api/v2/piston/execute
```

### 3. Launching the Platform
Run the unified startup script from the root directory:
```bash
chmod +x run_all.sh
./run_all.sh
```

**Access Points:**
- **Web Interface:** `http://localhost:5173`
- **Core API:** `http://localhost:4000`
- **JD Model:** `http://localhost:5005`
- **Integrity Model:** `http://localhost:5001`

---

<div align="center">
  <p><b>NeuroX</b>: Integrity-First Technical Hiring.</p>
  <p>© 2026. Engineered for Professional Excellence.</p>
</div>
