const supabase = require('../src/config/supabase');

async function createBucket() {
    try {
        console.log('Attempting to create "resumes" bucket...');
        
        const { data, error } = await supabase.storage.createBucket('resumes', {
            public: true,
            fileSizeLimit: 5242880, // 5MB
            allowedMimeTypes: ['application/pdf']
        });

        if (error) {
            if (error.message.includes('already exists')) {
                console.log('Bucket "resumes" already exists.');
                return;
            }
            throw error;
        }

        console.log('Bucket "resumes" created successfully:', data);
        
        // Update policy to allow public reads (if public: true doesn't auto-permit it fully for some reason, standard public buckets usually allow read)
        // Note: Creating policies via API might not be supported by all client versions/keys, but bucket creation is standard.
        
    } catch (err) {
        console.error('Error creating bucket:', err);
    }
}

createBucket();
