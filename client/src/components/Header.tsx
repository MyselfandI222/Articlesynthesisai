import React from 'react';
import { useState, useEffect } from 'react';
import { FileText, Sparkles, Globe, TrendingUp, Bot, HelpCircle } from 'lucide-react';
import { getTodaysBreakingNews } from '../utils/dailyNewsUpdater';
import { classifyBreakingNews, formatEngagementNumber } from '../utils/breakingNewsDetector';

interface HeaderProps {
  onShowOnboarding?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onShowOnboarding }) => {
  const [breakingNewsCount, setBreakingNewsCount] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    // Load today's breaking news count
    const loadBreakingNewsCount = async () => {
      try {
        const todaysNews = await getTodaysBreakingNews();
        // Only count articles that actually meet breaking news criteria
        const actualBreakingNews = todaysNews.filter(article => {
          const classification = classifyBreakingNews(article);
          return classification.isBreaking;
        });
        setBreakingNewsCount(actualBreakingNews.length);
        setLastUpdated(new Date());
      } catch (error) {
        console.warn('Failed to load breaking news count:', error);
      }
    };

    loadBreakingNewsCount();

    // Update every hour
    const interval = setInterval(loadBreakingNewsCount, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl shadow-lg">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">ArticleSynth</h1>
              <p className="text-sm text-gray-500">AI-Powered Content Synthesis</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {/* Only show breaking news if there are any */}
            {breakingNewsCount > 0 && (
              <div className="flex items-center space-x-2 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl px-3 py-1.5 shadow-sm">
                <TrendingUp className="w-4 h-4 text-red-600 animate-pulse" />
                <span className="text-sm font-medium text-red-800">
                  {breakingNewsCount} Breaking News
                </span>
              </div>
            )}
            <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl px-3 py-1.5 shadow-sm">
              <Globe className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Live Sources</span>
            </div>
            {onShowOnboarding && (
              <button
                onClick={onShowOnboarding}
                className="flex items-center space-x-1 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 rounded-xl px-3 py-1.5 transition-all shadow-sm hover:shadow-md"
                title="Show tutorial"
              >
                <HelpCircle className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Help</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};