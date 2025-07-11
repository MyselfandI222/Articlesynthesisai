// API Filtering System
import { SearchResult } from '../types';

export interface APISource {
  id: string;
  name: string;
  category: APICategory;
  description: string;
  enabled: boolean;
  isPremium?: boolean;
}

export type APICategory = 
  | 'news' 
  | 'technology' 
  | 'academic' 
  | 'business' 
  | 'social' 
  | 'sports'
  | 'entertainment'
  | 'government'
  | 'health'
  | 'local'
  | 'international';

// Complete list of all available API sources
export const allAPISources: APISource[] = [
  // News & Media APIs
  { id: 'google-search', name: 'Google Search', category: 'news', description: 'Live Google search results from major news sources', enabled: true },
  { id: 'newsapi', name: 'NewsAPI', category: 'news', description: 'Aggregated news from multiple sources', enabled: true },
  { id: 'guardian', name: 'The Guardian', category: 'news', description: 'News from The Guardian', enabled: true },
  { id: 'reuters', name: 'Reuters', category: 'news', description: 'International news wire service', enabled: true },
  { id: 'bbc', name: 'BBC News', category: 'news', description: 'British Broadcasting Corporation news', enabled: true },
  { id: 'cnn', name: 'CNN', category: 'news', description: 'Cable News Network', enabled: true, isPremium: false },
  { id: 'fox-news', name: 'Fox News', category: 'news', description: 'Fox News coverage', enabled: true, isPremium: false },
  { id: 'msnbc', name: 'MSNBC', category: 'news', description: 'MSNBC news coverage', enabled: true, isPremium: false },
  { id: 'npr', name: 'NPR', category: 'news', description: 'National Public Radio', enabled: true },
  { id: 'ap', name: 'Associated Press', category: 'news', description: 'AP wire service', enabled: true },
  { id: 'nytimes', name: 'New York Times', category: 'news', description: 'New York Times articles', enabled: true },
  { id: 'washpost', name: 'Washington Post', category: 'news', description: 'Washington Post coverage', enabled: true },
  
  // Technology APIs
  { id: 'github', name: 'GitHub', category: 'technology', description: 'Open source projects and code', enabled: true },
  { id: 'stackoverflow', name: 'Stack Overflow', category: 'technology', description: 'Developer Q&A and discussions', enabled: true },
  { id: 'hacker-news', name: 'Hacker News', category: 'technology', description: 'Tech community discussions', enabled: true },
  { id: 'techcrunch', name: 'TechCrunch', category: 'technology', description: 'Technology news and startups', enabled: true },
  { id: 'wired', name: 'Wired', category: 'technology', description: 'Tech culture and innovation', enabled: true },
  { id: 'product-hunt', name: 'Product Hunt', category: 'technology', description: 'New product launches', enabled: true },
  
  // Academic & Research APIs
  { id: 'arxiv', name: 'arXiv', category: 'academic', description: 'Scientific research papers', enabled: true },
  { id: 'pubmed', name: 'PubMed', category: 'academic', description: 'Medical research database', enabled: true },
  { id: 'jstor', name: 'JSTOR', category: 'academic', description: 'Academic journal articles', enabled: true },
  { id: 'google-scholar', name: 'Google Scholar', category: 'academic', description: 'Scholarly literature', enabled: true },
  { id: 'crossref', name: 'CrossRef', category: 'academic', description: 'Academic citation linking', enabled: true },
  { id: 'mit-news', name: 'MIT News', category: 'academic', description: 'MIT research news', enabled: true },
  { id: 'stanford-hai', name: 'Stanford HAI', category: 'academic', description: 'Stanford AI research', enabled: true },
  
  // Business & Finance APIs
  { id: 'alpha-vantage', name: 'Alpha Vantage', category: 'business', description: 'Financial market data', enabled: true },
  { id: 'yahoo-finance', name: 'Yahoo Finance', category: 'business', description: 'Financial news and data', enabled: true },
  { id: 'harvard-business', name: 'Harvard Business Review', category: 'business', description: 'Business analysis', enabled: true },
  { id: 'forbes', name: 'Forbes', category: 'business', description: 'Business news and lists', enabled: true },
  { id: 'coindesk', name: 'CoinDesk', category: 'business', description: 'Cryptocurrency news', enabled: true },
  { id: 'cointelegraph', name: 'Cointelegraph', category: 'business', description: 'Blockchain news', enabled: true },
  { id: 'angellist', name: 'AngelList', category: 'business', description: 'Startup ecosystem', enabled: true },
  { id: 'crunchbase', name: 'Crunchbase', category: 'business', description: 'Company information', enabled: true },
  
  // Social & Community APIs
  { id: 'reddit', name: 'Reddit', category: 'social', description: 'Community discussions', enabled: true },
  { id: 'twitter', name: 'Twitter/X', category: 'social', description: 'Social media posts', enabled: true },
  { id: 'discord', name: 'Discord', category: 'social', description: 'Community discussions', enabled: true },
  { id: 'linkedin', name: 'LinkedIn', category: 'social', description: 'Professional content', enabled: true },
  { id: 'medium', name: 'Medium', category: 'social', description: 'User-written articles', enabled: true },
  { id: 'substack', name: 'Substack', category: 'social', description: 'Newsletter content', enabled: true },
  { id: 'quora', name: 'Quora', category: 'social', description: 'Q&A platform', enabled: true },
  
  // Sports APIs
  { id: 'espn', name: 'ESPN', category: 'sports', description: 'Sports news and analysis', enabled: true },
  { id: 'bleacher-report', name: 'Bleacher Report', category: 'sports', description: 'Sports news and culture', enabled: true },
  { id: 'sports-db', name: 'TheSportsDB', category: 'sports', description: 'Sports data and statistics', enabled: true },
  { id: 'football-data', name: 'Football-Data.org', category: 'sports', description: 'Soccer/football data', enabled: true },
  { id: 'nba-stats', name: 'NBA Stats', category: 'sports', description: 'Basketball statistics', enabled: true },
  
  // Entertainment & Lifestyle APIs
  { id: 'youtube', name: 'YouTube', category: 'entertainment', description: 'Video content', enabled: true },
  { id: 'ted', name: 'TED Talks', category: 'entertainment', description: 'Educational presentations', enabled: true },
  { id: 'ign', name: 'IGN', category: 'entertainment', description: 'Gaming news', enabled: true },
  { id: 'food-network', name: 'Food Network', category: 'entertainment', description: 'Culinary content', enabled: true },
  { id: 'yelp', name: 'Yelp', category: 'entertainment', description: 'Local business reviews', enabled: true },
  { id: 'tripadvisor', name: 'TripAdvisor', category: 'entertainment', description: 'Travel reviews', enabled: true },
  
  // Government & Legal APIs
  { id: 'data-gov', name: 'Data.gov', category: 'government', description: 'Government data', enabled: true },
  { id: 'congress-gov', name: 'Congress.gov', category: 'government', description: 'Legislative information', enabled: true },
  { id: 'sec', name: 'SEC', category: 'government', description: 'Securities filings', enabled: true },
  { id: 'justia', name: 'Justia', category: 'government', description: 'Legal information', enabled: true },
  { id: 'findlaw', name: 'FindLaw', category: 'government', description: 'Legal resources', enabled: true },
  { id: 'snopes', name: 'Snopes', category: 'government', description: 'Fact checking', enabled: true },
  { id: 'politifact', name: 'PolitiFact', category: 'government', description: 'Political fact checking', enabled: true },
  
  // Health & Medical APIs
  { id: 'who', name: 'WHO', category: 'health', description: 'World Health Organization', enabled: true },
  { id: 'cdc', name: 'CDC', category: 'health', description: 'Centers for Disease Control', enabled: true },
  { id: 'nih', name: 'NIH', category: 'health', description: 'National Institutes of Health', enabled: true },
  { id: 'webmd', name: 'WebMD', category: 'health', description: 'Medical information', enabled: true },
  { id: 'mayo-clinic', name: 'Mayo Clinic', category: 'health', description: 'Medical expertise', enabled: true },
  
  // Local News APIs
  { id: 'local-news', name: 'Local News', category: 'local', description: 'Location-based news sources', enabled: true },
  { id: 'regional-news', name: 'Regional News', category: 'local', description: 'Regional news coverage', enabled: true },
  
  // International News APIs
  { id: 'al-jazeera', name: 'Al Jazeera', category: 'international', description: 'Middle Eastern perspective', enabled: true },
  { id: 'france24', name: 'France 24', category: 'international', description: 'French international news', enabled: true },
  { id: 'dw', name: 'Deutsche Welle', category: 'international', description: 'German international news', enabled: true },
  { id: 'xinhua', name: 'Xinhua', category: 'international', description: 'Chinese news agency', enabled: true },
  { id: 'nikkei', name: 'Nikkei Asia', category: 'international', description: 'Asian business news', enabled: true }
];

