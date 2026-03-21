# Syllabus & Learning Outcome Alignment

## Overview
This document maps the features and architectural components of NeuroX to standard **Cyber Security Learning Outcomes**. This demonstrates how the platform serves as a practical implementation of academic cybersecurity concepts.

## Mapping Table

| Cybersecurity Concept | Academic Learning Outcome | NeuroX Implementation / Feature |
| :--- | :--- | :--- |
| **Authentication & Authorization** | "Understand Principle of Least Privilege and Access Control" | **RBAC System**: Distinct roles for Admin, Controller, and Examinee with scoped permissions. |
| **System Security** | "Analyze System Vulnerabilities and Intrusion Detection" | **Intrusion Prevention System**: Monitoring for authorized tools, focus loss, and anomalous environment changes. |
| **Application Security** | "Understand Input Validation and Secure Coding" | **Sandboxed Execution**: `Piston` containers isolate user code to prevent RCE (Remote Code Execution) on the server. |
| **Threat Intelligence** | "Identify and Classify Cyber Threats" | **Threat Modeling**: The platform's mapping of specific behaviors (e.g., velocity spikes) to threat categories (e.g., Script Injection). |
| **Security Operations** | "Implement Logging and Monitoring" | **Audit Trails**: comprehensive logging of all user actions and security violations for post-incident review. |
| **Cryptography** | "Apply Basic Cryptographic Principles" | **Data Protection**: Use of HTTPS/TLS for transport security and hashing for sensitive data storage. |
| **Software Development** | "Secure Software Development Life Cycle (SSDLC)" | **DevSecOps**: Integration of security checks (linting, vulnerability scanning) in the CI/CD pipeline (conceptual). |

## Educational Value
NeuroX can serve as a **Case Study** for students to understand:
1.  How to architect a secure, high-stakes web application.
2.  The trade-offs between usability and security (e.g., strict proctoring vs. user experience).
3.  Practical implementation of Anomaly Detection using Machine Learning.


---
## Recent Architectural Updates & Security Hardening (v2.0)
The NeuroX platform has been recently upgraded with the following core features:
1. **Parallelized AI Evaluation Pipeline**: Re-engineered the backend to evaluate MCQs, Subjective answers, and Code execution concurrently using Promise.all with a strict 45-second fallback timeout, eliminating API gateway timeouts.
2. **Resilient Frontend Polling**: Upgraded the candidate Results dashboard with robust closure-safe 20-retry polling loops to fetch evaluation audit reports seamlessly once background processing finishes.
3. **Piston Rate-Limit Fallbacks**: Integrated robust error-handling for the Piston Code Execution Sandbox to automatically provide fallback evaluations if the public API hits 401 Unauthorized limits.
4. **Enhanced UI Contrast & Aesthetics**: Hardened Tailwind Dark-Mode heuristics across all candidate textareas to guarantee pitch-black backgrounds with bright text, maximizing readability during high-stress exams.
5. **Strict JSON Schema Parsing**: Overhauled the LLM assessment generation prompts and frontend regex parsers to prevent duplicate MCQ options from rendering and ensuring flawless data-structure formatting.
6. **Express Proxy Security**: Resolved high-severity 'trust proxy' validation crashes in Express Rate Limiting, securing the authentication endpoints against brute-force while stabilizing application boot sequences.
