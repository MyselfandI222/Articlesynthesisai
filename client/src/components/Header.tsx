import React from 'react';
import { useState, useEffect } from 'react';
import { FileText, Sparkles, Globe, TrendingUp, Bot, LogOut, Users, Crown, Menu, X } from 'lucide-react';
import { getTodaysBreakingNews } from '../utils/dailyNewsUpdater';
import { classifyBreakingNews, formatEngagementNumber } from '../utils/breakingNewsDetector';
import { useAuth } from '../hooks/useAuth';
import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
  onNavigate?: (page: 'home' | 'affiliate' | 'subscribe') => void;
  currentPage?: 'home' | 'affiliate' | 'subscribe';
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, currentPage = 'home' }) => {
  const { user, logoutMutation } = useAuth();
  const [breakingNewsCount, setBreakingNewsCount] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
    <header className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl shadow-sm">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">ArticleSynth</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">AI-Powered Content Synthesis</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {/* Daily Breaking News Indicator */}
            {breakingNewsCount > 0 && (
              <div className="flex items-center space-x-2 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 border border-red-200 dark:border-red-700 rounded-full px-3 py-1.5 shadow-sm">
                <TrendingUp className="w-4 h-4 text-red-600 dark:text-red-400 animate-pulse" />
                <span className="text-xs font-bold text-red-800 dark:text-red-300">
                  {breakingNewsCount} Breaking News Today
                </span>
                {lastUpdated && (
                  <span className="text-xs text-red-600 dark:text-red-400 hidden sm:inline">
                    Updated {lastUpdated.toLocaleTimeString()}
                  </span>
                )}
              </div>
            )}
            <div className="flex items-center space-x-1 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 border border-purple-200 dark:border-purple-700 rounded-full px-3 py-1.5 shadow-sm">
              <span className="text-xs font-medium text-purple-800 dark:text-purple-300">
                📊 150K+ Engagement = Breaking News
              </span>
            </div>
            <div className="flex items-center space-x-1 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 border border-purple-200 dark:border-purple-700 rounded-full px-3 py-1.5 shadow-sm">
              <Bot className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <span className="text-xs font-medium text-purple-800 dark:text-purple-300">ChatGPT Enhanced</span>
            </div>
            <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border border-blue-200 dark:border-blue-700 rounded-full px-3 py-1.5 shadow-sm">
              <Globe className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-medium text-blue-800 dark:text-blue-300 hidden sm:inline">Live Google</span>
              <span className="text-xs font-medium text-blue-800 dark:text-blue-300 sm:hidden">Google</span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400 hidden md:flex">
              <FileText className="h-4 w-4" />
              <span>Legal & Original</span>
            </div>
            
            {/* Navigation Menu */}
            {user && onNavigate && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onNavigate('home')}
                  className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    currentPage === 'home' 
                      ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <Sparkles className="h-4 w-4" />
                  <span className="hidden sm:inline">Home</span>
                </button>
                <button
                  onClick={() => onNavigate('affiliate')}
                  className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    currentPage === 'affiliate' 
                      ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">Affiliate</span>
                </button>

                <button
                  onClick={() => onNavigate('subscribe')}
                  className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    currentPage === 'subscribe' 
                      ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <Crown className="h-4 w-4" />
                  <span className="hidden sm:inline">Subscribe</span>
                </button>
              </div>
            )}

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* User Profile and Logout */}
            {user && (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 rounded-full px-3 py-1.5 shadow-sm">
                  <img 
                    src={user.profileImageUrl || 'https://via.placeholder.com/24'} 
                    alt="Profile" 
                    className="w-5 h-5 rounded-full object-cover"
                  />
                  <span className="text-xs font-medium text-gray-800 dark:text-gray-200 hidden sm:inline">
                    {user.firstName || user.username}
                  </span>
                </div>
                <button
                  onClick={async () => {
                    await fetch('/api/logout', { method: 'POST', credentials: 'include' });
                    window.location.reload();
                  }}
                  className="flex items-center space-x-2 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 border border-red-200 dark:border-red-700 rounded-full px-3 py-1.5 shadow-sm hover:from-red-100 hover:to-red-200 dark:hover:from-red-900/50 dark:hover:to-red-800/50 transition-all"
                >
                  <LogOut className="h-4 w-4 text-red-600 dark:text-red-400" />
                  <span className="text-xs font-medium text-red-800 dark:text-red-300 hidden sm:inline">Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};