// Get all API categories with counts
export const getAPICategories = (): { id: APICategory; name: string; count: number }[] => {
  const categories = new Map<APICategory, number>();
  
  allAPISources.forEach(source => {
    categories.set(source.category, (categories.get(source.category) || 0) + 1);
  });
  
  return Array.from(categories.entries()).map(([id, count]) => ({
    id,
    name: getCategoryName(id),
    count
  }));
};

// Get category display name
export const getCategoryName = (category: APICategory): string => {
  const names = {
    news: 'News & Media',
    technology: 'Technology',
    academic: 'Academic & Research',
    business: 'Business & Finance',
    social: 'Social & Community',
    sports: 'Sports',
    entertainment: 'Entertainment & Lifestyle',
    government: 'Government & Legal',
    health: 'Health & Medical',
    local: 'Local News',
    international: 'International News'
  };
  
  return names[category] || category;
};

// Get category color class
export const getCategoryColorClass = (category: APICategory): string => {
  const colors = {
    news: 'bg-red-100 text-red-800',
    technology: 'bg-blue-100 text-blue-800',
    academic: 'bg-green-100 text-green-800',
    business: 'bg-yellow-100 text-yellow-800',
    social: 'bg-purple-100 text-purple-800',
    sports: 'bg-orange-100 text-orange-800',
    entertainment: 'bg-pink-100 text-pink-800',
    government: 'bg-gray-100 text-gray-800',
    health: 'bg-emerald-100 text-emerald-800',
    local: 'bg-sky-100 text-sky-800',
    international: 'bg-indigo-100 text-indigo-800'
  };
  
  return colors[category] || 'bg-gray-100 text-gray-800';
};

