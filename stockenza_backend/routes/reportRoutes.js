const express = require('express');
const router = express.Router();
const {
  getSummaryStats,
  getChartData,
  getPnlData,
  getSalesReport,
  getInventoryReport,
} = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

router.get('/summary',   protect, getSummaryStats);
router.get('/chart',     protect, getChartData);
router.get('/pnl',       protect, getPnlData);
router.get('/sales',     protect, getSalesReport);
router.get('/inventory', protect, getInventoryReport);

module.exports = router;
