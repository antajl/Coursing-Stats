/**
 * Application constants
 * Centralized configuration values to avoid magic numbers in code
 */

// Cache durations (in milliseconds)
export const CACHE = {
  SHORT: 1 * 60 * 1000,      // 1 minute - fast cache for frequently changing data
  MEDIUM: 5 * 60 * 1000,     // 5 minutes - standard cache for exhibitions
  LONG: 15 * 60 * 1000,      // 15 minutes - slow cache for stable data
} as const

// Breakpoints (in pixels) - matches Tailwind defaults
export const BREAKPOINTS = {
  MOBILE: 768,   // md breakpoint - mobile devices
  DESKTOP: 1024, // lg breakpoint - desktop devices
} as const

// Animation durations (in seconds for GSAP, milliseconds for CSS)
export const ANIMATION = {
  // GSAP durations (seconds)
  GSAP_SLOW: 0.6,       // Slow fade-in animations
  GSAP_MEDIUM: 0.42,    // Medium animation for content reveal
  GSAP_FAST: 0.075,    // Fast fade for UI elements
  
  // GSAP delays (seconds)
  DELAY_SHORT: 0.3,    // Short delay before animation starts
  DELAY_NONE: 0,       // No delay
  
  // GSAP stagger (seconds)
  STAGGER_SMALL: 0.06, // Small stagger for list items
  
  // CSS durations (milliseconds)
  CSS_FAST: 75,        // Fast transitions (75ms)
  CSS_MEDIUM: 300,     // Medium transitions (300ms)
  CSS_SLOW: 700,       // Slow transitions (700ms)
} as const

// Image dimensions (in pixels)
export const IMAGES = {
  HERO_TITLE: {
    WIDTH: 1200,
    HEIGHT: 600,
  },
  LOGO: {
    HEIGHT_MOBILE: 40,  // h-10
    HEIGHT_DESKTOP: 52, // h-[52px]
    HEIGHT_LARGE: 61,   // lg:h-[61px]
  },
  RANK_BADGE: {
    SIZE: 32,  // w-8 h-8
  },
} as const

// Scroll and layout (in pixels)
export const LAYOUT = {
  SCROLL_FADE_RANGE: 350,  // Scroll range for hero fade effect
  CONTENT_FADE_THRESHOLD: 1100,  // Desktop threshold for content fade
} as const

// Tooltip delays (in milliseconds)
export const TOOLTIP = {
  DELAY_NONE: 0,     // No delay
  DELAY_SHORT: 120,  // Short delay before tooltip appears
} as const
