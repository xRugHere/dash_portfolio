-- ============================================================
-- Workspace tables for Brady's Portfolio
-- Run this in the Supabase SQL Editor (Dashboard → SQL → New Query)
-- ============================================================

-- 1. Current Project (singleton)
create table if not exists public.current_project (
  id uuid primary key default gen_random_uuid(),
  title text not null default '',
  description text not null default '',
  status text not null default 'planning'
    check (status in ('planning', 'in-progress', 'testing', 'completed')),
  progress integer not null default 0
    check (progress >= 0 and progress <= 100),
  tech_stack text[] not null default '{}',
  repo_url text,
  started_at date,
  expected_completion date,
  updated_at timestamptz not null default now()
);

-- 2. Commissions (singleton)
create table if not exists public.commissions (
  id uuid primary key default gen_random_uuid(),
  is_open boolean not null default false,
  queue_count integer not null default 0,
  pricing_notes text,
  response_time text,
  status_message text,
  updated_at timestamptz not null default now()
);

-- 3. Activity Log (multiple rows)
create table if not exists public.activity_log (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  type text not null default 'update'
    check (type in ('milestone', 'update', 'note', 'launch')),
  created_at timestamptz not null default now()
);

-- 4. Blog Posts (multiple rows)
create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null default '',
  slug text not null unique default '',
  content text not null default '',
  tags text[] not null default '{}',
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- Row-Level Security
-- Public can READ all tables. Only authenticated users can WRITE.
-- ============================================================

-- current_project
alter table public.current_project enable row level security;
create policy "Public read current_project"  on public.current_project for select using (true);
create policy "Auth write current_project"   on public.current_project for insert with check (auth.role() = 'authenticated');
create policy "Auth update current_project"  on public.current_project for update using (auth.role() = 'authenticated');
create policy "Auth delete current_project"  on public.current_project for delete using (auth.role() = 'authenticated');

-- commissions
alter table public.commissions enable row level security;
create policy "Public read commissions"  on public.commissions for select using (true);
create policy "Auth write commissions"   on public.commissions for insert with check (auth.role() = 'authenticated');
create policy "Auth update commissions"  on public.commissions for update using (auth.role() = 'authenticated');
create policy "Auth delete commissions"  on public.commissions for delete using (auth.role() = 'authenticated');

-- activity_log
alter table public.activity_log enable row level security;
create policy "Public read activity_log"  on public.activity_log for select using (true);
create policy "Auth write activity_log"   on public.activity_log for insert with check (auth.role() = 'authenticated');
create policy "Auth update activity_log"  on public.activity_log for update using (auth.role() = 'authenticated');
create policy "Auth delete activity_log"  on public.activity_log for delete using (auth.role() = 'authenticated');

-- blog_posts
alter table public.blog_posts enable row level security;
create policy "Public read blog_posts"  on public.blog_posts for select using (true);
create policy "Auth write blog_posts"   on public.blog_posts for insert with check (auth.role() = 'authenticated');
create policy "Auth update blog_posts"  on public.blog_posts for update using (auth.role() = 'authenticated');
create policy "Auth delete blog_posts"  on public.blog_posts for delete using (auth.role() = 'authenticated');
