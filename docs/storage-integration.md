# Storage Integration

Kindred Pages uses a small persistence adapter in `src/persistence.js`.

## Local Mode

When Supabase environment variables are empty, drafts autosave to browser storage. This keeps the builder usable during demos, development, and offline family planning.

## Cloud Mode

Set these values to enable Supabase REST persistence:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_DEFAULT_MEMORIAL_SLUG`

The adapter loads `memorials.draft_payload` by slug and upserts the current draft into `memorials` with `on_conflict=slug`. It also keeps a local fallback copy so a failed cloud save does not destroy a family's work.

## Production Expectations

- Enable row-level security before launch.
- Scope family admins to memorials they own.
- Scope funeral-home partners to assigned drafts only.
- Store the full builder object in `draft_payload`.
- Use normalized tables for public reads, reporting, moderation, and partner operations.
- Keep local fallback available for temporary network failures.

