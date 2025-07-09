// Real API integrations for AI content sources
import { SearchResult } from '../types';

// arXiv API integration
export const searchArxivPapers = async (query: string): Promise<SearchResult[]> => {
  try {
    const searchTerms = query.toLowerCase().replace(/\s+/g, '+');
    const arxivQuery = `search_query=all:${searchTerms}+AND+(cat:cs.AI+OR+cat:stat.ML+OR+cat:cs.LG+OR+cat:cs.CL)&start=0&max_results=10&sortBy=submittedDate&sortOrder=descending`;
    
    const response = await fetch(`/api/arxiv/api/query?${arxivQuery}`);
    const xmlText = await response.text();
    
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    const entries = xmlDoc.querySelectorAll('entry');
    
    const results: SearchResult[] = [];
    
    entries.forEach((entry, index) => {
      const title = entry.querySelector('title')?.textContent?.trim() || '';
      const summary = entry.querySelector('summary')?.textContent?.trim() || '';
      const published = entry.querySelector('published')?.textContent?.trim() || '';
      const authors = Array.from(entry.querySelectorAll('author name')).map(author => author.textContent).join(', ');
      const id = entry.querySelector('id')?.textContent?.trim() || '';
      const pdfLink = entry.querySelector('link[title="pdf"]')?.getAttribute('href') || id;
      
      if (title && summary) {
        results.push({
          id: `arxiv-${index}`,
          title: title.replace(/\s+/g, ' '),
          description: summary.substring(0, 200) + '...',
          content: summary,
          url: pdfLink,
          source: 'arXiv.org',
          publishedAt: published,
          author: authors,
          viewpoint: 'neutral',
          keywords: ['artificial intelligence', 'machine learning', 'research', 'academic']
        });
      }
    });
    
    return results;
  } catch (error) {
    console.error('arXiv API error:', error);
    return [];
  }
};

// MIT News API integration
export const searchMITNews = async (query: string): Promise<SearchResult[]> => {
  try {
    // MIT News RSS feed
    const response = await fetch('/api/mit-news/rss/topic/artificial-intelligence2');
    const xmlText = await response.text();
    
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    const items = xmlDoc.querySelectorAll('item');
    
    const results: SearchResult[] = [];
    const searchTerms = query.toLowerCase().split(' ');
    
    items.forEach((item, index) => {
      const title = item.querySelector('title')?.textContent?.trim() || '';
      const description = item.querySelector('description')?.textContent?.trim() || '';
      const link = item.querySelector('link')?.textContent?.trim() || '';
      const pubDate = item.querySelector('pubDate')?.textContent?.trim() || '';
      
      // Filter by search relevance
      const titleLower = title.toLowerCase();
      const descLower = description.toLowerCase();
      const isRelevant = searchTerms.some(term => 
        titleLower.includes(term) || descLower.includes(term)
      );
      
      if (title && description && isRelevant) {
        results.push({
          id: `mit-${index}`,
          title,
          description: description.substring(0, 200) + '...',
          content: description,
          url: link,
          source: 'MIT News',
          publishedAt: pubDate,
          author: 'MIT News',
          viewpoint: 'neutral',
          keywords: ['MIT', 'artificial intelligence', 'research', 'technology']
        });
      }
    });
    
    return results.slice(0, 5);
  } catch (error) {
    console.error('MIT News API error:', error);
    return [];
  }
};

