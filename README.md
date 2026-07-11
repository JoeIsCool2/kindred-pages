# Kindred Pages

Kindred Pages is a memorial and celebration-of-life website builder for families, funeral homes, hospices, churches, and community organizers.

The product is designed around a sensitive workflow: create a beautiful memorial page, share service details, collect guest memories, moderate contributions, print QR keepsakes, and preserve an archive.

## What Is Built

- Guided memorial page builder
- Multi-page product experience with focused Home, Builder, Preview, Pricing, Partners, and Trust pages
- Browser-routed pages for `/builder`, `/preview`, `/pricing`, `/partners`, and `/trust`
- Pricing page with plan-fit guidance, family outcomes, partner value, and buying questions
- Route-specific page titles, descriptions, canonical URLs, and social preview metadata
- Static post-build route shells so crawlers and social previews receive page-specific metadata before JavaScript loads
- Guided gathering-type presets for celebration-of-life, funeral, graveside, online remembrance, and private archive pages
- Direct builder-section links for Person, Story, Service, Guest Care, Memories, Family Desk, Partner Desk, Announcements, Keepsakes, and Settings
- Section readiness markers in the builder navigation so families can see what needs attention
- Family Launch Guide that points admins to the next essential action
- Launch Snapshot that groups readiness into Story, Guest Care, Sharing, and Preservation
- Launch Issues panel that surfaces unresolved reviews, pending memories, unsent invites, open support needs, obituary status, archive, and closure items
- Gentle story-starter prompts for families who do not know where to begin
- Live public-page preview
- Privacy modes
- Access controls for family passcodes, invite tokens, search visibility, and guest sharing
- Guest-facing private access screen for invite-only and passcode memorials
- Launch command center for checkout, domain setup, publishing, and invite preparation
- Family launch approval packet with reviewer sign-off before publishing
- Checkout summary and copyable checkout packet with package price, billing mode, included items, contact, and return URL
- Share preview and copyable metadata packet for search, social cards, canonical URL, and robots settings
- Sensitive Details Review for cause-of-death wording, protected photos, support links, ritual notes, and family-only instructions
- Family-facing accessibility review for keyboard use, phone readability, service access, media labels, and private-page testing
- Curated photo gallery with captions, public/private visibility, and cover-photo selection
- Guest memory collection
- Guest photo memory submission with family moderation
- Guest voice-note memory submission with family moderation
- Keep-private moderation history for contributions the family chooses not to publish
- Guest relationship context and review-consent capture before memory submission
- Guest-care logistics for access, parking, reception, travel, children, rituals, and honors
- Guest FAQ for attire, children, flowers, livestream, accessibility, and other common questions
- Custom and ritual care guidance for cultural, faith, etiquette, and family-only notes
- Livestream and replay hub with platform, tech contact, backup instructions, and recording status
- Day-of schedule and helpful contacts
- Coordinator brief for service-day open tasks, guest needs, livestream backup, support needs, and contacts
- Day-of service packet with setup tasks, owners, access notes, livestream details, and contacts
- After-service reminder list
- Anniversary care message drafts with audience, status, and copyable remembrance notes
- Thank-you tracker for recipients, reasons, due dates, methods, and sent status
- Copyable aftercare packet with thank-you wording, archive status, reminders, and contact details
- Family moderation desk
- Family activity history for approvals, exports, helper invites, and launch actions
- Funeral-home Partner Desk with co-branding, family drafts, package status, and handoff controls
- RSVP and guest list management
- Paste-import guest list tool for names, emails, phones, and groups from spreadsheets, message threads, or notes
- Per-guest and pending-invite copy tools for family texting, email, or funeral-home handoff
- Public guest RSVP form with attendance choice, party size, care needs, and notes
- Public quick-action bar for RSVP, livestream, memory sharing, and family support
- Inline public-page confirmations for RSVP, support claims, and memory submissions
- Guest contact, group, and invite-status tracking for family outreach
- Family Desk guest-needs tracker with follow-up status
- Support/donation coordination cards
- Public support options for donations, meal trains, flowers, and volunteer help
- Support needs board for meals, rides, setup, errands, claimants, and completion status
- Third-party support-link disclosure before guests open donation or help links
- Co-admin and funeral-home handoff records
- Editable family helper invites with role, email, status, and copyable handoff note
- Copyable family ownership handoff packet with owner, helpers, archive, approvals, privacy, partner access, and next actions
- Real QR code generation
- Downloadable printable QR table cards
- Printable memorial page
- Downloadable calendar file
- Downloadable polished service program with cover, order of service, participants, selections, family wishes, and QR memory link
- Downloadable printable memory book with story, photos, chapters, prompts, and approved memories
- Editable order-of-service and participant list for service programs
- Readings, music, and tribute planner with notes and confirmation status
- Downloadable archive JSON
- Family archive manifest with retention and closure status
- Closure and data request log with copyable family-support packet
- Restorable archive import
- Local autosave with Supabase-ready cloud persistence adapter
- Guest-list CSV export
- Downloadable guest guide
- Copyable invitation, memory request, and thank-you messages
- Editable announcement kit for obituary text, newspaper notices, SMS invites, social posts, and livestream reminders
- Obituary publication tracker for newspaper, funeral-home, and online notices
- Guest update center with urgent public banners for last-minute livestream, reception, access, weather, and follow-up notes
- Privacy and sharing review for search, invites, guest sharing, public media, and archive choices
- Responsive desktop and mobile design
- Trust center, pricing, and launch positioning
- Family and funeral-home onboarding paths
- Public privacy, terms, and security contact pages
- Optimized hero image for faster first load

