function present(key) {
  return Boolean(process.env[key]);
}

function state(configured, connected, launchBlocking = true, detail = '') {
  return {
    configured,
    connected,
    launchBlocking: launchBlocking && !(configured && connected),
    ...(detail ? { detail } : {})
  };
}

function timeoutSignal(ms = 3500) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);
  return {
    signal: controller.signal,
    clear: () => clearTimeout(timeout)
  };
}

async function probe(url, options = {}) {
  const timer = timeoutSignal();
  try {
    const response = await fetch(url, {
      ...options,
      signal: timer.signal
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      return {
        ok: false,
        detail: `${response.status} ${response.statusText}${detail ? `: ${detail.slice(0, 180)}` : ''}`
      };
    }
    return { ok: true };
  } catch (error) {
    return { ok: false, detail: error.name === 'AbortError' ? 'Timed out' : error.message };
  } finally {
    timer.clear();
  }
}

async function checkSupabaseTable(table) {
  if (!present('SUPABASE_URL') || !present('SUPABASE_SERVICE_ROLE_KEY')) {
    return { configured: false, connected: false, detail: 'Missing Supabase credentials' };
  }

  const supabaseUrl = process.env.SUPABASE_URL.replace(/\/$/, '');
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const result = await probe(`${supabaseUrl}/rest/v1/${table}?select=id&limit=1`, {
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`
    }
  });
  return {
    configured: true,
    connected: result.ok,
    detail: result.ok ? `${table} reachable` : result.detail
  };
}

async function checkMediaBucket() {
  const configured = present('SUPABASE_URL') && present('SUPABASE_SERVICE_ROLE_KEY') && present('MEDIA_BUCKET');
  if (!configured) return { configured: false, connected: false, detail: 'Missing media storage credentials' };

  const supabaseUrl = process.env.SUPABASE_URL.replace(/\/$/, '');
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.MEDIA_BUCKET;
  const result = await probe(`${supabaseUrl}/storage/v1/bucket/${encodeURIComponent(bucket)}`, {
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`
    }
  });
  return {
    configured: true,
    connected: result.ok,
    detail: result.ok ? `${bucket} bucket reachable` : result.detail
  };
}

