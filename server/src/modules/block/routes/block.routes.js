const express = require('express');
const router = express.Router();
const blockController = require('../controllers/block.controller');
const { protect, restrictTo } = require('../../../middleware/auth.middleware');
const { validate } = require('../../../middleware/validate');
const {
    createBlockSchema,
    blockIdParamSchema,
    assignSupervisorSchema,
} = require('../validation/block.validation');

// --- Public routes ---
router.get('/', blockController.list);

// --- Authenticated routes ---
router.get('/:id', protect, validate(blockIdParamSchema), blockController.getById);

// --- Admin only ---
router.post('/', protect, restrictTo('ADMIN'), validate(createBlockSchema), blockController.create);
router.patch('/:id/supervisor', protect, restrictTo('ADMIN'), validate(assignSupervisorSchema), blockController.assignSupervisor);
router.delete('/:id/supervisor', protect, restrictTo('ADMIN'), validate(blockIdParamSchema), blockController.removeSupervisor);

module.exports = router;
