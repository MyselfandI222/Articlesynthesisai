import React, { useState } from 'react';
import { Image, Wand2, Download, RefreshCw, Palette, Monitor, Square, Smartphone } from 'lucide-react';
import { AIImage, SynthesizedArticle } from '../types';
import { 
  generateAIImage, 
  generateAIArticleImage,
  generateImagePrompt, 
  getSuggestedImageStyles,
  imageStyleOptions,
  aspectRatioOptions,
  moodOptions,
  ImageGenerationOptions 
} from '../utils/imageGeneration';

interface ImageGeneratorProps {
  article: SynthesizedArticle;
  onImageGenerated: (image: AIImage) => void;
}

export const ImageGenerator: React.FC<ImageGeneratorProps> = ({ article, onImageGenerated }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [options, setOptions] = useState<ImageGenerationOptions>({
    style: 'realistic',
    aspectRatio: '16:9',
    mood: 'professional'
  });
  const [showAdvanced, setShowAdvanced] = useState(false);

  const suggestedStyles = getSuggestedImageStyles(article);

  const handleGenerateImage = async (useCustomPrompt = false) => {
    setIsGenerating(true);
    
    try {
      // Try new AI backend generation first (DALL-E 3)
      const aiImageUrl = await generateAIArticleImage(
        article.title,
        article.content,
        options.style
      );
      
      if (aiImageUrl) {
        // AI generation successful - create AIImage object
        const image: AIImage = {
          id: `ai-${Date.now()}`,
          url: aiImageUrl,
          prompt: `AI-generated image for: ${article.title}`,
          style: options.style,
          createdAt: new Date(),
          isGenerating: false
        };
        onImageGenerated(image);
        return;
      }
      
      // Fallback to original method if AI generation fails
      const prompt = generateImagePrompt(
        article, 
        options, 
        useCustomPrompt && customPrompt.trim() ? customPrompt : undefined
      );
      
      const image = await generateAIImage(prompt, options);
      onImageGenerated(image);
    } catch (error) {
      console.error('Failed to generate image:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUseSuggestion = (suggestion: ImageGenerationOptions) => {
    setOptions(suggestion);
  };

  const getAspectRatioIcon = (ratio: string) => {
    switch (ratio) {
      case '16:9': return <Monitor className="h-4 w-4" />;
      case '4:3': return <Monitor className="h-4 w-4" />;
      case '1:1': return <Square className="h-4 w-4" />;
      case '3:4': return <Smartphone className="h-4 w-4" />;
      default: return <Monitor className="h-4 w-4" />;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-purple-100 p-2 rounded-lg">
          <Image className="h-5 w-5 text-purple-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">AI Image Generator</h3>
          <p className="text-sm text-gray-600">Create custom images for your article</p>
        </div>
      </div>

      {/* Suggested Styles */}
      {suggestedStyles.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Recommended Styles</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {suggestedStyles.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleUseSuggestion(suggestion)}
                className="p-3 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors text-left"
              >
                <div className="flex items-center space-x-2 mb-1">
                  <Palette className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium capitalize">{suggestion.style}</span>
                </div>
                <div className="text-xs text-gray-600">
                  {suggestion.aspectRatio} • {suggestion.mood}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Custom Prompt */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Additional Instructions (Optional)
        </label>
        <textarea
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
          placeholder="Add specific instructions like 'include a sunset background', 'make it more colorful', 'add people in business attire', etc. Leave blank for automatic generation based on your article content..."
        />
        <p className="text-xs text-gray-500 mt-1">
          The AI will analyze your article content and create an appropriate image. Add instructions here to customize the result.
        </p>
      </div>

      {/* Basic Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Style</label>
          <select
            value={options.style}
            onChange={(e) => setOptions({ ...options, style: e.target.value as any })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {imageStyleOptions.map((style) => (
              <option key={style.value} value={style.value}>
                {style.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Aspect Ratio</label>
          <select
            value={options.aspectRatio}
            onChange={(e) => setOptions({ ...options, aspectRatio: e.target.value as any })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {aspectRatioOptions.map((ratio) => (
              <option key={ratio.value} value={ratio.value}>
                {ratio.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Mood</label>
          <select
            value={options.mood}
            onChange={(e) => setOptions({ ...options, mood: e.target.value as any })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {moodOptions.map((mood) => (
              <option key={mood.value} value={mood.value}>
                {mood.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Advanced Options Toggle */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="text-sm text-purple-600 hover:text-purple-800 mb-4"
      >
        {showAdvanced ? 'Hide' : 'Show'} Advanced Options
      </button>

      {/* Advanced Options */}
      {showAdvanced && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Advanced Options</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Style Details</label>
              <p className="text-xs text-gray-600">
                {imageStyleOptions.find(s => s.value === options.style)?.description}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mood Details</label>
              <p className="text-xs text-gray-600">
                {moodOptions.find(m => m.value === options.mood)?.description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Generate Button */}
      <div className="flex space-x-3">
        <button
          onClick={() => handleGenerateImage(false)}
          disabled={isGenerating}
          className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="h-5 w-5 animate-spin" />
              <span>Generating Image...</span>
            </>
          ) : (
            <>
              <Wand2 className="h-5 w-5" />
              <span>Generate AI Image</span>
            </>
          )}
        </button>

        {customPrompt.trim() && (
          <button
            onClick={() => handleGenerateImage(true)}
            disabled={isGenerating}
            className="px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            <Wand2 className="h-4 w-4" />
            <span>Use Custom</span>
          </button>
        )}
      </div>

      {/* Info */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-800">
          <strong>Smart Image Generation:</strong> The AI analyzes your article's content, topic, industry, and sentiment to create 
          perfectly themed images. It identifies key concepts, suggests appropriate visual elements, and generates images that 
          complement your content. Generated images can be used as article backgrounds for an immersive reading experience.
        </p>
      </div>
    </div>
  );
};