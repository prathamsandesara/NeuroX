# NeuroX Project: Feature & Security Summary

This document provides a comprehensive overview of the **NeuroX** platform's specialized cybersecurity features and standard application functionalities.

---

## 🛡️ Cybersecurity & Forensic Features
| Feature | Technical Implementation | Purpose |
| :--- | :--- | :--- |
| **Keystroke Dynamics** | Tracks flight time (latency) between keypresses. | Detects if a bot or script is "typing" answers at a perfectly rhythmic speed. |
| **Tab-Focus Interception** | Uses the browser's `visibilitychange` and `blur` events. | Flags a "Focus Loss" violation if the candidate switches to another tab or app. |
| **Copy-Paste Blockage** | Intercepts $Ctrl+C$ and $Ctrl+V$ keyboard events. | Prevents candidates from pasting pre-written code or copying questions. |
| **Forensic Audit Logs** | Logs event type, IP address, and User-Agent to PostgreSQL. | Provides a "black box" recording of the entire exam session for auditing. |
| **Piston API Sandbox** | Integrates with remote, ephemeral execution environments. | Ensures that candidate-written code never touches the main backend server. |
| **Device Fingerprinting** | Generates a hardware-based hash of the computer. | Prevents "Account Sharing" by flagging if a different machine is used mid-exam. |
| **Health Index Logic** | Calculates a dynamic "Trust Score" (0-100%). | Automatically ranks candidates based on their behavioral honesty. |

---

## 🚀 Standard Application Features
| Feature | Description |
| :--- | :--- |
| **AI Assessment Generator** | Automatically creates test questions based on any job description inputs. |
| **Multi-Role Dashboards** | Custom, distinct portals for Admins (Forensics), Recruiters (Hiring), and Candidates (Testing). |
| **Forensic Export (PDF)** | Generates professional, password-protected reports of candidate performance and violations. |
| **Coding IDE (Monaco-like)** | A full, high-end coding environment built directly into the browser for seamless testing. |
| **Real-time Scoring** | Instant evaluation of both Multiple Choice (MCQ) and complex Coding logic. |
| **Premium Theme System** | Supports Dark/Light modes with high-end glassmorphism design for a modern feel. |

---

## 👨‍🏫 Technical Explanation for Faculty
*Use the following points to explain the technical architecture of NeuroX:*

1.  **Behavioral Biometrics (Keystrokes):**
    > "We don't just check the final answer. We record the *timing* of every keypress. Humans have a unique 'jitter' and variable speed when typing. If the speed is too consistent or too fast, our AI flags it as an automated script injection."

2.  **Forensic Auditing System:**
    > "Every violation (like tab switching or shortcut attempts) is sent to a dedicated `security_audit_log` table in our Supabase database. This includes the IP address and Device Fingerprint, providing immutable proof of the candidate's actions."

3.  **The Sandbox Pattern (Piston):**
    > "To prevent candidates from running 'malicious' code (like trying to delete server files or network scanning), we use the **Piston API Engine**. This executes code in a temporary, isolated container that is destroyed immediately after execution."

4.  **Identity Verification:**
    > "We use 'Device Fingerprinting' which reads browser metadata like screen resolution, timezone, and processing cores. This creates a unique ID. If a candidate starts on one laptop and someone else finishes on another, the system detects the mismatch instantly."
