const router = require('express').Router();
const { requireAuth } = require('../middleware/auth');

router.get('/', (req, res) => {
  // If user is logged in, redirect to their dashboard
  if (req.user) {
    if (req.user.role === 'student') return res.redirect('/student/dashboard');
    if (req.user.role === 'donor') return res.redirect('/donor/dashboard');
    if (req.user.role === 'admin') return res.redirect('/admin/dashboard');
  }
  // If not logged in, show landing page
  res.render('auth/landing', { title: 'Welcome to EduPay' });
});

module.exports = router;
