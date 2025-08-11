import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Bot, Shield, BarChart, Search, Zap, Target, Brain, Eye } from 'lucide-react';

interface MistralSettings {
  sourceDeduplication: boolean;
  citationManagement: boolean;
  comparativeAnalysis: boolean;
  contentExtraction: boolean;
  plagiarismDetection: boolean;
  advancedProcessing: boolean;
}

interface MistralSettingsProps {
  isEnabled: boolean;
  onToggleEnabled: (enabled: boolean) => void;
  settings: MistralSettings;
  onSettingsChange: (settings: MistralSettings) => void;
}

const defaultMistralSettings: MistralSettings = {
  sourceDeduplication: true,
  citationManagement: true,
  comparativeAnalysis: true,
  contentExtraction: true,
  plagiarismDetection: false,
  advancedProcessing: true,
};

export default function MistralSettings({ 
  isEnabled, 
  onToggleEnabled, 
  settings, 
  onSettingsChange 
}: MistralSettingsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localSettings, setLocalSettings] = useState<MistralSettings>(settings || defaultMistralSettings);

  const handleToggleEnabled = () => {
    onToggleEnabled(!isEnabled);
  };

  const handleToggleSetting = (key: keyof MistralSettings) => {
    const newSettings = {
      ...localSettings,
      [key]: !localSettings[key]
    };
    setLocalSettings(newSettings);
    onSettingsChange(newSettings);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-xl ${isEnabled ? 'bg-orange-100' : 'bg-gray-100'}`}>
              <Bot className={`h-6 w-6 ${isEnabled ? 'text-orange-600' : 'text-gray-400'}`} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Mistral AI</h3>
              <p className="text-sm text-gray-600">Advanced content extraction and synthesis</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={handleToggleEnabled}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isEnabled ? 'bg-orange-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            
            {isEnabled && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </button>
            )}
          </div>
        </div>

        {isEnabled && !isExpanded && (
          <div className="mt-4 flex items-center space-x-4 text-xs text-gray-600">
            <div className="flex items-center space-x-1">
              <Shield className="h-3 w-3" />
              <span>Source Deduplication</span>
            </div>
            <div className="flex items-center space-x-1">
              <Target className="h-3 w-3" />
              <span>Citation Management</span>
            </div>
            <div className="flex items-center space-x-1">
              <Brain className="h-3 w-3" />
              <span>Comparative Analysis</span>
            </div>
          </div>
        )}

        {isEnabled && isExpanded && (
          <div className="mt-6 space-y-4 bg-gray-50 p-4 rounded-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Source Deduplication</span>
                </div>
                <button
                  onClick={() => handleToggleSetting('sourceDeduplication')}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    localSettings.sourceDeduplication ? 'bg-orange-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                      localSettings.sourceDeduplication ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Target className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Citation Management</span>
                </div>
                <button
                  onClick={() => handleToggleSetting('citationManagement')}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    localSettings.citationManagement ? 'bg-orange-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                      localSettings.citationManagement ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Brain className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Comparative Analysis</span>
                </div>
                <button
                  onClick={() => handleToggleSetting('comparativeAnalysis')}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    localSettings.comparativeAnalysis ? 'bg-orange-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                      localSettings.comparativeAnalysis ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Eye className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Content Extraction</span>
                </div>
                <button
                  onClick={() => handleToggleSetting('contentExtraction')}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    localSettings.contentExtraction ? 'bg-orange-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                      localSettings.contentExtraction ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Plagiarism Detection</span>
                </div>
                <button
                  onClick={() => handleToggleSetting('plagiarismDetection')}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    localSettings.plagiarismDetection ? 'bg-orange-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                      localSettings.plagiarismDetection ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Zap className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Advanced Processing</span>
                </div>
                <button
                  onClick={() => handleToggleSetting('advancedProcessing')}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    localSettings.advancedProcessing ? 'bg-orange-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                      localSettings.advancedProcessing ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-600 leading-relaxed">
                <strong>Mistral AI</strong> specializes in advanced content processing with intelligent source deduplication, 
                multi-URL content extraction, comparative analysis synthesis, and plagiarism detection. 
                Perfect for complex research articles requiring deep content analysis.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export type { MistralSettings };
export { defaultMistralSettings };