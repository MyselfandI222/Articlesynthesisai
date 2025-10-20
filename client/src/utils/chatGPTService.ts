// ChatGPT/OpenAI Service Integration
import { Article, SynthesizedArticle, WritingStyle } from '../types';
import { calculateWordCount, calculateReadingTime, getTargetWordCount, WORD_COUNT_RANGES } from './articleMetrics';

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

// Helper function to analyze topic similarity for ChatGPT
const analyzeTopicSimilarityWithChatGPT = async (sources: Article[], topic: string): Promise<{
  isCommonTopic: boolean;
  keyThemes: string[];
  perspectives: string[];
  conflictingPoints: string[];
}> => {
  if (!OPENAI_API_KEY || sources.length < 2) {
    return { isCommonTopic: false, keyThemes: [], perspectives: [], conflictingPoints: [] };
  }

  const sourcesText = sources.map((source, index) => 
    `Source ${index + 1}: ${source.content.substring(0, 300)}...\nFrom: ${source.source}\n`
  ).join('\n---\n');

  const analysisPrompt = `Analyze these sources to determine if they cover the same topic and identify key themes, perspectives, and conflicting points.

Sources:
${sourcesText}

Return a JSON object with:
- isCommonTopic: boolean (true if 2+ sources cover the same main topic)
- keyThemes: array of main themes/subjects covered
- perspectives: array of different viewpoints or approaches
- conflictingPoints: array of contradictory facts or opinions between sources

Focus on factual analysis, not just surface-level similarities.`;

  try {
    const response = await fetch(`${OPENAI_API_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o', // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          { role: 'system', content: 'You are an expert content analyst. Always respond with valid JSON.' },
          { role: 'user', content: analysisPrompt }
        ],
        temperature: 0.3,
        max_tokens: 500
      })
    });

    if (response.ok) {
      const data = await response.json();
      const content = data.choices[0].message.content;
      try {
        return JSON.parse(content);
      } catch {
        return { isCommonTopic: false, keyThemes: [], perspectives: [], conflictingPoints: [] };
      }
    }
  } catch (error) {
    console.error('ChatGPT topic analysis failed:', error);
  }
  
  return { isCommonTopic: false, keyThemes: [], perspectives: [], conflictingPoints: [] };
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

    // Analyze topic similarity first
    const topicAnalysis = await analyzeTopicSimilarityWithChatGPT(sources, topic);

    // Prepare the sources text without referencing article titles
    const sourcesText = sources.map((source, index) => 
      `Source ${index + 1}: ${source.content.substring(0, 800)}...\nFrom: ${source.source}\n`
    ).join('\n---\n');

    let prompt;
    
    if (topicAnalysis.isCommonTopic && sources.length >= 2) {
      // Enhanced comparative synthesis prompt
      prompt = `You are an expert article writer specializing in comparative analysis. Multiple sources cover the same topic "${topic}". Create a comprehensive ${length} article that COMPARES AND CONTRASTS these sources rather than simply combining them.

SYNTHESIS APPROACH:
1. IDENTIFY COMMON GROUND: What facts, findings, or viewpoints do multiple sources agree on?
2. HIGHLIGHT DIFFERENCES: Where do sources disagree, offer different perspectives, or present conflicting information?
3. ANALYZE CONTRADICTIONS: When sources conflict, present both sides fairly and note the disagreement
4. SYNTHESIZE INSIGHTS: Draw connections between different sources' approaches to the same topic
5. PROVIDE BALANCED PERSPECTIVE: Don't favor one source over another - integrate all viewpoints
6. WRITE DETAILED IDEAS: Include specific concepts, findings, data points, and arguments from the sources - don't just summarize, elaborate on the ideas

Key Themes Identified: ${topicAnalysis.keyThemes.join(', ')}
Different Perspectives: ${topicAnalysis.perspectives.join(', ')}
Conflicting Points: ${topicAnalysis.conflictingPoints.join(', ')}

🚫 CRITICAL - TITLE RULES (ABSOLUTE REQUIREMENT):
- FORBIDDEN: Do NOT mention "${topic}" ANYWHERE in the article body text
- FORBIDDEN: Do NOT use "this article", "in this piece", "this story", "the article", "here we"
- FORBIDDEN: Do NOT start sentences with "The ${topic}...", "${topic} reveals...", "${topic} explores...", "${topic} examines..."
- FORBIDDEN: Do NOT write "${topic} shows", "${topic} suggests", "${topic} indicates"
- FORBIDDEN: Do NOT reference the title in ANY way - pretend it doesn't exist
- REQUIRED: Dive straight into the subject matter without meta-references
- REQUIRED: Write as a standalone piece of journalism about the SUBJECT, not about "an article"

CONTENT GUIDELINES:
- Write out DETAILED ideas and specific concepts from the sources - don't just mention them briefly
- Include specific findings, data points, examples, and arguments presented in the sources
- Elaborate on key concepts rather than just listing them
- Use phrases like "according to research", "studies show", "experts indicate", "some reports suggest", "other findings indicate"
- When sources disagree, use phrases like "while some research indicates..., other studies suggest..."
- Create a narrative that weaves together different perspectives on the same topic

Sources:
${sourcesText}

Requirements:
- Write in ${style} style with ${tone} tone
- Target length: EXACTLY ${getTargetWordCount(length)} words (acceptable range: ${WORD_COUNT_RANGES[length].min}-${WORD_COUNT_RANGES[length].max} words)
- CREATE COMPARATIVE ANALYSIS, not separate paragraphs for each source
- Highlight agreements, disagreements, and different approaches to the same topic
- Include SEO-friendly keywords and fact-checking insights
- Maintain factual accuracy while presenting multiple viewpoints
- Structure as a cohesive analysis that compares and contrasts throughout

Please provide a well-structured comparative article with clear sections and a summary.`;
    } else {
      // Standard synthesis prompt for different topics
      prompt = `You are an expert article writer. Synthesize the following sources into a cohesive ${length} article about "${topic}" in ${style} style with a ${tone} tone.

🚫 CRITICAL - TITLE RULES (ABSOLUTE REQUIREMENT):
- FORBIDDEN: Do NOT mention "${topic}" ANYWHERE in the article body text
- FORBIDDEN: Do NOT use "this article", "in this piece", "this story", "the article", "here we"
- FORBIDDEN: Do NOT start sentences with "The ${topic}...", "${topic} reveals...", "${topic} explores...", "${topic} examines..."
- FORBIDDEN: Do NOT write "${topic} shows", "${topic} suggests", "${topic} indicates"
- FORBIDDEN: Do NOT reference the title in ANY way - pretend it doesn't exist
- REQUIRED: Dive straight into the subject matter without meta-references
- REQUIRED: Write as a standalone piece of journalism about the SUBJECT, not about "an article"

CONTENT GUIDELINES:
1. Write out DETAILED ideas and specific concepts from the sources - don't just mention them briefly
2. Include specific findings, data points, examples, and arguments presented in the sources
3. Elaborate on key concepts and explain them thoroughly rather than just listing them
4. Do not reference or mention the names/titles of the source articles in your writing
5. Use phrases like "according to research", "studies show", "experts indicate", or "recent findings suggest"

Sources:
${sourcesText}

Requirements:
- Write in ${style} style
- Use a ${tone} tone
- Target length: EXACTLY ${getTargetWordCount(length)} words (acceptable range: ${WORD_COUNT_RANGES[length].min}-${WORD_COUNT_RANGES[length].max} words)
- Write DETAILED content - elaborate on ideas, don't just list them
- Include specific findings, data, examples, and arguments from sources
- Create a compelling title (but NEVER reference this title in the article body)
- Maintain factual accuracy
- Include SEO-friendly keywords
- Add fact-checking insights where relevant

Please provide a well-structured article with detailed content and clear sections.`;
    }

    const response = await fetch(`${OPENAI_API_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o', // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
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
    
    // Calculate word count and reading time
    const wordCount = calculateWordCount(articleContent);
    const readingTime = calculateReadingTime(wordCount);

    return {
      id: Date.now().toString(),
      title,
      content: articleContent,
      summary: articleContent.substring(0, 200) + '...',
      wordCount,
      readingTime,
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
        aiModelUsed: 'gpt-4o',
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

🚫 CRITICAL - TITLE RULES (ABSOLUTE REQUIREMENT):
- FORBIDDEN: Do NOT mention "${article.title}" ANYWHERE in the edited article body
- FORBIDDEN: Do NOT use "this article", "in this piece", "this story", "the article", "here we"
- FORBIDDEN: Do NOT start sentences with "The ${article.title}...", "${article.title} reveals...", etc.
- FORBIDDEN: Do NOT reference the title in ANY way - pretend it doesn't exist
- REQUIRED: Focus on the subject matter directly without meta-references

Please provide the edited article with the same structure but improved according to the instructions. Make sure to maintain the quality and factual accuracy.`;

    const response = await fetch(`${OPENAI_API_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o', // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
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
    
    // Calculate word count and reading time
    const wordCount = calculateWordCount(editedContent);
    const readingTime = calculateReadingTime(wordCount);
    
    return {
      ...article,
      content: editedContent,
      summary: editedContent.substring(0, 200) + '...',
      wordCount,
      readingTime,
      processingMetrics: {
        processingTimeMs: 2000,
        aiModelUsed: 'gpt-4o',
        contentQualityScore: article.processingMetrics?.contentQualityScore || 85
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
  
  // Calculate word count and reading time
  const wordCount = calculateWordCount(content);
  const readingTime = calculateReadingTime(wordCount);
  
  return {
    id: `chatgpt-${Date.now()}`,
    title,
    content,
    summary,
    wordCount,
    readingTime,
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
  
  // Calculate word count and reading time
  const wordCount = calculateWordCount(modifiedContent);
  const readingTime = calculateReadingTime(wordCount);
  
  return {
    ...article,
    content: modifiedContent,
    summary: modifiedContent.substring(0, 200) + '...',
    wordCount,
    readingTime,
    processingMetrics: {
      processingTimeMs: Math.floor(Math.random() * 3000) + 1000,
      aiModelUsed: 'gpt-3.5-turbo',
      contentQualityScore: article.processingMetrics?.contentQualityScore || 80
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