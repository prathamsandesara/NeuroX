# 🏗️ System Architecture

## High-Level Overview
NeuroX employs a **Microservices-inspired Architecture**, separating the core application logic (Node.js) from the specialized AI/ML processing (Python). The frontend interacts with the Node.js backend, which acts as an API Gateway and Orchestrator, managing data persistence, authentication, and delegating complex tasks to the Flask ML service or external APIs.

## Component Diagram
```mermaid
graph TD
    Client[Client (React + Vite)]
    LB[Load Balancer / Gateway]
    NodeServer[Node.js + Express Server]
    MLServer[Python Flask ML Service]
    DB[(Supabase PostgreSQL)]
    Redis[(Redis Cache)]
    ExtGroq[Groq API (Llama-3)]
    ExtPiston[Piston / Judge0]
    ExtBrevo[Brevo Email]

    Client -->|HTTP/REST| NodeServer
    NodeServer -->|SQL| DB
    NodeServer -->|Cache| Redis
    NodeServer -->|Internal API| MLServer
    NodeServer -->|GenAI| ExtGroq
    NodeServer -->|Code Exec| ExtPiston
    NodeServer -->|SMTP/API| ExtBrevo
    MLServer -->|Load| LocalModels[Local ML Models (.pkl)]
```

## Detailed Components

### 1. Frontend (Client)
- **Role**: Handles user interaction, state management, and visualization.
- **Key Modules**:
    - **Auth Module**: Login, Register, OTP flows.
    - **Recruiter Dashboard**: Job creation, JD upload, Candidate analytics.
    - **Candidate Portal**: Assessment taking interface, IDE (Code Editor).
    - **Admin Panel**: User management, System monitoring.

### 2. Backend (Node.js API)
- **Role**: Central controller for the application.
- **Responsibilities**:
    - **Auth & RBAC**: Validates JWTs and enforces role permissions (Admin, Recruiter, HR, Candidate).
    - **Orchestration**: Calls the ML service for JD parsing and Groq for question generation.
    - **Assessment Engine**: Distributes questions, validates answers, and computes scores.
    - **Integrity Bridge**: Aggregates behavioral data during exams and sends it to the ML service for risk analysis.

### 3. ML Service (Python Flask)
- **Role**: Specialized computation for AI tasks.
- **Endpoints**:
    - `/parse-jd`: Accepts raw text -> Returns Skills, Difficulty, Domain.
    - `/integrity/evaluate` (Concept): Accepts exam metrics -> Returns Risk Score & Flags.

### 4. Database (Supabase)
- **Role**: Persistent storage for all relational data.
- **Key Tables**: `users`, `jobs`, `assessments`, `questions`, `submissions`, `results`, `integrity_logs`.
- **Security**: Row Level Security (RLS) can be enabled for direct access, though the app primarily uses the backend service key.

## Data Flow Patterns

### A. Job Creation Flow
1. Recruiter uploads JD text.
2. Backend sends text to **ML Service**.
3. ML Service extracts skills and normalizes difficulty.
4. Backend saves Job to **Supabase**.
5. Backend calls **Groq API** to generate questions based on extracted skills.
6. Questions are saved to **Supabase**.

### B. Assessment Submission Flow
1. Candidate submits answers (MCQ/Subjective) and Code.
2. Backend calls **Piston** to execute Code against test cases.
3. Backend calculates raw score.
4. Backend aggregates behavioral metrics (time, tab switches, etc.).
5. Backend calls **ML Service** to calculate Integrity Score.
6. Final Result & Integrity Log saved to **Supabase**.


---
## Recent Architectural Updates & Security Hardening (v2.0)
The NeuroX platform has been recently upgraded with the following core features:
1. **Parallelized AI Evaluation Pipeline**: Re-engineered the backend to evaluate MCQs, Subjective answers, and Code execution concurrently using Promise.all with a strict 45-second fallback timeout, eliminating API gateway timeouts.
2. **Resilient Frontend Polling**: Upgraded the candidate Results dashboard with robust closure-safe 20-retry polling loops to fetch evaluation audit reports seamlessly once background processing finishes.
3. **Piston Rate-Limit Fallbacks**: Integrated robust error-handling for the Piston Code Execution Sandbox to automatically provide fallback evaluations if the public API hits 401 Unauthorized limits.
4. **Enhanced UI Contrast & Aesthetics**: Hardened Tailwind Dark-Mode heuristics across all candidate textareas to guarantee pitch-black backgrounds with bright text, maximizing readability during high-stress exams.
5. **Strict JSON Schema Parsing**: Overhauled the LLM assessment generation prompts and frontend regex parsers to prevent duplicate MCQ options from rendering and ensuring flawless data-structure formatting.
6. **Express Proxy Security**: Resolved high-severity 'trust proxy' validation crashes in Express Rate Limiting, securing the authentication endpoints against brute-force while stabilizing application boot sequences.
