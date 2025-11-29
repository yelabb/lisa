/**
 * Retry utility for handling transient failures in API calls
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | unknown;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry on certain errors
      if (error instanceof Error) {
        // Don't retry validation errors
        if (error.message.includes('Invalid') || error.message.includes('required')) {
          throw error;
        }
      }

      // Last attempt - throw the error
      if (attempt === maxRetries - 1) {
        break;
      }

      // Calculate exponential backoff delay
      const delay = baseDelay * Math.pow(2, attempt);
      const jitter = Math.random() * 1000; // Add jitter to prevent thundering herd
      
      console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay + jitter}ms`);
      await new Promise(resolve => setTimeout(resolve, delay + jitter));
    }
  }

  throw lastError;
}

/**
 * Rate limiter using in-memory store (suitable for development/single instance)
 * For production with multiple instances, use Redis or similar
 */
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number = 10, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  /**
   * Check if request should be allowed
   * @param key - Unique identifier (e.g., IP address, user ID)
   * @returns true if request is allowed, false if rate limited
   */
  async checkLimit(key: string): Promise<boolean> {
    const now = Date.now();
    const userRequests = this.requests.get(key) || [];

    // Remove expired timestamps
    const validRequests = userRequests.filter(timestamp => now - timestamp < this.windowMs);

    if (validRequests.length >= this.maxRequests) {
      return false;
    }

    // Add current request
    validRequests.push(now);
    this.requests.set(key, validRequests);

    // Cleanup old entries periodically
    if (Math.random() < 0.1) {
      this.cleanup();
    }

    return true;
  }

  /**
   * Get remaining requests for a key
   */
  async getRemaining(key: string): Promise<number> {
    const now = Date.now();
    const userRequests = this.requests.get(key) || [];
    const validRequests = userRequests.filter(timestamp => now - timestamp < this.windowMs);
    return Math.max(0, this.maxRequests - validRequests.length);
  }

  /**
   * Cleanup expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, timestamps] of this.requests.entries()) {
      const validRequests = timestamps.filter(timestamp => now - timestamp < this.windowMs);
      if (validRequests.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, validRequests);
      }
    }
  }
}

// Export a singleton instance
// For story generation: 10 requests per minute per IP
export const storyGenerationLimiter = new RateLimiter(10, 60000);

// For question generation: 20 requests per minute per IP
export const questionGenerationLimiter = new RateLimiter(20, 60000);

/**
 * Extract client IP from request for rate limiting
 */
export function getClientIp(request: Request): string {
  // Try various headers (depending on proxy/CDN setup)
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Fallback to a default (for development)
  return 'unknown';
}

/**
 * Error types for better error handling
 */
export class RateLimitError extends Error {
  constructor(message: string = 'Rate limit exceeded') {
    super(message);
    this.name = 'RateLimitError';
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class AIGenerationError extends Error {
  constructor(message: string, public readonly retryable: boolean = true) {
    super(message);
    this.name = 'AIGenerationError';
  }
}
