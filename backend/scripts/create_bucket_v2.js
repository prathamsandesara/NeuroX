const { createClient } = require('@supabase/supabase-js');
// Load .env from backend root
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createBucket() {
    try {
        console.log('Attempting to create "resumes" bucket...');
        console.log('Using URL:', supabaseUrl);

        // Try to check if bucket exists first
        const { data: buckets, error: listError } = await supabase.storage.listBuckets();
        if (listError) {
             console.error('Error listing buckets:', listError);
             // If listing fails, we might not have admin rights, but listing usually works for service keys.
        } else {
             const exists = buckets.find(b => b.name === 'resumes');
             if (exists) {
                 console.log('Bucket "resumes" already exists.');
                 return;
             }
        }

        const { data, error } = await supabase.storage.createBucket('resumes', {
            public: true,
            fileSizeLimit: 5242880, // 5MB
            allowedMimeTypes: ['application/pdf']
        });

        if (error) {
            console.error('Error creating bucket:', error);
        } else {
            console.log('Bucket "resumes" created successfully:', data);
        }
    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

createBucket();
