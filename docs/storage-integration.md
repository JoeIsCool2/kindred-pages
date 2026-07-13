# Storage Integration

Kindred Pages uses a small persistence adapter in `src/persistence.js`.

## Local Mode

When Supabase environment variables are empty, drafts autosave to browser storage. This keeps the builder usable during demos, development, and offline family planning.

## Cloud Mode

Set this frontend value so the builder saves through the server endpoint:

- `VITE_DRAFT_ENDPOINT`

Set these server-only values so `/api/drafts` can load and save the draft:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `VITE_DEFAULT_MEMORIAL_SLUG`

The adapter loads `memorials.draft_payload` by slug through `GET /api/drafts` and upserts the current draft through `POST /api/drafts`. It also keeps a local fallback copy so a failed server save does not destroy a family's work.

## Media Upload Planning

Photo uploads appear immediately in the builder as local previews, then the frontend asks `POST /api/media` for production storage targets.

Set these server-only values to enable private media storage:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `MEDIA_BUCKET`

The media endpoint accepts:

- `slug`
- `visibility`
- `files[]` with `name`, `type`, and `size`

When storage is configured, the endpoint returns storage paths and signed upload details. When storage is not configured, it returns `configuration-needed` and the builder keeps photos available locally while marking them as needing production storage setup.

## Production Expectations

- Enable row-level security before launch.
- Scope family admins to memorials they own.
- Scope funeral-home partners to assigned drafts only.
- Store the full builder object in `draft_payload`.
- Store family photos as private objects by default.
- Persist each uploaded photo path, caption, cover choice, public/private visibility, and sort order in `photos`.
- Use signed upload targets rather than exposing service-role credentials to the browser.
- Use normalized tables for public reads, reporting, moderation, and partner operations.
- Keep local fallback available for temporary network failures.
