function present(key) {
  return Boolean(process.env[key]);
}

function state(configured, launchBlocking = true) {
  return {
    configured,
    connected: configured,
    launchBlocking: launchBlocking && !configured
  };
}

module.exports = async function handler(req, res) {
  const supabaseConfigured = present('SUPABASE_URL') && present('SUPABASE_SERVICE_ROLE_KEY');
  const resendConfigured = present('RESEND_API_KEY') && (present('INVITE_FROM_EMAIL') || present('GUEST_NOTIFICATION_FROM_EMAIL'));
  const inviteDeliveryConfigured = present('INVITE_WEBHOOK_URL') || (present('RESEND_API_KEY') && present('INVITE_FROM_EMAIL'));

  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).send(JSON.stringify({
    app: 'Kindred Pages',
    status: 'ok',
    launchReady: Boolean(
      supabaseConfigured &&
      (present('STRIPE_CHECKOUT_URL') || present('STRIPE_PAYMENT_LINK_BASE_URL')) &&
      inviteDeliveryConfigured &&
      resendConfigured &&
      (present('AUTH_SECRET') && (present('AUTH_WEBHOOK_URL') || (present('RESEND_API_KEY') && present('AUTH_FROM_EMAIL'))))
    ),
    integrations: {
      adminAuth: state(present('AUTH_SECRET') && (present('AUTH_WEBHOOK_URL') || (present('RESEND_API_KEY') && present('AUTH_FROM_EMAIL')))),
      auditLogging: state(supabaseConfigured),
      draftPersistence: state(supabaseConfigured),
      guestActions: state(supabaseConfigured),
      guestNotifications: state(resendConfigured),
      checkout: state(present('STRIPE_CHECKOUT_URL') || present('STRIPE_PAYMENT_LINK_BASE_URL')),
      publishDatabase: state(supabaseConfigured),
      accessControl: state(supabaseConfigured),
      mediaStorage: state(supabaseConfigured && present('MEDIA_BUCKET')),
      inviteDelivery: state(inviteDeliveryConfigured),
      supportEmail: state(present('VITE_SUPPORT_EMAIL') || present('SUPPORT_EMAIL'), false)
    }
  }, null, 2));
};
