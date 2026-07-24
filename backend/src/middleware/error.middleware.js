const multer = require('multer');

/**
 * Centralized error handler. Any `next(err)` call in the app,
 * or thrown/rejected error in an async route (see asyncHandler),
 * ends up here.
 */
function errorMiddleware(err, req, res, next) {
  // Multer-specific errors (file too large, wrong field, etc.)
  if (err instanceof multer.MulterError) {
    let message = 'File upload error.';
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = `File is too large. Max size is ${
        process.env.MAX_FILE_SIZE_MB || 5
      }MB.`;
    } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      message = 'Unexpected file field. Please upload a single resume file.';
    }
    return res.status(400).json({ success: false, message });
  }

  const status = err.status || err.statusCode || 500;
  const message =
    status === 500 && process.env.NODE_ENV === 'production'
      ? 'Something went wrong on the server. Please try again later.'
      : err.message || 'Unexpected error.';

  if (status === 500) {
    // eslint-disable-next-line no-console
    console.error('[Unhandled Error]', err);
  }

  res.status(status).json({ success: false, message });
}

/**
 * Wraps an async route handler so rejected promises are
 * forwarded to Express's error handling pipeline automatically.
 */
function asyncHandler(fn) {
  return function wrapped(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

function notFoundMiddleware(req, res) {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found.`,
  });
}

module.exports = { errorMiddleware, asyncHandler, notFoundMiddleware };
