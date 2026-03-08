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
