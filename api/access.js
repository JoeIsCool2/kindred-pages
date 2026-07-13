const { verifyPasscode } = require('./access-hash');

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
      if (raw.length > 100_000) {
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

function normalize(value, mode) {
  const text = String(value || '').trim();
  return mode === 'password' ? text : text.toLowerCase();
}

function demoAccess(packet) {
  const mode = packet.privacy || 'invite';
  const expected = mode === 'password' ? packet.accessCode : packet.inviteToken;
  const provided = packet.code || packet.invite || '';
  if (!expected) return false;
  return normalize(provided, mode) === normalize(expected, mode);
}

async function storedAccess(packet) {
  const supabaseUrl = process.env.SUPABASE_URL || '';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!supabaseUrl || !serviceKey) return null;

  const slug = encodeURIComponent(packet.slug || '');
  const response = await fetch(`${supabaseUrl.replace(/\/$/, '')}/rest/v1/memorials?slug=eq.${slug}&select=slug,privacy,invite_token,access_code_hash`, {
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      Accept: 'application/json'
    }
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Access lookup failed: ${detail}`);
  }

  const [record] = await response.json();
  if (!record) return false;
  if (record.privacy === 'public' || record.privacy === 'hidden') return true;
  if (record.privacy === 'invite') return normalize(packet.invite || packet.code, 'invite') === normalize(record.invite_token, 'invite');
  if (record.privacy === 'password') return verifyPasscode(packet.code || packet.accessCode, record.access_code_hash);

  return false;
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

  if (!packet.slug || !packet.privacy) {
    return sendJson(res, 422, {
      error: 'Access packet is not ready',
      missing: ['slug', 'privacy'].filter((key) => !packet[key])
    });
  }

  if (packet.privacy === 'public' || packet.privacy === 'hidden') {
    return sendJson(res, 200, { status: 'granted', reason: 'Public or hidden-from-search page' });
  }

  try {
    const stored = await storedAccess(packet);
    if (stored && typeof stored === 'object') return sendJson(res, 202, stored);
    if (stored === true) return sendJson(res, 200, { status: 'granted', reason: 'Server access verified' });
    if (stored === false) return sendJson(res, 403, { status: 'denied', reason: 'Access code does not match this memorial' });

    if (demoAccess(packet)) {
      return sendJson(res, 202, {
        status: 'granted',
        mode: 'demo-fallback',
        message: 'Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to enforce access checks against stored memorial records.'
      });
    }

    return sendJson(res, 403, {
      status: 'denied',
      mode: 'demo-fallback',
      reason: 'Access code does not match this memorial'
    });
  } catch (error) {
    return sendJson(res, 502, {
      error: 'Access integration failed',
      detail: error.message
    });
  }
};
