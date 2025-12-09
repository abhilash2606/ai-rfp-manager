const jwt = require('jsonwebtoken');
const config = require('../config');

const auth = (req, res, next) => {
  // Get token from header
  const token = req.header('x-auth-token');

  console.log('Auth Middleware - Headers:', req.headers);
  console.log('Auth Middleware - Token:', token ? 'Token present' : 'No token');

  // Check if no token
  if (!token) {
    console.log('No token provided');
    return res.status(401).json({ 
      success: false,
      message: 'No token, authorization denied' 
    });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = decoded.user;
    console.log('User authenticated:', req.user);
    next();
  } catch (err) {
    console.error('Token verification failed:', err.message);
    res.status(401).json({ 
      success: false,
      message: 'Token is not valid' 
    });
  }
};

/**
 * Role-based access control middleware
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `User role ${req.user.role} is not authorized to access this route`
            });
        }
        next();
    };
};

module.exports = {
    auth,
    authorize
};
