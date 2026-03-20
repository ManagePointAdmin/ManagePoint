const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

function loadEnv() {
    try {
        const env = fs.readFileSync('.env', 'utf8');
        const getEnv = (key) => {
            const match = env.match(new RegExp(`${key}=(.*)`));
            return match ? match[1].trim() : null;
        };
        return {
            URL: getEnv('VITE_SUPABASE_URL'),
            KEY: getEnv('VITE_SUPABASE_ANON_KEY')
        };
    } catch (err) {
        console.error("Failed to load .env:", err.message);
        return {};
    }
}

const envVars = loadEnv();
if (!envVars.URL || !envVars.KEY) {
    console.error("Missing Supabase credentials in .env");
    process.exit(1);
}

const supabase = createClient(envVars.URL, envVars.KEY);

const usersToCreate = [
  { email: "manager@example.com", password: "Password123!", name: "Sarah (Manager)", role: "ADMIN" },
  { email: "developer@example.com", password: "Password123!", name: "John (Developer)", role: "MEMBER" },
  { email: "tester@example.com", password: "Password123!", name: "Alex (Tester)", role: "MEMBER" }
];

async function seed() {
    try {
        console.log("--- Seeding Stock Data ---");
        
        const createdUsers = [];
        
        for (const u of usersToCreate) {
             console.log(`Creating user: ${u.email}...`);
             const { data: authData, error: authErr } = await supabase.auth.signUp({
                 email: u.email,
                 password: u.password
             });

             if (authErr) {
                 console.error(`Auth signup failed for ${u.email}:`, authErr.message);
                 if (authErr.message.includes("already registered")) {
                      console.log(`User ${u.email} already exists, attempting to fetch user ID...`);
                      // We can't fetch strictly via anon, but let's try to fetch profile
                 }
             } else if (authData.user) {
                 console.log(`User created. ID: ${authData.user.id}`);
                 createdUsers.push({ id: authData.user.id, ...u });

                 const { error: profErr } = await supabase
                     .from('profiles')
                     .upsert({
                          id: authData.user.id,
                          name: u.name,
                          email: u.email
                     });
                 if (profErr) console.error("Profile insert error:", profErr.message);
             }
        }

        console.log("\nCreating Workspace...");
        const workspaceName = "ManagePoint Workspace";
        let { data: workspace, error: wsErr } = await supabase
            .from('workspaces')
            .insert({ name: workspaceName, owner_id: createdUsers[0].id })
            .select().single();

        if (wsErr) {
             console.log("Workspace insert failed:", wsErr.message);
             console.log("Fetching first workspace instead...");
             const { data: workspaces } = await supabase.from('workspaces').select('*');
             workspace = workspaces?.[0];
        }

        if (!workspace) {
            console.error("Could not find or create a workspace. Aborting.");
            return;
        }

        console.log(`Using Workspace: ${workspace.name} (${workspace.id})`);

        console.log("\nMapping Members...");
        for (const u of createdUsers) {
             console.log(`Adding ${u.name} to workspace with role ${u.role}...`);
             const { error } = await supabase.from('workspace_members').upsert({
                  workspace_id: workspace.id,
                  user_id: u.id,
                  role: u.role
             });
             if (error) console.error("Workspace Member insert Error:", error.message);
        }

        console.log("\nCreating Project...");
        const { data: project, error: projErr } = await supabase
            .from('projects')
            .insert({
                 workspace_id: workspace.id,
                 name: "Beta Launch Project",
                 description: "Stock data rollout implementation",
                 status: "PLANNING",
                 priority: "HIGH",
                 progress: 30
            })
            .select().single();

        if (projErr) {
            console.log("Project creation failed/skipped:", projErr.message);
            // Re-fetch project to map tasks
            const { data: projects } = await supabase.from('projects').select('*').eq('workspace_id', workspace.id);
            if (projects && projects.length > 0) {
                 const proj = projects[0];
                 console.log(`Adding tasks to existing Project: ${proj.name} (${proj.id})`);
                 await createTasks(proj.id, createdUsers);
            }
            return;
        }

        console.log(`Project created: ${project.name} (${project.id})`);
        await createTasks(project.id, createdUsers);

        console.log("\n--- Seeding Completed Gracefully! ---");

    } catch (err) {
        console.error("Critical error inside seed script:", err);
    }
}

async function createTasks(projectId, createdUsers) {
    const dev = createdUsers.find(u => u.role === "MEMBER" && u.name.includes("Developer"));
    const tester = createdUsers.find(u => u.role === "MEMBER" && u.name.includes("Tester"));

    const tasksToCreate = [
        { title: "Design homepage mockup", type: "TASK", status: "DONE", priority: "MEDIUM", assignee_id: dev?.id || null },
        { title: "Test login flow authentication", type: "BUG", status: "IN_PROGRESS", priority: "HIGH", assignee_id: tester?.id || null },
        { title: "Submit review for beta launch", type: "FEATURE", status: "TODO", priority: "MEDIUM", assignee_id: createdUsers[0]?.id || null }
    ];

    for (const t of tasksToCreate) {
         console.log(`Adding task: ${t.title}...`);
         const { error } = await supabase.from('tasks').insert({
              project_id: projectId,
              ...t
         });
         if (error) console.error("Task Insert Error:", error.message);
    }
}

seed();
