-- Wall of Love, widget editor, follow-up reminders, and AI highlights.

alter table public.workspaces
  add column wall_enabled boolean not null default true,
  add column wall_headline text,
  add column auto_reminders boolean not null default true;

alter table public.testimonial_requests
  add column last_sent_at timestamptz,
  add column reminder_count smallint not null default 0;

alter table public.testimonials
  add column highlight text,
  add column tags text[] not null default '{}',
  add column ai_processed_at timestamptz;

alter table public.widgets drop constraint widgets_layout_check;
alter table public.widgets
  add constraint widgets_layout_check check (layout in ('grid','carousel','single','masonry','marquee','badge')),
  add column accent_color text,
  add column show_rating boolean not null default true,
  add column show_role boolean not null default true,
  add column use_highlight boolean not null default false,
  add column max_items smallint not null default 12 check (max_items between 1 and 50),
  add column corner_radius smallint not null default 16 check (corner_radius between 0 and 32),
  add column tag_filter text;

create index requests_reminder_idx on public.testimonial_requests(status, last_sent_at) where client_email is not null;
create index testimonials_tags_idx on public.testimonials using gin(tags);
