require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const resumeRoutes = require('./routes/resume.routes');
const { errorMiddleware, notFoundMiddleware } = require('./middleware/error.middleware');

const app = express();
const PORT = process.env.PORT || 5000;

// ---- Security & core middleware ----
app.use(helmet());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ---- CORS ----
const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim());

app.use(
  cors({
    origin(origin, callback) {
      // allow non-browser requests (curl, server-to-server) with no origin
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    methods: ['GET', 'POST'],
  })
);

// ---- Rate limiting ----
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again later.',
  },
});
app.use('/api/', limiter);

// ---- Routes ----
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'AI Resume Analyzer API is running.',
    docs: '/api/resume/health',
  });
});

app.use('/api/resume', resumeRoutes);

// ---- 404 + error handling (must be last) ----
app.use(notFoundMiddleware);
app.use(errorMiddleware);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`🚀 AI Resume Analyzer backend listening on port ${PORT}`);
  // eslint-disable-next-line no-console
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
