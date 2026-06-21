import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export const config = { api: { bodyParser: false } };

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const rawBody = await getRawBody(req);
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).json({ error: `Webhook error: ${err.message}` });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.metadata?.userId;
    if (userId) {
      const premiumUntil = new Date();
      premiumUntil.setMonth(premiumUntil.getMonth() + 1);
      await supabase.from('profiles').update({
        is_premium: true,
        premium_until: premiumUntil.toISOString(),
      }).eq('id', userId);
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object;
    // Find user by customer id and remove premium
    const sessions = await stripe.checkout.sessions.list({ limit: 10 });
    const match = sessions.data.find(s => s.customer === sub.customer);
    const userId = match?.metadata?.userId;
    if (userId) {
      await supabase.from('profiles').update({ is_premium: false, premium_until: null }).eq('id', userId);
    }
  }

  res.json({ received: true });
}
