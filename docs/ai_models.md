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
- **Provider**: **Piston API Engine** (Isolated Runtimes).
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


---
## Recent Architectural Updates & Security Hardening (v2.0)
The NeuroX platform has been recently upgraded with the following core features:
1. **Parallelized AI Evaluation Pipeline**: Re-engineered the backend to evaluate MCQs, Subjective answers, and Code execution concurrently using Promise.all with a strict 45-second fallback timeout, eliminating API gateway timeouts.
2. **Resilient Frontend Polling**: Upgraded the candidate Results dashboard with robust closure-safe 20-retry polling loops to fetch evaluation audit reports seamlessly once background processing finishes.
3. **Piston Rate-Limit Fallbacks**: Integrated robust error-handling for the Piston Code Execution Sandbox to automatically provide fallback evaluations if the public API hits 401 Unauthorized limits.
4. **Enhanced UI Contrast & Aesthetics**: Hardened Tailwind Dark-Mode heuristics across all candidate textareas to guarantee pitch-black backgrounds with bright text, maximizing readability during high-stress exams.
5. **Strict JSON Schema Parsing**: Overhauled the LLM assessment generation prompts and frontend regex parsers to prevent duplicate MCQ options from rendering and ensuring flawless data-structure formatting.
6. **Express Proxy Security**: Resolved high-severity 'trust proxy' validation crashes in Express Rate Limiting, securing the authentication endpoints against brute-force while stabilizing application boot sequences.
