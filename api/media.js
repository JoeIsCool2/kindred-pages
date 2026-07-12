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
      if (raw.length > 500_000) {
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

function safePart(value, fallback = 'file') {
  return String(value || fallback)
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || fallback;
}

function validate(packet) {
  const missing = [];
  if (!packet.slug) missing.push('slug');
  if (!Array.isArray(packet.files) || !packet.files.length) missing.push('files:nonempty');
  return missing;
}

function storageConfigured() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.MEDIA_BUCKET);
}

async function createSignedUpload(path, contentType) {
  const supabaseUrl = process.env.SUPABASE_URL.replace(/\/$/, '');
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.MEDIA_BUCKET;
  const response = await fetch(`${supabaseUrl}/storage/v1/object/upload/sign/${bucket}/${path}`, {
    method: 'POST',
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      upsert: false,
      contentType
    })
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Media storage signing failed: ${detail}`);
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
      error: 'Media upload packet is not ready',
      missing
    });
  }

  const files = packet.files.map((file, index) => {
    const extension = safePart((file.name || '').split('.').pop(), 'jpg');
    const baseName = safePart((file.name || `photo-${index + 1}`).replace(/\.[^.]+$/, ''), `photo-${index + 1}`);
    const path = `${safePart(packet.slug, 'memorial')}/${Date.now()}-${index + 1}-${baseName}.${extension}`;
    return {
      ...file,
      contentType: file.type || 'image/jpeg',
      path
    };
  });

  if (!storageConfigured()) {
    return sendJson(res, 202, {
      status: 'configuration-needed',
      message: 'Set SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and MEDIA_BUCKET to create private photo upload targets.',
      slug: packet.slug,
      visibility: packet.visibility || 'private',
      files: files.map((file) => ({
        name: file.name,
        type: file.contentType,
        size: file.size || 0,
        storagePath: file.path
      }))
    });
  }

  try {
    const uploads = [];
    for (const file of files) {
      const signed = await createSignedUpload(file.path, file.contentType);
      uploads.push({
        name: file.name,
        type: file.contentType,
        size: file.size || 0,
        storagePath: file.path,
        signedUpload: signed
      });
    }

    return sendJson(res, 200, {
      status: 'ready',
      slug: packet.slug,
      bucket: process.env.MEDIA_BUCKET,
      visibility: packet.visibility || 'private',
      uploads
    });
  } catch (error) {
    return sendJson(res, 502, {
      error: 'Media storage integration failed',
      detail: error.message
    });
  }
};
