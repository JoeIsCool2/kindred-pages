import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const envPath = join(root, '.env.local');
const examplePath = join(root, '.env.example');
const sourcePath = existsSync(envPath) ? envPath : examplePath;
const env = Object.fromEntries(
  readFileSync(sourcePath, 'utf8')
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith('#') && line.includes('='))
    .map((line) => {
      const index = line.indexOf('=');
      return [line.slice(0, index), line.slice(index + 1)];
    })
);

const required = [
  ['VITE_APP_URL', 'Public production URL'],
  ['VITE_SUPABASE_URL', 'Supabase REST URL for cloud draft storage'],
  ['VITE_SUPABASE_ANON_KEY', 'Supabase anonymous key with row-level security'],
  ['VITE_STRIPE_PUBLISHABLE_KEY', 'Stripe publishable key'],
  ['VITE_STRIPE_CHECKOUT_URL', 'Hosted checkout or checkout function URL'],
  ['VITE_PUBLISH_ENDPOINT', 'Publish endpoint for launch packets'],
  ['VITE_INVITE_ENDPOINT', 'Invite delivery endpoint for guest batches'],
  ['VITE_MEDIA_ENDPOINT', 'Media upload planning endpoint for photo storage'],
  ['VITE_ACCESS_ENDPOINT', 'Access-check endpoint for invite and passcode pages'],
  ['VITE_AUTH_ENDPOINT', 'Admin authentication endpoint for family and partner sessions'],
  ['VITE_SUPPORT_EMAIL', 'Reachable support email']
];

const optional = [
  ['VITE_DEFAULT_MEMORIAL_SLUG', 'Default draft slug for cloud preview'],
  ['VITE_POSTHOG_KEY', 'Analytics key'],
  ['STRIPE_CHECKOUT_URL', 'Server-side Stripe Checkout redirect target'],
  ['STRIPE_PAYMENT_LINK_BASE_URL', 'Server-side Stripe payment link fallback'],
  ['SUPABASE_URL', 'Server-side Supabase REST URL for publish endpoint'],
  ['SUPABASE_SERVICE_ROLE_KEY', 'Server-side Supabase service role key for publish endpoint'],
  ['MEDIA_BUCKET', 'Private object-storage bucket for family photos'],
  ['AUTH_SECRET', 'Server-side auth signing secret'],
  ['AUTH_DEMO_TOKEN', 'Demo auth token for local preview only'],
  ['AUTH_WEBHOOK_URL', 'Server-side auth magic-link webhook'],
  ['AUTH_WEBHOOK_SECRET', 'Optional auth webhook bearer secret'],
  ['AUTH_FROM_EMAIL', 'Verified from-address for auth emails'],
  ['INVITE_WEBHOOK_URL', 'Server-side invite delivery webhook'],
  ['INVITE_WEBHOOK_SECRET', 'Optional invite webhook bearer secret'],
  ['RESEND_API_KEY', 'Server-side Resend key for invite email delivery'],
  ['INVITE_FROM_EMAIL', 'Verified from-address for invite emails'],
  ['SUPPORT_EMAIL', 'Server-side support email fallback']
];

const missing = required.filter(([key]) => !env[key]);
const weak = [];

if (env.VITE_APP_URL && !env.VITE_APP_URL.startsWith('https://')) {
  weak.push('VITE_APP_URL should use https:// in production');
}

if (missing.length || weak.length) {
  console.error(`Production config check failed using ${sourcePath.replace(`${root}/`, '')}:`);
  for (const [key, label] of missing) console.error(`- Missing ${key}: ${label}`);
  for (const warning of weak) console.error(`- ${warning}`);
  console.error('\nOptional values:');
  for (const [key, label] of optional) console.error(`- ${key}: ${env[key] ? 'set' : `not set (${label})`}`);
  process.exit(1);
}

console.log(`Production config check passed using ${sourcePath.replace(`${root}/`, '')}.`);
for (const [key] of optional) {
  console.log(`${key}: ${env[key] ? 'set' : 'not set'}`);
}
