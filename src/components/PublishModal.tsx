import React, { useState } from 'react';
import { X, Globe, FileText, Calendar, Tag } from 'lucide-react';
import { SynthesizedArticle } from '../types';

interface PublishModalProps {
  article: SynthesizedArticle;
  isOpen: boolean;
  onClose: () => void;
  onPublish: (publishData: PublishData) => void;
}

interface PublishData {
  platform: string;
  title: string;
  description: string;
  tags: string[];
  publishDate: string;
  visibility: 'public' | 'private' | 'unlisted';
}

export const PublishModal: React.FC<PublishModalProps> = ({ article, isOpen, onClose, onPublish }) => {
  const [publishData, setPublishData] = useState<PublishData>({
    platform: 'medium',
    title: article.title,
    description: article.summary || '',
    tags: [],
    publishDate: new Date().toISOString().split('T')[0],
    visibility: 'public',
  });
  const [newTag, setNewTag] = useState('');

  const addTag = () => {
    if (newTag.trim() && !publishData.tags.includes(newTag.trim())) {
      setPublishData({
        ...publishData,
        tags: [...publishData.tags, newTag.trim()],
      });
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setPublishData({
      ...publishData,
      tags: publishData.tags.filter(t => t !== tag),
    });
  };

  const handlePublish = () => {
    onPublish(publishData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <Globe className="h-5 w-5 mr-2 text-blue-600" />
              Publish Article
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Publishing Platform</label>
            <select
              value={publishData.platform}
              onChange={(e) => setPublishData({ ...publishData, platform: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="medium">Medium</option>
              <option value="wordpress">WordPress</option>
              <option value="ghost">Ghost</option>
              <option value="substack">Substack</option>
              <option value="linkedin">LinkedIn</option>
              <option value="custom">Custom Platform</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Article Title</label>
            <input
              type="text"
              value={publishData.title}
              onChange={(e) => setPublishData({ ...publishData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description/Summary</label>
            <textarea
              value={publishData.description}
              onChange={(e) => setPublishData({ ...publishData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Brief description of your article..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
            <div className="flex space-x-2 mb-3">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTag()}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add a tag..."
              />
              <button
                onClick={addTag}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {publishData.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center space-x-1"
                >
                  <Tag className="h-3 w-3" />
                  <span>{tag}</span>
                  <button
                    onClick={() => removeTag(tag)}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Publish Date</label>
              <input
                type="date"
                value={publishData.publishDate}
                onChange={(e) => setPublishData({ ...publishData, publishDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Visibility</label>
              <select
                value={publishData.visibility}
                onChange={(e) => setPublishData({ ...publishData, visibility: e.target.value as 'public' | 'private' | 'unlisted' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="public">Public</option>
                <option value="unlisted">Unlisted</option>
                <option value="private">Private</option>
              </select>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <FileText className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800">Legal Notice</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  This article has been synthesized from multiple sources using AI technology. 
                  The content is original and transformative, created through analysis and synthesis 
                  rather than direct copying. All content complies with fair use guidelines.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handlePublish}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Globe className="h-4 w-4" />
            <span>Publish Article</span>
          </button>
        </div>
      </div>
    </div>
  );
};