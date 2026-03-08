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
