-- Create ENUMs for roles and question types
CREATE TYPE user_role AS ENUM ('ADMIN', 'RECRUITER', 'HR', 'CANDIDATE');
CREATE TYPE question_type AS ENUM ('MCQ', 'SUBJECTIVE', 'CODING');
CREATE TYPE job_difficulty AS ENUM ('JUNIOR', 'INTERMEDIATE', 'SENIOR', 'EXPERT');

-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'CANDIDATE',
    is_verified BOOLEAN DEFAULT FALSE,
    otp_hash TEXT,
    resume_url TEXT,
    security_metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Password Reset Tokens Table
CREATE TABLE password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Jobs Table
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    skills JSONB, -- list of skills
    difficulty_level job_difficulty,
    experience_min INTEGER,
    experience_max INTEGER,
    domain TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assessments Table (Linked to a Job)
CREATE TABLE assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    assessment_distribution JSONB, -- { "mcq": 30, "subjective": 30, "coding": 40 }
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Questions Table
CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
    type question_type NOT NULL,
    content JSONB NOT NULL, -- The question content, options, test cases etc.
    difficulty TEXT,
    marks INTEGER DEFAULT 1,
    topic TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Submissions Table (Candidates taking an assessment)
CREATE TABLE submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
    score DECIMAL,
    status TEXT DEFAULT 'IN_PROGRESS', -- 'IN_PROGRESS', 'COMPLETED', 'SUBMITTED'
    attempts_left INTEGER DEFAULT 1,
    proctoring_violations JSONB DEFAULT '[]',
    details JSONB, -- Stores raw answers or other metadata
    result_generated BOOLEAN DEFAULT FALSE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Results Table (Detailed breakdown of a submission)
CREATE TABLE results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE,
    details JSONB, -- Answers, specific scores per section
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Integrity Logs Table
CREATE TABLE integrity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
    risk_score DECIMAL,
    risk_level TEXT,
    flagged BOOLEAN DEFAULT FALSE,
    details JSONB, -- { "resume_skill_coverage": ..., "mcq_guess_rate": ... }
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Security Audit Log Table
CREATE TABLE security_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(255) NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    email VARCHAR(255),
    ip_address VARCHAR(45),
    user_agent TEXT,
    details JSONB,
    risk_level VARCHAR(50) DEFAULT 'LOW',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
