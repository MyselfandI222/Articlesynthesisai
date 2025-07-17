export interface CredibilityScore {
  source: string;
  score: number;
  rating: 'excellent' | 'good' | 'fair' | 'poor';
  factors: {
    reputation: number;
    factChecking: number;
    bias: number;
    transparency: number;
  };
  description: string;
  warnings?: string[];
  category: 'news-agency' | 'newspaper' | 'broadcast' | 'magazine' | 'blog' | 'unknown';
}

export const SOURCE_CREDIBILITY_DATABASE: Record<string, CredibilityScore> = {
  // News Agencies - Highest credibility
  'reuters.com': {
    source: 'Reuters',
    score: 94,
    rating: 'excellent',
    category: 'news-agency',
    factors: { reputation: 98, factChecking: 95, bias: 88, transparency: 95 },
    description: 'Leading international news agency with rigorous fact-checking standards',
    warnings: []
  },
  'apnews.com': {
    source: 'Associated Press',
    score: 91,
    rating: 'excellent',
    category: 'news-agency',
    factors: { reputation: 96, factChecking: 94, bias: 82, transparency: 92 },
    description: 'Nonprofit news cooperative with strong commitment to factual reporting',
    warnings: []
  },
  'bloomberg.com': {
    source: 'Bloomberg',
    score: 88,
    rating: 'excellent',
    category: 'news-agency',
    factors: { reputation: 90, factChecking: 92, bias: 80, transparency: 90 },
    description: 'Financial news leader with strong business reporting standards',
    warnings: []
  },

  // International Broadcasters
  'bbc.com': {
    source: 'BBC',
    score: 92,
    rating: 'excellent',
    category: 'broadcast',
    factors: { reputation: 95, factChecking: 92, bias: 85, transparency: 96 },
    description: 'Highly credible international news organization with strong editorial standards',
    warnings: []
  },
  'npr.org': {
    source: 'NPR',
    score: 89,
    rating: 'excellent',
    category: 'broadcast',
    factors: { reputation: 92, factChecking: 91, bias: 82, transparency: 91 },
    description: 'Public radio network with high editorial standards and balanced reporting',
    warnings: []
  },
  'pbsnewshour.org': {
    source: 'PBS NewsHour',
    score: 87,
    rating: 'excellent',
    category: 'broadcast',
    factors: { reputation: 90, factChecking: 89, bias: 83, transparency: 86 },
    description: 'Public television news program with in-depth reporting',
    warnings: []
  },

  // Major Newspapers
  'nytimes.com': {
    source: 'New York Times',
    score: 86,
    rating: 'good',
    category: 'newspaper',
    factors: { reputation: 92, factChecking: 90, bias: 75, transparency: 88 },
    description: 'Prestigious newspaper with high journalistic standards',
    warnings: ['Liberal editorial bias']
  },
  'washingtonpost.com': {
    source: 'Washington Post',
    score: 84,
    rating: 'good',
    category: 'newspaper',
    factors: { reputation: 89, factChecking: 88, bias: 73, transparency: 86 },
    description: 'Major American newspaper with strong investigative reporting',
    warnings: ['Liberal editorial bias']
  },
  'wsj.com': {
    source: 'Wall Street Journal',
    score: 87,
    rating: 'excellent',
    category: 'newspaper',
    factors: { reputation: 91, factChecking: 89, bias: 78, transparency: 90 },
    description: 'Leading business newspaper with high editorial standards',
    warnings: ['Conservative editorial page']
  },
  'theguardian.com': {
    source: 'The Guardian',
    score: 83,
    rating: 'good',
    category: 'newspaper',
    factors: { reputation: 88, factChecking: 86, bias: 72, transparency: 85 },
    description: 'Well-regarded international newspaper with left-leaning editorial stance',
    warnings: ['Editorial bias toward progressive viewpoints']
  },
  'usatoday.com': {
    source: 'USA Today',
    score: 79,
    rating: 'good',
    category: 'newspaper',
    factors: { reputation: 82, factChecking: 81, bias: 76, transparency: 77 },
    description: 'National newspaper with broad readership and moderate reporting',
    warnings: []
  },

  // TV Networks
  'cnn.com': {
    source: 'CNN',
    score: 78,
    rating: 'good',
    category: 'broadcast',
    factors: { reputation: 82, factChecking: 85, bias: 65, transparency: 80 },
    description: 'Major news network with extensive resources but some editorial bias',
    warnings: ['Liberal bias in opinion content']
  },
  'foxnews.com': {
    source: 'Fox News',
    score: 68,
    rating: 'fair',
    category: 'broadcast',
    factors: { reputation: 70, factChecking: 75, bias: 55, transparency: 72 },
    description: 'Popular news network with conservative editorial perspective',
    warnings: ['Strong conservative bias', 'Mixed factual reporting record']
  },
  'cbsnews.com': {
    source: 'CBS News',
    score: 81,
    rating: 'good',
    category: 'broadcast',
    factors: { reputation: 85, factChecking: 83, bias: 75, transparency: 81 },
    description: 'Major broadcast network with solid news reporting',
    warnings: []
  },
  'abcnews.go.com': {
    source: 'ABC News',
    score: 80,
    rating: 'good',
    category: 'broadcast',
    factors: { reputation: 84, factChecking: 82, bias: 74, transparency: 80 },
    description: 'Major broadcast network with comprehensive news coverage',
    warnings: []
  },
  'nbcnews.com': {
    source: 'NBC News',
    score: 79,
    rating: 'good',
    category: 'broadcast',
    factors: { reputation: 83, factChecking: 81, bias: 73, transparency: 79 },
    description: 'Major broadcast network with national and international coverage',
    warnings: []
  },
  'msnbc.com': {
    source: 'MSNBC',
    score: 72,
    rating: 'fair',
    category: 'broadcast',
    factors: { reputation: 75, factChecking: 78, bias: 62, transparency: 73 },
    description: 'Cable news network with progressive editorial perspective',
    warnings: ['Strong liberal bias', 'Opinion-heavy programming']
  },

  // Political/Policy Publications
  'politico.com': {
    source: 'Politico',
    score: 82,
    rating: 'good',
    category: 'magazine',
    factors: { reputation: 86, factChecking: 84, bias: 77, transparency: 82 },
    description: 'Political news publication with insider Washington coverage',
    warnings: ['DC establishment perspective']
  },
  'thehill.com': {
    source: 'The Hill',
    score: 76,
    rating: 'good',
    category: 'magazine',
    factors: { reputation: 78, factChecking: 79, bias: 74, transparency: 73 },
    description: 'Political news publication covering Congress and campaigns',
    warnings: []
  },

  // International Sources
  'dw.com': {
    source: 'Deutsche Welle',
    score: 85,
    rating: 'good',
    category: 'broadcast',
    factors: { reputation: 87, factChecking: 86, bias: 81, transparency: 86 },
    description: 'German international broadcaster with global perspective',
    warnings: []
  },
  'aljazeera.com': {
    source: 'Al Jazeera',
    score: 74,
    rating: 'fair',
    category: 'broadcast',
    factors: { reputation: 76, factChecking: 78, bias: 68, transparency: 75 },
    description: 'International news network with Middle Eastern perspective',
    warnings: ['Regional bias toward Middle Eastern viewpoints']
  },

  // Tech/Specialized
  'techcrunch.com': {
    source: 'TechCrunch',
    score: 75,
    rating: 'good',
    category: 'magazine',
    factors: { reputation: 78, factChecking: 76, bias: 73, transparency: 73 },
    description: 'Technology news publication with industry expertise',
    warnings: ['Tech industry bias']
  },
  'axios.com': {
    source: 'Axios',
    score: 80,
    rating: 'good',
    category: 'magazine',
    factors: { reputation: 82, factChecking: 81, bias: 78, transparency: 79 },
    description: 'Modern news publication with concise reporting format',
    warnings: []
  }
};

