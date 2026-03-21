# 📊 Evaluation Logic

## Scoring System
NeuroX uses a deterministic scoring system for MCQs and Code, and a keyword-coverage heuristic for Subjective answers.

### 1. Multiple Choice Questions (MCQ)
- **Weight**: 30% of Total Score.
- **Logic**: Binary Correct/Incorrect.
- **Formula**:
  $$ Score_{MCQ} = \sum (Answer_{user} == Answer_{correct} ? 10 : 0) $$

### 2. Subjective Questions
- **Weight**: 30% of Total Score.
- **Logic**: Concept Coverage.
- **Formula**:
  - The AI generates a list of `expected_concepts` (keywords/phrases) for each question.
  - The system checks if the user's answer contains these concepts (case-insensitive).
  $$ Score_{Subj} = \left( \frac{\text{Concepts Found}}{\text{Total Concepts}} \right) \times 10 $$
- **Example**:
  - Question: "Explain React Hooks."
  - Concepts: ["state", "lifecycle", "functional components"].
  - Answer: "Hooks let you use state in functional components."
  - Match: "state", "functional components" (2/3).
  - Score: 6.67 / 10.

### 3. Coding Challenges
- **Weight**: 40% of Total Score.
- **Logic**: Test Case Pass Rate.
- **Execution**: Code is executed in a sandbox via Piston API.
- **Formula**:
  $$ Score_{Code} = \left( \frac{\text{Tests Passed}}{\text{Total Tests}} \right) \times 40 $$
- **Example**:
  - 3 Test Cases.
  - 2 Pass, 1 Fail (Time Limit Exceeded or Wrong Output).
  - Score: (2/3) * 40 = 26.67.

## Final Aggregation
$$ Total Score = \sum Score_{MCQ} + \sum Score_{Subj} + \sum Score_{Code} $$
$$ Percentage = \left( \frac{Total Score}{Total Max Score} \right) \times 100 $$


---
## Recent Architectural Updates & Security Hardening (v2.0)
The NeuroX platform has been recently upgraded with the following core features:
1. **Parallelized AI Evaluation Pipeline**: Re-engineered the backend to evaluate MCQs, Subjective answers, and Code execution concurrently using Promise.all with a strict 45-second fallback timeout, eliminating API gateway timeouts.
2. **Resilient Frontend Polling**: Upgraded the candidate Results dashboard with robust closure-safe 20-retry polling loops to fetch evaluation audit reports seamlessly once background processing finishes.
3. **Piston Rate-Limit Fallbacks**: Integrated robust error-handling for the Piston Code Execution Sandbox to automatically provide fallback evaluations if the public API hits 401 Unauthorized limits.
4. **Enhanced UI Contrast & Aesthetics**: Hardened Tailwind Dark-Mode heuristics across all candidate textareas to guarantee pitch-black backgrounds with bright text, maximizing readability during high-stress exams.
5. **Strict JSON Schema Parsing**: Overhauled the LLM assessment generation prompts and frontend regex parsers to prevent duplicate MCQ options from rendering and ensuring flawless data-structure formatting.
6. **Express Proxy Security**: Resolved high-severity 'trust proxy' validation crashes in Express Rate Limiting, securing the authentication endpoints against brute-force while stabilizing application boot sequences.
