# 🚀 Deployment Guide

## Prerequisites
- **Node.js**: v18.x or higher.
- **Python**: v3.9+ (for ML Service).
- **Supabase Account**: For database and auth.
- **Groq API Key**: For AI content generation.
- **Piston Instance**: Public API or self-hosted.

## 1. Backend Deployment (Node.js)
We recommend **Render** or **Railway** for free-tier Node.js hosting.

1.  **Environment Variables**:
    Set the following in your hosting provider's dashboard:
    ```env
    PORT=4000
    SUPABASE_URL=https://your-project.supabase.co
    SUPABASE_SERVICE_KEY=your-service-role-key
    GROQ_API_KEY=your-groq-key
    FrontEnd_URL=https://your-frontend-domain.com
    INTEGRITY_MODEL_URL=https://your-ml-service.com/integrity/evaluate
    ```
2.  **Build Command**: `npm install`
3.  **Start Command**: `npm start` (mapped to `node index.js`).

## 2. Frontend Deployment (React)
We recommend **Vercel** or **Netlify** for zero-config React hosting.

1.  **Build Settings**:
    -   **Framework Preset**: Vite
    -   **Build Command**: `npm run build`
    -   **Output Directory**: `dist`
2.  **Environment Variables**:
    ```env
    VITE_API_URL=https://your-backend-domain.com/api
    ```
3.  **Deploy**: Connect your GitHub repo and push to `main`.

## 3. ML Service Deployment (Python)
Use **Render** (Web Service) or **AWS Lambda**.

1.  **Requirements**: Ensure `requirements.txt` is present.
2.  **Start Command**: `gunicorn -w 4 -b 0.0.0.0:5000 app:app`
3.  **Environment Variables**: None specific, unless model paths need adjustment.

## 4. Database Setup (Supabase)
1.  **SQL Editor**: Run the `my.sql` script (found in root) to create tables.
2.  **RLS Policies**: Go to Authentication -> Policies and enable RLS if strictly needed (currently handled by service key).

## 5. Verification
-   Visit your frontend URL.
-   Register a new user to test Auth & DB connection.
-   Create a dummy job to test ML & Groq integration.
