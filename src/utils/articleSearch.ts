import { newsAPIs } from './newsAPIs';
import { searchSportsAPIs } from './sportsAPIs';
import { categoryAPIs } from './categoryAPIs';
import { searchAdditionalAPIs } from './additionalAPIs';
import { searchEnhancedAPIs } from './enhancedAPIs';
import { searchMegaAPIs } from './megaAPIs';
import { searchMajorNewsAPIs } from './majorNewsAPIs';
import { searchAllLocalNews } from './localNewsAPIs';
import { generateBreakingNews } from './breakingNewsGenerator';
import { getTodaysBreakingNews, getTodaysTrendingTopics } from './dailyNewsUpdater';
import { filterSearchResultsByEnabledAPIs, getEnabledAPISources } from './apiFilters';
import { searchGoogleForArticles, shouldUseGoogleSearch } from './googleSearchAPI';
import { getSavedLocation } from './locationService';
import type { Article, Category, SearchFilters } from '../types';
import { enhanceSearchWithChatGPT } from './chatGptSearchService';

// Main categories available for search
export const getAllCategories = (): Category[] => {
  return [
    { 
      id: 'general', 
      name: 'General News', 
      color: 'bg-gray-100 text-gray-800',
      subcategories: [
        { name: 'Breaking News', description: 'Latest breaking news and urgent updates', query: 'breaking news latest updates' },
        { name: 'World News', description: 'International news and global events', query: 'world news international global events' },
        { name: 'Local News', description: 'Community and regional news coverage', query: 'local news community regional' },
        { name: 'Weather', description: 'Weather forecasts and climate updates', query: 'weather forecast climate updates' },
        { name: 'Crime & Safety', description: 'Crime reports and public safety news', query: 'crime safety police security' },
        { name: 'Human Interest', description: 'Inspiring stories and human experiences', query: 'human interest inspiring stories' }
      ]
    },
    { 
      id: 'business', 
      name: 'Business', 
      color: 'bg-green-100 text-green-800',
      subcategories: [
        { name: 'Stock Market', description: 'Stock prices, market trends, and trading', query: 'stock market trading NYSE NASDAQ' },
        { name: 'Cryptocurrency', description: 'Bitcoin, blockchain, and digital currencies', query: 'cryptocurrency bitcoin blockchain crypto' },
        { name: 'Startups', description: 'Startup news, funding, and entrepreneurship', query: 'startups funding venture capital entrepreneurship' },
        { name: 'Corporate News', description: 'Company announcements and business deals', query: 'corporate news company announcements mergers' },
        { name: 'Economy', description: 'Economic indicators and financial analysis', query: 'economy GDP inflation economic indicators' },
        { name: 'Real Estate', description: 'Property market and real estate trends', query: 'real estate property market housing' },
        { name: 'Banking & Finance', description: 'Banking sector and financial services', query: 'banking finance financial services loans' },
        { name: 'Retail & Commerce', description: 'Retail industry and e-commerce trends', query: 'retail commerce shopping e-commerce' }
      ]
    },
    { 
      id: 'technology', 
      name: 'Technology', 
      color: 'bg-blue-100 text-blue-800',
      subcategories: [
        { name: 'Artificial Intelligence', description: 'AI, machine learning, and automation', query: 'artificial intelligence AI machine learning' },
        { name: 'Software Development', description: 'Programming, coding, and software tools', query: 'software development programming coding' },
        { name: 'Mobile Technology', description: 'Smartphones, apps, and mobile innovation', query: 'mobile technology smartphones apps iOS Android' },
        { name: 'Cybersecurity', description: 'Data security, privacy, and cyber threats', query: 'cybersecurity data security privacy hacking' },
        { name: 'Cloud Computing', description: 'Cloud services and infrastructure', query: 'cloud computing AWS Azure Google Cloud' },
        { name: 'Gaming', description: 'Video games, esports, and gaming industry', query: 'gaming video games esports gaming industry' },
        { name: 'Hardware', description: 'Computer hardware and electronic devices', query: 'computer hardware electronics processors' },
        { name: 'Internet & Web', description: 'Web technologies and internet trends', query: 'internet web technology browsers websites' },
        { name: 'Social Media', description: 'Social platforms and digital communication', query: 'social media Facebook Twitter Instagram' },
        { name: 'Emerging Tech', description: 'VR, AR, IoT, and cutting-edge technology', query: 'virtual reality augmented reality IoT emerging tech' }
      ]
    },
    { id: 'sports', name: 'Sports', subcategories: getSportsSubcategories() },
    { 
      id: 'entertainment', 
      name: 'Entertainment', 
      color: 'bg-purple-100 text-purple-800',
      subcategories: [
        { name: 'Movies', description: 'Film industry, reviews, and cinema news', query: 'movies films cinema Hollywood box office' },
        { name: 'TV Shows', description: 'Television series, streaming, and TV news', query: 'TV shows television series Netflix streaming' },
        { name: 'Music', description: 'Music industry, artists, and album releases', query: 'music artists albums concerts music industry' },
        { name: 'Celebrity News', description: 'Celebrity gossip and entertainment news', query: 'celebrity news gossip entertainment stars' },
        { name: 'Theater & Arts', description: 'Theater, performing arts, and cultural events', query: 'theater performing arts Broadway culture' },
        { name: 'Books & Literature', description: 'Publishing, authors, and literary news', query: 'books literature authors publishing bestsellers' },
        { name: 'Fashion & Style', description: 'Fashion trends, designers, and style news', query: 'fashion style designers trends runway' },
        { name: 'Gaming Entertainment', description: 'Gaming culture, streamers, and esports', query: 'gaming streamers Twitch esports gaming culture' }
      ]
    },
    { 
      id: 'health', 
      name: 'Health', 
      color: 'bg-red-100 text-red-800',
      subcategories: [
        { name: 'Medical Research', description: 'Latest medical studies and breakthroughs', query: 'medical research studies clinical trials' },
        { name: 'Mental Health', description: 'Psychology, therapy, and mental wellness', query: 'mental health psychology therapy wellness' },
        { name: 'Nutrition & Diet', description: 'Healthy eating, diets, and nutrition science', query: 'nutrition diet healthy eating food science' },
        { name: 'Fitness & Exercise', description: 'Workout routines, sports medicine, and fitness', query: 'fitness exercise workout sports medicine' },
        { name: 'Public Health', description: 'Disease prevention and community health', query: 'public health disease prevention epidemiology' },
        { name: 'Healthcare System', description: 'Healthcare policy, insurance, and access', query: 'healthcare system policy insurance medical access' },
        { name: 'Alternative Medicine', description: 'Holistic health and alternative treatments', query: 'alternative medicine holistic health natural remedies' },
        { name: 'Pharmaceuticals', description: 'Drug development and pharmaceutical news', query: 'pharmaceuticals drugs medication FDA approval' }
      ]
    },
    { 
      id: 'science', 
      name: 'Science', 
      color: 'bg-teal-100 text-teal-800',
      subcategories: [
        { name: 'Space & Astronomy', description: 'Space exploration, NASA, and cosmic discoveries', query: 'space astronomy NASA cosmic discoveries planets' },
        { name: 'Climate Science', description: 'Climate change, environmental research', query: 'climate change environmental science global warming' },
        { name: 'Biology & Medicine', description: 'Biological research and medical science', query: 'biology medical science genetics research' },
        { name: 'Physics', description: 'Physics research and quantum discoveries', query: 'physics quantum mechanics particle physics' },
        { name: 'Chemistry', description: 'Chemical research and materials science', query: 'chemistry materials science chemical research' },
        { name: 'Earth Sciences', description: 'Geology, oceanography, and earth studies', query: 'geology oceanography earth sciences seismology' },
        { name: 'Energy & Environment', description: 'Renewable energy and environmental tech', query: 'renewable energy solar wind environmental technology' },
        { name: 'Archaeology', description: 'Archaeological discoveries and ancient history', query: 'archaeology ancient history discoveries artifacts' }
      ]
    },
    { 
      id: 'politics', 
      name: 'Politics', 
      color: 'bg-indigo-100 text-indigo-800',
      subcategories: [
        { name: 'Elections', description: 'Voting, campaigns, and electoral processes', query: 'elections voting campaigns political candidates' },
        { name: 'Government Policy', description: 'Laws, regulations, and policy changes', query: 'government policy laws regulations legislation' },
        { name: 'International Relations', description: 'Diplomacy, treaties, and global politics', query: 'international relations diplomacy foreign policy' },
        { name: 'Local Government', description: 'City councils, mayors, and local politics', query: 'local government city council mayors municipal' },
        { name: 'Political Analysis', description: 'Opinion polls, political commentary', query: 'political analysis polls commentary opinion' },
        { name: 'Supreme Court', description: 'Court decisions and judicial news', query: 'Supreme Court judicial decisions legal rulings' },
        { name: 'Immigration', description: 'Immigration policy and border issues', query: 'immigration policy border security citizenship' },
        { name: 'Civil Rights', description: 'Human rights, equality, and social justice', query: 'civil rights human rights equality social justice' }
      ]
    }
  ];
};

