// Breaking News Detection System Based on Engagement Metrics
import { SearchResult } from '../types';

export interface EngagementMetrics {
  views: number;
  shares: number;
  comments: number;
  reactions: number;
  totalEngagement: number;
  engagementRate: number;
  velocityScore: number; // How fast it's gaining engagement
}

export interface BreakingNewsClassification {
  isBreaking: boolean;
  breakingScore: number;
  engagementMetrics: EngagementMetrics;
  breakingReason: string;
  timeToBreaking?: number; // Minutes since publication to reach breaking status
}

// Breaking news thresholds
const BREAKING_NEWS_THRESHOLDS = {
  TOTAL_ENGAGEMENT: 150000, // Main threshold - 150k total engagement
  VELOCITY_MULTIPLIER: 1.5, // For fast-growing stories
  TIME_DECAY_HOURS: 24, // Stories older than 24h need higher engagement
  MINIMUM_VELOCITY: 1000, // Minimum engagement per hour for velocity bonus
};

// Generate realistic engagement metrics based on article characteristics
export const generateEngagementMetrics = (article: SearchResult): EngagementMetrics => {
  const publishedDate = new Date(article.publishedAt);
  const hoursOld = (Date.now() - publishedDate.getTime()) / (1000 * 60 * 60);
  
  // Base engagement factors
  const sourceMultiplier = getSourceEngagementMultiplier(article.source);
  const topicMultiplier = getTopicEngagementMultiplier(article.title, article.description);
  const timeDecay = Math.max(0.1, 1 - (hoursOld / 48)); // Decay over 48 hours
  
  // Generate base metrics with realistic distributions
  const baseViews = Math.floor(Math.random() * 500000 + 50000) * sourceMultiplier * topicMultiplier * timeDecay;
  const baseShares = Math.floor(baseViews * (0.02 + Math.random() * 0.08)); // 2-10% share rate
  const baseComments = Math.floor(baseViews * (0.005 + Math.random() * 0.015)); // 0.5-2% comment rate
  const baseReactions = Math.floor(baseViews * (0.05 + Math.random() * 0.15)); // 5-20% reaction rate
  
  // Add breaking news boost for certain indicators
  const breakingBoost = hasBreakingIndicators(article) ? 2.5 : 1;
  
  const views = Math.floor(baseViews * breakingBoost);
  const shares = Math.floor(baseShares * breakingBoost);
  const comments = Math.floor(baseComments * breakingBoost);
  const reactions = Math.floor(baseReactions * breakingBoost);
  
  const totalEngagement = views + (shares * 10) + (comments * 15) + (reactions * 5);
  const engagementRate = totalEngagement / Math.max(views, 1);
  
  // Calculate velocity (engagement per hour)
  const velocityScore = Math.floor(totalEngagement / Math.max(hoursOld, 0.5));
  
  return {
    views,
    shares,
    comments,
    reactions,
    totalEngagement,
    engagementRate,
    velocityScore
  };
};

// Get engagement multiplier based on news source credibility and reach
const getSourceEngagementMultiplier = (source: string): number => {
  const sourceLower = source.toLowerCase();
  
  // Tier 1: Major international outlets
  if (['cnn', 'bbc', 'reuters', 'associated press', 'new york times', 'washington post'].some(s => sourceLower.includes(s))) {
    return 3.0;
  }
  
  // Tier 2: Major national outlets
  if (['fox news', 'msnbc', 'npr', 'wall street journal', 'guardian', 'bloomberg'].some(s => sourceLower.includes(s))) {
    return 2.5;
  }
  
  // Tier 3: Popular digital outlets
  if (['techcrunch', 'wired', 'buzzfeed', 'huffpost', 'politico'].some(s => sourceLower.includes(s))) {
    return 2.0;
  }
  
  // Tier 4: Specialized outlets
  if (['the hill', 'axios', 'vox', 'slate', 'salon'].some(s => sourceLower.includes(s))) {
    return 1.5;
  }
  
  // Default multiplier
  return 1.0;
};

// Get engagement multiplier based on topic/content type
const getTopicEngagementMultiplier = (title: string, description: string): number => {
  const content = `${title} ${description}`.toLowerCase();
  
  // High-engagement topics
  const highEngagementTopics = [
    'breaking', 'urgent', 'crisis', 'scandal', 'controversy', 'disaster',
    'election', 'trump', 'biden', 'politics', 'war', 'attack', 'death',
    'celebrity', 'viral', 'shocking', 'exclusive', 'investigation'
  ];
  
  // Medium-engagement topics
  const mediumEngagementTopics = [
    'technology', 'ai', 'climate', 'economy', 'market', 'health',
    'covid', 'vaccine', 'sports', 'entertainment', 'business'
  ];
  
  // Check for high-engagement indicators
  const highEngagementCount = highEngagementTopics.filter(topic => content.includes(topic)).length;
  if (highEngagementCount >= 2) return 2.5;
  if (highEngagementCount >= 1) return 2.0;
  
  // Check for medium-engagement indicators
  const mediumEngagementCount = mediumEngagementTopics.filter(topic => content.includes(topic)).length;
  if (mediumEngagementCount >= 2) return 1.5;
  if (mediumEngagementCount >= 1) return 1.3;
  
  return 1.0;
};

