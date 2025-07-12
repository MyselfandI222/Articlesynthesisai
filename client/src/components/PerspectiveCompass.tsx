import React, { useState, useEffect } from 'react';
import { Article } from '../types';
import { Compass, Eye, Users, TrendingUp, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

interface PerspectiveCompassProps {
  articles: Article[];
  className?: string;
}

interface PerspectiveData {
  id: string;
  label: string;
  count: number;
  sources: string[];
  color: string;
  angle: number;
  sentiment: 'positive' | 'negative' | 'neutral';
  intensity: number;
  examples: string[];
}

interface ViewpointAnalysis {
  perspectives: PerspectiveData[];
  dominantViewpoint: string;
  balanceScore: number;
  diversityScore: number;
  totalViewpoints: number;
}

export const PerspectiveCompass: React.FC<PerspectiveCompassProps> = ({ articles, className = '' }) => {
  const [analysis, setAnalysis] = useState<ViewpointAnalysis | null>(null);
  const [selectedPerspective, setSelectedPerspective] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (articles.length > 0) {
      setIsAnalyzing(true);
      const timer = setTimeout(() => {
        const viewpointAnalysis = analyzeViewpoints(articles);
        setAnalysis(viewpointAnalysis);
        setIsAnalyzing(false);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setAnalysis(null);
    }
  }, [articles]);

  if (articles.length === 0) {
    return (
      <div className={`bg-white rounded-xl border border-gray-200 p-6 ${className}`}>
        <div className="text-center py-8">
          <Compass className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-500 mb-2">Perspective Compass</h3>
          <p className="text-sm text-gray-400">Add articles to explore different viewpoints</p>
        </div>
      </div>
    );
  }

  if (isAnalyzing) {
    return (
      <div className={`bg-white rounded-xl border border-gray-200 p-6 ${className}`}>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-600 mb-2">Analyzing Perspectives</h3>
          <p className="text-sm text-gray-500">Mapping viewpoints across your sources...</p>
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  const selectedPerspectiveData = analysis.perspectives.find(p => p.id === selectedPerspective);

  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow ${className}`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-100 p-2 rounded-lg">
              <Compass className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Perspective Compass</h3>
              <p className="text-sm text-gray-500">Interactive viewpoint analysis</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-gray-600">
              {analysis.totalViewpoints} Viewpoints
            </div>
            <div className="text-xs text-gray-500">
              Balance: {Math.round(analysis.balanceScore * 100)}%
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Compass Visualization */}
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
                  strokeWidth="2"
                />
                
                {/* Compass directions */}
                <g className="text-xs fill-gray-400 text-center">
                  <text x="100" y="15" textAnchor="middle">Pro</text>
                  <text x="185" y="105" textAnchor="middle">Support</text>
                  <text x="100" y="195" textAnchor="middle">Con</text>
                  <text x="15" y="105" textAnchor="middle">Critical</text>
                </g>

                {/* Perspective points */}
                {analysis.perspectives.map((perspective, index) => {
                  const radian = (perspective.angle * Math.PI) / 180;
                  const radius = 50 + (perspective.intensity * 30);
                  const x = 100 + radius * Math.cos(radian);
                  const y = 100 + radius * Math.sin(radian);
                  
                  return (
                    <g key={perspective.id}>
                      {/* Connecting line */}
                      <line
                        x1="100"
                        y1="100"
                        x2={x}
                        y2={y}
                        stroke={perspective.color}
                        strokeWidth="2"
                        opacity="0.3"
                      />
                      
                      {/* Perspective dot */}
                      <circle
                        cx={x}
                        cy={y}
                        r={4 + perspective.count * 2}
                        fill={perspective.color}
                        stroke="white"
                        strokeWidth="2"
                        className="cursor-pointer hover:r-8 transition-all"
                        onClick={() => setSelectedPerspective(
                          selectedPerspective === perspective.id ? null : perspective.id
                        )}
                      />
                      
                      {/* Label */}
                      <text
                        x={x}
                        y={y - 15}
                        textAnchor="middle"
                        className="text-xs font-medium fill-gray-700 cursor-pointer"
                        onClick={() => setSelectedPerspective(
                          selectedPerspective === perspective.id ? null : perspective.id
                        )}
                      >
                        {perspective.label}
                      </text>
                    </g>
                  );
                })}

                {/* Center dot */}
                <circle cx="100" cy="100" r="4" fill="#6b7280" />
              </svg>
            </div>
            
            {/* Legend */}
            <div className="mt-4 grid grid-cols-2 gap-2">
              {analysis.perspectives.map((perspective) => (
                <button
                  key={perspective.id}
                  onClick={() => setSelectedPerspective(
                    selectedPerspective === perspective.id ? null : perspective.id
                  )}
                  className={`flex items-center space-x-2 p-2 rounded-lg border transition-all ${
                    selectedPerspective === perspective.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: perspective.color }}
                  />
                  <div className="text-left">
                    <div className="text-sm font-medium text-gray-700">
                      {perspective.label}
                    </div>
                    <div className="text-xs text-gray-500">
                      {perspective.count} sources
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Analysis Panel */}
          <div className="space-y-4">
            {/* Overall Analysis */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Viewpoint Analysis</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Dominant Viewpoint</span>
                  <span className="text-sm font-medium text-gray-900">
                    {analysis.dominantViewpoint}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Balance Score</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${analysis.balanceScore * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {Math.round(analysis.balanceScore * 100)}%
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Diversity Score</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all"
                        style={{ width: `${analysis.diversityScore * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {Math.round(analysis.diversityScore * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Selected Perspective Details */}
            {selectedPerspectiveData && (
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-blue-900">
                    {selectedPerspectiveData.label} Perspective
                  </h4>
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: selectedPerspectiveData.color }}
                    />
                    {selectedPerspectiveData.sentiment === 'positive' && (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                    {selectedPerspectiveData.sentiment === 'negative' && (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    {selectedPerspectiveData.sentiment === 'neutral' && (
                      <AlertCircle className="h-4 w-4 text-gray-600" />
                    )}
                  </div>
                </div>
                
                <div className="space-y-2 mb-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-blue-700">Sources:</span>
                    <span className="text-sm font-medium text-blue-900">
                      {selectedPerspectiveData.count}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-blue-700">Intensity:</span>
                    <span className="text-sm font-medium text-blue-900">
                      {Math.round(selectedPerspectiveData.intensity * 100)}%
                    </span>
                  </div>
                </div>

                {selectedPerspectiveData.sources.length > 0 && (
                  <div>
                    <span className="text-sm font-medium text-blue-700">From Sources:</span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {selectedPerspectiveData.sources.map((source, index) => (
                        <span
                          key={index}
                          className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full"
                        >
                          {source}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Recommendations */}
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <h4 className="font-medium text-yellow-900 mb-2">Balance Recommendations</h4>
              <div className="space-y-1">
                {getBalanceRecommendations(analysis).map((rec, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-1.5 flex-shrink-0" />
                    <p className="text-sm text-yellow-800">{rec}</p>
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
const analyzeViewpoints = (articles: Article[]): ViewpointAnalysis => {
  const perspectives: PerspectiveData[] = [];
  const viewpointKeywords = {
    supportive: {
      keywords: ['support', 'agree', 'endorse', 'approve', 'favor', 'back', 'champion', 'advocate', 'praise'],
      sentiment: 'positive' as const,
      color: '#10b981',
      angle: 45
    },
    critical: {
      keywords: ['oppose', 'against', 'criticize', 'condemn', 'reject', 'disapprove', 'dispute', 'challenge'],
      sentiment: 'negative' as const,
      color: '#ef4444',
      angle: 225
    },
    neutral: {
      keywords: ['analyze', 'examine', 'consider', 'review', 'assess', 'evaluate', 'study', 'investigate'],
      sentiment: 'neutral' as const,
      color: '#6b7280',
      angle: 135
    },
    expert: {
      keywords: ['expert', 'specialist', 'researcher', 'analyst', 'professor', 'authority', 'scholar'],
      sentiment: 'neutral' as const,
      color: '#8b5cf6',
      angle: 315
    },
    economic: {
      keywords: ['economic', 'financial', 'market', 'business', 'economic impact', 'cost', 'investment'],
      sentiment: 'neutral' as const,
      color: '#f59e0b',
      angle: 90
    },
    social: {
      keywords: ['social', 'community', 'public', 'society', 'people', 'citizens', 'population'],
      sentiment: 'neutral' as const,
      color: '#06b6d4',
      angle: 180
    },
    political: {
      keywords: ['political', 'government', 'policy', 'legislation', 'regulatory', 'official', 'administration'],
      sentiment: 'neutral' as const,
      color: '#dc2626',
      angle: 270
    },
    environmental: {
      keywords: ['environmental', 'climate', 'sustainability', 'green', 'eco', 'carbon', 'pollution'],
      sentiment: 'neutral' as const,
      color: '#059669',
      angle: 0
    }
  };

  Object.entries(viewpointKeywords).forEach(([key, config]) => {
    const relevantArticles = articles.filter(article => {
      const content = `${article.title} ${article.content}`.toLowerCase();
      return config.keywords.some(keyword => content.includes(keyword));
    });

    if (relevantArticles.length > 0) {
      const intensity = Math.min(relevantArticles.length / articles.length, 1);
      const sources = [...new Set(relevantArticles.map(a => a.source || 'Unknown'))];
      
      perspectives.push({
        id: key,
        label: key.charAt(0).toUpperCase() + key.slice(1),
        count: relevantArticles.length,
        sources,
        color: config.color,
        angle: config.angle,
        sentiment: config.sentiment,
        intensity,
        examples: relevantArticles.slice(0, 3).map(a => a.title)
      });
    }
  });

  // Calculate balance and diversity scores
  const balanceScore = calculateBalanceScore(perspectives);
  const diversityScore = perspectives.length / Object.keys(viewpointKeywords).length;
  const dominantViewpoint = perspectives.length > 0 
    ? perspectives.reduce((a, b) => a.count > b.count ? a : b).label
    : 'None';

  return {
    perspectives,
    dominantViewpoint,
    balanceScore,
    diversityScore,
    totalViewpoints: perspectives.length
  };
};

const calculateBalanceScore = (perspectives: PerspectiveData[]): number => {
  if (perspectives.length === 0) return 0;
  
  const totalCount = perspectives.reduce((sum, p) => sum + p.count, 0);
  const idealCount = totalCount / perspectives.length;
  
  const variance = perspectives.reduce((sum, p) => {
    return sum + Math.pow(p.count - idealCount, 2);
  }, 0) / perspectives.length;
  
  const standardDeviation = Math.sqrt(variance);
  const maxPossibleSD = idealCount;
  
  return Math.max(0, 1 - (standardDeviation / maxPossibleSD));
};

const getBalanceRecommendations = (analysis: ViewpointAnalysis): string[] => {
  const recommendations = [];
  
  if (analysis.balanceScore < 0.5) {
    recommendations.push('Consider adding sources with opposing viewpoints for better balance');
  }
  
  if (analysis.diversityScore < 0.4) {
    recommendations.push('Expand source variety to include more diverse perspectives');
  }
  
  if (analysis.totalViewpoints < 3) {
    recommendations.push('Add more sources to capture a broader range of viewpoints');
  }
  
  const dominantPerspective = analysis.perspectives.find(p => p.label === analysis.dominantViewpoint);
  if (dominantPerspective && dominantPerspective.count > analysis.perspectives.length * 0.6) {
    recommendations.push(`${analysis.dominantViewpoint} viewpoint dominates - consider counter-perspectives`);
  }
  
  if (analysis.balanceScore >= 0.8 && analysis.diversityScore >= 0.6) {
    recommendations.push('Excellent perspective balance! Your sources show diverse viewpoints');
  }
  
  return recommendations;
};