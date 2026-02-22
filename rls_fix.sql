-- ============================================================
-- ManagePoint — RLS Recursion Fix
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ════════════════════════════════════════════════════════════
-- STEP 1 — SECURITY DEFINER FUNCTIONS
-- These bypass RLS to check membership/roles without recursion.
-- ════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.is_member(ws_id UUID)
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM workspace_members 
    WHERE workspace_id = ws_id AND user_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM workspaces
    WHERE id = ws_id AND owner_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin(ws_id UUID)
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM workspace_members 
    WHERE workspace_id = ws_id AND user_id = auth.uid() AND role = 'ADMIN'
  ) OR EXISTS (
    SELECT 1 FROM workspaces
    WHERE id = ws_id AND owner_id = auth.uid()
  );
$$;


-- ════════════════════════════════════════════════════════════
-- STEP 2 — DROP AND REBUILD RECURSIVE POLICIES
-- ════════════════════════════════════════════════════════════

-- ── workspace_members ──
DROP POLICY IF EXISTS "Members can read workspace membership" ON public.workspace_members;
DROP POLICY IF EXISTS "Admins or self can add members" ON public.workspace_members;
DROP POLICY IF EXISTS "Admins or self can remove members" ON public.workspace_members;
DROP POLICY IF EXISTS "Admins can update member roles" ON public.workspace_members;

CREATE POLICY "Members can read workspace membership"
    ON public.workspace_members FOR SELECT
    USING (public.is_member(workspace_id));

CREATE POLICY "Admins or self can add members"
    ON public.workspace_members FOR INSERT
    WITH CHECK (auth.uid() = user_id OR public.is_admin(workspace_id));

CREATE POLICY "Admins or self can remove members"
    ON public.workspace_members FOR DELETE
    USING (auth.uid() = user_id OR public.is_admin(workspace_id));

CREATE POLICY "Admins can update member roles"
    ON public.workspace_members FOR UPDATE
    USING (public.is_admin(workspace_id));


-- ── workspaces ──
DROP POLICY IF EXISTS "Members can read their workspaces" ON public.workspaces;
DROP POLICY IF EXISTS "Admins can update workspaces" ON public.workspaces;

CREATE POLICY "Members can read their workspaces"
    ON public.workspaces FOR SELECT
    USING (owner_id = auth.uid() OR public.is_member(id));

CREATE POLICY "Admins can update workspaces"
    ON public.workspaces FOR UPDATE
    USING (owner_id = auth.uid() OR public.is_admin(id));


-- ── projects ──
DROP POLICY IF EXISTS "Workspace members can read projects" ON public.projects;
DROP POLICY IF EXISTS "Workspace members can create projects" ON public.projects;
DROP POLICY IF EXISTS "Workspace members can update projects" ON public.projects;
DROP POLICY IF EXISTS "Admins can delete projects" ON public.projects;

CREATE POLICY "Workspace members can read projects"
    ON public.projects FOR SELECT
    USING (public.is_member(workspace_id));

CREATE POLICY "Workspace members can create projects"
    ON public.projects FOR INSERT
    WITH CHECK (public.is_member(workspace_id));

CREATE POLICY "Workspace members can update projects"
    ON public.projects FOR UPDATE
    USING (public.is_member(workspace_id));

CREATE POLICY "Admins can delete projects"
    ON public.projects FOR DELETE
    USING (public.is_admin(workspace_id));


-- ── project_members ──
DROP POLICY IF EXISTS "Workspace members can read project members" ON public.project_members;
DROP POLICY IF EXISTS "Workspace members can add project members" ON public.project_members;
DROP POLICY IF EXISTS "Workspace members can remove project members" ON public.project_members;

CREATE POLICY "Workspace members can read project members"
    ON public.project_members FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.projects p
        WHERE p.id = project_members.project_id AND public.is_member(p.workspace_id)
    ));

CREATE POLICY "Workspace members can add project members"
    ON public.project_members FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.projects p
        WHERE p.id = project_members.project_id AND public.is_member(p.workspace_id)
    ));

CREATE POLICY "Workspace members can remove project members"
    ON public.project_members FOR DELETE
    USING (
        auth.uid() = user_id
        OR EXISTS (
            SELECT 1 FROM public.projects p
            WHERE p.id = project_members.project_id AND public.is_admin(p.workspace_id)
        )
    );


-- ── tasks ──
DROP POLICY IF EXISTS "Workspace members can read tasks" ON public.tasks;
DROP POLICY IF EXISTS "Workspace members can create tasks" ON public.tasks;
DROP POLICY IF EXISTS "Workspace members can update tasks" ON public.tasks;
DROP POLICY IF EXISTS "Workspace members can delete tasks" ON public.tasks;

CREATE POLICY "Workspace members can read tasks"
    ON public.tasks FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.projects p
        WHERE p.id = tasks.project_id AND public.is_member(p.workspace_id)
    ));

CREATE POLICY "Workspace members can create tasks"
    ON public.tasks FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.projects p
        WHERE p.id = tasks.project_id AND public.is_member(p.workspace_id)
    ));

CREATE POLICY "Workspace members can update tasks"
    ON public.tasks FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM public.projects p
        WHERE p.id = tasks.project_id AND public.is_member(p.workspace_id)
    ));

CREATE POLICY "Workspace members can delete tasks"
    ON public.tasks FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM public.projects p
        WHERE p.id = tasks.project_id AND public.is_member(p.workspace_id)
    ));


-- ── comments ──
DROP POLICY IF EXISTS "Workspace members can read comments" ON public.comments;

CREATE POLICY "Workspace members can read comments"
    ON public.comments FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.tasks t
        JOIN public.projects p ON p.id = t.project_id
        WHERE t.id = comments.task_id AND public.is_member(p.workspace_id)
    ));