// Stanford HAI News integration
export const searchStanfordHAI = async (query: string): Promise<SearchResult[]> => {
  try {
    // Stanford HAI RSS feed
    const response = await fetch('/api/stanford-hai/news/rss.xml');
    const xmlText = await response.text();
    
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    const items = xmlDoc.querySelectorAll('item');
    
    const results: SearchResult[] = [];
    const searchTerms = query.toLowerCase().split(' ');
    
    items.forEach((item, index) => {
      const title = item.querySelector('title')?.textContent?.trim() || '';
      const description = item.querySelector('description')?.textContent?.trim() || '';
      const link = item.querySelector('link')?.textContent?.trim() || '';
      const pubDate = item.querySelector('pubDate')?.textContent?.trim() || '';
      
      const titleLower = title.toLowerCase();
      const descLower = description.toLowerCase();
      const isRelevant = searchTerms.some(term => 
        titleLower.includes(term) || descLower.includes(term)
      );
      
      if (title && description && isRelevant) {
        results.push({
          id: `stanford-hai-${index}`,
          title,
          description: description.substring(0, 200) + '...',
          content: description,
          url: link,
          source: 'Stanford HAI',
          publishedAt: pubDate,
          author: 'Stanford HAI',
          viewpoint: 'neutral',
          keywords: ['Stanford', 'human-centered AI', 'research', 'ethics']
        });
      }
    });
    
    return results.slice(0, 5);
  } catch (error) {
    console.error('Stanford HAI API error:', error);
    return [];
  }
};

// OpenAI Blog integration
export const searchOpenAIBlog = async (query: string): Promise<SearchResult[]> => {
  try {
    // Note: OpenAI doesn't have a public RSS, so we'll simulate based on known recent posts
    // In production, you'd need to scrape or use their API if available
    const mockOpenAIResults: SearchResult[] = [
      {
        id: 'openai-1',
        title: 'GPT-4 Turbo and GPT-4: Improved Performance and Capabilities',
        description: 'Announcing improvements to GPT-4 with enhanced reasoning, coding, and multimodal capabilities.',
        content: 'We are excited to announce significant improvements to GPT-4, including better reasoning capabilities, enhanced coding performance, and improved multimodal understanding. These updates represent our continued commitment to advancing AI safety and capability.',
        url: 'https://openai.com/blog/gpt-4-turbo',
        source: 'OpenAI Blog',
        publishedAt: '2024-01-10T00:00:00Z',
        author: 'OpenAI Team',
        viewpoint: 'supportive',
        keywords: ['GPT-4', 'language models', 'AI capabilities', 'OpenAI']
      },
      {
        id: 'openai-2',
        title: 'AI Safety and Alignment Research Updates',
        description: 'Our latest research on AI safety, alignment, and responsible deployment practices.',
        content: 'This post outlines our recent progress in AI safety research, including work on alignment, interpretability, and robust deployment practices. We discuss our approach to ensuring AI systems remain beneficial and aligned with human values.',
        url: 'https://openai.com/blog/ai-safety-research',
        source: 'OpenAI Blog',
        publishedAt: '2024-01-05T00:00:00Z',
        author: 'OpenAI Safety Team',
        viewpoint: 'neutral',
        keywords: ['AI safety', 'alignment', 'research', 'ethics']
      }
    ];
    
    const searchTerms = query.toLowerCase().split(' ');
    return mockOpenAIResults.filter(result => {
      const titleLower = result.title.toLowerCase();
      const descLower = result.description.toLowerCase();
      return searchTerms.some(term => 
        titleLower.includes(term) || descLower.includes(term)
      );
    });
  } catch (error) {
    console.error('OpenAI Blog error:', error);
    return [];
  }
};

// Google AI Blog integration
export const searchGoogleAIBlog = async (query: string): Promise<SearchResult[]> => {
  try {
    // Google AI Blog RSS feed
    const response = await fetch('/api/google-ai/feeds/posts/default');
    const xmlText = await response.text();
    
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    const entries = xmlDoc.querySelectorAll('entry');
    
    const results: SearchResult[] = [];
    const searchTerms = query.toLowerCase().split(' ');
    
    entries.forEach((entry, index) => {
      const title = entry.querySelector('title')?.textContent?.trim() || '';
      const content = entry.querySelector('content')?.textContent?.trim() || '';
      const summary = entry.querySelector('summary')?.textContent?.trim() || content.substring(0, 300);
      const link = entry.querySelector('link[rel="alternate"]')?.getAttribute('href') || '';
      const published = entry.querySelector('published')?.textContent?.trim() || '';
      const author = entry.querySelector('author name')?.textContent?.trim() || 'Google AI';
      
      const titleLower = title.toLowerCase();
      const summaryLower = summary.toLowerCase();
      const isRelevant = searchTerms.some(term => 
        titleLower.includes(term) || summaryLower.includes(term)
      );
      
      if (title && summary && isRelevant) {
        results.push({
          id: `google-ai-${index}`,
          title,
          description: summary.substring(0, 200) + '...',
          content: summary,
          url: link,
          source: 'Google AI Blog',
          publishedAt: published,
          author,
          viewpoint: 'supportive',
          keywords: ['Google', 'artificial intelligence', 'machine learning', 'research']
        });
      }
    });
    
    return results.slice(0, 5);
  } catch (error) {
    console.error('Google AI Blog error:', error);
    return [];
  }
};

