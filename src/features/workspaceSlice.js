import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { supabase } from "../lib/supabase";

// ─── Helper: fetch all workspaces for current user with nested data ────────────
const loadWorkspacesFromDB = async (userId) => {
    // 1. Get workspace IDs the user belongs to
    const { data: memberships, error: memErr } = await supabase
        .from("workspace_members")
        .select("workspace_id")
        .eq("user_id", userId);

    if (memErr || !memberships?.length) return [];

    const workspaceIds = memberships.map((m) => m.workspace_id);

    // 2. Fetch workspaces
    const { data: workspaces, error: wsErr } = await supabase
        .from("workspaces")
        .select("*")
        .in("id", workspaceIds);

    if (wsErr || !workspaces?.length) return [];

    // 3. For each workspace, fetch members, projects (with tasks and members)
    const enriched = await Promise.all(
        workspaces.map(async (ws) => {
            // A. Workspace members (Manual Join for Profile)
            const { data: wsMembers } = await supabase
                .from("workspace_members")
                .select("id, user_id, role")
                .eq("workspace_id", ws.id);

            const wsUserIds = (wsMembers || []).map(m => m.user_id);
            const { data: wsProfiles } = await supabase
                .from("profiles")
                .select("*")
                .in("id", wsUserIds);

            const wsMembersEnriched = (wsMembers || []).map(m => ({
                id: m.id,
                userId: m.user_id,
                workspaceId: ws.id,
                role: m.role,
                user: (wsProfiles || []).find(p => p.id === m.user_id) || null
            }));

            // B. Projects
            const { data: projects } = await supabase
                .from("projects")
                .select("*")
                .eq("workspace_id", ws.id);

            const enrichedProjects = await Promise.all(
                (projects || []).map(async (project) => {
                    // i. Project members (Manual Join for Profile)
                    const { data: projMembers } = await supabase
                        .from("project_members")
                        .select("id, user_id")
                        .eq("project_id", project.id);

                    const projUserIds = (projMembers || []).map(m => m.user_id);
                    const { data: projProfiles } = await supabase
                        .from("profiles")
                        .select("*")
                        .in("id", projUserIds);

                    const projMembersEnriched = (projMembers || []).map(m => ({
                        id: m.id,
                        userId: m.user_id,
                        projectId: project.id,
                        user: (projProfiles || []).find(p => p.id === m.user_id) || null
                    }));

                    // ii. Tasks (Manual Join for Assignee Profile)
                    const { data: tasks } = await supabase
                        .from("tasks")
                        .select("*")
                        .eq("project_id", project.id);

                    const assigneeIds = (tasks || []).map(t => t.assignee_id).filter(Boolean);
                    const { data: taskProfiles } = await supabase
                        .from("profiles")
                        .select("*")
                        .in("id", assigneeIds);

                    const tasksEnriched = (tasks || []).map(t => ({
                        ...t,
                        assigneeId: t.assignee_id,
                        projectId: t.project_id,
                        assignee: t.assignee_id ? (taskProfiles || []).find(p => p.id === t.assignee_id) || null : null,
                        comments: [],
                    }));

                    return {
                        ...project,
                        members: projMembersEnriched,
                        tasks: tasksEnriched
                    };
                })
            );

            return {
                ...ws,
                members: wsMembersEnriched,
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

export const deleteWorkspace = createAsyncThunk(
    "workspace/deleteWorkspace",
    async (workspaceId, { rejectWithValue }) => {
        try {
            const { error } = await supabase
                .from("workspaces")
                .delete()
                .eq("id", workspaceId);

            if (error) return rejectWithValue(error.message);
            return workspaceId;
        } catch (err) {
            return rejectWithValue(err.message);
        }
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
        deleteProject: (state, action) => {
            // action.payload = projectId
            if (!state.currentWorkspace) return;
            state.currentWorkspace.projects = state.currentWorkspace.projects.filter(
                (p) => p.id !== action.payload
            );
            state.workspaces = state.workspaces.map((w) =>
                w.id === state.currentWorkspace.id
                    ? { ...w, projects: w.projects.filter((p) => p.id !== action.payload) }
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

        builder
            .addCase(deleteWorkspace.fulfilled, (state, action) => {
                const deletedId = action.payload;
                state.workspaces = state.workspaces.filter((w) => w.id !== deletedId);
                if (state.currentWorkspace?.id === deletedId) {
                    const fallback = state.workspaces[0] || null;
                    state.currentWorkspace = fallback;
                    if (fallback) {
                        localStorage.setItem("currentWorkspaceId", fallback.id);
                    } else {
                        localStorage.removeItem("currentWorkspaceId");
                    }
                }
            });
    },
});

export const {
    setCurrentWorkspace,
    addProject,
    updateProject,
    deleteProject,
    addTask,
    updateTask,
    deleteTask,
    addProjectMember,
    addWorkspaceMember,
} = workspaceSlice.actions;

export default workspaceSlice.reducer;