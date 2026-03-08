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