// Sports subcategories
export const getSportsSubcategories = (): Category[] => {
  return [
    { name: 'NFL Football', description: 'National Football League news and scores', query: 'NFL football American football Super Bowl' },
    { name: 'College Football', description: 'NCAA football and college sports', query: 'college football NCAA university sports' },
    { name: 'NBA Basketball', description: 'Professional basketball league', query: 'NBA basketball professional league playoffs' },
    { name: 'College Basketball', description: 'NCAA basketball and March Madness', query: 'college basketball NCAA March Madness tournament' },
    { name: 'MLB Baseball', description: 'Major League Baseball news and scores', query: 'MLB baseball World Series major league' },
    { name: 'Soccer/Football', description: 'International football and leagues', query: 'soccer football FIFA World Cup Premier League' },
    { name: 'Tennis', description: 'Professional tennis tournaments', query: 'tennis Wimbledon US Open Grand Slam' },
    { name: 'Golf', description: 'Professional golf tournaments and PGA', query: 'golf PGA Masters tournament professional' },
    { name: 'NHL Hockey', description: 'National Hockey League', query: 'NHL hockey ice hockey Stanley Cup' },
    { name: 'Olympics', description: 'Olympic Games and international competition', query: 'Olympics Olympic Games international sports' },
    { name: 'MMA & Boxing', description: 'Mixed martial arts and boxing', query: 'MMA UFC boxing martial arts fighting' },
    { name: 'Motor Sports', description: 'Formula 1, NASCAR, and racing', query: 'Formula 1 NASCAR racing motor sports' },
    { name: 'Esports', description: 'Competitive gaming and esports tournaments', query: 'esports competitive gaming tournaments' }
  ];
};

