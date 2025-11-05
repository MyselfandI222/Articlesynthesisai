// Gemini Search Service
import { Article } from '../types';
import { apiRequest } from '../lib/queryClient';

export interface GeminiSearchConfig {
  model: string;
  maxResults: number;
  searchDepth: 'basic' | 'comprehensive' | 'deep';
  includeAnalysis: boolean;
  filterRelevance: boolean;
  settings: {
    temperature: number;
    maxTokens: number;
    topP: number;
    topK: number;
  };
}

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  relevanceScore: number;
  source: string;
  publishedDate?: string;
  category?: string;
}

export interface GeminiSearchResponse {
  results: SearchResult[];
  summary: string;
  relatedQueries: string[];
  totalResults: number;
  searchTime: number;
  confidence: number;
}

// Default Gemini configuration
const DEFAULT_GEMINI_CONFIG: GeminiSearchConfig = {
  model: 'gemini-2.5-flash',
  maxResults: 10,
  searchDepth: 'comprehensive',
  includeAnalysis: true,
  filterRelevance: true,
  settings: {
    temperature: 0.3,
    maxTokens: 4000,
    topP: 0.8,
    topK: 40
  }
};

// Get Gemini settings from localStorage
export const getGeminiSettings = (): GeminiSearchConfig => {
  try {
    const settings = localStorage.getItem('geminiSearchSettings');
    if (settings) {
      return { ...DEFAULT_GEMINI_CONFIG, ...JSON.parse(settings) };
    }
  } catch (error) {
    console.warn('Failed to load Gemini settings:', error);
  }
  return DEFAULT_GEMINI_CONFIG;
};

// Save Gemini settings to localStorage
export const saveGeminiSettings = (settings: GeminiSearchConfig): void => {
  try {
    localStorage.setItem('geminiSearchSettings', JSON.stringify(settings));
  } catch (error) {
    console.warn('Failed to save Gemini settings:', error);
  }
};

// Intelligent search with Gemini (via secure backend)
export const searchWithGemini = async (
  query: string,
  config: GeminiSearchConfig = getGeminiSettings()
): Promise<GeminiSearchResponse> => {
  try {
    const response = await apiRequest('POST', '/api/gemini/search', {
      query,
      config
    });

    const data = await response.json();
    return data;
    
  } catch (error: any) {
    console.error('Gemini search error:', error);
    throw new Error(`Search failed: ${error.message}`);
  }
};

// Convert Gemini search results to Article format
export const convertSearchResultsToArticles = (
  searchResults: GeminiSearchResponse
): Article[] => {
  return searchResults.results.map((result, index) => ({
    id: `gemini-${index}`,
    title: result.title,
    url: result.url,
    content: result.snippet,
    source: result.source,
    publishedAt: result.publishedDate || new Date().toISOString(),
    category: result.category || 'general',
    relevanceScore: result.relevanceScore,
    credibilityScore: calculateCredibilityScore(result.source),
    engagement: Math.floor(Math.random() * 10000), // Placeholder
    isBreaking: result.relevanceScore > 85
  }));
};

// Calculate source credibility score
const calculateCredibilityScore = (source: string): number => {
  const highCredibilitySources = [
    'reuters', 'associated press', 'ap news', 'bbc', 'npr', 'pbs',
    'the guardian', 'the new york times', 'washington post', 'wall street journal',
    'cnn', 'abc news', 'cbs news', 'nbc news', 'usa today'
  ];
  
  const mediumCredibilitySources = [
    'fox news', 'msnbc', 'politico', 'the hill', 'bloomberg',
    'time', 'newsweek', 'the atlantic', 'new yorker'
  ];
  
  const sourceLower = source.toLowerCase();
  
  if (highCredibilitySources.some(s => sourceLower.includes(s))) {
    return Math.floor(Math.random() * 20) + 80; // 80-100
  }
  
  if (mediumCredibilitySources.some(s => sourceLower.includes(s))) {
    return Math.floor(Math.random() * 20) + 60; // 60-80
  }
  
  return Math.floor(Math.random() * 40) + 40; // 40-80
};

// Enhanced search with trend analysis
export const searchWithTrendAnalysis = async (
  query: string,
  config: GeminiSearchConfig = getGeminiSettings()
): Promise<{
  searchResults: GeminiSearchResponse;
  trendAnalysis: {
    trending: boolean;
    momentum: 'rising' | 'stable' | 'declining';
    keywords: string[];
    sentiment: 'positive' | 'negative' | 'neutral';
    urgency: number;
  };
}> => {
  const [searchResults] = await Promise.all([
    searchWithGemini(query, config)
  ]);
  
  // Analyze trends from search results
  const trendAnalysis: {
    trending: boolean;
    momentum: 'rising' | 'stable' | 'declining';
    keywords: string[];
    sentiment: 'positive' | 'negative' | 'neutral';
    urgency: number;
  } = {
    trending: searchResults.confidence > 70,
    momentum: searchResults.results.length > 5 ? 'rising' : 'stable',
    keywords: searchResults.relatedQueries,
    sentiment: 'neutral',
    urgency: Math.min(searchResults.confidence, 100)
  };
  
  return {
    searchResults,
    trendAnalysis
  };
};

// Real-time breaking news detection with Gemini
export const detectBreakingNews = async (
  query: string = "breaking news today"
): Promise<Article[]> => {
  try {
    const config = {
      ...getGeminiSettings(),
      maxResults: 5,
      searchDepth: 'comprehensive' as const,
      includeAnalysis: true
    };
    
    const breakingNewsPrompt = `
Find the most recent breaking news and urgent stories from the last 6 hours.
Focus on: ${query}

Requirements:
- Only include stories from the last 6 hours
- Prioritize high-impact, urgent news
- Include reliable news sources only
- Provide engagement metrics estimation
- Mark stories as breaking if they have high urgency

Search for stories about: politics, world events, technology, health, economy, disasters, major announcements.
`;

    const searchResults = await searchWithGemini(breakingNewsPrompt, config);
    const articles = convertSearchResultsToArticles(searchResults);
    
    // Mark high-relevance articles as breaking
    return articles.map(article => ({
      ...article,
      isBreaking: (article.relevanceScore || 0) > 75,
      engagement: (article.relevanceScore || 0) * 1000 // Simulate engagement based on relevance
    }));
    
  } catch (error) {
    console.error('Error detecting breaking news with Gemini:', error);
    return [];
  }
};

// Multi-query search for comprehensive coverage
export const multiQuerySearch = async (
  queries: string[],
  config: GeminiSearchConfig = getGeminiSettings()
): Promise<GeminiSearchResponse[]> => {
  const searchPromises = queries.map(query => 
    searchWithGemini(query, { ...config, maxResults: 5 })
  );
  
  try {
    return await Promise.all(searchPromises);
  } catch (error) {
    console.error('Multi-query search error:', error);
    throw error;
  }
};

export default {
  searchWithGemini,
  searchWithTrendAnalysis,
  detectBreakingNews,
  multiQuerySearch,
  convertSearchResultsToArticles,
  getGeminiSettings,
  saveGeminiSettings
};