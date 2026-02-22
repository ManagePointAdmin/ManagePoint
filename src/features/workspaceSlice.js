import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { supabase } from "../lib/supabase";

// ─── Helper: fetch all workspaces for current user with nested data ────────────
const loadWorkspacesFromDB = async (userId) => {
    // Get workspace IDs the user belongs to
    const { data: memberships, error: memErr } = await supabase
        .from("workspace_members")
        .select("workspace_id")
        .eq("user_id", userId);

    if (memErr || !memberships?.length) return [];

    const workspaceIds = memberships.map((m) => m.workspace_id);

    // Fetch workspaces
    const { data: workspaces, error: wsErr } = await supabase
        .from("workspaces")
        .select("*")
        .in("id", workspaceIds);

    if (wsErr || !workspaces?.length) return [];

    // For each workspace, fetch members, projects (with tasks and members)
    const enriched = await Promise.all(
        workspaces.map(async (ws) => {
            // Workspace members with profiles
            const { data: wsMembers } = await supabase
                .from("workspace_members")
                .select("id, user_id, role, profiles(*)")
                .eq("workspace_id", ws.id);

            // Projects
            const { data: projects } = await supabase
                .from("projects")
                .select("*")
                .eq("workspace_id", ws.id);

            const enrichedProjects = await Promise.all(
                (projects || []).map(async (project) => {
                    // Project members with profiles
                    const { data: projMembers } = await supabase
                        .from("project_members")
                        .select("id, user_id, profiles(*)")
                        .eq("project_id", project.id);

                    // Tasks with assignee profile
                    const { data: tasks } = await supabase
                        .from("tasks")
                        .select("*, assignee:profiles!tasks_assignee_id_fkey(*)")
                        .eq("project_id", project.id);

                    return {
                        ...project,
                        members: (projMembers || []).map((m) => ({
                            id: m.id,
                            userId: m.user_id,
                            projectId: project.id,
                            user: m.profiles,
                        })),
                        tasks: (tasks || []).map((t) => ({
                            ...t,
                            assigneeId: t.assignee_id,
                            projectId: t.project_id,
                            assignee: t.assignee,
                            comments: [],
                        })),
                    };
                })
            );

            return {
                ...ws,
                members: (wsMembers || []).map((m) => ({
                    id: m.id,
                    userId: m.user_id,
                    workspaceId: ws.id,
                    role: m.role,
                    user: m.profiles,
                })),
                projects: enrichedProjects,
                owner: null,
            };
        })
    );

    return enriched;
};

// ─── Async Thunks ─────────────────────────────────────────────────────────────

