const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

function loadEnv() {
    const env = fs.readFileSync('.env', 'utf8');
    const getEnv = (key) => {
        const match = env.match(new RegExp(`${key}=(.*)`));
        return match ? match[1].trim() : null;
    };
    return { URL: getEnv('VITE_SUPABASE_URL'), KEY: getEnv('VITE_SUPABASE_ANON_KEY') };
}

const envVars = loadEnv();
const supabase = createClient(envVars.URL, envVars.KEY);

async function check() {
    console.log("Reading existing profiles...");
    const { data: profiles, error } = await supabase.from('profiles').select('*');
    if (error) {
        console.error("Failed to read profiles:", error.message);
    } else {
        console.log(`Found ${profiles.length} profiles:`);
        profiles.forEach(p => console.log(`ID: ${p.id} | Name: ${p.name} | Email: ${p.email}`));
    }
}

check();
