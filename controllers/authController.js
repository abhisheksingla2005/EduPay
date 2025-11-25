const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { generateToken } = require('../utils/token');

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
  const exists = await User.findOne({ email });
  if (exists) {
    return res.status(400).render('auth/register', { title: 'Register', error: 'Email already in use' });
  }
  const user = await User.create({ name, email, password, role });
  const token = generateToken({ id: user._id, role: user.role });
  const isSecure = process.env.NODE_ENV === 'production' || process.env.SSL_KEY_PATH;
  res.cookie('token', token, { 
    httpOnly: true, 
    secure: isSecure,
    sameSite: 'strict', 
    maxAge: 24 * 60 * 60 * 1000 
  }); // 24 hours
  
  // Redirect to appropriate dashboard based on role
  if (role === 'student') return res.redirect('/student/dashboard');
  if (role === 'donor') return res.redirect('/donor/dashboard');
  if (role === 'admin') return res.redirect('/admin/dashboard');
  res.redirect('/');
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).render('auth/login', { title: 'Login', error: 'Invalid credentials' });
  }
  const ok = await user.comparePassword(password);
  if (!ok) {
    return res.status(400).render('auth/login', { title: 'Login', error: 'Invalid credentials' });
  }
  const token = generateToken({ id: user._id, role: user.role });
  const isSecure = process.env.NODE_ENV === 'production' || process.env.SSL_KEY_PATH;
  res.cookie('token', token, { 
    httpOnly: true, 
    secure: isSecure,
    sameSite: 'strict', 
    maxAge: 24 * 60 * 60 * 1000 
  }); // 24 hours
  
  // Redirect to appropriate dashboard based on role
  if (user.role === 'student') return res.redirect('/student/dashboard');
  if (user.role === 'donor') return res.redirect('/donor/dashboard');
  if (user.role === 'admin') return res.redirect('/admin/dashboard');
  res.redirect('/');
});

exports.logout = (req, res) => {
  res.clearCookie('token');
  res.redirect('/auth/login');
};
