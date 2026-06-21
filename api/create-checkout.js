import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { userId, email } = req.body;
  if (!userId) return res.status(400).json({ error: 'Missing userId' });

  const origin = req.headers.origin || 'https://dating-gothenburg.vercel.app';

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    customer_email: email,
    line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
    success_url: `${origin}/premium-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/`,
    metadata: { userId },
  });

  res.json({ url: session.url });
}