// Search articles across all available sources - RESTORED ORIGINAL FUNCTIONALITY
export const searchArticles = async (
  query: string,
  filters: SearchFilters = {},
  searchContext: 'user_typed' | 'trending_click' | 'category_click' = 'user_typed'
): Promise<Article[]> => {
  const results: Article[] = [];
  const enabledAPIs = getEnabledAPISources();
  
  try {
    // Try to enhance search with ChatGPT first
    try {
      const enhancedSearch = await enhanceSearchWithChatGPT(query, shouldUseGoogleSearch(query, searchContext));
      if (enhancedSearch.isEnhanced) {
        return enhancedSearch.results;
      }
    } catch (error) {
      console.warn('ChatGPT enhancement failed, continuing with regular search:', error);
      // Continue with regular search if ChatGPT enhancement fails
    }

    // For user-typed searches, try Google first
    if (searchContext === 'user_typed' && shouldUseGoogleSearch(query, searchContext) && enabledAPIs.includes('google-search')) {
      try {
        const googleResults = await searchGoogleForArticles(query, false);
        if (googleResults.length > 0) {
          return googleResults; // Return Google results if successful
        }
      } catch (error) {
        console.warn('Google search failed, falling back to internal sources:', error);
        // Continue with internal search as fallback
      }
    }

    // Normalize query for better matching
    const normalizedQuery = query.toLowerCase().trim();
    const queryWords = normalizedQuery.split(/\s+/).filter(word => word.length > 2);
    
    // Check for breaking news queries first
    if (normalizedQuery.includes('breaking') || normalizedQuery.includes('urgent') || 
        normalizedQuery.includes('latest news') || normalizedQuery.includes('developing')) {
      // Get today's auto-updated breaking news
      const todaysBreakingNews = await getTodaysBreakingNews();
      const breakingNewsResults = todaysBreakingNews.length > 0 ? todaysBreakingNews : generateBreakingNews(query);
      results.push(...breakingNewsResults);
    }
    
    // Search through news APIs
    const newsResults = await Promise.allSettled([
      newsAPIs.searchNews(query, filters),
      categoryAPIs.searchByCategory(filters.category || 'general', query),
    ]);

    // Process news results
    newsResults.forEach((result) => {
      if (result.status === 'fulfilled' && result.value) {
        results.push(...result.value);
      }
    });

    // Search sports if category is sports-related
    if (filters.category === 'sports' || 
        queryWords.some(word => ['sport', 'sports', 'football', 'basketball', 'baseball', 'soccer', 'tennis', 'golf', 'hockey', 'nfl', 'nba', 'mlb'].includes(word))) {
      try {
        const sportsResults = await searchSportsAPIs(query, filters);
        if (sportsResults) {
          results.push(...sportsResults);
        }
      } catch (error) {
        console.warn('Sports API search failed:', error);
      }
    }

    // Search additional sources
    try {
      const additionalResults = await searchAdditionalAPIs(query);
      if (additionalResults) {
        results.push(...additionalResults);
      }
    } catch (error) {
      console.warn('Additional API search failed:', error);
    }

    // Search enhanced APIs for comprehensive coverage
    try {
      const enhancedResults = await searchEnhancedAPIs(query);
      if (enhancedResults) {
        results.push(...enhancedResults);
      }
    } catch (error) {
      console.warn('Enhanced API search failed:', error);
    }

    // Search mega APIs for comprehensive coverage
    try {
      const megaResults = await searchMegaAPIs(query);
      if (megaResults) {
        results.push(...megaResults);
      }
    } catch (error) {
      console.warn('Mega API search failed:', error);
    }

    // Search major news outlets for comprehensive political coverage
    try {
      const majorNewsResults = await searchMajorNewsAPIs(query);
      if (majorNewsResults) {
        results.push(...majorNewsResults);
      }
    } catch (error) {
      console.warn('Major news API search failed:', error);
    }

    // Search local news if user has location enabled
    try {
      const userLocation = getSavedLocation();
      if (userLocation) {
        const localResults = await searchAllLocalNews(query, userLocation);
        if (localResults) {
          results.push(...localResults);
        }
      }
    } catch (error) {
      console.warn('Local news search failed:', error);
    }

    // Always add some fallback results to ensure content is available
    if (results.length < 5) {
      const fallbackResults = generateFallbackResults(query, filters);
      results.push(...fallbackResults);
    }

    // Filter by enabled APIs, remove duplicates, and sort by relevance/date
    const filteredResults = filterSearchResultsByEnabledAPIs(results, enabledAPIs);
    const uniqueResults = removeDuplicateArticles(filteredResults);
    return sortArticlesByRelevance(uniqueResults, query);

  } catch (error) {
    console.error('Error searching articles:', error);
    // Return fallback results even if there's an error
    const fallbackResults = generateFallbackResults(query, filters);
    return filterSearchResultsByEnabledAPIs(fallbackResults, enabledAPIs);
  }
};

