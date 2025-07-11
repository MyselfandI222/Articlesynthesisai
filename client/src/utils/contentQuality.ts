// Content Quality Analysis and Improvement System
import { Article, SynthesizedArticle } from '../types';

export interface QualityMetrics {
  readabilityScore: number;
  varietyScore: number;
  coherenceScore: number;
  factualDensity: number;
  sourceIntegration: number;
  overallQuality: number;
}

export interface QualityIssue {
  type: 'repetition' | 'readability' | 'coherence' | 'variety' | 'factual';
  severity: 'low' | 'medium' | 'high';
  description: string;
  suggestion: string;
  location?: string;
}

// Analyze content quality and provide metrics
export const analyzeContentQuality = (content: string, sources: Article[]): QualityMetrics => {
  const readabilityScore = calculateReadabilityScore(content);
  const varietyScore = calculateVarietyScore(content);
  const coherenceScore = calculateCoherenceScore(content);
  const factualDensity = calculateFactualDensity(content, sources);
  const sourceIntegration = calculateSourceIntegration(content, sources);
  
  const overallQuality = (
    readabilityScore * 0.25 +
    varietyScore * 0.20 +
    coherenceScore * 0.25 +
    factualDensity * 0.15 +
    sourceIntegration * 0.15
  );

  return {
    readabilityScore,
    varietyScore,
    coherenceScore,
    factualDensity,
    sourceIntegration,
    overallQuality
  };
};

// Calculate readability score (0-100)
const calculateReadabilityScore = (content: string): number => {
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = content.split(/\s+/).filter(w => w.length > 0);
  const syllables = words.reduce((count, word) => count + countSyllables(word), 0);
  
  if (sentences.length === 0 || words.length === 0) return 0;
  
  const avgWordsPerSentence = words.length / sentences.length;
  const avgSyllablesPerWord = syllables / words.length;
  
  // Simplified Flesch Reading Ease formula
  const score = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord);
  
  return Math.max(0, Math.min(100, score));
};

// Count syllables in a word (simplified)
const countSyllables = (word: string): number => {
  const vowels = 'aeiouy';
  let count = 0;
  let previousWasVowel = false;
  
  for (let i = 0; i < word.length; i++) {
    const isVowel = vowels.includes(word[i].toLowerCase());
    if (isVowel && !previousWasVowel) {
      count++;
    }
    previousWasVowel = isVowel;
  }
  
  // Handle silent 'e'
  if (word.endsWith('e') && count > 1) {
    count--;
  }
  
  return Math.max(1, count);
};

// Calculate variety score based on word and phrase diversity
const calculateVarietyScore = (content: string): number => {
  const words = content.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  const uniqueWords = new Set(words);
  const wordVariety = uniqueWords.size / words.length;
  
  // Check sentence structure variety
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const sentenceLengths = sentences.map(s => s.split(/\s+/).length);
  const avgLength = sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length;
  const lengthVariance = sentenceLengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) / sentenceLengths.length;
  const structureVariety = Math.min(1, lengthVariance / 100);
  
  return Math.round((wordVariety * 0.6 + structureVariety * 0.4) * 100);
};

// Calculate coherence score based on logical flow
const calculateCoherenceScore = (content: string): number => {
  const paragraphs = content.split('\n\n').filter(p => p.trim().length > 0);
  
  if (paragraphs.length < 2) return 50;
  
  let coherenceScore = 0;
  const transitionWords = [
    'however', 'furthermore', 'moreover', 'additionally', 'consequently',
    'therefore', 'nevertheless', 'meanwhile', 'similarly', 'in contrast',
    'as a result', 'for example', 'in addition', 'on the other hand'
  ];
  
  // Check for transition words
  const transitionCount = transitionWords.reduce((count, word) => {
    return count + (content.toLowerCase().match(new RegExp(`\\b${word}\\b`, 'g')) || []).length;
  }, 0);
  
  const transitionScore = Math.min(100, (transitionCount / paragraphs.length) * 50);
  
  // Check for topic consistency (simplified)
  const topicWords = extractTopicWords(content);
  const consistencyScore = calculateTopicConsistency(paragraphs, topicWords);
  
  coherenceScore = (transitionScore * 0.4 + consistencyScore * 0.6);
  
  return Math.round(coherenceScore);
};

