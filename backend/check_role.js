const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRole() {
    const { data, error } = await supabase
        .from('users')
        .select('email, role')
        .eq('email', 'user1candidatee@gmail.com')
        .single();

    if (error) {
        console.error('Error fetching user:', error);
    } else {
        console.log('User Data:', data);
    }
}

checkRole();
