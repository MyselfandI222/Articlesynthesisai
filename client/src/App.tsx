import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { SourceInput } from './components/SourceInput';
import { StyleSelector } from './components/StyleSelector';
import { TitleRecommendations } from './components/TitleRecommendations';
import { ChatGPTSettings } from './components/ChatGPTSettings';
import { ArticlePreview } from './components/ArticlePreview';
import { PublishModal } from './components/PublishModal';
import AuthPage from './components/AuthPage';
import SourceCredibilityMeter from './components/SourceCredibilityMeter';
import AffiliateDashboard from './components/AffiliateDashboard';
import PremiumFeatures, { useFeatureAccess } from './components/PremiumFeatures';
import SubscriptionPage from './pages/subscribe';
import MoodMeter from './components/MoodMeter';
import ClaudeSettings from './components/ClaudeSettings';
import GeminiSettings from './components/GeminiSettings';
import MistralSettings from './components/MistralSettings';
import { Article, SynthesizedArticle, WritingStyle } from './types';
import { synthesizeArticles, editArticle, getAIServicePreference, saveAIServicePreference, getChatGPTSettings, saveChatGPTSettings } from './utils/articleSynthesis';
import { getClaudeSettings, saveClaudeSettings, ClaudeServiceConfig } from './utils/claudeService';
import { getGeminiSettings, saveGeminiSettings, GeminiSearchConfig } from './utils/geminiSearchService';
import { getMistralSettings, saveMistralSettings, MistralServiceConfig } from './utils/mistralService';
import { getTodaysBreakingNews } from './utils/dailyNewsUpdater';
import { useAuth } from './hooks/useAuth';
import { Sparkles, Loader, AlertCircle } from 'lucide-react';

