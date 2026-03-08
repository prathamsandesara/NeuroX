const supabase = require('../config/supabase');

const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { data: user, error } = await supabase
            .from('users')
            .select('id, email, resume_url, role, is_verified')
            .eq('id', userId)
            .single();

        if (error) {
            console.error('Error fetching profile:', error);
            return res.status(500).json({ error: 'Failed to fetch profile' });
        }

        res.json({ user });
    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({ error: 'Server error retrieving profile' });
    }
};

const uploadResume = async (req, res) => {
    try {
        console.log('=== UPLOAD RESUME CALLED ===');
        console.log('User:', req.user);
        console.log('File:', req.file ? 'Present' : 'Missing');

        if (!req.file) {
            console.log('No file in request');
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const file = req.file;
        const userId = req.user.id;
        const timestamp = Date.now();
        // Sanitize filename: remove spaces, special chars
        const sanitizedOriginalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        const fileName = `${userId}_${timestamp}_${sanitizedOriginalName}`;

        console.log(`User ${userId} uploading resume: ${fileName}`);

        // User confirmed bucket name is "Resumes"
        let bucketName = 'resumes';

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from(bucketName)
            .upload(fileName, file.buffer, {
                contentType: file.mimetype,
                upsert: true
            });

        if (error) {
            console.error('Supabase Storage Error:', error);

            // Check for potential bucket not found error to give better feedback
            if (error.statusCode === '404' || error.message.includes('not found')) {
                return res.status(500).json({
                    error: 'Storage bucket not found. Please ensure a public bucket named "resumes" exists in Supabase.'
                });
            }
            throw error;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from(bucketName)
            .getPublicUrl(fileName);

        // Update user profile
        const { error: dbError } = await supabase
            .from('users')
            .update({ resume_url: publicUrl })
            .eq('id', userId);

        if (dbError) throw dbError;

        res.status(200).json({
            message: 'Resume uploaded successfully',
            resumeUrl: publicUrl
        });

    } catch (error) {
        console.error('Resume upload fatal error:', error);
        console.error('Error stack:', error.stack);
        console.error('Error details:', JSON.stringify(error, null, 2));
        res.status(500).json({
            error: 'Failed to upload resume',
            details: error.message,
            errorType: error.constructor.name
        });
    }
};

module.exports = {
    uploadResume,
    getProfile
};
