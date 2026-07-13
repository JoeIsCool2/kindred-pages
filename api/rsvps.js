const { configured, insertRow, memorialForSlug, notifyFamily, readBody, sendJson } = require('./guest-actions');

function validate(packet) {
  return ['slug', 'name', 'attending'].filter((key) => !packet[key]);
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
      error: 'RSVP packet is not ready',
      missing
    });
  }

  if (!configured()) {
    return sendJson(res, 202, {
      status: 'configuration-needed',
      message: 'Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to save RSVPs server-side.',
      rsvpPacket: packet
    });
  }

  try {
    const memorial = await memorialForSlug(packet.slug);
    if (!memorial) return sendJson(res, 404, { status: 'memorial-not-found', slug: packet.slug });

    const [saved] = await insertRow('rsvps', {
      memorial_id: memorial.id,
      name: packet.name,
      email: packet.email || null,
      phone: packet.phone || null,
      guest_group: packet.group || 'Public RSVP',
      attending: packet.attending,
      party_size: packet.partySize || '1',
      needs: packet.needs || null,
      note: packet.note || null
    });

    await notifyFamily({
      to: memorial.contact_email,
      subject: `New RSVP for ${memorial.name}`,
      text: `${packet.name} responded: ${packet.attending}\nParty size: ${packet.partySize || '1'}\nNeeds: ${packet.needs || 'None'}\nNote: ${packet.note || 'None'}`
    });

    return sendJson(res, 200, { status: 'saved', id: saved?.id });
  } catch (error) {
    return sendJson(res, 502, {
      error: 'RSVP integration failed',
      detail: error.message
    });
  }
};
