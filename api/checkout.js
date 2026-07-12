function sendJson(res, status, body) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.status(status).send(JSON.stringify(body, null, 2));
}

function checkoutTarget(query) {
  const base = process.env.STRIPE_CHECKOUT_URL || process.env.STRIPE_PAYMENT_LINK_BASE_URL || '';
  if (!base) return '';
  const url = new URL(base);
  for (const key of ['plan', 'price', 'billing', 'slug', 'contact', 'return_url']) {
    if (query[key]) url.searchParams.set(key, query[key]);
  }
  return url.toString();
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return sendJson(res, 405, { error: 'Method not allowed' });
  }

  const { plan, slug } = req.query || {};
  if (!plan || !slug) {
    return sendJson(res, 400, {
      error: 'Missing checkout details',
      required: ['plan', 'slug']
    });
  }

  const target = checkoutTarget(req.query || {});
  if (target) {
    res.setHeader('Cache-Control', 'no-store');
    res.statusCode = 302;
    res.setHeader('Location', target);
    return res.end();
  }

  return sendJson(res, 200, {
    status: 'configuration-needed',
    message: 'Set STRIPE_CHECKOUT_URL or STRIPE_PAYMENT_LINK_BASE_URL to redirect families into hosted checkout.',
    checkoutPacket: {
      plan: req.query.plan,
      price: req.query.price || '',
      billing: req.query.billing || '',
      slug: req.query.slug,
      contact: req.query.contact || '',
      returnUrl: req.query.return_url || ''
    }
  });
};
