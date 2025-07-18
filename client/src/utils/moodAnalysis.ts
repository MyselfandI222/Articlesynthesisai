import { SearchResult } from './newsAPIs';

export interface MoodAnalysis {
  overall: 'positive' | 'negative' | 'neutral';
  emotions: {
    joy: number;
    anger: number;
    fear: number;
    sadness: number;
    surprise: number;
    disgust: number;
    trust: number;
    anticipation: number;
  };
  intensity: number; // 0-100
  sentiment: number; // -1 to 1
  keywords: string[];
  breakdown: {
    positive: number;
    negative: number;
    neutral: number;
  };
}

export interface ArticleMood {
  id: string;
  title: string;
  mood: MoodAnalysis;
  source: string;
}

// Emotion keywords for analysis
const emotionKeywords = {
  joy: ['happy', 'joy', 'celebrate', 'success', 'triumph', 'victory', 'achievement', 'progress', 'good news', 'positive', 'wonderful', 'amazing', 'great', 'excellent', 'fantastic', 'breakthrough', 'milestone', 'win', 'winning', 'celebration'],
  anger: ['angry', 'furious', 'outraged', 'protest', 'riot', 'violence', 'attack', 'criticism', 'condemn', 'slam', 'blast', 'controversy', 'scandal', 'corruption', 'injustice', 'unfair', 'wrong', 'terrible', 'awful', 'disgusting'],
  fear: ['fear', 'scared', 'terror', 'threat', 'danger', 'crisis', 'emergency', 'warning', 'alert', 'concern', 'worry', 'anxiety', 'panic', 'disaster', 'catastrophe', 'risk', 'uncertain', 'unknown', 'mysterious'],
  sadness: ['sad', 'tragic', 'death', 'died', 'loss', 'mourning', 'grief', 'sorrow', 'depression', 'decline', 'failure', 'defeat', 'disappointment', 'unfortunate', 'regret', 'tragic', 'heartbreaking', 'devastating'],
  surprise: ['surprise', 'shocking', 'unexpected', 'sudden', 'breaking', 'revelation', 'discovery', 'uncover', 'reveal', 'expose', 'unprecedented', 'unusual', 'remarkable', 'extraordinary', 'stunning', 'astonishing'],
  disgust: ['disgusting', 'revolting', 'horrible', 'appalling', 'shameful', 'unacceptable', 'repulsive', 'offensive', 'inappropriate', 'misconduct', 'abuse', 'exploitation', 'corrupt', 'dirty', 'filthy'],
  trust: ['trust', 'reliable', 'credible', 'honest', 'transparent', 'authentic', 'genuine', 'legitimate', 'verified', 'confirmed', 'official', 'authorized', 'respected', 'established', 'professional'],
  anticipation: ['anticipate', 'expect', 'upcoming', 'future', 'plan', 'prepare', 'ready', 'launch', 'release', 'announce', 'preview', 'forecast', 'prediction', 'outlook', 'projection', 'schedule']
};

// Sentiment keywords
const sentimentKeywords = {
  positive: ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'perfect', 'successful', 'improved', 'better', 'best', 'outstanding', 'remarkable', 'impressive', 'beneficial', 'positive', 'optimistic', 'hopeful', 'encouraging'],
  negative: ['bad', 'terrible', 'awful', 'horrible', 'worst', 'failed', 'failure', 'problem', 'issue', 'crisis', 'disaster', 'wrong', 'poor', 'decline', 'decrease', 'loss', 'damage', 'harm', 'negative', 'pessimistic']
};

