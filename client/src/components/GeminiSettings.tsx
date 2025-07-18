import React, { useState } from 'react';
import { Search, Settings, Zap, Sliders, HelpCircle, Globe } from 'lucide-react';
import { GeminiSearchConfig } from '../utils/geminiSearchService';

interface GeminiSettingsProps {
  isEnabled: boolean;
  onToggleEnabled: (enabled: boolean) => void;
  settings: GeminiSearchConfig;
  onSettingsChange: (settings: GeminiSearchConfig) => void;
}

export const GeminiSettings: React.FC<GeminiSettingsProps> = ({
  isEnabled,
  onToggleEnabled,
  settings,
  onSettingsChange,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleToggle = () => {
    onToggleEnabled(!isEnabled);
  };

  const handleSettingChange = (key: string, value: any) => {
    if (key.startsWith('settings.')) {
      const settingKey = key.replace('settings.', '');
      const newSettings = {
        ...settings,
        settings: {
          ...settings.settings,
          [settingKey]: value
        }
      };
      onSettingsChange(newSettings);
    } else {
      const newSettings = {
        ...settings,
        [key]: value
      };
      onSettingsChange(newSettings);
    }
  };

  const modelOptions = [
    { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash (Recommended)', description: 'Fastest and most efficient for search' },
    { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro', description: 'Enhanced reasoning and analysis' },
    { value: 'gemini-2.0-flash-preview', label: 'Gemini 2.0 Flash Preview', description: 'Latest experimental model' }
  ];

  const searchDepthOptions = [
    { value: 'basic', label: 'Basic', description: 'Quick overview of top results' },
    { value: 'comprehensive', label: 'Comprehensive', description: 'Detailed analysis with multiple sources' },
    { value: 'deep', label: 'Deep Research', description: 'In-depth investigation with expert analysis' }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Search className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Gemini Search Settings</h3>
            <p className="text-sm text-gray-500">Configure Google's Gemini AI for intelligent search</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title="Advanced Settings"
          >
            <Settings className="h-5 w-5" />
          </button>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isEnabled}
              onChange={handleToggle}
              className="sr-only"
            />
            <div className={`w-11 h-6 rounded-full transition-colors ${isEnabled ? 'bg-blue-600' : 'bg-gray-200'}`}>
              <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${isEnabled ? 'translate-x-6' : 'translate-x-1'} mt-1`} />
            </div>
          </label>
        </div>
      </div>

      {isEnabled && (
        <div className="space-y-6">
          {/* Model Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Gemini Model
            </label>
            <div className="space-y-2">
              {modelOptions.map((option) => (
                <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="gemini-model"
                    value={option.value}
                    checked={settings.model === option.value}
                    onChange={(e) => handleSettingChange('model', e.target.value)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{option.label}</div>
                    <div className="text-xs text-gray-500">{option.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Search Depth */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Search Depth
            </label>
            <div className="space-y-2">
              {searchDepthOptions.map((option) => (
                <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="search-depth"
                    value={option.value}
                    checked={settings.searchDepth === option.value}
                    onChange={(e) => handleSettingChange('searchDepth', e.target.value)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{option.label}</div>
                    <div className="text-xs text-gray-500">{option.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Max Results */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Results: {settings.maxResults}
              <HelpCircle className="inline h-4 w-4 ml-1 text-gray-400" title="Maximum number of search results to return" />
            </label>
            <input
              type="range"
              min="5"
              max="50"
              step="5"
              value={settings.maxResults}
              onChange={(e) => handleSettingChange('maxResults', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>5</span>
              <span>25</span>
              <span>50</span>
            </div>
          </div>

          {/* Search Options */}
          <div className="space-y-3">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.includeAnalysis}
                onChange={(e) => handleSettingChange('includeAnalysis', e.target.checked)}
                className="text-blue-600 focus:ring-blue-500"
              />
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">Include Analysis</div>
                <div className="text-xs text-gray-500">Add expert analysis and insights to search results</div>
              </div>
            </label>
            
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.filterRelevance}
                onChange={(e) => handleSettingChange('filterRelevance', e.target.checked)}
                className="text-blue-600 focus:ring-blue-500"
              />
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">Filter Relevance</div>
                <div className="text-xs text-gray-500">Only show highly relevant results</div>
              </div>
            </label>
          </div>

          {/* Gemini Benefits */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-3 flex items-center">
              <Zap className="h-4 w-4 mr-2" />
              Why Use Gemini Search?
            </h4>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-600 rounded-full mt-1.5 mr-2 flex-shrink-0" />
                Real-time search with Google's latest AI technology
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-600 rounded-full mt-1.5 mr-2 flex-shrink-0" />
                Intelligent relevance filtering and source credibility analysis
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-600 rounded-full mt-1.5 mr-2 flex-shrink-0" />
                Breaking news detection with trend analysis
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-600 rounded-full mt-1.5 mr-2 flex-shrink-0" />
                Multi-language support and global news coverage
              </li>
            </ul>
          </div>

          {/* Advanced Settings */}
          {showAdvanced && (
            <div className="border-t pt-6">
              <h4 className="text-sm font-medium text-gray-900 mb-4 flex items-center">
                <Sliders className="h-4 w-4 mr-2" />
                Advanced Configuration
              </h4>
              
              <div className="space-y-4">
                {/* Temperature */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search Creativity: {settings.settings.temperature}
                    <HelpCircle className="inline h-4 w-4 ml-1 text-gray-400" title="Controls how creative the search interpretation is. Lower values are more focused." />
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={settings.settings.temperature}
                    onChange={(e) => handleSettingChange('settings.temperature', parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Focused</span>
                    <span>Balanced</span>
                    <span>Creative</span>
                  </div>
                </div>

                {/* Max Tokens */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Response Length: {settings.settings.maxTokens} tokens
                    <HelpCircle className="inline h-4 w-4 ml-1 text-gray-400" title="Maximum length of search results and analysis." />
                  </label>
                  <input
                    type="range"
                    min="1000"
                    max="8000"
                    step="500"
                    value={settings.settings.maxTokens}
                    onChange={(e) => handleSettingChange('settings.maxTokens', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Short</span>
                    <span>Medium</span>
                    <span>Long</span>
                  </div>
                </div>

                {/* Top P */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Response Diversity: {settings.settings.topP}
                    <HelpCircle className="inline h-4 w-4 ml-1 text-gray-400" title="Controls the diversity of search results. Higher values include more varied sources." />
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.1"
                    value={settings.settings.topP}
                    onChange={(e) => handleSettingChange('settings.topP', parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Focused</span>
                    <span>Balanced</span>
                    <span>Diverse</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Status Indicator */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isEnabled ? 'bg-green-500' : 'bg-gray-400'}`} />
              <span className="text-sm font-medium text-gray-700">
                Gemini Search is {isEnabled ? 'enabled' : 'disabled'}
              </span>
            </div>
            <div className="text-xs text-gray-500 flex items-center">
              <Globe className="h-3 w-3 mr-1" />
              {isEnabled ? 'Global search ready' : 'Switch to enable'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GeminiSettings;