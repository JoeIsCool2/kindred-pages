# Backend Contract

This frontend is ready to connect to a hosted backend. The recommended first production stack is Supabase, object storage, Stripe, and a transactional email provider.

## Included Vercel Function Targets

- `GET /api/checkout`: validates checkout query parameters and redirects to `STRIPE_CHECKOUT_URL` or `STRIPE_PAYMENT_LINK_BASE_URL` when configured.
- `POST /api/publish`: validates the launch packet and upserts publish state into Supabase when `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are configured.
- `POST /api/invites`: validates guest invite batches and sends them through `INVITE_WEBHOOK_URL` or Resend when `RESEND_API_KEY` and `INVITE_FROM_EMAIL` are configured.
- `GET /api/health`: reports whether checkout, publish database, invite delivery, and support email integrations are configured.

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

- Create memorial draft.
- Update memorial draft.
- Load and autosave full draft payloads by slug.
- Publish memorial page.
- Submit guest memory.
- Submit guest memory with optional photo, caption, voice note, and audio label.
- Approve or reject memory.
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