// Generate fallback results when APIs fail or return no results
const generateFallbackResults = (query: string, filters: SearchFilters = {}): Article[] => {
  const currentCategory = filters.category || 'general';
  const normalizedQuery = query.toLowerCase().trim();
  const queryWords = normalizedQuery.split(/\s+/).filter(word => word.length > 2);
  
  // Create more relevant fallback content based on keywords
  const getRelevantContent = (baseContent: string): string => {
    let content = baseContent;
    
    // Add keyword-specific context
    if (queryWords.some(word => ['technology', 'tech', 'ai', 'artificial', 'intelligence', 'software', 'digital'].includes(word))) {
      content += ` The technology sector continues to evolve rapidly with innovations in artificial intelligence, software development, and digital transformation affecting various industries.`;
    }
    
    if (queryWords.some(word => ['business', 'market', 'economy', 'finance', 'investment', 'company', 'corporate'].includes(word))) {
      content += ` Market analysts are closely monitoring economic indicators and business developments that could impact investment strategies and corporate decision-making.`;
    }
    
    if (queryWords.some(word => ['health', 'medical', 'healthcare', 'medicine', 'treatment', 'research'].includes(word))) {
      content += ` Healthcare professionals and medical researchers are advancing our understanding of treatment options and preventive care measures.`;
    }
    
    if (queryWords.some(word => ['politics', 'government', 'policy', 'election', 'political', 'congress', 'senate'].includes(word))) {
      content += ` Political analysts and government officials are discussing policy implications and potential legislative changes that could affect various sectors.`;
    }
    
    if (queryWords.some(word => ['climate', 'environment', 'energy', 'renewable', 'sustainability', 'green'].includes(word))) {
      content += ` Environmental scientists and policy makers are working on sustainable solutions and renewable energy initiatives to address climate challenges.`;
    }
    
    return content;
  };
  
  // Generate 8-12 diverse fallback results to ensure good content variety
  const fallbackResults: Article[] = [
    {
      id: `fallback-${Date.now()}-1`,
      title: `${query}: Breaking News and Latest Updates`,
      content: getRelevantContent(`Recent developments in ${query} have captured significant attention from news outlets and industry experts. Multiple sources are reporting on the evolving situation, with new information emerging throughout the day. The story continues to develop as stakeholders respond to the latest developments. Expert analysis suggests this topic will have important implications for various sectors and communities.`),
      source: 'News Aggregator',
      url: 'https://news.example.com/',
      publishedAt: new Date().toISOString()
    },
    {
      id: `fallback-${Date.now()}-2`,
      title: `Expert Analysis: Understanding ${query}`,
      content: getRelevantContent(`Industry experts and analysts have provided comprehensive insights into ${query}, examining both current implications and future prospects. The analysis draws from multiple data sources and expert opinions to provide a balanced perspective. Key stakeholders have shared their views on the potential impact and significance of recent developments.`),
      source: 'Expert Analysis',
      url: 'https://analysis.example.com/',
      publishedAt: new Date().toISOString()
    },
    {
      id: `fallback-${Date.now()}-3`,
      title: `${query}: Global Perspective and International Coverage`,
      content: getRelevantContent(`International news outlets and foreign correspondents have provided global perspective on ${query}, highlighting how different regions and countries are responding to recent developments. The international coverage reveals diverse approaches and varying levels of impact across different markets and communities.`),
      source: 'International News',
      url: 'https://international.example.com/',
      publishedAt: new Date().toISOString()
    },
    {
      id: `fallback-${Date.now()}-4`,
      title: `${query}: Industry Impact and Market Response`,
      content: getRelevantContent(`Industry leaders and market analysts are evaluating the impact of ${query} on various sectors and business operations. The market response has been mixed, with some sectors showing resilience while others adapt to changing conditions. Economic indicators suggest continued monitoring will be necessary.`),
      source: 'Market Watch',
      url: 'https://market.example.com/',
      publishedAt: new Date().toISOString()
    },
    {
      id: `fallback-${Date.now()}-5`,
      title: `Research Findings: ${query} Scientific Study`,
      content: getRelevantContent(`Recent scientific research has provided new insights into ${query}, with peer-reviewed studies offering evidence-based analysis. Researchers from leading institutions have collaborated to examine various aspects and implications. The findings contribute to our understanding of this important topic.`),
      source: 'Research Journal',
      url: 'https://research.example.com/',
      publishedAt: new Date().toISOString()
    },
    {
      id: `fallback-${Date.now()}-6`,
      title: `${query}: Community Response and Public Opinion`,
      content: getRelevantContent(`Community leaders and public opinion surveys reveal diverse perspectives on ${query}. Social media discussions and public forums show varying levels of support and concern. Community organizations are working to address questions and provide information to residents.`),
      source: 'Community News',
      url: 'https://community.example.com/',
      publishedAt: new Date().toISOString()
    },
    {
      id: `fallback-${Date.now()}-7`,
      title: `Future Outlook: ${query} Predictions and Trends`,
      content: getRelevantContent(`Futurists and trend analysts are examining the long-term implications of ${query}, providing predictions about future developments. The analysis considers multiple scenarios and potential outcomes. Industry forecasts suggest significant changes may be ahead.`),
      source: 'Future Trends',
      url: 'https://trends.example.com/',
      publishedAt: new Date().toISOString()
    },
    {
      id: `fallback-${Date.now()}-8`,
      title: `${query}: Historical Context and Comparison`,
      content: getRelevantContent(`Historical analysis provides important context for understanding ${query}, with comparisons to similar events and developments from the past. Historians and researchers have identified patterns and lessons that may inform current decision-making.`),
      source: 'Historical Analysis',
      url: 'https://history.example.com/',
      publishedAt: new Date().toISOString()
    }
  ];

  // Add category-specific fallback content
  if (currentCategory === 'technology') {
    fallbackResults.push({
      id: `fallback-tech-${Date.now()}`,
      title: `Technology Innovation: ${query} Developments`,
      content: getRelevantContent(`The technology sector is experiencing significant developments related to ${query}, with major tech companies and startups investing in research and development. Innovation in this area is expected to drive new applications and use cases across various industries. Technical experts are optimistic about the potential for breakthrough solutions and transformative applications.`),
      source: 'Tech Innovation',
      url: 'https://tech.example.com/',
      publishedAt: new Date().toISOString()
    });
  }

  if (currentCategory === 'business') {
    fallbackResults.push({
      id: `fallback-business-${Date.now()}`,
      title: `Business Impact: ${query} Market Analysis`,
      content: getRelevantContent(`Market analysts are closely monitoring the business implications of ${query}, with early indicators suggesting significant potential for growth and investment opportunities. Industry leaders are adapting their strategies to capitalize on emerging trends and market dynamics. Economic experts predict continued evolution in this sector with substantial business implications.`),
      source: 'Business Analysis',
      url: 'https://business.example.com/',
      publishedAt: new Date().toISOString()
    });
  }

  // Add keyword-specific articles
  if (queryWords.some(word => ['sports', 'football', 'basketball', 'baseball', 'soccer', 'tennis', 'nfl', 'nba'].includes(word))) {
    fallbackResults.push({
      id: `fallback-sports-${Date.now()}`,
      title: `Sports Update: ${query} Latest News`,
      content: getRelevantContent(`Sports analysts and commentators are covering the latest developments in ${query}, providing insights into player performances, team strategies, and upcoming competitions. Fans and experts are discussing the implications for the current season and future prospects.`),
      source: 'Sports News',
      url: 'https://sports.example.com/',
      publishedAt: new Date().toISOString()
    });
  }

  if (queryWords.some(word => ['entertainment', 'movie', 'film', 'music', 'celebrity', 'hollywood'].includes(word))) {
    fallbackResults.push({
      id: `fallback-entertainment-${Date.now()}`,
      title: `Entertainment News: ${query} Updates`,
      content: getRelevantContent(`Entertainment industry insiders and critics are discussing the latest developments in ${query}, covering new releases, industry trends, and celebrity news. The entertainment sector continues to evolve with changing audience preferences and technological innovations.`),
      source: 'Entertainment News',
      url: 'https://entertainment.example.com/',
      publishedAt: new Date().toISOString()
    });
  }
  
  return fallbackResults;
};

