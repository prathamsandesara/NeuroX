const axios = require('axios');
const db = require('../config/db');

const { internalGenerateAssessment } = require('./assessmentController');

const parseJD = async (req, res) => {
    try {
        const { jd_text, job_title, experience_min, experience_max, domain } = req.body;
        const userId = req.user.id;

        let mlData;
        try {
            // Call ML Service
            const mlResponse = await axios.post(process.env.JD_MODEL_URL, {
                jd_text,
                job_title,
                experience_min,
                experience_max,
                domain
            }, { timeout: 10000 }); // increased timeout to 10s for model inference
            mlData = mlResponse.data;
        } catch (mlError) {
            console.warn('ML Service unreachable or failed, using fallback logic:', mlError.message);
            // Fallback: Basic parsing if the ML service is down
            mlData = {
                normalized_role: job_title,
                difficulty_level: 'INTERMEDIATE',
                skills: domain === 'IT' ? [
                    { skill_name: 'React', weight: 0.33, category: 'technical' },
                    { skill_name: 'Node.js', weight: 0.33, category: 'technical' },
                    { skill_name: 'PostgreSQL', weight: 0.34, category: 'technical' }
                ] : [
                    { skill_name: 'Problem Solving', weight: 1.0, category: 'soft_skill' }
                ],
                assessment_distribution: { mcq: 40, subjective: 30, coding: 30 }
            };
        }

        // Map levels to DB Enum values
        let difficultyLevel = (mlData.difficulty_level || 'INTERMEDIATE').toUpperCase();
        if (difficultyLevel === 'FRESHER') difficultyLevel = 'JUNIOR';

        // Store in DB
        const { rows: jobRows } = await db.query(
            `INSERT INTO jobs (title, description, skills, difficulty_level, experience_min, experience_max, domain, created_by) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
            [job_title, jd_text, JSON.stringify(mlData.skills), difficultyLevel, experience_min, experience_max, domain, userId]
        );
        const job = jobRows[0];

        // Create Assessment placeholder
        const assessDist = {
            ...mlData.assessment_distribution,
            mcq_count: req.body.mcq_count || 3,
            subjective_count: req.body.subjective_count || 2,
            coding_count: req.body.coding_count || 1
        };

        const { rows: assessRows } = await db.query(
            'INSERT INTO assessments (job_id, assessment_distribution) VALUES ($1, $2) RETURNING *',
            [job.id, JSON.stringify(assessDist)]
        );

        // ASYNC TRIGGER: Generate Assessment Questions
        // We don't await this if we want fast response, but for reliability let's await it for now
        // or trigger it in the background. User said "then further...things should happen"
        try {
            await internalGenerateAssessment(job.id);
        } catch (genError) {
            console.error('Failed to auto-generate assessment questions:', genError.message);
            // We don't fail the whole request because the job is already created
        }

        res.status(201).json({
            message: 'Job parsed and assessment generated',
            job,
            ml_analysis: mlData
        });

    } catch (error) {
        console.error('Error parsing JD:', error);
        res.status(500).json({ error: error.message || 'Internal Server Error during provisioning' });
    }
};

const getJobs = async (req, res) => {
    try {
        const userId = req.user.id;

        if (req.user.role === 'CANDIDATE') {
            const query = `
                SELECT 
                    j.*,
                    COALESCE(
                        json_agg(
                            jsonb_build_object(
                                'id', a.id,
                                'job_id', a.job_id,
                                'assessment_distribution', a.assessment_distribution,
                                'submissions', (
                                    SELECT COALESCE(
                                        json_agg(jsonb_build_object(
                                            'id', s.id,
                                            'status', s.status,
                                            'user_id', s.user_id,
                                            'attempts_left', s.attempts_left
                                        )), '[]'::json
                                    )
                                    FROM submissions s
                                    WHERE s.assessment_id = a.id AND s.user_id = $1
                                )
                            )
                        ) FILTER (WHERE a.id IS NOT NULL), '[]'
                    ) AS assessments
                FROM jobs j
                LEFT JOIN assessments a ON j.id = a.job_id
                GROUP BY j.id
            `;
            const { rows: filteredJobs } = await db.query(query, [userId]);
            
            // Post-process to filter ensure only jobs WITH an assessment are shown (Fail-safe)
            const finalJobs = filteredJobs.filter(job => job.assessments && job.assessments.length > 0);
            return res.json(finalJobs);
        } else {
            // For Recruiters/HR, fetch only jobs they created.
            const query = `
                SELECT 
                    j.*,
                    COALESCE(
                        json_agg(
                            jsonb_build_object(
                                'id', a.id,
                                'job_id', a.job_id,
                                'assessment_distribution', a.assessment_distribution
                                -- we can add other assessment fields here if required by UI
                            )
                        ) FILTER (WHERE a.id IS NOT NULL), '[]'
                    ) AS assessments
                FROM jobs j
                LEFT JOIN assessments a ON j.id = a.job_id
                WHERE j.created_by = $1
                GROUP BY j.id
            `;
            const { rows: jobs } = await db.query(query, [userId]);
            return res.json(jobs);
        }

    } catch (error) {
        console.error('getJobs error:', error);
        res.status(500).json({ error: 'Failed to fetch jobs' });
    }
};

module.exports = { parseJD, getJobs };