// Extract main topic words from content
const extractTopicWords = (content: string): string[] => {
  const words = content.toLowerCase().split(/\s+/);
  const wordFreq = new Map<string, number>();
  
  words.forEach(word => {
    const cleaned = word.replace(/[^\w]/g, '');
    if (cleaned.length > 4) {
      wordFreq.set(cleaned, (wordFreq.get(cleaned) || 0) + 1);
    }
  });
  
  return Array.from(wordFreq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);
};

// Calculate topic consistency across paragraphs
const calculateTopicConsistency = (paragraphs: string[], topicWords: string[]): number => {
  if (topicWords.length === 0) return 50;
  
  const paragraphScores = paragraphs.map(paragraph => {
    const paragraphLower = paragraph.toLowerCase();
    const topicWordCount = topicWords.reduce((count, word) => {
      return count + (paragraphLower.match(new RegExp(`\\b${word}\\b`, 'g')) || []).length;
    }, 0);
    
    return topicWordCount / topicWords.length;
  });
  
  const avgScore = paragraphScores.reduce((a, b) => a + b, 0) / paragraphScores.length;
  return Math.min(100, avgScore * 100);
};

// Calculate factual density (presence of specific facts, numbers, etc.)
const calculateFactualDensity = (content: string, sources: Article[]): number => {
  const factualIndicators = [
    /\d+(?:\.\d+)?%/g, // percentages
    /\d+(?:,\d{3})*(?:\.\d+)?/g, // numbers
    /"[^"]{10,}"/g, // quotes
    /according to|research shows|study found|data indicates/gi, // attribution phrases
    /\b(?:study|research|survey|report|analysis)\b/gi // research terms
  ];
  
  let factualCount = 0;
  factualIndicators.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) factualCount += matches.length;
  });
  
  const words = content.split(/\s+/).length;
  const density = (factualCount / words) * 100;
  
  return Math.min(100, density * 10); // Scale appropriately
};

// Calculate how well sources are integrated
const calculateSourceIntegration = (content: string, sources: Article[]): number => {
  if (sources.length === 0) return 0;
  
  let integrationScore = 0;
  const contentLower = content.toLowerCase();
  
  // Check for source attribution
  const attributionPhrases = [
    'according to', 'research from', 'study by', 'analysis from',
    'experts from', 'data from', 'findings from'
  ];
  
  const attributionCount = attributionPhrases.reduce((count, phrase) => {
    return count + (contentLower.match(new RegExp(phrase, 'g')) || []).length;
  }, 0);
  
  // Check for source-specific content integration
  const sourceTerms = sources.flatMap(source => 
    source.source ? [source.source.toLowerCase()] : []
  );
  
  const sourceReferences = sourceTerms.reduce((count, term) => {
    return count + (contentLower.includes(term) ? 1 : 0);
  }, 0);
  
  integrationScore = ((attributionCount * 20) + (sourceReferences * 15)) / sources.length;
  
  return Math.min(100, integrationScore);
};

// Identify quality issues in content
export const identifyQualityIssues = (content: string, sources: Article[]): QualityIssue[] => {
  const issues: QualityIssue[] = [];
  
  // Check for repetitive phrases
  const repetitionIssues = findRepetitiveContent(content);
  issues.push(...repetitionIssues);
  
  // Check readability issues
  const readabilityIssues = findReadabilityIssues(content);
  issues.push(...readabilityIssues);
  
  // Check coherence issues
  const coherenceIssues = findCoherenceIssues(content);
  issues.push(...coherenceIssues);
  
  // Check factual density issues
  const factualIssues = findFactualDensityIssues(content, sources);
  issues.push(...factualIssues);
  
  return issues;
};

