# API Documentation

## Auth
- `POST /api/auth/register`: Register new user.
- `POST /api/auth/verify-otp`: Verify email OTP.
- `POST /api/auth/login`: Login and set cookie.
- `GET /api/auth/me`: Get current user.

## Jobs
- `POST /api/jobs/parse`: Parse JD text (Recruiter).
  - Body: `{ jd_text, ... }`
- `GET /api/jobs`: List created jobs.

## Assessments
- `POST /api/assessments/generate`: Generate questions using Groq.
  - Body: `{ jobId }`
- `GET /api/assessments/:id`: Get questions.
- `POST /api/assessments/submit-code`: Run code on Judge0.

## Submissions
- `POST /api/submissions`: Submit final assessment.
- `GET /api/submissions/:id`: Get result details.

## Integrity
- `POST /api/integrity/evaluate`: Check cheating risk.


---
## Recent Architectural Updates & Security Hardening (v2.0)
The NeuroX platform has been recently upgraded with the following core features:
1. **Parallelized AI Evaluation Pipeline**: Re-engineered the backend to evaluate MCQs, Subjective answers, and Code execution concurrently using Promise.all with a strict 45-second fallback timeout, eliminating API gateway timeouts.
2. **Resilient Frontend Polling**: Upgraded the candidate Results dashboard with robust closure-safe 20-retry polling loops to fetch evaluation audit reports seamlessly once background processing finishes.
3. **Piston Rate-Limit Fallbacks**: Integrated robust error-handling for the Piston Code Execution Sandbox to automatically provide fallback evaluations if the public API hits 401 Unauthorized limits.
4. **Enhanced UI Contrast & Aesthetics**: Hardened Tailwind Dark-Mode heuristics across all candidate textareas to guarantee pitch-black backgrounds with bright text, maximizing readability during high-stress exams.
5. **Strict JSON Schema Parsing**: Overhauled the LLM assessment generation prompts and frontend regex parsers to prevent duplicate MCQ options from rendering and ensuring flawless data-structure formatting.
6. **Express Proxy Security**: Resolved high-severity 'trust proxy' validation crashes in Express Rate Limiting, securing the authentication endpoints against brute-force while stabilizing application boot sequences.
