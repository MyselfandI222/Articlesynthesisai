// Mistral AI Service for Article Synthesis
import { Article, SynthesizedArticle, WritingStyle } from '../types';
import { calculateWordCount, calculateReadingTime, getTargetWordCount, WORD_COUNT_RANGES } from './articleMetrics';

const MISTRAL_API_BASE_URL = '/api/mistral';

export const synthesizeWithMistral = async (
  sources: Article[],
  topic: string,
  style: WritingStyle,
  tone: string,
  length: 'short' | 'medium' | 'long'
): Promise<SynthesizedArticle> => {
  try {
    console.log('Starting Mistral synthesis...');
    
    // Convert sources to URLs for Mistral pipeline
    const urls = sources.map(source => source.url).filter(Boolean);
    
    if (urls.length === 0) {
      throw new Error('No valid URLs found in sources for Mistral synthesis');
    }
    
    // Map WritingStyle to Mistral style format
    const mistralStyle = mapToMistralStyle(style);
    
    // Calculate max words based on length using exact ranges
    const maxWords = WORD_COUNT_RANGES[length].max;
    
    const response = await fetch(`${MISTRAL_API_BASE_URL}/synthesize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topic,
        style: mistralStyle,
        urls,
        maxWords,
        model: "mistral-small-latest"
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Mistral API error: ${response.status} - ${errorData.error || 'Unknown error'}`);
    }

    const data = await response.json();
    
    // Transform Mistral response to SynthesizedArticle format
    const wordCount = calculateWordCount(data.article);
    
    const synthesizedArticle: SynthesizedArticle = {
      id: `mistral-${Date.now()}`,
      title: extractTitleFromArticle(data.article) || `${topic}: Comprehensive Analysis`,
      content: data.article,
      summary: data.outline.slice(0, 3).join(' ') || data.article.substring(0, 200) + '...',
      wordCount,
      readingTime: calculateReadingTime(wordCount),
      createdAt: new Date(),
      style,
      processingMetrics: {
        processingTimeMs: 5000, // Estimated
        aiModelUsed: 'mistral-small-latest',
        contentQualityScore: calculateQualityScore(data)
      },
      seoMetadata: {
        keywords: extractKeywords(data.article, topic),
        description: data.outline.slice(0, 2).join(' ') || data.article.substring(0, 160) + '...',
        readabilityScore: 85
      }
    };
    
    console.log('Mistral synthesis completed successfully');
    return synthesizedArticle;
    
  } catch (error) {
    console.error('Mistral synthesis failed:', error);
    
    // Return fallback response
    const fallbackContent = `Analysis of "${topic}" using Mistral AI is currently unavailable. Please check your API configuration or try again later.`;
    const fallbackWordCount = calculateWordCount(fallbackContent);
    
    return {
      id: `mistral-fallback-${Date.now()}`,
      title: `${topic}: Analysis`,
      content: fallbackContent,
      summary: 'Mistral synthesis temporarily unavailable',
      wordCount: fallbackWordCount,
      readingTime: calculateReadingTime(fallbackWordCount),
      createdAt: new Date(),
      style,
      processingMetrics: {
        processingTimeMs: 1000,
        aiModelUsed: 'mistral-fallback',
        contentQualityScore: 60
      },
      factCheckResults: {
        verifiedFacts: 0,
        uncertainFacts: 0,
        correctedFacts: 0
      },
      seoMetadata: {
        keywords: [topic],
        description: 'Mistral synthesis temporarily unavailable',
        readabilityScore: 60
      }
    };
  }
};

export interface MistralServiceConfig {
  sourceDeduplication: boolean;
  citationManagement: boolean;
  comparativeAnalysis: boolean;
  contentExtraction: boolean;
  plagiarismDetection: boolean;
  advancedProcessing: boolean;
}

const defaultMistralSettings: MistralServiceConfig = {
  sourceDeduplication: true,
  citationManagement: true,
  comparativeAnalysis: true,
  contentExtraction: true,
  plagiarismDetection: false,
  advancedProcessing: true,
};

export const getMistralSettings = (): MistralServiceConfig => {
  const saved = localStorage.getItem('mistralSettings');
  return saved ? { ...defaultMistralSettings, ...JSON.parse(saved) } : defaultMistralSettings;
};

export const saveMistralSettings = (settings: MistralServiceConfig): void => {
  localStorage.setItem('mistralSettings', JSON.stringify(settings));
};

export const editWithMistral = async (
  article: SynthesizedArticle,
  instructions: string
): Promise<SynthesizedArticle> => {
  try {
    console.log('Starting Mistral editing...');
    
    const response = await fetch(`${MISTRAL_API_BASE_URL}/edit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        article: article.content,
        title: article.title,
        instructions,
        model: "mistral-small-latest"
      }),
    });

    if (!response.ok) {
      throw new Error(`Mistral edit API error: ${response.status}`);
    }

    const data = await response.json();
    const wordCount = calculateWordCount(data.editedContent);
    
    return {
      ...article,
      content: data.editedContent,
      title: data.editedTitle || article.title,
      summary: data.editedContent.substring(0, 200) + '...',
      wordCount,
      readingTime: calculateReadingTime(wordCount),
      processingMetrics: {
        ...article.processingMetrics,
        processingTimeMs: 3000,
        aiModelUsed: 'mistral-small-latest',
        contentQualityScore: article.processingMetrics?.contentQualityScore || 75
      }
    };
    
  } catch (error) {
    console.error('Mistral editing failed:', error);
    
    // Return original article with error message
    return {
      ...article,
      content: article.content + '\n\n[Note: Mistral editing temporarily unavailable]'
    };
  }
};

// Helper functions
function mapToMistralStyle(style: WritingStyle): string {
  switch (style) {
    case 'academic':
    case 'technical':
      return 'technical';
    case 'blog':
    case 'creative':
      return 'simple';
    case 'opinion':
      return 'opinionated';
    default:
      return 'neutral';
  }
}

function extractTitleFromArticle(article: string): string | null {
  const lines = article.split('\n');
  const titleLine = lines.find(line => 
    line.trim().length > 0 && 
    (line.startsWith('#') || line.length < 100)
  );
  
  return titleLine?.replace(/^#+\s*/, '').trim() || null;
}

function calculateQualityScore(data: any): number {
  let score = 70; // Base score
  
  if (data.references && data.references.length > 2) score += 10;
  if (data.outline && data.outline.length > 4) score += 10;
  if (data.article && data.article.length > 500) score += 5;
  if (data.perSourceSummaries && data.perSourceSummaries.length > 1) score += 5;
  
  return Math.min(score, 95);
}

function extractKeywords(content: string, topic: string): string[] {
  const words = content.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
  const frequency: { [key: string]: number } = {};
  
  words.forEach(word => {
    if (word !== topic.toLowerCase()) {
      frequency[word] = (frequency[word] || 0) + 1;
    }
  });
  
  const topWords = Object.entries(frequency)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 8)
    .map(([word]) => word);
    
  return [topic, ...topWords];
}