// Find repetitive content patterns
const findRepetitiveContent = (content: string): QualityIssue[] => {
  const issues: QualityIssue[] = [];
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  // Check for repeated phrases
  const phrases = new Map<string, number>();
  sentences.forEach(sentence => {
    const words = sentence.trim().split(/\s+/);
    for (let i = 0; i <= words.length - 3; i++) {
      const phrase = words.slice(i, i + 3).join(' ').toLowerCase();
      phrases.set(phrase, (phrases.get(phrase) || 0) + 1);
    }
  });
  
  phrases.forEach((count, phrase) => {
    if (count > 2) {
      issues.push({
        type: 'repetition',
        severity: count > 4 ? 'high' : 'medium',
        description: `Phrase "${phrase}" is repeated ${count} times`,
        suggestion: 'Consider using synonyms or rephrasing to add variety'
      });
    }
  });
  
  return issues;
};

// Find readability issues
const findReadabilityIssues = (content: string): QualityIssue[] => {
  const issues: QualityIssue[] = [];
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  sentences.forEach((sentence, index) => {
    const words = sentence.trim().split(/\s+/);
    
    if (words.length > 30) {
      issues.push({
        type: 'readability',
        severity: words.length > 40 ? 'high' : 'medium',
        description: `Sentence ${index + 1} is very long (${words.length} words)`,
        suggestion: 'Consider breaking this into shorter sentences',
        location: `Sentence ${index + 1}`
      });
    }
  });
  
  return issues;
};

// Find coherence issues
const findCoherenceIssues = (content: string): QualityIssue[] => {
  const issues: QualityIssue[] = [];
  const paragraphs = content.split('\n\n').filter(p => p.trim().length > 0);
  
  if (paragraphs.length > 3) {
    const transitionWords = [
      'however', 'furthermore', 'moreover', 'additionally', 'consequently',
      'therefore', 'nevertheless', 'meanwhile', 'similarly', 'in contrast'
    ];
    
    let transitionCount = 0;
    paragraphs.forEach(paragraph => {
      const hasTransition = transitionWords.some(word => 
        paragraph.toLowerCase().includes(word)
      );
      if (hasTransition) transitionCount++;
    });
    
    if (transitionCount < paragraphs.length * 0.3) {
      issues.push({
        type: 'coherence',
        severity: 'medium',
        description: 'Limited use of transition words between paragraphs',
        suggestion: 'Add transition words to improve flow between ideas'
      });
    }
  }
  
  return issues;
};

// Find factual density issues
const findFactualDensityIssues = (content: string, sources: Article[]): QualityIssue[] => {
  const issues: QualityIssue[] = [];
  
  const factualElements = [
    content.match(/\d+(?:\.\d+)?%/g)?.length || 0,
    content.match(/"[^"]{10,}"/g)?.length || 0,
    content.match(/according to|research shows|study found/gi)?.length || 0
  ].reduce((a, b) => a + b, 0);
  
  const words = content.split(/\s+/).length;
  const density = factualElements / words;
  
  if (density < 0.02 && sources.length > 2) {
    issues.push({
      type: 'factual',
      severity: 'medium',
      description: 'Low factual density - consider adding more specific data',
      suggestion: 'Include statistics, quotes, or specific examples from sources'
    });
  }
  
  return issues;
};

// Generate improvement suggestions based on quality analysis
export const generateImprovementSuggestions = (
  metrics: QualityMetrics,
  issues: QualityIssue[]
): string[] => {
  const suggestions: string[] = [];
  
  if (metrics.readabilityScore < 60) {
    suggestions.push('Simplify sentence structure and use shorter sentences');
    suggestions.push('Replace complex words with simpler alternatives');
  }
  
  if (metrics.varietyScore < 70) {
    suggestions.push('Use more varied vocabulary and sentence structures');
    suggestions.push('Replace repetitive phrases with synonyms');
  }
  
  if (metrics.coherenceScore < 70) {
    suggestions.push('Add transition words between paragraphs');
    suggestions.push('Improve logical flow between ideas');
  }
  
  if (metrics.factualDensity < 50) {
    suggestions.push('Include more specific statistics and data');
    suggestions.push('Add expert quotes and citations');
  }
  
  if (metrics.sourceIntegration < 60) {
    suggestions.push('Better integrate source material throughout the article');
    suggestions.push('Add more attribution phrases');
  }
  
  // Add specific suggestions from issues
  issues.forEach(issue => {
    if (issue.severity === 'high') {
      suggestions.push(issue.suggestion);
    }
  });
  
  return [...new Set(suggestions)]; // Remove duplicates
};