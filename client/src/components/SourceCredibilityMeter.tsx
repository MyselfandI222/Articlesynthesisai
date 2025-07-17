import React, { useState, useEffect } from 'react';
import { Shield, ShieldCheck, ShieldAlert, ShieldX, Info, Award, AlertTriangle, TrendingUp, Zap } from 'lucide-react';
import { Article } from '../types';
import { getCredibilityScore, getOverallCredibilityRating, CredibilityScore } from '../utils/sourceCredibility';

interface SourceCredibilityMeterProps {
  sources: Article[];
  onScoreUpdate?: (averageScore: number) => void;
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'news-agency':
      return <Zap className="h-4 w-4 text-blue-600" />;
    case 'newspaper':
      return <Award className="h-4 w-4 text-purple-600" />;
    case 'broadcast':
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    case 'magazine':
      return <Info className="h-4 w-4 text-orange-600" />;
    default:
      return <AlertTriangle className="h-4 w-4 text-gray-600" />;
  }
};

const getScoreColor = (score: number) => {
  if (score >= 90) return 'text-green-600';
  if (score >= 80) return 'text-blue-600';
  if (score >= 70) return 'text-yellow-600';
  return 'text-red-600';
};

const getScoreIcon = (rating: string) => {
  switch (rating) {
    case 'excellent':
      return <ShieldCheck className="h-5 w-5 text-green-600" />;
    case 'good':
      return <Shield className="h-5 w-5 text-blue-600" />;
    case 'fair':
      return <ShieldAlert className="h-5 w-5 text-yellow-600" />;
    case 'poor':
      return <ShieldX className="h-5 w-5 text-red-600" />;
    default:
      return <Shield className="h-5 w-5 text-gray-600" />;
  }
};

const SourceCredibilityMeter: React.FC<SourceCredibilityMeterProps> = ({ sources, onScoreUpdate }) => {
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [credibilityScores, setCredibilityScores] = useState<CredibilityScore[]>([]);
  const [overallAnalysis, setOverallAnalysis] = useState<{
    averageScore: number;
    rating: 'excellent' | 'good' | 'fair' | 'poor';
    recommendations: string[];
  }>({ averageScore: 0, rating: 'poor', recommendations: [] });

  useEffect(() => {
    const scores = sources.map(source => getCredibilityScore(source.url));
    setCredibilityScores(scores);
    
    const analysis = getOverallCredibilityRating(scores);
    setOverallAnalysis(analysis);
    onScoreUpdate?.(analysis.averageScore);
  }, [sources, onScoreUpdate]);

  if (sources.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {getScoreIcon(overallAnalysis.rating)}
          <h3 className="text-lg font-semibold text-gray-900">Source Credibility Analysis</h3>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`text-2xl font-bold ${getScoreColor(overallAnalysis.averageScore)}`}>
            {Math.round(overallAnalysis.averageScore)}
          </span>
          <span className="text-sm text-gray-500">/100</span>
        </div>
      </div>

      {/* Overall Score Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Overall Credibility</span>
          <span className={`text-sm font-semibold ${getScoreColor(overallAnalysis.averageScore)} capitalize`}>
            {overallAnalysis.rating}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all duration-500 ${
              overallAnalysis.averageScore >= 90 ? 'bg-green-500' :
              overallAnalysis.averageScore >= 80 ? 'bg-blue-500' :
              overallAnalysis.averageScore >= 70 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${Math.min(overallAnalysis.averageScore, 100)}%` }}
          />
        </div>
      </div>

      {/* Individual Source Scores */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Individual Source Ratings</h4>
        {credibilityScores.map((score, index) => (
          <div key={index} className="border border-gray-100 rounded-lg p-3 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getScoreIcon(score.rating)}
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">{score.source}</span>
                    <div className="flex items-center space-x-1">
                      {getCategoryIcon(score.category)}
                      <span className="text-xs text-gray-500 capitalize">{score.category.replace('-', ' ')}</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">{score.description}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`text-lg font-semibold ${getScoreColor(score.score)}`}>
                  {score.score}
                </span>
                <button
                  onClick={() => setSelectedSource(selectedSource === score.source ? null : score.source)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Info className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Warnings */}
            {score.warnings && score.warnings.length > 0 && (
              <div className="mt-2 flex items-center space-x-2 text-amber-600">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-xs">{score.warnings.join(', ')}</span>
              </div>
            )}

            {/* Detailed Breakdown */}
            {selectedSource === score.source && (
              <div className="mt-4 pt-3 border-t border-gray-100">
                <h5 className="text-sm font-medium text-gray-700 mb-3">Credibility Factors</h5>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(score.factors).map(([factor, value]) => (
                    <div key={factor} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600 capitalize">
                          {factor.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <span className={`text-xs font-medium ${getScoreColor(value)}`}>
                          {value}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className={`h-1.5 rounded-full ${
                            value >= 90 ? 'bg-green-500' :
                            value >= 80 ? 'bg-blue-500' :
                            value >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(value, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Recommendations */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-start space-x-2">
          <Award className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h5 className="text-sm font-medium text-blue-900 mb-2">Recommendations</h5>
            <ul className="text-xs text-blue-800 space-y-1">
              {overallAnalysis.recommendations.map((rec, index) => (
                <li key={index}>• {rec}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SourceCredibilityMeter;