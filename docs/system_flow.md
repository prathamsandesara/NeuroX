# 🔄 System Flow & User Journeys

## 1. Authentication & Onboarding
### All Roles
- **Registration**: User enters Email, Password -> Backend hashes password -> Generates OTP -> Sends Email via Brevo.
- **Verification**: User enters OTP -> Backend verifies -> updates `is_verified = true`.
- **Login**: User enters Email, Password -> Backend validates hash -> Returns HTTP-Only Cookie with JWT.

## 2. Recruiter Journey
### Job Creation
1.  **Dashboard**: Recruiter clicks "Create New Job".
2.  **Input**: Uploads a Job Description (JD) text file or pastes content.
3.  **Analysis**:
    -   Backend sends JD to `ml-service/parse-jd`.
    -   ML Service identifies "Required Skills" (e.g., React, Python, AWS) and Suggests "Difficulty".
4.  **Review**: Recruiter reviews parsed skills, edits if necessary, and sets "Experience Range".
5.  **Finalize**: Job is saved to Database.

### Assessment Setup
1.  **Generation**: Recruiter clicks "Generate Assessment" for a Job.
2.  **AI Engine**:
    -   Backend triggers Llama-3 (via Groq) to generate questions based on Job Skills & Difficulty.
    -   Generates: 30% MCQ, 30% Subjective, 40% Coding (Default Split).
3.  **Publication**: Assessment is linked to the Job and ready for candidates.

## 3. Candidate Journey
### Taking an Assessment
1.  **Access**: Candidate receives a link or views assigned assessment in Dashboard.
2.  **Environment Check**: System checks browser compatibility (and potentially permissions for proctoring).
3.  **The Exam**:
    -   **Section 1: MCQs** - Standard radio button interface.
    -   **Section 2: Subjective** - Text area for rapid conceptual answers.
    -   **Section 3: Coding** - IDE-like environment.
        -   Candidate types code (Python/JS).
        -   Clicks "Run" -> Code sent to Piston/Judge0.
        -   Output displayed in terminal window.
    -   **Proctoring**:
        -   Tab switches are logged.
        -   Copy-paste events are flagged.
4.  **Submission**:
    -   Candidate clicks "Submit".
    -   Backend calculates score immediately for MCQ/Coding.
    -   Subjective answers are keyword-matched (or graded by AI in future).
5.  **Feedback**: Candidate sees "Assessment Submitted" (Scores hidden until released).

## 4. Admin Journey
-   **User Management**: View all users, ban suspicious accounts.
-   **System Health**: Monitor API usage/errors for Groq/Piston.
-   **Analytics**: View platform-wide statistics (Total Assessments, Pass Rate).

## 5. Integrity Check Flow (Background)
1.  **Trigger**: Upon assessment completion.
2.  **Data Collection**:
    -   `time_taken`
    -   `tab_switches`
    -   `code_similarity` (if checked against others)
3.  **Evaluation**:
    -   Data sent to Integrity Model.
    -   Returns `integrity_score` (0-100) and `risk_flag` (Low/Medium/High).
4.  **Flagging**:
    -   If Risk > Threshold, Recruiter is notified "Potential Malpractice Detected".


---
## Recent Architectural Updates & Security Hardening (v2.0)
The NeuroX platform has been recently upgraded with the following core features:
1. **Parallelized AI Evaluation Pipeline**: Re-engineered the backend to evaluate MCQs, Subjective answers, and Code execution concurrently using Promise.all with a strict 45-second fallback timeout, eliminating API gateway timeouts.
2. **Resilient Frontend Polling**: Upgraded the candidate Results dashboard with robust closure-safe 20-retry polling loops to fetch evaluation audit reports seamlessly once background processing finishes.
3. **Piston Rate-Limit Fallbacks**: Integrated robust error-handling for the Piston Code Execution Sandbox to automatically provide fallback evaluations if the public API hits 401 Unauthorized limits.
4. **Enhanced UI Contrast & Aesthetics**: Hardened Tailwind Dark-Mode heuristics across all candidate textareas to guarantee pitch-black backgrounds with bright text, maximizing readability during high-stress exams.
5. **Strict JSON Schema Parsing**: Overhauled the LLM assessment generation prompts and frontend regex parsers to prevent duplicate MCQ options from rendering and ensuring flawless data-structure formatting.
6. **Express Proxy Security**: Resolved high-severity 'trust proxy' validation crashes in Express Rate Limiting, securing the authentication endpoints against brute-force while stabilizing application boot sequences.
