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
