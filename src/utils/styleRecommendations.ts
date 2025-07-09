import { Article, WritingStyle } from '../types';

export interface StyleRecommendation {
  recommendedStyle: WritingStyle;
  recommendedTone: string;
  recommendedLength: 'short' | 'medium' | 'long';
  confidence: number;
  reasoning: string;
  lengthReasoning: string;
  articleCountAnalysis: string;
}

// Analyze articles and recommend writing style and tone
export const analyzeArticlesForStyle = (articles: Article[]): StyleRecommendation => {
  if (articles.length === 0) {
    return {
      recommendedStyle: 'blog',
      recommendedTone: 'neutral',
      recommendedLength: 'medium',
      confidence: 0,
      reasoning: 'No articles selected',
      lengthReasoning: 'Medium length recommended as default',
      articleCountAnalysis: 'Add articles to get personalized recommendations'
    };
  }

  const analysis = {
    sources: new Set<string>(),
    keywords: new Set<string>(),
    academicIndicators: 0,
    journalisticIndicators: 0,
    technicalIndicators: 0,
    businessIndicators: 0,
    opinionIndicators: 0,
    creativeIndicators: 0,
    totalArticles: articles.length,
    totalContentLength: 0,
    averageContentLength: 0,
    longFormSources: 0,
    shortFormSources: 0
  };

  // Analyze each article
  articles.forEach(article => {
    const source = article.source?.toLowerCase() || '';
    const title = article.title.toLowerCase();
    const content = article.content.toLowerCase();
    const combined = `${source} ${title} ${content}`;
    const contentLength = article.content.length;
    
    analysis.totalContentLength += contentLength;
    
    // Categorize sources by typical content length
    if (
      source.includes('twitter') ||
      source.includes('reddit') ||
      source.includes('news') && contentLength < 1000
    ) {
      analysis.shortFormSources++;
    } else if (
      source.includes('arxiv') ||
      source.includes('research') ||
      source.includes('academic') ||
      contentLength > 2000
    ) {
      analysis.longFormSources++;
    }

    analysis.sources.add(source);

    // Academic indicators
    if (
      source.includes('arxiv') ||
      source.includes('pubmed') ||
      source.includes('research') ||
      source.includes('university') ||
      source.includes('academic') ||
      combined.includes('study') ||
      combined.includes('research') ||
      combined.includes('peer-reviewed') ||
      combined.includes('methodology') ||
      combined.includes('hypothesis')
    ) {
      analysis.academicIndicators++;
    }

    // Journalistic indicators
    if (
      source.includes('news') ||
      source.includes('times') ||
      source.includes('post') ||
      source.includes('guardian') ||
      source.includes('reuters') ||
      source.includes('ap news') ||
      combined.includes('breaking') ||
      combined.includes('reported') ||
      combined.includes('according to') ||
      combined.includes('sources say')
    ) {
      analysis.journalisticIndicators++;
    }

    // Technical indicators
    if (
      source.includes('github') ||
      source.includes('stackoverflow') ||
      source.includes('tech') ||
      combined.includes('algorithm') ||
      combined.includes('implementation') ||
      combined.includes('code') ||
      combined.includes('technical') ||
      combined.includes('documentation') ||
      combined.includes('api') ||
      combined.includes('framework')
    ) {
      analysis.technicalIndicators++;
    }

    // Business indicators
    if (
      source.includes('bloomberg') ||
      source.includes('forbes') ||
      source.includes('business') ||
      source.includes('financial') ||
      source.includes('market') ||
      combined.includes('revenue') ||
      combined.includes('profit') ||
      combined.includes('investment') ||
      combined.includes('strategy') ||
      combined.includes('corporate')
    ) {
      analysis.businessIndicators++;
    }

    // Opinion indicators
    if (
      source.includes('blog') ||
      source.includes('medium') ||
      source.includes('opinion') ||
      source.includes('editorial') ||
      combined.includes('i believe') ||
      combined.includes('in my opinion') ||
      combined.includes('should') ||
      combined.includes('must') ||
      combined.includes('argue that')
    ) {
      analysis.opinionIndicators++;
    }

    // Creative indicators
    if (
      source.includes('creative') ||
      source.includes('art') ||
      source.includes('design') ||
      combined.includes('story') ||
      combined.includes('narrative') ||
      combined.includes('imagine') ||
      combined.includes('creative') ||
      combined.includes('artistic')
    ) {
      analysis.creativeIndicators++;
    }
  });

  analysis.averageContentLength = analysis.totalContentLength / analysis.totalArticles;
  // Determine recommended style based on analysis
  const styleScores = {
    academic: analysis.academicIndicators / analysis.totalArticles,
    journalistic: analysis.journalisticIndicators / analysis.totalArticles,
    technical: analysis.technicalIndicators / analysis.totalArticles,
    business: analysis.businessIndicators / analysis.totalArticles,
    opinion: analysis.opinionIndicators / analysis.totalArticles,
    creative: analysis.creativeIndicators / analysis.totalArticles,
    blog: 0.3 // Default baseline for blog style
  };

  // Find the highest scoring style
  const recommendedStyle = Object.entries(styleScores).reduce((a, b) => 
    styleScores[a[0] as WritingStyle] > styleScores[b[0] as WritingStyle] ? a : b
  )[0] as WritingStyle;

  // Determine recommended tone
  let recommendedTone = 'neutral';
  let toneReasoning = '';

  if (analysis.academicIndicators > analysis.totalArticles * 0.5) {
    recommendedTone = 'formal';
    toneReasoning = 'academic sources suggest formal tone';
  } else if (analysis.businessIndicators > analysis.totalArticles * 0.4) {
    recommendedTone = 'authoritative';
    toneReasoning = 'business sources suggest authoritative tone';
  } else if (analysis.opinionIndicators > analysis.totalArticles * 0.4) {
    recommendedTone = 'conversational';
    toneReasoning = 'opinion pieces suggest conversational tone';
  } else if (analysis.technicalIndicators > analysis.totalArticles * 0.5) {
    recommendedTone = 'formal';
    toneReasoning = 'technical sources suggest formal tone';
  } else if (analysis.creativeIndicators > analysis.totalArticles * 0.3) {
    recommendedTone = 'enthusiastic';
    toneReasoning = 'creative sources suggest enthusiastic tone';
  }

  // Determine recommended length based on multiple factors
  const { recommendedLength, lengthReasoning } = determineRecommendedLength(analysis, recommendedStyle);

  // Calculate confidence based on how clear the indicators are
  const maxScore = Math.max(...Object.values(styleScores));
  const confidence = Math.min(maxScore * 100, 95); // Cap at 95%

  // Generate reasoning
  const topSources = Array.from(analysis.sources).slice(0, 3);
  const reasoning = generateReasoning(recommendedStyle, recommendedTone, analysis, topSources);
  const articleCountAnalysis = generateArticleCountAnalysis(analysis);

  return {
    recommendedStyle,
    recommendedTone,
    recommendedLength,
    confidence: Math.round(confidence),
    reasoning,
    lengthReasoning,
    articleCountAnalysis
  };
};

