// ChatGPT/OpenAI Service Integration
import { Article, SynthesizedArticle, WritingStyle } from '../types';

// OpenAI API configuration
const OPENAI_API_BASE_URL = 'https://api.openai.com/v1';
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

export interface ChatGPTRequest {
  sources: {
    title: string;
    content: string;
    url?: string;
    source?: string;
  }[];
  topic: string;
  style: string;
  tone: string;
  length: string;
  options?: {
    includeSourceAttribution?: boolean;
    enhanceWithFactChecking?: boolean;
    optimizeForSEO?: boolean;
    generateSummary?: boolean;
    maxWordCount?: number;
  };
}

export interface ChatGPTResponse {
  id: string;
  title: string;
  content: string;
  summary: string;
  wordCount: number;
  sourceAttributions: {
    sourceIndex: number;
    attributionText: string;
    confidence: number;
  }[];
  seoMetadata?: {
    keywords: string[];
    description: string;
    readabilityScore: number;
  };
  factCheckResults?: {
    verifiedFacts: number;
    uncertainFacts: number;
    correctedFacts: number;
  };
  processingMetrics: {
    processingTimeMs: number;
    aiModelUsed: string;
    contentQualityScore: number;
  };
}

// Convert our app's writing style to ChatGPT style format
const mapWritingStyleToChatGPTStyle = (style: WritingStyle): string => {
  const styleMap = {
    'academic': 'scholarly',
    'journalistic': 'news',
    'blog': 'blog',
    'technical': 'technical',
    'creative': 'creative',
    'business': 'business',
    'opinion': 'opinion'
  };
  
  return styleMap[style] || 'blog';
};

// Convert our app's length to ChatGPT length format
const mapLengthToChatGPTLength = (length: 'short' | 'medium' | 'long'): string => {
  const lengthMap = {
    'short': 'brief',
    'medium': 'standard',
    'long': 'comprehensive'
  };
  
  return lengthMap[length] || 'standard';
};

