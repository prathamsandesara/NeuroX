const { evaluateSubmission } = require('./src/controllers/submissionController');

async function run() {
    try {
        // Find a submission that is 'SUBMITTED' or 'COMPLETED'
        const supabase = require('./src/config/supabase');
        const { data } = await supabase.from('submissions').select('id, status').limit(1).order('created_at', { ascending: false });
        if (data && data.length > 0) {
            const sid = data[0].id;
            console.log('Testing evaluation on submission:', sid);
            const res = await evaluateSubmission(sid);
            console.log('Success:', res);
        } else {
            console.log('No submissions found');
        }
    } catch(e) {
        console.error('Test script error:', e);
    }
    process.exit(0);
}
run();
