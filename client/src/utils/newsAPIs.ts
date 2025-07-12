// Free News APIs integration
import { SearchResult } from '../types';
import { getEnabledAPISources } from './apiFilters';

// NewsAPI.org (Free tier: 1000 requests/month)
const searchNewsAPI = async (query: string): Promise<SearchResult[]> => {
  try {
    const NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY;
    
    console.log('NewsAPI Key check:', NEWS_API_KEY ? 'Found' : 'Missing');
    
    if (!NEWS_API_KEY || NEWS_API_KEY === 'your-news-api-key-here' || NEWS_API_KEY.length < 10) {
      console.log('No NewsAPI key found, trying free sources');
      return searchFreeNewsSources(query);
    }

    // Real NewsAPI call with proper headers and error handling
    const response = await fetch(`https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=en&sortBy=publishedAt&pageSize=10&apiKey=${NEWS_API_KEY}`, {
      method: 'GET',
      headers: {
        'User-Agent': 'NewsApp/1.0',
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`NewsAPI error: ${response.status} - ${errorText}`);
      throw new Error(`NewsAPI error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Check for API-specific errors
    if (data.status === 'error') {
      console.error('NewsAPI returned error:', data.message);
      throw new Error(`NewsAPI error: ${data.message}`);
    }
    
    const results: SearchResult[] = [];
    
    if (data.articles && data.articles.length > 0) {
      data.articles.forEach((article: any, index: number) => {
        if (article.title && article.description && article.content) {
          results.push({
            id: `newsapi-${index}`,
            title: article.title,
            description: article.description,
            content: article.content || article.description,
            url: article.url,
            source: article.source?.name || 'NewsAPI',
            publishedAt: article.publishedAt,
            author: article.author || 'News Staff',
            viewpoint: 'neutral',
            keywords: ['news', 'current events', query.toLowerCase()]
          });
        }
      });
    }

    return results;
  } catch (error) {
    console.error('NewsAPI error:', error);
    return searchFreeNewsSources(query);
  }
};

// Enhanced search using free news sources and APIs
const searchFreeNewsSources = async (query: string): Promise<SearchResult[]> => {
  try {
    const results: SearchResult[] = [];
    
    // Search multiple sources in parallel for better performance
    const searchPromises = [
      searchBBCNews(query),
      searchCNNNews(query),
      searchNPRNews(query),
      searchGuardianNews(query),
      searchReutersNews(query),
      searchAPNews(query)
    ];
    
    // Execute all searches in parallel and collect results
    const searchResults = await Promise.allSettled(searchPromises);
    
    searchResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        results.push(...result.value);
      } else {
        const sources = ['BBC', 'CNN', 'NPR', 'Guardian', 'Reuters', 'AP'];
        console.warn(`${sources[index]} feed error:`, result.reason);
      }
    });
    
    // Filter out sources with no results and ensure query relevance
    const filteredResults = results.filter(result => {
      const hasContent = result.title && result.content && result.description;
      
      // Enhanced relevance checking - split query into individual terms
      const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 2);
      const titleLower = result.title.toLowerCase();
      const descriptionLower = result.description.toLowerCase();
      
      // Check if ANY search term appears in title or description
      const isRelevant = searchTerms.some(term => 
        titleLower.includes(term) || descriptionLower.includes(term)
      ) || titleLower.includes(query.toLowerCase()) || descriptionLower.includes(query.toLowerCase());
      
      return hasContent && isRelevant;
    });
    
    console.log(`Found ${filteredResults.length} relevant articles from free sources for "${query}"`);
    
    // Add debugging info to show which sources returned results
    const sourceBreakdown = filteredResults.reduce((acc, result) => {
      acc[result.source] = (acc[result.source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log('Articles by source:', sourceBreakdown);
    return filteredResults;
  } catch (error) {
    console.error('Free news sources search failed:', error);
    return [];
  }
};

// Search BBC News using their RSS feeds
const searchBBCNews = async (query: string): Promise<SearchResult[]> => {
  try {
    const results: SearchResult[] = [];
    const feeds = [
      'https://feeds.bbci.co.uk/news/rss.xml',
      'https://feeds.bbci.co.uk/news/technology/rss.xml',
      'https://feeds.bbci.co.uk/news/business/rss.xml',
      'https://feeds.bbci.co.uk/news/world/rss.xml'
    ];
    
    for (const feedUrl of feeds) {
      try {
        const response = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(feedUrl)}`);
        const xmlText = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
        const items = xmlDoc.querySelectorAll('item');
        
        items.forEach((item, index) => {
          const title = item.querySelector('title')?.textContent || '';
          const description = item.querySelector('description')?.textContent || '';
          const link = item.querySelector('link')?.textContent || '';
          const pubDate = item.querySelector('pubDate')?.textContent || '';
          
          // Check if keyword appears anywhere in title, description, or content
          const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 2);
          const titleLower = title.toLowerCase();
          const descriptionLower = description.toLowerCase();
          
          const isRelevant = searchTerms.some(term => 
            titleLower.includes(term) || descriptionLower.includes(term)
          ) || titleLower.includes(query.toLowerCase()) || descriptionLower.includes(query.toLowerCase());
          
          if (isRelevant) {
            results.push({
              id: `bbc-${Date.now()}-${index}`,
              title: title,
              description: description,
              content: description,
              url: link,
              source: 'BBC News',
              publishedAt: pubDate,
              author: 'BBC News',
              viewpoint: 'neutral'
            });
          }
        });
      } catch (error) {
        console.error('BBC feed error:', error);
      }
    }
    
    return results;
  } catch (error) {
    console.error('BBC search failed:', error);
    return [];
  }
};

