const jwt = require('jsonwebtoken');
const db = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'nirvana_sih26002_jwt_super_secret_key';

async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Authorization token required' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await db('users').where({ id: decoded.userId }).first();
    if (!user) {
      return res.status(401).json({ success: false, error: 'User associated with token not found' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, error: 'Invalid or expired token', details: error.message });
  }
}

// Helper to generate token
function generateToken(userId, role) {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '7d' });
}

module.exports = {
  authenticate,
  generateToken,
  JWT_SECRET
};
