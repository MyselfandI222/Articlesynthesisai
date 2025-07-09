import { Article, WritingStyle } from '../types';

export interface TitleRecommendation {
  title: string;
  reasoning: string;
  style: 'catchy' | 'professional' | 'descriptive' | 'question' | 'listicle' | 'how-to';
  confidence: number;
  seoScore: number;
  engagementPotential: number;
}

export interface TitleAnalysis {
  mainTopics: string[];
  keyEntities: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  urgency: 'low' | 'medium' | 'high';
  complexity: 'simple' | 'moderate' | 'complex';
  industry: string;
  targetAudience: string;
  contentThemes: string[];
}

// Analyze articles to understand content for title generation
export const analyzeArticlesForTitles = (articles: Article[]): TitleAnalysis => {
  if (articles.length === 0) {
    return {
      mainTopics: [],
      keyEntities: [],
      sentiment: 'neutral',
      urgency: 'low',
      complexity: 'simple',
      industry: 'general',
      targetAudience: 'general',
      contentThemes: []
    };
  }

  const combinedContent = articles.map(a => `${a.title} ${a.content}`).join(' ').toLowerCase();
  const combinedTitles = articles.map(a => a.title).join(' ').toLowerCase();
  
  // Extract main topics using frequency analysis
  const mainTopics = extractMainTopics(combinedContent);
  
  // Extract key entities (people, places, organizations)
  const keyEntities = extractKeyEntities(combinedContent);
  
  // Analyze sentiment
  const sentiment = analyzeSentiment(combinedContent);
  
  // Determine urgency level
  const urgency = analyzeUrgency(combinedTitles, combinedContent);
  
  // Assess complexity
  const complexity = analyzeComplexity(combinedContent);
  
  // Identify industry/domain
  const industry = identifyIndustry(combinedContent);
  
  // Determine target audience
  const targetAudience = identifyTargetAudience(combinedContent, industry);
  
  // Extract content themes
  const contentThemes = extractContentThemes(combinedContent);

  return {
    mainTopics,
    keyEntities,
    sentiment,
    urgency,
    complexity,
    industry,
    targetAudience,
    contentThemes
  };
};

// Generate AI-powered title recommendations
export const generateTitleRecommendations = (
  articles: Article[],
  topic: string,
  style: WritingStyle,
  tone: string
): TitleRecommendation[] => {
  const analysis = analyzeArticlesForTitles(articles);
  const recommendations: TitleRecommendation[] = [];
  
  // Generate different types of titles
  recommendations.push(...generateCatchyTitles(analysis, topic, style, tone));
  recommendations.push(...generateProfessionalTitles(analysis, topic, style, tone));
  recommendations.push(...generateDescriptiveTitles(analysis, topic, style, tone));
  recommendations.push(...generateQuestionTitles(analysis, topic, style, tone));
  recommendations.push(...generateListicleTitles(analysis, topic, style, tone));
  recommendations.push(...generateHowToTitles(analysis, topic, style, tone));
  
  // Sort by confidence and engagement potential
  return recommendations
    .sort((a, b) => (b.confidence + b.engagementPotential) - (a.confidence + a.engagementPotential))
    .slice(0, 8); // Return top 8 recommendations
};

// Extract main topics from content
const extractMainTopics = (content: string): string[] => {
  const words = content.split(/\s+/);
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those']);
  
  const wordCount = new Map<string, number>();
  words.forEach(word => {
    const cleaned = word.replace(/[^\w]/g, '').toLowerCase();
    if (cleaned.length > 3 && !stopWords.has(cleaned)) {
      wordCount.set(cleaned, (wordCount.get(cleaned) || 0) + 1);
    }
  });
  
  return Array.from(wordCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word);
};

// Extract key entities (simplified NER)
const extractKeyEntities = (content: string): string[] => {
  const entities: string[] = [];
  
  // Look for capitalized words that might be entities
  const words = content.split(/\s+/);
  const capitalizedWords = words.filter(word => 
    /^[A-Z][a-z]+/.test(word) && word.length > 2
  );
  
  // Count frequency of capitalized words
  const entityCount = new Map<string, number>();
  capitalizedWords.forEach(word => {
    const cleaned = word.replace(/[^\w]/g, '');
    entityCount.set(cleaned, (entityCount.get(cleaned) || 0) + 1);
  });
  
  // Return most frequent entities
  return Array.from(entityCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([entity]) => entity);
};