// Search CNN News using their RSS feeds
const searchCNNNews = async (query: string): Promise<SearchResult[]> => {
  try {
    const results: SearchResult[] = [];
    const feeds = [
      'http://rss.cnn.com/rss/cnn_topstories.rss',
      'http://rss.cnn.com/rss/edition_technology.rss',
      'http://rss.cnn.com/rss/money_latest.rss',
      'http://rss.cnn.com/rss/edition_world.rss'
    ];
    
    for (const feedUrl of feeds) {
      try {
        const response = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(feedUrl)}`);
        const xmlText = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
        const items = xmlDoc.querySelectorAll('item');
        
        items.forEach((item, index) => {
          const title = item.querySelector('title')?.textContent || '';
          const description = item.querySelector('description')?.textContent || '';
          const link = item.querySelector('link')?.textContent || '';
          const pubDate = item.querySelector('pubDate')?.textContent || '';
          
          // Check if keyword appears anywhere in title, description, or content
          const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 2);
          const titleLower = title.toLowerCase();
          const descriptionLower = description.toLowerCase();
          
          const isRelevant = searchTerms.some(term => 
            titleLower.includes(term) || descriptionLower.includes(term)
          ) || titleLower.includes(query.toLowerCase()) || descriptionLower.includes(query.toLowerCase());
          
          if (isRelevant) {
            results.push({
              id: `cnn-${Date.now()}-${index}`,
              title: title,
              description: description,
              content: description,
              url: link,
              source: 'CNN',
              publishedAt: pubDate,
              author: 'CNN News',
              viewpoint: 'neutral'
            });
          }
        });
      } catch (error) {
        console.error('CNN feed error:', error);
      }
    }
    
    return results;
  } catch (error) {
    console.error('CNN search failed:', error);
    return [];
  }
};

// Search NPR News
const searchNPRNews = async (query: string): Promise<SearchResult[]> => {
  try {
    const results: SearchResult[] = [];
    const feeds = [
      'https://feeds.npr.org/1001/rss.xml',
      'https://feeds.npr.org/1006/rss.xml',
      'https://feeds.npr.org/1003/rss.xml'
    ];
    
    for (const feedUrl of feeds) {
      try {
        const response = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(feedUrl)}`);
        const xmlText = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
        const items = xmlDoc.querySelectorAll('item');
        
        items.forEach((item, index) => {
          const title = item.querySelector('title')?.textContent || '';
          const description = item.querySelector('description')?.textContent || '';
          const link = item.querySelector('link')?.textContent || '';
          const pubDate = item.querySelector('pubDate')?.textContent || '';
          
          // Check if keyword appears anywhere in title, description, or content
          const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 2);
          const titleLower = title.toLowerCase();
          const descriptionLower = description.toLowerCase();
          
          const isRelevant = searchTerms.some(term => 
            titleLower.includes(term) || descriptionLower.includes(term)
          ) || titleLower.includes(query.toLowerCase()) || descriptionLower.includes(query.toLowerCase());
          
          if (isRelevant) {
            results.push({
              id: `npr-${Date.now()}-${index}`,
              title: title,
              description: description,
              content: description,
              url: link,
              source: 'NPR',
              publishedAt: pubDate,
              author: 'NPR',
              viewpoint: 'neutral'
            });
          }
        });
      } catch (error) {
        console.error('NPR feed error:', error);
      }
    }
    
    return results;
  } catch (error) {
    console.error('NPR search failed:', error);
    return [];
  }
};

