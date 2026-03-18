# Advanced Cybersecurity & Forensic Features for NeuroX

This document outlines potential high-level, military-grade cybersecurity features that can be implemented into the NeuroX platform to ensure unparalleled integrity, security, and forensic auditing.

## 1. Advanced Device Fingerprinting (Identity Verification)
**Concept:** Utilize Canvas, WebGL, and Audio API fingerprinting (e.g., using FingerprintJS) to generate a deeply unique hardware hash for every computer. 
**Benefit:** Eliminates account sharing. If a candidate creates multiple accounts to take the test multiple times, or delegates the test to someone else on a different machine, the platform immediately flags the hardware mismatch, regardless of IP changes or incognito mode.

## 2. Cryptographic Watermarking (Anti-Leak & Tracing)
**Concept:** Inject invisible, cryptographic "Zero-Width Characters" into the text of the exam questions, or slightly dynamically alter the phrasing uniquely for every single candidate session.
**Benefit:** If a candidate uses their phone to take a picture of a coding question to share online or with an LLM, the invisible watermark is captured. If the image leaks, NeuroX can extract the watermark and trace it back to the exact candidate who leaked it.

## 3. Behavioral Keystroke Dynamics (Typing Biometrics)
**Concept:** Expand on the existing keystroke tracking by implementing machine learning on *how* the user types (flight time between keys, dwell time on keys).
**Benefit:** Creates a unique "typing signature" for the candidate. If the signature drastically changes mid-exam, it indicates someone else has taken over the keyboard. Also detects if code is being typed at an impossible, perfectly rhythmic speed (indicating an automated macro or LLM typing bypass).

## 4. AI-Powered Anomaly & Exploit Detection (Code Execution)
**Concept:** Build a middleware analyzer that dynamically statically analyzes and intercepts candidates' code submissions *before* they are sent to the Piston execution engine.
**Benefit:** Prevent malicious payloads (e.g., `os.system('rm -rf /')`), network exfiltration attempts, fork bombs, or attempts to read sensitive environment variables from the backend execution nodes.

## 5. Session Hijacking Prevention (Strict JWT Binding)
**Concept:** Cryptographically bind the JWT session token to the exact IP Address, AS Number, and User-Agent string of the candidate when the exam begins.
**Benefit:** Currently, if an attacker steals a candidate's JWT token, they can continue the exam from another computer. With strict binding, if the session suddenly jumps to a new IP or device mid-exam, the JWT is instantly invalidated and the exam is terminated.

## 6. Time-Based Two-Factor Authentication (2FA) for Admins
**Concept:** Implement standard MFA (Multi-Factor Authentication) for Recruiters and Admins using TOTP (Google Authenticator, Authy).
**Benefit:** Recruiters have access to highly sensitive PII (Biometric data, webcam feeds, resumes, forensic logs). A compromised recruiter password could lead to a massive data breach. 2FA secures the administrative portal.

## 7. Automated Malware & Vulnerability Scanning of Uploaded Resumes
**Concept:** When a candidate uploads a resume (PDF/Docx), run it through an automated threat scanning engine (like ClamAV) before storing it in Supabase.
**Benefit:** Prevents attackers from uploading weaponized PDFs or macro-enabled documents designed to compromise recruiter machines when they download the candidate's dossier.

## 8. Suspicious Audio Event Detection
**Concept:** Enhance the WebRTC audio stream with browser-side or server-side audio event classification.
**Benefit:** Automatically flags times in the video feed where it detects "speech", "whispering", "keyboard typing" (when they shouldn't be), or "secondary voices" in the room, creating specific alert timestamps for the recruiter to review in the dossier.

## 9. WebRTC End-to-End Encryption (E2EE)
**Concept:** Implement Insertable Streams API for WebRTC to encrypt the video/audio frames before they even hit the signaling server.
**Benefit:** Ensures that even if the backend server infrastructure is completely compromised, the attacker cannot view the live webcam streams of the candidates. Only the authorized recruiter with the correct decryption key can view the stream.

## 10. Rate-Limiting & WAF (Web Application Firewall) Rules Engine
**Concept:** Implement highly granular, route-specific rate limiting and anomaly detection at the application edge.
**Benefit:** Protects against Distributed Denial of Service (DDoS) attacks, brute-force password guessing on the `/login` route, and mass-scraping of candidate data.

## 11. Head Pose & Eye-Tracking via Computer Vision
**Concept:** Analyze the live WebRTC video feed using lightweight, client-side or server-side ML models (like MediaPipe) to track the candidate's eye gazes and head pitch/yaw.
**Benefit:** Automatically flags if the candidate is constantly looking off-screen (e.g. reading from a secondary monitor, a phone hidden off-camera, or notes on the wall).

## 12. Payload Tampering Protection (HMAC Strict Request Signing)
**Concept:** Use an HMAC-SHA256 signature to sign API payloads sent from the frontend to the backend. The frontend mixes a secret nonce with the payload data to generate a hash.
**Benefit:** Blocks candidates who try to intercept the network request using proxy tools (like BurpSuite or Wireshark) to modify their test scores or alter their code submission before it reaches the backend.

## 13. Abstract Syntax Tree (AST) Plagiarism Detection
**Concept:** When a candidate submits code, parse the code into an AST and compare it against a database of known solutions or past candidates using algorithms like MOSS (Measure of Software Similarity).
**Benefit:** Identifies candidates who merely renamed variables or changed white-spacing from copied code, as the structural tree of the code remains identical, effectively capturing sophisticated plagiarism.

## 14. Anti-Headless Browser / Anti-VM Checks
**Concept:** Implement deep checks on the browser's graphics rendering, hardware concurrency, and user-agent APIs to detect if the exam is being run in a Virtual Machine or a Headless Browser (like Puppeteer).
**Benefit:** Prevents automated bots taking the test, and identifies candidates attempting to sand-box the exam inside a VM to bypass host-OS level monitoring or copy-pasting restrictions.

## 15. Real-time NLP Prompt Injection Detection
**Concept:** When a candidate provides a generated or subjective answer, run natural language processing checks against prompt injection techniques (e.g. "Ignore all previous instructions...").
**Benefit:** Prevents candidates from "jailbreaking" the underlying LLM grader by feeding it malicious text to automatically grant them full score or expose grading rubrics.
