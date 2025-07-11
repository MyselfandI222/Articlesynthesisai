import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, Loader, TrendingUp, X, Globe, AlertCircle, ExternalLink, Plus, Check } from 'lucide-react';
import { Article, SearchResult, Category } from '../types';
import { searchArticles, getAllCategories, getTrendingTopics } from '../utils/articleSearch';
import { classifyBreakingNews, getBreakingNewsBadge, formatEngagementNumber } from '../utils/breakingNewsDetector';

interface ArticleSearchProps {
  onAddArticle: (article: Article) => void;
  addedArticleIds: string[];
}

export const ArticleSearch: React.FC<ArticleSearchProps> = ({ onAddArticle, addedArticleIds }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trendingTopics, setTrendingTopics] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Load trending topics and categories on mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const topics = await getTrendingTopics();
        setTrendingTopics(topics);
        
        const allCategories = getAllCategories();
        setCategories(allCategories);
      } catch (error) {
        console.error('Failed to load initial data:', error);
      }
    };
    
    loadInitialData();
  }, []);

  // Handle search query changes with debounce
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Set new timeout for search
    if (query.trim()) {
      searchTimeoutRef.current = setTimeout(() => {
        setIsSearching(true);
        handleSearch(query, 'user_typed')
          .finally(() => setIsSearching(false));
      }, 500);
    } else {
      setSearchResults([]);
    }
  };

  // Handle search submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Clear timeout to prevent duplicate searches
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = null;
      }

      setIsSearching(true);
      setIsLoading(true);
      handleSearch(searchQuery, 'user_typed');
    }
  };

  // Handle trending topic click
  const handleTrendingTopicClick = (topic: string) => {
    setSearchQuery(topic);
    setIsSearching(true);
    handleSearch(topic, 'trending_click');
  };

  // Handle category click
  const handleCategoryClick = (category: string, subcategory?: string) => {
    setSelectedCategory(category);
    setSelectedSubcategory(subcategory || null);
    setIsSearching(true);
    
    const searchTerm = subcategory || category;
    setSearchQuery(searchTerm);
    handleSearch(searchTerm, 'category_click');
  };

  // Main search function
  const handleSearch = async (query: string, searchContext: 'user_typed' | 'trending_click' | 'category_click'): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const filters = {
        category: selectedCategory || undefined,
        subcategory: selectedSubcategory || undefined,
      };
      
      const results = await searchArticles(query, filters, searchContext);
      setSearchResults(results);
      
      if (results.length === 0) {
        setError(`No results found for "${query}". Try a different search term or category.`);
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to search articles. Please try again.');
    } finally {
      setIsSearching(false);
      setIsLoading(false);
    }
  };

  // Handle API filters changed
  const handleFiltersChanged = () => {
    if (searchQuery.trim()) {
      handleSearch(searchQuery, 'user_typed').catch(console.error);
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSelectedCategory(null);
    setSelectedSubcategory(null);
  };

  // Convert search result to article
  const convertToArticle = (result: SearchResult): Article => {
    return {
      id: result.id,
      title: result.title,
      content: result.content,
      source: result.source,
      url: result.url
    };
  };

  // Check if article is already added
  const isArticleAdded = (id: string): boolean => {
    return addedArticleIds.includes(id);
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <div className="flex items-center">
          <div className="relative flex-1">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${isSearching ? 'text-blue-500 animate-pulse' : 'text-gray-400'}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Search for articles on any topic..."
            />
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </form>

      {/* Categories */}
      {!isLoading && searchResults.length === 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700 flex items-center mb-3">
            <Filter className="h-4 w-4 mr-2 text-gray-600" />
            Browse by Category
          </h3>
          <div className="flex flex-wrap gap-3">
            {categories.slice(0, 8).map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedCategory === category.id
                    ? category.color ? `${category.color} border-2 border-gray-300 shadow-sm` : 'bg-blue-600 text-white'
                    : category.color ? category.color : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Subcategories */}
      {!isLoading && searchResults.length === 0 && (
        <div className="space-y-4">
          {categories.map((category) => (
            <div key={category.id} className="mb-6">
              <div 
                className={`flex items-center space-x-2 mb-2 ${
                  selectedCategory === category.id ? 'text-blue-700 font-medium' : 'text-gray-700'
                }`}
              >
                <h3 className="text-sm">{category.name}</h3>
                {selectedCategory === category.id && (
                  <button
                    onClick={() => {
                      setSelectedCategory(null);
                      setSelectedSubcategory(null);
                    }}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {category.subcategories.slice(0, 8).map((subcategory, index) => (
                  <button
                    key={subcategory.name}
                    onClick={() => handleCategoryClick(category.id, subcategory.name)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      selectedCategory === category.id && selectedSubcategory === subcategory.name
                        ? 'bg-blue-500 text-white shadow-sm'
                        : `bg-${['blue', 'green', 'yellow', 'purple', 'pink', 'indigo', 'red', 'orange'][index % 8]}-100 text-${['blue', 'green', 'yellow', 'purple', 'pink', 'indigo', 'red', 'orange'][index % 8]}-800 hover:bg-${['blue', 'green', 'yellow', 'purple', 'pink', 'indigo', 'red', 'orange'][index % 8]}-200`
                    }`}
                  >
                    {subcategory.name}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Trending Topics */}
      {!isLoading && searchResults.length === 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700">Trending Topics</h3>
          <div className="flex flex-wrap gap-3">
            {trendingTopics.slice(0, 16).map((topic, index) => (
              <button
                key={index}
                onClick={() => handleTrendingTopicClick(topic)}
                className="px-3 py-1.5 bg-gray-100 rounded-lg text-xs text-gray-700 hover:bg-gray-200 hover:text-gray-900 transition-colors"
              >
                {topic}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader className="h-8 w-8 text-blue-600 animate-spin" />
          <span className="ml-3 text-gray-600">Searching for articles...</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center space-x-3">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Search Results */}
      {!isLoading && searchResults.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700">
              {searchResults.length} results for "{searchQuery}"
            </h3>
            <button
              onClick={clearSearch}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Clear Results
            </button>
          </div>
          <div className="space-y-3">
            {searchResults.filter(result => result.title && result.description).map((result) => {
              const isAdded = isArticleAdded(result.id);
              const breakingNews = classifyBreakingNews(result);
              const breakingBadge = getBreakingNewsBadge(breakingNews);
              
              return (
                <div
                  key={result.id}
                  className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-xs text-gray-500">{result.source}</span>
                        {result.publishedAt && (
                          <span className="text-xs text-gray-400">
                            {new Date(result.publishedAt).toLocaleDateString()} {new Date(result.publishedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        )}
                        {breakingBadge.show && (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${breakingBadge.className}`}>
                            {breakingBadge.icon} {breakingBadge.text}
                          </span>
                        )}
                      </div>
                      <h4 className="font-medium text-gray-900 mb-2">{result.title}</h4>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{result.description}</p>
                      
                      {/* Engagement Metrics */}
                      {breakingNews.engagementMetrics && (
                        <div className="flex items-center space-x-3 text-xs text-gray-500 mb-3">
                          <span title="Views">
                            👁️ {formatEngagementNumber(breakingNews.engagementMetrics.views)}
                          </span>
                          <span title="Shares">
                            🔄 {formatEngagementNumber(breakingNews.engagementMetrics.shares)}
                          </span>
                          <span title="Comments">
                            💬 {formatEngagementNumber(breakingNews.engagementMetrics.comments)}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-3">
                        {result.url && (
                          <a
                            href={result.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:text-blue-800 hover:underline flex items-center space-x-1"
                          >
                            <ExternalLink className="h-3 w-3" />
                            <span>View Source</span>
                          </a>
                        )}
                        {result.viewpoint && (
                          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                            {result.viewpoint}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => onAddArticle(convertToArticle(result))}
                      className={`ml-4 p-2 rounded-lg transition-colors ${
                        isAdded
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      }`}
                      title={isAdded ? 'Remove article' : 'Add article'}
                    >
                      {isAdded ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <Plus className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};