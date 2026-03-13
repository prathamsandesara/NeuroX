-- Step 1: Create the table
CREATE TABLE IF NOT EXISTS security_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(255) NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    email VARCHAR(255),
    ip_address VARCHAR(45),
    user_agent TEXT,
    details JSONB,
    risk_level VARCHAR(50) DEFAULT 'LOW',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Enable Row Level Security (RLS)
ALTER TABLE security_audit_log ENABLE ROW LEVEL SECURITY;

-- Step 3: Create Policy for ADMIN access
CREATE POLICY "Admin can view all audit logs" ON security_audit_log
    FOR SELECT USING (
        auth.uid() IN (SELECT id FROM users WHERE role = 'ADMIN')
    );

-- Note: The backend application uses the service role key, which bypasses RLS for INSERT operations.
