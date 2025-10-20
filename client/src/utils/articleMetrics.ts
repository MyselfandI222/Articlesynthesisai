/**
 * Article metrics utility functions for word count and reading time calculations
 */

// Word count ranges based on article length
export const WORD_COUNT_RANGES = {
  short: { min: 300, max: 600, target: 450 },
  medium: { min: 700, max: 1200, target: 950 },
  long: { min: 1500, max: Infinity, target: 2250 },
} as const;

// Reading time calculations (assuming average reading speed of 200 words per minute)
const AVERAGE_READING_SPEED = 200; // words per minute

/**
 * Calculate word count from text content
 */
export function calculateWordCount(text: string): number {
  if (!text || typeof text !== 'string') return 0;
  
  // Remove extra whitespace and count words
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * Calculate reading time in minutes from word count
 */
export function calculateReadingTime(wordCount: number): number {
  if (wordCount <= 0) return 0;
  
  // Calculate reading time and round to nearest minute (minimum 1 minute)
  const readingTime = Math.ceil(wordCount / AVERAGE_READING_SPEED);
  return Math.max(1, readingTime);
}

/**
 * Format reading time for display
 */
export function formatReadingTime(minutes: number): string {
  if (minutes < 1) return 'Less than 1 min';
  if (minutes === 1) return '1 min';
  return `${minutes} min`;
}

/**
 * Get word count range description for a length type
 */
export function getWordCountRangeDescription(length: 'short' | 'medium' | 'long'): string {
  const range = WORD_COUNT_RANGES[length];
  
  // Handle infinite max (for long articles)
  if (range.max === Infinity) {
    return `${range.min}+ words`;
  }
  
  return `${range.min}–${range.max} words`;
}

/**
 * Get reading time range description for a length type
 */
export function getReadingTimeRangeDescription(length: 'short' | 'medium' | 'long'): string {
  const range = WORD_COUNT_RANGES[length];
  const minTime = calculateReadingTime(range.min);
  
  // Handle infinite max (for long articles)
  if (range.max === Infinity) {
    return `${minTime}+ min`;
  }
  
  const maxTime = calculateReadingTime(range.max);
  if (minTime === maxTime) return `${minTime} min`;
  return `${minTime}–${maxTime} min`;
}

/**
 * Get target word count for synthesis based on length
 */
export function getTargetWordCount(length: 'short' | 'medium' | 'long'): number {
  return WORD_COUNT_RANGES[length].target;
}

/**
 * Check if word count is within acceptable range for length type
 */
export function isWordCountInRange(wordCount: number, length: 'short' | 'medium' | 'long'): boolean {
  const range = WORD_COUNT_RANGES[length];
  return wordCount >= range.min && wordCount <= range.max;
}
