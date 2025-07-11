// ChatGPT Search Integration Service
import { SearchResult } from '../types';
import { searchArticles } from './articleSearch';
import { searchGoogleForArticles } from './googleSearchAPI';

interface ChatGPTSearchRequest {
  model: string;
  messages: {
    role: 'system' | 'user' | 'assistant';
    content: string;
  }[];
  temperature?: number;
  max_tokens?: number;
}

// Get API key from environment variables
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

// Check if API key is available
const isApiKeyAvailable = (): boolean => {
  return !!OPENAI_API_KEY && OPENAI_API_KEY !== 'your-openai-api-key-here';
};

// Process search query with ChatGPT
export const enhanceSearchWithChatGPT = async (
  query: string,
  useGoogleSearch: boolean = true
): Promise<{
  results: SearchResult[];
  chatGptAnalysis: string;
  isEnhanced: boolean;
}> => {
  try {
    // First, get search results from APIs
    let searchResults: SearchResult[] = [];
    
    if (useGoogleSearch) {
      try {
        searchResults = await searchGoogleForArticles(query, false);
      } catch (error) {
        console.warn('Google search failed, falling back to internal search:', error);
        searchResults = await searchArticles(query);
      }
    } else {
      searchResults = await searchArticles(query);
    }
    
    // If no API key or results are empty, return without enhancement
    if (!isApiKeyAvailable() || searchResults.length === 0) {
      return {
        results: searchResults,
        chatGptAnalysis: '',
        isEnhanced: false
      };
    }
    
    // Prepare search results for ChatGPT analysis
    const searchResultsText = searchResults.slice(0, 5).map((result, index) => {
      return `Article ${index + 1}: "${result.title}" from ${result.source}
Description: ${result.description}
Content snippet: ${result.content.substring(0, 200)}...
`;
    }).join('\n\n');
    
    // Get ChatGPT analysis
    const chatGptAnalysis = await analyzSearchResultsWithChatGPT(query, searchResultsText);
    
    return {
      results: searchResults,
      chatGptAnalysis,
      isEnhanced: true
    };
  } catch (error) {
    console.error('Error enhancing search with ChatGPT:', error);
    return {
      results: await searchArticles(query),
      chatGptAnalysis: '',
      isEnhanced: false
    };
  }
};

// Analyze search results with ChatGPT
const analyzSearchResultsWithChatGPT = async (
  query: string,
  searchResultsText: string
): Promise<string> => {
  if (!isApiKeyAvailable()) {
    return generateFallbackAnalysis(query);
  }
  
  try {
    // Prepare system message
    const systemMessage = `You are an AI research assistant helping to analyze search results about "${query}". 
Your task is to provide a brief, insightful summary of the key points from these articles, highlighting:
1. Main perspectives and viewpoints
2. Key facts and data points
3. Areas of consensus and disagreement
4. Any potential biases or limitations in the coverage

Keep your analysis concise (150-200 words) and focus on helping the user understand the landscape of information available.`;

    // Prepare user message with search results
    const userMessage = `Here are the search results about "${query}":\n\n${searchResultsText}\n\nPlease analyze these results and provide a concise summary of the key information.`;

    // Prepare request
    const request: ChatGPTSearchRequest = {
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: userMessage }
      ],
      temperature: 0.7,
      max_tokens: 300
    };

    // Send request to OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('ChatGPT analysis error:', error);
    return generateFallbackAnalysis(query);
  }
};

// Generate fallback analysis when API is unavailable
const generateFallbackAnalysis = (query: string): string => {
  return `Based on the search results for "${query}", there appears to be a variety of perspectives and information available. The articles cover different aspects of the topic, including factual reporting, analysis, and expert opinions. 

Key points include various viewpoints on the subject, with some sources providing more detailed technical information while others focus on broader implications. There seems to be some consensus on the basic facts, though interpretations may vary.

For a comprehensive understanding, it would be beneficial to read multiple sources to get a balanced view of the topic.`;
};