## Local Development

```bash
npm install
npm run start
```

The local site runs at `http://127.0.0.1:5173/`.

## Production Build

```bash
npm run build
npm run verify
npm run verify:config
```

The static production output is generated in `dist/`.

`npm run verify:config` expects real production values in `.env.local`; it will fail against blank demo values from `.env.example`.

Public trust pages are served from `/privacy.html`, `/terms.html`, and `/security.txt`.

The app experience is split into focused pages: `/` explains the product, `/builder` creates the memorial, `/preview` shows the guest-facing page, `/pricing` presents plans, `/partners` supports funeral-home buyers, and `/trust` explains privacy, moderation, archive, and research-backed product decisions.

## Deployment

This app can deploy to any static host that supports single-page apps, including Vercel, Netlify, Cloudflare Pages, or S3/CloudFront.

Vercel security headers allow approved HTTPS APIs, media, storage, and checkout destinations while keeping scripts self-hosted and blocking third-party framing.

Required production services for a real launch:

- Authentication for family admins and funeral-home partners
- Database storage for memorial pages, RSVPs, memories, service programs, support links, and plans
- Object storage for uploaded photos and archive exports
- Email delivery for invite links, contribution prompts, and anniversary reminders
- Payment processing for one-time family plans and funeral-home subscriptions
- Publish endpoint for launch packets, domain setup, and invite batch status
- Open Graph, canonical URL, share image, and robots metadata publishing
- Moderation and activity logging for guest submissions, exports, helper invites, and launch actions

The current frontend is launch-shaped and production-buildable, but it uses local browser storage as its data layer until those services are connected.

See [docs/backend-contract.md](docs/backend-contract.md) and [docs/schema.sql](docs/schema.sql) for the production data model and API contract.
Use [docs/storage-integration.md](docs/storage-integration.md) when connecting cloud draft persistence.
Use [docs/production-checklist.md](docs/production-checklist.md) before a real deployment.
See [docs/research-rationale.md](docs/research-rationale.md) for the bereavement and social-support rationale behind the product decisions.

Copy `.env.example` to `.env.local` when connecting hosted services.

## Brand

Name: Kindred Pages  
Positioning: Memorial websites families can finish gently.  
Audience: families planning celebrations of life, plus funeral homes that need a polished digital add-on.
