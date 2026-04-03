const axios = require('axios');
const db = require('../config/db');
const crypto = require('crypto');

const evaluateIntegrity = async (req, res) => {
    try {
        const {
            resume_skill_coverage,
            assessment_skill_score,
            mcq_guess_rate,
            avg_time_per_question,
            time_variance,
            coding_similarity_score,
            keypress_patterns, // New: Array of inter-key latencies
            focus_lost_count   // New: Number of focus lost events
        } = req.body;

        const assessment_id = req.body.assessment_id;
        const user_id = req.user.id;

        // --- INTERNAL ANOMALY DETECTION LOGIC (Simulating AI Security Model) ---
        let internal_risk_score = 0;
        let internal_risk_level = 'LOW';
        let detection_reason = [];

        // 1. Rapid Input Detection (Potential Copy-Paste or Bot)
        if (keypress_patterns && keypress_patterns.length > 0) {
            const avgLatency = keypress_patterns.reduce((a, b) => a + b, 0) / keypress_patterns.length;
            if (avgLatency < 50) { // < 50ms average between keystrokes is inhuman
                internal_risk_score += 40;
                detection_reason.push("INHUMAN_TYPING_SPEED");
            }
        }

        // 2. Focus Loss Analysis
        if (focus_lost_count > 3) {
            internal_risk_score += 30;
            detection_reason.push("FREQUENT_CONTEXT_SWITCH");
        }

        // 3. Time Variance (Too fast = potential dump usage)
        if (time_variance < 0.2 && avg_time_per_question < 10) { // Very consistent and very fast
            internal_risk_score += 30;
            detection_reason.push("ANOMALOUS_SPEED_CONSISTENCY");
        }

        // Normalize Risk Level
        if (internal_risk_score > 70) internal_risk_level = 'CRITICAL';
        else if (internal_risk_score > 40) internal_risk_level = 'HIGH';
        else if (internal_risk_score > 20) internal_risk_level = 'MEDIUM';


        // Call External ML Service (preserving existing flow)
        // In a real scenario, we'd fuse internal_risk_score with ML output.
        // For this demo, we'll merge them.
        const mlResponse = await axios.post(process.env.INTEGRITY_MODEL_URL, {
            resume_skill_coverage,
            assessment_skill_score,
            mcq_guess_rate,
            avg_time_per_question,
            time_variance,
            coding_similarity_score
        });

        let { skill_integrity_score, risk_level, flagged } = mlResponse.data;

        // Merge Logic: Take the worse of the two
        if (internal_risk_score > (100 - skill_integrity_score * 100)) {
            // If internal checks found more issues than the CV/Skill model
            risk_level = internal_risk_level;
            flagged = flagged || (internal_risk_level === 'HIGH' || internal_risk_level === 'CRITICAL');
        }

        // --- IPS INTERVENTION (ACTIVE DEFENSE) ---
        if (risk_level === 'CRITICAL') {
            console.log(`[SEC_KERNEL] IPS Intervention triggered for candidate ${user_id}. Locking session.`);
            await db.query(
                'UPDATE submissions SET status = $1, completed_at = NOW() WHERE id = $2',
                ['TERMINATED_DUE_TO_VIOLATION', assessment_id]
            );

            return res.json({
                ...mlResponse.data,
                risk_level: 'CRITICAL',
                ips_intervention: true,
                message: "SECURITY_PROTOCOL_VIOLATION: SESSION_TERMINATED"
            });
        }

        // Store log
        const logDetails = {
            ...req.body,
            fingerprint: {
                ip: req.ip,
                ua: req.get('User-Agent')
            }
        };

        await db.query(
            'INSERT INTO integrity_logs (user_id, assessment_id, risk_score, risk_level, flagged, details) VALUES ($1, $2, $3, $4, $5, $6)',
            [user_id, assessment_id, skill_integrity_score, risk_level, flagged, JSON.stringify(logDetails)]
        );

        res.json({
            ...mlResponse.data,
            integrity_hash: crypto.createHmac('sha256', process.env.JWT_SECRET || 'neurox_kernel_v1')
                .update(`${user_id}-${assessment_id}-${skill_integrity_score}`)
                .digest('hex')
        });

    } catch (error) {
        console.error('Integrity Check Error:', error);
        res.status(500).json({ error: 'Integrity check failed' });
    }
};

module.exports = { evaluateIntegrity };
