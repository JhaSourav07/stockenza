const Order     = require('../models/Order');
const Inventory = require('../models/Inventory');

function buildDateFilter({ startDate, endDate }) {
  if (!startDate && !endDate) return {};
  const createdAt = {};
  if (startDate) createdAt.$gte = new Date(startDate);
  if (endDate)   createdAt.$lte = new Date(endDate);
  return { createdAt };
}

/** Returns true when startDate and endDate fall on the same calendar day */
function isSameDay(startDate, endDate) {
  if (!startDate || !endDate) return false;
  const s = new Date(startDate);
  const e = new Date(endDate);
  return (
    s.getFullYear() === e.getFullYear() &&
    s.getMonth()    === e.getMonth()    &&
    s.getDate()     === e.getDate()
  );
}

const getSummaryStats = async (req, res) => {
  try {
    const dateFilter = buildDateFilter(req.query);

    const [orders, inventory] = await Promise.all([
      Order.find({ createdBy: req.user._id, ...dateFilter })
        .populate('items.productId', 'costPrice'),
      Inventory.find({ createdBy: req.user._id }),
    ]);

    let totalRevenue = 0;
    let totalCost    = 0;

    orders.forEach((order) => {
      totalRevenue += order.totalAmount;
      order.items.forEach((item) => {
        if (item.productId) totalCost += item.productId.costPrice * item.qty;
      });
    });

    const inventoryValue = inventory.reduce(
      (acc, item) => acc + item.costPrice * item.quantity, 0
    );

    return res.status(200).json({
      totalRevenue:   Math.round(totalRevenue * 100) / 100,
      totalProfit:    Math.round((totalRevenue - totalCost) * 100) / 100,
      inventoryValue: Math.round(inventoryValue * 100) / 100,
      orderCount:     orders.length,
    });
  } catch (err) {
    console.error('[getSummaryStats]', err.message);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * GET /api/reports/chart?startDate=&endDate=
 *
 * Returns { granularity: 'hour' | 'day', data: [...] }
 *
 * • Same-day  → group by HOUR (00:00 … HH:00), one bucket per hour
 * • Multi-day → group by DATE (YYYY-MM-DD), one bucket per day
 */
const getChartData = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const dateFilter = buildDateFilter({ startDate, endDate });

    const orders = await Order
      .find({ createdBy: req.user._id, ...dateFilter })
      .populate('items.productId', 'costPrice')
      .sort({ createdAt: 1 });

    const todayView = isSameDay(startDate, endDate);

    if (todayView) {
      // Pre-fill every hour from 00:00 up to the current hour so the
      // X-axis always shows a full timeline even for empty hours.
      const currentHour = new Date().getHours();
      const buckets = {};

      for (let h = 0; h <= currentHour; h++) {
        const key = `${String(h).padStart(2, '0')}:00`;
        buckets[key] = { date: key, revenue: 0, profit: 0 };
      }

      orders.forEach((order) => {
        const hour = order.createdAt.getHours();
        const key  = `${String(hour).padStart(2, '0')}:00`;
        if (!buckets[key]) buckets[key] = { date: key, revenue: 0, profit: 0 };

        buckets[key].revenue += order.totalAmount;

        let cost = 0;
        order.items.forEach((item) => {
          if (item.productId) cost += item.productId.costPrice * item.qty;
        });
        buckets[key].profit += order.totalAmount - cost;
      });

      const data = Object.values(buckets).map((d) => ({
        date:    d.date,
        revenue: Math.round(d.revenue * 100) / 100,
        profit:  Math.round(d.profit  * 100) / 100,
      }));

      return res.status(200).json({ granularity: 'hour', data });
    }

    // Multi-day → daily grouping
    const grouped = {};

    orders.forEach((order) => {
      const date = order.createdAt.toISOString().split('T')[0];
      if (!grouped[date]) grouped[date] = { date, revenue: 0, profit: 0 };

      grouped[date].revenue += order.totalAmount;

      let cost = 0;
      order.items.forEach((item) => {
        if (item.productId) cost += item.productId.costPrice * item.qty;
      });
      grouped[date].profit += order.totalAmount - cost;
    });

    const data = Object.values(grouped).map((d) => ({
      date:    d.date,
      revenue: Math.round(d.revenue * 100) / 100,
      profit:  Math.round(d.profit  * 100) / 100,
    }));

    return res.status(200).json({ granularity: 'day', data });

  } catch (err) {
    console.error('[getChartData]', err.message);
    return res.status(500).json({ message: 'Server error' });
  }
};