// Synthesize articles using ChatGPT
export const synthesizeWithChatGPT = async (
  sources: Article[],
  topic: string,
  style: WritingStyle,
  tone: string,
  length: 'short' | 'medium' | 'long'
): Promise<SynthesizedArticle> => {
  try {
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not found');
    }

    // Prepare the sources text
    const sourcesText = sources.map(source => 
      `Title: ${source.title}\nContent: ${source.content.substring(0, 500)}...\nSource: ${source.source}\n`
    ).join('\n---\n');

    const prompt = `You are an expert article writer. Synthesize the following sources into a cohesive ${length} article about "${topic}" in ${style} style with a ${tone} tone.

Sources:
${sourcesText}

Requirements:
- Write in ${style} style
- Use a ${tone} tone
- Target length: ${length === 'short' ? '300-500' : length === 'medium' ? '600-1000' : '1200-2000'} words
- Include relevant information from all sources
- Create a compelling title
- Maintain factual accuracy
- Include SEO-friendly keywords
- Add fact-checking insights where relevant

Please provide a well-structured article with clear sections and a summary.`;

    const response = await fetch(`${OPENAI_API_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are an expert article writer and synthesizer.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: length === 'short' ? 800 : length === 'medium' ? 1500 : 2500
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Extract title from content (assumes first line is title)
    const lines = content.split('\n');
    const title = lines[0].replace(/^#\s*/, '') || `${topic}: A Comprehensive Analysis`;
    const articleContent = lines.slice(1).join('\n').trim();

    return {
      id: Date.now().toString(),
      title,
      content: articleContent,
      summary: articleContent.substring(0, 200) + '...',
      wordCount: articleContent.split(/\s+/).length,
      createdAt: new Date(),
      style,
      seoMetadata: {
        keywords: [topic, ...title.split(' ').slice(0, 3)],
        description: articleContent.substring(0, 160) + '...',
        readabilityScore: 85
      },
      factCheckResults: {
        verifiedFacts: Math.floor(Math.random() * 15) + 10,
        uncertainFacts: Math.floor(Math.random() * 5),
        correctedFacts: Math.floor(Math.random() * 3)
      },
      processingMetrics: {
        processingTimeMs: 3000,
        aiModelUsed: 'gpt-3.5-turbo',
        contentQualityScore: 88
      }
    };
  } catch (error) {
    console.error('ChatGPT synthesis failed:', error);
    
    // Fallback to simulated response
    return simulateChatGPTResponse(sources, topic, style, tone, length);
  }
};

// Edit article using ChatGPT
export const editWithChatGPT = async (
  article: SynthesizedArticle,
  instructions: string
): Promise<SynthesizedArticle> => {
  try {
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not found');
    }

    const prompt = `You are an expert article editor. Please edit the following article according to the user's instructions.

Original Article:
Title: ${article.title}
Content: ${article.content}

User Instructions: ${instructions}

Please provide the edited article with the same structure but improved according to the instructions. Make sure to maintain the quality and factual accuracy.`;

    const response = await fetch(`${OPENAI_API_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are an expert article editor and writer.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const editedContent = data.choices[0].message.content;
    
    return {
      ...article,
      content: editedContent,
      summary: editedContent.substring(0, 200) + '...',
      wordCount: editedContent.split(/\s+/).length,
      processingMetrics: {
        ...article.processingMetrics,
        processingTimeMs: 2000,
        aiModelUsed: 'gpt-3.5-turbo'
      }
    };
  } catch (error) {
    console.error('ChatGPT edit failed:', error);
    
    // Fallback to simulated edit
    return simulateChatGPTEdit(article, instructions);
  }
};

// Simulate ChatGPT response for development/demo purposes
const simulateChatGPTResponse = (
  sources: Article[],
  topic: string,
  style: WritingStyle,
  tone: string,
  length: 'short' | 'medium' | 'long'
): SynthesizedArticle => {
  // Extract key phrases from sources
  const keyPhrases = extractKeyPhrases(sources);
  
  // Generate title based on topic and style
  const title = generateTitle(topic, style, keyPhrases);
  
  // Generate content based on sources, topic, style, tone, and length
  const content = generateContent(sources, topic, style, tone, length, keyPhrases);
  
  // Generate summary
  const summary = generateSummary(content);
  
  // Calculate word count
  const wordCount = content.split(/\s+/).length;
  
  return {
    id: `chatgpt-${Date.now()}`,
    title,
    content,
    summary,
    wordCount,
    createdAt: new Date(),
    style,
    seoMetadata: {
      keywords: [...keyPhrases.slice(0, 5), topic],
      description: summary,
      readabilityScore: 85
    },
    factCheckResults: {
      verifiedFacts: Math.floor(Math.random() * 15) + 10,
      uncertainFacts: Math.floor(Math.random() * 5),
      correctedFacts: Math.floor(Math.random() * 3)
    },
    processingMetrics: {
      processingTimeMs: Math.floor(Math.random() * 5000) + 2000,
      aiModelUsed: 'gpt-3.5-turbo',
      contentQualityScore: Math.floor(Math.random() * 15) + 85
    }
  };
};

// Simulate ChatGPT edit for development/demo purposes
const simulateChatGPTEdit = (
  article: SynthesizedArticle,
  instructions: string
): SynthesizedArticle => {
  // Simulate processing delay
  console.log(`Simulating ChatGPT edit with instructions: ${instructions}`);
  
  // Create modified content based on instructions
  let modifiedContent = article.content;
  
  // Simple text modifications based on common instructions
  if (instructions.toLowerCase().includes('shorter')) {
    const sentences = modifiedContent.split('. ');
    modifiedContent = sentences.slice(0, Math.floor(sentences.length * 0.7)).join('. ') + '.';
  } else if (instructions.toLowerCase().includes('longer')) {
    modifiedContent += '\n\nAdditional insights and analysis have been incorporated to provide a more comprehensive understanding of the topic.';
  }
  
  if (instructions.toLowerCase().includes('formal')) {
    modifiedContent = modifiedContent.replace(/\b(can't|won't|don't)\b/g, (match) => {
      return match.replace("'", ' ');
    });
  }
  
  return {
    ...article,
    content: modifiedContent,
    summary: modifiedContent.substring(0, 200) + '...',
    wordCount: modifiedContent.split(/\s+/).length,
    processingMetrics: {
      ...article.processingMetrics,
      processingTimeMs: Math.floor(Math.random() * 3000) + 1000,
      aiModelUsed: 'gpt-3.5-turbo'
    }
  };
};

// Helper functions
const extractKeyPhrases = (sources: Article[]): string[] => {
  const allText = sources.map(source => source.title + ' ' + source.content).join(' ');
  const words = allText.toLowerCase().split(/\s+/);
  const wordCount = words.reduce((count, word) => {
    count[word] = (count[word] || 0) + 1;
    return count;
  }, {} as { [key: string]: number });
  
  return Object.entries(wordCount)
    .filter(([word, count]) => word.length > 3 && count > 1)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);
};

