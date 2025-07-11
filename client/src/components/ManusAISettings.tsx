import React, { useState } from 'react';
import { Settings, Sparkles, Zap, Shield, Search, BarChart, RefreshCw, Check } from 'lucide-react';

interface ManusAISettingsProps {
  isEnabled: boolean;
  onToggleEnabled: (enabled: boolean) => void;
  settings: ManusAISettings;
  onSettingsChange: (settings: ManusAISettings) => void;
}

export interface ManusAISettings {
  includeSourceAttribution: boolean;
  enhanceWithFactChecking: boolean;
  optimizeForSEO: boolean;
  generateSummary: boolean;
  useAdvancedModel: boolean;
}

export const ManusAISettings: React.FC<ManusAISettingsProps> = ({
  isEnabled,
  onToggleEnabled,
  settings,
  onSettingsChange
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [localSettings, setLocalSettings] = useState<ManusAISettings>(settings);

  const handleToggleSetting = (setting: keyof ManusAISettings) => {
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
          <div className="bg-gradient-to-r from-purple-100 to-indigo-100 p-2 rounded-xl">
            <Sparkles className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Manus AI Enhancement
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
              isEnabled ? 'bg-purple-600' : 'bg-gray-300'
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
        <>
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 mb-4">
            <div className="flex items-start space-x-3">
              <div className="bg-purple-100 p-2 rounded-lg mt-1">
                <Zap className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <h4 className="font-medium text-purple-900 mb-1">Enhanced Synthesis Active</h4>
                <p className="text-sm text-purple-800">
                  Manus AI is enhancing your article synthesis with advanced NLP, fact-checking, and SEO optimization.
                </p>
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="mt-2 text-xs font-medium text-purple-700 hover:text-purple-900 flex items-center space-x-1"
                >
                  <Settings className="h-3 w-3" />
                  <span>{isExpanded ? 'Hide Settings' : 'Configure Settings'}</span>
                </button>
              </div>
            </div>
          </div>

          {isExpanded && (
            <div className="space-y-4 mb-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
              <h4 className="font-medium text-gray-900 mb-3">Manus AI Configuration</h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-blue-600" />
                    <div>
                      <span className="text-sm font-medium text-gray-800">Fact Checking</span>
                      <p className="text-xs text-gray-600">Verify facts against trusted sources</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleSetting('enhanceWithFactChecking')}
                    className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${
                      localSettings.enhanceWithFactChecking ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                        localSettings.enhanceWithFactChecking ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Search className="h-4 w-4 text-green-600" />
                    <div>
                      <span className="text-sm font-medium text-gray-800">SEO Optimization</span>
                      <p className="text-xs text-gray-600">Optimize content for search engines</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleSetting('optimizeForSEO')}
                    className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${
                      localSettings.optimizeForSEO ? 'bg-green-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                        localSettings.optimizeForSEO ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <BarChart className="h-4 w-4 text-orange-600" />
                    <div>
                      <span className="text-sm font-medium text-gray-800">Source Attribution</span>
                      <p className="text-xs text-gray-600">Include references to source materials</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleSetting('includeSourceAttribution')}
                    className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${
                      localSettings.includeSourceAttribution ? 'bg-orange-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                        localSettings.includeSourceAttribution ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="h-4 w-4 text-purple-600" />
                    <div>
                      <span className="text-sm font-medium text-gray-800">Advanced AI Model</span>
                      <p className="text-xs text-gray-600">Use Manus-GPT-4-Turbo (higher quality)</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleSetting('useAdvancedModel')}
                    className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${
                      localSettings.useAdvancedModel ? 'bg-purple-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                        localSettings.useAdvancedModel ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-4 pt-3 border-t border-gray-200">
                <button
                  onClick={() => setIsExpanded(false)}
                  className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveSettings}
                  disabled={isSaving}
                  className="px-4 py-1.5 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-purple-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="h-3 w-3 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-3 w-3" />
                      <span>Save Settings</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {!isExpanded && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
              <div className={`p-3 rounded-lg ${localSettings.enhanceWithFactChecking ? 'bg-blue-50 text-blue-800' : 'bg-gray-50 text-gray-400'}`}>
                <Shield className={`h-5 w-5 mx-auto mb-1 ${localSettings.enhanceWithFactChecking ? 'text-blue-600' : 'text-gray-400'}`} />
                <p className="text-xs font-medium">Fact Checking</p>
              </div>
              <div className={`p-3 rounded-lg ${localSettings.optimizeForSEO ? 'bg-green-50 text-green-800' : 'bg-gray-50 text-gray-400'}`}>
                <Search className={`h-5 w-5 mx-auto mb-1 ${localSettings.optimizeForSEO ? 'text-green-600' : 'text-gray-400'}`} />
                <p className="text-xs font-medium">SEO Optimization</p>
              </div>
              <div className={`p-3 rounded-lg ${localSettings.includeSourceAttribution ? 'bg-orange-50 text-orange-800' : 'bg-gray-50 text-gray-400'}`}>
                <BarChart className={`h-5 w-5 mx-auto mb-1 ${localSettings.includeSourceAttribution ? 'text-orange-600' : 'text-gray-400'}`} />
                <p className="text-xs font-medium">Source Attribution</p>
              </div>
              <div className={`p-3 rounded-lg ${localSettings.useAdvancedModel ? 'bg-purple-50 text-purple-800' : 'bg-gray-50 text-gray-400'}`}>
                <Sparkles className={`h-5 w-5 mx-auto mb-1 ${localSettings.useAdvancedModel ? 'text-purple-600' : 'text-gray-400'}`} />
                <p className="text-xs font-medium">Advanced AI Model</p>
              </div>
            </div>
          )}
        </>
      )}

      {!isEnabled && (
        <div className="bg-gray-50 rounded-xl p-4 text-center">
          <Zap className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600 mb-2">Manus AI enhancement is currently disabled</p>
          <p className="text-sm text-gray-500 mb-4">
            Enable to access advanced AI synthesis with fact-checking and SEO optimization
          </p>
          <button
            onClick={() => onToggleEnabled(true)}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-colors shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
          >
            Enable Manus AI
          </button>
        </div>
      )}
    </div>
  );
};