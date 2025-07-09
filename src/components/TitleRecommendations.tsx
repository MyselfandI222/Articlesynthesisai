import React, { useState, useEffect } from 'react';
import { Lightbulb, Wand2, Copy, Check, RefreshCw, TrendingUp, Target, Eye } from 'lucide-react';
import { Article, WritingStyle } from '../types';
import { 
  generateTitleRecommendations, 
  calculateTitleScore, 
  getTitleStyleDescription,
  TitleRecommendation 
} from '../utils/titleRecommendations';

interface TitleRecommendationsProps {
  articles: Article[];
  currentTopic: string;
  style: WritingStyle;
  tone: string;
  onTitleSelect: (title: string) => void;
}

export const TitleRecommendations: React.FC<TitleRecommendationsProps> = ({
  articles,
  currentTopic,
  style,
  tone,
  onTitleSelect
}) => {
  const [recommendations, setRecommendations] = useState<TitleRecommendation[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedTitle, setCopiedTitle] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string>('all');

  // Generate recommendations when inputs change
  useEffect(() => {
    if (articles.length > 0 && currentTopic.trim()) {
      generateRecommendations();
    }
  }, [articles, currentTopic, style, tone]);

  const generateRecommendations = async () => {
    setIsGenerating(true);
    
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newRecommendations = generateTitleRecommendations(articles, currentTopic, style, tone);
    setRecommendations(newRecommendations);
    setIsGenerating(false);
  };

  const handleCopyTitle = async (title: string) => {
    try {
      await navigator.clipboard.writeText(title);
      setCopiedTitle(title);
      setTimeout(() => setCopiedTitle(null), 2000);
    } catch (error) {
      console.error('Failed to copy title:', error);
    }
  };

  const handleUseTitle = (title: string) => {
    onTitleSelect(title);
  };

  const filteredRecommendations = selectedStyle === 'all' 
    ? recommendations 
    : recommendations.filter(rec => rec.style === selectedStyle);

  const getStyleIcon = (style: string) => {
    const icons = {
      catchy: '🎯',
      professional: '💼',
      descriptive: '📝',
      question: '❓',
      listicle: '📋',
      'how-to': '🔧'
    };
    return icons[style] || '📄';
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600 bg-green-100';
    if (score >= 70) return 'text-blue-600 bg-blue-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-gray-600 bg-gray-100';
  };

  if (articles.length === 0 || !currentTopic.trim()) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="bg-yellow-100 p-2 rounded-xl">
            <Lightbulb className="h-5 w-5 text-yellow-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">AI Title Recommendations</h3>
            <p className="text-sm text-gray-600">Get intelligent title suggestions based on your articles</p>
          </div>
        </div>
        <div className="text-center py-8">
          <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Lightbulb className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-gray-600 mb-2">Add articles and specify a topic to get AI-powered title recommendations</p>
          <p className="text-sm text-gray-500">Our AI will analyze your content and suggest engaging, SEO-optimized titles</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-yellow-100 to-orange-100 p-2 rounded-xl">
            <Lightbulb className="h-5 w-5 text-yellow-600" />
          </div>
          <div>
            <h3 className="font-semibold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              AI Title Recommendations
            </h3>
            <p className="text-sm text-gray-600">
              {recommendations.length} intelligent suggestions based on your {articles.length} articles
            </p>
          </div>
        </div>
        <button
          onClick={generateRecommendations}
          disabled={isGenerating}
          className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl hover:from-yellow-600 hover:to-orange-600 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all flex items-center space-x-2 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Wand2 className="h-4 w-4" />
              <span>Regenerate</span>
            </>
          )}
        </button>
      </div>

      {/* Style Filter */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-3">
          <Target className="h-4 w-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Filter by Style</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedStyle('all')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              selectedStyle === 'all'
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Styles ({recommendations.length})
          </button>
          {['catchy', 'professional', 'descriptive', 'question', 'listicle', 'how-to'].map(styleType => {
            const count = recommendations.filter(rec => rec.style === styleType).length;
            if (count === 0) return null;
            
            return (
              <button
                key={styleType}
                onClick={() => setSelectedStyle(styleType)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center space-x-1 ${
                  selectedStyle === styleType
                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>{getStyleIcon(styleType)}</span>
                <span className="capitalize">{styleType} ({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Loading State */}
      {isGenerating && (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 rounded-xl p-4">
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recommendations */}
      {!isGenerating && filteredRecommendations.length > 0 && (
        <div className="space-y-4">
          {filteredRecommendations.map((recommendation, index) => {
            const overallScore = calculateTitleScore(recommendation);
            
            return (
              <div
                key={index}
                className="bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-lg">{getStyleIcon(recommendation.style)}</span>
                      <span className="text-xs font-medium text-gray-600 bg-white px-2 py-1 rounded-full capitalize">
                        {recommendation.style}
                      </span>
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${getScoreColor(overallScore)}`}>
                        {overallScore}/100
                      </span>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2 leading-relaxed">
                      {recommendation.title}
                    </h4>
                    <p className="text-sm text-gray-600 mb-3 italic">
                      {recommendation.reasoning}
                    </p>
                    
                    {/* Metrics */}
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <TrendingUp className="h-3 w-3" />
                        <span>SEO: {recommendation.seoScore}%</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Eye className="h-3 w-3" />
                        <span>Engagement: {recommendation.engagementPotential}%</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Target className="h-3 w-3" />
                        <span>Confidence: {recommendation.confidence}%</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleUseTitle(recommendation.title)}
                    className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all flex items-center space-x-2 text-sm font-medium shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                  >
                    <Wand2 className="h-4 w-4" />
                    <span>Use This Title</span>
                  </button>
                  <button
                    onClick={() => handleCopyTitle(recommendation.title)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all flex items-center space-x-2 text-sm font-medium"
                  >
                    {copiedTitle === recommendation.title ? (
                      <>
                        <Check className="h-4 w-4 text-green-600" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Style Information */}
      {selectedStyle !== 'all' && (
        <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-lg">{getStyleIcon(selectedStyle)}</span>
            <span className="font-medium text-purple-900 capitalize">{selectedStyle} Titles</span>
          </div>
          <p className="text-sm text-purple-800">
            {getTitleStyleDescription(selectedStyle)}
          </p>
        </div>
      )}

      {/* No Results */}
      {!isGenerating && filteredRecommendations.length === 0 && selectedStyle !== 'all' && (
        <div className="text-center py-8">
          <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Target className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-gray-600 mb-2">No {selectedStyle} titles available</p>
          <p className="text-sm text-gray-500">Try selecting "All Styles" or regenerate recommendations</p>
        </div>
      )}
    </div>
  );
};