import React from 'react';
import { BarChart, Shield, Search, Clock, Zap, Award, CheckCircle, AlertCircle, HelpCircle } from 'lucide-react';

interface ChatGPTMetricsProps {
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

export const ChatGPTMetrics: React.FC<ChatGPTMetricsProps> = ({
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
        <div className="bg-gradient-to-r from-green-100 to-blue-100 p-2 rounded-xl">
          <BarChart className="h-5 w-5 text-green-600" />
        </div>
        <div>
          <h3 className="font-semibold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            ChatGPT Metrics
          </h3>
          <p className="text-sm text-gray-600">
            Performance and quality metrics for AI-generated content
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Content Quality Score */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 flex flex-col items-center justify-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 ${getQualityScoreBg(metrics.contentQualityScore)}`}>
            <Award className={`h-8 w-8 ${getQualityScoreColor(metrics.contentQualityScore)}`} />
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${getQualityScoreColor(metrics.contentQualityScore)}`}>
              {metrics.contentQualityScore}
            </div>
            <div className="text-sm text-gray-600">{getQualityLabel(metrics.contentQualityScore)}</div>
          </div>
        </div>

        {/* Processing Time */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-3">
            <Clock className="h-8 w-8 text-blue-600" />
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {(metrics.processingTimeMs / 1000).toFixed(1)}s
            </div>
            <div className="text-sm text-gray-600">Processing Time</div>
          </div>
        </div>

        {/* AI Model Used */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-3">
            <Zap className="h-8 w-8 text-green-600" />
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">
              {metrics.aiModelUsed}
            </div>
            <div className="text-sm text-gray-600">AI Model</div>
          </div>
        </div>
      </div>

      {/* Fact Check Results */}
      {factCheckResults && (
        <div className="mb-6">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
            <Shield className="h-4 w-4 mr-2" />
            Fact Check Results
          </h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <div className="flex items-center justify-center mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div className="text-lg font-bold text-green-600">{factCheckResults.verifiedFacts}</div>
              <div className="text-sm text-gray-600">Verified Facts</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-3 text-center">
              <div className="flex items-center justify-center mb-2">
                <HelpCircle className="h-5 w-5 text-yellow-600" />
              </div>
              <div className="text-lg font-bold text-yellow-600">{factCheckResults.uncertainFacts}</div>
              <div className="text-sm text-gray-600">Uncertain Facts</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-3 text-center">
              <div className="flex items-center justify-center mb-2">
                <AlertCircle className="h-5 w-5 text-orange-600" />
              </div>
              <div className="text-lg font-bold text-orange-600">{factCheckResults.correctedFacts}</div>
              <div className="text-sm text-gray-600">Corrected Facts</div>
            </div>
          </div>
        </div>
      )}

      {/* SEO Metadata */}
      {seoMetadata && (
        <div>
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
            <Search className="h-4 w-4 mr-2" />
            SEO Analysis
          </h4>
          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-600 mb-1">Keywords</div>
              <div className="flex flex-wrap gap-2">
                {seoMetadata.keywords.map((keyword, index) => (
                  <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Description</div>
              <div className="text-sm text-gray-800 bg-gray-50 p-2 rounded">
                {seoMetadata.description}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Readability Score</div>
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${seoMetadata.readabilityScore}%` }}
                  ></div>
                </div>
                <div className="text-sm font-medium text-gray-700">
                  {seoMetadata.readabilityScore}/100 - {getReadabilityLabel(seoMetadata.readabilityScore)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};