// Get related viewpoints for a given topic
export const getRelatedViewpoints = async (topic: string): Promise<Article[]> => {
  try {
    const viewpointQueries = [
      `${topic} opinion`,
      `${topic} analysis`,
      `${topic} perspective`,
      `${topic} debate`,
    ];

    const viewpointResults = await Promise.allSettled(
      viewpointQueries.map(query => searchArticles(query, { limit: 5 }))
    );

    const allViewpoints: Article[] = [];
    viewpointResults.forEach((result) => {
      if (result.status === 'fulfilled') {
        allViewpoints.push(...result.value);
      }
    });

    return removeDuplicateArticles(allViewpoints).slice(0, 10);
  } catch (error) {
    console.error('Error getting related viewpoints:', error);
    return [];
  }
};

// Get trending topics
export const getTrendingTopics = async (): Promise<string[]> => {
  try {
    // Get today's auto-updated trending topics
    const todaysTrending = await getTodaysTrendingTopics();
    if (todaysTrending.length > 0) {
      return todaysTrending;
    }
  } catch (error) {
    console.warn('Failed to get daily trending topics:', error);
  }
  
  // Fallback to static trending topics
  return [
    'Breaking News Today',
    'Urgent Updates',
    'Latest Developments',
    'Technology Updates',
    'Sports Highlights',
    'Market Analysis',
    'Health & Wellness',
    'Climate Change',
    'Entertainment News',
    'Political Updates',
    'International News',
    'Science Breakthroughs'
  ];
};

