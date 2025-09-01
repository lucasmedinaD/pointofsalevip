const express = require('express');
const router = express.Router();
const supabase = require('../lib/supabaseClient');
const authenticate = require('../middleware/auth');

// Apply the authentication middleware to all routes in this file
router.use(authenticate);

const PLAN_LIMITS = {
  hobby: 500,
  pro: 2000,
};

/**
 * @api {get} /links List all of a user's links
 */
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('links')
    .select('*')
    .eq('user_id', req.user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return res.status(500).json({ error: 'Failed to fetch links', details: error.message });
  }
  res.json(data);
});

/**
 * @api {post} /links Add a new link
 */
router.post('/', async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    const userId = req.user.id;

    // 1. Check user's current link count
    const { count, error: countError } = await supabase
      .from('links')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (countError) throw countError;

    // 2. Check user's subscription plan
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('plan, status')
      .eq('id', userId)
      .single();

    // For this MVP, we'll allow users without a subscription to add links up to a default limit.
    // A stricter implementation might require an active subscription.
    const plan = subscription?.status === 'active' ? subscription.plan.toLowerCase() : 'hobby'; // Default to hobby
    const limit = PLAN_LIMITS[plan] || PLAN_LIMITS.hobby;

    // 3. Enforce the limit
    if (count >= limit) {
      return res.status(403).json({ error: `You have reached the limit of ${limit} links for the ${plan} plan. Please upgrade your plan to add more.` });
    }

    // 4. If limit is not reached, insert the new link
    const { data, error: insertError } = await supabase
      .from('links')
      .insert([{ url: url, user_id: userId }])
      .select()
      .single();

    if (insertError) throw insertError;

    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add link', details: error.message });
  }
});

/**
 * @api {delete} /links/:id Delete a link
 */
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase
    .from('links')
    .delete()
    .eq('id', id)
    .eq('user_id', req.user.id); // RLS also enforces this, but it's good practice to be explicit

  if (error) {
    return res.status(500).json({ error: 'Failed to delete link', details: error.message });
  }

  res.status(204).send();
});

module.exports = router;
