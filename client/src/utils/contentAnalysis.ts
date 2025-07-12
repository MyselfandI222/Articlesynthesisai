// Content Analysis Service for Article Length Recommendations
import { Article } from '../types';

export interface ContentAnalysis {
  factCount: number;
  perspectiveCount: number;
  complexityScore: number;
  recommendedLength: 'short' | 'medium' | 'long';
  reasoning: string;
  keyTopics: string[];
  sourceTypes: string[];
  contentDepth: 'shallow' | 'moderate' | 'deep';
}

export interface LengthRecommendation {
  recommended: 'short' | 'medium' | 'long';
  confidence: number;
  reasoning: string;
  metrics: {
    factCount: number;
    perspectiveCount: number;
    sourceVariety: number;
    complexityScore: number;
  };
}

// Analyze content depth and recommend article length
export const analyzeContentAndRecommendLength = (articles: Article[]): LengthRecommendation => {
  if (articles.length === 0) {
    return {
      recommended: 'medium',
      confidence: 0.5,
      reasoning: 'No source articles available for analysis',
      metrics: {
        factCount: 0,
        perspectiveCount: 0,
        sourceVariety: 0,
        complexityScore: 0
      }
    };
  }

  // Analyze each article for facts and perspectives
  const analysis = articles.map(article => analyzeArticle(article));
  
  // Calculate aggregate metrics
  const totalFacts = analysis.reduce((sum, a) => sum + a.factCount, 0);
  const totalPerspectives = analysis.reduce((sum, a) => sum + a.perspectiveCount, 0);
  const averageComplexity = analysis.reduce((sum, a) => sum + a.complexityScore, 0) / analysis.length;
  
  // Calculate source variety (unique sources)
  const uniqueSources = new Set(articles.map(a => a.source?.toLowerCase().trim()).filter(Boolean));
  const sourceVariety = uniqueSources.size;
  
  // Calculate content depth score
  const contentDepthScore = calculateContentDepthScore(totalFacts, totalPerspectives, sourceVariety, averageComplexity);
  
  // Determine recommended length based on content analysis
  const lengthRecommendation = determineLengthRecommendation(
    totalFacts, 
    totalPerspectives, 
    sourceVariety, 
    contentDepthScore
  );
  
  return {
    recommended: lengthRecommendation.length,
    confidence: lengthRecommendation.confidence,
    reasoning: lengthRecommendation.reasoning,
    metrics: {
      factCount: totalFacts,
      perspectiveCount: totalPerspectives,
      sourceVariety,
      complexityScore: Math.round(averageComplexity * 100) / 100
    }
  };
};

// Analyze individual article for facts and perspectives
const analyzeArticle = (article: Article): ContentAnalysis => {
  const content = article.content || '';
  const title = article.title || '';
  const combinedText = `${title} ${content}`.toLowerCase();
  
  // Count facts (look for factual indicators)
  const factCount = countFacts(combinedText);
  
  // Count perspectives (look for opinion indicators)
  const perspectiveCount = countPerspectives(combinedText);
  
  // Calculate complexity score
  const complexityScore = calculateComplexityScore(combinedText);
  
  // Extract key topics
  const keyTopics = extractKeyTopics(combinedText);
  
  // Determine content depth
  const contentDepth = determineContentDepth(factCount, perspectiveCount, complexityScore);
  
  return {
    factCount,
    perspectiveCount,
    complexityScore,
    recommendedLength: 'medium', // Will be determined at aggregate level
    reasoning: `Found ${factCount} facts and ${perspectiveCount} perspectives`,
    keyTopics,
    sourceTypes: [article.source || 'Unknown'],
    contentDepth
  };
};

// Count factual statements in text
const countFacts = (text: string): number => {
  let factCount = 0;
  
  // Look for statistical information
  const statisticalPatterns = [
    /\d+%/g, // Percentages
    /\d+\s*(million|billion|thousand)/g, // Large numbers
    /\d+\s*(years?|months?|weeks?|days?)/g, // Time periods
    /\$\d+/g, // Money amounts
    /\d+\s*(people|users|customers)/g, // People counts
  ];
  
  statisticalPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) factCount += matches.length;
  });
  
  // Look for factual keywords
  const factualKeywords = [
    'according to', 'research shows', 'study found', 'data indicates',
    'statistics show', 'survey revealed', 'report states', 'evidence suggests',
    'findings indicate', 'analysis shows', 'results demonstrate', 'concluded that',
    'discovered that', 'revealed that', 'confirmed that', 'established that'
  ];
  
  factualKeywords.forEach(keyword => {
    const regex = new RegExp(keyword, 'gi');
    const matches = text.match(regex);
    if (matches) factCount += matches.length;
  });
  
  // Look for specific dates and locations
  const dateLocationPatterns = [
    /\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2},?\s+\d{4}\b/gi,
    /\b\d{1,2}\/\d{1,2}\/\d{4}\b/g,
    /\bin\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\s*,?\s*[A-Z][a-z]+/g, // Cities, States
  ];
  
  dateLocationPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) factCount += matches.length;
  });
  
  return factCount;
};

