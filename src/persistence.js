export const STORAGE_KEY = 'kindred-site';
const META_KEY = 'kindred-site-meta';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const defaultSlug = import.meta.env.VITE_DEFAULT_MEMORIAL_SLUG || '';

const hasSupabase = Boolean(supabaseUrl && supabaseKey);

const headers = {
  apikey: supabaseKey,
  Authorization: `Bearer ${supabaseKey}`,
  'Content-Type': 'application/json',
  Prefer: 'return=representation'
};

function localMeta() {
  try {
    return JSON.parse(localStorage.getItem(META_KEY) || '{}');
  } catch {
    return {};
  }
}

function writeLocal(site) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(site));
  localStorage.setItem(META_KEY, JSON.stringify({ savedAt: new Date().toISOString(), slug: site.slug }));
}

function readLocal() {
  return localStorage.getItem(STORAGE_KEY);
}

function memorialRow(site) {
  return {
    slug: site.slug || 'memorial',
    name: site.name,
    lifespan: site.lifespan,
    relationship: site.relationship,
    story: site.story,
    template: site.template,
    tone: site.tone,
    privacy: site.privacy,
    service_title: site.serviceTitle,
    service_date: site.serviceDate,
    service_time: site.serviceTime,
    service_place: site.servicePlace,
    service_address: site.serviceAddress,
    dress_note: site.dressNote,
    livestream_url: site.livestream,
    donation_url: site.donation,
    contact_email: site.contact,
    custom_domain: site.customDomain,
    search_title: site.searchTitle,
    search_description: site.searchDescription,
    plan: site.plan,
    launch_status: site.launchStatus,
    checkout_status: site.checkoutStatus,
    domain_status: site.domainStatus,
    invite_status: site.inviteStatus,
    publish_target: site.publishTarget,
    draft_payload: site,
    updated_at: new Date().toISOString()
  };
}

export function persistenceLabel() {
  return hasSupabase ? 'Cloud draft' : 'Local draft';
}

export async function loadSiteDraft() {
  if (!hasSupabase) return readLocal();

  const slug = defaultSlug || localMeta().slug;
  if (!slug) return readLocal();

  try {
    const url = `${supabaseUrl}/rest/v1/memorials?slug=eq.${encodeURIComponent(slug)}&select=draft_payload&limit=1`;
    const response = await fetch(url, { headers });
    if (!response.ok) throw new Error('Cloud draft unavailable');
    const [row] = await response.json();
    return row?.draft_payload || readLocal();
  } catch {
    return readLocal();
  }
}

export async function saveSiteDraft(site) {
  writeLocal(site);

  if (!hasSupabase) {
    return { mode: 'local', savedAt: new Date().toISOString() };
  }

  try {
    const url = `${supabaseUrl}/rest/v1/memorials?on_conflict=slug`;
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(memorialRow(site))
    });
    if (!response.ok) throw new Error('Cloud save unavailable');
    return { mode: 'cloud', savedAt: new Date().toISOString() };
  } catch {
    return { mode: 'local-fallback', savedAt: new Date().toISOString() };
  }
}

