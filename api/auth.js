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

function signInLink(packet) {
  const base = (packet.returnUrl || process.env.APP_URL || 'https://kindred.page').replace(/\/$/, '');
  const token = process.env.AUTH_DEMO_TOKEN || 'demo-admin-session';
  return `${base}/builder?auth=${encodeURIComponent(token)}&slug=${encodeURIComponent(packet.slug || 'memorial')}`;
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
    const expected = process.env.AUTH_DEMO_TOKEN || 'demo-admin-session';
    const granted = Boolean(packet.token && packet.token === expected);
    return sendJson(res, granted ? 200 : 403, {
      status: granted ? 'session-active' : 'denied',
      mode: process.env.AUTH_SECRET ? 'configured' : 'demo-fallback'
    });
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
        signInLink: link
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