// Search The Guardian News
const searchGuardianNews = async (query: string): Promise<SearchResult[]> => {
  try {
    const results: SearchResult[] = [];
    const feeds = [
      'https://www.theguardian.com/world/rss',
      'https://www.theguardian.com/technology/rss',
      'https://www.theguardian.com/business/rss',
      'https://www.theguardian.com/us-news/rss'
    ];
    
    for (const feedUrl of feeds) {
      try {
        const response = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(feedUrl)}`);
        const xmlText = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
        const items = xmlDoc.querySelectorAll('item');
        
        items.forEach((item, index) => {
          const title = item.querySelector('title')?.textContent || '';
          const description = item.querySelector('description')?.textContent || '';
          const link = item.querySelector('link')?.textContent || '';
          const pubDate = item.querySelector('pubDate')?.textContent || '';
          
          // Check if keyword appears anywhere in title, description, or content
          const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 2);
          const titleLower = title.toLowerCase();
          const descriptionLower = description.toLowerCase();
          
          const isRelevant = searchTerms.some(term => 
            titleLower.includes(term) || descriptionLower.includes(term)
          ) || titleLower.includes(query.toLowerCase()) || descriptionLower.includes(query.toLowerCase());
          
          if (isRelevant) {
            results.push({
              id: `guardian-${Date.now()}-${index}`,
              title: title,
              description: description,
              content: description,
              url: link,
              source: 'The Guardian',
              publishedAt: pubDate,
              author: 'The Guardian',
              viewpoint: 'neutral'
            });
          }
        });
      } catch (error) {
        console.error('Guardian feed error:', error);
      }
    }
    
    return results;
  } catch (error) {
    console.error('Guardian search failed:', error);
    return [];
  }
};

// Reuters News RSS
const searchReutersNews = async (query: string): Promise<SearchResult[]> => {
  try {
    const results: SearchResult[] = [];
    const feeds = [
      'https://feeds.reuters.com/reuters/topNews',
      'https://feeds.reuters.com/reuters/businessNews',
      'https://feeds.reuters.com/reuters/technologyNews'
    ];
    
    for (const feedUrl of feeds) {
      try {
        const response = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(feedUrl)}`, {
          headers: {
            'User-Agent': 'NewsApp/1.0',
            'Accept': 'application/rss+xml, application/xml, text/xml',
          },
        });
        
        if (!response.ok) continue;
        
        const xmlText = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
        const items = xmlDoc.querySelectorAll('item');
        
        Array.from(items).forEach((item, index) => {
          if (results.length >= 10) return;
          
          const title = item.querySelector('title')?.textContent || '';
          const description = item.querySelector('description')?.textContent || '';
          const link = item.querySelector('link')?.textContent || '';
          const pubDate = item.querySelector('pubDate')?.textContent || '';
          
          if (title && description && (title.toLowerCase().includes(query.toLowerCase()) || description.toLowerCase().includes(query.toLowerCase()))) {
            results.push({
              id: `reuters-${index}-${Date.now()}`,
              title: title,
              description: description,
              content: description,
              url: link,
              source: 'Reuters',
              publishedAt: pubDate,
              author: 'Reuters',
              viewpoint: 'neutral'
            });
          }
        });
      } catch (error) {
        console.error('Reuters feed error:', error);
      }
    }
    
    return results;
  } catch (error) {
    console.error('Reuters search failed:', error);
    return [];
  }
};

