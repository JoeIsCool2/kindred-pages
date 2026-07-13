const { hashPasscode } = require('../src/server/access-hash');

function sendJson(res, status, body) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.status(status).send(JSON.stringify(body, null, 2));
}

function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') return JSON.parse(req.body || '{}');

  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 2_500_000) {
        reject(new Error('Request body too large'));
        req.destroy();
      }
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(raw || '{}'));
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

function configured() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function baseUrl() {
  return process.env.SUPABASE_URL.replace(/\/$/, '');
}

function supabaseHeaders(prefer) {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(prefer ? { Prefer: prefer } : {})
  };
}

function memorialRow(site) {
  return {
    slug: site.slug || 'memorial',
    name: site.name || 'Untitled memorial',
    lifespan: site.lifespan || null,
    relationship: site.relationship || null,
    story: site.story || null,
    template: site.template || 'garden',
    tone: site.tone || 'warm',
    gathering_type: site.gatheringType || null,
    privacy: site.privacy || 'invite',
    access_code_hash: site.privacy === 'password' ? hashPasscode(site.accessCode) : null,
    invite_token: site.inviteToken || null,
    search_visibility: site.searchVisibility || null,
    allow_guest_sharing: site.allowGuestSharing !== false,
    service_title: site.serviceTitle || null,
    service_date: site.serviceDate || null,
    service_time: site.serviceTime || null,
    service_place: site.servicePlace || null,
    service_address: site.serviceAddress || null,
    dress_note: site.dressNote || null,
    livestream_url: site.livestream || null,
    livestream_plan: site.livestreamPlan || null,
    donation_url: site.donation || null,
    contact_email: site.contact || null,
    accessibility: site.accessibility || null,
    parking: site.parking || null,
    reception: site.reception || null,
    hotel_block: site.hotelBlock || null,
    travel_note: site.travelNote || null,
    child_note: site.childNote || null,
    ritual_note: site.ritualNote || null,
    honors_note: site.honorsNote || null,
    day_of_checklist: site.dayOfChecklist || null,
    guest_faq: site.guestFaq || null,
    custom_care: site.customCare || null,
    guest_updates: site.guestUpdates || null,
    anniversary_care: site.anniversaryCare || null,
    custom_domain: site.customDomain || null,
    search_title: site.searchTitle || null,
    search_description: site.searchDescription || null,
    share_image_url: site.shareImageUrl || null,
    canonical_url: site.canonicalUrl || null,
    robots_directive: site.robotsDirective || (site.privacy === 'public' ? 'index,follow' : 'noindex,nofollow'),
    plan: site.plan || null,
    launch_status: site.launchStatus || 'Draft',
    checkout_status: site.checkoutStatus || 'Ready',
    domain_status: site.domainStatus || 'Not connected',
    invite_status: site.inviteStatus || 'Not sent',
    publish_target: site.publishTarget || null,
    launch_approval: site.launchApproval || null,
    privacy_review: site.privacyReview || null,
    sensitive_review: site.sensitiveReview || null,
    archive_status: site.archiveStatus || 'Not exported',
    retention_plan: site.retentionPlan || null,
    closure_status: site.closureStatus || 'Open for memories',
    closure_requests: site.closureRequests || null,
    accessibility_checklist: site.accessibilityChecklist || null,
    draft_payload: site,
    updated_at: new Date().toISOString()
  };
}

async function loadDraft(slug) {
  const response = await fetch(`${baseUrl()}/rest/v1/memorials?slug=eq.${encodeURIComponent(slug)}&select=draft_payload,updated_at&limit=1`, {
    headers: supabaseHeaders()
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Draft lookup failed: ${detail}`);
  }

  const [row] = await response.json();
  return row || null;
}

async function saveDraft(site) {
  const response = await fetch(`${baseUrl()}/rest/v1/memorials?on_conflict=slug`, {
    method: 'POST',
    headers: supabaseHeaders('return=representation'),
    body: JSON.stringify(memorialRow(site))
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Draft save failed: ${detail}`);
  }

  const [row] = await response.json();
  return row;
}

async function insertArchiveExport(memorial, packet) {
  const exportedAt = packet.exportedAt || new Date().toISOString();
  const response = await fetch(`${baseUrl()}/rest/v1/archive_exports`, {
    method: 'POST',
    headers: supabaseHeaders('return=representation'),
    body: JSON.stringify({
      memorial_id: memorial.id,
      exported_by: packet.exportedBy || packet.site?.contact || null,
      export_status: 'Recorded',
      manifest: packet.manifest || {},
      archive_payload: packet,
      exported_at: exportedAt
    })
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Archive export insert failed: ${detail}`);
  }

  const [row] = await response.json();
  return row;
}

async function recordActivity(memorial, actor, detail) {
  const response = await fetch(`${baseUrl()}/rest/v1/activity_log`, {
    method: 'POST',
    headers: supabaseHeaders('return=minimal'),
    body: JSON.stringify({
      memorial_id: memorial.id,
      actor: actor || 'Family admin',
      action: 'Archive exported',
      detail: detail || 'A family archive export was recorded.'
    })
  });

  if (!response.ok) {
    const detailText = await response.text();
    throw new Error(`Archive activity insert failed: ${detailText}`);
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return sendJson(res, 405, { error: 'Method not allowed' });
  }

  if (!configured()) {
    return sendJson(res, 202, {
      status: 'configuration-needed',
      message: 'Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to save family drafts server-side.'
    });
  }

  try {
    if (req.method === 'GET') {
      const slug = String(req.query?.slug || '').trim();
      if (!slug) return sendJson(res, 422, { error: 'Draft lookup needs a slug' });

      const row = await loadDraft(slug);
      return sendJson(res, row ? 200 : 404, row
        ? { status: 'loaded', slug, draft: row.draft_payload, updatedAt: row.updated_at }
        : { status: 'not-found', slug });
    }

    const packet = await readBody(req);
    if (packet.action === 'archive-export') {
      const site = packet.site || {};
      if (!site.slug) return sendJson(res, 422, { error: 'Archive export packet needs a site slug' });

      const memorial = await saveDraft({ ...site, archiveStatus: 'Exported' });
      const archive = await insertArchiveExport(memorial, packet);
      await recordActivity(memorial, packet.exportedBy || site.contact, `Archive export recorded with ${packet.manifest?.included?.length || 0} included categories.`).catch(() => undefined);
      return sendJson(res, 200, {
        status: 'archive-recorded',
        slug: site.slug,
        archiveExportId: archive.id,
        exportedAt: archive.exported_at
      });
    }

    const site = packet.site || packet;
    if (!site.slug) return sendJson(res, 422, { error: 'Draft packet needs a slug' });

    const row = await saveDraft(site);
    return sendJson(res, 200, {
      status: 'saved',
      slug: site.slug,
      updatedAt: row?.updated_at || new Date().toISOString()
    });
  } catch (error) {
    return sendJson(res, 502, {
      error: 'Draft persistence failed',
      detail: error.message
    });
  }
};
