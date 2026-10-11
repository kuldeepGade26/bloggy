const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'adorable_bloggy_super_secret_jwt_key_2025';

// Verify token from either HttpOnly cookie or Authorization Bearer header
const verifyToken = (req, res, next) => {
  let token = null;

  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please log in.'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, username, email, role }
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Session expired or invalid token. Please log in again.'
    });
  }
};

// Middleware requiring 'admin' role
const requireAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      res.status(403).json({
        success: false,
        message: 'Forbidden. Admin privileges required to access this resource.'
      });
    }
  });
};

module.exports = {
  verifyToken,
  requireAdmin,
  JWT_SECRET
};
