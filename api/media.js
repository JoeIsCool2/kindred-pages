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

function validateManifestUpdate(packet) {
  const missing = [];
  if (!packet.slug) missing.push('slug');
  if (!packet.storagePath) missing.push('storagePath');
  return missing;
}

function storageConfigured() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.MEDIA_BUCKET);
}

function supabaseUrl() {
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

async function memorialForSlug(slug) {
  const response = await fetch(`${supabaseUrl()}/rest/v1/memorials?slug=eq.${encodeURIComponent(slug)}&select=id,slug&limit=1`, {
    headers: supabaseHeaders()
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Media memorial lookup failed: ${detail}`);
  }

  const [row] = await response.json();
  return row || null;
}

async function createSignedUpload(path, contentType) {
  const bucket = process.env.MEDIA_BUCKET;
  const response = await fetch(`${supabaseUrl()}/storage/v1/object/upload/sign/${bucket}/${path}`, {
    method: 'POST',
    headers: supabaseHeaders(),
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

async function persistPhotoManifest(memorial, packet, files) {
  const rows = files.map((file, index) => ({
    memorial_id: memorial.id,
    storage_path: file.path,
    caption: file.caption || '',
    is_cover: Boolean(file.isCover),
    is_public: packet.visibility === 'public' ? file.isPublic !== false : Boolean(file.isPublic),
    sort_order: Number.isFinite(Number(file.sortOrder)) ? Number(file.sortOrder) : index
  }));

  const response = await fetch(`${supabaseUrl()}/rest/v1/photos`, {
    method: 'POST',
    headers: supabaseHeaders('return=representation'),
    body: JSON.stringify(rows)
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Photo manifest insert failed: ${detail}`);
  }

  return response.json();
}

async function updatePhotoManifest(memorial, packet) {
  const row = {
    caption: packet.caption || '',
    is_cover: Boolean(packet.isCover),
    is_public: packet.isPublic !== false,
    ...(packet.sortOrder !== undefined ? { sort_order: Number(packet.sortOrder) || 0 } : {})
  };

  const response = await fetch(`${supabaseUrl()}/rest/v1/photos?memorial_id=eq.${encodeURIComponent(memorial.id)}&storage_path=eq.${encodeURIComponent(packet.storagePath)}`, {
    method: 'PATCH',
    headers: supabaseHeaders('return=representation'),
    body: JSON.stringify(row)
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Photo manifest update failed: ${detail}`);
  }

  return response.json();
}

module.exports = async function handler(req, res) {
  if (!['POST', 'PATCH'].includes(req.method)) {
    res.setHeader('Allow', 'POST, PATCH');
    return sendJson(res, 405, { error: 'Method not allowed' });
  }

  let packet;
  try {
    packet = await readBody(req);
  } catch {
    return sendJson(res, 400, { error: 'Invalid JSON body' });
  }

  if (req.method === 'PATCH') {
    const missing = validateManifestUpdate(packet);
    if (missing.length) {
      return sendJson(res, 422, {
        error: 'Photo manifest update is not ready',
        missing
      });
    }

    if (!storageConfigured()) {
      return sendJson(res, 202, {
        status: 'configuration-needed',
        message: 'Set SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and MEDIA_BUCKET to update private photo metadata.',
        photoPacket: packet
      });
    }

    try {
      const memorial = await memorialForSlug(packet.slug);
      if (!memorial) return sendJson(res, 404, { status: 'memorial-not-found', slug: packet.slug });
      const [saved] = await updatePhotoManifest(memorial, packet);
      if (!saved) return sendJson(res, 404, { status: 'photo-not-found', storagePath: packet.storagePath });

      return sendJson(res, 200, {
        status: 'manifest-updated',
        storagePath: packet.storagePath,
        caption: saved.caption || '',
        isCover: saved.is_cover,
        isPublic: saved.is_public,
        sortOrder: saved.sort_order
      });
    } catch (error) {
      return sendJson(res, 502, {
        error: 'Photo manifest update failed',
        detail: error.message
      });
    }
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
      caption: file.caption || '',
      isCover: Boolean(file.isCover),
      isPublic: file.isPublic !== false,
      sortOrder: file.sortOrder ?? index,
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
    const memorial = await memorialForSlug(packet.slug);
    if (!memorial) return sendJson(res, 404, { status: 'memorial-not-found', slug: packet.slug });

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
    const manifest = await persistPhotoManifest(memorial, packet, files);

    return sendJson(res, 200, {
      status: 'ready',
      slug: packet.slug,
      bucket: process.env.MEDIA_BUCKET,
      visibility: packet.visibility || 'private',
      manifest: {
        status: 'recorded',
        count: manifest.length
      },
      uploads
    });
  } catch (error) {
    return sendJson(res, 502, {
      error: 'Media storage integration failed',
      detail: error.message
    });
  }
};
