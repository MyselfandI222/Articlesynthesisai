import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { SourceInput } from './components/SourceInput';
import { StyleSelector } from './components/StyleSelector';
import { TitleRecommendations } from './components/TitleRecommendations';
import { ChatGPTSettings } from './components/ChatGPTSettings';
import { ArticlePreview } from './components/ArticlePreview';
import { PublishModal } from './components/PublishModal';
import { WelcomeOnboarding } from './components/WelcomeOnboarding';
import { Article, SynthesizedArticle, WritingStyle } from './types';
import { synthesizeArticles, editArticle, getAIServicePreference, saveAIServicePreference, getChatGPTSettings, saveChatGPTSettings } from './utils/articleSynthesis';
import { getTodaysBreakingNews } from './utils/dailyNewsUpdater';
import { Sparkles, Loader, AlertCircle } from 'lucide-react';

function App() {
  const [sources, setSources] = useState<Article[]>([]);
  const [topic, setTopic] = useState('');
  const [style, setStyle] = useState<WritingStyle>('blog');
  const [tone, setTone] = useState('neutral');
  const [length, setLength] = useState<'short' | 'medium' | 'long'>('medium');
  const [synthesizedArticle, setSynthesizedArticle] = useState<SynthesizedArticle | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [dailyNewsNotification, setDailyNewsNotification] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // ChatGPT integration
  const [isChatGPTEnabled, setIsChatGPTEnabled] = useState(() => getAIServicePreference() === 'chatgpt');
  const [chatGPTSettings, setChatGPTSettings] = useState(() => getChatGPTSettings());

  useEffect(() => {
    // Check if user has seen onboarding
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }

    // Check for today's breaking news and show notification
    const checkDailyNews = async () => {
      try {
        const todaysNews = await getTodaysBreakingNews();
        if (todaysNews.length > 0) {
          const lastCheck = localStorage.getItem('lastNewsCheck');
          const today = new Date().toDateString();
          
          if (lastCheck !== today) {
            setDailyNewsNotification(`${todaysNews.length} new breaking news stories available today!`);
            localStorage.setItem('lastNewsCheck', today);
            
            // Auto-hide notification after 10 seconds
            setTimeout(() => setDailyNewsNotification(null), 10000);
          }
        }
      } catch (error) {
        console.warn('Failed to check daily news:', error);
      }
    };

    checkDailyNews();
  }, []);

  const handleSynthesize = async () => {
    if (sources.length === 0 || !topic.trim()) {
      setError('Please add at least one source article and specify a topic.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const article = await synthesizeArticles(sources, topic, style, tone, length);
      setSynthesizedArticle(article);
    } catch (err) {
      setError('Failed to synthesize article. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (instructions: string) => {
    if (!synthesizedArticle) return;

    setIsLoading(true);
    try {
      const editedArticle = await editArticle(synthesizedArticle, instructions);
      setSynthesizedArticle(editedArticle);
    } catch (err) {
      setError('Failed to edit article. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublish = (publishData: any) => {
    // In a real implementation, this would integrate with publishing platforms
    console.log('Publishing article:', publishData);
    alert('Article published successfully! (This is a demo)');
  };

  // Handle ChatGPT toggle
  const handleToggleChatGPT = (enabled: boolean) => {
    setIsChatGPTEnabled(enabled);
    saveAIServicePreference(enabled ? 'chatgpt' : 'default');
  };

  // Handle ChatGPT settings change
  const handleChatGPTSettingsChange = (settings: any) => {
    setChatGPTSettings(settings);
    saveChatGPTSettings(settings);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onShowOnboarding={() => setShowOnboarding(true)} />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Daily News Notification */}
        {dailyNewsNotification && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Sparkles className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-900">Daily News Update</p>
                <p className="text-sm text-blue-800">{dailyNewsNotification}</p>
              </div>
            </div>
            <button
              onClick={() => setDailyNewsNotification(null)}
              className="text-blue-600 hover:text-blue-800 transition-colors"
            >
              <AlertCircle className="h-5 w-5" />
            </button>
          </div>
        )}

        {!synthesizedArticle ? (
          <div className="space-y-8">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                AI Article Synthesis
              </h1>
              <p className="text-gray-600 leading-relaxed">
                Transform multiple source articles into original content. Our AI analyzes 
                different perspectives and creates unique, synthesized articles.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <SourceInput sources={sources} onSourcesChange={setSources} />
                
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Article Topic
                  </label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="What is the main topic of your article?"
                  />
                </div>
                
                {/* AI Title Recommendations */}
                <TitleRecommendations
                  articles={sources}
                  currentTopic={topic}
                  style={style}
                  tone={tone}
                  onTitleSelect={setTopic}
                />
              </div>

              <div className="space-y-6">
                <StyleSelector
                  selectedStyle={style}
                  onStyleChange={setStyle}
                  tone={tone}
                  onToneChange={setTone}
                  length={length}
                  onLengthChange={setLength}
                  sources={sources}
                />
                
                {/* ChatGPT Settings */}
                <ChatGPTSettings
                  isEnabled={isChatGPTEnabled}
                  onToggleEnabled={handleToggleChatGPT}
                  settings={chatGPTSettings}
                  onSettingsChange={handleChatGPTSettingsChange}
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {/* Synthesize Button */}
            <div className="text-center">
              <button
                onClick={handleSynthesize}
                disabled={isLoading || sources.length === 0 || !topic.trim()}
                className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all flex items-center space-x-3 mx-auto text-lg font-medium"
              >
                {isLoading ? (
                  <>
                    <Loader className="h-5 w-5 animate-spin" />
                    <span>Synthesizing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    <span>Synthesize Article</span>
                  </>
                )}
              </button>
              {sources.length > 0 && topic.trim() && (
                <p className="text-sm text-gray-600 mt-2">
                  Ready to synthesize {sources.length} sources about "{topic}"
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Your Synthesized Article</h2>
              <button
                onClick={() => setSynthesizedArticle(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors hover:bg-gray-100 rounded-lg"
              >
                ← Back to Editor
              </button>
            </div>

            <ArticlePreview
              article={synthesizedArticle}
              onEdit={handleEdit}
              onPublish={() => setIsPublishModalOpen(true)}
            />
          </div>
        )}
      </main>

      {isPublishModalOpen && synthesizedArticle && (
        <PublishModal
          article={synthesizedArticle}
          isOpen={isPublishModalOpen}
          onClose={() => setIsPublishModalOpen(false)}
          onPublish={handlePublish}
        />
      )}

      {showOnboarding && (
        <WelcomeOnboarding
          onClose={() => setShowOnboarding(false)}
        />
      )}
    </div>
  );
}

export default App;