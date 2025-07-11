import React from 'react';
import { WritingStyle } from '../types';
import { BookOpen, Newspaper, PenTool, Code, Palette, Briefcase, MessageCircle } from 'lucide-react';
import { analyzeArticlesForStyle, getStyleDescription, getToneDescription } from '../utils/styleRecommendations';
import { Article } from '../types';

interface StyleSelectorProps {
  selectedStyle: WritingStyle;
  onStyleChange: (style: WritingStyle) => void;
  tone: string;
  onToneChange: (tone: string) => void;
  length: 'short' | 'medium' | 'long';
  onLengthChange: (length: 'short' | 'medium' | 'long') => void;
  sources: Article[];
}

const styleOptions: { value: WritingStyle; label: string; description: string; icon: React.ReactNode }[] = [
  { value: 'academic', label: 'Academic', description: 'Formal, research-based writing', icon: <BookOpen className="h-5 w-5" /> },
  { value: 'journalistic', label: 'Journalistic', description: 'News-style reporting', icon: <Newspaper className="h-5 w-5" /> },
  { value: 'blog', label: 'Blog', description: 'Casual, engaging content', icon: <PenTool className="h-5 w-5" /> },
  { value: 'technical', label: 'Technical', description: 'Detailed, instructional', icon: <Code className="h-5 w-5" /> },
  { value: 'creative', label: 'Creative', description: 'Artistic, expressive writing', icon: <Palette className="h-5 w-5" /> },
  { value: 'business', label: 'Business', description: 'Professional, corporate tone', icon: <Briefcase className="h-5 w-5" /> },
  { value: 'opinion', label: 'Opinion', description: 'Persuasive, argumentative', icon: <MessageCircle className="h-5 w-5" /> },
];