function App() {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const [currentPage, setCurrentPage] = useState<'home' | 'affiliate' | 'premium' | 'subscribe'>('home');
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

  // AI Service integration
  const [isChatGPTEnabled, setIsChatGPTEnabled] = useState(() => {
    const preference = getAIServicePreference();
    return preference === 'chatgpt' || preference === 'hybrid';
  });
  const [chatGPTSettings, setChatGPTSettings] = useState(() => getChatGPTSettings());
  const [isClaudeEnabled, setIsClaudeEnabled] = useState(() => {
    const preference = getAIServicePreference();
    return preference === 'claude' || preference === 'hybrid';
  });
  const [claudeSettings, setClaudeSettings] = useState(() => getClaudeSettings());
  const [isGeminiEnabled, setIsGeminiEnabled] = useState(false);
  const [geminiSettings, setGeminiSettings] = useState(() => getGeminiSettings());
  const [isMistralEnabled, setIsMistralEnabled] = useState(() => {
    const preference = getAIServicePreference();
    return preference === 'mistral';
  });
  const [mistralSettings, setMistralSettings] = useState(() => getMistralSettings());

  // Feature access based on user subscription
  const userTier = user?.subscriptionStatus && !['free', 'inactive'].includes(user.subscriptionStatus) ? 'pro' : 'free';
  const { hasFeature } = useFeatureAccess(userTier);

  useEffect(() => {
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
    if (enabled && isClaudeEnabled) {
      // Both enabled - use hybrid mode
      saveAIServicePreference('hybrid');
    } else if (enabled) {
      saveAIServicePreference('chatgpt');
    } else if (isClaudeEnabled) {
      saveAIServicePreference('claude');
    } else {
      saveAIServicePreference('default');
    }
  };

  // Handle ChatGPT settings change
  const handleChatGPTSettingsChange = (settings: any) => {
    setChatGPTSettings(settings);
    saveChatGPTSettings(settings);
  };

  // Handle Claude toggle
  const handleToggleClaude = (enabled: boolean) => {
    setIsClaudeEnabled(enabled);
    if (enabled && isChatGPTEnabled) {
      // Both enabled - use hybrid mode
      saveAIServicePreference('hybrid');
    } else if (enabled) {
      saveAIServicePreference('claude');
    } else if (isChatGPTEnabled) {
      saveAIServicePreference('chatgpt');
    } else {
      saveAIServicePreference('default');
    }
  };

  // Handle Claude settings change
  const handleClaudeSettingsChange = (settings: ClaudeServiceConfig) => {
    setClaudeSettings(settings);
    saveClaudeSettings(settings);
  };

  // Handle Mistral toggle
  const handleToggleMistral = (enabled: boolean) => {
    setIsMistralEnabled(enabled);
    if (enabled) {
      saveAIServicePreference('mistral');
    } else {
      saveAIServicePreference('default');
    }
  };

  // Handle Mistral settings change
  const handleMistralSettingsChange = (settings: MistralServiceConfig) => {
    setMistralSettings(settings);
    saveMistralSettings(settings);
  };

  // Handle Gemini toggle
  const handleToggleGemini = (enabled: boolean) => {
    setIsGeminiEnabled(enabled);
  };

  // Handle Gemini settings change
  const handleGeminiSettingsChange = (settings: GeminiSearchConfig) => {
    setGeminiSettings(settings);
    saveGeminiSettings(settings);
  };

  // Show landing page for unauthenticated users
  if (authLoading || !isAuthenticated) {
    return authLoading ? (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    ) : (
      <AuthPage />
    );
  }

  return (
    <div className="min-h-screen">
      <Header 
        onNavigate={setCurrentPage} 
        currentPage={currentPage}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Daily News Notification */}
        {dailyNewsNotification && currentPage === 'home' && (
          <div className="glass-effect border-blue-300/50 dark:border-blue-700/50 rounded-2xl p-5 flex items-center justify-between card-shadow smooth-transition hover:shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="gradient-primary p-2.5 rounded-xl">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-blue-900 dark:text-blue-100">Daily News Update</p>
                <p className="text-sm text-blue-700 dark:text-blue-300">{dailyNewsNotification}</p>
              </div>
            </div>
            <button
              onClick={() => setDailyNewsNotification(null)}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 smooth-transition"
            >
              <AlertCircle className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Render different pages */}
        {currentPage === 'affiliate' && (
          <AffiliateDashboard />
        )}

        {currentPage === 'premium' && (
          <PremiumFeatures 
            userTier={userTier}
            onUpgrade={() => setCurrentPage('subscribe')}
          />
        )}

        {currentPage === 'subscribe' && (
          <SubscriptionPage />
        )}

        {currentPage === 'home' && (
          <>
            {!synthesizedArticle ? (
          <div className="space-y-8">
            <div className="text-center max-w-4xl mx-auto space-y-4">
              <h1 className="text-5xl font-bold text-gradient mb-3 tracking-tight">
                AI-Powered Article Synthesis
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                Transform multiple source articles into original, legally compliant content. 
                Our AI analyzes different perspectives and creates unique, synthesized articles 
                that combine the best insights from your sources.
              </p>
              <div className="flex items-center justify-center gap-3 text-sm text-blue-600 dark:text-blue-400 font-medium flex-wrap">
                <span className="flex items-center gap-1">✨ Daily Updates</span>
                <span>•</span>
                <span className="flex items-center gap-1">🌐 Live Search</span>
                <span>•</span>
                <span className="flex items-center gap-1">📊 Breaking News</span>
              </div>
            </div>

            <div className="max-w-4xl mx-auto space-y-6">
              <SourceInput sources={sources} onSourcesChange={setSources} />
              
              {/* Source Credibility Meter */}
              {sources.length > 0 && (
                <SourceCredibilityMeter sources={sources} />
              )}
              
              {/* Mood Meter */}
              {sources.length > 0 && hasFeature('mood-meter') && (
                <MoodMeter articles={sources} />
              )}
              
              <div className="glass-effect rounded-2xl p-6 card-shadow hover:shadow-lg smooth-transition">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Article Topic
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 smooth-transition placeholder:text-gray-400 dark:text-gray-100"
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
              
              {/* Claude Settings */}
              <ClaudeSettings
                isEnabled={isClaudeEnabled}
                onToggleEnabled={handleToggleClaude}
                settings={claudeSettings}
                onSettingsChange={handleClaudeSettingsChange}
              />
              
              {/* Gemini Settings */}
              <GeminiSettings
                isEnabled={isGeminiEnabled}
                onToggleEnabled={handleToggleGemini}
                settings={geminiSettings}
                onSettingsChange={handleGeminiSettingsChange}
              />
              
              {/* Mistral Settings */}
              <MistralSettings
                isEnabled={isMistralEnabled}
                onToggleEnabled={handleToggleMistral}
                settings={mistralSettings}
                onSettingsChange={handleMistralSettingsChange}
              />
            </div>
            
            {error && (
              <div className="max-w-4xl mx-auto glass-effect border-red-300 dark:border-red-700 rounded-2xl p-4 flex items-center space-x-3 card-shadow">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                <p className="text-red-800 dark:text-red-300">{error}</p>
              </div>
            )}

            {/* Synthesize Button - Made more prominent */}
            <div className="max-w-4xl mx-auto text-center glass-effect rounded-2xl card-shadow-lg p-8 hover:shadow-xl smooth-transition border-2 border-blue-200/50 dark:border-blue-700/50">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">Ready to Synthesize?</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {sources.length > 0 && topic.trim() 
                    ? `Synthesize ${sources.length} sources into your article about "${topic}"`
                    : 'Add sources and specify a topic to begin synthesis'
                  }
                </p>
                
                {/* AI Mode Indicator */}
                {(isChatGPTEnabled || isClaudeEnabled || isMistralEnabled) && (
                  <div className="mt-4 flex items-center justify-center">
                    {isChatGPTEnabled && isClaudeEnabled ? (
                      <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/40 dark:to-blue-900/40 border border-purple-300 dark:border-purple-700 rounded-xl smooth-transition">
                        <div className="flex items-center space-x-1">
                          <div className="h-2.5 w-2.5 bg-purple-500 rounded-full animate-pulse"></div>
                          <div className="h-2.5 w-2.5 bg-blue-500 rounded-full animate-pulse"></div>
                        </div>
                        <span className="text-xs font-semibold text-purple-700 dark:text-purple-300">Hybrid AI Mode</span>
                        <span className="text-xs text-purple-600 dark:text-purple-400">Claude + ChatGPT</span>
                      </div>
                    ) : isMistralEnabled ? (
                      <div className="flex items-center space-x-2 px-4 py-2 bg-orange-100 dark:bg-orange-900/40 border border-orange-300 dark:border-orange-700 rounded-xl">
                        <div className="h-2.5 w-2.5 bg-orange-500 rounded-full animate-pulse"></div>
                        <span className="text-xs font-semibold text-orange-700 dark:text-orange-300">Mistral AI Mode</span>
                      </div>
                    ) : isChatGPTEnabled ? (
                      <div className="flex items-center space-x-2 px-4 py-2 bg-green-100 dark:bg-green-900/40 border border-green-300 dark:border-green-700 rounded-xl">
                        <div className="h-2.5 w-2.5 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs font-semibold text-green-700 dark:text-green-300">ChatGPT Mode</span>
                      </div>
                    ) : isClaudeEnabled ? (
                      <div className="flex items-center space-x-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/40 border border-blue-300 dark:border-blue-700 rounded-xl">
                        <div className="h-2.5 w-2.5 bg-blue-500 rounded-full animate-pulse"></div>
                        <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">Claude Mode</span>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
              <button
                onClick={handleSynthesize}
                disabled={isLoading || sources.length === 0 || !topic.trim()}
                className="gradient-primary px-10 py-4 text-white rounded-2xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed smooth-transition flex items-center space-x-3 mx-auto text-lg font-bold shadow-lg hover:-translate-y-1 transform"
              >
                {isLoading ? (
                  <>
                    <Loader className="h-6 w-6 animate-spin" />
                    <span>Synthesizing Article...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-6 w-6" />
                    <span>Synthesize Article</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-4xl font-bold text-gradient">Your Synthesized Article</h2>
              <button
                onClick={() => setSynthesizedArticle(null)}
                className="px-5 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 smooth-transition rounded-xl font-medium border border-gray-200 dark:border-gray-700"
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
          </>
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
    </div>
  );
}

export default App;