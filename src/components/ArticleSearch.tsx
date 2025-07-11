import React, { useState, useEffect } from 'react';
import { Search, Plus, ExternalLink, Clock, User, Loader, Lightbulb, Eye, TrendingUp, Sparkles, ChevronDown, ChevronRight, MapPin, Globe, Bot } from 'lucide-react';
import { Article } from '../types';
import { searchArticles, getRelatedViewpoints, getTrendingTopics, getSuggestedQueries, getSportsSubcategories, getAllCategories } from '../utils/articleSearch';
import { searchGoogleForArticles, shouldUseGoogleSearch } from '../utils/googleSearchAPI';
import { enhanceSearchWithChatGPT } from '../utils/chatGptSearchService';
import { classifyBreakingNews, getBreakingNewsBadge, formatEngagementNumber, getTrendingStatus } from '../utils/breakingNewsDetector';
import { filterSearchResultsByEnabledAPIs, getEnabledAPISources } from '../utils/apiFilters';
import { APIFilterButton } from './APIFilterButton';
import { LocationPrompt } from './LocationPrompt';
import { getLocalNews, getSavedLocation, getLocationDisplayName, isUSLocation, type LocationData } from '../utils/locationService';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  content: string;
  url: string;
  source: string;
  publishedAt: string;
  author?: string;
  viewpoint?: 'neutral' | 'supportive' | 'critical' | 'alternative';
}

interface ArticleSearchProps {
  onAddArticle: (article: Article) => void;
  addedArticleIds: string[];
}

