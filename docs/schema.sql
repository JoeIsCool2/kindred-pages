create extension if not exists pgcrypto;

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
  stripe_checkout_session_id text,
  stripe_payment_status text,
  stripe_plan_price_id text,
  stripe_customer_id text,
  stripe_subscription_id text,
  stripe_payment_intent_id text,
  stripe_paid_at timestamptz,
  billing_return_url text,
  publish_eligible boolean not null default false,
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

create table memorial_members (
  id uuid primary key default gen_random_uuid(),
  memorial_id uuid not null references memorials(id) on delete cascade,
  user_id uuid not null,
  email text,
  role text not null default 'owner',
  created_at timestamptz not null default now(),
  unique (memorial_id, user_id)
);

create table auth_sessions (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  email text,
  name text,
  role text not null default 'helper',
  token_hash text not null,
  expires_at timestamptz,
  verified_at timestamptz not null default now(),
  revoked_at timestamptz
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

create table guest_invites (
  id uuid primary key default gen_random_uuid(),
  memorial_id uuid not null references memorials(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  guest_group text,
  delivery_provider text,
  delivery_status text not null default 'Prepared',
  provider_message_id text,
  private_invite_url text,
  sent_at timestamptz,
  failed_at timestamptz,
  failure_reason text,
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

create table partner_account_members (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references partner_accounts(id) on delete cascade,
  user_id uuid not null,
  email text,
  role text not null default 'coordinator',
  created_at timestamptz not null default now(),
  unique (partner_id, user_id)
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

create table archive_exports (
  id uuid primary key default gen_random_uuid(),
  memorial_id uuid not null references memorials(id) on delete cascade,
  exported_by text,
  export_status text not null default 'Recorded',
  manifest jsonb not null,
  archive_payload jsonb,
  exported_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index memories_memorial_id_idx on memories(memorial_id);
create index memorial_members_memorial_id_idx on memorial_members(memorial_id);
create index memorial_members_user_id_idx on memorial_members(user_id);
create index auth_sessions_slug_idx on auth_sessions(slug);
create index auth_sessions_token_hash_idx on auth_sessions(token_hash);
create index rsvps_memorial_id_idx on rsvps(memorial_id);
create index guest_invites_memorial_id_idx on guest_invites(memorial_id);
create index guest_invites_email_idx on guest_invites(email);
create index photos_memorial_id_idx on photos(memorial_id);
create index coadmins_memorial_id_idx on coadmins(memorial_id);
create index partner_account_members_partner_id_idx on partner_account_members(partner_id);
create index partner_account_members_user_id_idx on partner_account_members(user_id);
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
create index archive_exports_memorial_id_idx on archive_exports(memorial_id);

alter table memorials enable row level security;
alter table memorial_members enable row level security;
alter table auth_sessions enable row level security;
alter table memories enable row level security;
alter table rsvps enable row level security;
alter table guest_invites enable row level security;
alter table photos enable row level security;
alter table coadmins enable row level security;
alter table partner_accounts enable row level security;
alter table partner_account_members enable row level security;
alter table partner_drafts enable row level security;
alter table event_schedule enable row level security;
alter table care_contacts enable row level security;
alter table aftercare_reminders enable row level security;
alter table thank_you_recipients enable row level security;
alter table obituary_placements enable row level security;
alter table support_links enable row level security;
alter table support_needs enable row level security;
alter table service_order_items enable row level security;
alter table program_people enable row level security;
alter table service_selections enable row level security;
alter table activity_log enable row level security;
alter table launch_tasks enable row level security;
alter table archive_exports enable row level security;

create or replace function current_user_can_manage_memorial(target_memorial_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from memorial_members
    where memorial_members.memorial_id = target_memorial_id
      and memorial_members.user_id = auth.uid()
      and memorial_members.role in ('owner', 'admin', 'helper', 'partner')
  );
$$;

create or replace function current_user_can_manage_partner(target_partner_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from partner_account_members
    where partner_account_members.partner_id = target_partner_id
      and partner_account_members.user_id = auth.uid()
      and partner_account_members.role in ('owner', 'coordinator', 'staff')
  );
$$;

create policy "public published memorial read"
  on memorials for select
  using (privacy = 'public' and launch_status = 'Published');

create policy "members manage memorials"
  on memorials for all
  using (current_user_can_manage_memorial(id))
  with check (current_user_can_manage_memorial(id));

create policy "members read own membership"
  on memorial_members for select
  using (user_id = auth.uid() or current_user_can_manage_memorial(memorial_id));

create policy "owners manage memorial membership"
  on memorial_members for all
  using (
    exists (
      select 1 from memorial_members owner_membership
      where owner_membership.memorial_id = memorial_members.memorial_id
        and owner_membership.user_id = auth.uid()
        and owner_membership.role in ('owner', 'admin')
    )
  )
  with check (
    exists (
      select 1 from memorial_members owner_membership
      where owner_membership.memorial_id = memorial_members.memorial_id
        and owner_membership.user_id = auth.uid()
        and owner_membership.role in ('owner', 'admin')
    )
  );

create policy "service role manages auth sessions"
  on auth_sessions for all
  using (false)
  with check (false);

create policy "public approved memories read"
  on memories for select
  using (
    status = 'Approved'
    and exists (
      select 1 from memorials
      where memorials.id = memories.memorial_id
        and memorials.privacy = 'public'
        and memorials.launch_status = 'Published'
    )
  );

create policy "members manage memories"
  on memories for all
  using (current_user_can_manage_memorial(memorial_id))
  with check (current_user_can_manage_memorial(memorial_id));

create policy "members manage rsvps"
  on rsvps for all
  using (current_user_can_manage_memorial(memorial_id))
  with check (current_user_can_manage_memorial(memorial_id));

create policy "members manage guest invites"
  on guest_invites for all
  using (current_user_can_manage_memorial(memorial_id))
  with check (current_user_can_manage_memorial(memorial_id));

create policy "public photos read"
  on photos for select
  using (
    is_public = true
    and exists (
      select 1 from memorials
      where memorials.id = photos.memorial_id
        and memorials.privacy = 'public'
        and memorials.launch_status = 'Published'
    )
  );

create policy "members manage photos"
  on photos for all
  using (current_user_can_manage_memorial(memorial_id))
  with check (current_user_can_manage_memorial(memorial_id));

create policy "members manage coadmins"
  on coadmins for all
  using (current_user_can_manage_memorial(memorial_id))
  with check (current_user_can_manage_memorial(memorial_id));

create policy "partners manage accounts"
  on partner_accounts for all
  using (current_user_can_manage_partner(id))
  with check (current_user_can_manage_partner(id));

create policy "partners read own membership"
  on partner_account_members for select
  using (user_id = auth.uid() or current_user_can_manage_partner(partner_id));

create policy "partner owners manage membership"
  on partner_account_members for all
  using (
    exists (
      select 1 from partner_account_members partner_owner
      where partner_owner.partner_id = partner_account_members.partner_id
        and partner_owner.user_id = auth.uid()
        and partner_owner.role in ('owner', 'coordinator')
    )
  )
  with check (
    exists (
      select 1 from partner_account_members partner_owner
      where partner_owner.partner_id = partner_account_members.partner_id
        and partner_owner.user_id = auth.uid()
        and partner_owner.role in ('owner', 'coordinator')
    )
  );

create policy "partners manage drafts"
  on partner_drafts for all
  using (
    current_user_can_manage_partner(partner_id)
    or (memorial_id is not null and current_user_can_manage_memorial(memorial_id))
  )
  with check (
    current_user_can_manage_partner(partner_id)
    or (memorial_id is not null and current_user_can_manage_memorial(memorial_id))
  );

create policy "members manage event schedule"
  on event_schedule for all using (current_user_can_manage_memorial(memorial_id)) with check (current_user_can_manage_memorial(memorial_id));
create policy "members manage care contacts"
  on care_contacts for all using (current_user_can_manage_memorial(memorial_id)) with check (current_user_can_manage_memorial(memorial_id));
create policy "members manage aftercare reminders"
  on aftercare_reminders for all using (current_user_can_manage_memorial(memorial_id)) with check (current_user_can_manage_memorial(memorial_id));
create policy "members manage thank you recipients"
  on thank_you_recipients for all using (current_user_can_manage_memorial(memorial_id)) with check (current_user_can_manage_memorial(memorial_id));
create policy "members manage obituary placements"
  on obituary_placements for all using (current_user_can_manage_memorial(memorial_id)) with check (current_user_can_manage_memorial(memorial_id));
create policy "members manage support links"
  on support_links for all using (current_user_can_manage_memorial(memorial_id)) with check (current_user_can_manage_memorial(memorial_id));
create policy "members manage support needs"
  on support_needs for all using (current_user_can_manage_memorial(memorial_id)) with check (current_user_can_manage_memorial(memorial_id));
create policy "members manage service order"
  on service_order_items for all using (current_user_can_manage_memorial(memorial_id)) with check (current_user_can_manage_memorial(memorial_id));
create policy "members manage program people"
  on program_people for all using (current_user_can_manage_memorial(memorial_id)) with check (current_user_can_manage_memorial(memorial_id));
create policy "members manage service selections"
  on service_selections for all using (current_user_can_manage_memorial(memorial_id)) with check (current_user_can_manage_memorial(memorial_id));
create policy "members read activity log"
  on activity_log for select using (current_user_can_manage_memorial(memorial_id));
create policy "members manage launch tasks"
  on launch_tasks for all using (current_user_can_manage_memorial(memorial_id)) with check (current_user_can_manage_memorial(memorial_id));

create policy "members manage archive exports"
  on archive_exports for all using (current_user_can_manage_memorial(memorial_id)) with check (current_user_can_manage_memorial(memorial_id));