// Associated Press News RSS  
const searchAPNews = async (query: string): Promise<SearchResult[]> => {
  try {
    const results: SearchResult[] = [];
    const feeds = [
      'https://feeds.apnews.com/rss/apf-topnews',
      'https://feeds.apnews.com/rss/apf-usnews',
      'https://feeds.apnews.com/rss/apf-business'
    ];
    
    for (const feedUrl of feeds) {
      try {
        const response = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(feedUrl)}`, {
          headers: {
            'User-Agent': 'NewsApp/1.0',
            'Accept': 'application/rss+xml, application/xml, text/xml',
          },
        });
        
        if (!response.ok) continue;
        
        const xmlText = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
        const items = xmlDoc.querySelectorAll('item');
        
        Array.from(items).forEach((item, index) => {
          if (results.length >= 10) return;
          
          const title = item.querySelector('title')?.textContent || '';
          const description = item.querySelector('description')?.textContent || '';
          const link = item.querySelector('link')?.textContent || '';
          const pubDate = item.querySelector('pubDate')?.textContent || '';
          
          if (title && description && (title.toLowerCase().includes(query.toLowerCase()) || description.toLowerCase().includes(query.toLowerCase()))) {
            results.push({
              id: `ap-${index}-${Date.now()}`,
              title: title,
              description: description,
              content: description,
              url: link,
              source: 'Associated Press',
              publishedAt: pubDate,
              author: 'AP',
              viewpoint: 'neutral'
            });
          }
        });
      } catch (error) {
        console.error('AP feed error:', error);
      }
    }
    
    return results;
  } catch (error) {
    console.error('AP search failed:', error);
    return [];
  }
};

// Function to get real news from various sources
const getRealNewsFromSources = async (query: string): Promise<SearchResult[]> => {
  console.log('Fetching real news from available sources...');
  
  const realResults: SearchResult[] = [];
  
  // Try searching free news sources
  try {
    const freeResults = await searchFreeNewsSources(query);
    realResults.push(...freeResults);
  } catch (error) {
    console.error('Error fetching free news sources:', error);
  }
  
  // If no real results found, return empty array (no fallback content)
  if (realResults.length === 0) {
    console.log('No real news articles found. Please check your API keys or internet connection.');
    return [];
  }
  
  return realResults;
};

// Guardian API (Free with registration)
const searchGuardianAPI = async (query: string): Promise<SearchResult[]> => {
  try {
    // Guardian API endpoint (requires API key for production)
    // For demo, we'll simulate Guardian-style content
    const mockGuardianResults: SearchResult[] = [
      {
        id: 'guardian-1',
        title: `${query}: A Guardian Investigation`,
        description: `Investigative journalism exploring the complexities and implications of ${query}.`,
        content: `The Guardian's investigation into ${query} reveals important insights and raises critical questions about current practices and future implications. Our reporters have examined multiple sources and expert opinions.`,
        url: 'https://www.theguardian.com/',
        source: 'The Guardian',
        publishedAt: new Date().toISOString(),
        author: 'Guardian Reporters',
        viewpoint: 'investigative',
        keywords: ['journalism', 'investigation', 'guardian', query.toLowerCase()]
      },
      {
        id: 'guardian-2',
        title: `Opinion: Why ${query} Matters for Society`,
        description: `Editorial perspective on the societal implications of ${query}.`,
        content: `This editorial examines why ${query} is crucial for understanding current societal trends and future challenges. The piece argues for greater awareness and informed public discourse on this important topic.`,
        url: 'https://www.theguardian.com/',
        source: 'The Guardian',
        publishedAt: new Date().toISOString(),
        author: 'Guardian Editorial',
        viewpoint: 'opinion',
        keywords: ['opinion', 'editorial', 'society', query.toLowerCase()]
      }
    ];

    return mockGuardianResults;
  } catch (error) {
    console.error('Guardian API error:', error);
    return [];
  }
};

// Reddit API (Free)
const searchRedditAPI = async (query: string): Promise<SearchResult[]> => {
  try {
    // Reddit API for public posts
    const response = await fetch(`https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&limit=5`);
    const data = await response.json();
    
    const results: SearchResult[] = [];
    
    if (data.data && data.data.children) {
      data.data.children.forEach((post: any, index: number) => {
        const postData = post.data;
        if (postData.title && postData.selftext) {
          results.push({
            id: `reddit-${index}`,
            title: postData.title,
            description: postData.selftext.substring(0, 200) + '...',
            content: postData.selftext || postData.title,
            url: `https://reddit.com${postData.permalink}`,
            source: `Reddit - r/${postData.subreddit}`,
            publishedAt: new Date(postData.created_utc * 1000).toISOString(),
            author: postData.author,
            viewpoint: 'community',
            keywords: ['reddit', 'community discussion', postData.subreddit?.toLowerCase()]
          });
        }
      });
    }
    
    return results;
  } catch (error) {
    console.error('Reddit API error:', error);
    return [];
  }
};

