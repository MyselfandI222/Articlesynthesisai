import React from 'react';
import { Crown, Lock, Check, Zap, Star, Shield, Download, Sparkles } from 'lucide-react';

interface PremiumFeature {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  isPremium: boolean;
  tier: 'free' | 'pro' | 'premium';
}

const FEATURES: PremiumFeature[] = [
  {
    id: 'basic_synthesis',
    name: 'Basic Article Synthesis',
    description: 'Combine up to 3 sources into original articles',
    icon: <Sparkles className="h-5 w-5" />,
    isPremium: false,
    tier: 'free'
  },
  {
    id: 'source_credibility',
    name: 'Source Credibility Meter',
    description: 'Basic credibility analysis for news sources',
    icon: <Shield className="h-5 w-5" />,
    isPremium: false,
    tier: 'free'
  },
  {
    id: 'advanced_synthesis',
    name: 'Advanced AI Synthesis',
    description: 'Premium GPT-4o with unlimited sources and advanced editing',
    icon: <Zap className="h-5 w-5" />,
    isPremium: true,
    tier: 'pro'
  },
  {
    id: 'story_depth',
    name: 'Story Depth Meter',
    description: 'AI-powered analysis of article comprehensiveness',
    icon: <Star className="h-5 w-5" />,
    isPremium: true,
    tier: 'pro'
  },
  {
    id: 'perspective_compass',
    name: 'Perspective Compass',
    description: 'Interactive visualization of different viewpoints',
    icon: <Crown className="h-5 w-5" />,
    isPremium: true,
    tier: 'pro'
  },
  {
    id: 'mood_meter',
    name: 'Mood Meter',
    description: 'Emotional tone analysis with circular visualization',
    icon: <Star className="h-5 w-5" />,
    isPremium: true,
    tier: 'pro'
  },
  {
    id: 'article_export',
    name: 'Article Export',
    description: 'Export articles in HTML, Markdown, and PDF formats',
    icon: <Download className="h-5 w-5" />,
    isPremium: true,
    tier: 'pro'
  },
  {
    id: 'unlimited_searches',
    name: 'Unlimited News Searches',
    description: 'No limits on news API searches and source analysis',
    icon: <Zap className="h-5 w-5" />,
    isPremium: true,
    tier: 'pro'
  },
  {
    id: 'custom_styles',
    name: 'Custom Writing Styles',
    description: 'Create and save your own writing style presets',
    icon: <Crown className="h-5 w-5" />,
    isPremium: true,
    tier: 'premium'
  },
  {
    id: 'api_access',
    name: 'API Access',
    description: 'Full API access for integrations and bulk processing',
    icon: <Zap className="h-5 w-5" />,
    isPremium: true,
    tier: 'premium'
  }
];

interface PremiumFeaturesProps {
  userTier: 'free' | 'pro' | 'premium';
  onUpgrade?: () => void;
}

export const PremiumFeatures: React.FC<PremiumFeaturesProps> = ({ userTier, onUpgrade }) => {
  const hasAccess = (featureTier: 'free' | 'pro' | 'premium') => {
    if (userTier === 'premium') return true;
    if (userTier === 'pro' && (featureTier === 'free' || featureTier === 'pro')) return true;
    if (userTier === 'free' && featureTier === 'free') return true;
    return false;
  };

  const getTierColor = (tier: 'free' | 'pro' | 'premium') => {
    switch (tier) {
      case 'free': return 'text-green-600 bg-green-100';
      case 'pro': return 'text-blue-600 bg-blue-100';
      case 'premium': return 'text-purple-600 bg-purple-100';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-lg">
            <Crown className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Premium Features</h2>
            <p className="text-sm text-gray-600">
              Current plan: <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTierColor(userTier)}`}>
                {userTier.charAt(0).toUpperCase() + userTier.slice(1)}
              </span>
            </p>
          </div>
        </div>
        {userTier !== 'premium' && (
          <button
            onClick={onUpgrade}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
          >
            Upgrade Plan
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {FEATURES.map((feature) => (
          <div
            key={feature.id}
            className={`p-4 rounded-lg border-2 transition-all ${
              hasAccess(feature.tier)
                ? 'border-green-200 bg-green-50'
                : 'border-gray-200 bg-gray-50'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg ${
                  hasAccess(feature.tier) ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  {hasAccess(feature.tier) ? (
                    <div className="text-green-600">{feature.icon}</div>
                  ) : (
                    <Lock className="h-5 w-5 text-gray-500" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className={`font-semibold ${
                    hasAccess(feature.tier) ? 'text-gray-900' : 'text-gray-600'
                  }`}>
                    {feature.name}
                  </h3>
                  <p className={`text-sm ${
                    hasAccess(feature.tier) ? 'text-gray-600' : 'text-gray-500'
                  }`}>
                    {feature.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTierColor(feature.tier)}`}>
                  {feature.tier}
                </span>
                {hasAccess(feature.tier) ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Lock className="h-4 w-4 text-gray-400" />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {userTier === 'free' && (
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
          <div className="flex items-center space-x-3 mb-2">
            <Crown className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-blue-900">Unlock Premium Features</h3>
          </div>
          <p className="text-sm text-blue-800 mb-3">
            Upgrade to Pro for advanced AI synthesis, unlimited sources, and professional export capabilities.
          </p>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-blue-700">
              <span className="font-semibold">Pro Plan:</span> $9.99/month
            </div>
            <div className="text-sm text-blue-700">
              <span className="font-semibold">Premium Plan:</span> $19.99/month
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const useFeatureAccess = (userTier: 'free' | 'pro' | 'premium') => {
  const hasFeature = (featureId: string) => {
    const feature = FEATURES.find(f => f.id === featureId);
    if (!feature) return false;
    
    if (userTier === 'premium') return true;
    if (userTier === 'pro' && (feature.tier === 'free' || feature.tier === 'pro')) return true;
    if (userTier === 'free' && feature.tier === 'free') return true;
    return false;
  };

  return { hasFeature };
};

export default PremiumFeatures;