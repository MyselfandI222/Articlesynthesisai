import React from 'react';
import { useState, useEffect } from 'react';
import { FileText, Sparkles, Globe, TrendingUp, Bot } from 'lucide-react';
import { getTodaysBreakingNews } from '../utils/dailyNewsUpdater';
import { classifyBreakingNews, formatEngagementNumber } from '../utils/breakingNewsDetector';

export const Header: React.FC = () => {
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
    <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl shadow-sm">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">ArticleSynth</h1>
              <p className="text-xs text-gray-500">AI-Powered Content Synthesis</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {/* Daily Breaking News Indicator */}
            {breakingNewsCount > 0 && (
              <div className="flex items-center space-x-2 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-full px-3 py-1.5 shadow-sm">
                <TrendingUp className="w-4 h-4 text-red-600 animate-pulse" />
                <span className="text-xs font-bold text-red-800">
                  {breakingNewsCount} Breaking News Today
                </span>
                {lastUpdated && (
                  <span className="text-xs text-red-600 hidden sm:inline">
                    Updated {lastUpdated.toLocaleTimeString()}
                  </span>
                )}
              </div>
            )}
            <div className="flex items-center space-x-1 bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-full px-3 py-1.5 shadow-sm">
              <span className="text-xs font-medium text-purple-800">
                📊 150K+ Engagement = Breaking News
              </span>
            </div>
            <div className="flex items-center space-x-1 bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-full px-3 py-1.5 shadow-sm">
              <Bot className="h-4 w-4 text-purple-600" />
              <span className="text-xs font-medium text-purple-800">ChatGPT Enhanced</span>
            </div>
            <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-full px-3 py-1.5 shadow-sm">
              <Globe className="h-4 w-4 text-blue-600" />
              <span className="text-xs font-medium text-blue-800 hidden sm:inline">Live Google</span>
              <span className="text-xs font-medium text-blue-800 sm:hidden">Google</span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-gray-600 hidden md:flex">
              <FileText className="h-4 w-4" />
              <span>Legal & Original</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};