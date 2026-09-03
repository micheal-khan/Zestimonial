create extension if not exists pgcrypto;

create table public.workspaces (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null, slug text not null unique, brand_color text not null default '#d9f75b', created_at timestamptz not null default now()
);
create table public.testimonial_forms (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade,
  title text not null, slug text not null unique, intro text, is_active boolean not null default true, created_at timestamptz not null default now()
);
create table public.testimonial_requests (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade,
  form_id uuid not null references public.testimonial_forms(id) on delete cascade, client_name text not null, client_email text,
  project_name text, status text not null default 'draft' check (status in ('draft','sent','viewed','completed')), created_at timestamptz not null default now()
);
create table public.testimonials (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade,
  form_id uuid not null references public.testimonial_forms(id) on delete cascade, request_id uuid references public.testimonial_requests(id) on delete set null,
  author_name text not null, author_role text not null, quote text not null check (char_length(quote) >= 20),
  rating smallint not null check (rating between 1 and 5), consent boolean not null default false,
  status text not null default 'pending' check (status in ('pending','approved','rejected')), created_at timestamptz not null default now()
);
create table public.widgets (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null, layout text not null default 'carousel' check (layout in ('grid','carousel','single')),
  theme text not null default 'light' check (theme in ('light','dark')), is_published boolean not null default false, created_at timestamptz not null default now()
);

create index workspaces_owner_idx on public.workspaces(owner_id);
create index testimonials_workspace_idx on public.testimonials(workspace_id, created_at desc);
create index requests_workspace_idx on public.testimonial_requests(workspace_id, created_at desc);

alter table public.workspaces enable row level security;
alter table public.testimonial_forms enable row level security;
alter table public.testimonial_requests enable row level security;
alter table public.testimonials enable row level security;
alter table public.widgets enable row level security;

create policy "owners manage workspaces" on public.workspaces for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "owners manage forms" on public.testimonial_forms for all using (exists (select 1 from public.workspaces w where w.id = workspace_id and w.owner_id = auth.uid())) with check (exists (select 1 from public.workspaces w where w.id = workspace_id and w.owner_id = auth.uid()));
create policy "owners manage requests" on public.testimonial_requests for all using (exists (select 1 from public.workspaces w where w.id = workspace_id and w.owner_id = auth.uid())) with check (exists (select 1 from public.workspaces w where w.id = workspace_id and w.owner_id = auth.uid()));
create policy "owners manage testimonials" on public.testimonials for all using (exists (select 1 from public.workspaces w where w.id = workspace_id and w.owner_id = auth.uid())) with check (exists (select 1 from public.workspaces w where w.id = workspace_id and w.owner_id = auth.uid()));
create policy "owners manage widgets" on public.widgets for all using (exists (select 1 from public.workspaces w where w.id = workspace_id and w.owner_id = auth.uid())) with check (exists (select 1 from public.workspaces w where w.id = workspace_id and w.owner_id = auth.uid()));
