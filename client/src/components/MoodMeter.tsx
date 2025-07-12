import React, { useState, useEffect } from 'react';
import { Article } from '../types';
import { Heart, Frown, Smile, Meh, Angry, Zap, AlertTriangle, TrendingUp } from 'lucide-react';

interface MoodMeterProps {
  articles: Article[];
  className?: string;
}

interface EmotionData {
  id: string;
  label: string;
  value: number;
  color: string;
  icon: React.ReactNode;
  intensity: number;
  examples: string[];
}

interface MoodAnalysis {
  overallMood: string;
  dominantEmotion: string;
  moodScore: number;
  emotions: EmotionData[];
  sentimentTrend: 'positive' | 'negative' | 'neutral';
  emotionalIntensity: number;
  articleBreakdown: {
    positive: number;
    negative: number;
    neutral: number;
  };
}

export const MoodMeter: React.FC<MoodMeterProps> = ({ articles, className = '' }) => {
  const [analysis, setAnalysis] = useState<MoodAnalysis | null>(null);
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (articles.length > 0) {
      setIsAnalyzing(true);
      const timer = setTimeout(() => {
        const moodAnalysis = analyzeMood(articles);
        setAnalysis(moodAnalysis);
        setIsAnalyzing(false);
      }, 800);
      return () => clearTimeout(timer);
    } else {
      setAnalysis(null);
    }
  }, [articles]);

  if (articles.length === 0) {
    return (
      <div className={`bg-white rounded-xl border border-gray-200 p-6 ${className}`}>
        <div className="text-center py-8">
          <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-500 mb-2">Mood Meter</h3>
          <p className="text-sm text-gray-400">Add articles to analyze emotional tone</p>
        </div>
      </div>
    );
  }

  if (isAnalyzing) {
    return (
      <div className={`bg-white rounded-xl border border-gray-200 p-6 ${className}`}>
        <div className="text-center py-8">
          <div className="animate-pulse">
            <div className="w-16 h-16 bg-gradient-to-r from-pink-200 to-purple-200 rounded-full mx-auto mb-4"></div>
          </div>
          <h3 className="text-lg font-medium text-gray-600 mb-2">Analyzing Emotional Tone</h3>
          <p className="text-sm text-gray-500">Reading the mood of your articles...</p>
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  const selectedEmotionData = analysis.emotions.find(e => e.id === selectedEmotion);

  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow ${className}`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-pink-100 to-purple-100 p-2 rounded-lg">
              <Heart className="h-5 w-5 text-pink-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Mood Meter</h3>
              <p className="text-sm text-gray-500">Emotional tone analysis</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-gray-600">
              Overall: {analysis.overallMood}
            </div>
            <div className="text-xs text-gray-500">
              Intensity: {Math.round(analysis.emotionalIntensity * 100)}%
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Mood Visualization */}
          <div className="space-y-4">
            {/* Circular Mood Display */}
            <div className="relative">
              <div className="aspect-square max-w-xs mx-auto relative">
                <svg viewBox="0 0 200 200" className="w-full h-full">
                  {/* Background circle */}
                  <circle
                    cx="100"
                    cy="100"
                    r="85"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="3"
                  />
                  
                  {/* Mood intensity arc */}
                  <circle
                    cx="100"
                    cy="100"
                    r="85"
                    fill="none"
                    stroke={`url(#moodGradient)`}
                    strokeWidth="6"
                    strokeDasharray={`${analysis.moodScore * 5.34} 534`}
                    strokeLinecap="round"
                    transform="rotate(-90 100 100)"
                  />
                  
                  {/* Gradient definition */}
                  <defs>
                    <linearGradient id="moodGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#ec4899" />
                      <stop offset="50%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                  
                  {/* Center mood indicator */}
                  <circle cx="100" cy="100" r="25" fill="white" stroke="#e5e7eb" strokeWidth="2" />
                  
                  {/* Mood score text */}
                  <text x="100" y="105" textAnchor="middle" className="text-lg font-bold fill-gray-800">
                    {Math.round(analysis.moodScore)}
                  </text>
                </svg>
              </div>
              
              {/* Mood label */}
              <div className="text-center mt-2">
                <div className="text-lg font-semibold text-gray-900">
                  {analysis.overallMood}
                </div>
                <div className="text-sm text-gray-500">
                  {analysis.sentimentTrend === 'positive' && '↗️ Trending Positive'}
                  {analysis.sentimentTrend === 'negative' && '↘️ Trending Negative'}
                  {analysis.sentimentTrend === 'neutral' && '→ Neutral Tone'}
                </div>
              </div>
            </div>

            {/* Emotion Breakdown */}
            <div className="grid grid-cols-3 gap-2">
              {analysis.emotions.slice(0, 6).map((emotion) => (
                <button
                  key={emotion.id}
                  onClick={() => setSelectedEmotion(
                    selectedEmotion === emotion.id ? null : emotion.id
                  )}
                  className={`p-3 rounded-lg border transition-all ${
                    selectedEmotion === emotion.id
                      ? 'border-pink-500 bg-pink-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-1">
                    <div style={{ color: emotion.color }}>
                      {emotion.icon}
                    </div>
                    <div className="text-xs font-medium text-gray-700">
                      {emotion.label}
                    </div>
                    <div className="text-xs text-gray-500">
                      {emotion.value}%
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Analysis Details */}
          <div className="space-y-4">
            {/* Article Breakdown */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Article Sentiment</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Positive</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all"
                        style={{ width: `${(analysis.articleBreakdown.positive / articles.length) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {analysis.articleBreakdown.positive}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Neutral</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gray-500 h-2 rounded-full transition-all"
                        style={{ width: `${(analysis.articleBreakdown.neutral / articles.length) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {analysis.articleBreakdown.neutral}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Negative</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-red-500 h-2 rounded-full transition-all"
                        style={{ width: `${(analysis.articleBreakdown.negative / articles.length) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {analysis.articleBreakdown.negative}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Selected Emotion Details */}
            {selectedEmotionData && (
              <div className="bg-pink-50 rounded-lg p-4 border border-pink-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-pink-900">
                    {selectedEmotionData.label} Details
                  </h4>
                  <div className="flex items-center space-x-2">
                    <div style={{ color: selectedEmotionData.color }}>
                      {selectedEmotionData.icon}
                    </div>
                    <span className="text-sm font-medium text-pink-900">
                      {selectedEmotionData.value}%
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-pink-700">Intensity:</span>
                    <span className="text-sm font-medium text-pink-900">
                      {Math.round(selectedEmotionData.intensity * 100)}%
                    </span>
                  </div>
                  
                  {selectedEmotionData.examples.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-pink-700">Key Phrases:</span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {selectedEmotionData.examples.map((example, index) => (
                          <span
                            key={index}
                            className="text-xs bg-pink-100 text-pink-800 px-2 py-1 rounded-full"
                          >
                            {example}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Emotional Insights */}
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <h4 className="font-medium text-yellow-900 mb-2">Emotional Insights</h4>
              <div className="space-y-1">
                {getMoodInsights(analysis).map((insight, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-1.5 flex-shrink-0" />
                    <p className="text-sm text-yellow-800">{insight}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Analysis functions
const analyzeMood = (articles: Article[]): MoodAnalysis => {
  const emotions: EmotionData[] = [];
  
  const emotionKeywords = {
    happy: {
      keywords: ['happy', 'joy', 'celebrate', 'success', 'achievement', 'positive', 'good news', 'victory', 'triumph'],
      color: '#10b981',
      icon: <Smile className="h-4 w-4" />
    },
    sad: {
      keywords: ['sad', 'tragedy', 'loss', 'mourn', 'grief', 'sorrow', 'unfortunate', 'tragic', 'devastated'],
      color: '#6366f1',
      icon: <Frown className="h-4 w-4" />
    },
    angry: {
      keywords: ['angry', 'outrage', 'fury', 'protest', 'condemn', 'denounce', 'criticism', 'backlash', 'controversy'],
      color: '#ef4444',
      icon: <Angry className="h-4 w-4" />
    },
    fear: {
      keywords: ['fear', 'worry', 'concern', 'anxiety', 'threat', 'danger', 'risk', 'warning', 'alarming'],
      color: '#f59e0b',
      icon: <AlertTriangle className="h-4 w-4" />
    },
    excitement: {
      keywords: ['exciting', 'thrilling', 'amazing', 'incredible', 'breakthrough', 'revolutionary', 'stunning', 'remarkable'],
      color: '#8b5cf6',
      icon: <Zap className="h-4 w-4" />
    },
    neutral: {
      keywords: ['report', 'according', 'state', 'announce', 'official', 'statement', 'data', 'information'],
      color: '#6b7280',
      icon: <Meh className="h-4 w-4" />
    }
  };

  Object.entries(emotionKeywords).forEach(([key, config]) => {
    const relevantArticles = articles.filter(article => {
      const content = `${article.title} ${article.content}`.toLowerCase();
      return config.keywords.some(keyword => content.includes(keyword));
    });

    if (relevantArticles.length > 0) {
      const value = Math.round((relevantArticles.length / articles.length) * 100);
      const intensity = Math.min(relevantArticles.length / articles.length, 1);
      
      emotions.push({
        id: key,
        label: key.charAt(0).toUpperCase() + key.slice(1),
        value,
        color: config.color,
        icon: config.icon,
        intensity,
        examples: config.keywords.slice(0, 3)
      });
    }
  });

  // Calculate overall mood
  const positiveEmotions = emotions.filter(e => ['happy', 'excitement'].includes(e.id));
  const negativeEmotions = emotions.filter(e => ['sad', 'angry', 'fear'].includes(e.id));
  const neutralEmotions = emotions.filter(e => e.id === 'neutral');

  const positiveScore = positiveEmotions.reduce((sum, e) => sum + e.value, 0);
  const negativeScore = negativeEmotions.reduce((sum, e) => sum + e.value, 0);
  const neutralScore = neutralEmotions.reduce((sum, e) => sum + e.value, 0);

  let overallMood = 'Neutral';
  let sentimentTrend: 'positive' | 'negative' | 'neutral' = 'neutral';
  let moodScore = 50;

  if (positiveScore > negativeScore && positiveScore > neutralScore) {
    overallMood = 'Positive';
    sentimentTrend = 'positive';
    moodScore = 60 + (positiveScore / 2);
  } else if (negativeScore > positiveScore && negativeScore > neutralScore) {
    overallMood = 'Negative';
    sentimentTrend = 'negative';
    moodScore = 40 - (negativeScore / 2);
  } else {
    moodScore = 50;
  }

  const dominantEmotion = emotions.length > 0 
    ? emotions.reduce((a, b) => a.value > b.value ? a : b).label
    : 'Neutral';

  const emotionalIntensity = emotions.reduce((sum, e) => sum + e.intensity, 0) / emotions.length || 0;

  return {
    overallMood,
    dominantEmotion,
    moodScore: Math.max(0, Math.min(100, moodScore)),
    emotions: emotions.sort((a, b) => b.value - a.value),
    sentimentTrend,
    emotionalIntensity,
    articleBreakdown: {
      positive: Math.round(articles.length * (positiveScore / 100)),
      negative: Math.round(articles.length * (negativeScore / 100)),
      neutral: Math.round(articles.length * (neutralScore / 100))
    }
  };
};

const getMoodInsights = (analysis: MoodAnalysis): string[] => {
  const insights = [];
  
  if (analysis.emotionalIntensity > 0.7) {
    insights.push('High emotional intensity detected - articles contain strong emotional language');
  }
  
  if (analysis.sentimentTrend === 'positive') {
    insights.push('Overall positive sentiment - articles tend to be optimistic');
  } else if (analysis.sentimentTrend === 'negative') {
    insights.push('Overall negative sentiment - articles contain concerning themes');
  }
  
  if (analysis.dominantEmotion !== 'Neutral') {
    insights.push(`${analysis.dominantEmotion} is the dominant emotion across your sources`);
  }
  
  if (analysis.emotions.length > 4) {
    insights.push('Rich emotional diversity - articles cover a wide range of feelings');
  }
  
  if (analysis.moodScore > 70) {
    insights.push('Very positive mood - content is uplifting and encouraging');
  } else if (analysis.moodScore < 30) {
    insights.push('Concerning mood - content may be heavy or distressing');
  }
  
  return insights;
};