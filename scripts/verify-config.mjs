import { existsSync, readFileSync } from 'node:fs';
import { basename, join, relative } from 'node:path';

const root = process.cwd();
const envPath = join(root, '.env.local');
const examplePath = join(root, '.env.example');
const sourcePath = process.argv[2] ? join(root, process.argv[2]) : existsSync(envPath) ? envPath : examplePath;

function parseEnv(path) {
  return Object.fromEntries(
    readFileSync(path, 'utf8')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#') && line.includes('='))
      .map((line) => {
        const index = line.indexOf('=');
        const key = line.slice(0, index).trim();
        const rawValue = line.slice(index + 1).trim();
        const value = rawValue.replace(/^['"]|['"]$/g, '');
        return [key, value];
      })
  );
}

function isPlaceholder(value) {
  return /^(changeme|change-me|todo|placeholder|example|test|demo)$/i.test(value || '');
}

function has(key) {
  return Boolean(env[key] && !isPlaceholder(env[key]));
}

function isHttpsUrl(value) {
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}

function isEndpoint(value) {
  return Boolean(value && (value.startsWith('/api/') || isHttpsUrl(value)));
}

function looksLikeEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value || '');
}

function addMissing(key, label) {
  if (!has(key)) missing.push(`Missing ${key}: ${label}`);
}

function addFormat(key, label, predicate) {
  if (has(key) && !predicate(env[key])) weak.push(`${key} ${label}`);
}

if (!existsSync(sourcePath)) {
  console.error(`Production config check failed: ${relative(root, sourcePath)} does not exist.`);
  process.exit(1);
}

const env = parseEnv(sourcePath);
const missing = [];
const weak = [];

const required = [
  ['VITE_APP_URL', 'public production URL'],
  ['APP_URL', 'server-side production URL for checkout and magic links'],
  ['VITE_STRIPE_PUBLISHABLE_KEY', 'Stripe publishable key'],
  ['VITE_STRIPE_CHECKOUT_URL', 'checkout endpoint'],
  ['VITE_PUBLISH_ENDPOINT', 'publish endpoint for launch packets'],
  ['VITE_INVITE_ENDPOINT', 'invite delivery endpoint for guest batches'],
  ['VITE_MEDIA_ENDPOINT', 'media upload endpoint for private photos'],
  ['VITE_ACCESS_ENDPOINT', 'access-check endpoint for invite and passcode pages'],
  ['VITE_AUTH_ENDPOINT', 'admin authentication endpoint'],
  ['VITE_AUDIT_ENDPOINT', 'append-only audit log endpoint'],
  ['VITE_DRAFT_ENDPOINT', 'protected draft persistence endpoint'],
  ['VITE_MEMORY_ENDPOINT', 'guest memory submission endpoint'],
  ['VITE_RSVP_ENDPOINT', 'guest RSVP endpoint'],
  ['VITE_SUPPORT_CLAIM_ENDPOINT', 'guest support claim endpoint'],
  ['VITE_SUPPORT_EMAIL', 'public support email'],
  ['STRIPE_SECRET_KEY', 'Stripe secret key for Checkout Sessions'],
  ['STRIPE_FAMILY_PAGE_PRICE_ID', 'Stripe Price ID for Family Page plan'],
  ['STRIPE_LEGACY_ARCHIVE_PRICE_ID', 'Stripe Price ID for Legacy Archive plan'],
  ['STRIPE_FUNERAL_HOME_PRICE_ID', 'Stripe Price ID for Funeral Home plan'],
  ['STRIPE_WEBHOOK_SECRET', 'Stripe webhook signing secret'],
  ['SUPABASE_URL', 'server-side Supabase REST URL'],
  ['SUPABASE_SERVICE_ROLE_KEY', 'server-side Supabase service role key'],
  ['ACCESS_HASH_SECRET', 'server-side passcode pepper'],
  ['MEDIA_BUCKET', 'private Supabase Storage bucket'],
  ['AUTH_SECRET', 'server-side auth token signing secret'],
  ['RESEND_API_KEY', 'Resend API key'],
  ['AUTH_FROM_EMAIL', 'verified auth sender email'],
  ['INVITE_FROM_EMAIL', 'verified invite sender email'],
  ['GUEST_NOTIFICATION_FROM_EMAIL', 'verified guest-notification sender email'],
  ['SUPPORT_EMAIL', 'server-side support email fallback']
];

for (const [key, label] of required) addMissing(key, label);

for (const key of ['VITE_APP_URL', 'APP_URL', 'SUPABASE_URL']) {
  addFormat(key, 'must be an https:// URL', isHttpsUrl);
}

