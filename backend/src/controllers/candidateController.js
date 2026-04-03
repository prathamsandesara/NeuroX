const supabase = require('../config/supabase');
const db = require('../config/db');

const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { rows } = await db.query(
            'SELECT id, email, resume_url, role, is_verified FROM users WHERE id = $1',
            [userId]
        );
        const user = rows[0];

        if (!user) {
            console.error('Error fetching profile: User not found');
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
        try {
            await db.query('UPDATE users SET resume_url = $1 WHERE id = $2', [publicUrl, userId]);
        } catch (dbError) {
            throw dbError;
        }

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

const uploadSnapshot = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No snapshot provided' });
        }

        const { submissionId } = req.body;
        if (!submissionId) {
            return res.status(400).json({ error: 'Submission ID required' });
        }

        const file = req.file;
        const userId = req.user.id;
        const fileName = `snapshot_${submissionId}_${Date.now()}.jpg`;

        const { data, error } = await supabase.storage
            .from('snapshots')
            .upload(fileName, file.buffer, {
                contentType: 'image/jpeg',
                upsert: true
            });

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
            .from('snapshots')
            .getPublicUrl(fileName);

        // Better Approach: Fetch, merge, and update.
        const { rows } = await db.query('SELECT details FROM submissions WHERE id = $1', [submissionId]);
        const submission = rows[0];

        if (!submission) throw new Error("Submission not found");

        const updatedDetails = {
            ...(submission.details || {}),
            last_snapshot_url: publicUrl
        };

        await db.query('UPDATE submissions SET details = $1 WHERE id = $2', [updatedDetails, submissionId]);

        res.json({ success: true, url: publicUrl });

    } catch (error) {
        console.error('Snapshot upload error:', error);
        res.status(500).json({ error: 'Failed to upload snapshot' });
    }
};

module.exports = {
    uploadResume,
    getProfile,
    uploadSnapshot
};
