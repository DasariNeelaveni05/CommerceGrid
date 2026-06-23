const { validationResult } = require('express-validator');

// Run validation results and return 400 if errors exist
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// Central error handler middleware
exports.errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Sequelize unique constraint error
  if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 409;
    message = err.errors.map((e) => `${e.path} already exists.`).join(', ');
  }

  // Sequelize validation error
  if (err.name === 'SequelizeValidationError') {
    statusCode = 400;
    message = err.errors.map((e) => e.message).join(', ');
  }

  // Mongoose duplicate key (legacy)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.`;
  }

  // Mongoose validation error (legacy)
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map((e) => e.message).join(', ');
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token.';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token has expired.';
  }

  // Cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 404;
    message = `Resource not found.`;
  }

  res.status(statusCode).json({ success: false, message });
};

// Not found handler
exports.notFound = (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
};
