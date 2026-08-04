const express = require('express');
const chatbotController = require('../controllers/chatbot.controller');

const router = express.Router();

// Public / Authenticated Chatbot endpoints
router.post('/query', chatbotController.handleQuery);
router.get('/faqs', chatbotController.getFaqs);

module.exports = router;