// Count different perspectives in text
const countPerspectives = (text: string): number => {
  let perspectiveCount = 0;
  
  // Look for opinion indicators
  const opinionIndicators = [
    'believes', 'thinks', 'feels', 'argues', 'claims', 'suggests',
    'proposes', 'recommends', 'advocates', 'criticizes', 'supports',
    'opposes', 'contends', 'maintains', 'asserts', 'insists'
  ];
  
  opinionIndicators.forEach(indicator => {
    const regex = new RegExp(`\\b${indicator}\\b`, 'gi');
    const matches = text.match(regex);
    if (matches) perspectiveCount += matches.length;
  });
  
  // Look for quoted statements (different voices)
  const quotePatterns = [
    /"[^"]+"/g, // Direct quotes
    /'[^']+'/g, // Single quotes
    /said\s+[^.]+/gi, // "said" statements
    /stated\s+[^.]+/gi, // "stated" statements
    /commented\s+[^.]+/gi, // "commented" statements
  ];
  
  quotePatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) perspectiveCount += matches.length;
  });
  
  // Look for contrasting viewpoints
  const contrastIndicators = [
    'however', 'but', 'although', 'despite', 'on the other hand',
    'in contrast', 'conversely', 'meanwhile', 'alternatively',
    'critics argue', 'supporters claim', 'opponents say'
  ];
  
  contrastIndicators.forEach(indicator => {
    const regex = new RegExp(indicator, 'gi');
    const matches = text.match(regex);
    if (matches) perspectiveCount += matches.length;
  });
  
  return perspectiveCount;
};

// Calculate complexity score based on various factors
const calculateComplexityScore = (text: string): number => {
  let score = 0;
  
  // Length factor (longer = more complex)
  const wordCount = text.split(/\s+/).length;
  score += Math.min(wordCount / 500, 1) * 0.3; // Max 0.3 for length
  
  // Vocabulary complexity (technical terms)
  const complexWords = [
    'implementation', 'infrastructure', 'methodology', 'comprehensive',
    'significant', 'substantial', 'analysis', 'evaluation', 'assessment',
    'investigation', 'examination', 'consideration', 'implications',
    'consequences', 'ramifications', 'perspective', 'framework'
  ];
  
  let complexWordCount = 0;
  complexWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = text.match(regex);
    if (matches) complexWordCount += matches.length;
  });
  
  score += Math.min(complexWordCount / 10, 1) * 0.3; // Max 0.3 for vocabulary
  
  // Sentence structure complexity
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const averageSentenceLength = sentences.reduce((sum, s) => sum + s.split(/\s+/).length, 0) / sentences.length;
  score += Math.min(averageSentenceLength / 25, 1) * 0.2; // Max 0.2 for sentence complexity
  
  // Topic complexity indicators
  const complexTopics = [
    'economic', 'political', 'scientific', 'technological', 'environmental',
    'medical', 'legal', 'financial', 'regulatory', 'strategic'
  ];
  
  let topicComplexityCount = 0;
  complexTopics.forEach(topic => {
    const regex = new RegExp(`\\b${topic}\\b`, 'gi');
    if (text.match(regex)) topicComplexityCount++;
  });
  
  score += Math.min(topicComplexityCount / 5, 1) * 0.2; // Max 0.2 for topic complexity
  
  return Math.min(score, 1); // Cap at 1.0
};

// Extract key topics from text
const extractKeyTopics = (text: string): string[] => {
  const topics: string[] = [];
  
  // Common topic categories
  const topicCategories = {
    'Technology': ['ai', 'artificial intelligence', 'machine learning', 'blockchain', 'crypto', 'software', 'tech'],
    'Business': ['market', 'economy', 'investment', 'company', 'corporate', 'financial', 'revenue'],
    'Politics': ['government', 'policy', 'election', 'political', 'congress', 'senate', 'legislation'],
    'Health': ['medical', 'health', 'disease', 'treatment', 'pharmaceutical', 'clinical', 'patient'],
    'Science': ['research', 'study', 'scientific', 'discovery', 'experiment', 'analysis', 'findings'],
    'Environment': ['climate', 'environmental', 'sustainability', 'renewable', 'carbon', 'pollution']
  };
  
  Object.entries(topicCategories).forEach(([category, keywords]) => {
    const hasKeywords = keywords.some(keyword => text.includes(keyword));
    if (hasKeywords) {
      topics.push(category);
    }
  });
  
  return topics;
};

