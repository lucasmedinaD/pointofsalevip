const supabase = require('../lib/supabaseClient');

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error) {
    return res.status(401).json({ error: 'Authentication failed. Invalid token.', details: error.message });
  }

  if (!user) {
    return res.status(401).json({ error: 'Authentication failed. User not found.' });
  }

  // Attach user to the request object
  req.user = user;
  next();
};

module.exports = authenticate;
