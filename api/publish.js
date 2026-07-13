const { hashPasscode, sanitizeAccessPayload } = require('../src/server/access-hash');

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
      if (raw.length > 1_000_000) {
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

function validate(packet) {
  const missing = [];
  for (const key of ['slug', 'name', 'plan', 'privacy', 'contact', 'readiness', 'checkoutStatus']) {
    if (packet[key] === undefined || packet[key] === null || packet[key] === '') missing.push(key);
  }
  if (packet.privacy === 'password' && !packet.accessCode) missing.push('accessCode');
  if (packet.privacy === 'invite' && !packet.inviteToken) missing.push('inviteToken');
  if (Number(packet.readiness || 0) < 100) missing.push('readiness:100');
  if (packet.checkoutStatus !== 'Paid') missing.push('checkoutStatus:Paid');
  if (!reviewComplete(packet.familyApproval)) missing.push('familyApproval:complete');
  if (!reviewComplete(packet.privacyReview)) missing.push('privacyReview:complete');
  if (!reviewComplete(packet.sensitiveReview)) missing.push('sensitiveReview:complete');
  return missing;
}

function reviewComplete(review) {
  return Boolean(
    review?.reviewer &&
    review?.reviewedAt &&
    Array.isArray(review?.checks) &&
    review.checks.length &&
    review.checks.every((check) => check.done)
  );
}

async function existingMemorial(supabaseUrl, serviceKey, slug) {
  const response = await fetch(`${supabaseUrl.replace(/\/$/, '')}/rest/v1/memorials?slug=eq.${encodeURIComponent(slug)}&select=id,publish_eligible,stripe_payment_status,checkout_status&limit=1`, {
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      Accept: 'application/json'
    }
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Supabase publish eligibility lookup failed: ${detail}`);
  }

  const [row] = await response.json();
  return row || null;
}

async function saveToSupabase(packet) {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!supabaseUrl || !serviceKey) return null;

  const current = await existingMemorial(supabaseUrl, serviceKey, packet.slug);
  if (!current?.publish_eligible || current?.stripe_payment_status !== 'paid') {
    const error = new Error('Stripe payment has not been verified for this memorial.');
    error.status = 409;
    error.code = 'payment-required';
    throw error;
  }

  const metadata = packet.shareMetadata || {};

  const row = {
    slug: packet.slug,
    name: packet.name,
    contact_email: packet.contact,
    privacy: packet.privacy,
    access_code_hash: packet.privacy === 'password' ? hashPasscode(packet.accessCode) : null,
    invite_token: packet.inviteToken || null,
    custom_domain: packet.customDomain || null,
    gathering_type: packet.gatheringType || null,
    plan: packet.plan,
    plan_price: packet.planDetails?.price || null,
    billing_mode: packet.planDetails?.billing || null,
    checkout_payload: sanitizeAccessPayload(packet),
    launch_status: 'Published',
    checkout_status: 'Paid',
    invite_status: packet.inviteStatus || 'Not sent',
    publish_target: packet.publishTarget || packet.shareUrl || packet.productionUrl || null,
    search_title: metadata.title || null,
    search_description: metadata.description || null,
    share_image_url: metadata.image || null,
    canonical_url: metadata.url || packet.shareUrl || null,
    robots_directive: packet.privacy === 'public' ? (metadata.robots || 'index,follow') : 'noindex,nofollow',
    launch_approval: packet.familyApproval || null,
    privacy_review: packet.privacyReview || null,
    sensitive_review: packet.sensitiveReview || null,
    approved_by: packet.familyApproval?.reviewer || null,
    approved_at: packet.familyApproval?.reviewedAt || null,
    updated_at: new Date().toISOString()
  };

  const response = await fetch(`${supabaseUrl.replace(/\/$/, '')}/rest/v1/memorials?on_conflict=slug`, {
    method: 'POST',
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation'
    },
    body: JSON.stringify(row)
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Supabase publish failed: ${detail}`);
  }

  return response.json();
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return sendJson(res, 405, { error: 'Method not allowed' });
  }

  let packet;
  try {
    packet = await readBody(req);
  } catch {
    return sendJson(res, 400, { error: 'Invalid JSON body' });
  }

  const missing = validate(packet);
  if (missing.length) {
    return sendJson(res, 422, {
      error: 'Launch packet is not ready to publish',
      missing
    });
  }

  try {
    const saved = await saveToSupabase(packet);
    return sendJson(res, saved ? 200 : 202, {
      status: saved ? 'published' : 'configuration-needed',
      message: saved
        ? 'Launch packet saved to Supabase.'
        : 'Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to save publish packets server-side.',
      slug: packet.slug
    });
  } catch (error) {
    return sendJson(res, error.status || 502, {
      error: 'Publish integration failed',
      code: error.code || 'publish-failed',
      detail: error.message
    });
  }
};
