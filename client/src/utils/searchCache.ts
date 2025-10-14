// Search Results Cache
// Cache search results for 5 minutes to dramatically improve search speed

import type { Article } from '../types';

interface CacheEntry {
  results: Article[];
  timestamp: number;
}

class SearchCache {
  private cache: Map<string, CacheEntry> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

  // Generate cache key from query and filters
  private generateKey(query: string, filters?: Record<string, any>): string {
    const normalizedQuery = query.trim().toLowerCase();
    const filtersKey = filters ? JSON.stringify(filters) : '';
    return `${normalizedQuery}:${filtersKey}`;
  }

  // Get cached results if they exist and aren't expired
  get(query: string, filters?: Record<string, any>): Article[] | null {
    const key = this.generateKey(query, filters);
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    const now = Date.now();
    const age = now - entry.timestamp;

    // Check if cache is expired
    if (age > this.CACHE_DURATION) {
      this.cache.delete(key);
      return null;
    }

    console.log(`✓ Cache hit for "${query}" (${Math.round(age / 1000)}s old)`);
    return entry.results;
  }

  // Store results in cache
  set(query: string, results: Article[], filters?: Record<string, any>): void {
    const key = this.generateKey(query, filters);
    this.cache.set(key, {
      results,
      timestamp: Date.now()
    });
    console.log(`✓ Cached ${results.length} results for "${query}"`);
  }

  // Clear all cached results
  clear(): void {
    this.cache.clear();
    console.log('✓ Search cache cleared');
  }

  // Remove expired entries
  cleanup(): void {
    const now = Date.now();
    let removedCount = 0;

    for (const [key, entry] of this.cache.entries()) {
      const age = now - entry.timestamp;
      if (age > this.CACHE_DURATION) {
        this.cache.delete(key);
        removedCount++;
      }
    }

    if (removedCount > 0) {
      console.log(`✓ Removed ${removedCount} expired cache entries`);
    }
  }

  // Get cache statistics
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Export singleton instance
export const searchCache = new SearchCache();

// Cleanup expired entries every minute
setInterval(() => {
  searchCache.cleanup();
}, 60 * 1000);