// Get API sources by category
export const getAPISourcesByCategory = (category: APICategory | 'all'): APISource[] => {
  if (category === 'all') {
    return allAPISources;
  }
  
  return allAPISources.filter(source => source.category === category);
};

// Get user's API preferences from localStorage
export const getUserAPIPreferences = (): { [key: string]: boolean } => {
  try {
    const stored = localStorage.getItem('apiPreferences');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn('Failed to load API preferences:', error);
  }
  
  // Default: all enabled
  return allAPISources.reduce((prefs, source) => {
    prefs[source.id] = true;
    return prefs;
  }, {});
};

// Save user's API preferences to localStorage
export const saveUserAPIPreferences = (preferences: { [key: string]: boolean }): void => {
  try {
    localStorage.setItem('apiPreferences', JSON.stringify(preferences));
  } catch (error) {
    console.warn('Failed to save API preferences:', error);
  }
};

// Get enabled API sources
export const getEnabledAPISources = (): string[] => {
  const preferences = getUserAPIPreferences();
  return allAPISources
    .filter(source => preferences[source.id] !== false)
    .map(source => source.id);
};

// Filter search results based on enabled APIs
export const filterSearchResultsByEnabledAPIs = (
  results: SearchResult[],
  enabledAPIs: string[]
): SearchResult[] => {
  // Map source names to API IDs for filtering
  const sourceToAPIMap: { [key: string]: string } = {
    'Google': 'google-search',
    'NewsAPI': 'newsapi',
    'The Guardian': 'guardian',
    'Reuters': 'reuters',
    'BBC News': 'bbc',
    'CNN': 'cnn',
    'Fox News': 'fox-news',
    'MSNBC': 'msnbc',
    'NPR': 'npr',
    'Associated Press': 'ap',
    'New York Times': 'nytimes',
    'Washington Post': 'washpost',
    'GitHub': 'github',
    'Stack Overflow': 'stackoverflow',
    'Hacker News': 'hacker-news',
    'TechCrunch': 'techcrunch',
    'Wired': 'wired',
    'Product Hunt': 'product-hunt',
    'arXiv': 'arxiv',
    'PubMed': 'pubmed',
    'JSTOR': 'jstor',
    'Google Scholar': 'google-scholar',
    'CrossRef': 'crossref',
    'MIT News': 'mit-news',
    'Stanford HAI': 'stanford-hai',
    'Alpha Vantage': 'alpha-vantage',
    'Yahoo Finance': 'yahoo-finance',
    'Harvard Business Review': 'harvard-business',
    'Forbes': 'forbes',
    'CoinDesk': 'coindesk',
    'Cointelegraph': 'cointelegraph',
    'AngelList': 'angellist',
    'Crunchbase': 'crunchbase',
    'Reddit': 'reddit',
    'Twitter': 'twitter',
    'Discord': 'discord',
    'LinkedIn': 'linkedin',
    'Medium': 'medium',
    'Substack': 'substack',
    'Quora': 'quora',
    'ESPN': 'espn',
    'Bleacher Report': 'bleacher-report',
    'TheSportsDB': 'sports-db',
    'Football-Data.org': 'football-data',
    'NBA Stats': 'nba-stats',
    'YouTube': 'youtube',
    'TED': 'ted',
    'IGN': 'ign',
    'Food Network': 'food-network',
    'Yelp': 'yelp',
    'TripAdvisor': 'tripadvisor',
    'Data.gov': 'data-gov',
    'Congress.gov': 'congress-gov',
    'SEC': 'sec',
    'Justia': 'justia',
    'FindLaw': 'findlaw',
    'Snopes': 'snopes',
    'PolitiFact': 'politifact',
    'WHO': 'who',
    'CDC': 'cdc',
    'NIH': 'nih',
    'WebMD': 'webmd',
    'Mayo Clinic': 'mayo-clinic',
    'Local News': 'local-news',
    'Regional News': 'regional-news',
    'Al Jazeera': 'al-jazeera',
    'France 24': 'france24',
    'Deutsche Welle': 'dw',
    'Xinhua': 'xinhua',
    'Nikkei Asia': 'nikkei'
  };
  
  // Special case for Google search results
  const isGoogleEnabled = enabledAPIs.includes('google-search');
  
  return results.filter(result => {
    // Try to match the source to an API ID
    const sourceKey = Object.keys(sourceToAPIMap).find(key => 
      result.source.includes(key) || result.source === key
    );
    
    // If we found a match, check if it's enabled
    if (sourceKey) {
      const apiId = sourceToAPIMap[sourceKey];
      return enabledAPIs.includes(apiId);
    }
    
    // For Google search results (identified by the Globe icon in UI)
    if (result.id.startsWith('google-')) {
      return isGoogleEnabled;
    }
    
    // For sources we can't identify, default to include
    return true;
  });
};