// Check if article has breaking news indicators
const hasBreakingIndicators = (article: SearchResult): boolean => {
  const content = `${article.title} ${article.description}`.toLowerCase();
  
  const breakingIndicators = [
    'breaking', 'urgent', 'just in', 'developing', 'live updates',
    'exclusive', 'first reported', 'confirmed', 'sources say'
  ];
  
  return breakingIndicators.some(indicator => content.includes(indicator));
};

// Classify article as breaking news based on engagement
export const classifyBreakingNews = (article: SearchResult): BreakingNewsClassification => {
  const metrics = generateEngagementMetrics(article);
  const publishedDate = new Date(article.publishedAt);
  const hoursOld = (Date.now() - publishedDate.getTime()) / (1000 * 60 * 60);
  
  let breakingScore = 0;
  let breakingReasons: string[] = [];
  
  // Primary threshold: Total engagement over 150k
  if (metrics.totalEngagement >= BREAKING_NEWS_THRESHOLDS.TOTAL_ENGAGEMENT) {
    breakingScore += 100;
    breakingReasons.push(`${metrics.totalEngagement.toLocaleString()} total engagement (>150k threshold)`);
  }
  
  // Velocity bonus: Fast-growing stories
  if (metrics.velocityScore >= BREAKING_NEWS_THRESHOLDS.MINIMUM_VELOCITY) {
    const velocityBonus = Math.min(50, (metrics.velocityScore / 1000) * 10);
    breakingScore += velocityBonus;
    breakingReasons.push(`High velocity: ${metrics.velocityScore.toLocaleString()} engagement/hour`);
  }
  
  // Time-adjusted threshold for older stories
  if (hoursOld > BREAKING_NEWS_THRESHOLDS.TIME_DECAY_HOURS) {
    const adjustedThreshold = BREAKING_NEWS_THRESHOLDS.TOTAL_ENGAGEMENT * (1 + hoursOld / 24);
    if (metrics.totalEngagement >= adjustedThreshold) {
      breakingScore += 75;
      breakingReasons.push(`Sustained engagement over ${Math.floor(hoursOld)}h`);
    }
  }
  
  // Breaking indicators bonus
  if (hasBreakingIndicators(article)) {
    breakingScore += 25;
    breakingReasons.push('Contains breaking news indicators');
  }
  
  // High-credibility source bonus
  const sourceMultiplier = getSourceEngagementMultiplier(article.source);
  if (sourceMultiplier >= 2.5) {
    breakingScore += 20;
    breakingReasons.push(`High-credibility source: ${article.source}`);
  }
  
  // Exceptional engagement rate bonus
  if (metrics.engagementRate > 0.3) {
    breakingScore += 30;
    breakingReasons.push(`Exceptional engagement rate: ${(metrics.engagementRate * 100).toFixed(1)}%`);
  }
  
  const isBreaking = breakingScore >= 100;
  const breakingReason = breakingReasons.length > 0 
    ? breakingReasons.join('; ')
    : 'Standard engagement levels';
  
  // Calculate time to breaking (for articles that are breaking)
  let timeToBreaking: number | undefined;
  if (isBreaking && metrics.velocityScore > 0) {
    timeToBreaking = Math.floor(BREAKING_NEWS_THRESHOLDS.TOTAL_ENGAGEMENT / metrics.velocityScore * 60); // Convert to minutes
  }
  
  return {
    isBreaking,
    breakingScore: Math.round(breakingScore),
    engagementMetrics: metrics,
    breakingReason,
    timeToBreaking
  };
};

// Get breaking news badge styling based on engagement level
export const getBreakingNewsBadge = (classification: BreakingNewsClassification): {
  show: boolean;
  text: string;
  className: string;
  icon: string;
} => {
  if (!classification.isBreaking) {
    return { show: false, text: '', className: '', icon: '' };
  }
  
  const { totalEngagement, velocityScore } = classification.engagementMetrics;
  
  // Ultra-viral (1M+ engagement)
  if (totalEngagement >= 1000000) {
    return {
      show: true,
      text: 'VIRAL',
      className: 'bg-purple-600 text-white animate-pulse',
      icon: '🔥'
    };
  }
  
  // Major breaking (500k+ engagement)
  if (totalEngagement >= 500000) {
    return {
      show: true,
      text: 'MAJOR',
      className: 'bg-red-600 text-white animate-pulse',
      icon: '🚨'
    };
  }
  
  // Fast-breaking (high velocity)
  if (velocityScore >= 5000) {
    return {
      show: true,
      text: 'TRENDING',
      className: 'bg-orange-600 text-white animate-bounce',
      icon: '📈'
    };
  }
  
  // Standard breaking
  return {
    show: true,
    text: 'BREAKING',
    className: 'bg-red-500 text-white',
    icon: '🚨'
  };
};

// Format engagement numbers for display
export const formatEngagementNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toLocaleString();
};

// Get trending status based on velocity
export const getTrendingStatus = (metrics: EngagementMetrics): {
  isTrending: boolean;
  trendingLevel: 'hot' | 'rising' | 'stable';
  description: string;
} => {
  const { velocityScore, totalEngagement } = metrics;
  
  if (velocityScore >= 10000 && totalEngagement >= 100000) {
    return {
      isTrending: true,
      trendingLevel: 'hot',
      description: 'Rapidly gaining engagement'
    };
  }
  
  if (velocityScore >= 2000 && totalEngagement >= 50000) {
    return {
      isTrending: true,
      trendingLevel: 'rising',
      description: 'Steadily gaining traction'
    };
  }
  
  return {
    isTrending: false,
    trendingLevel: 'stable',
    description: 'Normal engagement levels'
  };
};