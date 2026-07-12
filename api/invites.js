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
  for (const key of ['slug', 'memorialName', 'shareUrl', 'message', 'recipients']) {
    if (packet[key] === undefined || packet[key] === null || packet[key] === '') missing.push(key);
  }
  if (!Array.isArray(packet.recipients) || !packet.recipients.length) missing.push('recipients:nonempty');
  return missing;
}

function emailRecipients(packet) {
  return (packet.recipients || []).filter((recipient) => recipient.email);
}

async function postWebhook(packet) {
  const webhookUrl = process.env.INVITE_WEBHOOK_URL || '';
  if (!webhookUrl) return null;

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(process.env.INVITE_WEBHOOK_SECRET ? { Authorization: `Bearer ${process.env.INVITE_WEBHOOK_SECRET}` } : {})
    },
    body: JSON.stringify(packet)
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Invite webhook failed: ${detail}`);
  }

  return { provider: 'webhook', count: packet.recipients.length };
}

async function sendWithResend(packet) {
  const apiKey = process.env.RESEND_API_KEY || '';
  const from = process.env.INVITE_FROM_EMAIL || process.env.SUPPORT_EMAIL || '';
  const replyTo = packet.replyTo || process.env.SUPPORT_EMAIL || '';
  const recipients = emailRecipients(packet);
  if (!apiKey || !from || !recipients.length) return null;

  const results = [];
  for (const recipient of recipients) {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from,
        to: recipient.email,
        reply_to: replyTo || undefined,
        subject: packet.subject || `Remembering ${packet.memorialName}`,
        text: [
          `Hi ${recipient.name || 'there'},`,
          '',
          packet.message,
          packet.privateInviteUrl || packet.shareUrl,
          '',
          packet.memoryRequest || '',
          '',
          'Sent with Kindred Pages'
        ].filter(Boolean).join('\n')
      })
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`Resend invite failed for ${recipient.email}: ${detail}`);
    }

    results.push(await response.json());
  }

  return { provider: 'resend', count: results.length };
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
      error: 'Invite packet is not ready to send',
      missing
    });
  }

  try {
    const delivered = await postWebhook(packet) || await sendWithResend(packet);
    const phones = (packet.recipients || []).filter((recipient) => recipient.phone && !recipient.email).length;
    return sendJson(res, delivered ? 200 : 202, {
      status: delivered ? 'queued' : 'configuration-needed',
      message: delivered
        ? `Invite batch queued through ${delivered.provider}.`
        : 'Set INVITE_WEBHOOK_URL or RESEND_API_KEY plus INVITE_FROM_EMAIL to send invite batches server-side.',
      slug: packet.slug,
      recipients: packet.recipients.length,
      emailRecipients: emailRecipients(packet).length,
      phoneOnlyRecipients: phones,
      provider: delivered?.provider || null
    });
  } catch (error) {
    return sendJson(res, 502, {
      error: 'Invite integration failed',
      detail: error.message
    });
  }
};