// Hacker News API (Free)
const searchHackerNews = async (query: string): Promise<SearchResult[]> => {
  try {
    // Hacker News search via Algolia API
    const response = await fetch(`https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(query)}&tags=story&hitsPerPage=5`);
    const data = await response.json();
    
    const results: SearchResult[] = [];
    
    if (data.hits) {
      data.hits.forEach((hit: any, index: number) => {
        if (hit.title && hit.url) {
          results.push({
            id: `hn-${index}`,
            title: hit.title,
            description: hit.story_text?.substring(0, 200) + '...' || `Hacker News discussion about ${hit.title}`,
            content: hit.story_text || `This Hacker News post discusses ${hit.title}. The tech community has shared various perspectives and insights on this topic.`,
            url: hit.url,
            source: 'Hacker News',
            publishedAt: hit.created_at,
            author: hit.author,
            viewpoint: 'tech community',
            keywords: ['hacker news', 'technology', 'startup', 'programming']
          });
        }
      });
    }
    
    return results;
  } catch (error) {
    console.error('Hacker News API error:', error);
    return [];
  }
};

// Wikipedia API (Free)
const searchWikipediaAPI = async (query: string): Promise<SearchResult[]> => {
  try {
    // Wikipedia search API
    const searchResponse = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`);
    
    if (searchResponse.ok) {
      const data = await searchResponse.json();
      
      return [{
        id: 'wikipedia-1',
        title: data.title,
        description: data.description || data.extract?.substring(0, 200) + '...',
        content: data.extract || `Wikipedia article about ${data.title}`,
        url: data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(query)}`,
        source: 'Wikipedia',
        publishedAt: new Date().toISOString(),
        author: 'Wikipedia Contributors',
        viewpoint: 'encyclopedic',
        keywords: ['wikipedia', 'encyclopedia', 'reference', query.toLowerCase()]
      }];
    }
    
    return [];
  } catch (error) {
    console.error('Wikipedia API error:', error);
    return [];
  }
};

// Main news search function that combines all sources
const searchNewsAPIs = async (query: string): Promise<SearchResult[]> => {
  console.log(`Starting comprehensive news search for: "${query}"`);
  
  const allResults: SearchResult[] = [];
  
  // First, try NewsAPI if available
  try {
    const newsAPIResults = await searchNewsAPI(query);
    if (newsAPIResults.length > 0) {
      console.log(`NewsAPI returned ${newsAPIResults.length} results`);
      allResults.push(...newsAPIResults);
    }
  } catch (error) {
    console.error('NewsAPI search failed:', error);
  }
  
  // Then try all free news sources in parallel
  try {
    const freeSourceResults = await searchFreeNewsSources(query);
    if (freeSourceResults.length > 0) {
      console.log(`Free sources returned ${freeSourceResults.length} results`);
      allResults.push(...freeSourceResults);
    }
  } catch (error) {
    console.error('Free sources search failed:', error);
  }
  
  // Add additional API sources
  const additionalSources = [
    searchGuardianAPI,
    searchRedditAPI,
    searchHackerNews,
    searchWikipediaAPI
  ];
  
  const additionalPromises = additionalSources.map(fn => fn(query));
  const additionalResults = await Promise.allSettled(additionalPromises);
  
  additionalResults.forEach((result) => {
    if (result.status === 'fulfilled') {
      allResults.push(...result.value);
    }
  });
  
  // Remove duplicates based on title similarity
  const uniqueResults = allResults.filter((result, index, self) => 
    index === self.findIndex(r => r.title.toLowerCase() === result.title.toLowerCase())
  );
  
  console.log(`Total unique results found: ${uniqueResults.length}`);
  
  // Sort by relevance (NewsAPI results first, then others)
  return uniqueResults.sort((a, b) => {
    if (a.source === 'NewsAPI' && b.source !== 'NewsAPI') return -1;
    if (a.source !== 'NewsAPI' && b.source === 'NewsAPI') return 1;
    return 0;
  }).slice(0, 20); // Return top 20 results
};

// Export the newsAPIs object with expected methods
export const newsAPIs = {
  searchNews: searchNewsAPIs,
  getTrending: async (): Promise<SearchResult[]> => {
    // Placeholder for trending news functionality
    return [];
  }
};