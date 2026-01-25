import rateLimit from 'express-rate-limit';

/**
 * Rate Limiter for Login Endpoint
 * Prevents brute force attacks on authentication
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 login attempts per window
  message: {
    success: false,
    error: 'Too many login attempts. Please try again in 15 minutes.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  skipSuccessfulRequests: true, // Don't count successful logins
  skipFailedRequests: false, // Count failed attempts
  handler: (req, res) => {
    console.warn(`⚠️ Rate limit exceeded for IP: ${req.ip} on ${req.path}`);
    res.status(429).json({
      success: false,
      error: 'Too many login attempts. Please try again in 15 minutes.',
      retryAfter: 900 // seconds
    });
  }
});

/**
 * General API Rate Limiter
 * Prevents API abuse
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: {
    success: false,
    error: 'Too many requests. Please slow down.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.warn(`⚠️ API rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      error: 'Too many requests. Please slow down.',
      retryAfter: 900
    });
  }
});

/**
 * Strict Rate Limiter for Waitlist/Public Forms
 * Prevents spam submissions
 */
export const waitlistLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 submissions per hour per IP
  message: {
    success: false,
    error: 'Too many submissions. Please try again later.',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false, // Count all attempts
  handler: (req, res) => {
    console.warn(`⚠️ Waitlist spam detected from IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      error: 'Too many submissions. You can submit again in 1 hour.',
      retryAfter: 3600
    });
  }
});

/**
 * Strict Rate Limiter for Setup/Admin Endpoints
 * Prevents abuse of sensitive operations
 */
export const setupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 attempts per hour
  message: {
    success: false,
    error: 'Too many setup attempts. Please contact support.',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.error(`🚨 Setup endpoint abuse from IP: ${req.ip} on ${req.path}`);
    res.status(429).json({
      success: false,
      error: 'Too many setup attempts. Please contact support if this is legitimate.',
      retryAfter: 3600
    });
  }
});

/**
 * Create custom rate limiter
 */
export const createRateLimiter = (options: {
  windowMs: number;
  max: number;
  message: string;
}) => {
  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    message: {
      success: false,
      error: options.message
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};