// Determine recommended article length based on analysis
const determineRecommendedLength = (
  analysis: any, 
  style: WritingStyle
): { recommendedLength: 'short' | 'medium' | 'long'; lengthReasoning: string } => {
  const factors = [];
  let lengthScore = 0; // -1 = short, 0 = medium, 1 = long
  
  // Factor 1: Number of articles (more articles = longer synthesis needed)
  if (analysis.totalArticles >= 5) {
    lengthScore += 1;
    factors.push(`${analysis.totalArticles} articles provide substantial content for comprehensive analysis`);
  } else if (analysis.totalArticles <= 2) {
    lengthScore -= 1;
    factors.push(`${analysis.totalArticles} articles suggest focused, concise synthesis`);
  } else {
    factors.push(`${analysis.totalArticles} articles allow for balanced coverage`);
  }
  
  // Factor 2: Average content length of source articles
  if (analysis.averageContentLength > 2000) {
    lengthScore += 1;
    factors.push('lengthy source articles suggest detailed synthesis');
  } else if (analysis.averageContentLength < 800) {
    lengthScore -= 1;
    factors.push('concise source articles suggest brief synthesis');
  }
  
  // Factor 3: Writing style preferences
  if (style === 'academic' || style === 'technical') {
    lengthScore += 1;
    factors.push(`${style} style typically requires detailed explanation`);
  } else if (style === 'journalistic') {
    lengthScore -= 0.5;
    factors.push('journalistic style favors concise, focused reporting');
  } else if (style === 'blog') {
    factors.push('blog style allows flexible length based on content');
  }
  
  // Factor 4: Source type distribution
  if (analysis.longFormSources > analysis.totalArticles * 0.6) {
    lengthScore += 1;
    factors.push('research and academic sources benefit from thorough analysis');
  } else if (analysis.shortFormSources > analysis.totalArticles * 0.6) {
    lengthScore -= 1;
    factors.push('news and social sources work well with concise synthesis');
  }
  
  // Determine final recommendation
  let recommendedLength: 'short' | 'medium' | 'long';
  if (lengthScore >= 1.5) {
    recommendedLength = 'long';
  } else if (lengthScore <= -1) {
    recommendedLength = 'short';
  } else {
    recommendedLength = 'medium';
  }
  
  const lengthReasoning = factors.join('; ');
  
  return { recommendedLength, lengthReasoning };
};