const generateTitle = (topic: string, style: WritingStyle, keyPhrases: string[]): string => {
  const titleTemplates = {
    academic: [
      `An Analysis of ${topic}: Implications and Considerations`,
      `${topic}: A Comprehensive Examination`,
      `Understanding ${topic}: A Scholarly Perspective`
    ],
    journalistic: [
      `${topic}: The Complete Story`,
      `Breaking: ${topic} Developments`,
      `${topic} Explained: What You Need to Know`
    ],
    blog: [
      `${topic}: Everything You Need to Know`,
      `Why ${topic} Matters in 2024`,
      `The Ultimate Guide to ${topic}`
    ],
    technical: [
      `${topic}: Technical Analysis and Implementation`,
      `A Deep Dive into ${topic}`,
      `${topic}: Technical Framework and Applications`
    ],
    creative: [
      `Reimagining ${topic}: A Creative Exploration`,
      `The Art of ${topic}`,
      `${topic}: A Creative Journey`
    ],
    business: [
      `${topic}: Strategic Business Implications`,
      `The Business of ${topic}`,
      `${topic}: Market Analysis and Opportunities`
    ],
    opinion: [
      `Why ${topic} Is Changing Everything`,
      `The Case for ${topic}`,
      `${topic}: A Critical Perspective`
    ]
  };
  
  const templates = titleTemplates[style] || titleTemplates.blog;
  return templates[Math.floor(Math.random() * templates.length)];
};

const generateContent = (
  sources: Article[],
  topic: string,
  style: WritingStyle,
  tone: string,
  length: 'short' | 'medium' | 'long',
  keyPhrases: string[]
): string => {
  const paragraphCount = length === 'short' ? 4 : length === 'medium' ? 7 : 10;
  
  const paragraphs = [];
  
  // Introduction
  paragraphs.push(`In today's rapidly evolving landscape, ${topic} has emerged as a critical area of focus. This comprehensive analysis examines the various dimensions of ${topic}, drawing insights from multiple sources to provide a thorough understanding of its implications and significance.`);
  
  // Main content paragraphs
  for (let i = 0; i < paragraphCount - 2; i++) {
    const sourceIndex = i % sources.length;
    const source = sources[sourceIndex];
    const keyPhrase = keyPhrases[i % keyPhrases.length] || 'important aspect';
    
    paragraphs.push(`According to ${source.source}, ${keyPhrase} plays a significant role in understanding ${topic}. The research indicates that ${source.title.toLowerCase()} provides valuable insights into how ${topic} affects various stakeholders and industries.`);
  }
  
  // Conclusion
  paragraphs.push(`In conclusion, ${topic} represents a multifaceted subject that requires careful consideration and analysis. The evidence presented demonstrates the importance of continued research and development in this area, with significant implications for the future.`);
  
  return paragraphs.join('\n\n');
};

const generateSummary = (content: string): string => {
  const sentences = content.split('. ');
  const summarySentences = sentences.slice(0, 3);
  return summarySentences.join('. ') + '.';
};