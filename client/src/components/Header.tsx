import React from 'react';
import { useState, useEffect } from 'react';
import { FileText, Sparkles, Globe, TrendingUp, Bot, LogOut, Users, Crown, Menu, X } from 'lucide-react';
import { getTodaysBreakingNews } from '../utils/dailyNewsUpdater';
import { classifyBreakingNews, formatEngagementNumber } from '../utils/breakingNewsDetector';
import { useAuth } from '../hooks/useAuth';
import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
  onNavigate?: (page: 'home' | 'affiliate' | 'premium' | 'subscribe') => void;
  currentPage?: 'home' | 'affiliate' | 'premium' | 'subscribe';
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, currentPage = 'home' }) => {
  const { user } = useAuth();
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
    <header className="glass-effect sticky top-0 z-50 shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="gradient-primary p-2.5 rounded-2xl shadow-md">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gradient">ArticleSynth</h1>
              <p className="text-xs text-muted-foreground">AI-Powered Content Synthesis</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {/* Daily Breaking News Indicator */}
            {breakingNewsCount > 0 && (
              <div className="flex items-center space-x-2 bg-gradient-to-r from-red-100 to-orange-100 dark:from-red-900/40 dark:to-orange-900/40 border border-red-200 dark:border-red-700/50 rounded-xl px-3 py-1.5 smooth-transition hover:shadow-md">
                <TrendingUp className="w-4 h-4 text-red-600 dark:text-red-400 animate-pulse" />
                <span className="text-xs font-semibold text-red-700 dark:text-red-300">
                  {breakingNewsCount} Breaking
                </span>
              </div>
            )}
            <div className="hidden lg:flex items-center space-x-1 bg-purple-100/50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700/50 rounded-xl px-3 py-1.5">
              <span className="text-xs font-medium text-purple-700 dark:text-purple-300">
                📊 150K+ = Breaking
              </span>
            </div>
            <div className="flex items-center space-x-1.5 bg-purple-100/50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700/50 rounded-xl px-3 py-1.5">
              <Bot className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <span className="text-xs font-medium text-purple-700 dark:text-purple-300">AI Enhanced</span>
            </div>
            <div className="flex items-center space-x-1.5 bg-blue-100/50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/50 rounded-xl px-3 py-1.5">
              <Globe className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-medium text-blue-700 dark:text-blue-300 hidden sm:inline">Live</span>
            </div>
            
            {/* Navigation Menu */}
            {user && onNavigate && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onNavigate('home')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium smooth-transition ${
                    currentPage === 'home' 
                      ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 shadow-sm' 
                      : 'bg-gray-100/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <Sparkles className="h-4 w-4" />
                  <span className="hidden sm:inline">Home</span>
                </button>
                <button
                  onClick={() => onNavigate('affiliate')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium smooth-transition ${
                    currentPage === 'affiliate' 
                      ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 shadow-sm' 
                      : 'bg-gray-100/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">Affiliate</span>
                </button>

                <button
                  onClick={() => onNavigate('subscribe')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium smooth-transition ${
                    currentPage === 'subscribe' 
                      ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 shadow-sm' 
                      : 'bg-gray-100/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <Crown className="h-4 w-4" />
                  <span className="hidden sm:inline">Premium</span>
                </button>
              </div>
            )}

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* User Profile and Logout */}
            {user && (
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2 bg-gray-100/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700/50 rounded-xl px-3 py-1.5">
                  <img 
                    src={user.profileImageUrl || 'https://via.placeholder.com/24'} 
                    alt="Profile" 
                    className="w-5 h-5 rounded-full object-cover ring-2 ring-blue-400 dark:ring-blue-500"
                  />
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300 hidden sm:inline">
                    {user.firstName || user.username}
                  </span>
                </div>
                <button
                  onClick={async () => {
                    await fetch('/api/logout', { method: 'POST', credentials: 'include' });
                    window.location.reload();
                  }}
                  className="flex items-center space-x-1.5 bg-red-100/80 dark:bg-red-900/30 border border-red-200 dark:border-red-700/50 rounded-xl px-3 py-1.5 hover:bg-red-200 dark:hover:bg-red-900/50 smooth-transition"
                >
                  <LogOut className="h-4 w-4 text-red-600 dark:text-red-400" />
                  <span className="text-xs font-medium text-red-700 dark:text-red-300 hidden sm:inline">Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};