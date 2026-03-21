# 🔐 Security Design

## 1. Authentication & Authorization
-   **JWT (JSON Web Tokens)**: Used for stateless authentication.
-   **HTTP-Only Cookies**: Tokens are stored in `httpOnly` cookies to prevent XSS attacks (Client-side scripts cannot access the token).
-   **Role-Based Access Control (RBAC)**:
    -   Middleware (`authMiddleware.js`) checks `req.user.role` before allowing access to sensitive routes.
    -   **Strict Separation**: Candidates cannot access Recruiter APIs (Job Creation) and vice versa.

## 2. Data Protection
-   **Password Hashing**: User passwords are salted and hashed using **Bcrypt** before storage.
-   **Environment Variables**: Secrets (API Keys, DB Credentials) are loaded via `dotenv` and never committed to version control.
-   **Input Validation**: Backend sanitizes inputs to prevent SQL Injection (though Supabase/PostgREST handles this natively).

## 3. API Security
-   **CORS (Cross-Origin Resource Sharing)**: Configured to allow requests ONLY from the frontend domain.
-   **Rate Limiting**: (Planned) To prevent abuse of expensive AI endpoints (Groq/Piston).
-   **Sandboxed Code Execution**:
    -   Candidate code runs in isolated containers (Piston) with no network access and strict timeout/memory limits.
    -   This prevents `rm -rf /` or infinite loops from crashing the main server.

## 4. Integrity & Anti-Cheating
-   **Behavioral Monitoring**: Tracks tab integrity without invasive surveillance.
-   **Plagiarism Detection**: In-memory comparison of code submissions (Integrity Model).
-   **Ephemeral Exams**: Questions are generated dynamically, reducing the chance of leaked answer keys.


---
## Recent Architectural Updates & Security Hardening (v2.0)
The NeuroX platform has been recently upgraded with the following core features:
1. **Parallelized AI Evaluation Pipeline**: Re-engineered the backend to evaluate MCQs, Subjective answers, and Code execution concurrently using Promise.all with a strict 45-second fallback timeout, eliminating API gateway timeouts.
2. **Resilient Frontend Polling**: Upgraded the candidate Results dashboard with robust closure-safe 20-retry polling loops to fetch evaluation audit reports seamlessly once background processing finishes.
3. **Piston Rate-Limit Fallbacks**: Integrated robust error-handling for the Piston Code Execution Sandbox to automatically provide fallback evaluations if the public API hits 401 Unauthorized limits.
4. **Enhanced UI Contrast & Aesthetics**: Hardened Tailwind Dark-Mode heuristics across all candidate textareas to guarantee pitch-black backgrounds with bright text, maximizing readability during high-stress exams.
5. **Strict JSON Schema Parsing**: Overhauled the LLM assessment generation prompts and frontend regex parsers to prevent duplicate MCQ options from rendering and ensuring flawless data-structure formatting.
6. **Express Proxy Security**: Resolved high-severity 'trust proxy' validation crashes in Express Rate Limiting, securing the authentication endpoints against brute-force while stabilizing application boot sequences.
