const router = require('express').Router();
const { requireAuth, requireRole, ROLES } = require('../middleware/auth');
const { getDashboard, postDonate, getHistory } = require('../controllers/donorController');

router.use(requireAuth, requireRole(ROLES.DONOR));

router.get('/dashboard', getDashboard);
router.post('/donate', postDonate);
router.get('/history', getHistory);

module.exports = router;