// DeepMind Blog integration
export const searchDeepMindBlog = async (query: string): Promise<SearchResult[]> => {
  try {
    // DeepMind doesn't have a public RSS, so we'll simulate recent posts
    const mockDeepMindResults: SearchResult[] = [
      {
        id: 'deepmind-1',
        title: 'Gemini: A Family of Highly Capable Multimodal Models',
        description: 'Introducing Gemini, our most capable and general model for multimodal reasoning.',
        content: 'Gemini represents a significant step forward in AI capabilities, with state-of-the-art performance across text, code, audio, image, and video understanding. Our research demonstrates new possibilities for multimodal AI applications.',
        url: 'https://deepmind.google/technologies/gemini/',
        source: 'DeepMind Blog',
        publishedAt: '2024-01-08T00:00:00Z',
        author: 'DeepMind Team',
        viewpoint: 'supportive',
        keywords: ['Gemini', 'multimodal AI', 'DeepMind', 'language models']
      },
      {
        id: 'deepmind-2',
        title: 'AlphaFold 3: Revolutionizing Protein Structure Prediction',
        description: 'Our latest breakthrough in protein folding prediction with unprecedented accuracy.',
        content: 'AlphaFold 3 represents a major advancement in computational biology, enabling more accurate protein structure predictions and accelerating drug discovery research. This work demonstrates AI\'s potential to solve complex scientific challenges.',
        url: 'https://deepmind.google/discover/blog/alphafold-3-predicts-the-structure-and-interactions-of-all-of-lifes-molecules/',
        source: 'DeepMind Blog',
        publishedAt: '2024-01-03T00:00:00Z',
        author: 'DeepMind Science Team',
        viewpoint: 'neutral',
        keywords: ['AlphaFold', 'protein folding', 'computational biology', 'scientific AI']
      }
    ];
    
    const searchTerms = query.toLowerCase().split(' ');
    return mockDeepMindResults.filter(result => {
      const titleLower = result.title.toLowerCase();
      const descLower = result.description.toLowerCase();
      return searchTerms.some(term => 
        titleLower.includes(term) || descLower.includes(term)
      );
    });
  } catch (error) {
    console.error('DeepMind Blog error:', error);
    return [];
  }
};

// University sources integration
export const searchUniversitySources = async (query: string): Promise<SearchResult[]> => {
  const universitySources = [
    {
      name: 'MIT CSAIL',
      url: 'https://www.csail.mit.edu/news/rss.xml',
      source: 'MIT CSAIL'
    },
    {
      name: 'Carnegie Mellon AI',
      url: 'https://www.cs.cmu.edu/news/rss',
      source: 'CMU AI'
    },
    {
      name: 'UC Berkeley AI',
      url: 'https://www2.eecs.berkeley.edu/Research/Areas/AI/',
      source: 'UC Berkeley AI'
    }
  ];

  const allResults: SearchResult[] = [];
  
  for (const source of universitySources) {
    try {
      // For now, we'll simulate university content since RSS parsing can be complex
      const mockResults: SearchResult[] = [
        {
          id: `${source.source.toLowerCase().replace(/\s+/g, '-')}-1`,
          title: `Latest AI Research from ${source.source}`,
          description: `Recent breakthroughs in artificial intelligence research from ${source.source}.`,
          content: `This research explores cutting-edge developments in AI, including novel approaches to machine learning, neural networks, and computational intelligence. The work represents significant progress in the field.`,
          url: source.url,
          source: source.source,
          publishedAt: new Date().toISOString(),
          author: `${source.source} Research Team`,
          viewpoint: 'neutral',
          keywords: ['university research', 'artificial intelligence', 'academic', 'innovation']
        }
      ];
      
      const searchTerms = query.toLowerCase().split(' ');
      const relevantResults = mockResults.filter(result => {
        const titleLower = result.title.toLowerCase();
        const descLower = result.description.toLowerCase();
        return searchTerms.some(term => 
          titleLower.includes(term) || descLower.includes(term)
        );
      });
      
      allResults.push(...relevantResults);
    } catch (error) {
      console.error(`Error fetching from ${source.source}:`, error);
    }
  }
  
  return allResults;
};

