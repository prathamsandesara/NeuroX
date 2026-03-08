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
