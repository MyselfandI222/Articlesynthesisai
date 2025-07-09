import React, { useState } from 'react';
import { Plus, X, Link, FileText, Search } from 'lucide-react';
import { Article } from '../types';
import { ArticleSearch } from './ArticleSearch';

interface SourceInputProps {
  sources: Article[];
  onSourcesChange: (sources: Article[]) => void;
}

export const SourceInput: React.FC<SourceInputProps> = ({ sources, onSourcesChange }) => {
  const [newSource, setNewSource] = useState({ title: '', content: '', url: '' });
  const [activeTab, setActiveTab] = useState<'manual' | 'search'>('search');

  const addSource = () => {
    if (newSource.title && newSource.content) {
      const article: Article = {
        id: Date.now().toString(),
        title: newSource.title,
        content: newSource.content,
        url: newSource.url || undefined,
      };
      onSourcesChange([...sources, article]);
      setNewSource({ title: '', content: '', url: '' });
    }
  };

  const addSearchedArticle = (article: Article) => {
    // Check if article is already added, if so remove it (unadd functionality)
    const existingIndex = sources.findIndex(source => source.id === article.id);
    if (existingIndex !== -1) {
      // Remove the article (unadd)
      onSourcesChange(sources.filter(source => source.id !== article.id));
    } else {
      // Add the article
      onSourcesChange([...sources, article]);
    }
  };

  const removeSource = (id: string) => {
    onSourcesChange(sources.filter(source => source.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent flex items-center">
            <FileText className="h-5 w-5 mr-2 text-blue-600" />
            Source Articles
          </h2>
          <div className="flex bg-gray-100 rounded-xl p-1 shadow-inner">
            <button
              onClick={() => setActiveTab('search')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'search'
                  ? 'bg-white text-blue-600 shadow-sm transform scale-105'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Search className="h-4 w-4 inline mr-2" />
              Search Articles
            </button>
            <button
              onClick={() => setActiveTab('manual')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'manual'
                  ? 'bg-white text-blue-600 shadow-sm transform scale-105'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Plus className="h-4 w-4 inline mr-2" />
              Add Manually
            </button>
          </div>
        </div>

        {activeTab === 'search' ? (
          <ArticleSearch 
            onAddArticle={addSearchedArticle} 
            addedArticleIds={sources.map(source => source.id)}
          />
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Article Title</label>
              <input
                type="text"
                value={newSource.title}
                onChange={(e) => setNewSource({ ...newSource, title: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter article title..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Source URL (Optional)</label>
              <div className="relative">
                <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="url"
                  value={newSource.url}
                  onChange={(e) => setNewSource({ ...newSource, url: e.target.value })}
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="https://example.com/article"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Article Content</label>
              <textarea
                value={newSource.content}
                onChange={(e) => setNewSource({ ...newSource, content: e.target.value })}
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                placeholder="Paste the article content here..."
              />
            </div>
            
            <button
              onClick={addSource}
              disabled={!newSource.title || !newSource.content}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
            >
              <Plus className="h-4 w-4" />
              <span>Add Source</span>
            </button>
          </div>
        )}
      </div>

      {/* Added Sources Display */}
      {sources.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center">
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-bold mr-2">
              {sources.length}
            </span>
            Added Sources
          </h3>
          <div className="space-y-3">
            {sources.map((source) => (
              <div key={source.id} className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 flex justify-between items-start border border-gray-100 hover:shadow-sm transition-all">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1">{source.title}</h4>
                  <p className="text-sm text-gray-600 line-clamp-2">{source.content.substring(0, 150)}...</p>
                  <div className="flex items-center space-x-4 mt-2">
                    {source.url && (
                      <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline inline-flex items-center">
                        <Link className="h-3 w-3 mr-1" />
                        View Source
                      </a>
                    )}
                    {source.source && (
                      <span className="text-xs text-gray-500">
                        Source: {source.source}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => removeSource(source.id)}
                  className="ml-4 p-2 text-gray-400 hover:text-red-500 transition-colors hover:bg-red-50 rounded-lg"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};