const router = require('express').Router();
const { requireAuth, requireRole, ROLES } = require('../middleware/auth');
const { getDashboard, getCacheView } = require('../controllers/adminController');

router.use(requireAuth, requireRole(ROLES.ADMIN));
router.get('/dashboard', getDashboard);
router.get('/cache', getCacheView);

module.exports = router;
