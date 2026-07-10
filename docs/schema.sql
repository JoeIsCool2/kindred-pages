create table memorials (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  lifespan text,
  relationship text,
  story text,
  template text not null default 'garden',
  tone text not null default 'warm',
  gathering_type text,
  privacy text not null default 'invite',
  access_code_hash text,
  invite_token text,
  search_visibility text,
  allow_guest_sharing boolean not null default true,
  service_title text,
  service_date text,
  service_time text,
  service_place text,
  service_address text,
  dress_note text,
  livestream_url text,
  livestream_plan jsonb,
  donation_url text,
  contact_email text,
  accessibility text,
  parking text,
  reception text,
  hotel_block text,
  travel_note text,
  child_note text,
  ritual_note text,
  honors_note text,
  day_of_checklist jsonb,
  guest_faq jsonb,
  custom_care jsonb,
  guest_updates jsonb,
  anniversary_care jsonb,
  custom_domain text,
  search_title text,
  search_description text,
  share_image_url text,
  canonical_url text,
  robots_directive text not null default 'noindex,nofollow',
  plan text,
  plan_price text,
  billing_mode text,
  checkout_payload jsonb,
  launch_status text not null default 'Draft',
  checkout_status text not null default 'Ready',
  domain_status text not null default 'Not connected',
  invite_status text not null default 'Not sent',
  publish_target text,
  launch_approval jsonb,
  privacy_review jsonb,
  sensitive_review jsonb,
  approved_by text,
  approved_at timestamptz,
  archive_status text not null default 'Not exported',
  retention_plan text,
  closure_status text not null default 'Open for memories',
  closure_requests jsonb,
  accessibility_checklist jsonb,
  draft_payload jsonb,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table memories (
  id uuid primary key default gen_random_uuid(),
  memorial_id uuid not null references memorials(id) on delete cascade,
  from_name text not null,
  relation text,
  body text not null,
  photo_url text,
  caption text,
  audio_url text,
  audio_label text,
  review_consent boolean not null default false,
  status text not null default 'Pending',
  created_at timestamptz not null default now(),
  approved_at timestamptz,
  rejected_at timestamptz,
  review_note text
);

create table rsvps (
  id uuid primary key default gen_random_uuid(),
  memorial_id uuid not null references memorials(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  guest_group text,
  attending text not null,
  party_size text,
  needs text,
  note text,
  invite_sent boolean not null default false,
  follow_up_done boolean not null default false,
  created_at timestamptz not null default now()
);

create table photos (
  id uuid primary key default gen_random_uuid(),
  memorial_id uuid not null references memorials(id) on delete cascade,
  storage_path text not null,
  caption text,
  is_cover boolean not null default false,
  is_public boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table coadmins (
  id uuid primary key default gen_random_uuid(),
  memorial_id uuid not null references memorials(id) on delete cascade,
  name text not null,
  role text not null,
  email text not null,
  status text not null default 'Invited',
  created_at timestamptz not null default now()
);

create table partner_accounts (
  id uuid primary key default gen_random_uuid(),
  organization text not null,
  coordinator text not null,
  phone text,
  email text not null,
  brand_line text,
  logo_initials text,
  default_package text,
  billing_mode text not null default 'Partner monthly plan',
  created_at timestamptz not null default now()
);

create table partner_drafts (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references partner_accounts(id) on delete cascade,
  memorial_id uuid references memorials(id) on delete set null,
  family text not null,
  memorial_name text not null,
  stage text not null,
  package text not null,
  owner text not null,
  created_at timestamptz not null default now()
);

create table event_schedule (
  id uuid primary key default gen_random_uuid(),
  memorial_id uuid not null references memorials(id) on delete cascade,
  time_label text not null,
  body text not null,
  sort_order integer not null default 0
);

create table care_contacts (
  id uuid primary key default gen_random_uuid(),
  memorial_id uuid not null references memorials(id) on delete cascade,
  name text not null,
  role text not null,
  detail text not null,
  created_at timestamptz not null default now()
);

create table aftercare_reminders (
  id uuid primary key default gen_random_uuid(),
  memorial_id uuid not null references memorials(id) on delete cascade,
  date_label text not null,
  body text not null,
  done boolean not null default false,
  sort_order integer not null default 0
);

create table thank_you_recipients (
  id uuid primary key default gen_random_uuid(),
  memorial_id uuid not null references memorials(id) on delete cascade,
  name text not null,
  reason text,
  method text,
  due_label text,
  sent boolean not null default false,
  sort_order integer not null default 0
);

create table obituary_placements (
  id uuid primary key default gen_random_uuid(),
  memorial_id uuid not null references memorials(id) on delete cascade,
  outlet text not null,
  type text,
  deadline text,
  contact text,
  cost text,
  status text not null default 'Draft',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table support_links (
  id uuid primary key default gen_random_uuid(),
  memorial_id uuid not null references memorials(id) on delete cascade,
  name text not null,
  type text not null,
  amount text,
  url text,
  status text not null default 'Open',
  created_at timestamptz not null default now()
);

create table support_needs (
  id uuid primary key default gen_random_uuid(),
  memorial_id uuid not null references memorials(id) on delete cascade,
  title text not null,
  category text,
  date_label text,
  detail text,
  claimed_by text,
  status text not null default 'Open',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table service_order_items (
  id uuid primary key default gen_random_uuid(),
  memorial_id uuid not null references memorials(id) on delete cascade,
  time_label text not null,
  body text not null,
  sort_order integer not null default 0
);

create table program_people (
  id uuid primary key default gen_random_uuid(),
  memorial_id uuid not null references memorials(id) on delete cascade,
  role text not null,
  name text not null,
  sort_order integer not null default 0
);

create table service_selections (
  id uuid primary key default gen_random_uuid(),
  memorial_id uuid not null references memorials(id) on delete cascade,
  type text not null,
  title text not null,
  person text,
  note text,
  status text not null default 'Needs check',
  sort_order integer not null default 0
);

create table activity_log (
  id uuid primary key default gen_random_uuid(),
  memorial_id uuid not null references memorials(id) on delete cascade,
  actor_name text,
  action text not null,
  detail text,
  created_at timestamptz not null default now()
);

create table launch_tasks (
  id uuid primary key default gen_random_uuid(),
  memorial_id uuid not null references memorials(id) on delete cascade,
  label text not null,
  done boolean not null default false,
  sort_order integer not null default 0
);

create index memories_memorial_id_idx on memories(memorial_id);
create index rsvps_memorial_id_idx on rsvps(memorial_id);
create index photos_memorial_id_idx on photos(memorial_id);
create index coadmins_memorial_id_idx on coadmins(memorial_id);
create index partner_drafts_partner_id_idx on partner_drafts(partner_id);
create index partner_drafts_memorial_id_idx on partner_drafts(memorial_id);
create index event_schedule_memorial_id_idx on event_schedule(memorial_id);
create index care_contacts_memorial_id_idx on care_contacts(memorial_id);
create index aftercare_reminders_memorial_id_idx on aftercare_reminders(memorial_id);
create index support_links_memorial_id_idx on support_links(memorial_id);
create index support_needs_memorial_id_idx on support_needs(memorial_id);
create index service_order_items_memorial_id_idx on service_order_items(memorial_id);
create index program_people_memorial_id_idx on program_people(memorial_id);
create index service_selections_memorial_id_idx on service_selections(memorial_id);
create index thank_you_recipients_memorial_id_idx on thank_you_recipients(memorial_id);
create index obituary_placements_memorial_id_idx on obituary_placements(memorial_id);
create index activity_log_memorial_id_idx on activity_log(memorial_id);
create index launch_tasks_memorial_id_idx on launch_tasks(memorial_id);