async function checkStripe() {
  const priceIds = [
    process.env.STRIPE_FAMILY_PAGE_PRICE_ID,
    process.env.STRIPE_LEGACY_ARCHIVE_PRICE_ID,
    process.env.STRIPE_FUNERAL_HOME_PRICE_ID
  ].filter(Boolean);
  const configured = present('STRIPE_SECRET_KEY') && present('STRIPE_WEBHOOK_SECRET') && priceIds.length === 3;
  if (!configured) return { configured: false, connected: false, detail: 'Missing Stripe secret, webhook secret, or plan price IDs' };

  const results = await Promise.all(priceIds.map((priceId) => probe(`https://api.stripe.com/v1/prices/${encodeURIComponent(priceId)}`, {
    headers: {
      Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`
    }
  })));
  const failed = results.find((result) => !result.ok);
  return {
    configured: true,
    connected: !failed,
    detail: failed ? failed.detail : 'All plan prices reachable'
  };
}

async function checkResend(requiredFromKeys) {
  const hasFrom = requiredFromKeys.some((key) => present(key));
  const configured = present('RESEND_API_KEY') && hasFrom;
  if (!configured) return { configured: false, connected: false, detail: 'Missing Resend key or sender email' };

  const result = await probe('https://api.resend.com/domains', {
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`
    }
  });
  return {
    configured: true,
    connected: result.ok,
    detail: result.ok ? 'Resend API reachable' : result.detail
  };
}

async function checkWebhook(urlKey, secretKey) {
  if (!present(urlKey)) return { configured: false, connected: false, detail: `Missing ${urlKey}` };

  try {
    const url = new URL(process.env[urlKey]);
    return {
      configured: true,
      connected: url.protocol === 'https:',
      detail: url.protocol === 'https:' ? `${urlKey} is HTTPS` : `${urlKey} must use HTTPS`
    };
  } catch {
    return { configured: true, connected: false, detail: `${urlKey} is not a valid URL` };
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.status(405).send(JSON.stringify({ error: 'Method not allowed' }, null, 2));
  }

  const supabaseConfigured = present('SUPABASE_URL') && present('SUPABASE_SERVICE_ROLE_KEY');
  const resendConfigured = present('RESEND_API_KEY') && (present('INVITE_FROM_EMAIL') || present('GUEST_NOTIFICATION_FROM_EMAIL'));
  const inviteDeliveryConfigured = present('INVITE_WEBHOOK_URL') || (present('RESEND_API_KEY') && present('INVITE_FROM_EMAIL'));
  const adminAuthConfigured = present('AUTH_SECRET') && (present('AUTH_WEBHOOK_URL') || (present('RESEND_API_KEY') && present('AUTH_FROM_EMAIL')));

  const [
    memorials,
    activityLog,
    memories,
    rsvps,
    supportNeeds,
    authSessions,
    mediaBucket,
    checkout,
    guestNotifications,
    inviteWebhook,
    inviteResend,
    authWebhook,
    authResend
  ] = await Promise.all([
    checkSupabaseTable('memorials'),
    checkSupabaseTable('activity_log'),
    checkSupabaseTable('memories'),
    checkSupabaseTable('rsvps'),
    checkSupabaseTable('support_needs'),
    checkSupabaseTable('auth_sessions'),
    checkMediaBucket(),
    checkStripe(),
    checkResend(['GUEST_NOTIFICATION_FROM_EMAIL', 'INVITE_FROM_EMAIL']),
    checkWebhook('INVITE_WEBHOOK_URL', 'INVITE_WEBHOOK_SECRET'),
    checkResend(['INVITE_FROM_EMAIL']),
    checkWebhook('AUTH_WEBHOOK_URL', 'AUTH_WEBHOOK_SECRET'),
    checkResend(['AUTH_FROM_EMAIL'])
  ]);

  const inviteDelivery = inviteWebhook.connected ? inviteWebhook : inviteResend;
  const adminAuth = authWebhook.connected ? authWebhook : authResend;
  const adminAuthConnected = adminAuthConfigured && adminAuth.connected && authSessions.connected;
  const guestActionsConnected = memories.connected && rsvps.connected && supportNeeds.connected;
  const launchReady = Boolean(
    memorials.connected &&
    activityLog.connected &&
    guestActionsConnected &&
    mediaBucket.connected &&
    checkout.connected &&
    guestNotifications.connected &&
    inviteDelivery.connected &&
    adminAuthConnected
  );

  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).send(JSON.stringify({
    app: 'Kindred Pages',
    status: 'ok',
    launchReady,
    integrations: {
      adminAuth: state(adminAuthConfigured, adminAuthConnected, true, adminAuthConnected ? 'Auth delivery and session persistence reachable' : adminAuthConfigured ? `${adminAuth.detail}; ${authSessions.detail}` : 'Missing auth secret or delivery provider'),
      auditLogging: state(supabaseConfigured, activityLog.connected, true, activityLog.detail),
      draftPersistence: state(supabaseConfigured, memorials.connected, true, memorials.detail),
      guestActions: state(supabaseConfigured, guestActionsConnected, true, guestActionsConnected ? 'Guest action tables reachable' : 'One or more guest action tables are unreachable'),
      guestNotifications: state(resendConfigured, guestNotifications.connected, true, guestNotifications.detail),
      checkout: state(checkout.configured, checkout.connected, true, checkout.detail),
      publishDatabase: state(supabaseConfigured, memorials.connected, true, memorials.detail),
      accessControl: state(supabaseConfigured, memorials.connected, true, memorials.detail),
      mediaStorage: state(mediaBucket.configured, mediaBucket.connected, true, mediaBucket.detail),
      inviteDelivery: state(inviteDeliveryConfigured, inviteDelivery.connected, true, inviteDelivery.detail),
      supportEmail: state(present('VITE_SUPPORT_EMAIL') || present('SUPPORT_EMAIL'), present('VITE_SUPPORT_EMAIL') || present('SUPPORT_EMAIL'), false)
    }
  }, null, 2));
};
