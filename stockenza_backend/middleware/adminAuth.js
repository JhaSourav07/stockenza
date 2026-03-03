const jwt = require('jsonwebtoken');

/* ── In-memory rate limiter: 5 attempts per 15 min per IP ── */
const loginAttempts = new Map(); // ip → { count, resetAt }
const MAX_ATTEMPTS  = 5;
const WINDOW_MS     = 15 * 60 * 1000; // 15 minutes

function rateLimitLogin(req, res, next) {
  const ip  = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  const rec = loginAttempts.get(ip);

  if (rec) {
    if (now < rec.resetAt) {
      if (rec.count >= MAX_ATTEMPTS) {
        const waitSec = Math.ceil((rec.resetAt - now) / 1000);
        return res.status(429).json({
          message: `Too many login attempts. Try again in ${waitSec}s.`,
        });
      }
      rec.count += 1;
    } else {
      loginAttempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    }
  } else {
    loginAttempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
  }

  next();
}

/* ── Admin login handler ── */
function adminLogin(req, res) {
  const { id, password } = req.body;

  if (!id || !password) {
    return res.status(400).json({ message: 'Admin ID and password are required.' });
  }

  if (
    id       !== process.env.ADMIN_ID ||
    password !== process.env.ADMIN_PASSWORD
  ) {
    return res.status(401).json({ message: 'Invalid admin credentials.' });
  }

  // Clear rate-limit record on successful login
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  loginAttempts.delete(ip);

  const token = jwt.sign(
    { admin: true },
    process.env.ADMIN_JWT_SECRET,
    { expiresIn: '8h' },
  );

  return res.status(200).json({ token });
}

/* ── Admin auth middleware ── */
function adminAuth(req, res, next) {
  const token = req.headers['x-admin-token'];

  if (!token) {
    return res.status(401).json({ message: 'Admin token required.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET);
    if (!decoded.admin) {
      return res.status(403).json({ message: 'Forbidden — not an admin token.' });
    }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Admin session expired. Please sign in again.' });
    }
    return res.status(401).json({ message: 'Invalid admin token.' });
  }
}

module.exports = { rateLimitLogin, adminLogin, adminAuth };