export const StyleSelector: React.FC<StyleSelectorProps> = ({
  selectedStyle,
  onStyleChange,
  tone,
  onToneChange,
  length,
  onLengthChange,
  sources,
}) => {
  // Get AI recommendations based on selected articles
  const recommendations = analyzeArticlesForStyle(sources);
  const showRecommendations = sources.length > 0 && recommendations.confidence > 30;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <h2 className="text-lg font-semibold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-6">Writing Configuration</h2>
      
      <div className="space-y-6">
        {/* AI Recommendations */}
        {showRecommendations && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-start space-x-3">
              <div className="bg-blue-100 p-2 rounded-xl">
                <PenTool className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-blue-900 mb-1">AI Recommendations</h3>
                <p className="text-sm text-blue-800 mb-3">
                  Based on your selected articles, we recommend:
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-blue-900">Style: </span>
                      <span className="text-sm text-blue-800 capitalize">{recommendations.recommendedStyle}</span>
                      {selectedStyle === recommendations.recommendedStyle && (
                        <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full shadow-sm">✓ Selected</span>
                      )}
                    </div>
                    <span className="text-xs text-blue-600">{recommendations.confidence}% confidence</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-blue-900">Tone: </span>
                      <span className="text-sm text-blue-800 capitalize">{recommendations.recommendedTone}</span>
                      {tone === recommendations.recommendedTone && (
                        <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full shadow-sm">✓ Selected</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-blue-900">Length: </span>
                      <span className="text-sm text-blue-800 capitalize">{recommendations.recommendedLength}</span>
                      {length === recommendations.recommendedLength && (
                        <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full shadow-sm">✓ Selected</span>
                      )}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-blue-700 mt-2 italic">
                  {recommendations.reasoning}
                </p>
                
                {/* Article Count Analysis */}
                <div className="mt-3 p-2 bg-blue-100 rounded-lg">
                  <p className="text-xs text-blue-800">
                    <span className="font-medium">Article Analysis:</span> {recommendations.articleCountAnalysis}
                  </p>
                </div>
                
                <div className="flex space-x-2 mt-3">
                  {selectedStyle !== recommendations.recommendedStyle && (
                    <button
                      onClick={() => onStyleChange(recommendations.recommendedStyle)}
                      className="text-xs bg-gradient-to-r from-blue-600 to-blue-700 text-white px-3 py-1.5 rounded-full hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                    >
                      Use Recommended Style
                    </button>
                  )}
                  {tone !== recommendations.recommendedTone && (
                    <button
                      onClick={() => onToneChange(recommendations.recommendedTone)}
                      className="text-xs bg-gradient-to-r from-blue-600 to-blue-700 text-white px-3 py-1.5 rounded-full hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                    >
                      Use Recommended Tone
                    </button>
                  )}
                  {length !== recommendations.recommendedLength && (
                    <button
                      onClick={() => onLengthChange(recommendations.recommendedLength)}
                      className="text-xs bg-gradient-to-r from-blue-600 to-blue-700 text-white px-3 py-1.5 rounded-full hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                    >
                      Use Recommended Length
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Writing Style</label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {styleOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => onStyleChange(option.value)}
                className={`p-4 rounded-xl border-2 transition-all text-left relative hover:shadow-md transform hover:-translate-y-0.5 ${
                  selectedStyle === option.value
                    ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-900 shadow-md'
                    : showRecommendations && option.value === recommendations.recommendedStyle
                    ? 'border-green-300 bg-gradient-to-r from-green-50 to-green-100 text-green-900'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {showRecommendations && option.value === recommendations.recommendedStyle && selectedStyle !== option.value && (
                  <div className="absolute top-2 right-2">
                    <span className="text-xs bg-green-600 text-white px-2 py-1 rounded-full shadow-sm">Recommended</span>
                  </div>
                )}
                <div className="flex items-center space-x-3 mb-2">
                  <div className={
                    selectedStyle === option.value 
                      ? 'text-blue-600' 
                      : showRecommendations && option.value === recommendations.recommendedStyle
                      ? 'text-green-600'
                      : 'text-gray-400'
                  }>
                    {option.icon}
                  </div>
                  <span className="font-medium">{option.label}</span>
                </div>
                <p className="text-xs text-gray-600">{option.description}</p>
                {showRecommendations && option.value === recommendations.recommendedStyle && (
                  <p className="text-xs text-green-700 mt-1 font-medium">
                    {getStyleDescription(option.value)}
                  </p>
                )}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tone</label>
          <div className="relative">
            <select
              value={tone}
              onChange={(e) => onToneChange(e.target.value)}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                showRecommendations && tone === recommendations.recommendedTone
                  ? 'border-green-300 bg-gradient-to-r from-green-50 to-green-100'
                  : 'border-gray-300'
              }`}
            >
              <option value="neutral">Neutral</option>
              <option value="formal">Formal</option>
              <option value="casual">Casual</option>
              <option value="enthusiastic">Enthusiastic</option>
              <option value="authoritative">Authoritative</option>
              <option value="conversational">Conversational</option>
            </select>
            {showRecommendations && tone !== recommendations.recommendedTone && (
              <div className="mt-1">
                <p className="text-xs text-green-700">
                  <span className="font-medium">Recommended:</span> {recommendations.recommendedTone} - {getToneDescription(recommendations.recommendedTone)}
                </p>
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Article Length</label>
          {showRecommendations && (
            <div className="mb-3 p-3 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl shadow-sm">
              <p className="text-xs text-amber-800">
                <span className="font-medium">Length Recommendation:</span> {recommendations.lengthReasoning}
              </p>
            </div>
          )}
          <div className="flex space-x-3">
            {[
              { value: 'short', label: 'Short', description: '300-500 words' },
              { value: 'medium', label: 'Medium', description: '500-1000 words' },
              { value: 'long', label: 'Long', description: '1000+ words' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => onLengthChange(option.value as 'short' | 'medium' | 'long')}
                className={`flex-1 p-3 rounded-xl border-2 transition-all text-center hover:shadow-md transform hover:-translate-y-0.5 relative ${
                  length === option.value
                    ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-900 shadow-md'
                    : showRecommendations && option.value === recommendations.recommendedLength
                    ? 'border-green-300 bg-gradient-to-r from-green-50 to-green-100 text-green-900'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {showRecommendations && option.value === recommendations.recommendedLength && length !== option.value && (
                  <div className="absolute top-1 right-1">
                    <span className="text-xs bg-green-600 text-white px-1 py-0.5 rounded shadow-sm">Rec</span>
                  </div>
                )}
                <div className="font-medium">{option.label}</div>
                <div className="text-xs text-gray-600 mt-1">{option.description}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};