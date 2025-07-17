import React, { useState } from 'react';
import { SynthesizedArticle } from '../types';
import { Download, FileText, Copy, Check } from 'lucide-react';

interface ArticleExportProps {
  article: SynthesizedArticle;
}

export const ArticleExport: React.FC<ArticleExportProps> = ({ article }) => {
  const [exportFormat, setExportFormat] = useState<'html' | 'text' | 'markdown'>('html');
  const [isCopied, setIsCopied] = useState(false);

  const generateCleanHTML = (): string => {
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const cleanContent = article.content
      .split('\n\n')
      .map(paragraph => paragraph.trim())
      .filter(paragraph => paragraph.length > 0)
      .map(paragraph => `<p>${paragraph}</p>`)
      .join('\n    ');

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${article.title}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Georgia', 'Times New Roman', serif;
            line-height: 1.6;
            color: #333;
            background-color: #fff;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
        }
        
        .article-header {
            border-bottom: 2px solid #e1e5e9;
            padding-bottom: 30px;
            margin-bottom: 40px;
        }
        
        .article-title {
            font-size: 2.5em;
            font-weight: bold;
            line-height: 1.2;
            margin-bottom: 20px;
            color: #1a1a1a;
        }
        
        .article-meta {
            color: #666;
            font-size: 0.9em;
            display: flex;
            gap: 20px;
            flex-wrap: wrap;
        }
        
        .meta-item {
            display: flex;
            align-items: center;
            gap: 5px;
        }
        
        .article-summary {
            background-color: #f8f9fa;
            border-left: 4px solid #007acc;
            padding: 20px;
            margin-bottom: 40px;
            font-style: italic;
            color: #555;
        }
        
        .article-content {
            font-size: 1.1em;
            line-height: 1.8;
        }
        
        .article-content p {
            margin-bottom: 20px;
            text-align: justify;
        }
        
        .article-content p:first-child::first-letter {
            font-size: 3em;
            font-weight: bold;
            float: left;
            line-height: 1;
            margin-right: 8px;
            margin-top: 4px;
            color: #007acc;
        }
        
        .article-footer {
            margin-top: 60px;
            padding-top: 30px;
            border-top: 1px solid #e1e5e9;
            color: #666;
            font-size: 0.9em;
        }
        
        .word-count {
            color: #999;
            font-size: 0.8em;
        }
        
        @media print {
            body {
                padding: 20px;
            }
            
            .article-title {
                font-size: 2em;
            }
            
            .article-content p:first-child::first-letter {
                font-size: 2.5em;
            }
        }
        
        @media (max-width: 600px) {
            body {
                padding: 20px 15px;
            }
            
            .article-title {
                font-size: 1.8em;
            }
            
            .article-meta {
                flex-direction: column;
                gap: 10px;
            }
        }
    </style>
</head>
<body>
    <article>
        <header class="article-header">
            <h1 class="article-title">${article.title}</h1>
            <div class="article-meta">
                <div class="meta-item">
                    <span>📅</span>
                    <span>${currentDate}</span>
                </div>
                <div class="meta-item">
                    <span>📝</span>
                    <span>${article.style.charAt(0).toUpperCase() + article.style.slice(1)} Style</span>
                </div>
                <div class="meta-item">
                    <span>⏱️</span>
                    <span>${Math.ceil(article.wordCount / 200)} min read</span>
                </div>
                <div class="meta-item">
                    <span>📊</span>
                    <span>${article.wordCount} words</span>
                </div>
            </div>
        </header>
        
        ${article.summary ? `<div class="article-summary">
            <strong>Summary:</strong> ${article.summary}
        </div>` : ''}
        
        <div class="article-content">
            ${cleanContent}
        </div>
        
        <footer class="article-footer">
            <p>Generated on ${currentDate}</p>
            ${article.processingMetrics ? `<p class="word-count">
                Quality Score: ${Math.round((article.processingMetrics.contentQualityScore || 0) * 100)}% • 
                AI Model: ${article.processingMetrics.aiModelUsed || 'AI Assistant'}
            </p>` : ''}
        </footer>
    </article>
</body>
</html>`;
  };

  const generateCleanText = (): string => {
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const cleanContent = article.content
      .split('\n\n')
      .map(paragraph => paragraph.trim())
      .filter(paragraph => paragraph.length > 0)
      .join('\n\n');

    return `${article.title}

Published: ${currentDate}
Style: ${article.style.charAt(0).toUpperCase() + article.style.slice(1)}
Reading Time: ${Math.ceil(article.wordCount / 200)} minutes
Word Count: ${article.wordCount}

${article.summary ? `SUMMARY\n${article.summary}\n\n` : ''}${cleanContent}

---
Generated on ${currentDate}${article.processingMetrics ? `\nQuality Score: ${Math.round((article.processingMetrics.contentQualityScore || 0) * 100)}%` : ''}`;
  };

  const generateMarkdown = (): string => {
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const cleanContent = article.content
      .split('\n\n')
      .map(paragraph => paragraph.trim())
      .filter(paragraph => paragraph.length > 0)
      .join('\n\n');

    return `# ${article.title}

**Published:** ${currentDate}  
**Style:** ${article.style.charAt(0).toUpperCase() + article.style.slice(1)}  
**Reading Time:** ${Math.ceil(article.wordCount / 200)} minutes  
**Word Count:** ${article.wordCount}

${article.summary ? `## Summary\n\n${article.summary}\n\n` : ''}${cleanContent}

---

*Generated on ${currentDate}*${article.processingMetrics ? `  \n*Quality Score: ${Math.round((article.processingMetrics.contentQualityScore || 0) * 100)}%*` : ''}`;
  };

  const getExportContent = (): string => {
    switch (exportFormat) {
      case 'html':
        return generateCleanHTML();
      case 'text':
        return generateCleanText();
      case 'markdown':
        return generateMarkdown();
      default:
        return generateCleanHTML();
    }
  };

  const getFileName = (): string => {
    const cleanTitle = article.title.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '-').toLowerCase();
    const extension = exportFormat === 'html' ? 'html' : exportFormat === 'markdown' ? 'md' : 'txt';
    return `${cleanTitle}.${extension}`;
  };

  const downloadArticle = () => {
    const content = getExportContent();
    const blob = new Blob([content], { 
      type: exportFormat === 'html' ? 'text/html' : 'text/plain' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = getFileName();
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(getExportContent());
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <FileText className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Export Article</h3>
            <p className="text-sm text-gray-500">Download as clean, professional document</p>
          </div>
        </div>
      </div>

      {/* Format Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Export Format</label>
        <div className="flex space-x-2">
          <button
            onClick={() => setExportFormat('html')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              exportFormat === 'html'
                ? 'bg-blue-100 text-blue-700 border border-blue-300'
                : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
            }`}
          >
            HTML
          </button>
          <button
            onClick={() => setExportFormat('text')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              exportFormat === 'text'
                ? 'bg-blue-100 text-blue-700 border border-blue-300'
                : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
            }`}
          >
            Text
          </button>
          <button
            onClick={() => setExportFormat('markdown')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              exportFormat === 'markdown'
                ? 'bg-blue-100 text-blue-700 border border-blue-300'
                : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
            }`}
          >
            Markdown
          </button>
        </div>
      </div>

      {/* Preview */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Preview</label>
        <div className="bg-gray-50 rounded-lg p-4 max-h-40 overflow-y-auto">
          <pre className="text-xs text-gray-600 whitespace-pre-wrap">
            {getExportContent().substring(0, 500)}...
          </pre>
        </div>
      </div>

      {/* Export Options */}
      <div className="flex space-x-3">
        <button
          onClick={downloadArticle}
          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
        >
          <Download className="h-4 w-4" />
          <span>Download {exportFormat.toUpperCase()}</span>
        </button>
        
        <button
          onClick={copyToClipboard}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
        >
          {isCopied ? (
            <>
              <Check className="h-4 w-4 text-green-600" />
              <span className="text-green-600">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Format Info */}
      <div className="mt-4 text-xs text-gray-500">
        <div className="flex items-center space-x-4">
          <span>File: {getFileName()}</span>
          <span>•</span>
          <span>Size: ~{Math.round(getExportContent().length / 1024)}KB</span>
          <span>•</span>
          <span>
            {exportFormat === 'html' && 'Web-ready with styling'}
            {exportFormat === 'text' && 'Plain text format'}
            {exportFormat === 'markdown' && 'Markdown with formatting'}
          </span>
        </div>
      </div>
    </div>
  );
};