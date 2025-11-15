const router = require('express').Router();
const { requireAuth, requireRole, ROLES } = require('../middleware/auth');
const { getDashboard } = require('../controllers/adminController');

router.use(requireAuth, requireRole(ROLES.ADMIN));
router.get('/dashboard', getDashboard);

module.exports = router;
