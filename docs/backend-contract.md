# Backend Contract

This frontend is ready to connect to a hosted backend. The recommended first production stack is Supabase, object storage, Stripe, and a transactional email provider.

Server functions use `SUPABASE_SERVICE_ROLE_KEY` for controlled writes. Browser clients should use Supabase Auth plus the RLS policies in `docs/schema.sql`; they should not receive service-role credentials.

## Included Vercel Function Targets

- `GET /api/checkout`: creates Stripe Checkout Sessions with `STRIPE_SECRET_KEY` and plan Price IDs, verifies Checkout Session status with `action=status`, and can fall back to `STRIPE_CHECKOUT_URL` or `STRIPE_PAYMENT_LINK_BASE_URL`.
- `POST /api/checkout`: verifies Stripe webhooks with `STRIPE_WEBHOOK_SECRET` and persists completed Checkout Session payment state to Supabase.
- `POST /api/auth`: prepares or sends family-admin and partner sign-in links through `AUTH_WEBHOOK_URL` or Resend when auth credentials are configured.
- `POST /api/audit`: appends family-admin and partner activity events to `activity_log` when Supabase service credentials are configured.
- `GET /api/drafts`: loads `memorials.draft_payload` by slug when Supabase service credentials are configured.
- `POST /api/drafts`: upserts protected family draft state into `memorials` through server-side Supabase credentials.
- `POST /api/memories`: stores guest memories in `memories` with `Pending` moderation status and optionally notifies the family through Resend.
- `PATCH /api/memories`: approves or rejects a pending guest memory, preserves `approved_at`, `rejected_at`, and `review_note`, and appends a moderation entry to `activity_log`.
- `POST /api/rsvps`: stores guest RSVP details in `rsvps` and optionally notifies the family through Resend.
- `POST /api/support-claims`: marks a matching support need as claimed and optionally notifies the family through Resend.
- `POST /api/publish`: validates the launch packet and upserts publish state into Supabase when `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are configured.
- `POST /api/access`: validates invite-link and passcode access attempts against stored memorial privacy records when Supabase service credentials are configured. Passcodes are verified against `access_code_hash`; raw passcodes are not stored in the publish packet.
- `POST /api/media`: validates photo upload metadata and creates private storage upload targets when `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `MEDIA_BUCKET` are configured.
- `POST /api/invites`: validates guest invite batches and sends them through `INVITE_WEBHOOK_URL` or Resend when `RESEND_API_KEY` and `INVITE_FROM_EMAIL` are configured.
- `GET /api/health`: reports `configured`, `connected`, and `launchBlocking` status for admin auth, audit logging, draft persistence, guest actions, checkout, publish database, access control, media storage, invite delivery, and support email integrations. Launch readiness requires live probes for the Supabase tables, private media bucket, Stripe plan prices, and Resend delivery API where those providers are required.

## Core Tables

### memorials

- `id`
- `slug`
- `name`
- `lifespan`
- `relationship`
- `story`
- `template`
- `tone`
- `gathering_type`
- `privacy`
- `access_code_hash`
- `invite_token`
- `search_visibility`
- `allow_guest_sharing`
- `service_title`
- `service_date`
- `service_time`
- `service_place`
- `service_address`
- `dress_note`
- `livestream_url`
- `livestream_plan`
- `donation_url`
- `contact_email`
- `accessibility`
- `parking`
- `reception`
- `hotel_block`
- `travel_note`
- `child_note`
- `ritual_note`
- `honors_note`
- `day_of_checklist`
- `guest_faq`
- `custom_care`
- `guest_updates`
- `anniversary_care`
- `custom_domain`
- `search_title`
- `search_description`
- `share_image_url`
- `canonical_url`
- `robots_directive`
- `plan`
- `plan_price`
- `billing_mode`
- `checkout_payload`
- `stripe_checkout_session_id`
- `stripe_payment_status`
- `stripe_plan_price_id`
- `stripe_customer_id`
- `stripe_subscription_id`
- `stripe_payment_intent_id`
- `stripe_paid_at`
- `billing_return_url`
- `publish_eligible`
- `launch_status`
- `checkout_status`
- `domain_status`
- `invite_status`
- `publish_target`
- `launch_approval`
- `privacy_review`
- `sensitive_review`
- `approved_by`
- `approved_at`
- `archive_status`
- `retention_plan`
- `closure_status`
- `closure_requests`
- `accessibility_checklist`
- `draft_payload`
- `created_by`
- `created_at`
- `updated_at`

