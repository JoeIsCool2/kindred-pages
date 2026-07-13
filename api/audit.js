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
      if (raw.length > 250_000) {
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

async function memorialIdForSlug(slug) {
  const supabaseUrl = process.env.SUPABASE_URL.replace(/\/$/, '');
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const response = await fetch(`${supabaseUrl}/rest/v1/memorials?slug=eq.${encodeURIComponent(slug)}&select=id&limit=1`, {
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      Accept: 'application/json'
    }
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Audit memorial lookup failed: ${detail}`);
  }

  const [row] = await response.json();
  return row?.id || null;
}

async function saveAudit(packet) {
  const memorialId = await memorialIdForSlug(packet.slug);
  if (!memorialId) return null;

  const supabaseUrl = process.env.SUPABASE_URL.replace(/\/$/, '');
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const row = {
    memorial_id: memorialId,
    actor_name: packet.actor || packet.actorName || null,
    action: packet.action,
    detail: packet.detail || null
  };

  const response = await fetch(`${supabaseUrl}/rest/v1/activity_log`, {
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
    throw new Error(`Audit insert failed: ${detail}`);
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

  const missing = ['slug', 'action'].filter((key) => !packet[key]);
  if (missing.length) {
    return sendJson(res, 422, {
      error: 'Audit packet is not ready',
      missing
    });
  }

  if (!configured()) {
    return sendJson(res, 202, {
      status: 'configuration-needed',
      message: 'Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to append audit events server-side.',
      auditPacket: {
        slug: packet.slug,
        actor: packet.actor || packet.actorName || '',
        action: packet.action,
        detail: packet.detail || '',
        occurredAt: packet.occurredAt || new Date().toISOString()
      }
    });
  }

  try {
    const saved = await saveAudit(packet);
    return sendJson(res, saved ? 200 : 404, {
      status: saved ? 'logged' : 'memorial-not-found',
      slug: packet.slug,
      action: packet.action
    });
  } catch (error) {
    return sendJson(res, 502, {
      error: 'Audit integration failed',
      detail: error.message
    });
  }
};