export const fetchWorkspaces = createAsyncThunk(
    "workspace/fetchWorkspaces",
    async (userId, { rejectWithValue }) => {
        try {
            const workspaces = await loadWorkspacesFromDB(userId);
            return workspaces;
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

export const createWorkspace = createAsyncThunk(
    "workspace/createWorkspace",
    async ({ name, description, userId }, { rejectWithValue }) => {
        const { data: ws, error: wsErr } = await supabase
            .from("workspaces")
            .insert({ name, description, owner_id: userId })
            .select()
            .single();
        if (wsErr) return rejectWithValue(wsErr.message);

        // Add creator as ADMIN member
        const { data: memberRow, error: memErr } = await supabase
            .from("workspace_members")
            .insert({ workspace_id: ws.id, user_id: userId, role: "ADMIN" })
            .select()
            .single();
        if (memErr) return rejectWithValue(memErr.message);

        // Fetch creator profile so the UI has their name/email
        const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .single();

        return {
            ...ws,
            members: [{
                id: memberRow.id,
                userId,
                workspaceId: ws.id,
                role: "ADMIN",
                user: profile || null,
            }],
            projects: [],
            owner: null,
        };
    }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const initialState = {
    workspaces: [],
    currentWorkspace: null,
    loading: false,
};

const workspaceSlice = createSlice({
    name: "workspace",
    initialState,
    reducers: {
        setCurrentWorkspace: (state, action) => {
            localStorage.setItem("currentWorkspaceId", action.payload);
            state.currentWorkspace = state.workspaces.find((w) => w.id === action.payload) || null;
        },
        addProject: (state, action) => {
            if (!state.currentWorkspace) return;
            state.currentWorkspace.projects.push(action.payload);
            state.workspaces = state.workspaces.map((w) =>
                w.id === state.currentWorkspace.id
                    ? { ...w, projects: [...w.projects, action.payload] }
                    : w
            );
        },
        updateProject: (state, action) => {
            if (!state.currentWorkspace) return;
            state.currentWorkspace.projects = state.currentWorkspace.projects.map((p) =>
                p.id === action.payload.id ? { ...p, ...action.payload } : p
            );
            state.workspaces = state.workspaces.map((w) =>
                w.id === state.currentWorkspace.id
                    ? { ...w, projects: w.projects.map((p) => p.id === action.payload.id ? { ...p, ...action.payload } : p) }
                    : w
            );
        },
        addTask: (state, action) => {
            if (!state.currentWorkspace) return;
            state.currentWorkspace.projects = state.currentWorkspace.projects.map((p) => {
                if (p.id === action.payload.projectId) {
                    return { ...p, tasks: [...(p.tasks || []), action.payload] };
                }
                return p;
            });
            state.workspaces = state.workspaces.map((w) =>
                w.id === state.currentWorkspace.id
                    ? {
                        ...w, projects: w.projects.map((p) =>
                            p.id === action.payload.projectId
                                ? { ...p, tasks: [...(p.tasks || []), action.payload] }
                                : p
                        )
                    }
                    : w
            );
        },
        updateTask: (state, action) => {
            if (!state.currentWorkspace) return;
            state.currentWorkspace.projects = state.currentWorkspace.projects.map((p) => {
                if (p.id === action.payload.projectId) {
                    return { ...p, tasks: p.tasks.map((t) => t.id === action.payload.id ? action.payload : t) };
                }
                return p;
            });
            state.workspaces = state.workspaces.map((w) =>
                w.id === state.currentWorkspace.id
                    ? {
                        ...w, projects: w.projects.map((p) =>
                            p.id === action.payload.projectId
                                ? { ...p, tasks: p.tasks.map((t) => t.id === action.payload.id ? action.payload : t) }
                                : p
                        )
                    }
                    : w
            );
        },
        deleteTask: (state, action) => {
            if (!state.currentWorkspace) return;
            state.currentWorkspace.projects = state.currentWorkspace.projects.map((p) => ({
                ...p, tasks: p.tasks.filter((t) => !action.payload.includes(t.id))
            }));
            state.workspaces = state.workspaces.map((w) =>
                w.id === state.currentWorkspace.id
                    ? {
                        ...w, projects: w.projects.map((p) => ({
                            ...p, tasks: p.tasks.filter((t) => !action.payload.includes(t.id))
                        }))
                    }
                    : w
            );
        },
        addProjectMember: (state, action) => {
            // action.payload = { projectId, member: { id, userId, projectId, user } }
            if (!state.currentWorkspace) return;
            state.currentWorkspace.projects = state.currentWorkspace.projects.map((p) =>
                p.id === action.payload.projectId
                    ? { ...p, members: [...p.members, action.payload.member] }
                    : p
            );
            state.workspaces = state.workspaces.map((w) =>
                w.id === state.currentWorkspace.id
                    ? {
                        ...w, projects: w.projects.map((p) =>
                            p.id === action.payload.projectId
                                ? { ...p, members: [...p.members, action.payload.member] }
                                : p
                        )
                    }
                    : w
            );
        },
        addWorkspaceMember: (state, action) => {
            // action.payload = { workspaceId, member: { id, userId, workspaceId, role, user } }
            if (!state.currentWorkspace) return;
            if (state.currentWorkspace.id === action.payload.workspaceId) {
                state.currentWorkspace.members.push(action.payload.member);
            }
            state.workspaces = state.workspaces.map((w) =>
                w.id === action.payload.workspaceId
                    ? { ...w, members: [...(w.members || []), action.payload.member] }
                    : w
            );
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchWorkspaces.pending, (state) => { state.loading = true; })
            .addCase(fetchWorkspaces.fulfilled, (state, action) => {
                state.loading = false;
                state.workspaces = action.payload;

                // Restore last used workspace, or default to first
                const savedId = localStorage.getItem("currentWorkspaceId");
                const saved = action.payload.find((w) => w.id === savedId);
                state.currentWorkspace = saved || action.payload[0] || null;
            })
            .addCase(fetchWorkspaces.rejected, (state) => { state.loading = false; });

        builder
            .addCase(createWorkspace.fulfilled, (state, action) => {
                state.workspaces.push(action.payload);
                state.currentWorkspace = action.payload;
                localStorage.setItem("currentWorkspaceId", action.payload.id);
            });
    },
});

export const {
    setCurrentWorkspace,
    addProject,
    updateProject,
    addTask,
    updateTask,
    deleteTask,
    addProjectMember,
    addWorkspaceMember,
} = workspaceSlice.actions;

export default workspaceSlice.reducer;