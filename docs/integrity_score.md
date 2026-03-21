# 🛡️ Integrity Score & Proctoring

## Overview
The **NeuroX Integrity Score** is a composite metric that estimates the likelihood of malpractice during an assessment. It aggregates behavioral signals and browser events to flag suspicious activity without requiring invasive webcam monitoring.

## Input Signals
1.  **Tab Switches (`tab_switches`)**:
    -   Count of `visibilitychange` events triggered by the browser.
    -   *High Risk*: > 5 switches per hour.
2.  **Focus Lost Time (`focus_lost_time`)**:
    -   Total duration (seconds) the assessment tab was not active.
    -   *High Risk*: > 5 minutes total.
3.  **Copy-Paste Events (`paste_count`)**:
    -   Number of large text blocks pasted into subjective/coding areas.
    -   *High Risk*: Frequent large pastes.
4.  **Time Variance (`time_variance`)**:
    -   Analysis of time spent per question vs. difficulty.
    -   *Suspicious*: Answering complex coding questions in < 30 seconds.

## Scoring Algorithm (Simplified)
The integrity score starts at **100** and deducts points based on infractions.

$$ Score = 100 - (Switches \times 5) - (PasteEvents \times 2) - (FocusLostMinutes \times 2) $$

## Risk Levels
| Integrity Score | Risk Level | Action |
| :--- | :--- | :--- |
| **90 - 100** | 🟢 **LOW** | Auto-Approve. |
| **70 - 89** | 🟡 **MEDIUM** | Highlight for Recruiter Review. |
| **< 70** | 🔴 **HIGH** | Flag as "Potential Malpractice". |

## Privacy Note
NeuroX does **not** record video or audio. It relies entirely on browser telemetry to ensure candidate privacy while maintaining assessment validity.


---
## Recent Architectural Updates & Security Hardening (v2.0)
The NeuroX platform has been recently upgraded with the following core features:
1. **Parallelized AI Evaluation Pipeline**: Re-engineered the backend to evaluate MCQs, Subjective answers, and Code execution concurrently using Promise.all with a strict 45-second fallback timeout, eliminating API gateway timeouts.
2. **Resilient Frontend Polling**: Upgraded the candidate Results dashboard with robust closure-safe 20-retry polling loops to fetch evaluation audit reports seamlessly once background processing finishes.
3. **Piston Rate-Limit Fallbacks**: Integrated robust error-handling for the Piston Code Execution Sandbox to automatically provide fallback evaluations if the public API hits 401 Unauthorized limits.
4. **Enhanced UI Contrast & Aesthetics**: Hardened Tailwind Dark-Mode heuristics across all candidate textareas to guarantee pitch-black backgrounds with bright text, maximizing readability during high-stress exams.
5. **Strict JSON Schema Parsing**: Overhauled the LLM assessment generation prompts and frontend regex parsers to prevent duplicate MCQ options from rendering and ensuring flawless data-structure formatting.
6. **Express Proxy Security**: Resolved high-severity 'trust proxy' validation crashes in Express Rate Limiting, securing the authentication endpoints against brute-force while stabilizing application boot sequences.
