import { Request, Response, NextFunction } from 'express';

export interface ApiError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export class AppError extends Error implements ApiError {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  error: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  // Log error details
  console.error(`[Error] ${req.method} ${req.path}:`, {
    statusCode,
    message,
    stack: error.stack,
    body: req.body,
    params: req.params,
    query: req.query
  });

  // Don't expose stack traces in production
  const isDevelopment = process.env.NODE_ENV === 'development';

  res.status(statusCode).json({
    success: false,
    message,
    ...(isDevelopment && { stack: error.stack }),
    timestamp: new Date().toISOString(),
    path: req.path
  });
};

// Async error handler wrapper
export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Not found error
export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new AppError(`Not found - ${req.originalUrl}`, 404);
  next(error);
};

// Validation error
export const validationError = (message: string) => {
  return new AppError(`Validation Error: ${message}`, 400);
};

// Unauthorized error
export const unauthorizedError = (message = 'Unauthorized') => {
  return new AppError(message, 401);
};

// Forbidden error
export const forbiddenError = (message = 'Forbidden') => {
  return new AppError(message, 403);
};
