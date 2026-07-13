const { configured, memorialForSlug, notifyFamily, patchSupportNeed, readBody, sendJson } = require('./guest-actions');

function validate(packet) {
  return ['slug', 'name', 'needTitle'].filter((key) => !packet[key]);
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
      error: 'Support claim packet is not ready',
      missing
    });
  }

  if (!configured()) {
    return sendJson(res, 202, {
      status: 'configuration-needed',
      message: 'Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to save support claims server-side.',
      supportClaimPacket: packet
    });
  }

  try {
    const memorial = await memorialForSlug(packet.slug);
    if (!memorial) return sendJson(res, 404, { status: 'memorial-not-found', slug: packet.slug });

    const saved = await patchSupportNeed(memorial.id, packet.needTitle, {
      claimed_by: packet.name,
      status: 'Claimed'
    });

    await notifyFamily({
      to: memorial.contact_email,
      subject: `Support claimed for ${memorial.name}`,
      text: `${packet.name} claimed: ${packet.needTitle}\n${packet.detail || ''}`
    });

    return sendJson(res, saved?.length ? 200 : 404, {
      status: saved?.length ? 'saved' : 'support-need-not-found',
      needTitle: packet.needTitle
    });
  } catch (error) {
    return sendJson(res, 502, {
      error: 'Support claim integration failed',
      detail: error.message
    });
  }
};