export function analyzeMood(article: SearchResult): MoodAnalysis {
  const text = `${article.title} ${article.description || ''} ${article.content || ''}`.toLowerCase();
  const words = text.split(/\s+/);
  
  // Calculate emotion scores
  const emotions = {
    joy: 0,
    anger: 0,
    fear: 0,
    sadness: 0,
    surprise: 0,
    disgust: 0,
    trust: 0,
    anticipation: 0
  };
  
  // Count emotion keywords
  Object.entries(emotionKeywords).forEach(([emotion, keywords]) => {
    const matches = keywords.filter(keyword => text.includes(keyword)).length;
    emotions[emotion as keyof typeof emotions] = matches;
  });
  
  // Calculate sentiment
  const positiveMatches = sentimentKeywords.positive.filter(keyword => text.includes(keyword)).length;
  const negativeMatches = sentimentKeywords.negative.filter(keyword => text.includes(keyword)).length;
  
  const sentiment = positiveMatches - negativeMatches;
  const normalizedSentiment = Math.max(-1, Math.min(1, sentiment / 10));
  
  // Determine overall mood
  const totalEmotions = Object.values(emotions).reduce((sum, score) => sum + score, 0);
  const maxEmotion = Math.max(...Object.values(emotions));
  const dominantEmotion = Object.entries(emotions).find(([_, score]) => score === maxEmotion)?.[0] || 'neutral';
  
  let overall: 'positive' | 'negative' | 'neutral' = 'neutral';
  if (['joy', 'trust', 'anticipation'].includes(dominantEmotion)) {
    overall = 'positive';
  } else if (['anger', 'fear', 'sadness', 'disgust'].includes(dominantEmotion)) {
    overall = 'negative';
  }
  
  // Calculate intensity (0-100)
  const intensity = Math.min(100, (totalEmotions / words.length) * 1000);
  
  // Normalize emotion scores to percentages
  const normalizedEmotions = Object.entries(emotions).reduce((acc, [emotion, score]) => {
    acc[emotion as keyof typeof emotions] = totalEmotions > 0 ? (score / totalEmotions) * 100 : 0;
    return acc;
  }, {} as typeof emotions);
  
  // Calculate breakdown
  const positiveScore = normalizedEmotions.joy + normalizedEmotions.trust + normalizedEmotions.anticipation;
  const negativeScore = normalizedEmotions.anger + normalizedEmotions.fear + normalizedEmotions.sadness + normalizedEmotions.disgust;
  const neutralScore = 100 - positiveScore - negativeScore;
  
  // Extract relevant keywords
  const allKeywords = [...sentimentKeywords.positive, ...sentimentKeywords.negative, ...Object.values(emotionKeywords).flat()];
  const foundKeywords = allKeywords.filter(keyword => text.includes(keyword)).slice(0, 5);
  
  return {
    overall,
    emotions: normalizedEmotions,
    intensity: Math.round(intensity),
    sentiment: normalizedSentiment,
    keywords: foundKeywords,
    breakdown: {
      positive: Math.round(positiveScore),
      negative: Math.round(negativeScore),
      neutral: Math.round(neutralScore)
    }
  };
}

export function analyzeArticlesMood(articles: SearchResult[]): ArticleMood[] {
  return articles.map(article => ({
    id: article.id,
    title: article.title,
    mood: analyzeMood(article),
    source: article.source || 'Unknown'
  }));
}

export function getOverallMood(articleMoods: ArticleMood[]): MoodAnalysis {
  if (articleMoods.length === 0) {
    return {
      overall: 'neutral',
      emotions: {
        joy: 0, anger: 0, fear: 0, sadness: 0,
        surprise: 0, disgust: 0, trust: 0, anticipation: 0
      },
      intensity: 0,
      sentiment: 0,
      keywords: [],
      breakdown: { positive: 0, negative: 0, neutral: 100 }
    };
  }
  
  // Average all emotions
  const avgEmotions = articleMoods.reduce((acc, article) => {
    Object.entries(article.mood.emotions).forEach(([emotion, score]) => {
      acc[emotion as keyof typeof acc] = (acc[emotion as keyof typeof acc] || 0) + score;
    });
    return acc;
  }, {} as MoodAnalysis['emotions']);
  
  Object.keys(avgEmotions).forEach(emotion => {
    avgEmotions[emotion as keyof typeof avgEmotions] /= articleMoods.length;
  });
  
  // Average sentiment and intensity
  const avgSentiment = articleMoods.reduce((sum, article) => sum + article.mood.sentiment, 0) / articleMoods.length;
  const avgIntensity = articleMoods.reduce((sum, article) => sum + article.mood.intensity, 0) / articleMoods.length;
  
  // Determine overall mood
  const maxEmotion = Math.max(...Object.values(avgEmotions));
  const dominantEmotion = Object.entries(avgEmotions).find(([_, score]) => score === maxEmotion)?.[0] || 'neutral';
  
  let overall: 'positive' | 'negative' | 'neutral' = 'neutral';
  if (['joy', 'trust', 'anticipation'].includes(dominantEmotion)) {
    overall = 'positive';
  } else if (['anger', 'fear', 'sadness', 'disgust'].includes(dominantEmotion)) {
    overall = 'negative';
  }
  
  // Calculate breakdown
  const positiveScore = avgEmotions.joy + avgEmotions.trust + avgEmotions.anticipation;
  const negativeScore = avgEmotions.anger + avgEmotions.fear + avgEmotions.sadness + avgEmotions.disgust;
  const neutralScore = 100 - positiveScore - negativeScore;
  
  // Collect all keywords
  const allKeywords = articleMoods.flatMap(article => article.mood.keywords);
  const uniqueKeywords = [...new Set(allKeywords)].slice(0, 10);
  
  return {
    overall,
    emotions: avgEmotions,
    intensity: Math.round(avgIntensity),
    sentiment: avgSentiment,
    keywords: uniqueKeywords,
    breakdown: {
      positive: Math.round(positiveScore),
      negative: Math.round(negativeScore),
      neutral: Math.round(neutralScore)
    }
  };
}