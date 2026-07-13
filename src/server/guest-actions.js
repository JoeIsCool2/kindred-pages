function sendJson(res, status, body) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.status(status).send(JSON.stringify(body, null, 2));
}

function readBody(req, limit = 1_000_000) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') return JSON.parse(req.body || '{}');

  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > limit) {
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

function supabaseUrl() {
  return process.env.SUPABASE_URL.replace(/\/$/, '');
}

function headers(prefer) {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(prefer ? { Prefer: prefer } : {})
  };
}

async function memorialForSlug(slug) {
  const response = await fetch(`${supabaseUrl()}/rest/v1/memorials?slug=eq.${encodeURIComponent(slug)}&select=id,name,contact_email&limit=1`, {
    headers: headers()
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Memorial lookup failed: ${detail}`);
  }

  const [row] = await response.json();
  return row || null;
}

async function insertRow(table, row) {
  const response = await fetch(`${supabaseUrl()}/rest/v1/${table}`, {
    method: 'POST',
    headers: headers('return=representation'),
    body: JSON.stringify(row)
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`${table} insert failed: ${detail}`);
  }

  return response.json();
}

async function patchRows(table, filters, row) {
  const query = Object.entries(filters)
    .map(([key, value]) => `${encodeURIComponent(key)}=eq.${encodeURIComponent(value)}`)
    .join('&');
  const response = await fetch(`${supabaseUrl()}/rest/v1/${table}?${query}`, {
    method: 'PATCH',
    headers: headers('return=representation'),
    body: JSON.stringify(row)
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`${table} update failed: ${detail}`);
  }

  return response.json();
}

async function patchSupportNeed(memorialId, title, row) {
  const response = await fetch(`${supabaseUrl()}/rest/v1/support_needs?memorial_id=eq.${encodeURIComponent(memorialId)}&title=eq.${encodeURIComponent(title)}`, {
    method: 'PATCH',
    headers: headers('return=representation'),
    body: JSON.stringify(row)
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Support claim update failed: ${detail}`);
  }

  return response.json();
}

async function notifyFamily({ to, subject, text }) {
  const apiKey = process.env.RESEND_API_KEY || '';
  const from = process.env.GUEST_NOTIFICATION_FROM_EMAIL || process.env.INVITE_FROM_EMAIL || process.env.SUPPORT_EMAIL || '';
  if (!apiKey || !from || !to) return null;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ from, to, subject, text })
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Family notification failed: ${detail}`);
  }

  return response.json();
}

module.exports = {
  configured,
  insertRow,
  memorialForSlug,
  notifyFamily,
  patchRows,
  patchSupportNeed,
  readBody,
  sendJson
};
