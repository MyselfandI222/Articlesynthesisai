import React, { useState, useEffect } from 'react';
import { X, Check, Search, Filter, Globe, Database, RefreshCw, CheckSquare, Square, ChevronDown, ChevronRight } from 'lucide-react';
import { 
  allAPISources, 
  getAPICategories, 
  getCategoryName, 
  getCategoryColorClass,
  getAPISourcesByCategory,
  getUserAPIPreferences,
  saveUserAPIPreferences,
  toggleCategoryAPIs,
  toggleAllAPIs,
  APICategory
} from '../utils/apiFilters';

interface APIFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFiltersChanged: () => void;
}

export const APIFilterModal: React.FC<APIFilterModalProps> = ({ isOpen, onClose, onFiltersChanged }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [apiPreferences, setApiPreferences] = useState<{ [key: string]: boolean }>({});
  const [expandedCategories, setExpandedCategories] = useState<{ [key: string]: boolean }>({});
  const [isLoading, setIsLoading] = useState(true);
  
  // Load user preferences
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      const preferences = getUserAPIPreferences();
      setApiPreferences(preferences);
      
      // Expand all categories by default
      const categories = getAPICategories();
      const expanded = categories.reduce((acc, category) => {
        acc[category.id] = true;
        return acc;
      }, {});
      setExpandedCategories(expanded);
      
      setIsLoading(false);
    }
  }, [isOpen]);
  
  // Toggle a single API
  const toggleAPI = (apiId: string) => {
    const newPreferences = {
      ...apiPreferences,
      [apiId]: !apiPreferences[apiId]
    };
    setApiPreferences(newPreferences);
  };
  
  // Toggle all APIs in a category
  const toggleCategory = (category: APICategory) => {
    const categoryAPIs = getAPISourcesByCategory(category);
    const categoryEnabled = categoryAPIs.every(api => apiPreferences[api.id] !== false);
    
    const newPreferences = { ...apiPreferences };
    categoryAPIs.forEach(api => {
      newPreferences[api.id] = !categoryEnabled;
    });
    
    setApiPreferences(newPreferences);
  };
  
  // Toggle expansion of a category
  const toggleCategoryExpansion = (category: APICategory) => {
    setExpandedCategories({
      ...expandedCategories,
      [category]: !expandedCategories[category]
    });
  };
  
  // Toggle all APIs
  const handleToggleAll = (enabled: boolean) => {
    const newPreferences = { ...apiPreferences };
    allAPISources.forEach(api => {
      newPreferences[api.id] = enabled;
    });
    setApiPreferences(newPreferences);
  };
  
  // Save changes and close
  const handleSave = () => {
    saveUserAPIPreferences(apiPreferences);
    onFiltersChanged();
    onClose();
  };
  
  // Reset to defaults (all enabled)
  const handleReset = () => {
    const defaultPreferences = {};
    allAPISources.forEach(api => {
      defaultPreferences[api.id] = true;
    });
    setApiPreferences(defaultPreferences);
  };
  
  // Filter APIs by search query
  const filteredCategories = getAPICategories().filter(category => {
    if (!searchQuery) return true;
    
    // Check if category name matches
    if (category.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return true;
    }
    
    // Check if any API in this category matches
    const categoryAPIs = getAPISourcesByCategory(category.id);
    return categoryAPIs.some(api => 
      api.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      api.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });
  
  // Count enabled APIs
  const enabledCount = Object.values(apiPreferences).filter(Boolean).length;
  const totalCount = allAPISources.length;
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-xl">
              <Filter className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">API Source Filters</h2>
              <p className="text-sm text-gray-600">Customize which data sources are used in your searches</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Search API sources..."
              />
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => handleToggleAll(true)}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <CheckSquare className="h-4 w-4" />
                <span>Enable All</span>
              </button>
              <button
                onClick={() => handleToggleAll(false)}
                className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
              >
                <Square className="h-4 w-4" />
                <span>Disable All</span>
              </button>
              <button
                onClick={handleReset}
                className="px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center space-x-2"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Reset</span>
              </button>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Globe className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-900">
                  {enabledCount} of {totalCount} API sources enabled
                </p>
                <p className="text-xs text-blue-700">
                  Customize which data sources are used when searching for articles
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <RefreshCw className="h-8 w-8 text-blue-600 animate-spin" />
            </div>
          ) : (
            <div className="space-y-6">
              {filteredCategories.map(category => {
                const categoryAPIs = getAPISourcesByCategory(category.id);
                const filteredAPIs = categoryAPIs.filter(api => 
                  !searchQuery || 
                  api.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  api.description.toLowerCase().includes(searchQuery.toLowerCase())
                );
                
                if (filteredAPIs.length === 0) return null;
                
                const allEnabled = filteredAPIs.every(api => apiPreferences[api.id] !== false);
                const someEnabled = filteredAPIs.some(api => apiPreferences[api.id] !== false);
                const isExpanded = expandedCategories[category.id];
                
                return (
                  <div key={category.id} className="border border-gray-200 rounded-xl overflow-hidden">
                    <div 
                      className="bg-gray-50 p-4 flex items-center justify-between cursor-pointer"
                      onClick={() => toggleCategoryExpansion(category.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleCategory(category.id);
                          }}
                          className={`p-2 rounded-lg transition-colors ${
                            allEnabled 
                              ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' 
                              : someEnabled
                              ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {allEnabled ? (
                            <CheckSquare className="h-5 w-5" />
                          ) : someEnabled ? (
                            <span className="flex items-center justify-center h-5 w-5 font-bold">±</span>
                          ) : (
                            <Square className="h-5 w-5" />
                          )}
                        </button>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-gray-900">{category.name}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColorClass(category.id)}`}>
                              {filteredAPIs.length} sources
                            </span>
                          </div>
                          <p className="text-xs text-gray-600">
                            {filteredAPIs.filter(api => apiPreferences[api.id] !== false).length} of {filteredAPIs.length} enabled
                          </p>
                        </div>
                      </div>
                      <div>
                        {isExpanded ? (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                    
                    {isExpanded && (
                      <div className="p-4 bg-white">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {filteredAPIs.map(api => (
                            <div 
                              key={api.id}
                              className={`p-3 border rounded-lg flex items-start space-x-3 transition-colors ${
                                apiPreferences[api.id] !== false
                                  ? 'border-blue-200 bg-blue-50'
                                  : 'border-gray-200 bg-gray-50'
                              }`}
                            >
                              <button
                                onClick={() => toggleAPI(api.id)}
                                className={`p-1.5 rounded-lg flex-shrink-0 transition-colors ${
                                  apiPreferences[api.id] !== false
                                    ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                }`}
                              >
                                {apiPreferences[api.id] !== false ? (
                                  <Check className="h-4 w-4" />
                                ) : (
                                  <X className="h-4 w-4" />
                                )}
                              </button>
                              <div>
                                <div className="flex items-center space-x-2">
                                  <h4 className="font-medium text-gray-900 text-sm">{api.name}</h4>
                                  {api.isPremium && (
                                    <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
                                      Premium
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-600 mt-1">{api.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              
              {filteredCategories.length === 0 && (
                <div className="text-center py-8">
                  <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Database className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600 mb-2">No API sources match your search</p>
                  <p className="text-sm text-gray-500">Try a different search term or clear your filter</p>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Filter className="h-4 w-4" />
            <span>Apply Filters</span>
          </button>
        </div>
      </div>
    </div>
  );
};