/**
 * Rate Limiting for Thor.dev API endpoints
 */

import { NextRequest } from 'next/server'

interface RateLimitConfig {
  max: number // Maximum requests
  window: number // Time window in milliseconds
}

interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

// In-memory store for rate limiting (use Redis in production)
const store = new Map<string, { count: number; reset: number }>()

export async function rateLimit(
  request: NextRequest,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  // Get identifier (IP address or user ID)
  const identifier = getIdentifier(request)
  const now = Date.now()
  const resetTime = now + config.window

  // Clean up expired entries
  for (const [key, value] of store.entries()) {
    if (value.reset < now) {
      store.delete(key)
    }
  }

  // Get or create rate limit entry
  const entry = store.get(identifier)
  
  if (!entry) {
    // First request
    store.set(identifier, { count: 1, reset: resetTime })
    return {
      success: true,
      limit: config.max,
      remaining: config.max - 1,
      reset: resetTime,
    }
  }

  if (entry.reset < now) {
    // Reset window
    store.set(identifier, { count: 1, reset: resetTime })
    return {
      success: true,
      limit: config.max,
      remaining: config.max - 1,
      reset: resetTime,
    }
  }

  if (entry.count >= config.max) {
    // Rate limit exceeded
    return {
      success: false,
      limit: config.max,
      remaining: 0,
      reset: entry.reset,
    }
  }

  // Increment count
  entry.count++
  store.set(identifier, entry)

  return {
    success: true,
    limit: config.max,
    remaining: config.max - entry.count,
    reset: entry.reset,
  }
}

function getIdentifier(request: NextRequest): string {
  // Try to get user ID from session (you'd need to implement this)
  // For now, use IP address
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown'
  return `ip:${ip}`
}