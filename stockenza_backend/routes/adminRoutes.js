const express  = require('express');
const router   = express.Router();
const { rateLimitLogin, adminLogin, adminAuth } = require('../middleware/adminAuth');
const {
  getAdminMessages,
  updateMessageStatus,
  deleteMessage,
  getAdminStats,
  getChartData,
} = require('../controllers/messageController');

// POST /api/admin/login — public (rate-limited)
router.post('/login', rateLimitLogin, adminLogin);

// All routes below require admin JWT in x-admin-token header
router.get('/stats',                    adminAuth, getAdminStats);
router.get('/chart',                    adminAuth, getChartData);
router.get('/messages',                 adminAuth, getAdminMessages);
router.patch('/messages/:id/status',    adminAuth, updateMessageStatus);
router.delete('/messages/:id',          adminAuth, deleteMessage);

module.exports = router;
