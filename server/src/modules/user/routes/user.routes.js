const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { protect, restrictTo } = require('../../../middleware/auth.middleware');
const { validate } = require('../../../middleware/validate');
const {
    updateProfileSchema,
    changePasswordSchema,
    updateRoleSchema,
    listUsersSchema,
} = require('../validation/user.validation');

// --- Self (any authenticated user) ---
router.get('/me', protect, userController.getMe);
router.patch('/me', protect, validate(updateProfileSchema), userController.updateMe);
router.patch('/me/password', protect, validate(changePasswordSchema), userController.changePassword);

// --- Admin only ---
router.get('/', protect, restrictTo('ADMIN'), validate(listUsersSchema), userController.listUsers);
router.patch('/:id/role', protect, restrictTo('ADMIN'), validate(updateRoleSchema), userController.updateRole);

module.exports = router;
