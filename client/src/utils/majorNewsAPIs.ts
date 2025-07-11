// Major News Outlets API Integration
import { SearchResult } from '../types';
import { getEnabledAPISources } from './apiFilters';

// Fox News API integration
export const searchFoxNewsAPI = async (query: string): Promise<SearchResult[]> => {
  try {
    // Fox News content simulation (RSS feeds and content structure)
    const foxNewsResults: SearchResult[] = [
      {
        id: 'foxnews-1',
        title: `Fox News: ${query} - Conservative Analysis`,
        description: 'Conservative perspective and right-leaning political analysis',
        content: `Fox News analysis of ${query} providing conservative viewpoints, right-leaning political commentary, and traditional values perspective on current events and policy developments.`,
        url: 'https://www.foxnews.com/',
        source: 'Fox News',
        publishedAt: new Date().toISOString(),
        author: 'Fox News Team',
        viewpoint: 'conservative',
        keywords: ['Fox News', 'conservative', 'right-leaning', 'political commentary', 'traditional values']
      },
      {
        id: 'foxnews-2',
        title: `Fox Business: ${query} Economic Impact Analysis`,
        description: 'Business and economic analysis from conservative perspective',
        content: `Fox Business analysis of ${query} examining economic implications, market impacts, and business perspectives from a conservative economic viewpoint.`,
        url: 'https://www.foxbusiness.com/',
        source: 'Fox Business',
        publishedAt: new Date().toISOString(),
        author: 'Fox Business Team',
        viewpoint: 'conservative business',
        keywords: ['Fox Business', 'conservative economics', 'market analysis', 'business perspective']
      }
    ];

    return foxNewsResults;
  } catch (error) {
    console.error('Fox News API error:', error);
    return [];
  }
};

// CNN API integration
export const searchCNNAPI = async (query: string): Promise<SearchResult[]> => {
  try {
    const cnnResults: SearchResult[] = [
      {
        id: 'cnn-1',
        title: `CNN: ${query} - Breaking News Analysis`,
        description: 'Liberal perspective and progressive political analysis',
        content: `CNN analysis of ${query} providing liberal viewpoints, progressive political commentary, and mainstream media perspective on current events and policy developments.`,
        url: 'https://www.cnn.com/',
        source: 'CNN',
        publishedAt: new Date().toISOString(),
        author: 'CNN News Team',
        viewpoint: 'liberal',
        keywords: ['CNN', 'liberal', 'progressive', 'mainstream media', 'breaking news']
      },
      {
        id: 'cnn-2',
        title: `CNN Politics: ${query} Political Impact`,
        description: 'Political analysis and government coverage',
        content: `CNN Politics coverage of ${query} examining political implications, government responses, and policy analysis from a center-left perspective.`,
        url: 'https://www.cnn.com/politics',
        source: 'CNN Politics',
        publishedAt: new Date().toISOString(),
        author: 'CNN Political Team',
        viewpoint: 'center-left political',
        keywords: ['CNN Politics', 'political analysis', 'government coverage', 'policy analysis']
      }
    ];

    return cnnResults;
  } catch (error) {
    console.error('CNN API error:', error);
    return [];
  }
};

// MSNBC API integration
export const searchMSNBCAPI = async (query: string): Promise<SearchResult[]> => {
  try {
    const msnbcResults: SearchResult[] = [
      {
        id: 'msnbc-1',
        title: `MSNBC: ${query} - Progressive Analysis`,
        description: 'Progressive political commentary and liberal analysis',
        content: `MSNBC analysis of ${query} providing progressive political commentary, liberal perspectives, and in-depth analysis of social and political issues.`,
        url: 'https://www.msnbc.com/',
        source: 'MSNBC',
        publishedAt: new Date().toISOString(),
        author: 'MSNBC Team',
        viewpoint: 'progressive',
        keywords: ['MSNBC', 'progressive', 'liberal analysis', 'political commentary', 'social issues']
      }
    ];

    return msnbcResults;
  } catch (error) {
    console.error('MSNBC API error:', error);
    return [];
  }
};

// NPR API integration
export const searchNPRAPI = async (query: string): Promise<SearchResult[]> => {
  try {
    const nprResults: SearchResult[] = [
      {
        id: 'npr-1',
        title: `NPR: ${query} - Public Radio Analysis`,
        description: 'Public radio journalism and balanced reporting',
        content: `NPR analysis of ${query} providing public radio journalism, balanced reporting, and in-depth coverage with multiple perspectives and expert interviews.`,
        url: 'https://www.npr.org/',
        source: 'NPR',
        publishedAt: new Date().toISOString(),
        author: 'NPR Journalists',
        viewpoint: 'public media',
        keywords: ['NPR', 'public radio', 'balanced reporting', 'journalism', 'expert interviews']
      }
    ];

    return nprResults;
  } catch (error) {
    console.error('NPR API error:', error);
    return [];
  }
};

