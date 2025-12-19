const router = require('express').Router();
const { getLoginPage, getRegisterPage, register, login, logout } = require('../controllers/authController');

router.get('/login', getLoginPage);
router.get('/register', getRegisterPage);
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

module.exports = router;
