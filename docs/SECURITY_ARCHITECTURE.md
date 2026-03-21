# Security Architecture & Access Control

## Overview
NeuroX is designed with a **Security-First** approach, implementing a comprehensive **Role-Based Access Control (RBAC)** model and leveraging containerization for robust service isolation. This document outlines the architectural security mechanisms that protect the platform's integrity.

## 1. Role-Based Access Control (RBAC)

NeuroX enforces strict separation of duties through granular roles.

| Role | Access Level | Description |
| :--- | :--- | :--- |
| **Admin / Superuser** | Level 0 (Root) | Full system control. Manages configuration, user provisioning, and high-level audits. |
| **Controller (Recruiter)** | Level 1 (Privileged) | Can define assessment policies, view integrity reports, and initiate incident response reviews. |
| **Examinee (Candidate)** | Level 2 (Restricted) | Limited access. Can only access assigned assessment modules within a sandboxed environment. |

### Session Management
- **Token-Based Authentication**: Uses secure JWT (JSON Web Tokens) for stateless, tamper-proof session handling.
- **Session Expiry**: Strict timeouts are enforced to prevent session hijacking.
- **Secure Cookies**: HttpOnly and Secure flags are used to mitigate XSS and Man-in-the-Middle attacks.

## 2. Infrastructure Security & Isolation

### Containerization & Kubernetes
NeuroX leverages container technology to ensure **Secure Service Isolation**.

- **App Isolation**: The Frontend, Backend, and AI Services run in separate containers, limiting the blast radius of any potential compromise.
- **Code Execution Sandbox**: The `Piston` service runs user-submitted code in ephemeral, highly restricted containers with no network access, preventing malicious code execution on the host.
- **Controlled Scaling**: Kubernetes allows for automated scaling based on load, preventing Denial of Service (DoS) due to resource exhaustion securely.

### Network Security
- **API Gateway Pattern**: All external requests are routed through a central gateway that enforces rate limiting and input validation.
- **Internal Traffic**: Communication between microservices (e.g., Backend -> AI Model) behaves as a trusted internal network, not exposed to the public internet.

## 3. Data Privacy & Encryption

- **Data at Rest**: Sensitive candidate data and assessment results are stored in secure databases with access controls.
- **Data in Transit**: All communication is encrypted via TLS/SSL (HTTPS).
- **Anonymization**: Integrity scoring processes use anonymized data where possible to ensure unbiased evaluation.


---
## Recent Architectural Updates & Security Hardening (v2.0)
The NeuroX platform has been recently upgraded with the following core features:
1. **Parallelized AI Evaluation Pipeline**: Re-engineered the backend to evaluate MCQs, Subjective answers, and Code execution concurrently using Promise.all with a strict 45-second fallback timeout, eliminating API gateway timeouts.
2. **Resilient Frontend Polling**: Upgraded the candidate Results dashboard with robust closure-safe 20-retry polling loops to fetch evaluation audit reports seamlessly once background processing finishes.
3. **Piston Rate-Limit Fallbacks**: Integrated robust error-handling for the Piston Code Execution Sandbox to automatically provide fallback evaluations if the public API hits 401 Unauthorized limits.
4. **Enhanced UI Contrast & Aesthetics**: Hardened Tailwind Dark-Mode heuristics across all candidate textareas to guarantee pitch-black backgrounds with bright text, maximizing readability during high-stress exams.
5. **Strict JSON Schema Parsing**: Overhauled the LLM assessment generation prompts and frontend regex parsers to prevent duplicate MCQ options from rendering and ensuring flawless data-structure formatting.
6. **Express Proxy Security**: Resolved high-severity 'trust proxy' validation crashes in Express Rate Limiting, securing the authentication endpoints against brute-force while stabilizing application boot sequences.
