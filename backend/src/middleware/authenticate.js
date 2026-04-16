const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');
const { config } = require('../config/environment');

/**
 * Authentication middleware — supports two token delivery methods:
 *
 *  1. **httpOnly cookie** (`config.authCookie.name`)
 *     Primary method used by the browser frontend. The cookie is set by
 *     the login/register endpoints and sent automatically with every
 *     same-origin request (`withCredentials: true`).
 *
 *  2. **Authorization: Bearer <token>** header
 *     Used by automated tests, API clients, and non-browser consumers
 *     that cannot rely on cookies.
 *
 * Cookie is checked first; if absent the Bearer header is used as
 * fallback. Both paths resolve to the same JWT so behaviour is
 * identical regardless of delivery method.
 */
const authenticate = async (req, res, next) => {
  try {
    const cookieToken = req.cookies?.[config.authCookie.name];
    const bearerToken = req.headers.authorization?.split(' ')[1];
    const token = cookieToken || bearerToken;

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
