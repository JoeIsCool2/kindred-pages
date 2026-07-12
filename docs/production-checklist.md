# Production Checklist

Use this before putting Kindred Pages in front of paying families or funeral-home partners.

## Product

- Confirm the guided builder creates a complete memorial page without blank required sections.
- Confirm `/` immediately shows the niche, the audience map, and the memorial loop from first draft to family archive.
- Confirm `/`, `/builder`, `/templates`, `/preview`, `/pricing`, `/partners`, and `/trust` each have one clear job and do not force families through a long generic website-builder flow.
- Confirm `/templates` lets a family choose a situation-specific starting point and applies the matching service, privacy, livestream, guest-care, and archive defaults.
- Confirm `/preview` shows guest tasks, family outcomes, service-day artifacts, and clear next actions beyond the visual page preview.
- Confirm `/pricing` helps families and funeral homes choose a plan with fit guidance, concrete outcomes, privacy reassurance, and partner handoff value.
- Confirm `/pricing` explains which plan fits urgent service sharing, legacy preservation, and funeral-home partner work, plus what happens after payment.
- Confirm `/partners` explains the funeral-home workflow from intake to coordination to family handoff, including service-day exports, scoped access, and repeatable partner value.
- Confirm `/partners` shows package fit, staff workflow, family handoff, and concrete service artifacts a care team can hand off.
- Confirm `/trust` explains privacy safeguards, moderation, archive control, and research-backed product decisions without requiring families to read dense research.
- Confirm direct builder-section links open the right step, including `#settings`, `#desk`, and `#keepsakes`.
- Confirm builder navigation readiness markers accurately show which sections are ready or need attention.
- Confirm the builder first-three-decisions guide keeps the first step focused on situation, identity, and launch control.
- Confirm Launch Snapshot clearly groups readiness into Story, Guest Care, Sharing, and Preservation.
- Confirm Launch Issues panel surfaces unresolved reviews, pending memories, unsent invites, open support needs, obituary status, archive, and closure items before publishing.
- Confirm Launch Readiness Report can be copied and downloaded with readiness, next action, public visibility, private reviews, guest-care gaps, payment, archive, and launch checklist status.
- Confirm local autosave, cloud draft loading, and cloud save fallback preserve a family's work.
- Confirm privacy defaults to invite-only or another family-safe mode.
- Confirm gathering-type presets safely adjust service, privacy, schedule, livestream, and guest-care defaults without overwriting the family story.
- Confirm guest-facing private access screens appear for invite-only and passcode pages before memorial content is shown.
- Confirm passcodes, invite tokens, guest sharing, and search visibility are enforced server-side at publish time.
- Confirm guest memories enter moderation before publishing.
- Confirm guest memories can be approved or kept private, and that kept-private records remain visible to family admins only.
- Confirm guest memories capture relationship context and review consent before submission.
- Confirm guest photo memories upload privately, display in moderation, and publish only after approval.
- Confirm family gallery photos support captions, cover-photo selection, and public/private visibility before publishing.
- Confirm voice-note memories upload privately, play back in moderation, and publish only after approval.
- Confirm guest-care logistics cover accessibility, parking, reception, schedule, contacts, and after-service follow-up.
- Confirm Accessibility Review covers keyboard use, phone readability, service access, media labels, and private-page testing.
- Confirm custom and ritual care guidance supports public and family-only notes for cultural, faith, etiquette, and family boundaries.
- Confirm livestream and replay hub shows platform, watch link, replay link, tech contact, backup instructions, and recording status.
- Confirm public RSVP submissions capture name, attendance mode, party size, guest needs, notes, and follow-up status in the Family Desk.
- Confirm public quick-action bar moves guests to RSVP, livestream, memory sharing, and family support without page confusion.
- Confirm pasted guest lists import names, emails, phones, groups, invite status, and follow-up defaults without duplicating existing guests.
- Confirm per-guest and pending-invite copy tools include the private invite link, service details, and memory request wording.
- Confirm public-page RSVP, support-claim, and memory-submission confirmations appear clearly after guest actions.
- Confirm guest records capture email, phone, group, invite status, and exported contact details.
- Confirm announcement templates cover obituary, newspaper notice, SMS invite, social post, livestream reminder, and thank-you copy.
- Confirm obituary placement tracker records outlet, deadline, contact, fee, and publication status.
- Confirm guest updates can be edited, marked urgent, copied, shown as public banners, exported in the guest guide, and preserved in the archive.
- Confirm guest FAQ answers can be edited, shown on the public page, exported in guest/day-of guides, and preserved in the archive.
- Confirm QR codes point to the correct published page.
- Confirm QR table cards download with the published page link embedded.
- Confirm calendar, program, guest guide, archive, and guest-list exports download correctly.
- Confirm memory book downloads with life story, chapters, photos, approved memories, and later-story prompts.
- Confirm day-of service packet downloads and copies service details, access notes, livestream link, contacts, guest updates, guest needs, and coordinator checklist.
- Confirm coordinator brief copies open service-day tasks, guest needs, livestream backup, support needs, and helpful contacts.
- Confirm aftercare packet copies thank-you wording, archive status, follow-up reminders, and helpful contacts.
- Confirm anniversary care messages can be drafted, copied, statused, included in aftercare packets, and preserved in the archive.
- Confirm service programs include a polished cover, order of service, participant list, readings, music, tributes, notes, family wishes, and QR memory link.
- Confirm support needs can be created, claimed by guests, marked complete, exported in guest/day-of guides, and preserved in the archive.
- Confirm checkout, publish endpoint, domain setup, and invite batch states work in production.
- Confirm the five-step launch path clearly shows review, payment, publishing, invites, and preservation states.
- Confirm family launch approval requires reviewer, timestamp, final review checklist, and approval packet before publishing.
- Confirm Sensitive Details Review requires reviewer, timestamp, checklist, notes, and approval-packet inclusion before publishing.
- Confirm checkout summary and packet include selected plan, price, billing mode, included items, family contact, slug, privacy mode, and return URL.
- Confirm share preview title, description, image, canonical URL, and robots settings match the published page.
- Confirm Home, Builder, Preview, Pricing, Partners, and Trust routes each set a clear page title, description, canonical URL, Open Graph, and Twitter preview metadata.
- Confirm built route shells exist for `/builder`, `/preview`, `/pricing`, `/partners`, and `/trust` so social crawlers receive static metadata before JavaScript loads.
- Confirm family helper invite notes, roles, email addresses, editable statuses, and copied-invite state are saved and sent correctly.
- Confirm family ownership handoff packet includes owner, helpers, archive, approvals, privacy, partner access, and remaining next actions.
- Confirm the family activity history records memory approvals, kept-private moderation actions, exports, helper invite copies, checkout, domain, publish, and invite actions.
- Confirm Partner Desk permissions, co-branding, family draft ownership, and handoff status work for funeral-home accounts.
- Confirm public pages work on mobile and desktop.
- Confirm Accessibility Review state persists after reload and is reflected in launch readiness.

