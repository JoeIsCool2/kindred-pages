export const STORAGE_KEY = 'kindred-site';
const META_KEY = 'kindred-site-meta';

const defaultSlug = import.meta.env.VITE_DEFAULT_MEMORIAL_SLUG || '';
const draftEndpoint = import.meta.env.VITE_DRAFT_ENDPOINT || '/api/drafts';

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

export function persistenceLabel() {
  return draftEndpoint ? 'Protected draft' : 'Local draft';
}

export async function loadSiteDraft() {
  const slug = defaultSlug || localMeta().slug;
  if (!draftEndpoint || !slug) return readLocal();

  try {
    const response = await fetch(`${draftEndpoint}?slug=${encodeURIComponent(slug)}`);
    if (response.status === 202 || response.status === 404) return readLocal();
    if (!response.ok) throw new Error('Server draft unavailable');
    const row = await response.json();
    return row?.draft || readLocal();
  } catch {
    return readLocal();
  }
}

export async function saveSiteDraft(site) {
  writeLocal(site);

  if (!draftEndpoint) {
    return { mode: 'local', savedAt: new Date().toISOString() };
  }

  try {
    const response = await fetch(draftEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ site })
    });
    if (response.status === 202) return { mode: 'local-fallback', savedAt: new Date().toISOString() };
    if (!response.ok) throw new Error('Server save unavailable');
    return { mode: 'server', savedAt: new Date().toISOString() };
  } catch {
    return { mode: 'local-fallback', savedAt: new Date().toISOString() };
  }
}
