# Role Based Access Control (RBAC)

## Roles
- **ADMIN**: Full access (manage users, metrics).
- **RECRUITER**: Can manage Jobs, Assessments, and view Candidates/Results.
- **HR**: View Candidate profiles and integrity logs.
- **CANDIDATE**: Can take assessments and view own results.

## Restrictions
| Route | Method | Roles |
|-------|--------|-------|
| `/api/jobs/parse` | POST | RECRUITER, ADMIN |
| `/api/jobs` | GET | RECRUITER, ADMIN |
| `/api/assessments/generate` | POST | RECRUITER, ADMIN |
| `/api/submissions` | POST | CANDIDATE |
| `/api/integrity/evaluate` | POST | Internal/System |

Middleware `roleMiddleware('ROLE')` enforces these rules.
