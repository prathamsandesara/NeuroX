# 🤖 AI Models & Algorithms

## 1. Job Description (JD) Intelligence
- **Purpose**: To automatically extract key skills and determine the difficulty level of a job from raw text.
- **Location**: `ml/app_jd_parser.py` (Flask Service).
- **Algorithm**:
  - **TF-IDF Vectorization**: Converts text into numerical vectors.
  - **MultiLabelBinarizer**: Maps predicted indices to skill names.
  - **Scikit-learn Pipeline**: Pre-trained model (`jd_parser.pkl`).
- **Inputs**:
  - `jd_text`: Raw string of the job description.
  - `experience_max`: Used for rule-based difficulty adjustment.
- **Outputs**:
  - `skills`: List of extracted technical skills with confidence weights.
  - `difficulty_level`: Normalized to `FRESHER`, `INTERMEDIATE`, `SENIOR`.

## 2. Assessment Content Generation
- **Purpose**: To generate unique, relevant, and non-trivial questions for every job.
- **Engine**: **Llama-3-70b-versatile** via **Groq API**.
- **Prompt Engineering**:
  - **Context**: "You are an assessment content generator."
  - **Constraints**: "No syntax trivia", "Real-world scenarios", "Strict JSON output".
  - **Few-Shot**: JSON structure examples provided in prompt to ensure parsing reliability.
- **Types Generated**:
  - **MCQ**: 4 options, 1 correct.
  - **Subjective**: Conceptual questions with expected keywords.
  - **Coding**: Problem statement, constraints, and test cases.

## 3. Code Execution Engine
- **Purpose**: To run candidate code securely and verify correctness.
- **Provider**: **Piston API** (or self-hosted Judge0).
- **Languages**: 50+ supported (React/Node defaults to JS, Python supported).
- **Security**: Sandboxed execution to prevent malicious code from harming the server.
- **Evaluation**: Compares `stdout` against `expected_output` for hidden test cases.

## 4. Integrity & Proctoring Model
- **Purpose**: To calculate a "Trust Score" for a candidate's submission.
- **Type**: Behavioral Analysis / Anomaly Detection.
- **Features Analyzed**:
  - `tab_switches`: Frequency of leaving the assessment tab.
  - `time_variance`: Deviation from average time per question.
  - `copy_paste_events`: Frequency of large text insertions.
  - `geo_location`: simple IP checks (if enabled).
- **Output**:
  - `risk_score` (0-100).
  - `risk_level` (Low, Medium, High).