for (const key of [
  'VITE_STRIPE_CHECKOUT_URL',
  'VITE_PUBLISH_ENDPOINT',
  'VITE_INVITE_ENDPOINT',
  'VITE_MEDIA_ENDPOINT',
  'VITE_ACCESS_ENDPOINT',
  'VITE_AUTH_ENDPOINT',
  'VITE_AUDIT_ENDPOINT',
  'VITE_DRAFT_ENDPOINT',
  'VITE_MEMORY_ENDPOINT',
  'VITE_RSVP_ENDPOINT',
  'VITE_SUPPORT_CLAIM_ENDPOINT'
]) {
  addFormat(key, 'must be an /api/... path or https:// URL', isEndpoint);
}

for (const key of ['VITE_SUPPORT_EMAIL', 'AUTH_FROM_EMAIL', 'INVITE_FROM_EMAIL', 'GUEST_NOTIFICATION_FROM_EMAIL', 'SUPPORT_EMAIL']) {
  addFormat(key, 'must look like an email address', looksLikeEmail);
}

addFormat('VITE_STRIPE_PUBLISHABLE_KEY', 'must look like a Stripe publishable key', (value) => value.startsWith('pk_'));
addFormat('STRIPE_SECRET_KEY', 'must look like a Stripe secret key', (value) => value.startsWith('sk_'));
for (const key of ['STRIPE_FAMILY_PAGE_PRICE_ID', 'STRIPE_LEGACY_ARCHIVE_PRICE_ID', 'STRIPE_FUNERAL_HOME_PRICE_ID']) {
  addFormat(key, 'must look like a Stripe Price ID', (value) => value.startsWith('price_'));
}
addFormat('STRIPE_WEBHOOK_SECRET', 'must look like a Stripe webhook secret', (value) => value.startsWith('whsec_'));
addFormat('SUPABASE_SERVICE_ROLE_KEY', 'must be a non-trivial service role key', (value) => value.length >= 40);
addFormat('ACCESS_HASH_SECRET', 'must be at least 32 characters', (value) => value.length >= 32);
addFormat('AUTH_SECRET', 'must be at least 32 characters', (value) => value.length >= 32);
addFormat('RESEND_API_KEY', 'must look like a Resend API key', (value) => value.startsWith('re_'));

if (env.ALLOW_DEMO_AUTH === 'true') weak.push('ALLOW_DEMO_AUTH must not be true in production');
if (env.ALLOW_DEMO_ACCESS === 'true') weak.push('ALLOW_DEMO_ACCESS must not be true in production');
if (has('AUTH_DEMO_TOKEN')) weak.push('AUTH_DEMO_TOKEN should be unset for production');

for (const key of ['AUTH_WEBHOOK_URL', 'INVITE_WEBHOOK_URL']) {
  addFormat(key, 'must be an https:// URL when set', isHttpsUrl);
}

const optional = [
  ['VITE_SUPABASE_URL', 'public Supabase URL for future browser-side reads'],
  ['VITE_SUPABASE_ANON_KEY', 'public Supabase anonymous key for future browser-side reads'],
  ['VITE_DEFAULT_MEMORIAL_SLUG', 'default draft slug for cloud preview'],
  ['VITE_POSTHOG_KEY', 'analytics key'],
  ['STRIPE_CHECKOUT_URL', 'external Stripe Checkout redirect target'],
  ['STRIPE_PAYMENT_LINK_BASE_URL', 'server-side Stripe payment link fallback'],
  ['AUTH_WEBHOOK_URL', 'auth magic-link webhook alternative'],
  ['AUTH_WEBHOOK_SECRET', 'auth webhook bearer secret'],
  ['INVITE_WEBHOOK_URL', 'invite delivery webhook alternative'],
  ['INVITE_WEBHOOK_SECRET', 'invite webhook bearer secret']
];

if (missing.length || weak.length) {
  console.error(`Production config check failed using ${relative(root, sourcePath) || basename(sourcePath)}:`);
  for (const item of missing) console.error(`- ${item}`);
  for (const item of weak) console.error(`- ${item}`);
  console.error('\nOptional values:');
  for (const [key, label] of optional) console.error(`- ${key}: ${env[key] ? 'set' : `not set (${label})`}`);
  process.exit(1);
}

console.log(`Production config check passed using ${relative(root, sourcePath) || basename(sourcePath)}.`);
for (const [key] of optional) {
  console.log(`${key}: ${env[key] ? 'set' : 'not set'}`);
}
