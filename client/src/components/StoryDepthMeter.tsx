import React from 'react';
import { Article } from '../types';
import { getDetailedContentAnalysis } from '../utils/contentAnalysis';
import { BarChart3, TrendingUp, Eye, Users, FileText, Target } from 'lucide-react';

interface StoryDepthMeterProps {
  articles: Article[];
  className?: string;
}

interface DepthScore {
  overall: number;
  facts: number;
  perspectives: number;
  complexity: number;
  sources: number;
}

export const StoryDepthMeter: React.FC<StoryDepthMeterProps> = ({ articles, className = '' }) => {
  if (articles.length === 0) {
    return (
      <div className={`bg-gray-50 rounded-xl p-4 border border-gray-200 ${className}`}>
        <div className="flex items-center space-x-2 mb-2">
          <BarChart3 className="h-5 w-5 text-gray-400" />
          <h3 className="text-sm font-medium text-gray-500">Story Depth Meter</h3>
        </div>
        <p className="text-xs text-gray-400">Select articles to analyze story depth</p>
      </div>
    );
  }

  const analysis = getDetailedContentAnalysis(articles);
  
  // Calculate depth scores (0-100)
  const depthScores: DepthScore = {
    overall: calculateOverallDepth(analysis, articles.length),
    facts: Math.min((analysis.factCount / 15) * 100, 100), // Max 15 facts = 100%
    perspectives: Math.min((analysis.perspectiveCount / 10) * 100, 100), // Max 10 perspectives = 100%
    complexity: analysis.complexityScore * 100,
    sources: Math.min((articles.length / 8) * 100, 100) // Max 8 sources = 100%
  };

  const getDepthLabel = (score: number): string => {
    if (score >= 80) return 'Exceptional';
    if (score >= 60) return 'Strong';
    if (score >= 40) return 'Moderate';
    if (score >= 20) return 'Basic';
    return 'Limited';
  };

  const getDepthColor = (score: number): string => {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 60) return 'text-green-600';
    if (score >= 40) return 'text-yellow-600';
    if (score >= 20) return 'text-orange-600';
    return 'text-red-600';
  };

  const getDepthColorBg = (score: number): string => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 60) return 'bg-green-500';
    if (score >= 40) return 'bg-yellow-500';
    if (score >= 20) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow ${className}`}>
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="bg-blue-100 p-2 rounded-lg">
              <BarChart3 className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Story Depth Meter</h3>
              <p className="text-xs text-gray-500">AI-powered comprehensiveness analysis</p>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-bold ${getDepthColor(depthScores.overall)}`}>
              {Math.round(depthScores.overall)}%
            </div>
            <div className={`text-sm font-medium ${getDepthColor(depthScores.overall)}`}>
              {getDepthLabel(depthScores.overall)}
            </div>
          </div>
        </div>

        {/* Main Depth Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Overall Depth</span>
            <span className="text-sm text-gray-500">{Math.round(depthScores.overall)}/100</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div 
              className={`h-full ${getDepthColorBg(depthScores.overall)} transition-all duration-500 ease-out`}
              style={{ width: `${depthScores.overall}%` }}
            />
          </div>
        </div>

        {/* Detailed Metrics */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <MetricCard
            icon={<FileText className="h-4 w-4" />}
            label="Facts & Data"
            score={depthScores.facts}
            value={analysis.factCount}
            maxValue={15}
            suffix="facts"
          />
          <MetricCard
            icon={<Users className="h-4 w-4" />}
            label="Perspectives"
            score={depthScores.perspectives}
            value={analysis.perspectiveCount}
            maxValue={10}
            suffix="viewpoints"
          />
          <MetricCard
            icon={<TrendingUp className="h-4 w-4" />}
            label="Complexity"
            score={depthScores.complexity}
            value={Math.round(analysis.complexityScore * 100)}
            maxValue={100}
            suffix="complexity"
          />
          <MetricCard
            icon={<Target className="h-4 w-4" />}
            label="Source Variety"
            score={depthScores.sources}
            value={articles.length}
            maxValue={8}
            suffix="sources"
          />
        </div>

        {/* Content Depth Indicator */}
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Content Depth</span>
            <span className={`text-sm font-medium capitalize ${getDepthColor(depthScores.overall)}`}>
              {analysis.contentDepth}
            </span>
          </div>
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((level) => (
              <div
                key={level}
                className={`flex-1 h-2 rounded-full transition-all duration-300 ${
                  level <= (depthScores.overall / 20) 
                    ? getDepthColorBg(depthScores.overall) 
                    : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Depth Recommendations</h4>
          <div className="space-y-1">
            {getDepthRecommendations(depthScores, analysis).map((rec, index) => (
              <div key={index} className="flex items-start space-x-2">
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                  rec.priority === 'high' ? 'bg-red-500' : 
                  rec.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                }`} />
                <p className="text-xs text-gray-600">{rec.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  score: number;
  value: number;
  maxValue: number;
  suffix: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ icon, label, score, value, maxValue, suffix }) => {
  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 60) return 'text-green-600';
    if (score >= 40) return 'text-yellow-600';
    if (score >= 20) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreColorBg = (score: number): string => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 60) return 'bg-green-500';
    if (score >= 40) return 'bg-yellow-500';
    if (score >= 20) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <div className="flex items-center space-x-2 mb-2">
        <div className="text-gray-600">{icon}</div>
        <span className="text-xs font-medium text-gray-700">{label}</span>
      </div>
      <div className="flex items-center justify-between mb-1">
        <span className={`text-sm font-bold ${getScoreColor(score)}`}>
          {value}
        </span>
        <span className="text-xs text-gray-500">
          {Math.round(score)}%
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-1.5">
        <div 
          className={`h-full ${getScoreColorBg(score)} transition-all duration-300 ease-out rounded-full`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-xs text-gray-500 mt-1">{suffix}</span>
    </div>
  );
};

