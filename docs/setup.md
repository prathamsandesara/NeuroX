# NeuroX Setup Guide

## Prerequisites
- Node.js (v18+)
- Redis (running locally or remote)
- Supabase Project (URL & Key)
- Brevo Account (API Key)
- ML Services running on ports 5000 & 5001.

## Installation

### 1. Database Setup
- Run the SQL commands in `my.sql` in your Supabase SQL Editor.

### 2. Backend Setup
```bash
cd backend
npm install
# Ensure .env is configured
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## Environment Variables
Ensure `.env` files in `backend/` and `frontend/` are populated with your specific keys.
