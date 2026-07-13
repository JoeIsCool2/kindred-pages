const crypto = require('node:crypto');

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
      if (raw.length > 200_000) {
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
  return Boolean(
    process.env.AUTH_SECRET &&
    (
      process.env.AUTH_WEBHOOK_URL ||
      (process.env.RESEND_API_KEY && process.env.AUTH_FROM_EMAIL)
    )
  );
}

function demoAuthEnabled() {
  return process.env.ALLOW_DEMO_AUTH === 'true' && Boolean(process.env.AUTH_DEMO_TOKEN);
}

function base64Url(input) {
  return Buffer.from(input).toString('base64url');
}

function normalizeRole(role) {
  const normalized = String(role || '').toLowerCase();
  if (normalized.includes('partner') || normalized.includes('funeral')) return 'partner';
  if (normalized.includes('owner') || normalized.includes('admin')) return 'owner';
  if (normalized.includes('helper')) return 'helper';
  if (normalized.includes('support')) return 'support';
  return 'helper';
}

function issueToken(packet) {
  if (!process.env.AUTH_SECRET) {
    if (demoAuthEnabled()) return process.env.AUTH_DEMO_TOKEN;
    return '';
  }

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    typ: 'kindred-admin-session',
    email: String(packet.email || '').trim().toLowerCase(),
    name: packet.name || '',
    slug: packet.slug || 'memorial',
    role: normalizeRole(packet.role),
    iat: now,
    exp: now + 60 * 60 * 24
  };
  const encoded = base64Url(JSON.stringify(payload));
  const signature = crypto.createHmac('sha256', process.env.AUTH_SECRET).update(encoded).digest('base64url');
  return `${encoded}.${signature}`;
}

function verifyToken(token) {
  if (!process.env.AUTH_SECRET) {
    if (!demoAuthEnabled()) return { ok: false, error: 'Production auth is not configured.' };
    return token === process.env.AUTH_DEMO_TOKEN
      ? { ok: true, mode: 'demo-fallback', payload: { slug: 'memorial', role: 'owner', email: '', exp: null } }
      : { ok: false, error: 'Demo token did not match.' };
  }

  const [encoded, signature] = String(token || '').split('.');
  if (!encoded || !signature) return { ok: false, error: 'Auth token is incomplete.' };
  const expected = crypto.createHmac('sha256', process.env.AUTH_SECRET).update(encoded).digest('base64url');
  const expectedBuffer = Buffer.from(expected);
  const signatureBuffer = Buffer.from(signature);
  if (expectedBuffer.length !== signatureBuffer.length || !crypto.timingSafeEqual(expectedBuffer, signatureBuffer)) {
    return { ok: false, error: 'Auth token signature did not match.' };
  }

  let payload;
  try {
    payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'));
  } catch {
    return { ok: false, error: 'Auth token payload is invalid.' };
  }

  if (payload.typ !== 'kindred-admin-session') return { ok: false, error: 'Auth token type is invalid.' };
  if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return { ok: false, error: 'Auth token has expired.' };
  return { ok: true, mode: 'signed-session', payload };
}

function signInLink(packet) {
  if (!process.env.AUTH_SECRET && !demoAuthEnabled()) return '';
  const base = (packet.returnUrl || process.env.APP_URL || 'https://kindred.page').replace(/\/$/, '');
  const token = issueToken(packet);
  return `${base}/builder?auth=${encodeURIComponent(token)}&slug=${encodeURIComponent(packet.slug || 'memorial')}`;
}

async function persistSession(payload, token) {
  const supabaseUrl = process.env.SUPABASE_URL || '';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!supabaseUrl || !serviceKey || !payload?.slug) return null;

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const sessionRow = {
    slug: payload.slug,
    email: payload.email || null,
    name: payload.name || null,
    role: payload.role || 'helper',
    token_hash: tokenHash,
    expires_at: payload.exp ? new Date(payload.exp * 1000).toISOString() : null,
    verified_at: new Date().toISOString()
  };

  const response = await fetch(`${supabaseUrl.replace(/\/$/, '')}/rest/v1/auth_sessions`, {
    method: 'POST',
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation'
    },
    body: JSON.stringify(sessionRow)
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Auth session persistence failed: ${detail}`);
  }

  return response.json();
}

async function postWebhook(packet, link) {
  if (!process.env.AUTH_WEBHOOK_URL) return null;

  const response = await fetch(process.env.AUTH_WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(process.env.AUTH_WEBHOOK_SECRET ? { Authorization: `Bearer ${process.env.AUTH_WEBHOOK_SECRET}` } : {})
    },
    body: JSON.stringify({ ...packet, signInLink: link })
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Auth webhook failed: ${detail}`);
  }

  return { provider: 'webhook' };
}

async function sendWithResend(packet, link) {
  if (!process.env.RESEND_API_KEY || !process.env.AUTH_FROM_EMAIL) return null;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: process.env.AUTH_FROM_EMAIL,
      to: packet.email,
      reply_to: packet.supportEmail || process.env.SUPPORT_EMAIL || undefined,
      subject: `Your Kindred Pages sign-in link for ${packet.memorialName || packet.slug || 'a memorial'}`,
      text: [
        `Hi ${packet.name || 'there'},`,
        '',
        'Use this private link to continue editing the Kindred Pages memorial:',
        link,
        '',
        `Role: ${packet.role || 'Family admin'}`,
        'If you did not request this link, you can ignore this email.'
      ].join('\n')
    })
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Auth email failed: ${detail}`);
  }

  return { provider: 'resend' };
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

  if (packet.action === 'verify-token') {
    const verified = verifyToken(packet.token);
    if (!verified.ok) {
      return sendJson(res, 403, {
        status: 'denied',
        reason: verified.error
      });
    }

    try {
      const saved = verified.mode === 'signed-session' ? await persistSession(verified.payload, packet.token) : null;
      return sendJson(res, saved ? 200 : 202, {
        status: 'session-active',
        mode: verified.mode,
        slug: verified.payload.slug,
        email: verified.payload.email,
        role: verified.payload.role,
        expiresAt: verified.payload.exp ? new Date(verified.payload.exp * 1000).toISOString() : null,
        persisted: Boolean(saved),
        message: saved || verified.mode === 'demo-fallback'
          ? undefined
          : 'Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to persist verified admin sessions.'
      });
    } catch (error) {
      return sendJson(res, 502, {
        error: 'Auth session persistence failed',
        detail: error.message
      });
    }
  }

  if (!packet.email || !packet.slug) {
    return sendJson(res, 422, {
      error: 'Auth packet is not ready',
      missing: ['email', 'slug'].filter((key) => !packet[key])
    });
  }

  const link = signInLink(packet);
  if (!configured()) {
    return sendJson(res, 202, {
      status: 'configuration-needed',
      message: 'Set AUTH_SECRET plus AUTH_WEBHOOK_URL or RESEND_API_KEY and AUTH_FROM_EMAIL to send admin sign-in links.',
      signInPacket: {
        email: packet.email,
        role: packet.role || 'Family admin',
        slug: packet.slug,
        ...(link ? { signInLink: link } : {})
      }
    });
  }

  try {
    const delivered = await postWebhook(packet, link) || await sendWithResend(packet, link);
    return sendJson(res, 200, {
      status: 'sent',
      provider: delivered.provider,
      email: packet.email,
      slug: packet.slug
    });
  } catch (error) {
    return sendJson(res, 502, {
      error: 'Auth integration failed',
      detail: error.message
    });
  }
};
