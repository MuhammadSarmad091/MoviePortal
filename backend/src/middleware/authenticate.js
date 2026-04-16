const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');
const { config } = require('../config/environment');

/**
 * Authentication middleware — httpOnly cookie only.
 *
 * The JWT is read exclusively from the httpOnly cookie set by the
 * login / register endpoints.  The browser sends it automatically
 * with every same-origin request (`withCredentials: true`).
 *
 * No Authorization header or Bearer token is accepted.
 */
const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies?.[config.authCookie.name];

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Authentication error', error: error.message });
  }
};

module.exports = { authenticate };
