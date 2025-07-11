import React, { useState } from 'react';
import { Settings, Sparkles, Zap, Shield, Search, BarChart, RefreshCw, Check } from 'lucide-react';

interface ChatGPTSettingsProps {
  isEnabled: boolean;
  onToggleEnabled: (enabled: boolean) => void;
  settings: ChatGPTSettings;
  onSettingsChange: (settings: ChatGPTSettings) => void;
}

export interface ChatGPTSettings {
  includeSourceAttribution: boolean;
  enhanceWithFactChecking: boolean;
  optimizeForSEO: boolean;
  generateSummary: boolean;
  useAdvancedModel: boolean;
}

export const ChatGPTSettings: React.FC<ChatGPTSettingsProps> = ({
  isEnabled,
  onToggleEnabled,
  settings,
  onSettingsChange
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [localSettings, setLocalSettings] = useState<ChatGPTSettings>(settings);

  const handleToggleSetting = (setting: keyof ChatGPTSettings) => {
    setLocalSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleSaveSettings = () => {
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      onSettingsChange(localSettings);
      setIsSaving(false);
      setIsExpanded(false);
    }, 800);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-green-100 to-blue-100 p-2 rounded-xl">
            <Sparkles className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              ChatGPT Enhancement
            </h3>
            <p className="text-sm text-gray-600">
              Advanced AI synthesis with fact-checking and SEO optimization
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-700">{isEnabled ? 'Enabled' : 'Disabled'}</span>
          <button
            onClick={() => onToggleEnabled(!isEnabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              isEnabled ? 'bg-green-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {isEnabled && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Advanced Settings</span>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-sm text-green-600 hover:text-green-700 font-medium"
            >
              {isExpanded ? 'Hide' : 'Show'} Settings
            </button>
          </div>

          {isExpanded && (
            <div className="space-y-4 bg-gray-50 p-4 rounded-xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Source Attribution</span>
                  </div>
                  <button
                    onClick={() => handleToggleSetting('includeSourceAttribution')}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                      localSettings.includeSourceAttribution ? 'bg-green-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                        localSettings.includeSourceAttribution ? 'translate-x-5' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <BarChart className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Fact Checking</span>
                  </div>
                  <button
                    onClick={() => handleToggleSetting('enhanceWithFactChecking')}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                      localSettings.enhanceWithFactChecking ? 'bg-green-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                        localSettings.enhanceWithFactChecking ? 'translate-x-5' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Search className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">SEO Optimization</span>
                  </div>
                  <button
                    onClick={() => handleToggleSetting('optimizeForSEO')}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                      localSettings.optimizeForSEO ? 'bg-green-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                        localSettings.optimizeForSEO ? 'translate-x-5' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <RefreshCw className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Generate Summary</span>
                  </div>
                  <button
                    onClick={() => handleToggleSetting('generateSummary')}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                      localSettings.generateSummary ? 'bg-green-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                        localSettings.generateSummary ? 'translate-x-5' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  <Zap className="h-4 w-4 text-gray-500" />
                  <div>
                    <span className="text-sm font-medium text-gray-700">Advanced Model</span>
                    <p className="text-xs text-gray-500">Use GPT-4 for enhanced quality</p>
                  </div>
                </div>
                <button
                  onClick={() => handleToggleSetting('useAdvancedModel')}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    localSettings.useAdvancedModel ? 'bg-green-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                      localSettings.useAdvancedModel ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <button
                  onClick={() => setIsExpanded(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveSettings}
                  disabled={isSaving}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      <span>Save Settings</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};