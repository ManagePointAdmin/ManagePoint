-- ============================================================
-- ManagePoint — Seed / Demo Data
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- IMPORTANT: Run supabase_setup.sql FIRST if you haven't yet.
-- All dummy users have password: Demo@1234
-- ============================================================

-- ════════════════════════════════════════════════════════════
-- STEP 0 — Cleanup old dummy data (for idempotency)
-- ════════════════════════════════════════════════════════════

-- Delete dummy members, tasks, comments first (cascade will handle most, but be explicit)
DELETE FROM public.profiles WHERE id IN (
    'aaaaaaaa-0000-0000-0000-000000000001',
    'aaaaaaaa-0000-0000-0000-000000000002',
    'aaaaaaaa-0000-0000-0000-000000000003'
);

DELETE FROM auth.users WHERE id IN (
    'aaaaaaaa-0000-0000-0000-000000000001',
    'aaaaaaaa-0000-0000-0000-000000000002',
    'aaaaaaaa-0000-0000-0000-000000000003'
);


-- ════════════════════════════════════════════════════════════
-- STEP 1 — Create 3 dummy users in auth.users
-- ════════════════════════════════════════════════════════════

INSERT INTO auth.users (
    id, instance_id, aud, role,
    email, encrypted_password,
    email_confirmed_at,
    raw_user_meta_data,
    raw_app_meta_data,
    is_super_admin,
    created_at, updated_at,
    last_sign_in_at,
    confirmation_token, recovery_token,
    email_change_token_new, email_change
) VALUES
(
    'aaaaaaaa-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'alice@demo.com',
    crypt('Demo@1234', gen_salt('bf', 10)),
    now(),
    '{"name":"Alice Johnson"}',
    '{"provider":"email","providers":["email"]}',
    false,
    now(), now(), now(),
    '', '', '', ''
),
(
    'aaaaaaaa-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'bob@demo.com',
    crypt('Demo@1234', gen_salt('bf', 10)),
    now(),
    '{"name":"Bob Smith"}',
    '{"provider":"email","providers":["email"]}',
    false,
    now(), now(), now(),
    '', '', '', ''
),
(
    'aaaaaaaa-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'carol@demo.com',
    crypt('Demo@1234', gen_salt('bf', 10)),
    now(),
    '{"name":"Carol Davis"}',
    '{"provider":"email","providers":["email"]}',
    false,
    now(), now(), now(),
    '', '', '', ''
);


-- ════════════════════════════════════════════════════════════
-- STEP 2 — Profiles
-- ════════════════════════════════════════════════════════════

INSERT INTO public.profiles (id, name, email) VALUES
    ('aaaaaaaa-0000-0000-0000-000000000001', 'Alice Johnson', 'alice@demo.com'),
    ('aaaaaaaa-0000-0000-0000-000000000002', 'Bob Smith',     'bob@demo.com'),
    ('aaaaaaaa-0000-0000-0000-000000000003', 'Carol Davis',   'carol@demo.com')
ON CONFLICT (id) DO NOTHING;


-- ════════════════════════════════════════════════════════════
-- STEP 3 — 2 Workspaces (owned by Alice)
-- ════════════════════════════════════════════════════════════

INSERT INTO public.workspaces (id, name, description, owner_id) VALUES
(
    'bbbbbbbb-0000-0000-0000-000000000001',
    'Acme Corp',
    'Main product and engineering workspace for Acme Corp.',
    'aaaaaaaa-0000-0000-0000-000000000001'
),
(
    'bbbbbbbb-0000-0000-0000-000000000002',
    'Personal Projects',
    'Side projects, experiments, and personal work.',
    'aaaaaaaa-0000-0000-0000-000000000001'
)
ON CONFLICT (id) DO NOTHING;


-- ════════════════════════════════════════════════════════════
-- STEP 4 — Workspace members (3 members across workspaces)
-- ════════════════════════════════════════════════════════════

INSERT INTO public.workspace_members (workspace_id, user_id, role) VALUES
-- Acme Corp: Alice (ADMIN), Bob (MEMBER), Carol (MEMBER)
('bbbbbbbb-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', 'ADMIN'),
('bbbbbbbb-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000002', 'MEMBER'),
('bbbbbbbb-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000003', 'MEMBER'),
-- Personal Projects: Alice only (ADMIN)
('bbbbbbbb-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000001', 'ADMIN')
ON CONFLICT (workspace_id, user_id) DO NOTHING;


