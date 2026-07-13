function sendJson(res, status, body) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.status(status).send(JSON.stringify(body, null, 2));
}

function stripeConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

function priceIdForPlan(plan) {
  const normalized = String(plan || '').toLowerCase();
  if (normalized.includes('legacy')) return process.env.STRIPE_LEGACY_ARCHIVE_PRICE_ID || '';
  if (normalized.includes('funeral')) return process.env.STRIPE_FUNERAL_HOME_PRICE_ID || '';
  return process.env.STRIPE_FAMILY_PAGE_PRICE_ID || '';
}

function allPriceIdsConfigured() {
  return Boolean(
    process.env.STRIPE_FAMILY_PAGE_PRICE_ID &&
    process.env.STRIPE_LEGACY_ARCHIVE_PRICE_ID &&
    process.env.STRIPE_FUNERAL_HOME_PRICE_ID
  );
}

function appendCheckoutParams(returnUrl, params) {
  const url = new URL(returnUrl || process.env.APP_URL || 'https://kindred.page');
  for (const [key, value] of Object.entries(params)) {
    if (value) url.searchParams.set(key, value);
  }
  return url.toString();
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

async function createStripeSession(query) {
  const priceId = priceIdForPlan(query.plan);
  if (!stripeConfigured() || !priceId) return null;

  const successUrl = appendCheckoutParams(query.return_url, {
    checkout: 'success',
    slug: query.slug,
    session_id: '{CHECKOUT_SESSION_ID}'
  });
  const cancelUrl = appendCheckoutParams(query.return_url, {
    checkout: 'cancelled',
    slug: query.slug
  });
  const body = new URLSearchParams({
    mode: String(query.billing || '').toLowerCase().includes('monthly') ? 'subscription' : 'payment',
    success_url: successUrl,
    cancel_url: cancelUrl,
    client_reference_id: query.slug,
    customer_email: query.contact || '',
    'line_items[0][price]': priceId,
    'line_items[0][quantity]': '1',
    'metadata[plan]': query.plan,
    'metadata[slug]': query.slug,
    'metadata[contact]': query.contact || ''
  });

  const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Stripe Checkout Session failed: ${detail}`);
  }

  return response.json();
}

async function retrieveStripeSession(sessionId) {
  if (!stripeConfigured() || !sessionId) return null;

  const response = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`, {
    headers: {
      Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`
    }
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Stripe session lookup failed: ${detail}`);
  }

  return response.json();
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return sendJson(res, 405, { error: 'Method not allowed' });
  }

  if (req.query?.action === 'status') {
    try {
      const session = await retrieveStripeSession(req.query.session_id);
      if (!session) {
        return sendJson(res, 202, {
          status: 'configuration-needed',
          message: 'Set STRIPE_SECRET_KEY to verify Checkout Session status server-side.'
        });
      }

      return sendJson(res, 200, {
        status: session.payment_status === 'paid' ? 'paid' : session.status || 'open',
        paymentStatus: session.payment_status,
        checkoutStatus: session.status,
        slug: session.client_reference_id || session.metadata?.slug || '',
        plan: session.metadata?.plan || ''
      });
    } catch (error) {
      return sendJson(res, 502, {
        error: 'Checkout status lookup failed',
        detail: error.message
      });
    }
  }

  const { plan, slug } = req.query || {};
  if (!plan || !slug) {
    return sendJson(res, 400, {
      error: 'Missing checkout details',
      required: ['plan', 'slug']
    });
  }

  try {
    const session = await createStripeSession(req.query || {});
    if (session?.url) {
      res.setHeader('Cache-Control', 'no-store');
      res.statusCode = 302;
      res.setHeader('Location', session.url);
      return res.end();
    }
  } catch (error) {
    return sendJson(res, 502, {
      error: 'Checkout integration failed',
      detail: error.message
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
    message: 'Set STRIPE_SECRET_KEY plus plan price IDs, STRIPE_CHECKOUT_URL, or STRIPE_PAYMENT_LINK_BASE_URL to redirect families into hosted checkout.',
    checkoutPacket: {
      plan: req.query.plan,
      price: req.query.price || '',
      billing: req.query.billing || '',
      slug: req.query.slug,
      contact: req.query.contact || '',
      priceIdNeeded: !priceIdForPlan(req.query.plan),
      stripeSessionReady: stripeConfigured() && allPriceIdsConfigured(),
      returnUrl: req.query.return_url || ''
    }
  });
};
