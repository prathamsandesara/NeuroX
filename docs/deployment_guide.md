# 🚀 Deployment Guide

## Prerequisites
- **Node.js**: v18.x or higher.
- **Python**: v3.9+ (for ML Service).
- **Supabase Account**: For database and auth.
- **Groq API Key**: For AI content generation.
- **Piston Instance**: Public API (emkc.org) or self-hosted.

## 1. Backend Deployment (Node.js)
We recommend **Render** or **Railway** for free-tier Node.js hosting.

1.  **Environment Variables**:
    We have provided a `.env.example` file as a template. Set the following in your hosting provider's dashboard:
    ```env
    PORT=4000
    NODE_ENV=production
    JWT_SECRET=your-secure-secret-key
    FRONTEND_URL=https://your-frontend-domain.com
    SUPABASE_URL=https://your-project.supabase.co
    SUPABASE_SERVICE_KEY=your-service-role-key
    GROQ_API_KEY=your-groq-key
    BREVO_API_KEY=your-brevo-key
    REDIS_URL=your-redis-url
    INTEGRITY_MODEL_URL=https://your-ml-service.com/integrity/evaluate
    ```
2.  **Build Command**: `npm install`
3.  **Start Command**: `npm start`

## 2. Frontend Deployment (React)
We recommend **Vercel** or **Netlify** for zero-config React hosting.

1.  **Build Settings**:
    -   **Framework Preset**: Vite
    -   **Build Command**: `npm run build`
    -   **Output Directory**: `dist`
2.  **Environment Variables**:
    Refer to `.env.example` in the frontend directory.
    ```env
    VITE_API_URL=https://your-backend-domain.com
    ```
3.  **Deploy**: Connect your GitHub repo and push to `main`.

## 3. ML Service Deployment (Python)
Use **Render** (Web Service) or **AWS Lambda**.

1.  **Requirements**: Ensure `requirements.txt` is present.
2.  **Start Command**: `gunicorn -w 4 -b 0.0.0.0:5000 app:app` (Refer to `app_jd_parser.py` and `app_skill_integrity.py`).
3.  **Environment Variables**: None required by default.

## 4. Database Setup (Supabase)
1.  **SQL Editor**: Run the `init.sql` script (found in `backend/scripts/`) to create all required tables, enums, and audit logs.
2.  **Resume Storage**: Follow the instructions in `SUPABASE_SETUP.md` to create the `resumes` storage bucket and enable public access.

## 5. Verification
-   Visit your frontend URL and ensure the registration flow is active.
-   Create a test job to verify the **JD Parser** and **Groq** question generation.
-   Take a sample test and submit code to verify the **Piston** sandbox integration.


---
## Recent Architectural Updates & Security Hardening (v2.0)
The NeuroX platform has been recently upgraded with the following core features:
1. **Parallelized AI Evaluation Pipeline**: Re-engineered the backend to evaluate MCQs, Subjective answers, and Code execution concurrently using Promise.all with a strict 45-second fallback timeout, eliminating API gateway timeouts.
2. **Resilient Frontend Polling**: Upgraded the candidate Results dashboard with robust closure-safe 20-retry polling loops to fetch evaluation audit reports seamlessly once background processing finishes.
3. **Piston Rate-Limit Fallbacks**: Integrated robust error-handling for the Piston Code Execution Sandbox to automatically provide fallback evaluations if the public API hits 401 Unauthorized limits.
4. **Enhanced UI Contrast & Aesthetics**: Hardened Tailwind Dark-Mode heuristics across all candidate textareas to guarantee pitch-black backgrounds with bright text, maximizing readability during high-stress exams.
5. **Strict JSON Schema Parsing**: Overhauled the LLM assessment generation prompts and frontend regex parsers to prevent duplicate MCQ options from rendering and ensuring flawless data-structure formatting.
6. **Express Proxy Security**: Resolved high-severity 'trust proxy' validation crashes in Express Rate Limiting, securing the authentication endpoints against brute-force while stabilizing application boot sequences.