const calculateOverallDepth = (analysis: any, sourceCount: number): number => {
  // Weighted calculation for overall depth
  const factScore = Math.min((analysis.factCount / 15) * 100, 100) * 0.3;
  const perspectiveScore = Math.min((analysis.perspectiveCount / 10) * 100, 100) * 0.25;
  const complexityScore = analysis.complexityScore * 100 * 0.2;
  const sourceScore = Math.min((sourceCount / 8) * 100, 100) * 0.15;
  const topicScore = Math.min((analysis.keyTopics.length / 5) * 100, 100) * 0.1;
  
  return Math.round(factScore + perspectiveScore + complexityScore + sourceScore + topicScore);
};

const getDepthRecommendations = (scores: DepthScore, analysis: any): Array<{text: string; priority: 'high' | 'medium' | 'low'}> => {
  const recommendations = [];
  
  if (scores.facts < 40) {
    recommendations.push({
      text: 'Add more factual sources with statistics, research data, and concrete evidence',
      priority: 'high' as const
    });
  }
  
  if (scores.perspectives < 30) {
    recommendations.push({
      text: 'Include diverse viewpoints and expert opinions to show multiple perspectives',
      priority: 'high' as const
    });
  }
  
  if (scores.sources < 50) {
    recommendations.push({
      text: 'Gather additional sources to provide broader coverage of the topic',
      priority: 'medium' as const
    });
  }
  
  if (scores.complexity < 30) {
    recommendations.push({
      text: 'Consider exploring more nuanced aspects and technical details',
      priority: 'medium' as const
    });
  }
  
  if (scores.overall >= 80) {
    recommendations.push({
      text: 'Excellent depth! Your story has comprehensive coverage with strong evidence',
      priority: 'low' as const
    });
  } else if (scores.overall >= 60) {
    recommendations.push({
      text: 'Good depth achieved. Consider adding expert quotes for enhanced credibility',
      priority: 'low' as const
    });
  }
  
  return recommendations;
};