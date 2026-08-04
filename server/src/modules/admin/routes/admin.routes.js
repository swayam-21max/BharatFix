const express = require('express');
const adminController = require('../controllers/admin.controller');
const { protect, restrictTo } = require('../../../middleware/auth.middleware');

const router = express.Router();

// Admin Only Routes
router.use(protect);
router.use(restrictTo('ADMIN'));

router.get('/pending-approvals', adminController.getPendingApprovals);
router.post('/approve/:userId', adminController.approve);
router.post('/reject/:userId', adminController.reject);
router.get('/stats', adminController.getStats);

module.exports = router;
