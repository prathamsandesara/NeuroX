# 🔌 API Design & Endpoints

## Base URL
`http://localhost:4000/api`

## Authentication (`/auth`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| POST | `/register` | Register new user. | No |
| POST | `/verify-otp` | Verify email OTP. | No |
| POST | `/login` | Login and set HTTP-Only cookie. | No |
| POST | `/logout` | Clear session cookie. | Yes |
| GET | `/me` | Get current user details. | Yes |

## Jobs (`/jobs`)
| Method | Endpoint | Description | Auth Required | Role |
| :--- | :--- | :--- | :--- | :--- |
| POST | `/parse` | Parse JD text via ML. | Yes | Recruiter |
| POST | `/create` | Save new job. | Yes | Recruiter |
| GET | `/` | List created jobs. | Yes | Recruiter |
| GET | `/:id` | Get job details. | Yes | Any |

## Assessments (`/assessments`)
| Method | Endpoint | Description | Auth Required | Role |
| :--- | :--- | :--- | :--- | :--- |
| POST | `/generate` | Generate questions (Groq). | Yes | Recruiter |
| GET | `/:id` | Get questions for assessment. | Yes | Candidate |
| POST | `/submit-code` | Run code on Piston/Judge0. | Yes | Candidate |

## Submissions (`/submissions`)
| Method | Endpoint | Description | Auth Required | Role |
| :--- | :--- | :--- | :--- | :--- |
| POST | `/start` | Start assessment (Create submission). | Yes | Candidate |
| POST | `/submit` | Submit final answers. | Yes | Candidate |
| GET | `/result/:id` | Get result details. | Yes | Any |

## Integrity (`/integrity`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| POST | `/evaluate` | Internal endpoint for ML check. | Service Key |

## Response Format
Standard JSON response for success:
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

Standard JSON response for error:
```json
{
  "success": false,
  "error": "Error message description"
}
```


---
## Recent Architectural Updates & Security Hardening (v2.0)
The NeuroX platform has been recently upgraded with the following core features:
1. **Parallelized AI Evaluation Pipeline**: Re-engineered the backend to evaluate MCQs, Subjective answers, and Code execution concurrently using Promise.all with a strict 45-second fallback timeout, eliminating API gateway timeouts.
2. **Resilient Frontend Polling**: Upgraded the candidate Results dashboard with robust closure-safe 20-retry polling loops to fetch evaluation audit reports seamlessly once background processing finishes.
3. **Piston Rate-Limit Fallbacks**: Integrated robust error-handling for the Piston Code Execution Sandbox to automatically provide fallback evaluations if the public API hits 401 Unauthorized limits.
4. **Enhanced UI Contrast & Aesthetics**: Hardened Tailwind Dark-Mode heuristics across all candidate textareas to guarantee pitch-black backgrounds with bright text, maximizing readability during high-stress exams.
5. **Strict JSON Schema Parsing**: Overhauled the LLM assessment generation prompts and frontend regex parsers to prevent duplicate MCQ options from rendering and ensuring flawless data-structure formatting.
6. **Express Proxy Security**: Resolved high-severity 'trust proxy' validation crashes in Express Rate Limiting, securing the authentication endpoints against brute-force while stabilizing application boot sequences.
