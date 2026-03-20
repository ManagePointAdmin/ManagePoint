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

async function seed() {
    try {
        console.log("--- Seeding Tables from Existing Profiles ---");

        // 1. Fetch profiles to get IDs
        const { data: profiles, error: pErr } = await supabase.from('profiles').select('*');
        if (pErr) throw pErr;

        if (!profiles || profiles.length === 0) {
            console.error("No profiles found to populate workspaces for! Aborting.");
            return;
        }

        const manager = profiles.find(p => p.email === "manager@example.com") || profiles[0];
        const dev = profiles.find(p => p.email === "developer@example.com") || profiles[1] || profiles[0];
        const tester = profiles.find(p => p.email === "tester@example.com") || profiles[2] || profiles[0];

        console.log(`Using Owner: ${manager.email} (${manager.id})`);

        // ─── LOGIN AS MANAGER ─────────────────────────────────
        console.log(`\nLogging in as ${manager.email} to bypass RLS...`);
        const { data: loginData, error: logErr } = await supabase.auth.signInWithPassword({
             email: manager.email,
             password: "Password123!"
        });

        if (logErr) {
             console.error(`Login failed for ${manager.email}: ${logErr.message}`);
             console.log("Falling back to Anon-client insert attempts...");
        } else {
             console.log("Logged in successfully! Token Set.");
        }

        // 2. Create Workspace
        console.log("\nCreating workspace...");
        const workspaceName = "ManagePoint Workspace";
        let { data: ws, error: wsErr } = await supabase
            .from('workspaces')
            .insert({ name: workspaceName, owner_id: manager.id })
            .select().single();

        if (wsErr) {
             console.log("Workspace insert failed:", wsErr.message);
             console.log("Fetching first workspace instead to attach to...");
             const { data: workspaces } = await supabase.from('workspaces').select('*');
             ws = workspaces?.[0];
        }

        if (!ws) {
            console.error("Could not find or create a workspace. Aborting.");
            return;
        }

        console.log(`Workspace: ${ws.name} (${ws.id})`);

        // 3. Map Members
        console.log("\nMapping workspace members...");
        const membersToMap = [
            { user_id: manager.id, role: "ADMIN" },
            { user_id: dev.id, role: "MEMBER" },
            { user_id: tester.id, role: "MEMBER" }
        ];

        for (const m of membersToMap) {
             console.log(`Adding member ${m.user_id} with role ${m.role}...`);
             const { error } = await supabase.from('workspace_members').upsert({
                  workspace_id: ws.id,
                  user_id: m.user_id,
                  role: m.role
             });
             if (error) console.error("Workspace Member Error:", error.message);
        }

        // 4. Update Create Project
        console.log("\nCreating project...");
        const { data: project, error: projErr } = await supabase
            .from('projects')
            .insert({
                 workspace_id: ws.id,
                 name: "Beta Launch Project",
                 description: "Stock data rollout implementation",
                 status: "PLANNING",
                 priority: "HIGH",
                 progress: 30
            })
            .select().single();

        let activeProj = project;
        if (projErr) {
             console.log("Project creation failed:", projErr.message);
             const { data: projects } = await supabase.from('projects').select('*').eq('workspace_id', ws.id);
             activeProj = projects?.[0];
        }

        if (!activeProj) {
             console.error("Could not find or create project. Aborting.");
             return;
        }

        console.log(`Project: ${activeProj.name} (${activeProj.id})`);

        // 5. Create Tasks
        console.log("\nCreating tasks...");
        const tasksToCreate = [
            { title: "Design homepage mockup", type: "TASK", status: "DONE", priority: "MEDIUM", assignee_id: dev.id },
            { title: "Test login flow authentication", type: "BUG", status: "IN_PROGRESS", priority: "HIGH", assignee_id: tester.id },
            { title: "Submit review for beta launch", type: "FEATURE", status: "TODO", priority: "MEDIUM", assignee_id: manager.id }
        ];

        for (const t of tasksToCreate) {
             console.log(`Adding task: ${t.title}...`);
             const { error } = await supabase.from('tasks').insert({
                  project_id: activeProj.id,
                  ...t
             });
             if (error) console.error("Task Insert Error:", error.message);
        }

        console.log("\n--- Seeding Tables Completed Gracefully! ---");

    } catch (err) {
        console.error("Critical error inside seed script:", err.message);
    }
}

seed();
