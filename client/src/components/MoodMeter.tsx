import React, { useState, useEffect } from 'react';
import { SearchResult } from '../utils/newsAPIs';
import { analyzeMood, analyzeArticlesMood, getOverallMood, MoodAnalysis, ArticleMood } from '../utils/moodAnalysis';
import { TrendingUp, TrendingDown, Minus, Heart, Zap, Shield, Frown, Smile, Meh } from 'lucide-react';

interface MoodMeterProps {
  articles: SearchResult[];
  onEmotionSelect?: (emotion: string) => void;
}

const emotionConfig = {
  joy: { color: '#FFD700', icon: '😊', label: 'Joy' },
  anger: { color: '#FF4444', icon: '😠', label: 'Anger' },
  fear: { color: '#8B4513', icon: '😨', label: 'Fear' },
  sadness: { color: '#4169E1', icon: '😢', label: 'Sadness' },
  surprise: { color: '#FF69B4', icon: '😮', label: 'Surprise' },
  disgust: { color: '#9ACD32', icon: '🤢', label: 'Disgust' },
  trust: { color: '#20B2AA', icon: '🤝', label: 'Trust' },
  anticipation: { color: '#FF8C00', icon: '🤔', label: 'Anticipation' }
};

export const MoodMeter: React.FC<MoodMeterProps> = ({ articles, onEmotionSelect }) => {
  const [articleMoods, setArticleMoods] = useState<ArticleMood[]>([]);
  const [overallMood, setOverallMood] = useState<MoodAnalysis | null>(null);
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [hoveredEmotion, setHoveredEmotion] = useState<string | null>(null);

  useEffect(() => {
    if (articles.length > 0) {
      const moods = analyzeArticlesMood(articles);
      setArticleMoods(moods);
      setOverallMood(getOverallMood(moods));
    } else {
      setArticleMoods([]);
      setOverallMood(null);
    }
  }, [articles]);

  if (!overallMood || articles.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="text-center py-8">
          <Meh className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Add articles to analyze their emotional tone</p>
        </div>
      </div>
    );
  }

  const handleEmotionClick = (emotion: string) => {
    setSelectedEmotion(selectedEmotion === emotion ? null : emotion);
    if (onEmotionSelect) {
      onEmotionSelect(emotion);
    }
  };

  const getSentimentIcon = () => {
    if (overallMood.sentiment > 0.2) return <TrendingUp className="h-5 w-5 text-green-600" />;
    if (overallMood.sentiment < -0.2) return <TrendingDown className="h-5 w-5 text-red-600" />;
    return <Minus className="h-5 w-5 text-gray-600" />;
  };

  const getSentimentColor = () => {
    if (overallMood.sentiment > 0.2) return 'text-green-600';
    if (overallMood.sentiment < -0.2) return 'text-red-600';
    return 'text-gray-600';
  };

  const getMoodIcon = () => {
    switch (overallMood.overall) {
      case 'positive': return <Smile className="h-6 w-6 text-green-600" />;
      case 'negative': return <Frown className="h-6 w-6 text-red-600" />;
      default: return <Meh className="h-6 w-6 text-gray-600" />;
    }
  };

  const getMoodColor = () => {
    switch (overallMood.overall) {
      case 'positive': return 'bg-green-100 text-green-800';
      case 'negative': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const radius = 80;
  const centerX = 100;
  const centerY = 100;
  const strokeWidth = 12;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Heart className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Mood Meter</h3>
            <p className="text-sm text-gray-500">Emotional tone analysis</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getMoodColor()}`}>
            {getMoodIcon()}
            <span className="ml-1 capitalize">{overallMood.overall}</span>
          </div>
          <div className="flex items-center space-x-1">
            {getSentimentIcon()}
            <span className={`text-sm font-medium ${getSentimentColor()}`}>
              {Math.round(overallMood.sentiment * 100)}%
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Emotion Wheel */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <svg width="200" height="200" className="transform -rotate-90">
              {Object.entries(overallMood.emotions).map(([emotion, score], index) => {
                const angle = (index / Object.keys(overallMood.emotions).length) * 360;
                const startAngle = angle - 22.5;
                const endAngle = angle + 22.5;
                const config = emotionConfig[emotion as keyof typeof emotionConfig];
                
                const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
                const startX = centerX + radius * Math.cos((startAngle * Math.PI) / 180);
                const startY = centerY + radius * Math.sin((startAngle * Math.PI) / 180);
                const endX = centerX + radius * Math.cos((endAngle * Math.PI) / 180);
                const endY = centerY + radius * Math.sin((endAngle * Math.PI) / 180);
                
                const pathData = [
                  `M ${centerX} ${centerY}`,
                  `L ${startX} ${startY}`,
                  `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`,
                  'Z'
                ].join(' ');
                
                const opacity = score > 0 ? Math.max(0.3, score / 100) : 0.1;
                const isSelected = selectedEmotion === emotion;
                const isHovered = hoveredEmotion === emotion;
                
                return (
                  <g key={emotion}>
                    <path
                      d={pathData}
                      fill={config.color}
                      opacity={isSelected ? 1 : isHovered ? opacity + 0.2 : opacity}
                      stroke={isSelected ? '#374151' : 'white'}
                      strokeWidth={isSelected ? 2 : 1}
                      className="cursor-pointer transition-all duration-200"
                      onMouseEnter={() => setHoveredEmotion(emotion)}
                      onMouseLeave={() => setHoveredEmotion(null)}
                      onClick={() => handleEmotionClick(emotion)}
                    />
                  </g>
                );
              })}
              
              {/* Center circle */}
              <circle
                cx={centerX}
                cy={centerY}
                r={25}
                fill="white"
                stroke="#E5E7EB"
                strokeWidth={2}
              />
              <text
                x={centerX}
                y={centerY}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-xs font-medium fill-gray-600 transform rotate-90"
                style={{ transformOrigin: `${centerX}px ${centerY}px` }}
              >
                {overallMood.intensity}%
              </text>
            </svg>
          </div>
          
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600 mb-2">Emotional Intensity</p>
            <div className="flex items-center justify-center space-x-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span className="text-lg font-semibold">{overallMood.intensity}%</span>
            </div>
          </div>
        </div>

        {/* Emotion Legend & Details */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(overallMood.emotions).map(([emotion, score]) => {
              const config = emotionConfig[emotion as keyof typeof emotionConfig];
              const isSelected = selectedEmotion === emotion;
              
              return (
                <button
                  key={emotion}
                  onClick={() => handleEmotionClick(emotion)}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                    isSelected 
                      ? 'border-gray-400 bg-gray-50' 
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{config.icon}</span>
                      <span className="text-sm font-medium">{config.label}</span>
                    </div>
                    <span className="text-xs text-gray-500">{Math.round(score)}%</span>
                  </div>
                </button>
              );
            })}
          </div>
          
          {/* Sentiment Breakdown */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Sentiment Distribution</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-green-600">Positive</span>
                <span className="text-sm font-medium">{overallMood.breakdown.positive}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${overallMood.breakdown.positive}%` }}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-red-600">Negative</span>
                <span className="text-sm font-medium">{overallMood.breakdown.negative}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-red-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${overallMood.breakdown.negative}%` }}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Neutral</span>
                <span className="text-sm font-medium">{overallMood.breakdown.neutral}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gray-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${overallMood.breakdown.neutral}%` }}
                />
              </div>
            </div>
          </div>
          
          {/* Keywords */}
          {overallMood.keywords.length > 0 && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Emotional Keywords</h4>
              <div className="flex flex-wrap gap-2">
                {overallMood.keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Article Breakdown */}
      {selectedEmotion && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-4">
            Articles with {emotionConfig[selectedEmotion as keyof typeof emotionConfig].label}
          </h4>
          <div className="space-y-3">
            {articleMoods
              .filter(article => article.mood.emotions[selectedEmotion as keyof typeof article.mood.emotions] > 0)
              .sort((a, b) => b.mood.emotions[selectedEmotion as keyof typeof b.mood.emotions] - a.mood.emotions[selectedEmotion as keyof typeof a.mood.emotions])
              .slice(0, 5)
              .map((article) => (
                <div key={article.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 line-clamp-1">{article.title}</p>
                    <p className="text-xs text-gray-500">{article.source}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{emotionConfig[selectedEmotion as keyof typeof emotionConfig].icon}</span>
                    <span className="text-sm font-medium">
                      {Math.round(article.mood.emotions[selectedEmotion as keyof typeof article.mood.emotions])}%
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MoodMeter;