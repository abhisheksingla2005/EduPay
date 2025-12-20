const { verifyToken } = require('../utils/token');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { ROLES } = require('../utils/roles');

const attachUserIfExists = asyncHandler(async (req, res, next) => {
  const token = req.cookies.token || (req.headers.authorization && req.headers.authorization.startsWith('Bearer ') && req.headers.authorization.split(' ')[1]);
  if (!token) return next();
  const decoded = verifyToken(token);
  if (!decoded) return next();
  
  // Handle system admin (hardcoded admin account)
  if (decoded.isSystemAdmin && decoded.id === 'admin' && decoded.role === 'admin') {
    const systemAdmin = {
      _id: 'admin',
      name: 'System Administrator',
      email: process.env.ADMIN_EMAIL || 'admin@edupay.com',
      role: 'admin',
      isSystemAdmin: true
    };
    req.user = systemAdmin;
    res.locals.currentUser = systemAdmin;
    return next();
  }
  
  const user = await User.findById(decoded.id).select('-password');
  if (user) {
    req.user = user;
    res.locals.currentUser = user;
  } else {
    // Explicitly set to null so EJS templates have a defined variable
    res.locals.currentUser = null;
  }
  next();
});

const requireAuth = (req, res, next) => {
  if (!req.user) {
    if (req.accepts('html')) return res.redirect('/auth/login');
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
};

const requireRole = (role) => (req, res, next) => {
  if (!req.user || req.user.role !== role) {
    return res.status(403).render('auth/forbidden', { title: 'Forbidden' });
  }
  next();
};

module.exports = { attachUserIfExists, requireAuth, requireRole, ROLES };