-- ════════════════════════════════════════════════════════════
-- STEP 5 — 5 Projects
-- ════════════════════════════════════════════════════════════

INSERT INTO public.projects (id, workspace_id, name, description, status, priority, start_date, end_date, team_lead, progress) VALUES
-- Acme Corp projects
(
    'cccccccc-0000-0000-0000-000000000001',
    'bbbbbbbb-0000-0000-0000-000000000001',
    'Customer Portal v2',
    'Redesign the customer portal with new UI and improved onboarding.',
    'ACTIVE', 'HIGH',
    '2026-01-15', '2026-04-30',
    'aaaaaaaa-0000-0000-0000-000000000001',
    45
),
(
    'cccccccc-0000-0000-0000-000000000002',
    'bbbbbbbb-0000-0000-0000-000000000001',
    'Mobile App Launch',
    'Build and launch the iOS and Android app.',
    'PLANNING', 'HIGH',
    '2026-02-01', '2026-06-30',
    'aaaaaaaa-0000-0000-0000-000000000002',
    10
),
(
    'cccccccc-0000-0000-0000-000000000003',
    'bbbbbbbb-0000-0000-0000-000000000001',
    'API Integration Suite',
    'Integrate third-party payment and shipping APIs.',
    'ACTIVE', 'MEDIUM',
    '2026-01-01', '2026-03-31',
    'aaaaaaaa-0000-0000-0000-000000000003',
    70
),
-- Personal Projects
(
    'cccccccc-0000-0000-0000-000000000004',
    'bbbbbbbb-0000-0000-0000-000000000002',
    'Portfolio Website',
    'Personal portfolio with case studies.',
    'ACTIVE', 'MEDIUM',
    '2026-02-01', '2026-03-15',
    'aaaaaaaa-0000-0000-0000-000000000001',
    60
),
(
    'cccccccc-0000-0000-0000-000000000005',
    'bbbbbbbb-0000-0000-0000-000000000002',
    'Open Source CLI Tool',
    'Command line productivity tool.',
    'PLANNING', 'LOW',
    '2026-03-01', '2026-07-31',
    'aaaaaaaa-0000-0000-0000-000000000001',
    5
)
ON CONFLICT (id) DO NOTHING;


-- ════════════════════════════════════════════════════════════
-- STEP 6 — Project members
-- ════════════════════════════════════════════════════════════

INSERT INTO public.project_members (project_id, user_id) VALUES
('cccccccc-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001'),
('cccccccc-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000002'),
('cccccccc-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000002'),
('cccccccc-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000003'),
('cccccccc-0000-0000-0000-000000000003', 'aaaaaaaa-0000-0000-0000-000000000001'),
('cccccccc-0000-0000-0000-000000000003', 'aaaaaaaa-0000-0000-0000-000000000003'),
('cccccccc-0000-0000-0000-000000000004', 'aaaaaaaa-0000-0000-0000-000000000001'),
('cccccccc-0000-0000-0000-000000000005', 'aaaaaaaa-0000-0000-0000-000000000001')
ON CONFLICT (project_id, user_id) DO NOTHING;


-- ════════════════════════════════════════════════════════════
-- STEP 7 — Tasks
-- ════════════════════════════════════════════════════════════

INSERT INTO public.tasks (project_id, title, description, status, type, priority, assignee_id, due_date) VALUES
('cccccccc-0000-0000-0000-000000000001', 'Design new dashboard layout', 'Create Figma wireframes.', 'DONE', 'TASK', 'HIGH', 'aaaaaaaa-0000-0000-0000-000000000001', '2026-02-10'),
('cccccccc-0000-0000-0000-000000000001', 'Implement SSO with Google', 'Integrate Google OAuth2.', 'IN_PROGRESS', 'FEATURE', 'HIGH', 'aaaaaaaa-0000-0000-0000-000000000002', '2026-03-01'),
('cccccccc-0000-0000-0000-000000000002', 'Set up React Native project', 'Initialize RN project.', 'DONE', 'TASK', 'HIGH', 'aaaaaaaa-0000-0000-0000-000000000002', '2026-02-05'),
('cccccccc-0000-0000-0000-000000000003', 'Stripe payment integration', 'Connect Stripe API.', 'DONE', 'FEATURE', 'HIGH', 'aaaaaaaa-0000-0000-0000-000000000003', '2026-01-31');
