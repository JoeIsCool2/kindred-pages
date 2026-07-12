function present(key) {
  return Boolean(process.env[key]);
}

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).send(JSON.stringify({
    app: 'Kindred Pages',
    status: 'ok',
    integrations: {
      checkout: present('STRIPE_CHECKOUT_URL') || present('STRIPE_PAYMENT_LINK_BASE_URL'),
      publishDatabase: present('SUPABASE_URL') && present('SUPABASE_SERVICE_ROLE_KEY'),
      inviteDelivery: present('INVITE_WEBHOOK_URL') || (present('RESEND_API_KEY') && present('INVITE_FROM_EMAIL')),
      supportEmail: present('VITE_SUPPORT_EMAIL') || present('SUPPORT_EMAIL')
    }
  }, null, 2));
};
