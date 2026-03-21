# Compliance, Ethics & Legal Considerations

## Overview
NeuroX is committed to ethical AI practices and compliance with relevant legal frameworks regarding digital data and assessment fairness.

## 1. Ethical AI Framework

### Fairness & Bias Mitigation
- **Algorithmic Fairness**: Our scoring algorithms are designed to evaluate technical correctness and problem-solving logic, minimizing bias related to syntax preferences or localized coding styles.
- **Transparency**: The "Integrity Score" is explainable. We provide breakdowns (e.g., "High variance in typing speed") rather than opaque "Cheating" labels.

### Privacy-Preserving Integrity
- **Minimal Data Collection**: We only monitor data strictly necessary for integrity verification (e.g., window focus, input patterns). We do not record video or audio unless explicitly configured and consented to.

## 2. Legal Alignment (Indian IT Act & Global Standards)

NeuroX aligns conceptually with key provisions of the **Information Technology Act, 2000 (India)** and general data protection principles.

- **Section 43 (Damage to Computer Systems)**: NeuroX implements strict access controls and unauthorized access prevention to protect the assessment infrastructure.
- **Section 66 (Computer Related Offences)**: The platform's "Intrusion Prevention" mechanisms help mitigate and document dishonest acts affecting the assessment computer resource.
- **Data Protection**: We adhere to principles of purpose limitation and data minimization. Candidate data is used solely for the purpose of assessment and evaluation.

## 3. Data Privacy & Handling

- **Consent**: Users are informed of the monitoring mechanisms (focus tracking, etc.) before the assessment begins.
- **Right to Access**: Examinees can request a summary of their performance and the basis of their evaluation.
- **Data Retention**: Assessment data is retained only for the duration required for the recruitment/evaluation cycle and is securely archived or purged thereafter.


---
## Recent Architectural Updates & Security Hardening (v2.0)
The NeuroX platform has been recently upgraded with the following core features:
1. **Parallelized AI Evaluation Pipeline**: Re-engineered the backend to evaluate MCQs, Subjective answers, and Code execution concurrently using Promise.all with a strict 45-second fallback timeout, eliminating API gateway timeouts.
2. **Resilient Frontend Polling**: Upgraded the candidate Results dashboard with robust closure-safe 20-retry polling loops to fetch evaluation audit reports seamlessly once background processing finishes.
3. **Piston Rate-Limit Fallbacks**: Integrated robust error-handling for the Piston Code Execution Sandbox to automatically provide fallback evaluations if the public API hits 401 Unauthorized limits.
4. **Enhanced UI Contrast & Aesthetics**: Hardened Tailwind Dark-Mode heuristics across all candidate textareas to guarantee pitch-black backgrounds with bright text, maximizing readability during high-stress exams.
5. **Strict JSON Schema Parsing**: Overhauled the LLM assessment generation prompts and frontend regex parsers to prevent duplicate MCQ options from rendering and ensuring flawless data-structure formatting.
6. **Express Proxy Security**: Resolved high-severity 'trust proxy' validation crashes in Express Rate Limiting, securing the authentication endpoints against brute-force while stabilizing application boot sequences.
