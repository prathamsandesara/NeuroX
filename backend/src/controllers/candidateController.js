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

        console.log("User " + userId + " uploading resume to NeonDB as Base64");

        // Convert the buffer to a base64 Data URL
        const base64Data = file.buffer.toString('base64');
        const dataUrl = 'data:' + file.mimetype + ';base64,' + base64Data;

        // Update user profile
        try {
            await db.query('UPDATE users SET resume_url = $1 WHERE id = $2', [dataUrl, userId]);
        } catch (dbError) {
            throw dbError;
        }

        res.status(200).json({
            message: 'Resume uploaded successfully',
            resumeUrl: dataUrl
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
        const base64Data = file.buffer.toString('base64');
        const publicUrl = 'data:image/jpeg;base64,' + base64Data;

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
