const Message = require('../models/Message');
const { buildValidator } = require('../middleware/validate');

/* ── Validator for contact form ── */
const isEmpty = (v) => v === undefined || v === null || String(v).trim() === '';
const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v));

const validateContact = buildValidator([
  {
    field: 'name',
    checks: [
      { test: (v) => !isEmpty(v), msg: 'Name is required.' },
      { test: (v) => String(v).trim().length >= 2, msg: 'Name must be at least 2 characters.' },
    ],
  },
  {
    field: 'email',
    checks: [
      { test: (v) => !isEmpty(v), msg: 'Email is required.' },
      { test: (v) => isEmail(v),  msg: 'Please provide a valid email address.' },
    ],
  },
  {
    field: 'message',
    checks: [
      { test: (v) => !isEmpty(v), msg: 'Message is required.' },
      { test: (v) => String(v).trim().length >= 10, msg: 'Message must be at least 10 characters.' },
    ],
  },
]);

/* ───────────────────────────────────────────
   POST /api/messages/contact  (public)
─────────────────────────────────────────── */
const submitContact = async (req, res) => {
  try {
    const { name, email, message } = req.body;
    const doc = await Message.create({
      type: 'contact',
      name: name.trim(),
      email: email.trim().toLowerCase(),
      message: message.trim(),
    });
    return res.status(201).json({ message: "Message sent. We'll get back to you soon.", id: doc._id });
  } catch (err) {
    console.error('[submitContact]', err.message);
    return res.status(500).json({ message: 'Failed to save message. Please try again.' });
  }
};

/* ───────────────────────────────────────────
   POST /api/messages/feedback  (protected)
─────────────────────────────────────────── */
const submitFeedback = async (req, res) => {
  try {
    const { subject, message, rating } = req.body;

    if (!message || String(message).trim().length < 5) {
      return res.status(400).json({ message: 'Feedback message must be at least 5 characters.' });
    }
    if (rating !== undefined && (isNaN(rating) || rating < 1 || rating > 5)) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5.' });
    }

    const doc = await Message.create({
      type: 'feedback',
      name: req.user.name,
      email: req.user.email,
      userId: req.user._id,
      subject: subject || '',
      message: message.trim(),
      rating: rating ? Number(rating) : null,
    });

    return res.status(201).json({ message: 'Thank you for your feedback!', id: doc._id });
  } catch (err) {
    console.error('[submitFeedback]', err.message);
    return res.status(500).json({ message: 'Failed to save feedback. Please try again.' });
  }
};

/* ───────────────────────────────────────────
   GET /api/admin/messages  (admin)
   ?type=contact|feedback
   ?status=unread|read|archived
   ?page=1&limit=20
─────────────────────────────────────────── */
const getAdminMessages = async (req, res) => {
  try {
    const { type, status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (type   && ['contact', 'feedback'].includes(type))             filter.type   = type;
    if (status && ['unread', 'read', 'archived'].includes(status))    filter.status = status;

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Message.countDocuments(filter);
    const messages = await Message.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('userId', 'name email')
      .lean();

    return res.status(200).json({ total, page: Number(page), limit: Number(limit), messages });
  } catch (err) {
    console.error('[getAdminMessages]', err.message);
    return res.status(500).json({ message: 'Failed to fetch messages.' });
  }
};

/* ───────────────────────────────────────────
   PATCH /api/admin/messages/:id/status (admin)
─────────────────────────────────────────── */
const updateMessageStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['unread', 'read', 'archived'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value.' });
    }
    const msg = await Message.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true },
    );
    if (!msg) return res.status(404).json({ message: 'Message not found.' });
    return res.status(200).json({ message: 'Status updated.', data: msg });
  } catch (err) {
    console.error('[updateMessageStatus]', err.message);
    return res.status(500).json({ message: 'Failed to update status.' });
  }
};

/* ───────────────────────────────────────────
   DELETE /api/admin/messages/:id  (admin)
─────────────────────────────────────────── */
const deleteMessage = async (req, res) => {
  try {
    const msg = await Message.findByIdAndDelete(req.params.id);
    if (!msg) return res.status(404).json({ message: 'Message not found.' });
    return res.status(200).json({ message: 'Message deleted.' });
  } catch (err) {
    console.error('[deleteMessage]', err.message);
    return res.status(500).json({ message: 'Failed to delete message.' });
  }
};

/* ───────────────────────────────────────────
   GET /api/admin/stats  (admin)
─────────────────────────────────────────── */
const getAdminStats = async (req, res) => {
  try {
    const [total, unread, contact, feedback, ratingAgg] = await Promise.all([
      Message.countDocuments(),
      Message.countDocuments({ status: 'unread' }),
      Message.countDocuments({ type: 'contact' }),
      Message.countDocuments({ type: 'feedback' }),
      Message.aggregate([
        { $match: { type: 'feedback', rating: { $ne: null } } },
        { $group: { _id: null, avg: { $avg: '$rating' } } },
      ]),
    ]);

    const avgRating = ratingAgg.length > 0
      ? Math.round(ratingAgg[0].avg * 10) / 10
      : 0;

    return res.status(200).json({ total, unread, contact, feedback, avgRating });
  } catch (err) {
    console.error('[getAdminStats]', err.message);
    return res.status(500).json({ message: 'Failed to fetch stats.' });
  }
};

/* ───────────────────────────────────────────
   GET /api/admin/chart  (admin)
   Messages per day for last 14 days
─────────────────────────────────────────── */
const getChartData = async (req, res) => {
  try {
    const since = new Date();
    since.setDate(since.getDate() - 13);
    since.setHours(0, 0, 0, 0);

    const rows = await Message.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            type: '$type',
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.date': 1 } },
    ]);

    // Build a full 14-day map with zeros
    const map = {};
    for (let i = 0; i < 14; i++) {
      const d = new Date(since);
      d.setDate(since.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      map[key] = { date: key, contact: 0, feedback: 0 };
    }
    for (const row of rows) {
      const key = row._id.date;
      if (map[key]) map[key][row._id.type] = row.count;
    }

    return res.status(200).json(Object.values(map));
  } catch (err) {
    console.error('[getChartData]', err.message);
    return res.status(500).json({ message: 'Failed to fetch chart data.' });
  }
};

module.exports = {
  validateContact,
  submitContact,
  submitFeedback,
  getAdminMessages,
  updateMessageStatus,
  deleteMessage,
  getAdminStats,
  getChartData,
};
