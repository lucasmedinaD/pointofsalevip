const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const { createCheckoutSession, handleWebhook } = require('../../integrations/stripe');
const supabase = require('../lib/supabaseClient');

// --- Webhook Route ---
// This route is a special case and does not use the standard JSON body parser,
// as Stripe requires the raw request body to verify the signature.
// It also doesn't need our JWT authentication.
router.post('/webhooks', express.raw({ type: 'application/json' }), async (req, res) => {
  // We pass the raw request to our Stripe handler
  const { error } = handleWebhook(req);
  if (error) {
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }
  res.json({ received: true });
});


// All other billing routes should be authenticated
router.use(authenticate);


// --- Authenticated Routes ---

/**
 * @api {post} /billing/create-checkout-session Create a Stripe Checkout Session
 * @apiName CreateCheckoutSession
 * @apiGroup Billing
 * @apiHeader {String} Authorization Bearer <SUPABASE_JWT>
 * @apiParam {String} priceId The ID of the Stripe Price to subscribe to.
 */
router.post('/create-checkout-session', async (req, res) => {
  const { priceId } = req.body;
  const userId = req.user.id;

  if (!priceId) {
    return res.status(400).json({ error: 'priceId is required' });
  }

  try {
    // Check if the user is already a Stripe customer in our database
    let { data: subscription, error: fetchError } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = 'No rows found'
      throw fetchError;
    }

    let customerId = subscription?.stripe_customer_id;

    // If the user is not a customer yet, we should create one in Stripe
    // and save the customer ID in our database.
    // For this boilerplate, we'll assume the customer exists or is created elsewhere.
    // A more robust implementation would handle customer creation here.
    if (!customerId) {
        // This is a placeholder. In a real app, you would create a Stripe customer
        // and save the ID to your 'subscriptions' table for this user.
        customerId = 'cus_placeholder';
        console.log(`Placeholder: Would create Stripe customer for user ${userId}`);
    }

    const successUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard?payment_success=true`;
    const cancelUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/pricing`;

    const session = await createCheckoutSession(customerId, priceId, successUrl, cancelUrl);

    res.json({ url: session.url });

  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Failed to create checkout session', details: error.message });
  }
});

module.exports = router;
