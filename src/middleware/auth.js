const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dispatcher-dev-secret';

/**
 * Middleware to authenticate requests using JWT
 */
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization header missing or invalid format (Bearer token required)' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired' });
    }
    return res.status(401).json({ message: 'Invalid or malformed token' });
  }
};

/**
 * Middleware to restrict route to specific roles
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ message: 'Access forbidden: No role assigned' });
    }
    const userRole = req.user.role;
    const allowed = roles.includes(userRole);
    if (!allowed) {
      return res.status(403).json({ message: `Access forbidden: Required role [${roles.join(', ')}], got [${userRole}]` });
    }
    next();
  };
};

module.exports = {
  authenticate,
  requireRole,
  JWT_SECRET,
};
