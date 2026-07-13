const crypto = require('node:crypto');

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

function readRawBody(req) {
  if (Buffer.isBuffer(req.body)) return Promise.resolve(req.body.toString('utf8'));
  if (typeof req.body === 'string') return Promise.resolve(req.body);
  if (req.body && typeof req.body === 'object') return Promise.resolve(JSON.stringify(req.body));

  return new Promise((resolve, reject) => {
    let raw = '';
    req.setEncoding('utf8');
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 1_000_000) {
        reject(new Error('Webhook body too large'));
        req.destroy();
      }
    });
    req.on('end', () => resolve(raw));
    req.on('error', reject);
  });
}

function timingSafeEqualHex(left, right) {
  const leftBuffer = Buffer.from(left, 'hex');
  const rightBuffer = Buffer.from(right, 'hex');
  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function verifyStripeSignature(rawBody, signatureHeader) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET || '';
  if (!secret) return { ok: false, error: 'Set STRIPE_WEBHOOK_SECRET to verify checkout webhooks.' };
  if (!signatureHeader) return { ok: false, error: 'Missing Stripe-Signature header.' };

  const parts = Object.fromEntries(signatureHeader.split(',').map((part) => {
    const [key, value] = part.split('=');
    return [key, value];
  }));
  const timestamp = parts.t;
  const signature = parts.v1;
  if (!timestamp || !signature) return { ok: false, error: 'Stripe-Signature header is incomplete.' };

  const age = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (!Number.isFinite(age) || age > 300) return { ok: false, error: 'Stripe webhook timestamp is outside tolerance.' };

  const expected = crypto
    .createHmac('sha256', secret)
    .update(`${timestamp}.${rawBody}`, 'utf8')
    .digest('hex');

  return timingSafeEqualHex(expected, signature)
    ? { ok: true }
    : { ok: false, error: 'Stripe webhook signature did not match.' };
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
    'metadata[contact]': query.contact || '',
    'metadata[return_url]': query.return_url || '',
    'metadata[price_id]': priceId
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

async function persistStripePayment(session) {
  const supabaseUrl = process.env.SUPABASE_URL || '';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const slug = session.client_reference_id || session.metadata?.slug || '';
  if (!supabaseUrl || !serviceKey || !slug) return null;

  const paid = session.payment_status === 'paid';
  const row = {
    checkout_status: paid ? 'Paid' : 'Payment pending',
    stripe_checkout_session_id: session.id || null,
    stripe_payment_status: session.payment_status || null,
    stripe_plan_price_id: session.metadata?.price_id || session.line_items?.data?.[0]?.price?.id || null,
    stripe_customer_id: typeof session.customer === 'string' ? session.customer : session.customer?.id || null,
    stripe_subscription_id: typeof session.subscription === 'string' ? session.subscription : session.subscription?.id || null,
    stripe_payment_intent_id: typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id || null,
    stripe_paid_at: paid ? new Date().toISOString() : null,
    billing_return_url: session.metadata?.return_url || null,
    publish_eligible: paid,
    updated_at: new Date().toISOString()
  };

  const response = await fetch(`${supabaseUrl.replace(/\/$/, '')}/rest/v1/memorials?slug=eq.${encodeURIComponent(slug)}`, {
    method: 'PATCH',
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation'
    },
    body: JSON.stringify(row)
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Supabase payment update failed: ${detail}`);
  }

  const saved = await response.json();
  return { slug, saved: saved.length };
}

async function handleStripeWebhook(req, res) {
  let rawBody;
  try {
    rawBody = await readRawBody(req);
  } catch (error) {
    return sendJson(res, 400, { error: error.message });
  }

  const signature = verifyStripeSignature(rawBody, req.headers['stripe-signature']);
  if (!signature.ok) return sendJson(res, 400, { error: signature.error });

  let event;
  try {
    event = JSON.parse(rawBody || '{}');
  } catch {
    return sendJson(res, 400, { error: 'Invalid Stripe webhook JSON.' });
  }

  if (event.type !== 'checkout.session.completed' && event.type !== 'checkout.session.async_payment_succeeded') {
    return sendJson(res, 200, { status: 'ignored', type: event.type || 'unknown' });
  }

  try {
    const persisted = await persistStripePayment(event.data?.object || {});
    return sendJson(res, persisted ? 200 : 202, {
      status: persisted ? 'payment-recorded' : 'configuration-needed',
      message: persisted
        ? 'Stripe payment status saved to Supabase.'
        : 'Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to persist Stripe payment status.',
      slug: persisted?.slug || event.data?.object?.client_reference_id || event.data?.object?.metadata?.slug || ''
    });
  } catch (error) {
    return sendJson(res, 502, {
      error: 'Stripe payment persistence failed',
      detail: error.message
    });
  }
}

module.exports = async function handler(req, res) {
  if (req.method === 'POST') return handleStripeWebhook(req, res);

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET, POST');
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