// Generate analysis of article count and its implications
const generateArticleCountAnalysis = (analysis: any): string => {
  const count = analysis.totalArticles;
  
  if (count === 1) {
    return 'Single article selected - consider adding more sources for balanced perspective and richer synthesis';
  } else if (count === 2) {
    return 'Two articles provide basic comparison - adding 1-2 more sources would enhance depth and credibility';
  } else if (count >= 3 && count <= 5) {
    return `${count} articles provide good foundation for comprehensive synthesis with multiple perspectives`;
  } else if (count >= 6 && count <= 8) {
    return `${count} articles offer excellent source diversity - ideal for thorough, well-researched synthesis`;
  } else if (count > 8) {
    return `${count} articles provide extensive coverage - consider focusing on the most relevant sources to maintain clarity`;
  }
  
  return 'Good article selection for synthesis';
};
const generateReasoning = (
  style: WritingStyle,
  tone: string,
  analysis: any,
  topSources: string[]
): string => {
  const reasons = [];

  // Style reasoning
  switch (style) {
    case 'academic':
      reasons.push(`Academic style recommended due to research-focused sources (${analysis.academicIndicators}/${analysis.totalArticles} articles)`);
      break;
    case 'journalistic':
      reasons.push(`Journalistic style recommended due to news sources (${analysis.journalisticIndicators}/${analysis.totalArticles} articles)`);
      break;
    case 'technical':
      reasons.push(`Technical style recommended due to technical sources (${analysis.technicalIndicators}/${analysis.totalArticles} articles)`);
      break;
    case 'business':
      reasons.push(`Business style recommended due to business/financial sources (${analysis.businessIndicators}/${analysis.totalArticles} articles)`);
      break;
    case 'opinion':
      reasons.push(`Opinion style recommended due to editorial/blog sources (${analysis.opinionIndicators}/${analysis.totalArticles} articles)`);
      break;
    case 'creative':
      reasons.push(`Creative style recommended due to artistic/creative sources (${analysis.creativeIndicators}/${analysis.totalArticles} articles)`);
      break;
    default:
      reasons.push('Blog style recommended for general audience appeal');
  }

  // Add source information
  if (topSources.length > 0) {
    reasons.push(`Based on sources like: ${topSources.join(', ')}`);
  }

  return reasons.join('. ');
};

// Get style description for UI
export const getStyleDescription = (style: WritingStyle): string => {
  const descriptions = {
    academic: 'Formal, research-based writing with citations and scholarly tone',
    journalistic: 'Objective, fact-based reporting with clear structure',
    blog: 'Engaging, accessible writing for general audiences',
    technical: 'Detailed, instructional content with precise terminology',
    creative: 'Expressive, narrative-driven writing with artistic flair',
    business: 'Professional, strategic content for business audiences',
    opinion: 'Persuasive, argumentative writing with clear viewpoints'
  };
  return descriptions[style];
};

// Get tone description for UI
export const getToneDescription = (tone: string): string => {
  const descriptions = {
    neutral: 'Balanced and objective presentation',
    formal: 'Professional and academic language',
    casual: 'Relaxed and conversational approach',
    enthusiastic: 'Energetic and engaging delivery',
    authoritative: 'Confident and expert positioning',
    conversational: 'Friendly and approachable style'
  };
  return descriptions[tone] || 'Balanced presentation';
};