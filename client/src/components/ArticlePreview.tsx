import React, { useState } from 'react';
import { SynthesizedArticle, ChatMessage, AIImage } from '../types';
import { Eye, Edit, Share, Download, MessageSquare, Send, Image, Trash2, RefreshCw } from 'lucide-react';
import { ManusAIMetrics } from './ManusAIMetrics';
import { ImageGenerator } from './ImageGenerator';
import { editAIImage, ImageGenerationOptions } from '../utils/imageGeneration';
import { sendMessageToChatGPT, processArticleEdit } from '../utils/chatGptService';

interface ArticlePreviewProps {
  article: SynthesizedArticle;
  onEdit: (instructions: string) => void;
  onPublish: () => void;
}

export const ArticlePreview: React.FC<ArticlePreviewProps> = ({ article, onEdit, onPublish }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editInstructions, setEditInstructions] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [showImageGenerator, setShowImageGenerator] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<AIImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<AIImage | null>(null);
  const [isEditingImage, setIsEditingImage] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState<AIImage | null>(null);

  const handleSendMessage = () => {
    if (!currentMessage.trim()) return;

    // Create user message
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: currentMessage,
      timestamp: new Date(),
    };

    setChatMessages([...chatMessages, newMessage]);
    
    // Check if the message is about image editing
    if (selectedImage && (
      currentMessage.toLowerCase().includes('image') ||
      currentMessage.toLowerCase().includes('picture') ||
      currentMessage.toLowerCase().includes('photo') ||
      currentMessage.toLowerCase().includes('change') ||
      currentMessage.toLowerCase().includes('edit') ||
      currentMessage.toLowerCase().includes('modify')
    )) {
      handleImageEdit(currentMessage);
    } else {
      // Show loading state
      setIsEditing(true);
      
      // Process the edit with ChatGPT
      onEdit(currentMessage);
    }
    
    setCurrentMessage('');

    // Process the edit with ChatGPT and get response
    processArticleEdit(article, currentMessage, chatMessages)
      .then(responseContent => {
        const aiResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: responseContent,
          timestamp: new Date(),
        };
        setChatMessages(prev => [...prev, aiResponse]);
      })
      .catch(error => {
        console.error('Error getting AI response:', error);
        const errorResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "I'm sorry, I encountered an error processing your request. Please try again with different instructions.",
          timestamp: new Date(),
        };
        setChatMessages(prev => [...prev, errorResponse]);
      })
      .finally(() => {
        setIsEditing(false);
      });
  };

  const handleImageGenerated = (image: AIImage) => {
    setGeneratedImages([...generatedImages, image]);
    setShowImageGenerator(false);
  };

  const handleImageEdit = async (instructions: string) => {
    if (!selectedImage) return;

    setIsEditingImage(true);
    
    try {
      const editedImage = await editAIImage(selectedImage, instructions, {
        style: 'realistic',
        aspectRatio: '16:9',
        mood: 'professional'
      } as ImageGenerationOptions);
      
      // Replace the selected image with the edited version
      setGeneratedImages(images => 
        images.map(img => img.id === selectedImage.id ? editedImage : img)
      );
      setSelectedImage(editedImage);
      
      // Add AI response about image editing
      setTimeout(() => {
        const aiResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `I've updated the image based on your request: "${instructions}". The image has been regenerated with the new specifications.`,
          timestamp: new Date(),
        };
        setChatMessages(prev => [...prev, aiResponse]);
      }, 1000);
      
    } catch (error) {
      console.error('Failed to edit image:', error);
    } finally {
      setIsEditingImage(false);
    }
  };

  const handleDeleteImage = (imageId: string) => {
    setGeneratedImages(images => images.filter(img => img.id !== imageId));
    if (selectedImage?.id === imageId) {
      setSelectedImage(null);
    }
  };

  const downloadImage = async (image: AIImage) => {
    try {
      // Handle different image URL types
      let response;
      if (image.url.startsWith('data:')) {
        // Handle data URLs (canvas-generated images)
        const link = document.createElement('a');
        link.href = image.url;
        link.download = `article-image-${image.id}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      } else {
        // Handle regular URLs
        response = await fetch(image.url, { mode: 'cors' });
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `article-image-${image.id}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to download image:', error);
      // Fallback: open image in new tab
      window.open(image.url, '_blank');
    }
  };

  const downloadArticle = () => {
    const element = document.createElement('a');
    const file = new Blob([`# ${article.title}\n\n${article.content}`], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = `${article.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">{article.title}</h2>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>{article.wordCount} words</span>
              <span>Style: {article.style}</span>
              <span>{article.createdAt.toLocaleDateString()}</span>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
            >
              <Edit className="h-4 w-4" />
              <span>Edit</span>
            </button>
            <button
              onClick={() => setShowImageGenerator(!showImageGenerator)}
              className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors flex items-center space-x-2"
            >
              <Image className="h-4 w-4" />
              <span>AI Image</span>
            </button>
            <button
              onClick={downloadArticle}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Download</span>
            </button>
            <button
              onClick={onPublish}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <Share className="h-4 w-4" />
              <span>Publish</span>
            </button>
          </div>
        </div>

        {article.summary && (
          <div className="bg-blue-50 rounded-lg p-4 mb-4">
            <h3 className="font-medium text-blue-900 mb-2">Summary</h3>
            <p className="text-blue-800 text-sm">{article.summary}</p>
          </div>
        )}
      </div>

      {/* AI Image Generator */}
      {showImageGenerator && (
        <div className="border-t border-gray-200 p-6">
          <ImageGenerator
            article={article}
            onImageGenerated={handleImageGenerated}
          />
        </div>
      )}

      {/* Generated Images Gallery */}
      {generatedImages.length > 0 && (
        <div className="border-t border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
              <Image className="h-5 w-5 text-purple-600" />
              <span>Generated Images ({generatedImages.length})</span>
            </h3>
            <p className="text-xs text-gray-600">
              Click an image to select it for editing via chat
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {generatedImages.map((image) => (
              <div
                key={image.id}
                className={`relative group rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                  selectedImage?.id === image.id
                    ? 'border-purple-500 ring-2 ring-purple-200'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedImage(image)}
              >
                <img
                  src={image.url}
                  alt={image.prompt}
                  className="w-full h-48 object-cover"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadImage(image);
                      }}
                      className="p-2 bg-white rounded-full text-gray-700 hover:text-purple-600 transition-colors"
                      title="Download image"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setBackgroundImage(backgroundImage?.id === image.id ? null : image);
                      }}
                      className={`p-2 bg-white rounded-full transition-colors ${
                        backgroundImage?.id === image.id 
                          ? 'text-purple-600 bg-purple-100' 
                          : 'text-gray-700 hover:text-purple-600'
                      }`}
                      title={backgroundImage?.id === image.id ? "Remove as background" : "Use as article background"}
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteImage(image.id);
                      }}
                      className="p-2 bg-white rounded-full text-gray-700 hover:text-red-600 transition-colors"
                      title="Delete image"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                {/* Selection indicator */}
                {selectedImage?.id === image.id && (
                  <div className="absolute top-2 right-2 bg-purple-600 text-white p-1 rounded-full">
                    <Eye className="h-3 w-3" />
                  </div>
                )}
                
                {/* Image info */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3">
                  <p className="text-white text-xs truncate" title={image.prompt}>
                    {image.prompt}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-gray-300 capitalize">{image.style}</span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-300">{image.createdAt.toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {selectedImage && (
            <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Eye className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">Selected Image</span>
                {isEditingImage && (
                  <RefreshCw className="h-4 w-4 text-purple-600 animate-spin" />
                )}
              </div>
              <p className="text-xs text-purple-800 mb-2">
                <strong>Prompt:</strong> {selectedImage.prompt}
              </p>
              <p className="text-xs text-purple-700">
                Use the chat below to edit this image. Try commands like "make it more colorful", 
                "change the background to blue", or "add more detail".
              </p>
              <div className="mt-2 flex space-x-2">
                <button
                  onClick={() => setBackgroundImage(backgroundImage?.id === selectedImage.id ? null : selectedImage)}
                  className={`text-xs px-3 py-1 rounded-full transition-colors ${
                    backgroundImage?.id === selectedImage.id
                      ? 'bg-purple-600 text-white'
                      : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                  }`}
                >
                  {backgroundImage?.id === selectedImage.id ? 'Remove Background' : 'Use as Background'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex">
        <div 
          className={`${isEditing ? 'w-2/3' : 'w-full'} p-6 relative overflow-hidden`}
          style={backgroundImage ? {
            backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.92), rgba(255, 255, 255, 0.92)), url(${backgroundImage.url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          } : {}}
        >
          {backgroundImage && (
            <div className="absolute top-4 right-4 z-10">
              <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm border border-gray-200">
                <div className="flex items-center space-x-2">
                  <Eye className="h-4 w-4 text-purple-600" />
                  <span className="text-xs font-medium text-gray-700">Background Image</span>
                  <button
                    onClick={() => setBackgroundImage(null)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    title="Remove background"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          )}
          <div className="prose max-w-none">
            <div className={`whitespace-pre-wrap leading-relaxed ${
              backgroundImage ? 'text-gray-900 font-medium' : 'text-gray-800'
            }`}>
              {article.content}
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="w-1/3 border-l border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">
                Edit Article {selectedImage ? '& Image' : ''}
              </h3>
            </div>

            <div className="space-y-4 mb-4 max-h-60 overflow-y-auto">
              {chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={`p-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-100 text-blue-900 ml-4'
                      : 'bg-gray-100 text-gray-900 mr-4'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <span className="text-xs opacity-70">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <textarea
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                placeholder={
                  selectedImage 
                    ? 'Enter instructions to edit the selected image (e.g., "make it more colorful", "change background to blue")...'
                    : 'Enter instructions to edit the article (e.g., "make it more formal", "add conclusion")...'
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
              />
              <button
                onClick={handleSendMessage}
                disabled={!currentMessage.trim() || isEditingImage}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              >
                {isEditingImage || isEditing ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>{isEditingImage ? 'Editing Image...' : 'Processing...'}</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Send</span>
                  </>
                )}
              </button>
            </div>

            <div className="mt-4 text-xs text-gray-600">
              <p><strong>Editing Examples:</strong></p>
              <ul className="list-disc list-inside space-y-1 mt-2">
                {selectedImage && (
                  <>
                    <li>"Make the image more vibrant"</li>
                    <li>"Change the background to blue"</li>
                    <li>"Add more detail to the image"</li>
                  </>
                )}
                <li><strong>Remove:</strong> "Remove 'this specific phrase'"</li>
                <li><strong>Replace:</strong> "Change 'old text' to 'new text'"</li>
                <li><strong>Add:</strong> "Add 'new content' to the conclusion"</li>
                <li><strong>Tone:</strong> "Make it more formal/casual"</li>
                <li><strong>Style:</strong> "Simplify the language"</li>
              </ul>
              <p className="mt-2">
                <strong>Tip:</strong> Use quotes around specific text for precise editing!
              </p>
              {backgroundImage && (
                <div className="mt-3 p-2 bg-purple-50 border border-purple-200 rounded-lg">
                  <p className="text-xs text-purple-800">
                    <strong>Background Mode:</strong> The article is displayed with a background image. 
                    Click the eye icon on any image to change the background, or use the remove button above.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Manus AI Metrics */}
      {article.processingMetrics && (
        <ManusAIMetrics 
          metrics={article.processingMetrics}
          factCheckResults={article.factCheckResults}
          seoMetadata={article.seoMetadata}
        />
      )}
    </div>
  );
};