## Backend

- Connect authentication for family admins and funeral-home partners.
- Connect database tables from `docs/schema.sql`.
- Connect Supabase draft persistence from `docs/storage-integration.md`.
- Connect private object storage for photos, gallery captions, cover-photo choice, visibility settings, and archive exports.
- Connect transactional email for invites, contribution requests, and reminders.
- Connect reminder scheduling for anniversary and after-service follow-up.
- Connect payment provider for family and funeral-home plans.
- Set `STRIPE_CHECKOUT_URL` or `STRIPE_PAYMENT_LINK_BASE_URL` for `/api/checkout`.
- Connect checkout packet fields to the payment provider and fulfillment workflow.
- Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` for `/api/publish`.
- Set `INVITE_WEBHOOK_URL` or `RESEND_API_KEY` plus `INVITE_FROM_EMAIL` for `/api/invites`.
- Confirm invite batches can be queued through `/api/invites` or safely exported when delivery is not configured.
- Confirm `/api/health` reports checkout, publish database, invite delivery, and support email integration state.
- Connect checkout return handling, publish endpoint, and domain verification status.
- Connect Open Graph, canonical URL, share image, and robots metadata publishing.
- Connect partner account billing, scoped permissions, and family handoff emails.
- Connect append-only audit logs for moderation, co-admin, export, publish, checkout, domain, and invite actions.

## Trust And Safety

- Publish privacy and terms pages.
- Confirm support/security contact is reachable.
- Confirm donation/support links clearly disclose that guests are leaving Kindred Pages when third-party.
- Confirm family support options are editable, visible on the memorial page, and clearly labeled before opening third-party links.
- Confirm no page is indexed unless the family chooses a public mode.
- Confirm invite-only, password, and hidden pages publish `noindex,nofollow`, while public pages may publish `index,follow`.
- Confirm archive export is available before page closure.
- Confirm closure and data requests can be logged, statused, copied, and included in archive records.
- Confirm archive manifest includes counts, retention plan, closure status, kept-private moderation records, and all included record categories.
- Confirm archive manifest includes aftercare packet wording and reminder status.
- Confirm archive manifest includes anniversary care message drafts and status.
- Confirm archive manifest includes thank-you tracker recipients and sent status.
- Confirm archive manifest includes guest update history.
- Confirm archive manifest includes guest FAQ answers.
- Confirm archive manifest includes custom, ritual, faith, and family guidance.
- Confirm archive manifest includes livestream platform, replay, recording, and backup plan.
- Confirm archive manifest includes day-of service packet checklist records.
- Confirm archive manifest includes support needs, claimants, and status.
- Confirm Privacy & Sharing Review records reviewer, timestamp, checklist, and notes before publishing.
- Confirm archive manifest includes privacy and sharing review notes, checks, and reviewer.
- Confirm archive manifest includes sensitive details review notes, checks, reviewer, and timestamp.
- Confirm archive manifest includes the printable memory book keepsake.
- Confirm archive manifest includes the family activity log.
- Confirm memory relationship context, review consent, order-of-service items, program participants, and thank-you recipients persist as first-class records.

## Deployment

- Set environment variables from `.env.example`.
- Run `npm run build`.
- Run `npm run verify`.
- Run `npm run verify:config` with real `.env.local` production values.
- Run dependency audit when registry access is available.
- Confirm production CSP allows approved HTTPS API, image, media, checkout, and storage endpoints while blocking framing and unsafe scripts.
- Deploy `dist/` through the selected host.
- Smoke test `/`, `/builder`, `/preview`, `/pricing`, `/partners`, `/trust`, `/privacy.html`, `/terms.html`, `/security.txt`, `/robots.txt`, and `/sitemap.xml`.
