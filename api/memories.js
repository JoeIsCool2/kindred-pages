const { configured, insertRow, memorialForSlug, notifyFamily, patchRows, readBody, sendJson } = require('../src/server/guest-actions');

function validate(packet) {
  const missing = ['slug', 'from', 'text'].filter((key) => !packet[key]);
  if (packet.consent === false) missing.push('consent');
  return missing;
}

function validateModeration(packet) {
  const missing = ['slug', 'id', 'decision'].filter((key) => !packet[key]);
  if (packet.decision && !['approved', 'rejected'].includes(String(packet.decision).toLowerCase())) missing.push('decision:approved-or-rejected');
  return missing;
}

module.exports = async function handler(req, res) {
  if (!['POST', 'PATCH'].includes(req.method)) {
    res.setHeader('Allow', 'POST, PATCH');
    return sendJson(res, 405, { error: 'Method not allowed' });
  }

  let packet;
  try {
    packet = await readBody(req, 2_000_000);
  } catch {
    return sendJson(res, 400, { error: 'Invalid JSON body' });
  }

  if (req.method === 'PATCH') {
    const missing = validateModeration(packet);
    if (missing.length) {
      return sendJson(res, 422, {
        error: 'Memory moderation packet is not ready',
        missing
      });
    }

    if (!configured()) {
      return sendJson(res, 202, {
        status: 'configuration-needed',
        message: 'Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to moderate guest memories server-side.',
        moderationPacket: packet
      });
    }

    try {
      const memorial = await memorialForSlug(packet.slug);
      if (!memorial) return sendJson(res, 404, { status: 'memorial-not-found', slug: packet.slug });

      const decision = String(packet.decision).toLowerCase();
      const now = new Date().toISOString();
      const update = decision === 'approved'
        ? {
          status: 'Approved',
          approved_at: now,
          rejected_at: null,
          review_note: packet.reviewNote || 'Approved by family moderator'
        }
        : {
          status: 'Rejected',
          approved_at: null,
          rejected_at: now,
          review_note: packet.reviewNote || 'Kept private by family moderator'
        };

      const saved = await patchRows('memories', {
        id: packet.id,
        memorial_id: memorial.id
      }, update);

      if (!saved.length) return sendJson(res, 404, { status: 'memory-not-found', id: packet.id });

      await insertRow('activity_log', {
        memorial_id: memorial.id,
        actor: packet.reviewer || 'Family moderator',
        action: decision === 'approved' ? 'Memory approved' : 'Memory kept private',
        detail: update.review_note
      });

      return sendJson(res, 200, {
        status: 'moderated',
        id: packet.id,
        moderation: update.status,
        reviewedAt: now,
        reviewNote: update.review_note
      });
    } catch (error) {
      return sendJson(res, 502, {
        error: 'Memory moderation failed',
        detail: error.message
      });
    }
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
