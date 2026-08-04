const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { protect } = require('../../../middleware/auth.middleware');

// GET /api/v1/dashboard/stats — role-aware stats
router.get('/stats', protect, dashboardController.getStats);

module.exports = router;