// Analyze sentiment
const analyzeSentiment = (content: string): 'positive' | 'neutral' | 'negative' => {
  const positiveWords = ['success', 'growth', 'innovation', 'breakthrough', 'achievement', 'excellent', 'outstanding', 'positive', 'good', 'great', 'amazing', 'wonderful', 'beneficial', 'effective', 'valuable', 'promising', 'optimistic'];
  const negativeWords = ['problem', 'issue', 'crisis', 'failure', 'decline', 'risk', 'threat', 'concern', 'negative', 'bad', 'poor', 'terrible', 'dangerous', 'harmful', 'critical', 'serious', 'urgent', 'challenging'];
  
  let positiveScore = 0;
  let negativeScore = 0;
  
  positiveWords.forEach(word => {
    if (content.includes(word)) positiveScore++;
  });
  
  negativeWords.forEach(word => {
    if (content.includes(word)) negativeScore++;
  });
  
  if (positiveScore > negativeScore + 1) return 'positive';
  if (negativeScore > positiveScore + 1) return 'negative';
  return 'neutral';
};

// Analyze urgency level
const analyzeUrgency = (titles: string, content: string): 'low' | 'medium' | 'high' => {
  const urgentWords = ['breaking', 'urgent', 'immediate', 'crisis', 'emergency', 'alert', 'warning', 'critical', 'now', 'today', 'just in'];
  const mediumUrgencyWords = ['important', 'significant', 'major', 'key', 'essential', 'crucial', 'vital', 'pressing'];
  
  const combined = `${titles} ${content}`;
  
  const urgentCount = urgentWords.filter(word => combined.includes(word)).length;
  const mediumCount = mediumUrgencyWords.filter(word => combined.includes(word)).length;
  
  if (urgentCount >= 2) return 'high';
  if (urgentCount >= 1 || mediumCount >= 3) return 'medium';
  return 'low';
};

// Analyze content complexity
const analyzeComplexity = (content: string): 'simple' | 'moderate' | 'complex' => {
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const avgSentenceLength = sentences.reduce((sum, s) => sum + s.split(' ').length, 0) / sentences.length;
  
  const complexWords = content.match(/\b\w{8,}\b/g)?.length || 0;
  const totalWords = content.split(/\s+/).length;
  const complexWordRatio = complexWords / totalWords;
  
  if (avgSentenceLength > 20 || complexWordRatio > 0.2) return 'complex';
  if (avgSentenceLength > 15 || complexWordRatio > 0.1) return 'moderate';
  return 'simple';
};

// Identify industry/domain
const identifyIndustry = (content: string): string => {
  const industries = {
    technology: ['technology', 'software', 'ai', 'artificial intelligence', 'machine learning', 'computer', 'digital', 'tech', 'programming', 'algorithm', 'data', 'cyber', 'internet'],
    healthcare: ['health', 'medical', 'medicine', 'doctor', 'patient', 'treatment', 'therapy', 'hospital', 'clinical', 'pharmaceutical', 'wellness', 'disease'],
    business: ['business', 'company', 'corporate', 'market', 'finance', 'financial', 'investment', 'revenue', 'profit', 'strategy', 'management', 'enterprise'],
    politics: ['politics', 'government', 'policy', 'election', 'democracy', 'political', 'legislation', 'congress', 'senate', 'vote', 'campaign'],
    environment: ['environment', 'climate', 'sustainability', 'green', 'renewable', 'energy', 'carbon', 'pollution', 'conservation', 'ecosystem'],
    sports: ['sport', 'game', 'team', 'player', 'competition', 'tournament', 'athletic', 'fitness', 'training', 'performance'],
    entertainment: ['entertainment', 'movie', 'film', 'music', 'celebrity', 'show', 'performance', 'artist', 'culture', 'media']
  };
  
  let maxScore = 0;
  let detectedIndustry = 'general';
  
  Object.entries(industries).forEach(([industry, keywords]) => {
    const score = keywords.reduce((count, keyword) => {
      return count + (content.split(keyword).length - 1);
    }, 0);
    
    if (score > maxScore) {
      maxScore = score;
      detectedIndustry = industry;
    }
  });
  
  return detectedIndustry;
};