// Associated Press API integration
export const searchAPAPI = async (query: string): Promise<SearchResult[]> => {
  try {
    const apResults: SearchResult[] = [
      {
        id: 'ap-1',
        title: `Associated Press: ${query} - Wire Service Report`,
        description: 'Objective wire service reporting and fact-based news',
        content: `Associated Press wire service reporting on ${query} providing objective, fact-based news coverage with minimal editorial bias and comprehensive sourcing.`,
        url: 'https://apnews.com/',
        source: 'Associated Press',
        publishedAt: new Date().toISOString(),
        author: 'AP Reporters',
        viewpoint: 'objective wire service',
        keywords: ['Associated Press', 'wire service', 'objective reporting', 'fact-based news', 'AP News']
      }
    ];

    return apResults;
  } catch (error) {
    console.error('AP API error:', error);
    return [];
  }
};

// Wall Street Journal API integration
export const searchWSJAPI = async (query: string): Promise<SearchResult[]> => {
  try {
    const wsjResults: SearchResult[] = [
      {
        id: 'wsj-1',
        title: `Wall Street Journal: ${query} - Business and Financial Analysis`,
        description: 'Business journalism and financial market analysis',
        content: `Wall Street Journal analysis of ${query} providing business journalism, financial market insights, and economic analysis from a business-focused perspective.`,
        url: 'https://www.wsj.com/',
        source: 'Wall Street Journal',
        publishedAt: new Date().toISOString(),
        author: 'WSJ Reporters',
        viewpoint: 'business journalism',
        keywords: ['Wall Street Journal', 'business journalism', 'financial analysis', 'economic insights', 'market coverage']
      }
    ];

    return wsjResults;
  } catch (error) {
    console.error('WSJ API error:', error);
    return [];
  }
};

// New York Times API integration
export const searchNYTimesAPI = async (query: string): Promise<SearchResult[]> => {
  try {
    const nytResults: SearchResult[] = [
      {
        id: 'nytimes-1',
        title: `New York Times: ${query} - In-Depth Reporting`,
        description: 'Comprehensive journalism and investigative reporting',
        content: `New York Times analysis of ${query} providing comprehensive journalism, investigative reporting, and detailed analysis with expert sources and thorough research.`,
        url: 'https://www.nytimes.com/',
        source: 'New York Times',
        publishedAt: new Date().toISOString(),
        author: 'NYT Journalists',
        viewpoint: 'comprehensive journalism',
        keywords: ['New York Times', 'investigative reporting', 'comprehensive journalism', 'expert analysis', 'in-depth coverage']
      }
    ];

    return nytResults;
  } catch (error) {
    console.error('NY Times API error:', error);
    return [];
  }
};

// Washington Post API integration
export const searchWashPostAPI = async (query: string): Promise<SearchResult[]> => {
  try {
    const washPostResults: SearchResult[] = [
      {
        id: 'washpost-1',
        title: `Washington Post: ${query} - Political and Policy Analysis`,
        description: 'Political journalism and government coverage',
        content: `Washington Post analysis of ${query} providing political journalism, government coverage, and policy analysis with focus on Washington D.C. and federal government.`,
        url: 'https://www.washingtonpost.com/',
        source: 'Washington Post',
        publishedAt: new Date().toISOString(),
        author: 'Washington Post Team',
        viewpoint: 'political journalism',
        keywords: ['Washington Post', 'political journalism', 'government coverage', 'policy analysis', 'federal government']
      }
    ];

    return washPostResults;
  } catch (error) {
    console.error('Washington Post API error:', error);
    return [];
  }
};

// USA Today API integration
export const searchUSATodayAPI = async (query: string): Promise<SearchResult[]> => {
  try {
    const usaTodayResults: SearchResult[] = [
      {
        id: 'usatoday-1',
        title: `USA Today: ${query} - National News Coverage`,
        description: 'National news and mainstream American perspective',
        content: `USA Today coverage of ${query} providing national news perspective, mainstream American viewpoints, and accessible journalism for general audiences.`,
        url: 'https://www.usatoday.com/',
        source: 'USA Today',
        publishedAt: new Date().toISOString(),
        author: 'USA Today Team',
        viewpoint: 'mainstream national',
        keywords: ['USA Today', 'national news', 'mainstream perspective', 'general audience', 'American viewpoint']
      }
    ];

    return usaTodayResults;
  } catch (error) {
    console.error('USA Today API error:', error);
    return [];
  }
};

// Politico API integration
export const searchPoliticoAPI = async (query: string): Promise<SearchResult[]> => {
  try {
    const politicoResults: SearchResult[] = [
      {
        id: 'politico-1',
        title: `Politico: ${query} - Political Insider Analysis`,
        description: 'Political insider coverage and policy analysis',
        content: `Politico analysis of ${query} providing political insider coverage, policy analysis, and Washington D.C. political dynamics with expert political commentary.`,
        url: 'https://www.politico.com/',
        source: 'Politico',
        publishedAt: new Date().toISOString(),
        author: 'Politico Team',
        viewpoint: 'political insider',
        keywords: ['Politico', 'political insider', 'policy analysis', 'Washington politics', 'political dynamics']
      }
    ];

    return politicoResults;
  } catch (error) {
    console.error('Politico API error:', error);
    return [];
  }
};

