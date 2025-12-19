const router = require('express').Router();
const { requireAuth, requireRole, ROLES } = require('../middleware/auth');
const { getDashboard, getCreateRequest, postCreateRequest, getMyRequests, postUpdateRequest, postDeleteRequest } = require('../controllers/studentController');

router.use(requireAuth, requireRole(ROLES.STUDENT));

router.get('/dashboard', getDashboard);
router.get('/create-request', getCreateRequest);
router.post('/create-request', postCreateRequest);
router.get('/my-requests', getMyRequests);
router.post('/update/:id', postUpdateRequest);
router.post('/delete/:id', postDeleteRequest);

module.exports = router;