### memorial_members

- `id`
- `memorial_id`
- `user_id`
- `email`
- `role`
- `created_at`

### auth_sessions

- `id`
- `slug`
- `email`
- `name`
- `role`
- `token_hash`
- `expires_at`
- `verified_at`
- `revoked_at`

### memories

- `id`
- `memorial_id`
- `from_name`
- `relation`
- `body`
- `photo_url`
- `caption`
- `audio_url`
- `audio_label`
- `review_consent`
- `status`
- `created_at`
- `approved_at`
- `rejected_at`
- `review_note`

### rsvps

- `id`
- `memorial_id`
- `name`
- `email`
- `phone`
- `guest_group`
- `attending`
- `party_size`
- `needs`
- `note`
- `invite_sent`
- `follow_up_done`
- `created_at`

### photos

- `id`
- `memorial_id`
- `storage_path`
- `caption`
- `is_cover`
- `is_public`
- `sort_order`
- `created_at`

### coadmins

- `id`
- `memorial_id`
- `name`
- `role`
- `email`
- `status`
- `created_at`

### partner_accounts

- `id`
- `organization`
- `coordinator`
- `phone`
- `email`
- `brand_line`
- `logo_initials`
- `default_package`
- `billing_mode`
- `created_at`

### partner_account_members

- `id`
- `partner_id`
- `user_id`
- `email`
- `role`
- `created_at`

### partner_drafts

- `id`
- `partner_id`
- `memorial_id`
- `family`
- `memorial_name`
- `stage`
- `package`
- `owner`
- `created_at`

### event_schedule

- `id`
- `memorial_id`
- `time_label`
- `body`
- `sort_order`

### care_contacts

- `id`
- `memorial_id`
- `name`
- `role`
- `detail`
- `created_at`

### aftercare_reminders

- `id`
- `memorial_id`
- `date_label`
- `body`
- `done`
- `sort_order`

### thank_you_recipients

- `id`
- `memorial_id`
- `name`
- `reason`
- `method`
- `due_label`
- `sent`
- `sort_order`

### obituary_placements

- `id`
- `memorial_id`
- `outlet`
- `type`
- `deadline`
- `contact`
- `cost`
- `status`
- `sort_order`
- `created_at`

### support_links

- `id`
- `memorial_id`
- `name`
- `type`
- `amount`
- `url`
- `status`
- `created_at`

### support_needs

- `id`
- `memorial_id`
- `title`
- `category`
- `date_label`
- `detail`
- `claimed_by`
- `status`
- `sort_order`
- `created_at`

### service_order_items

- `id`
- `memorial_id`
- `time_label`
- `body`
- `sort_order`

### program_people

- `id`
- `memorial_id`
- `role`
- `name`
- `sort_order`

### service_selections

- `id`
- `memorial_id`
- `type`
- `title`
- `person`
- `note`
- `status`
- `sort_order`

### activity_log

- `id`
- `memorial_id`
- `actor_name`
- `action`
- `detail`
- `created_at`

### launch_tasks

- `id`
- `memorial_id`
- `label`
- `done`
- `sort_order`

## Required API Operations

