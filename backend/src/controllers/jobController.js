const axios = require('axios');
const supabase = require('../config/supabase');

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
        const { data: job, error } = await supabase
            .from('jobs')
            .insert([{
                title: job_title,
                description: jd_text,
                skills: mlData.skills,
                difficulty_level: difficultyLevel,
                experience_min,
                experience_max,
                domain,
                created_by: userId
            }])
            .select()
            .single();

        if (error) throw error;

        // Create Assessment placeholder
        const { data: assessData, error: assessError } = await supabase
            .from('assessments')
            .insert([{
                job_id: job.id,
                assessment_distribution: {
                    ...mlData.assessment_distribution,
                    mcq_count: req.body.mcq_count || 3,
                    subjective_count: req.body.subjective_count || 2,
                    coding_count: req.body.coding_count || 1
                }
            }])
            .select()
            .single();

        if (assessError) throw assessError;

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
        let query;

        if (req.user.role === 'CANDIDATE') {
            // Fetch all jobs and their assessments. 
            // We use a separate query or filter logic to only get CURRENT user's submissions.
            const { data: allJobs, error } = await supabase.from('jobs').select(`
                *,
                assessments (
                    *,
                    submissions (
                        id,
                        status,
                        user_id,
                        attempts_left
                    )
                )
            `);
            if (error) throw error;

            // Post-process to filter submissions to only the current user
            // AND ensure only jobs WITH an assessment are shown (Fail-safe)
            const filteredJobs = allJobs
                .filter(job => job.assessments && job.assessments.length > 0)
                .map(job => ({
                    ...job,
                    assessments: job.assessments.map(assess => ({
                        ...assess,
                        submissions: (assess.submissions || []).filter(s => s.user_id === userId)
                    }))
                }));
            return res.json(filteredJobs);
        } else {
            // For Recruiters/HR, fetch only jobs they created.
            query = supabase.from('jobs').select('*, assessments(*)').eq('created_by', userId);
        }

        const { data: jobs, error } = await query;

        if (error) throw error;
        res.json(jobs);
    } catch (error) {
        console.error('getJobs error:', error);
        res.status(500).json({ error: 'Failed to fetch jobs' });
    }
};

module.exports = { parseJD, getJobs };
