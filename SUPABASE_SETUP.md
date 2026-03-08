# Supabase Setup for Resume Upload

## 1. Database Schema Update
Run the following SQL in your Supabase SQL Editor to add the `resume_url` column to the `users` table:

```sql
ALTER TABLE users ADD COLUMN resume_url TEXT;
```

## 2. Storage Bucket Setup
You need to create a storage bucket to store the resume files.

1.  Go to **Storage** in your Supabase Dashboard.
2.  Click **"New Bucket"**.
3.  Name the bucket: `resumes`.
4.  Toggle **"Public bucket"** to **ON**. (This allows the resume URL to be accessible via a public link).
5.  Click **"Save"**.

## 3. Storage Policies (RLS)
By default, no one can upload to your new bucket. You need to add a policy to allow authenticated users to upload.

1.  In the **Storage** page, click **"Polices"** next to your `resumes` bucket.
2.  Click **"New Policy"**.
3.  Choose **"For full customization"**.
4.  **Policy Name**: `Allow authenticated uploads`.
5.  **Allowed operations**: Check **INSERT**.
6.  **Target roles**: Check **authenticated**.
7.  Click **"Review"** and then **"Save"**.

(Optional) If you want users to be able to *read* their resumes (or public read access), you might need a SELECT policy, but since it's a public bucket, reading is enabled by default for public URLs.

## 4. Verify
After completing these steps, the resume upload feature in your Candidate Dashboard should work correctly.
