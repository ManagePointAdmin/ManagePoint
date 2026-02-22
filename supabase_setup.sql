-- ============================================================
-- ManagePoint — Complete Supabase Setup Script
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ════════════════════════════════════════════════════════════
-- STEP 1 — CREATE ALL TABLES FIRST
-- ════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.profiles (
    id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name        TEXT,
    email       TEXT UNIQUE,
    image_url   TEXT,
    created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.workspaces (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL,
    description TEXT,
    owner_id    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    image_url   TEXT,
    created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.workspace_members (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id    UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role            TEXT NOT NULL DEFAULT 'MEMBER',
    created_at      TIMESTAMPTZ DEFAULT now(),
    UNIQUE (workspace_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.projects (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id    UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    description     TEXT,
    status          TEXT NOT NULL DEFAULT 'PLANNING',
    priority        TEXT NOT NULL DEFAULT 'MEDIUM',
    start_date      DATE,
    end_date        DATE,
    team_lead       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    progress        INTEGER DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.project_members (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id  UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ DEFAULT now(),
    UNIQUE (project_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.tasks (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id      UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    title           TEXT NOT NULL,
    description     TEXT,
    status          TEXT NOT NULL DEFAULT 'TODO',
    type            TEXT NOT NULL DEFAULT 'TASK',
    priority        TEXT NOT NULL DEFAULT 'MEDIUM',
    assignee_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    due_date        DATE,
    created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.comments (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id     UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content     TEXT NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT now()
);


-- ════════════════════════════════════════════════════════════
-- STEP 2 — ENABLE RLS ON ALL TABLES
-- ════════════════════════════════════════════════════════════

ALTER TABLE public.profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments         ENABLE ROW LEVEL SECURITY;


-- ════════════════════════════════════════════════════════════
-- STEP 3 — HELPERS (Security Definer functions to avoid RLS recursion)
-- ════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    INSERT INTO public.profiles (id, name, email)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        NEW.email
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Non-recursive membership check
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

-- Non-recursive admin check
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
-- STEP 4 — RLS POLICIES (all tables exist now, safe to add)
-- ════════════════════════════════════════════════════════════

-- ── profiles ────────────────────────────────────────────────
CREATE POLICY "Anyone can read profiles"
    ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- ── workspaces ──────────────────────────────────────────────
CREATE POLICY "Members can read their workspaces"
    ON public.workspaces FOR SELECT
    USING (owner_id = auth.uid() OR public.is_member(id));

CREATE POLICY "Authenticated users can create workspaces"
    ON public.workspaces FOR INSERT
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Admins can update workspaces"
    ON public.workspaces FOR UPDATE
    USING (owner_id = auth.uid() OR public.is_admin(id));

-- ── workspace_members ───────────────────────────────────────
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

-- ── projects ────────────────────────────────────────────────
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

-- ── project_members ─────────────────────────────────────────
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

-- ── tasks ────────────────────────────────────────────────────
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

-- ── comments ─────────────────────────────────────────────────
CREATE POLICY "Workspace members can read comments"
    ON public.comments FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.tasks t
        JOIN public.projects p ON p.id = t.project_id
        WHERE t.id = comments.task_id AND public.is_member(p.workspace_id)
    ));

CREATE POLICY "Authenticated users can post comments"
    ON public.comments FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
    ON public.comments FOR DELETE
    USING (auth.uid() = user_id);


CREATE POLICY "Authenticated users can post comments"
    ON public.comments FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
    ON public.comments FOR DELETE
    USING (auth.uid() = user_id);
