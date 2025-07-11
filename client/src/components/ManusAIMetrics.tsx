import React from 'react';
import { BarChart, Shield, Search, Clock, Zap, Award, CheckCircle, AlertCircle, HelpCircle } from 'lucide-react';

interface ManusAIMetricsProps {
  metrics: {
    processingTimeMs: number;
    aiModelUsed: string;
    contentQualityScore: number;
  };
  factCheckResults?: {
    verifiedFacts: number;
    uncertainFacts: number;
    correctedFacts: number;
  };
  seoMetadata?: {
    keywords: string[];
    description: string;
    readabilityScore: number;
  };
}

export const ManusAIMetrics: React.FC<ManusAIMetricsProps> = ({
  metrics,
  factCheckResults,
  seoMetadata
}) => {
  const getQualityScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-orange-600';
  };

  const getQualityScoreBg = (score: number) => {
    if (score >= 90) return 'bg-green-100';
    if (score >= 80) return 'bg-blue-100';
    if (score >= 70) return 'bg-yellow-100';
    return 'bg-orange-100';
  };

  const getQualityLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Good';
    if (score >= 70) return 'Satisfactory';
    return 'Needs Improvement';
  };

  const getReadabilityLabel = (score: number) => {
    if (score >= 90) return 'Very Easy';
    if (score >= 80) return 'Easy';
    if (score >= 70) return 'Fairly Easy';
    if (score >= 60) return 'Standard';
    if (score >= 50) return 'Fairly Difficult';
    return 'Difficult';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-gradient-to-r from-purple-100 to-indigo-100 p-2 rounded-xl">
          <BarChart className="h-5 w-5 text-purple-600" />
        </div>
        <div>
          <h3 className="font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Manus AI Metrics
          </h3>
          <p className="text-sm text-gray-600">
            Performance and quality metrics for AI-generated content
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Content Quality Score */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 flex flex-col items-center justify-center">
          <div className="flex items-center space-x-2 mb-3">
            <Award className="h-5 w-5 text-gray-600" />
            <span className="font-medium text-gray-800">Content Quality</span>
          </div>
          <div className={`text-3xl font-bold ${getQualityScoreColor(metrics.contentQualityScore)}`}>
            {metrics.contentQualityScore}/100
          </div>
          <div className={`text-sm font-medium mt-1 ${getQualityScoreColor(metrics.contentQualityScore)}`}>
            {getQualityLabel(metrics.contentQualityScore)}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-3">
            <div 
              className={`h-2.5 rounded-full ${getQualityScoreBg(metrics.contentQualityScore)}`} 
              style={{ width: `${metrics.contentQualityScore}%` }}
            ></div>
          </div>
        </div>

        {/* Fact Check Results */}
        {factCheckResults && (
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Shield className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-800">Fact Check Results</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-gray-700">Verified Facts</span>
                </div>
                <span className="font-medium text-green-700">{factCheckResults.verifiedFacts}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <HelpCircle className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm text-gray-700">Uncertain Facts</span>
                </div>
                <span className="font-medium text-yellow-700">{factCheckResults.uncertainFacts}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <span className="text-sm text-gray-700">Corrected Facts</span>
                </div>
                <span className="font-medium text-orange-700">{factCheckResults.correctedFacts}</span>
              </div>
            </div>
          </div>
        )}

        {/* SEO Metrics */}
        {seoMetadata && (
          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Search className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-800">SEO Metrics</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Readability Score</span>
                <span className="font-medium text-green-700">{seoMetadata.readabilityScore}/100</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div 
                  className="h-2 rounded-full bg-green-500" 
                  style={{ width: `${seoMetadata.readabilityScore}%` }}
                ></div>
              </div>
              <div className="text-xs text-green-800 text-right">
                {getReadabilityLabel(seoMetadata.readabilityScore)}
              </div>
              <div className="mt-3">
                <div className="text-sm text-gray-700 mb-2">Top Keywords</div>
                <div className="flex flex-wrap gap-2">
                  {seoMetadata.keywords.slice(0, 5).map((keyword, index) => (
                    <span 
                      key={index}
                      className="px-2 py-1 bg-white text-green-700 rounded-full text-xs border border-green-200"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Processing Metrics */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4">
        <div className="flex items-center space-x-2 mb-3">
          <Zap className="h-5 w-5 text-gray-600" />
          <span className="font-medium text-gray-800">Processing Metrics</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-700">Processing Time</span>
            </div>
            <div className="font-medium text-gray-900 mt-1">
              {(metrics.processingTimeMs / 1000).toFixed(2)}s
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 text-purple-500" />
              <span className="text-sm text-gray-700">AI Model</span>
            </div>
            <div className="font-medium text-gray-900 mt-1">
              {metrics.aiModelUsed}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};