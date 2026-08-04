const express = require('express');
const router = express.Router();
const { protect } = require('../../../middleware/auth');

router.get('/config', protect, (req, res) => {
    res.status(200).json({ message: 'SLA configuration' });
});

module.exports = router;
