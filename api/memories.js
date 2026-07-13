const { configured, insertRow, memorialForSlug, notifyFamily, readBody, sendJson } = require('./guest-actions');

function validate(packet) {
  const missing = ['slug', 'from', 'text'].filter((key) => !packet[key]);
  if (packet.consent === false) missing.push('consent');
  return missing;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return sendJson(res, 405, { error: 'Method not allowed' });
  }

  let packet;
  try {
    packet = await readBody(req, 2_000_000);
  } catch {
    return sendJson(res, 400, { error: 'Invalid JSON body' });
  }

  const missing = validate(packet);
  if (missing.length) {
    return sendJson(res, 422, {
      error: 'Memory packet is not ready',
      missing
    });
  }

  if (!configured()) {
    return sendJson(res, 202, {
      status: 'configuration-needed',
      message: 'Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to save guest memories server-side.',
      memoryPacket: packet
    });
  }

  try {
    const memorial = await memorialForSlug(packet.slug);
    if (!memorial) return sendJson(res, 404, { status: 'memorial-not-found', slug: packet.slug });

    const [saved] = await insertRow('memories', {
      memorial_id: memorial.id,
      from_name: packet.from,
      relation: packet.relation || null,
      body: packet.text,
      photo_url: packet.photoUrl || null,
      caption: packet.caption || null,
      audio_url: packet.audioUrl || null,
      audio_label: packet.audioLabel || null,
      review_consent: packet.consent !== false,
      status: 'Pending'
    });

    await notifyFamily({
      to: memorial.contact_email,
      subject: `New memory for ${memorial.name}`,
      text: `${packet.from} submitted a memory for family review:\n\n${packet.text}`
    });

    return sendJson(res, 200, { status: 'saved', id: saved?.id, moderation: 'Pending' });
  } catch (error) {
    return sendJson(res, 502, {
      error: 'Memory integration failed',
      detail: error.message
    });
  }
};
