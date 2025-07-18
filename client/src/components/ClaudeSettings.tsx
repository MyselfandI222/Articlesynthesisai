import React, { useState } from 'react';
import { Brain, Settings, Zap, Sliders, HelpCircle } from 'lucide-react';
import { ClaudeServiceConfig } from '../utils/claudeService';

interface ClaudeSettingsProps {
  isEnabled: boolean;
  onToggleEnabled: (enabled: boolean) => void;
  settings: ClaudeServiceConfig;
  onSettingsChange: (settings: ClaudeServiceConfig) => void;
}

export const ClaudeSettings: React.FC<ClaudeSettingsProps> = ({
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
    const newSettings = {
      ...settings,
      settings: {
        ...settings.settings,
        [key]: value
      }
    };
    onSettingsChange(newSettings);
  };

  const modelOptions = [
    { value: 'claude-sonnet-4-20250514', label: 'Claude Sonnet 4 (Recommended)', description: 'Latest and most capable model' },
    { value: 'claude-3-7-sonnet-20250219', label: 'Claude 3.7 Sonnet', description: 'Previous generation model' },
    { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet', description: 'Legacy model' }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Brain className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Claude AI Settings</h3>
            <p className="text-sm text-gray-500">Configure Anthropic Claude for article synthesis</p>
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
            <div className={`w-11 h-6 rounded-full transition-colors ${isEnabled ? 'bg-purple-600' : 'bg-gray-200'}`}>
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
              Claude Model
            </label>
            <div className="space-y-2">
              {modelOptions.map((option) => (
                <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="claude-model"
                    value={option.value}
                    checked={settings.settings.model === option.value}
                    onChange={(e) => handleSettingChange('model', e.target.value)}
                    className="text-purple-600 focus:ring-purple-500"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{option.label}</div>
                    <div className="text-xs text-gray-500">{option.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Claude Benefits */}
          <div className="bg-purple-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-purple-900 mb-3 flex items-center">
              <Zap className="h-4 w-4 mr-2" />
              Why Choose Claude?
            </h4>
            <ul className="space-y-2 text-sm text-purple-800">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-purple-600 rounded-full mt-1.5 mr-2 flex-shrink-0" />
                Advanced reasoning and nuanced understanding
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-purple-600 rounded-full mt-1.5 mr-2 flex-shrink-0" />
                Excellent at maintaining context across long documents
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-purple-600 rounded-full mt-1.5 mr-2 flex-shrink-0" />
                Superior at following complex instructions
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-purple-600 rounded-full mt-1.5 mr-2 flex-shrink-0" />
                More accurate fact synthesis and analysis
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
                    Creativity Level: {settings.settings.temperature}
                    <HelpCircle className="inline h-4 w-4 ml-1 text-gray-400" title="Controls randomness in responses. Higher values are more creative, lower values are more focused." />
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={settings.settings.temperature}
                    onChange={(e) => handleSettingChange('temperature', parseFloat(e.target.value))}
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
                    Max Response Length: {settings.settings.maxTokens} tokens
                    <HelpCircle className="inline h-4 w-4 ml-1 text-gray-400" title="Maximum length of generated responses. Higher values allow for longer articles." />
                  </label>
                  <input
                    type="range"
                    min="1000"
                    max="8000"
                    step="500"
                    value={settings.settings.maxTokens}
                    onChange={(e) => handleSettingChange('maxTokens', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Short</span>
                    <span>Medium</span>
                    <span>Long</span>
                  </div>
                </div>

                {/* System Prompt */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    System Instructions
                    <HelpCircle className="inline h-4 w-4 ml-1 text-gray-400" title="Custom instructions to guide Claude's behavior and writing style." />
                  </label>
                  <textarea
                    value={settings.settings.systemPrompt || ''}
                    onChange={(e) => handleSettingChange('systemPrompt', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                    placeholder="You are an expert journalist and content creator..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Status Indicator */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isEnabled ? 'bg-green-500' : 'bg-gray-400'}`} />
              <span className="text-sm font-medium text-gray-700">
                Claude AI is {isEnabled ? 'enabled' : 'disabled'}
              </span>
            </div>
            <div className="text-xs text-gray-500">
              {isEnabled ? 'Ready for article synthesis' : 'Switch to enable'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClaudeSettings;