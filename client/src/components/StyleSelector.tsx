import React from 'react';
import { WritingStyle } from '../types';
import { BookOpen, Newspaper, PenTool, Code, Palette, Briefcase, MessageCircle, BarChart3, Users, FileText } from 'lucide-react';
import { analyzeArticlesForStyle, getStyleDescription, getToneDescription } from '../utils/styleRecommendations';
import { analyzeContentAndRecommendLength, getDetailedContentAnalysis } from '../utils/contentAnalysis';
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
  
  // Get intelligent length recommendations based on content analysis
  const lengthRecommendation = analyzeContentAndRecommendLength(sources);
  const contentAnalysis = getDetailedContentAnalysis(sources);
  const showLengthRecommendations = sources.length > 0;

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
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Intelligent Length Recommendations */}
        {showLengthRecommendations && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-start space-x-3">
              <div className="bg-green-100 p-2 rounded-xl">
                <BarChart3 className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-green-900 mb-1">Content Analysis & Length Recommendation</h3>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-green-600" />
                    <div>
                      <span className="text-sm font-medium text-green-900">Facts: </span>
                      <span className="text-sm text-green-800">{contentAnalysis.factCount}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-green-600" />
                    <div>
                      <span className="text-sm font-medium text-green-900">Perspectives: </span>
                      <span className="text-sm text-green-800">{contentAnalysis.perspectiveCount}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-white border border-green-200 rounded-lg p-3 mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="text-sm font-medium text-green-900">Recommended Length: </span>
                      <span className="text-sm text-green-800 capitalize font-semibold">{lengthRecommendation.recommended}</span>
                      {length === lengthRecommendation.recommended && (
                        <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full shadow-sm">✓ Selected</span>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-green-600 font-medium">{Math.round(lengthRecommendation.confidence * 100)}% confidence</span>
                      <div className="text-xs text-green-500 mt-1">
                        Content depth: {contentAnalysis.contentDepth}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-green-700 leading-relaxed">
                    {lengthRecommendation.reasoning}
                  </p>
                </div>
                {length !== lengthRecommendation.recommended && (
                  <button
                    onClick={() => onLengthChange(lengthRecommendation.recommended)}
                    className="text-xs text-green-700 hover:text-green-900 hover:underline font-medium"
                  >
                    Use recommended length
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Style Selection */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Writing Style</h3>
          <div className="grid grid-cols-2 gap-3">
            {styleOptions.map((style) => (
              <button
                key={style.value}
                onClick={() => onStyleChange(style.value)}
                className={`p-3 rounded-xl border-2 transition-all transform hover:scale-105 ${
                  selectedStyle === style.value
                    ? 'border-blue-500 bg-blue-50 shadow-lg'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${selectedStyle === style.value ? 'bg-blue-100' : 'bg-gray-100'}`}>
                    {style.icon}
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-gray-900">{style.label}</div>
                    <div className="text-xs text-gray-500">{style.description}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
          {showRecommendations && selectedStyle !== recommendations.recommendedStyle && (
            <div className="mt-2 text-center">
              <button
                onClick={() => onStyleChange(recommendations.recommendedStyle)}
                className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
              >
                Use recommended style: {recommendations.recommendedStyle}
              </button>
            </div>
          )}
        </div>

        {/* Tone Selection */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Tone</h3>
          <div className="grid grid-cols-3 gap-2">
            {['professional', 'casual', 'persuasive', 'informative', 'analytical', 'conversational'].map((toneOption) => (
              <button
                key={toneOption}
                onClick={() => onToneChange(toneOption)}
                className={`px-3 py-2 rounded-lg text-sm transition-all transform hover:scale-105 ${
                  tone === toneOption
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {toneOption}
              </button>
            ))}
          </div>
          {showRecommendations && tone !== recommendations.recommendedTone && (
            <div className="mt-2 text-center">
              <button
                onClick={() => onToneChange(recommendations.recommendedTone)}
                className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
              >
                Use recommended tone: {recommendations.recommendedTone}
              </button>
            </div>
          )}
        </div>

        {/* Length Selection */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Article Length</h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              { 
                value: 'short' as const, 
                label: 'Short', 
                description: '300-500 words',
                icon: <FileText className="h-4 w-4" />,
                wordRange: '300-500',
                bestFor: 'Quick reads, summaries'
              },
              { 
                value: 'medium' as const, 
                label: 'Medium', 
                description: '500-800 words',
                icon: <FileText className="h-4 w-4" />,
                wordRange: '500-800',
                bestFor: 'Balanced coverage'
              },
              { 
                value: 'long' as const, 
                label: 'Long', 
                description: '800+ words',
                icon: <FileText className="h-4 w-4" />,
                wordRange: '800+',
                bestFor: 'Comprehensive analysis'
              }
            ].map((lengthOption) => (
              <button
                key={lengthOption.value}
                onClick={() => onLengthChange(lengthOption.value)}
                className={`p-3 rounded-xl border-2 transition-all transform hover:scale-105 ${
                  length === lengthOption.value
                    ? 'border-blue-500 bg-blue-50 shadow-lg'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                } ${lengthOption.value === lengthRecommendation.recommended ? 'ring-2 ring-green-300' : ''}`}
              >
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className={`p-2 rounded-lg ${length === lengthOption.value ? 'bg-blue-100' : 'bg-gray-100'}`}>
                    {lengthOption.icon}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{lengthOption.label}</div>
                    <div className="text-xs text-gray-500">{lengthOption.wordRange} words</div>
                    <div className="text-xs text-gray-400 mt-1">{lengthOption.bestFor}</div>
                    {lengthOption.value === lengthRecommendation.recommended && (
                      <div className="text-xs text-green-600 font-medium mt-1">✓ AI Recommended</div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
          {showLengthRecommendations && length !== lengthRecommendation.recommended && (
            <div className="mt-2 text-center">
              <button
                onClick={() => onLengthChange(lengthRecommendation.recommended)}
                className="text-xs text-green-600 hover:text-green-800 hover:underline font-medium"
              >
                Use AI recommended length: {lengthRecommendation.recommended}
              </button>
            </div>
          )}
        </div>

        {/* Content Analysis Summary */}
        {showLengthRecommendations && contentAnalysis.keyTopics.length > 0 && (
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Content Topics Detected</h4>
            <div className="flex flex-wrap gap-2">
              {contentAnalysis.keyTopics.map((topic, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-200 text-gray-700 rounded-full text-xs"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};