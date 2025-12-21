const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { generateToken } = require('../utils/token');

// Hardcoded admin credentials - change these in production!
const ADMIN_CREDENTIALS = {
  email: process.env.ADMIN_EMAIL || 'admin@edupay.com',
  password: process.env.ADMIN_PASSWORD || 'Admin@123',
  name: 'System Administrator'
};

// Cookie options - disable secure for self-signed certs in development
const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProduction, // Only secure in production (self-signed certs don't work with secure)
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  };
};

exports.getLoginPage = (req, res) => {
  if (req.user) return res.redirect('/');
  res.render('auth/login', { title: 'Login' });
};

exports.getRegisterPage = (req, res) => {
  if (req.user) return res.redirect('/');
  res.render('auth/register', { title: 'Register' });
};

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).render('auth/register', { title: 'Register', error: 'All fields are required' });
  }
  // Prevent admin registration through the form
  if (role === 'admin') {
    return res.status(403).render('auth/register', { title: 'Register', error: 'Admin registration is not allowed' });
  }
  const exists = await User.findOne({ email });
  if (exists) {
    return res.status(400).render('auth/register', { title: 'Register', error: 'Email already in use' });
  }
  const user = await User.create({ name, email, password, role });
  const token = generateToken({ id: user._id, role: user.role });
  res.cookie('token', token, getCookieOptions());
  
  // Redirect to appropriate dashboard based on role
  if (role === 'student') return res.redirect('/student/dashboard');
  if (role === 'donor') return res.redirect('/donor/dashboard');
  res.redirect('/');
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  
  // Check for hardcoded admin login
  if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
    const token = generateToken({ id: 'admin', role: 'admin', isSystemAdmin: true });
    res.cookie('token', token, getCookieOptions());
    return res.redirect('/admin/dashboard');
  }
  
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).render('auth/login', { title: 'Login', error: 'Invalid credentials' });
  }
  
  // Prevent database admin users from logging in (only hardcoded admin allowed)
  if (user.role === 'admin') {
    return res.status(403).render('auth/login', { title: 'Login', error: 'Invalid credentials' });
  }
  
  const ok = await user.comparePassword(password);
  if (!ok) {
    return res.status(400).render('auth/login', { title: 'Login', error: 'Invalid credentials' });
  }
  const token = generateToken({ id: user._id, role: user.role });
  res.cookie('token', token, getCookieOptions());
  
  // Redirect to appropriate dashboard based on role
  if (user.role === 'student') return res.redirect('/student/dashboard');
  if (user.role === 'donor') return res.redirect('/donor/dashboard');
  res.redirect('/');
});

exports.logout = (req, res) => {
  res.clearCookie('token');
  res.redirect('/auth/login');
};
