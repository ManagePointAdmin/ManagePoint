import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Read .env manually
const env = fs.readFileSync('.env', 'utf-8');
const getValue = (key) => {
    const match = env.match(new RegExp(`${key}=(.*)`));
    return match ? match[1].trim() : null;
};

const supabaseUrl = getValue('VITE_SUPABASE_URL');
const supabaseKey = getValue('VITE_SUPABASE_ANON_KEY');

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing SUPABASE_URL or SUPABASE_ANON_KEY");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    console.log("Running project_members select test...");
    const { data, error } = await supabase
        .from('project_members')
        .select('id, user_id, profiles(*)')
        .limit(1);

    if (error) {
        console.error("Query Error:", error);
    } else {
        console.log("Query Succeeded!", data);
    }
}

main();