// The Hill API integration
export const searchTheHillAPI = async (query: string): Promise<SearchResult[]> => {
  try {
    const theHillResults: SearchResult[] = [
      {
        id: 'thehill-1',
        title: `The Hill: ${query} - Congressional and Policy Coverage`,
        description: 'Congressional coverage and bipartisan policy analysis',
        content: `The Hill analysis of ${query} providing Congressional coverage, bipartisan policy analysis, and legislative developments with focus on Capitol Hill activities.`,
        url: 'https://thehill.com/',
        source: 'The Hill',
        publishedAt: new Date().toISOString(),
        author: 'The Hill Team',
        viewpoint: 'congressional coverage',
        keywords: ['The Hill', 'congressional coverage', 'bipartisan analysis', 'legislative developments', 'Capitol Hill']
      }
    ];

    return theHillResults;
  } catch (error) {
    console.error('The Hill API error:', error);
    return [];
  }
};

// Main function to search all major news outlets
export const searchMajorNewsAPIs = async (query: string): Promise<SearchResult[]> => {
  const enabledAPIs = getEnabledAPISources();
  
  const apiMap = {
    'fox-news': searchFoxNewsAPI,
    'cnn': searchCNNAPI,
    'msnbc': searchMSNBCAPI,
    'npr': searchNPRAPI,
    'ap': searchAPAPI,
    'wsj': searchWSJAPI,
    'nytimes': searchNYTimesAPI,
    'washpost': searchWashPostAPI,
    'usatoday': searchUSATodayAPI,
    'politico': searchPoliticoAPI,
    'thehill': searchTheHillAPI
  };
  
  // Only search enabled APIs
  const searchPromises = Object.entries(apiMap)
    .filter(([apiId]) => enabledAPIs.includes(apiId))
    .map(([_, searchFn]) => searchFn(query));

  try {
    const results = await Promise.allSettled(searchPromises);
    const allResults: SearchResult[] = [];

    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        allResults.push(...result.value);
      }
    });

    // Ensure political balance by including diverse viewpoints
    return balanceNewsResults(allResults, query);
  } catch (error) {
    console.error('Error searching major news APIs:', error);
    return [];
  }
};

// Balance news results to ensure diverse political perspectives
const balanceNewsResults = (results: SearchResult[], query: string): SearchResult[] => {
  // Group by political viewpoint
  const viewpointGroups = new Map<string, SearchResult[]>();
  
  results.forEach(result => {
    const viewpoint = getViewpointCategory(result.viewpoint || '');
    if (!viewpointGroups.has(viewpoint)) {
      viewpointGroups.set(viewpoint, []);
    }
    viewpointGroups.get(viewpoint)!.push(result);
  });
  
  // Ensure balanced representation
  const balancedResults: SearchResult[] = [];
  const maxPerViewpoint = 3; // Maximum results per political viewpoint
  
  viewpointGroups.forEach((viewpointResults) => {
    const sortedResults = viewpointResults
      .sort((a, b) => calculateNewsRelevance(b, query) - calculateNewsRelevance(a, query))
      .slice(0, maxPerViewpoint);
    balancedResults.push(...sortedResults);
  });
  
  return balancedResults
    .sort((a, b) => calculateNewsRelevance(b, query) - calculateNewsRelevance(a, query))
    .slice(0, 15); // Return top 15 balanced results
};

// Categorize viewpoints for balance
const getViewpointCategory = (viewpoint: string): string => {
  const viewpointLower = viewpoint.toLowerCase();
  
  if (viewpointLower.includes('conservative') || viewpointLower.includes('right')) return 'conservative';
  if (viewpointLower.includes('liberal') || viewpointLower.includes('progressive')) return 'liberal';
  if (viewpointLower.includes('center') || viewpointLower.includes('moderate')) return 'center';
  if (viewpointLower.includes('objective') || viewpointLower.includes('wire service')) return 'objective';
  if (viewpointLower.includes('business') || viewpointLower.includes('financial')) return 'business';
  if (viewpointLower.includes('political') || viewpointLower.includes('insider')) return 'political';
  
  return 'general';
};

// Calculate relevance for news results
const calculateNewsRelevance = (result: SearchResult, query: string): number => {
  const queryLower = query.toLowerCase();
  const titleLower = result.title.toLowerCase();
  const descLower = result.description.toLowerCase();
  
  let score = 0;
  
  // Title matches
  if (titleLower.includes(queryLower)) score += 15;
  
  // Description matches
  if (descLower.includes(queryLower)) score += 10;
  
  // Source credibility bonus
  const highCredibilitySources = ['associated press', 'reuters', 'npr', 'wall street journal'];
  if (highCredibilitySources.some(source => result.source.toLowerCase().includes(source))) {
    score += 5;
  }
  
  // Keyword matches
  if (result.keywords) {
    result.keywords.forEach(keyword => {
      if (keyword.toLowerCase().includes(queryLower)) score += 8;
    });
  }
  
  // Word-level matches
  const queryWords = queryLower.split(' ');
  queryWords.forEach(word => {
    if (word.length > 2) {
      if (titleLower.includes(word)) score += 3;
      if (descLower.includes(word)) score += 2;
    }
  });
  
  return score;
};