- Hash passcodes with a salted verifier before storing `access_code_hash`; set `ACCESS_HASH_SECRET` as a server-only pepper for production.
- Require `inviteToken` for invite-only publishing and `accessCode` for passcode publishing.
- Store guest memories, RSVPs, and support claims server-side before relying on them for a paid family launch.
- Keep guest memory status at `Pending` until a family moderator approves it.
- Enable row-level security for all memorial, guest, partner, archive, support, and activity tables before adding browser-side Supabase access.
- Seed `memorial_members` and `partner_account_members` when creating owners, helpers, and funeral-home coordinators.
- Issue signed, expiring admin sign-in links with `AUTH_SECRET`, verify them server-side, and persist hashed session records in `auth_sessions`.
- Use Stripe Checkout Sessions with `STRIPE_SECRET_KEY`, `STRIPE_FAMILY_PAGE_PRICE_ID`, `STRIPE_LEGACY_ARCHIVE_PRICE_ID`, and `STRIPE_FUNERAL_HOME_PRICE_ID` before marking a payment as launch-ready.
- Set `STRIPE_WEBHOOK_SECRET` and route Stripe Checkout webhooks to `POST /api/checkout` so completed payment status is persisted even when the buyer does not return to the app.
- Verify returned Checkout Session status server-side before setting `checkoutStatus` to `Paid`; never use a client-only timer or optimistic UI to mark checkout paid.

- Create memorial draft.
- Update memorial draft.
- Load and autosave full draft payloads by slug.
- Publish memorial page.
- Submit guest memory.
- Submit guest memory with optional photo, caption, voice note, and audio label.
- Approve or reject memory with a server-backed moderation update.
- Upload and delete photos.
- Add or remove co-admins.
- Record activity for moderation, exports, helper invites, publishing, checkout, domain setup, and invite preparation.
- Manage partner account branding, family drafts, package status, and family handoff.
- Update guest-care details, event schedule, helpful contacts, and after-service reminders.
- Update family-facing accessibility review checklist.
- Update family sensitive-details review checklist.
- Update service program order and participant records.
- Export memorial archive.
- Export archive manifest with counts, retention plan, closure status, and included records.
- Export guest list CSV.
- Export guest guide.
- Export or copy aftercare packet with thank-you wording, archive status, reminders, and helpful contacts.
- Create checkout session.
- Create checkout packet with selected plan, price, billing mode, included items, contact, slug, privacy mode, and return URL.
- Persist checkout, domain, publish, and invite status.
- Publish page from a launch packet.
- Publish Open Graph, canonical URL, share image, and robots metadata from the launch packet.
- Send family invite email.
- Send contribution request email.

## Production Rules

- Guest-submitted memories default to `Pending`.
- Family admins can approve a memory or keep it private with `rejected_at` and `review_note` preserved for moderation history.
- Invite-only pages should use unguessable share tokens.
- Password-protected pages should hash passwords server-side.
- Search visibility should map to robots/meta behavior at publish time.
- Invite-only, password, and hidden pages should publish `noindex,nofollow`; public pages may publish `index,follow`.
- Social previews should use family-approved title, description, canonical URL, and image metadata.
- Accessibility review state should persist with the memorial draft and be included in launch readiness.
- Sensitive-details review state should persist with reviewer, timestamp, checklist state, and notes for cause-of-death wording, protected photos, support links, ritual notes, and family-only details.
- Family launch approval should persist with reviewer, timestamp, checklist state, and the final approval packet before publishing.
- Guest updates should persist as ordered title, timing, and detail records for public page display, copied announcement packets, guest guides, and archives.
- Day-of service packet checklist should persist owner, area, task, and done state for coordinator exports and archive preservation.
- Guest FAQ answers should persist as ordered question and answer records for public display, guest guides, day-of packets, and archive preservation.
- Uploaded photos should be private objects unless a page is public.
- Photo records should preserve captions, cover-photo choice, public/private visibility, and sort order.
- Archive export should include metadata, approved memories, pending memories, private moderation records, RSVPs, guest-care logistics, photo manifests, and QR/share URLs.
- Activity logs should be append-only for family admins and partner coordinators.
- Funeral-home admins should have scoped access to assigned memorials only.
- Partner accounts should expose only their assigned drafts, client families, billing state, and co-branding settings.
