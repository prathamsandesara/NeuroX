const api = require('../api/axiosInstance');

// --- SIMULATION CONFIG ---
const API_URL = 'http://localhost:5000/api';
const NUM_ATTACKERS = 5;
const NUM_EXAM_VIOLATORS = 3;

const simulateSQLInjection = async () => {
    console.log(`[SIM] Initializing SQL Injection Attack Sequence...`);
    try {
        await api.post(`${API_URL}/auth/login`, {
            email: "' OR '1'='1",
            password: "pwned"
        });
    } catch (e) {
        console.log(`[DEFENSE] System blocked SQLi attempt. Response: ${e.response?.status}`);
    }
};

const simulateBruteForce = async () => {
    console.log(`[SIM] Starting Brute Force Attack on Admin Account...`);
    for (let i = 0; i < 10; i++) {
        try {
            await api.post(`${API_URL}/auth/login`, {
                email: "admin@neurox.com",
                password: `wrongpass${i}`
            });
        } catch (e) {
            // Expected 401
        }
    }
    console.log(`[SIM] Brute Force burst complete. Check logs for Rate Limiting/IP Ban.`);
};

const simulateExamViolation = async (candidateId) => {
    console.log(`[SIM] Candidate ${candidateId} attempting copy-paste violation...`);
    // This would typically interface with a running frontend or mock the API call directly
    try {
        await api.post(`${API_URL}/submissions/violation`, {
            assessment_id: 1, // Mock ID
            candidate_id: candidateId,
            violation_type: "COPY_PASTE",
            timestamp: new Date().toISOString()
        });
    } catch (e) {
        console.log(`[SIM] Violation logged or failed: ${e.message}`);
    }
};

const runSimulation = async () => {
    console.log("--- STARTING NEUROX SECURITY SIMULATION ---");
    await simulateSQLInjection();
    await simulateBruteForce();
    await simulateExamViolation("candidate_007");
    console.log("--- SIMULATION COMPLETE. CHECK SOC DASHBOARD ---");
};

// If running standalone
if (require.main === module) {
    runSimulation();
}

module.exports = runSimulation;