// Identify target audience
const identifyTargetAudience = (content: string, industry: string): string => {
  const audienceIndicators = {
    'professionals': ['professional', 'industry', 'expert', 'specialist', 'executive', 'manager', 'analyst'],
    'consumers': ['consumer', 'customer', 'user', 'people', 'public', 'everyone', 'anyone'],
    'investors': ['investor', 'investment', 'stock', 'market', 'financial', 'portfolio', 'returns'],
    'students': ['student', 'education', 'learning', 'academic', 'university', 'college', 'research'],
    'developers': ['developer', 'programming', 'code', 'software', 'technical', 'engineering', 'api']
  };
  
  let maxScore = 0;
  let targetAudience = 'general';
  
  Object.entries(audienceIndicators).forEach(([audience, keywords]) => {
    const score = keywords.reduce((count, keyword) => {
      return count + (content.split(keyword).length - 1);
    }, 0);
    
    if (score > maxScore) {
      maxScore = score;
      targetAudience = audience;
    }
  });
  
  // Industry-specific audience defaults
  if (targetAudience === 'general') {
    const industryAudiences = {
      technology: 'professionals',
      healthcare: 'professionals',
      business: 'professionals',
      politics: 'consumers',
      environment: 'consumers',
      sports: 'consumers',
      entertainment: 'consumers'
    };
    targetAudience = industryAudiences[industry] || 'general';
  }
  
  return targetAudience;
};

// Extract content themes
const extractContentThemes = (content: string): string[] => {
  const themes = [];
  
  if (content.includes('innovation') || content.includes('breakthrough') || content.includes('revolutionary')) {
    themes.push('innovation');
  }
  if (content.includes('analysis') || content.includes('study') || content.includes('research')) {
    themes.push('analysis');
  }
  if (content.includes('future') || content.includes('prediction') || content.includes('forecast')) {
    themes.push('future trends');
  }
  if (content.includes('comparison') || content.includes('versus') || content.includes('vs')) {
    themes.push('comparison');
  }
  if (content.includes('guide') || content.includes('how to') || content.includes('tutorial')) {
    themes.push('educational');
  }
  if (content.includes('impact') || content.includes('effect') || content.includes('influence')) {
    themes.push('impact analysis');
  }
  
  return themes;
};

// Generate catchy titles
const generateCatchyTitles = (analysis: TitleAnalysis, topic: string, style: WritingStyle, tone: string): TitleRecommendation[] => {
  const titles: TitleRecommendation[] = [];
  const mainTopic = analysis.mainTopics[0] || topic;
  
  // Power words for catchiness
  const powerWords = analysis.urgency === 'high' 
    ? ['Revolutionary', 'Shocking', 'Explosive', 'Game-Changing', 'Breakthrough']
    : analysis.sentiment === 'positive'
    ? ['Amazing', 'Incredible', 'Stunning', 'Remarkable', 'Extraordinary']
    : ['Surprising', 'Unexpected', 'Hidden', 'Secret', 'Unknown'];
  
  powerWords.forEach(powerWord => {
    const title = `${powerWord} ${topic}: What Everyone Needs to Know`;
    titles.push({
      title,
      reasoning: `Uses power word "${powerWord}" to grab attention and creates curiosity with "What Everyone Needs to Know"`,
      style: 'catchy',
      confidence: 85,
      seoScore: 75,
      engagementPotential: 90
    });
  });
  
  // Industry-specific catchy titles
  if (analysis.industry !== 'general') {
    const title = `The ${topic} Revolution: Why ${analysis.industry.charAt(0).toUpperCase() + analysis.industry.slice(1)} Will Never Be the Same`;
    titles.push({
      title,
      reasoning: `Combines topic with industry context and uses "revolution" to suggest major change`,
      style: 'catchy',
      confidence: 80,
      seoScore: 85,
      engagementPotential: 85
    });
  }
  
  return titles.slice(0, 2);
};

// Generate professional titles
const generateProfessionalTitles = (analysis: TitleAnalysis, topic: string, style: WritingStyle, tone: string): TitleRecommendation[] => {
  const titles: TitleRecommendation[] = [];
  
  // Analysis-focused titles
  if (analysis.contentThemes.includes('analysis')) {
    const title = `Comprehensive Analysis: ${topic} and Its Industry Implications`;
    titles.push({
      title,
      reasoning: 'Professional tone with "Comprehensive Analysis" appeals to business audiences seeking detailed insights',
      style: 'professional',
      confidence: 90,
      seoScore: 80,
      engagementPotential: 70
    });
  }
  
  // Strategic perspective titles
  const title = `Strategic Insights: Understanding ${topic} in Today's Market`;
  titles.push({
    title,
    reasoning: 'Uses "Strategic Insights" to appeal to decision-makers and professionals',
    style: 'professional',
    confidence: 85,
    seoScore: 85,
    engagementPotential: 75
  });
  
  return titles.slice(0, 2);
};

