import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, Loader, TrendingUp, X, Globe, AlertCircle, ExternalLink, Plus, Check, Brain } from 'lucide-react';
import { Article, Category } from '../types';
import { searchArticles, getAllCategories, getTrendingTopics } from '../utils/articleSearch';
import { classifyBreakingNews, getBreakingNewsBadge, formatEngagementNumber } from '../utils/breakingNewsDetector';
import { searchWithGemini, convertSearchResultsToArticles, detectBreakingNews } from '../utils/geminiSearchService';
import { trackArticleView, getMostViewedArticles } from '../utils/articleViewTracker';

interface ArticleSearchProps {
  onAddArticle: (article: Article) => void;
  addedArticleIds: string[];
}

export const ArticleSearch: React.FC<ArticleSearchProps> = ({ onAddArticle, addedArticleIds }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trendingTopics, setTrendingTopics] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [useGeminiSearch, setUseGeminiSearch] = useState(false);
  const [geminiResults, setGeminiResults] = useState<Article[]>([]);
  const [isGeminiLoading, setIsGeminiLoading] = useState(false);
  const [mostViewedArticles, setMostViewedArticles] = useState<Array<{articleId: string, articleTitle: string, articleSource: string | null, articleUrl: string | null, viewCount: number}>>([]);

  // Load trending topics and categories on mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const topics = await getTrendingTopics();
        setTrendingTopics(topics);
        
        const allCategories = getAllCategories();
        setCategories(allCategories);
        
        const mostViewed = await getMostViewedArticles(8);
        setMostViewedArticles(mostViewed);
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
    setSearchResults([]);
    
    try {
      const filters = {
        category: selectedCategory || undefined,
        subcategory: selectedSubcategory || undefined,
      };
      
      // Standard search results
      const results = await searchArticles(query, filters, searchContext);
      setSearchResults(results);
      
      // If Gemini search is enabled, also search with Gemini
      if (useGeminiSearch) {
        setIsGeminiLoading(true);
        try {
          const geminiSearchResults = await searchWithGemini(query);
          const geminiArticles = convertSearchResultsToArticles(geminiSearchResults);
          setGeminiResults(geminiArticles);
        } catch (geminiErr) {
          console.error('Gemini search error:', geminiErr);
          // Don't fail the entire search if Gemini fails
        } finally {
          setIsGeminiLoading(false);
        }
      } else {
        setGeminiResults([]);
      }
      
      if (results.length === 0 && !useGeminiSearch && query.trim().length > 0) {
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



  // Check if article is already added
  const isArticleAdded = (id: string): boolean => {
    return addedArticleIds.includes(id);
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <div className="flex items-center space-x-4">
          <div className="relative flex-1">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${isSearching ? 'text-blue-500 animate-pulse' : 'text-gray-400'}`} />
            <input
              type="search"
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Search for articles on any topic..."
            />
            {searchQuery && (
              <button
                type="reset"
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
          
          {/* Gemini Search Toggle */}
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setUseGeminiSearch(!useGeminiSearch)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                useGeminiSearch
                  ? 'bg-blue-100 text-blue-700 border-2 border-blue-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title="Enhanced search with Google's Gemini AI"
            >
              <Brain className="h-4 w-4" />
              <span className="hidden sm:inline">Gemini</span>
              {isGeminiLoading && <Loader className="h-3 w-3 animate-spin" />}
            </button>
          </div>
        </div>
        {isSearching && (
          <div className="absolute -bottom-6 left-0 right-0 text-center">
            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              <Loader className="w-3 h-3 mr-1 animate-spin" />
              {useGeminiSearch ? 'Searching with Gemini AI...' : 'Searching real articles...'}
            </div>
          </div>
        )}
      </form>

      {/* Most Viewed This Month */}
      {mostViewedArticles.length > 0 && !isLoading && searchResults.length === 0 && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 border border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-purple-600 dark:text-purple-400" />
              Most Viewed This Month
            </h3>
            <span className="text-xs text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-800 px-3 py-1 rounded-full">
              Popular
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {mostViewedArticles.map((article, index) => (
              <div
                key={article.articleId}
                className="bg-white dark:bg-gray-800 rounded-xl p-4 hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700 group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                        #{index + 1}
                      </span>
                      {article.articleSource && (
                        <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full">
                          {article.articleSource}
                        </span>
                      )}
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {article.viewCount} views
                      </span>
                    </div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm leading-tight mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-2">
                      {article.articleTitle}
                    </h4>
                    {article.articleUrl && (
                      <a
                        href={article.articleUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 hover:underline flex items-center space-x-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        <span>View Article</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
                className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all transform hover:scale-105 shadow-sm ${
                  selectedCategory === category.id
                    ? category.color ? `${category.color} border-2 border-gray-300 shadow-md` : 'bg-blue-600 text-white shadow-lg'
                    : category.color ? category.color : 'bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900 border border-gray-200'
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
        <div className="hidden md:block space-y-4">
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
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all transform hover:scale-105 shadow-sm ${
                      selectedCategory === category.id && selectedSubcategory === subcategory.name
                        ? 'bg-blue-500 text-white shadow-md'
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
                className="px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full text-xs text-gray-700 hover:from-blue-100 hover:to-blue-200 hover:text-blue-800 transition-all transform hover:scale-105 shadow-sm font-medium"
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
          <Loader className="h-8 w-8 text-blue-600 animate-spin mb-3" />
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
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-medium text-gray-700">
              {searchResults.length} popular articles for "{searchQuery}"
            </h3>
            <button
              onClick={clearSearch}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Clear Results
            </button>
          </div>
          
          {/* Individual Articles */}
          <div className="space-y-4">
            {searchResults.filter(article => article.title && article.content).map((article) => {
              const isAdded = isArticleAdded(article.id);
              
              return (
                <div
                  key={article.id}
                  className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg hover:border-blue-300 transition-all duration-300 group"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                          {article.source || 'Unknown Source'}
                        </span>
                        <span className="px-2 py-1 bg-gradient-to-r from-red-100 to-orange-100 text-red-800 rounded-full text-xs font-medium">
                          🔥 Popular
                        </span>
                        <span className="text-xs text-gray-500">
                          {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : new Date().toLocaleDateString()} • {article.publishedAt ? new Date(article.publishedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-3 leading-tight text-lg group-hover:text-blue-700 transition-colors">
                        {article.title}
                      </h4>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                        {article.content.substring(0, 200)}...
                      </p>
                      
                      <div className="flex items-center space-x-3">
                        {article.url && (
                          <a
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => trackArticleView(article)}
                            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-1 text-xs font-medium"
                          >
                            <ExternalLink className="h-3 w-3" />
                            <span>View Original</span>
                          </a>
                        )}
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                          Real Article
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        trackArticleView(article);
                        onAddArticle(article);
                      }}
                      className={`ml-4 p-3 rounded-full transition-all shadow-sm hover:shadow-md transform hover:scale-105 ${
                        isAdded
                          ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border border-emerald-300'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
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

      {/* Gemini Search Results */}
      {!isLoading && useGeminiSearch && geminiResults.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-medium text-gray-700 flex items-center">
              <Brain className="h-4 w-4 mr-2 text-blue-600" />
              {geminiResults.length} results from Gemini AI for "{searchQuery}"
            </h3>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                AI-Enhanced
              </span>
            </div>
          </div>
          
          {/* Gemini Articles */}
          <div className="space-y-4">
            {geminiResults.filter(article => article.title && article.content).map((article) => {
              const isAdded = isArticleAdded(article.id);
              
              return (
                <div
                  key={article.id}
                  className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-6 hover:shadow-lg hover:border-blue-300 transition-all duration-300 group"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                          {article.source || 'Gemini AI'}
                        </span>
                        <span className="px-2 py-1 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 rounded-full text-xs font-medium">
                          🧠 AI-Enhanced
                        </span>
                        {article.relevanceScore && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                            {article.relevanceScore}% Relevant
                          </span>
                        )}
                        <span className="text-xs text-gray-500">
                          {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : new Date().toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-3 leading-tight text-lg group-hover:text-blue-700 transition-colors">
                        {article.title}
                      </h4>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                        {article.content.substring(0, 200)}...
                      </p>
                      
                      <div className="flex items-center space-x-3">
                        {article.url && (
                          <a
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => trackArticleView(article)}
                            className="text-xs text-blue-600 hover:text-blue-800 hover:underline flex items-center space-x-1"
                          >
                            <ExternalLink className="h-3 w-3" />
                            <span>View Source</span>
                          </a>
                        )}
                        {article.credibilityScore && (
                          <span className="text-xs text-gray-500">
                            Credibility: {article.credibilityScore}%
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        trackArticleView(article);
                        onAddArticle(article);
                      }}
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

// Extracted ArticleResultItem component for cleaner code
interface ArticleResultItemProps {
  result: SearchResult;
  isAdded: boolean;
  onAddArticle: () => void;
}

const ArticleResultItem: React.FC<ArticleResultItemProps> = ({ result, isAdded, onAddArticle }) => {
  const breakingNews = classifyBreakingNews(result);
  const breakingBadge = getBreakingNewsBadge(breakingNews);
  
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
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
          </div>
        </div>
        <button
          onClick={onAddArticle}
          className={`ml-4 p-2 rounded-lg transition-colors ${isAdded ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
          title={isAdded ? 'Remove article' : 'Add article'}
        >
          {isAdded ? <Check className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
        </button>
      </div>
    </div>
  );
};