// Determine content depth based on metrics
const determineContentDepth = (factCount: number, perspectiveCount: number, complexityScore: number): 'shallow' | 'moderate' | 'deep' => {
  const depthScore = (factCount * 0.4) + (perspectiveCount * 0.4) + (complexityScore * 10 * 0.2);
  
  if (depthScore >= 8) return 'deep';
  if (depthScore >= 4) return 'moderate';
  return 'shallow';
};

// Calculate overall content depth score
const calculateContentDepthScore = (factCount: number, perspectiveCount: number, sourceVariety: number, complexityScore: number): number => {
  // Weighted calculation
  const factScore = Math.min(factCount / 15, 1) * 0.35; // Max 15 facts = full score
  const perspectiveScore = Math.min(perspectiveCount / 10, 1) * 0.35; // Max 10 perspectives = full score
  const varietyScore = Math.min(sourceVariety / 8, 1) * 0.15; // Max 8 sources = full score
  const complexityScoreNormalized = complexityScore * 0.15; // Already 0-1 scale
  
  return factScore + perspectiveScore + varietyScore + complexityScoreNormalized;
};

// Determine recommended length based on content analysis
const determineLengthRecommendation = (
  factCount: number, 
  perspectiveCount: number, 
  sourceVariety: number, 
  contentDepthScore: number
): { length: 'short' | 'medium' | 'long'; confidence: number; reasoning: string } => {
  
  // High content depth = long article
  if (contentDepthScore >= 0.7) {
    return {
      length: 'long',
      confidence: 0.9,
      reasoning: `High content depth (${Math.round(contentDepthScore * 100)}%) with ${factCount} facts and ${perspectiveCount} perspectives from ${sourceVariety} sources requires comprehensive coverage`
    };
  }
  
  // Medium content depth = medium article
  if (contentDepthScore >= 0.4) {
    return {
      length: 'medium',
      confidence: 0.8,
      reasoning: `Moderate content depth (${Math.round(contentDepthScore * 100)}%) with ${factCount} facts and ${perspectiveCount} perspectives from ${sourceVariety} sources suits standard length`
    };
  }
  
  // Low content depth but many perspectives = medium article
  if (perspectiveCount >= 6) {
    return {
      length: 'medium',
      confidence: 0.7,
      reasoning: `Multiple perspectives (${perspectiveCount}) require balanced coverage despite lower fact count (${factCount})`
    };
  }
  
  // High fact count but few perspectives = medium article
  if (factCount >= 10) {
    return {
      length: 'medium',
      confidence: 0.7,
      reasoning: `High fact count (${factCount}) requires detailed explanation despite limited perspectives (${perspectiveCount})`
    };
  }
  
  // Low content depth = short article
  return {
    length: 'short',
    confidence: 0.8,
    reasoning: `Limited content depth (${Math.round(contentDepthScore * 100)}%) with ${factCount} facts and ${perspectiveCount} perspectives from ${sourceVariety} sources is best suited for concise coverage`
  };
};

// Get detailed content analysis for display
export const getDetailedContentAnalysis = (articles: Article[]): ContentAnalysis => {
  if (articles.length === 0) {
    return {
      factCount: 0,
      perspectiveCount: 0,
      complexityScore: 0,
      recommendedLength: 'medium',
      reasoning: 'No articles available for analysis',
      keyTopics: [],
      sourceTypes: [],
      contentDepth: 'shallow'
    };
  }

  const analysis = articles.map(article => analyzeArticle(article));
  
  const totalFacts = analysis.reduce((sum, a) => sum + a.factCount, 0);
  const totalPerspectives = analysis.reduce((sum, a) => sum + a.perspectiveCount, 0);
  const averageComplexity = analysis.reduce((sum, a) => sum + a.complexityScore, 0) / analysis.length;
  
  const allTopics = analysis.flatMap(a => a.keyTopics);
  const uniqueTopics = [...new Set(allTopics)];
  
  const sourceTypes = [...new Set(articles.map(a => a.source).filter(Boolean))];
  
  const contentDepthScore = calculateContentDepthScore(
    totalFacts, 
    totalPerspectives, 
    sourceTypes.length, 
    averageComplexity
  );
  
  const lengthRec = determineLengthRecommendation(
    totalFacts,
    totalPerspectives,
    sourceTypes.length,
    contentDepthScore
  );
  
  return {
    factCount: totalFacts,
    perspectiveCount: totalPerspectives,
    complexityScore: averageComplexity,
    recommendedLength: lengthRec.length,
    reasoning: lengthRec.reasoning,
    keyTopics: uniqueTopics,
    sourceTypes,
    contentDepth: contentDepthScore >= 0.7 ? 'deep' : contentDepthScore >= 0.4 ? 'moderate' : 'shallow'
  };
};