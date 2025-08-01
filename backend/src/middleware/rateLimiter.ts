import { RateLimiterMemory } from 'rate-limiter-flexible';
import { Request, Response, NextFunction } from 'express';
import { config } from '../config/config';

// Create rate limiter instance
const rateLimiter = new RateLimiterMemory({
  points: config.rateLimitMaxRequests, // Number of requests
  duration: config.rateLimitWindowMs / 1000, // Per duration in seconds
});

export const rateLimiterMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = req.ip || 'anonymous';
    await rateLimiter.consume(key);
    next();
  } catch (rejRes: any) {
    const timeRemaining = Math.round(rejRes.msBeforeNext / 1000) || 1;
    
    res.status(429).json({
      success: false,
      message: 'Too many requests, please try again later.',
      retryAfter: timeRemaining
    });
  }
};

export { rateLimiterMiddleware as rateLimiter };