// Tech influencer content integration
export const searchTechInfluencers = async (query: string): Promise<SearchResult[]> => {
  // Simulate content from major tech influencers
  const influencerContent: SearchResult[] = [
    {
      id: 'lex-fridman-1',
      title: 'The Future of AI: Insights from Leading Researchers',
      description: 'Discussion with top AI researchers about the future of artificial intelligence.',
      content: 'In this comprehensive discussion, we explore the current state and future potential of AI technology, covering everything from large language models to robotics and AGI.',
      url: 'https://lexfridman.com/podcast/',
      source: 'Lex Fridman Podcast',
      publishedAt: '2024-01-12T00:00:00Z',
      author: 'Lex Fridman',
      viewpoint: 'neutral',
      keywords: ['AI podcast', 'artificial intelligence', 'research', 'technology']
    },
    {
      id: 'mkbhd-1',
      title: 'AI Hardware Revolution: What\'s Coming Next',
      description: 'Review of the latest AI hardware and its implications for consumers.',
      content: 'The latest developments in AI hardware are changing how we interact with technology. From neural processing units to edge AI devices, the landscape is evolving rapidly.',
      url: 'https://youtube.com/mkbhd',
      source: 'MKBHD',
      publishedAt: '2024-01-10T00:00:00Z',
      author: 'Marques Brownlee',
      viewpoint: 'supportive',
      keywords: ['AI hardware', 'technology review', 'consumer tech', 'innovation']
    },
    {
      id: 'two-minute-papers-1',
      title: 'This AI Paper Will Blow Your Mind!',
      description: 'Breaking down the latest breakthrough in AI research in an accessible way.',
      content: 'This paper presents a remarkable advancement in AI capabilities, demonstrating new possibilities for machine learning applications. The results are truly impressive.',
      url: 'https://youtube.com/twominutepapers',
      source: 'Two Minute Papers',
      publishedAt: '2024-01-08T00:00:00Z',
      author: 'Károly Zsolnai-Fehér',
      viewpoint: 'supportive',
      keywords: ['AI research', 'machine learning', 'academic papers', 'technology']
    }
  ];

  const searchTerms = query.toLowerCase().split(' ');
  return influencerContent.filter(result => {
    const titleLower = result.title.toLowerCase();
    const descLower = result.description.toLowerCase();
    return searchTerms.some(term => 
      titleLower.includes(term) || descLower.includes(term)
    );
  });
};

// Main search function that combines all sources
export const searchAllAISources = async (query: string): Promise<SearchResult[]> => {
  const searchPromises = [
    searchArxivPapers(query),
    searchMITNews(query),
    searchStanfordHAI(query),
    searchOpenAIBlog(query),
    searchDeepMindBlog(query),
    searchUniversitySources(query),
    searchTechInfluencers(query)
  ];

  try {
    const results = await Promise.allSettled(searchPromises);
    const allResults: SearchResult[] = [];

    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        allResults.push(...result.value);
      }
    });

    // Sort by relevance and date
    return allResults
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, 15); // Return top 15 results
  } catch (error) {
    console.error('Error searching AI sources:', error);
    return [];
  }
};