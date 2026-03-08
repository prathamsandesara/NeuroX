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
