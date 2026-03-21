# 🛠️ Tech Stack Documentation

## Overview
NeuroX is built on a modern, scalable technology stack designed for high performance, security, and real-time interaction. It leverages the MERN stack (MongoDB replaced by PostgreSQL/Supabase), Python for ML services, and various third-party APIs for specialized functions.

## 💻 Frontend (Client-Side)
- **Framework**: [React.js](https://react.dev/) (v18+) - Component-based UI architecture.
- **Build Tool**: [Vite](https://vitejs.dev/) - Blazing fast build tool and development server.
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework for rapid UI development.
- **Routing**: [React Router DOM](https://reactrouter.com/) - Client-side routing for SPA.
- **HTTP Client**: [Axios](https://axios-http.com/) - Promise-based HTTP client for API requests.
- **State Management**: React Context API / Hooks.
- **Icons**: [Lucide React](https://lucide.dev/) / Heroicons.

## ⚙️ Backend (Server-Side)
- **Runtime**: [Node.js](https://nodejs.org/) - JavaScript runtime environment.
- **Framework**: [Express.js](https://expressjs.com/) - Minimalist web framework for Node.js.
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL) - Open-source Firebase alternative with real-time capabilities.
- **Authentication**: JWT (JSON Web Tokens) with HTTP-Only Cookies & Supabase Auth.
- **Caching/Session**: [Redis](https://redis.io/) (Optional/Configurable) - In-memory data structure store for OTPs.

## 🤖 AI & Machine Learning
- **ML Service**: [Python](https://www.python.org/) & [Flask](https://flask.palletsprojects.com/) - Microservice for JD parsing and integrity checks.
- **JD Parser**: Custom Scikit-learn model (`jd_parser.pkl`) using TF-IDF and MultiLabelBinarizer.
- **Content Generation**: [Groq API](https://groq.com/) (Llama-3 models) - Generates assessment questions (MCQ, Subjective).
- **Code Execution**: [Piston API](https://github.com/engineer-man/piston) / [Judge0](https://judge0.com/) - Sandboxed code execution environment.

## ☁️ Infrastructure & DevOps
- **Hosting**: Vercel (Frontend), Render/Railway (Backend & ML).
- **Version Control**: Git & GitHub.
- **Email Service**: [Brevo](https://www.brevo.com/) (formerly Sendinblue) - Transactional emails for OTPs.
- **API Testing**: Postman / ThunderClient.

## 📦 Third-Party Libraries
- **Data Visualization**: Chart.js / Recharts (for Analytics Dashboard).
- **Rich Text Editor**: React Quill (if applicable for JD input).
- **Date Handling**: date-fns / moment.js.


---
## Recent Architectural Updates & Security Hardening (v2.0)
The NeuroX platform has been recently upgraded with the following core features:
1. **Parallelized AI Evaluation Pipeline**: Re-engineered the backend to evaluate MCQs, Subjective answers, and Code execution concurrently using Promise.all with a strict 45-second fallback timeout, eliminating API gateway timeouts.
2. **Resilient Frontend Polling**: Upgraded the candidate Results dashboard with robust closure-safe 20-retry polling loops to fetch evaluation audit reports seamlessly once background processing finishes.
3. **Piston Rate-Limit Fallbacks**: Integrated robust error-handling for the Piston Code Execution Sandbox to automatically provide fallback evaluations if the public API hits 401 Unauthorized limits.
4. **Enhanced UI Contrast & Aesthetics**: Hardened Tailwind Dark-Mode heuristics across all candidate textareas to guarantee pitch-black backgrounds with bright text, maximizing readability during high-stress exams.
5. **Strict JSON Schema Parsing**: Overhauled the LLM assessment generation prompts and frontend regex parsers to prevent duplicate MCQ options from rendering and ensuring flawless data-structure formatting.
6. **Express Proxy Security**: Resolved high-severity 'trust proxy' validation crashes in Express Rate Limiting, securing the authentication endpoints against brute-force while stabilizing application boot sequences.
