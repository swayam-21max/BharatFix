const express = require('express');
const complaintController = require('../controllers/complaint.controller');
const { createComplaintSchema, updateStatusSchema } = require('../validation/complaint.validation');
const { validate } = require('../../../middleware/validate');
const { protect, restrictTo } = require('../../../middleware/auth.middleware');

const router = express.Router();

// Resident Routes
router.post(
    '/',
    protect,
    restrictTo('RESIDENT', 'ADMIN'),
    validate(createComplaintSchema),
    complaintController.create
);

// Supervisor & Common Complaint Routes
router.get(
    '/',
    protect,
    restrictTo('BLOCK_HEAD', 'ADMIN', 'RESIDENT'),
    complaintController.getSupervisorComplaints
);

router.patch(
    '/:id/status',
    protect,
    restrictTo('BLOCK_HEAD', 'ADMIN'),
    validate(updateStatusSchema),
    complaintController.updateStatus
);

// Common Routes
router.get(
    '/:id',
    protect,
    complaintController.getById
);

module.exports = router;
