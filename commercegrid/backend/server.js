require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const { connectDB, sequelize } = require('./config/db');
const { errorHandler, notFound } = require('./middlewares/errorHandler');

// Import routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();

// ── Connect to DB ──────────────────────────────────────────────
connectDB().then(() => {
  sequelize.sync({ alter: true }).then(async () => {
    console.log('✅ Database models synced successfully');
    // Auto-seed check
    try {
      const Category = require('./models/Category');
      const count = await Category.count();
      if (count === 0) {
        console.log('🔄 Database is empty. Running auto-seeding...');
        const { exec } = require('child_process');
        exec('node seed.js', (err, stdout) => {
          if (err) {
            console.error('❌ Auto-seeding failed:', err.message);
          } else {
            console.log('✅ Auto-seeding completed:', stdout.trim());
          }
        });
      }
    } catch (e) {
      console.error('⚠️ Could not run auto-seed check:', e.message);
    }
  }).catch(err => {
    console.error('❌ Database sync failed:', err.message);
  });
});

// ── Security Middleware ────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// ── CORS ───────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
}));

// ── Body Parsers ───────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Logging ────────────────────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ── Health check ───────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: '🚀 CommerceGrid API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// ── API Routes ─────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

// ── 404 & Error Handlers ───────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Start Server ───────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 CommerceGrid API running on http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/api/health\n`);
});

module.exports = app;
