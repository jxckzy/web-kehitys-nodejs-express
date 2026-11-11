import {validationResult} from 'express-validator';

const notFoundHandler = (req, res, next) => {
  next(createHttpError(404, `Not Found - ${req.originalUrl}`));
};

const createHttpError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

/**
 * Custom default middleware for handling errors
 */
const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const status = err.status || 500;
  res.status(status).json({
    error: {
      message: status >= 500 ? 'Internal server error' : err.message,
      status,
    },
  });
};

const validationErrors = async (req, res, next) => {
  // validation errors can be retrieved from the request object (added by express-validator middleware)
  const errors = validationResult(req);
  // check if any validation errors
  if (!errors.isEmpty()) {
    const messages = errors
      .array()
      .map((error) => `${error.path}: ${error.msg}`)
      .join(', ');
    return next(createHttpError(400, messages));
  }
  return next();
};

export {createHttpError, notFoundHandler, errorHandler, validationErrors};