export const getCredibilityScore = (url: string): CredibilityScore => {
  try {
    const domain = new URL(url).hostname.replace('www.', '');
    
    // Check for exact match first
    if (SOURCE_CREDIBILITY_DATABASE[domain]) {
      return SOURCE_CREDIBILITY_DATABASE[domain];
    }
    
    // Check for partial matches (subdomains)
    for (const [key, value] of Object.entries(SOURCE_CREDIBILITY_DATABASE)) {
      if (domain.includes(key) || key.includes(domain)) {
        return value;
      }
    }
    
    // Return default score for unknown sources
    return {
      source: domain,
      score: 60,
      rating: 'fair',
      category: 'unknown',
      factors: {
        reputation: 60,
        factChecking: 60,
        bias: 60,
        transparency: 60
      },
      description: 'Unknown source - credibility not verified',
      warnings: ['Source credibility not verified', 'Use with caution']
    };
  } catch (error) {
    // If URL parsing fails, return very low score
    return {
      source: url,
      score: 40,
      rating: 'poor',
      category: 'unknown',
      factors: {
        reputation: 40,
        factChecking: 40,
        bias: 40,
        transparency: 40
      },
      description: 'Invalid or suspicious source',
      warnings: ['Invalid URL format', 'Cannot verify credibility']
    };
  }
};

export const getOverallCredibilityRating = (scores: CredibilityScore[]): {
  averageScore: number;
  rating: 'excellent' | 'good' | 'fair' | 'poor';
  recommendations: string[];
} => {
  if (scores.length === 0) {
    return {
      averageScore: 0,
      rating: 'poor',
      recommendations: ['Add sources to analyze credibility']
    };
  }

  const averageScore = scores.reduce((sum, score) => sum + score.score, 0) / scores.length;
  const rating = averageScore >= 90 ? 'excellent' : 
                averageScore >= 80 ? 'good' : 
                averageScore >= 70 ? 'fair' : 'poor';

  const recommendations: string[] = [];
  
  // Analysis-based recommendations
  const lowCredibilityCount = scores.filter(s => s.score < 70).length;
  const highBiasCount = scores.filter(s => s.factors.bias < 70).length;
  const unknownCount = scores.filter(s => s.category === 'unknown').length;
  
  if (lowCredibilityCount > 0) {
    recommendations.push(`Consider replacing ${lowCredibilityCount} low-credibility sources`);
  }
  
  if (highBiasCount >= scores.length / 2) {
    recommendations.push('Mix sources with different editorial perspectives');
  }
  
  if (unknownCount > 0) {
    recommendations.push(`Verify ${unknownCount} unknown sources independently`);
  }
  
  if (averageScore >= 85) {
    recommendations.push('Excellent source credibility for reliable synthesis');
  } else if (averageScore >= 75) {
    recommendations.push('Good source mix - consider adding more high-credibility sources');
  } else {
    recommendations.push('Add more credible sources to improve article reliability');
  }

  return { averageScore, rating, recommendations };
};