// Get suggested search queries
export const getSuggestedQueries = (): string[] => {
  return [
    'artificial intelligence trends',
    'climate change solutions',
    'cryptocurrency market analysis',
    'remote work productivity',
    'sustainable energy innovations',
    'mental health awareness',
    'space exploration updates',
    'electric vehicle adoption'
  ];
};

// Helper function to remove duplicate articles
const removeDuplicateArticles = (articles: Article[]): Article[] => {
  const seen = new Set<string>();
  return articles.filter(article => {
    const key = `${article.title}-${article.source}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
};

// Helper function to sort articles by relevance and date
const sortArticlesByRelevance = (articles: Article[], query: string): Article[] => {
  const normalizedQuery = query.toLowerCase().trim();
  const queryWords = normalizedQuery.split(/\s+/).filter(word => word.length > 2);
  
  return articles.sort((a, b) => {
    // First, sort by relevance (title/content match)
    const aRelevance = calculateRelevance(a, query);
    const bRelevance = calculateRelevance(b, query);
    
    if (aRelevance !== bRelevance) {
      return bRelevance - aRelevance;
    }

    // Then by date (newer first)
    const aDate = new Date(a.publishedAt || 0).getTime();
    const bDate = new Date(b.publishedAt || 0).getTime();
    return bDate - aDate;
  });
};

// Helper function to calculate article relevance to query
const calculateRelevance = (article: Article, query: string): number => {
  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(/\s+/).filter(word => word.length > 2);
  const titleLower = article.title.toLowerCase();
  const contentLower = article.content.toLowerCase();
  const sourceLower = (article.source || '').toLowerCase();
  
  let score = 0;
  
  // Exact phrase matches (highest score)
  if (titleLower.includes(queryLower)) {
    score += 20;
  }
  
  if (contentLower.includes(queryLower)) {
    score += 15;
  }
  
  // Individual word matches
  queryWords.forEach(word => {
    if (titleLower.includes(word)) {
      score += 8;
    }
    if (contentLower.includes(word)) {
      score += 4;
    }
    if (sourceLower.includes(word)) {
      score += 1;
    }
  });
  
  // Boost score for high-quality sources
  const qualitySources = ['reuters', 'associated press', 'bbc', 'npr', 'guardian', 'new york times', 'washington post'];
  if (qualitySources.some(source => sourceLower.includes(source))) {
    score += 3;
  }
  
  // Boost score for recent articles
  if (article.publishedAt) {
    const publishedDate = new Date(article.publishedAt);
    const daysSincePublished = (Date.now() - publishedDate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSincePublished < 1) score += 2;
    else if (daysSincePublished < 7) score += 1;
  }
  
  return score;
};