const getPnlData = async (req, res) => {
  try {
    const dateFilter = buildDateFilter(req.query);

    const [orders, inventory] = await Promise.all([
      Order.find({ createdBy: req.user._id, ...dateFilter })
        .populate('items.productId', 'name costPrice sellingPrice'),
      Inventory.find({ createdBy: req.user._id }),
    ]);

    const productStats = {};

    orders.forEach((order) => {
      order.items.forEach((lineItem) => {
        const prod = lineItem.productId;
        if (!prod) return;
        const id = prod._id.toString();
        if (!productStats[id]) productStats[id] = { unitsSold: 0, revenue: 0, cost: 0 };
        productStats[id].unitsSold += lineItem.qty;
        productStats[id].revenue  += lineItem.qty * prod.sellingPrice;
        productStats[id].cost     += lineItem.qty * prod.costPrice;
      });
    });

    const rows = inventory.map((item) => {
      const stats  = productStats[item._id.toString()] ?? { unitsSold: 0, revenue: 0, cost: 0 };
      const profit = stats.revenue - stats.cost;
      const margin = stats.revenue > 0 ? (profit / stats.revenue) * 100 : 0;
      return {
        _id: item._id, name: item.name, sku: item.sku,
        category: item.category, quantity: item.quantity,
        costPrice: item.costPrice, sellingPrice: item.sellingPrice,
        unitsSold: stats.unitsSold,
        revenue: Math.round(stats.revenue * 100) / 100,
        cost:    Math.round(stats.cost    * 100) / 100,
        profit:  Math.round(profit        * 100) / 100,
        margin:  Math.round(margin        * 100) / 100,
      };
    }).sort((a, b) => b.revenue - a.revenue);

    return res.status(200).json(rows);
  } catch (err) {
    console.error('[getPnlData]', err.message);
    return res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Reports section — Sales & Inventory
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/reports/sales
 *
 * Returns:
 *   dailyRevenue      — [ { name: 'Mar 01', value: 1200.50 }, … ]  (last 30 days)
 *   revenueByCategory — [ { name: 'Electronics', value: 5000 }, … ]
 */
const getSalesReport = async (req, res) => {
  try {
    const userId   = req.user._id;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // ── 1. Daily revenue for last 30 days ──────────────────────────────────────
    const dailyRevRaw = await Order.aggregate([
      {
        $match: {
          createdBy: userId,
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            year:  { $year:  '$createdAt' },
            month: { $month: '$createdAt' },
            day:   { $dayOfMonth: '$createdAt' },
          },
          value: { $sum: '$totalAmount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    ]);

    const dailyRevenue = dailyRevRaw.map((d) => {
      const date = new Date(d._id.year, d._id.month - 1, d._id.day);
      return {
        name:  date.toLocaleString('en-US', { month: 'short', day: '2-digit' }),
        value: Math.round(d.value * 100) / 100,
      };
    });

    // ── 2. Revenue grouped by category (lookup Inventory for category) ─────────
    const catRevRaw = await Order.aggregate([
      { $match: { createdBy: userId } },
      { $unwind: '$items' },
      {
        $lookup: {
          from:         'inventories',
          localField:   'items.productId',
          foreignField: '_id',
          as:           'product',
        },
      },
      { $unwind: { path: '$product', preserveNullAndEmptyArrays: false } },
      {
        $group: {
          _id:   '$product.category',
          value: { $sum: { $multiply: ['$items.qty', '$product.sellingPrice'] } },
        },
      },
      { $sort: { value: -1 } },
    ]);

    const revenueByCategory = catRevRaw.map((d) => ({
      name:  d._id || 'Uncategorised',
      value: Math.round(d.value * 100) / 100,
    }));

    return res.status(200).json({ dailyRevenue, revenueByCategory });
  } catch (err) {
    console.error('[getSalesReport]', err.message);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * GET /api/reports/inventory
 *
 * Returns:
 *   valuationByCategory — [ { name: 'Electronics', value: 12000 }, … ]
 *   lowStockItems       — [ { name: 'Item A', value: 2 }, … ]  (top-5, qty > 0)
 */
const getInventoryReport = async (req, res) => {
  try {
    const userId = req.user._id;

    // ── 1. Inventory valuation by category ────────────────────────────────────
    const valuationRaw = await Inventory.aggregate([
      { $match: { createdBy: userId } },
      {
        $group: {
          _id:   '$category',
          value: { $sum: { $multiply: ['$sellingPrice', '$quantity'] } },
        },
      },
      { $sort: { value: -1 } },
    ]);

    const valuationByCategory = valuationRaw.map((d) => ({
      name:  d._id || 'Uncategorised',
      value: Math.round(d.value * 100) / 100,
    }));

    // ── 2. Top-5 lowest stock items (quantity > 0) ─────────────────────────────
    const lowStockRaw = await Inventory.aggregate([
      { $match: { createdBy: userId, quantity: { $gt: 0 } } },
      { $sort:  { quantity: 1 } },
      { $limit: 5 },
      { $project: { _id: 0, name: 1, value: '$quantity', sku: 1 } },
    ]);

    return res.status(200).json({ valuationByCategory, lowStockItems: lowStockRaw });
  } catch (err) {
    console.error('[getInventoryReport]', err.message);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getSummaryStats, getChartData, getPnlData, getSalesReport, getInventoryReport };