// Check if a specific API is enabled
export const isAPIEnabled = (apiId: string): boolean => {
  const preferences = getUserAPIPreferences();
  return preferences[apiId] !== false;
};

// Toggle API enabled status
export const toggleAPI = (apiId: string, enabled: boolean): void => {
  const preferences = getUserAPIPreferences();
  preferences[apiId] = enabled;
  saveUserAPIPreferences(preferences);
};

// Enable/disable all APIs in a category
export const toggleCategoryAPIs = (category: APICategory, enabled: boolean): void => {
  const preferences = getUserAPIPreferences();
  const categoryAPIs = allAPISources.filter(source => source.category === category);
  
  categoryAPIs.forEach(api => {
    preferences[api.id] = enabled;
  });
  
  saveUserAPIPreferences(preferences);
};

// Enable/disable all APIs
export const toggleAllAPIs = (enabled: boolean): void => {
  const preferences = getUserAPIPreferences();
  
  allAPISources.forEach(api => {
    preferences[api.id] = enabled;
  });
  
  saveUserAPIPreferences(preferences);
};

// Get count of enabled APIs
export const getEnabledAPICount = (): number => {
  const preferences = getUserAPIPreferences();
  return allAPISources.filter(source => preferences[source.id] !== false).length;
};

// Get count of enabled APIs by category
export const getEnabledAPICountByCategory = (category: APICategory): number => {
  const preferences = getUserAPIPreferences();
  const categoryAPIs = allAPISources.filter(source => source.category === category);
  return categoryAPIs.filter(source => preferences[source.id] !== false).length;
};