function sendJson(res, status, body) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.status(status).send(JSON.stringify(body, null, 2));
}

function configured() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function supabaseUrl() {
  return process.env.SUPABASE_URL.replace(/\/$/, '');
}

function supabaseHeaders(prefer) {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(prefer ? { Prefer: prefer } : {})
  };
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

async function memorialForSlug(slug) {
  if (!configured()) return null;

  const response = await fetch(`${supabaseUrl()}/rest/v1/memorials?slug=eq.${encodeURIComponent(slug)}&select=id,name&limit=1`, {
    headers: supabaseHeaders()
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Invite memorial lookup failed: ${detail}`);
  }
  const [row] = await response.json();
  return row || null;
}

async function persistInviteRows(memorial, packet, delivery) {
  if (!configured() || !memorial) return null;

  const sentAt = delivery ? new Date().toISOString() : null;
  const rows = (packet.recipients || []).map((recipient) => {
    const emailResult = delivery?.results?.find((result) => result.email === recipient.email);
    const isPhoneOnly = recipient.phone && !recipient.email;
    const failed = delivery?.failures?.find((failure) => failure.email === recipient.email);
    return {
      memorial_id: memorial.id,
      name: recipient.name || 'Guest',
      email: recipient.email || null,
      phone: recipient.phone || null,
      guest_group: recipient.group || null,
      delivery_provider: emailResult?.provider || delivery?.provider || (isPhoneOnly ? 'manual-phone' : null),
      delivery_status: failed ? 'Failed' : emailResult ? 'Queued' : isPhoneOnly ? 'Manual phone follow-up' : delivery ? 'Queued' : 'Prepared',
      provider_message_id: emailResult?.id || null,
      private_invite_url: packet.privateInviteUrl || packet.shareUrl || null,
      sent_at: emailResult || delivery?.provider === 'webhook' ? sentAt : null,
      failed_at: failed ? sentAt : null,
      failure_reason: failed?.error || null
    };
  });

  const response = await fetch(`${supabaseUrl()}/rest/v1/guest_invites`, {
    method: 'POST',
    headers: supabaseHeaders('return=representation'),
    body: JSON.stringify(rows)
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Invite ledger insert failed: ${detail}`);
  }

  return response.json();
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

  return { provider: 'webhook', count: packet.recipients.length, results: packet.recipients.map((recipient) => ({ email: recipient.email || '', provider: 'webhook', id: null })) };
}

async function sendWithResend(packet) {
  const apiKey = process.env.RESEND_API_KEY || '';
  const from = process.env.INVITE_FROM_EMAIL || process.env.SUPPORT_EMAIL || '';
  const replyTo = packet.replyTo || process.env.SUPPORT_EMAIL || '';
  const recipients = emailRecipients(packet);
  if (!apiKey || !from || !recipients.length) return null;

  const results = [];
  const failures = [];
  for (const recipient of recipients) {
    try {
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
        failures.push({ email: recipient.email, error: detail });
        continue;
      }

      const sent = await response.json();
      results.push({ email: recipient.email, provider: 'resend', id: sent.id || null });
    } catch (error) {
      failures.push({ email: recipient.email, error: error.message });
    }
  }

  if (!results.length && failures.length) {
    throw new Error(`Resend invite failed: ${failures[0].error}`);
  }

  return { provider: 'resend', count: results.length, failures, results };
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
    const memorial = await memorialForSlug(packet.slug);
    if (configured() && !memorial) return sendJson(res, 404, { status: 'memorial-not-found', slug: packet.slug });
    const delivered = await postWebhook(packet) || await sendWithResend(packet);
    const inviteLedger = await persistInviteRows(memorial, packet, delivered);
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
      provider: delivered?.provider || null,
      deliveryCount: delivered?.count || 0,
      failedRecipients: delivered?.failures?.length || 0,
      inviteLedger: inviteLedger ? {
        status: 'recorded',
        count: inviteLedger.length
      } : {
        status: 'not-configured',
        message: 'Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to persist guest invite delivery status.'
      }
    });
  } catch (error) {
    return sendJson(res, 502, {
      error: 'Invite integration failed',
      detail: error.message
    });
  }
};
