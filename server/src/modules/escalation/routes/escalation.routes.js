const express = require('express');
const escalationController = require('../controllers/escalation.controller');
const { protect } = require('../../../middleware/auth.middleware');

const router = express.Router();

router.get(
    '/complaint/:complaintId',
    protect,
    escalationController.getByComplaint
);

module.exports = router;
