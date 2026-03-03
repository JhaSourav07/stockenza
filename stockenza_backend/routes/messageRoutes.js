const express  = require('express');
const router   = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  validateContact,
  submitContact,
  submitFeedback,
} = require('../controllers/messageController');

// POST /api/messages/contact — public
router.post('/contact', validateContact, submitContact);

// POST /api/messages/feedback — protected (logged-in user)
router.post('/feedback', protect, submitFeedback);

module.exports = router;
