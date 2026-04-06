const logger = require("../config/logger");

function errorHandler(err, req, res, next) {
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err.details ? { details: err.details } : {}),
      },
      requestId: req.id,
    });
  }

  logger.error(
    { err: err.stack, message: err.message, path: req.path, requestId: req.id },
    "Unhandled error"
  );

  const response = {
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message: "An unexpected error occurred",
    },
    requestId: req.id,
  };

  if (process.env.NODE_ENV === "development") {
    response.error.stack = err.stack;
  }

  return res.status(500).json(response);
}

module.exports = errorHandler;