// Generate descriptive titles
const generateDescriptiveTitles = (analysis: TitleAnalysis, topic: string, style: WritingStyle, tone: string): TitleRecommendation[] => {
  const titles: TitleRecommendation[] = [];
  
  // Multi-topic descriptive title
  if (analysis.mainTopics.length >= 2) {
    const title = `${topic}: Exploring ${analysis.mainTopics.slice(0, 2).join(' and ')} in Modern Context`;
    titles.push({
      title,
      reasoning: `Descriptive title that clearly outlines the main topics: ${analysis.mainTopics.slice(0, 2).join(' and ')}`,
      style: 'descriptive',
      confidence: 80,
      seoScore: 90,
      engagementPotential: 65
    });
  }
  
  // Entity-focused descriptive title
  if (analysis.keyEntities.length > 0) {
    const title = `${topic}: Key Developments and Insights from ${analysis.keyEntities[0]}`;
    titles.push({
      title,
      reasoning: `Incorporates key entity "${analysis.keyEntities[0]}" to provide specific context and authority`,
      style: 'descriptive',
      confidence: 75,
      seoScore: 85,
      engagementPotential: 70
    });
  }
  
  return titles.slice(0, 1);
};

// Generate question titles
const generateQuestionTitles = (analysis: TitleAnalysis, topic: string, style: WritingStyle, tone: string): TitleRecommendation[] => {
  const titles: TitleRecommendation[] = [];
  
  // Future-focused questions
  if (analysis.contentThemes.includes('future trends')) {
    const title = `What Does the Future Hold for ${topic}?`;
    titles.push({
      title,
      reasoning: 'Question format creates curiosity and engagement, focusing on future implications',
      style: 'question',
      confidence: 80,
      seoScore: 75,
      engagementPotential: 85
    });
  }
  
  // Impact questions
  const title = `How Will ${topic} Change ${analysis.industry === 'general' ? 'Our World' : analysis.industry}?`;
  titles.push({
    title,
    reasoning: `Question about change and impact appeals to readers wanting to understand consequences`,
    style: 'question',
    confidence: 85,
    seoScore: 80,
    engagementPotential: 90
  });
  
  return titles.slice(0, 1);
};

// Generate listicle titles
const generateListicleTitles = (analysis: TitleAnalysis, topic: string, style: WritingStyle, tone: string): TitleRecommendation[] => {
  const titles: TitleRecommendation[] = [];
  
  // Key points listicle
  const title = `5 Key Things You Need to Know About ${topic}`;
  titles.push({
    title,
    reasoning: 'Listicle format with specific number creates clear expectations and easy consumption',
    style: 'listicle',
    confidence: 85,
    seoScore: 85,
    engagementPotential: 80
  });
  
  // Industry-specific listicle
  if (analysis.industry !== 'general') {
    const industryTitle = `7 Ways ${topic} Is Transforming ${analysis.industry.charAt(0).toUpperCase() + analysis.industry.slice(1)}`;
    titles.push({
      title: industryTitle,
      reasoning: `Industry-specific listicle appeals to ${analysis.industry} professionals and stakeholders`,
      style: 'listicle',
      confidence: 80,
      seoScore: 90,
      engagementPotential: 85
    });
  }
  
  return titles.slice(0, 1);
};

// Generate how-to titles
const generateHowToTitles = (analysis: TitleAnalysis, topic: string, style: WritingStyle, tone: string): TitleRecommendation[] => {
  const titles: TitleRecommendation[] = [];
  
  // Understanding-focused how-to
  const title = `How to Understand ${topic}: A Complete Guide`;
  titles.push({
    title,
    reasoning: 'How-to format provides clear value proposition and "Complete Guide" suggests comprehensive coverage',
    style: 'how-to',
    confidence: 80,
    seoScore: 95,
    engagementPotential: 75
  });
  
  return titles.slice(0, 1);
};

// Calculate overall title score
export const calculateTitleScore = (recommendation: TitleRecommendation): number => {
  return Math.round((recommendation.confidence * 0.4 + recommendation.seoScore * 0.3 + recommendation.engagementPotential * 0.3));
};

// Get title style description
export const getTitleStyleDescription = (style: string): string => {
  const descriptions = {
    catchy: 'Attention-grabbing titles designed to maximize clicks and engagement',
    professional: 'Formal, business-appropriate titles for professional audiences',
    descriptive: 'Clear, informative titles that accurately describe the content',
    question: 'Question-based titles that create curiosity and encourage reading',
    listicle: 'Numbered list format that promises organized, digestible content',
    'how-to': 'Instructional titles that provide clear value and actionable insights'
  };
  
  return descriptions[style] || 'General title format';
};