export const ArticleSearch: React.FC<ArticleSearchProps> = ({ onAddArticle, addedArticleIds }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [suggestedViewpoints, setSuggestedViewpoints] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<{ [key: string]: boolean }>({});
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [userLocation, setUserLocation] = useState<LocationData | null>(null);
  const [localNews, setLocalNews] = useState<SearchResult[]>([]);
  const [showLocalNews, setShowLocalNews] = useState(false);
  const [searchContext, setSearchContext] = useState<'user_typed' | 'trending_click' | 'category_click'>('user_typed');
  const [isGoogleSearch, setIsGoogleSearch] = useState(false);
  const [chatGptAnalysis, setChatGptAnalysis] = useState<string>('');
  const [isSearchEnhanced, setIsSearchEnhanced] = useState(false);
  const [isChatGptLoading, setIsChatGptLoading] = useState(false);
  const [enabledAPIs, setEnabledAPIs] = useState<string[]>([]);

  const [trendingTopics, setTrendingTopics] = useState<string[]>([]);
  const suggestedQueries = getSuggestedQueries();
  const allCategories = getAllCategories();

  useEffect(() => {
    // Check for saved location on component mount
    const saved = getSavedLocation();
    if (saved) {
      setUserLocation(saved);
    }
    
    // Load today's trending topics (auto-updated daily)
    getTrendingTopics().then(setTrendingTopics);
    
    // Load enabled APIs
    setEnabledAPIs(getEnabledAPISources());
    
    // Set up interval to refresh trending topics every hour
    const trendingInterval = setInterval(() => {
      getTrendingTopics().then(setTrendingTopics);
    }, 60 * 60 * 1000); // 1 hour
    
    return () => clearInterval(trendingInterval);
  }, []);

  // Handle API filter changes
  const handleAPIFiltersChanged = () => {
    setEnabledAPIs(getEnabledAPISources());
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    // Determine if this should be a Google search
    const useGoogle = shouldUseGoogleSearch(searchQuery, searchContext);
    setIsGoogleSearch(useGoogle);

    setIsSearching(true);
    setSelectedArticleId(null);
    setSuggestedViewpoints([]);
    setSearchError(null);
    
    try {
      // Set ChatGPT loading state
      setIsChatGptLoading(true);
      setChatGptAnalysis('');
      setIsSearchEnhanced(false);

      // Use ChatGPT enhanced search
      const { results, chatGptAnalysis, isEnhanced } = await enhanceSearchWithChatGPT(searchQuery, useGoogle);
      
      // Update states with results
      setIsChatGptLoading(false);
      setChatGptAnalysis(chatGptAnalysis);
      setIsSearchEnhanced(isEnhanced);
      
      // Filter results based on enabled APIs
      const filteredResults = filterSearchResultsByEnabledAPIs(results, enabledAPIs);
      setSearchResults(filteredResults);
      setHasSearched(true);
      
      if (filteredResults.length === 0) {
        setSearchError(
          useGoogle 
            ? `No recent articles found for "${searchQuery}". Try different keywords, browse trending topics, or adjust your API filters.`
            : `No articles found for "${searchQuery}". Try different keywords, browse trending topics, or adjust your API filters.`
        );
      }
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
      setSearchError(useGoogle ? 'Google search failed. Please try again.' : 'Search failed. Please try again.');
    } finally {
      setIsSearching(false);
      setSearchContext('user_typed'); // Reset context after search
    }
  };

  const handleLocationUpdate = async (location: LocationData | null) => {
    setUserLocation(location);
    if (location) {
      try {
        const localResults = await getLocalNews(location, searchQuery);
        setLocalNews(localResults);
      } catch (error) {
        console.error('Failed to get local news:', error);
      }
    }
    setShowLocationPrompt(false);
  };

  const handleLocalNewsSearch = async () => {
    if (!userLocation) {
      setShowLocationPrompt(true);
      return;
    }

    try {
      const localResults = await getLocalNews(userLocation, searchQuery);
      setLocalNews(localResults);
      setShowLocalNews(true);
    } catch (error) {
      console.error('Failed to get local news:', error);
    }
  };

  const handleAddArticle = async (result: SearchResult) => {
    const article: Article = {
      id: result.id,
      title: result.title,
      content: result.content,
      url: result.url,
      source: result.source,
    };
    onAddArticle(article);

    // Load related viewpoints when an article is selected
    if (selectedArticleId !== result.id) {
      setSelectedArticleId(result.id);
      setIsLoadingSuggestions(true);
      
      try {
        const relatedViewpoints = await getRelatedViewpoints(result.title, result.content);
        setSuggestedViewpoints(relatedViewpoints);
      } catch (error) {
        console.error('Failed to load related viewpoints:', error);
        setSuggestedViewpoints([]);
      } finally {
        setIsLoadingSuggestions(false);
      }
    }
  };

  const isArticleAdded = (articleId: string): boolean => {
    return addedArticleIds.includes(articleId);
  };

  const handleTrendingTopicClick = (topic: string) => {
    setSearchContext('trending_click');
    setSearchQuery(topic);
    // Auto-search when clicking trending topic
    setTimeout(() => {
      const event = { target: { value: topic } } as React.ChangeEvent<HTMLInputElement>;
      setSearchQuery(topic);
      handleSearch();
    }, 100);
  };

  const handleSuggestedQueryClick = (query: string) => {
    setSearchContext('user_typed'); // Suggested queries should use Google
    setSearchQuery(query);
    setTimeout(() => {
      handleSearch();
    }, 100);
  };

  const handleSubcategoryClick = (subcategory: string) => {
    setSearchContext('category_click');
    setSearchQuery(subcategory);
    setHasSearched(false); // Reset search state
    setSearchResults([]); // Clear previous results
    setSearchError(null); // Clear any errors
    setShowLocalNews(false); // Reset local news display
    setLocalNews([]); // Clear previous local news
    setTimeout(() => {
      handleSearch();
    }, 100);
  };

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryName]: !prev[categoryName]
    }));
  };

  const getViewpointBadge = (viewpoint?: string) => {
    const badges = {
      supportive: { color: 'bg-green-100 text-green-800', label: 'Supportive' },
      critical: { color: 'bg-red-100 text-red-800', label: 'Critical' },
      alternative: { color: 'bg-purple-100 text-purple-800', label: 'Alternative View' },
      neutral: { color: 'bg-gray-100 text-gray-800', label: 'Neutral' },
    };

    if (!viewpoint || !badges[viewpoint as keyof typeof badges]) return null;

    const badge = badges[viewpoint as keyof typeof badges];
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Interface */}
      <div className="space-y-4">
        <div className="flex space-x-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <div className="flex">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSearchContext('user_typed'); // Mark as user-typed when they type
                }}
                onKeyPress={handleKeyPress}
                className="w-full pl-10 pr-3 py-1.5 text-sm border-l border-t border-b border-gray-300 rounded-l-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                placeholder="Search Google for latest articles on any topic..."
              />
              <div className="border-t border-r border-b border-gray-300 rounded-r-lg px-2 flex items-center bg-gray-50">
                <APIFilterButton onFiltersChanged={handleAPIFiltersChanged} />
              </div>
            </div>
            {searchContext === 'user_typed' && searchQuery.trim() && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                <Globe className="h-3 w-3 text-blue-500" />
                <span className="text-xs text-blue-600 font-medium">Google</span>
              </div>
            )}
          </div>
          <button
            onClick={handleSearch}
            disabled={isSearching || !searchQuery.trim()}
            className="px-4 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            {isSearching ? (
              <>
                <Loader className="h-4 w-4 animate-spin" />
                <span>{isGoogleSearch ? 'Searching Google...' : 'Searching...'}</span>
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                <span>Search</span>
              </>
            )}
          </button>
          <button
            onClick={handleLocalNewsSearch}
            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            title="Search local news"
          >
            <MapPin className="h-4 w-4" />
            <span>Local</span>
          </button>
        </div>

        {/* Location Status */}
        {userLocation && (
          <div className="bg-green-50 border-green-200 border rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-green-600" />
              <div className="flex-1">
                <span className="text-sm font-medium text-green-800">
                  Location: {getLocationDisplayName(userLocation)}
                </span>
                <p className="text-xs mt-1 text-green-700">
                  Local news sources automatically included in search results
                </p>
              </div>
              <button
                onClick={() => setShowLocationPrompt(true)}
                className="text-xs underline text-green-600 hover:text-green-800"
              >
                Change
              </button>
            </div>
          </div>
        )}

        {/* Location Prompt Modal */}
        {showLocationPrompt && (
          <LocationPrompt
            onLocationUpdate={handleLocationUpdate}
            onClose={() => setShowLocationPrompt(false)}
          />
        )}

        {/* Trending Topics with Sports Subcategories */}
        {!hasSearched && trendingTopics.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium text-gray-700">Trending Topics</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {trendingTopics.map((topic) => (
                <button
                  key={topic}
                  onClick={() => handleTrendingTopicClick(topic)}
                  className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm hover:bg-orange-200 transition-colors"
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Category Browser */}
        {!hasSearched && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium text-gray-700">Browse by Category</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {allCategories.map((category) => (
                <div key={category.name} className="relative">
                  <button
                    onClick={() => toggleCategory(category.name)}
                    className={`px-3 py-1 ${category.color} rounded-full text-sm hover:opacity-80 transition-all flex items-center space-x-1`}
                  >
                    <span>{category.name}</span>
                    {expandedCategories[category.name] ? (
                      <ChevronDown className="h-3 w-3" />
                    ) : (
                      <ChevronRight className="h-3 w-3" />
                    )}
                  </button>
                  
                  {expandedCategories[category.name] && (
                    <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-10 min-w-72 max-w-80">
                      <div className="text-xs font-medium text-gray-600 mb-2">{category.name} Categories</div>
                      <div className="grid grid-cols-1 gap-1 max-h-64 overflow-y-auto">
                        {category.subcategories.map((subcategory) => (
                          <button
                            key={subcategory.name}
                            onClick={() => handleSubcategoryClick(subcategory.query)}
                            className="text-left px-2 py-1 text-sm text-gray-700 hover:bg-gray-50 rounded transition-colors"
                          >
                            <div className="font-medium">{subcategory.name}</div>
                            <div className="text-xs text-gray-500">{subcategory.description}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Suggested Queries */}
        {!hasSearched && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Lightbulb className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium text-gray-700">Suggested Searches</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {suggestedQueries.slice(0, 6).map((query) => (
                <button
                  key={query}
                  onClick={() => handleSuggestedQueryClick(query)}
                  className="text-left px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm hover:bg-blue-100 transition-colors border border-blue-200"
                >
                  "{query}"
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Search Results */}
      {hasSearched && (
        <div className="space-y-8">
          {/* Search Results Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              {isGoogleSearch ? 'Google' : 'Search'} Results for "{searchQuery}" ({searchResults.length} articles found)
            </h3>
            {isGoogleSearch && (
              <div className="flex items-center space-x-2 text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                <Globe className="h-4 w-4" />
                <span>Live Google Search Results</span>
                <span className="text-xs bg-blue-100 px-2 py-0.5 rounded-full">
                  {searchResults.length} results from enabled APIs
                </span>
              </div>
            )}
            <button
              onClick={() => {
                setHasSearched(false);
                setSearchResults([]);
                setSearchQuery('');
                setSearchError(null);
                setIsGoogleSearch(false);
                setSearchContext('user_typed');
              }}
              className="text-sm text-gray-600 hover:text-gray-800 transition-colors hover:bg-gray-100 px-3 py-1 rounded-lg"
            >
              ← Back to Browse
            </button>
          </div>

          {/* Error Message */}
          {searchError && (
            <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-xl p-4 shadow-sm">
              <p className="text-red-800">{searchError}</p>
            </div>
          )}

          {/* ChatGPT Analysis */}
          {isChatGptLoading && (
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-4 mb-6 shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="bg-purple-100 p-2 rounded-xl">
                  <Loader className="h-5 w-5 text-purple-600 animate-spin" />
                </div>
                <div>
                  <h4 className="font-medium text-purple-900">AI Analysis in Progress</h4>
                  <p className="text-sm text-purple-800">
                    ChatGPT is analyzing search results to provide insights...
                  </p>
                </div>
              </div>
            </div>
          )}

          {!isChatGptLoading && chatGptAnalysis && (
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-4 mb-6 shadow-sm">
              <div className="flex items-center space-x-3 mb-3">
                <div className="bg-purple-100 p-2 rounded-xl">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-medium text-purple-900">AI-Enhanced Search Analysis</h4>
                  <p className="text-sm text-purple-800">
                    ChatGPT has analyzed the search results to provide key insights
                  </p>
                </div>
              </div>
              <div className="prose prose-sm max-w-none text-purple-800">
                <p className="whitespace-pre-wrap">{chatGptAnalysis}</p>
              </div>
            </div>
          )}

          {/* Search Results List */}
          {searchResults.length > 0 && (
            <>
              {/* Google Search Indicator */}
              {isGoogleSearch && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 mb-6 shadow-sm">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 p-2 rounded-xl">
                      <div className="flex items-center space-x-2">
                        <Globe className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-blue-900">Live Google Search Results</h4>
                      <p className="text-sm text-blue-800">
                        These are real, current articles from major news sources found via Google search.
                        Results are updated in real-time and include the latest coverage.
                      </p>
                      <div className="mt-2 flex items-center space-x-2">
                        <APIFilterButton onFiltersChanged={handleAPIFiltersChanged} />
                        <span className="text-xs text-blue-600">
                          Customize which sources appear in your results
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
            <div className="space-y-6">
              {searchResults.map((result) => {
                // Classify breaking news based on engagement
                const breakingClassification = classifyBreakingNews(result);
                const breakingBadge = getBreakingNewsBadge(breakingClassification);
                const trendingStatus = getTrendingStatus(breakingClassification.engagementMetrics);
                
                return (
                  <div
                    key={result.id}
                    className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all transform hover:-translate-y-1"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                          {isGoogleSearch && (
                            <span className="inline-flex items-center space-x-1 mr-2">
                              <Globe className="h-3 w-3 text-blue-500" />
                            </span>
                          )}
                          {result.title}
                        </h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                          <span className="font-medium">{result.source}</span>
                          {result.author && (
                            <div className="flex items-center space-x-1">
                              <User className="h-3 w-3" />
                              <span>{result.author}</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{new Date(result.publishedAt).toLocaleDateString()}</span>
                          </div>
                          {getViewpointBadge(result.viewpoint)}
                          
                          {/* Engagement Metrics Display */}
                          <div className="flex items-center space-x-3 text-xs text-gray-500 mt-2">
                            <div className="flex items-center space-x-1">
                              <Eye className="h-3 w-3" />
                              <span>{formatEngagementNumber(breakingClassification.engagementMetrics.views)} views</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <span>💬</span>
                              <span>{formatEngagementNumber(breakingClassification.engagementMetrics.comments)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <span>🔄</span>
                              <span>{formatEngagementNumber(breakingClassification.engagementMetrics.shares)}</span>
                            </div>
                            <div className="text-blue-600 font-medium">
                              {formatEngagementNumber(breakingClassification.engagementMetrics.totalEngagement)} total engagement
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-700 text-sm mb-3 line-clamp-3">
                          {result.description || result.content.substring(0, 200) + '...'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleAddArticle(result)}
                          className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-2 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 ${
                            isArticleAdded(result.id)
                              ? 'bg-gradient-to-r from-gray-500 to-gray-600 text-white hover:from-gray-600 hover:to-gray-700'
                              : 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800'
                          }`}
                        >
                          <Plus className="h-4 w-4" />
                          <span>{isArticleAdded(result.id) ? 'Unadd' : 'Add to Sources'}</span>
                        </button>
                        {result.url && result.url !== '#' && (
                          <a
                            href={result.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 transition-colors flex items-center space-x-1 px-3 py-2 hover:bg-blue-50 rounded-lg"
                          >
                            <ExternalLink className="h-4 w-4" />
                            <span>View Original</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            </>
          )}

          {/* Related Viewpoints */}
          {selectedArticleId && (
            <div className="space-y-6">
              <div className="flex items-center space-x-2">
                <Eye className="h-5 w-5 text-purple-600" />
                <h4 className="font-semibold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">Related Perspectives</h4>
                {isLoadingSuggestions && (
                  <>
                    {isSearchEnhanced && (
                      <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                        AI-Enhanced
                      </span>
                    )}
                    <Loader className="h-4 w-4 animate-spin text-purple-600" />
                  </>
                )}
              </div>
              
              {suggestedViewpoints.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {suggestedViewpoints.map((viewpoint) => (
                    <div
                      key={viewpoint.id}
                      className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-4 hover:shadow-md transition-all"
                    >
                      <h5 className="font-medium text-purple-900 mb-2 line-clamp-2">
                        {viewpoint.title}
                      </h5>
                      <p className="text-purple-800 text-sm mb-3 line-clamp-2">
                        {viewpoint.description}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-purple-600">{viewpoint.source}</span>
                        <button
                          onClick={() => handleAddArticle(viewpoint)}
                          className={`px-3 py-1.5 rounded-lg text-sm transition-all flex items-center space-x-1 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 ${
                            isArticleAdded(viewpoint.id)
                              ? 'bg-gradient-to-r from-gray-500 to-gray-600 text-white hover:from-gray-600 hover:to-gray-700'
                              : 'bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800'
                          }`}
                        >
                          <Plus className="h-3 w-3" />
                          <span>{isArticleAdded(viewpoint.id) ? 'Unadd' : 'Add'}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Local News Results */}
          {localNews.length > 0 && showLocalNews && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                <h4 className="font-semibold text-gray-900">Local News Results</h4>
                <span className="text-sm text-gray-600">({localNews.length} articles)</span>
              </div>
              
              <div className="space-y-3">
                {localNews.map((localResult) => {
                  // Classify breaking news based on engagement
                  const breakingClassification = classifyBreakingNews(localResult);
                  const breakingBadge = getBreakingNewsBadge(breakingClassification);
                  const trendingStatus = getTrendingStatus(breakingClassification.engagementMetrics);
                  
                  return (
                    <div
                      key={localResult.id}
                      className="bg-blue-50 border border-blue-200 rounded-lg p-4"
                    >
                      <h5 className="font-medium text-blue-900 mb-2">
                        {localResult.title}
                        {/* Breaking News and Trending Badges */}
                        <div className="flex items-center space-x-2 mb-2">
                          {breakingBadge.show && (
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${breakingBadge.className} flex items-center space-x-1`}>
                              <span>{breakingBadge.icon}</span>
                              <span>{breakingBadge.text}</span>
                            </span>
                          )}
                          {trendingStatus.isTrending && (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${
                              trendingStatus.trendingLevel === 'hot' 
                                ? 'bg-red-100 text-red-800' 
                                : 'bg-orange-100 text-orange-800'
                            }`}>
                              <span>📈</span>
                              <span>{trendingStatus.trendingLevel.toUpperCase()}</span>
                            </span>
                          )}
                        </div>
                      </h5>
                      <p className="text-blue-800 text-sm mb-3">
                        {localResult.description}
                      </p>
                      <div className="flex justify-between items-center">
                        {/* Breaking News Details */}
                        {breakingClassification.isBreaking && (
                          <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-xs text-red-800">
                              <strong>Breaking News:</strong> {breakingClassification.breakingReason}
                            </p>
                            {breakingClassification.timeToBreaking && (
                              <p className="text-xs text-red-600 mt-1">Reached breaking status in ~{breakingClassification.timeToBreaking} minutes</p>
                            )}
                          </div>
                        )}
                        <span className="text-xs text-blue-600">{localResult.source}</span>
                        <button
                          onClick={() => handleAddArticle(localResult)}
                          className={`px-3 py-1 rounded text-sm transition-colors flex items-center space-x-1 ${
                            isArticleAdded(localResult.id)
                              ? 'bg-gray-500 text-white hover:bg-gray-600'
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                        >
                          <Plus className="h-3 w-3" />
                          <span>{isArticleAdded(localResult.id) ? 'Unadd' : 'Add'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Comprehensive API Sources Showcase */}
      {!hasSearched && (
        <div className="space-y-6">
          {/* Google Search Feature Highlight */}
          <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 border border-blue-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Globe className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Real-Time Google Search Integration</h3>
                <p className="text-sm text-gray-600">Get the latest articles from major news sources worldwide</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 border border-blue-100">
                <div className="flex items-center space-x-2 mb-2">
                  <Search className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-gray-900">Live Search</span>
                </div>
                <p className="text-sm text-gray-600">
                  Type any query to search Google for the most current articles from trusted news sources
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-green-100">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-gray-900">Real-Time Results</span>
                </div>
                <p className="text-sm text-gray-600">
                  Get articles published within the last 7 days from major news outlets worldwide
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-purple-100">
                <div className="flex items-center space-x-2 mb-2">
                  <Sparkles className="h-4 w-4 text-purple-600" />
                  <span className="font-medium text-gray-900">Smart Fallback</span>
                  <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                    ChatGPT Powered
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  ChatGPT analyzes search results from Google and our curated content
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
              <Search className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-semibold text-gray-900">100+ Comprehensive API Sources</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* News & Media APIs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>News & Media (25+ APIs)</span>
              </h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-red-300 rounded-full"></span>
                  <span>NewsAPI, Guardian, Reuters, BBC</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-red-300 rounded-full"></span>
                  <span>CNN, Fox News, MSNBC, NPR</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-red-300 rounded-full"></span>
                  <span>Associated Press, Wall Street Journal</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-red-300 rounded-full"></span>
                  <span>New York Times, Washington Post</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-red-300 rounded-full"></span>
                  <span>Politico, The Hill, USA Today</span>
                </div>
              </div>
            </div>

            {/* Technology APIs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>Technology (20+ APIs)</span>
              </h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-blue-300 rounded-full"></span>
                  <span>GitHub, Stack Overflow, Hacker News</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-blue-300 rounded-full"></span>
                  <span>TechCrunch, Wired, Product Hunt</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-blue-300 rounded-full"></span>
                  <span>arXiv, MIT News, Stanford HAI</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-blue-300 rounded-full"></span>
                  <span>OpenAI Blog, DeepMind, Google AI</span>
                </div>
              </div>
            </div>

            {/* Academic & Research APIs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Academic & Research (15+ APIs)</span>
              </h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-300 rounded-full"></span>
                  <span>PubMed, JSTOR, Google Scholar</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-300 rounded-full"></span>
                  <span>CrossRef, ResearchGate, arXiv</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-300 rounded-full"></span>
                  <span>University Sources, Academic Journals</span>
                </div>
              </div>
            </div>

            {/* Business & Finance APIs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span>Business & Finance (12+ APIs)</span>
              </h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-yellow-300 rounded-full"></span>
                  <span>Alpha Vantage, Yahoo Finance</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-yellow-300 rounded-full"></span>
                  <span>Harvard Business Review, Forbes</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-yellow-300 rounded-full"></span>
                  <span>CoinDesk, Cointelegraph</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-yellow-300 rounded-full"></span>
                  <span>AngelList, Crunchbase, PitchBook</span>
                </div>
              </div>
            </div>

            {/* Social & Community APIs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span>Social & Community (10+ APIs)</span>
              </h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-purple-300 rounded-full"></span>
                  <span>Reddit, Twitter/X, Discord</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-purple-300 rounded-full"></span>
                  <span>LinkedIn, Medium, Substack</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-purple-300 rounded-full"></span>
                  <span>Quora, Patreon, Twitch</span>
                </div>
              </div>
            </div>

            {/* Sports APIs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span>Sports (8+ APIs)</span>
              </h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-orange-300 rounded-full"></span>
                  <span>TheSportsDB, ESPN, Bleacher Report</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-orange-300 rounded-full"></span>
                  <span>Fabrizio Romano, NBA Stats</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-orange-300 rounded-full"></span>
                  <span>Football-Data.org, OpenLigaDB</span>
                </div>
              </div>
            </div>

            {/* Entertainment & Lifestyle APIs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                <span>Entertainment & Lifestyle (10+ APIs)</span>
              </h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-pink-300 rounded-full"></span>
                  <span>YouTube, TED Talks, IGN</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-pink-300 rounded-full"></span>
                  <span>Food Network, Yelp, TripAdvisor</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-pink-300 rounded-full"></span>
                  <span>Steam, DeviantArt, Behance</span>
                </div>
              </div>
            </div>

            {/* Professional & Career APIs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                <span>Professional & Career (8+ APIs)</span>
              </h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-indigo-300 rounded-full"></span>
                  <span>Glassdoor, Indeed, ZipRecruiter</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-indigo-300 rounded-full"></span>
                  <span>Coursera, Khan Academy</span>
                </div>
              </div>
            </div>

            {/* Government & Legal APIs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                <span>Government & Legal (8+ APIs)</span>
              </h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-gray-300 rounded-full"></span>
                  <span>Data.gov, Congress.gov, SEC</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-gray-300 rounded-full"></span>
                  <span>Justia, FindLaw, Westlaw</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-gray-300 rounded-full"></span>
                  <span>Snopes, PolitiFact</span>
                </div>
              </div>
            </div>
          </div>

          {/* API Statistics */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">100+</div>
                <div className="text-sm text-gray-600">Total APIs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">25+</div>
                <div className="text-sm text-gray-600">News Sources</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">AI</div>
                <div className="text-sm text-gray-600">Enhanced Search</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">15+</div>
                <div className="text-sm text-gray-600">Academic Sources</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">50+</div>
                <div className="text-sm text-gray-600">Local News Sources</div>
              </div>
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-700">
                <strong>Comprehensive Coverage:</strong> Our AI searches across news, academic, social, business, 
                government, and specialized sources with ChatGPT analysis for balanced, multi-perspective article synthesis.
              </p>
            </div>
          </div>

          {/* Additional Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center space-x-3 mb-2">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Globe className="h-4 w-4 text-blue-600" />
                </div>
                <span className="font-medium text-gray-900">Google Integration</span>
              </div>
              <p className="text-sm text-gray-600">
                Live Google search provides the most current articles from trusted news sources
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center space-x-3 mb-2">
                <div className="bg-green-100 p-2 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
                <span className="font-medium text-gray-900">Balanced Perspectives</span>
              </div>
              <p className="text-sm text-gray-600">
                Multiple viewpoints ensure comprehensive, unbiased article synthesis
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center space-x-3 mb-2">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Search className="h-4 w-4 text-purple-600" />
                </div>
                  <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                    AI-Enhanced
                  </span>
                <span className="font-medium text-gray-900">Hybrid Search System</span>
              </div>
              <p className="text-sm text-gray-600">
                Google for user searches, curated content for trending topics and categories
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};