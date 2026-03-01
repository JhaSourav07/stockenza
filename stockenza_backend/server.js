require('dotenv').config();

// ── Force IPv4 DNS resolution (fixes ENETUNREACH on Render / IPv6-only networks) ──
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const express   = require('express');
const cors      = require('cors');
const connectDB = require('./config/db.js');

// ── Connect to MongoDB ──
connectDB();

const app = express();

// ── Security: restrict origins in production ──
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS policy: origin ${origin} not allowed.`));
    }
  },
  credentials: true,
}));

// ── Body parsing ──
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ── Basic security headers ──
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// ── Routes ──
app.use('/api/auth',      require('./routes/authRoutes'));
app.use('/api/inventory', require('./routes/inventoryRoutes'));
app.use('/api/orders',    require('./routes/orderRoutes'));
app.use('/api/reports',   require('./routes/reportRoutes'));

// ── Health check ──
app.get('/health', (req, res) =>
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() })
);

// ── Root ──
app.get('/', (req, res) =>
  res.json({ message: 'Stockenza API is running.', version: '2.0.0' })
);

// ── 404 handler ──
app.use((req, res) =>
  res.status(404).json({ message: `Route ${req.method} ${req.originalUrl} not found.` })
);

// ── Global error handler ──
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(`[Error] ${err.message}`);

  // CORS errors
  if (err.message.startsWith('CORS policy')) {
    return res.status(403).json({ message: err.message });
  }

  const status = err.statusCode || err.status || 500;
  return res.status(status).json({
    message: err.message || 'An unexpected server error occurred.',
  });
});

// ── Start ──
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Stockenza API running on port ${PORT}`);
  console.log(`   Environment : ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Allowed origins: ${allowedOrigins.join(', ')}`);
});