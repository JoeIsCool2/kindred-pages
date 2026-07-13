# Launch Notes

## Privacy Commitments

- Memorial pages should default to private or invite-only.
- Public indexing should be a deliberate choice.
- Guest memories should require family approval before appearing publicly.
- Family admins should be able to download a full archive before closing a page.
- Funeral-home co-admins should assist without owning the family's archive.

## Terms Commitments

- Families retain ownership of the stories, photos, and memorial text they upload.
- Guests should understand that submitted memories may be reviewed or edited by family admins.
- Donation links should be external unless a licensed payment flow is implemented.
- The product should not present itself as grief counseling or medical advice.

## Launch Checklist

- Connect authentication.
- Configure `/api/auth` with admin sign-in delivery credentials.
- Configure `/api/audit` with Supabase service credentials for append-only activity logs.
- Configure `/api/drafts` with Supabase service credentials for protected draft autosave.
- Configure `/api/memories`, `/api/rsvps`, and `/api/support-claims` with Supabase service credentials for durable guest workflows.
- Configure `GUEST_NOTIFICATION_FROM_EMAIL` if guest submissions should notify the family by email.
- Connect database tables for memorials, memories, RSVPs, co-admins, support links, and launch tasks.
- Configure `/api/access` with Supabase server-side credentials for invite and passcode checks.
- Set `ACCESS_HASH_SECRET` so production passcode pages use a server-side pepper in addition to salted hashes.
- Connect photo/object storage.
- Configure `/api/media` with Supabase storage credentials and a private media bucket.
- Add transactional email templates.
- Add Stripe or another payment provider.
- Configure `/api/checkout` with a Stripe Checkout URL or payment link base.
- Configure `/api/publish` with Supabase server-side credentials.
- Configure `/api/invites` with an invite webhook or Resend email credentials.
- Check `/api/health` before announcing the site to paying families.
- Add abuse reporting and moderation logs.
- Add production analytics focused on completion and drop-off, not invasive guest tracking.
- Verify accessibility with keyboard navigation and screen reader labels.
- Verify printed QR cards and service programs.
