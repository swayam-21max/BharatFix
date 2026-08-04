const express = require('express');
const authController = require('../controllers/auth.controller');
const { registerSchema, loginSchema } = require('../validation/auth.validation');
const { validate } = require('../../../middleware/validate');
const { protect } = require('../../../middleware/auth.middleware');

const router = express.Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/logout', protect, authController.logout);

module.exports = router;
