import { RateLimiterMemory } from "rate-limiter-flexible";

// Example: max 5 thumbnails per day per user
const limiter = new RateLimiterMemory({
  points: 10,     // allowed requests
  duration: 60 * 60 *24, // per 1 hour
});

export default async function thumbnailRateLimit(req, res, next) {
  try {
    const userId = req.session?.userId;

    if(!userId) {
      return res.status(401).json({ message: "Please login first" });
    }

    await limiter.consume(String(userId)); // key = userId
    next();
  } catch (rejRes) {
    // rejRes.msBeforeNext gives cooldown time
    const retryAfterSec = Math.ceil((rejRes.msBeforeNext || 0) / 1000);

    res.set("Retry-After", String(retryAfterSec));
    return res.status(429).json({
      message: `Rate limit exceeded. Try again in ${retryAfterSec}s.`,
    });
  }
}
