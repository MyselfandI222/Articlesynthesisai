import React, { useState, useEffect } from 'react';
import { X, ArrowRight, ArrowLeft, Sparkles, Search, BarChart3, Compass, Heart, CheckCircle } from 'lucide-react';

interface WelcomeOnboardingProps {
  onClose: () => void;
}

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

export const WelcomeOnboarding: React.FC<WelcomeOnboardingProps> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to AI Article Synthesis',
      description: 'Create intelligent, original articles from multiple news sources',
      icon: <Sparkles className="h-8 w-8 text-blue-600" />,
      content: (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border border-blue-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Transform News Into Intelligence</h3>
            <p className="text-gray-600 mb-4">
              Our AI-powered platform combines multiple news sources to create original, synthesized articles 
              that provide comprehensive perspectives on any topic.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-700">15+ Major News Sources</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-sm text-gray-700">AI-Powered Synthesis</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Real-time Analysis</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Multiple Writing Styles</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'search',
      title: 'Find Your Sources',
      description: 'Search across 15+ major news outlets for relevant articles',
      icon: <Search className="h-8 w-8 text-green-600" />,
      content: (
        <div className="space-y-4">
          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Comprehensive News Search</h3>
            <p className="text-gray-600 mb-4">
              Search across BBC, CNN, NPR, Guardian, Reuters, and more. Our AI automatically 
              generates relevant articles when live sources aren't available.
            </p>
            <div className="bg-white p-4 rounded-lg border border-green-200">
              <div className="flex items-center space-x-3 mb-3">
                <Search className="h-5 w-5 text-green-600" />
                <input 
                  type="text" 
                  placeholder="Try searching for 'technology trends'" 
                  className="flex-1 p-2 border border-gray-300 rounded-lg"
                  disabled
                />
              </div>
              <div className="text-sm text-gray-500">
                ✨ AI generates viral articles when real sources aren't available
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'analysis',
      title: 'Smart Content Analysis',
      description: 'Understand your content with depth, perspective, and mood analysis',
      icon: <BarChart3 className="h-8 w-8 text-purple-600" />,
      content: (
        <div className="space-y-4">
          <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Three Powerful Analysis Tools</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg border border-purple-200">
                <div className="flex items-center space-x-2 mb-2">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                  <span className="font-medium text-gray-900">Story Depth</span>
                </div>
                <p className="text-sm text-gray-600">
                  Measures comprehensiveness, facts, and complexity
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-purple-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Compass className="h-5 w-5 text-purple-600" />
                  <span className="font-medium text-gray-900">Perspective</span>
                </div>
                <p className="text-sm text-gray-600">
                  Visualizes different viewpoints and bias analysis
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-purple-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Heart className="h-5 w-5 text-purple-600" />
                  <span className="font-medium text-gray-900">Mood Tone</span>
                </div>
                <p className="text-sm text-gray-600">
                  Analyzes emotional sentiment and intensity
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'synthesis',
      title: 'AI-Powered Article Creation',
      description: 'Generate original articles with multiple styles and tones',
      icon: <Sparkles className="h-8 w-8 text-orange-600" />,
      content: (
        <div className="space-y-4">
          <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Intelligent Article Synthesis</h3>
            <p className="text-gray-600 mb-4">
              Choose from 7 writing styles and customize tone and length. Our AI creates 
              original content that never references source article titles.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-3 rounded-lg border border-orange-200">
                <div className="font-medium text-gray-900 mb-1">Writing Styles</div>
                <div className="text-sm text-gray-600">Academic, Journalistic, Blog, Technical, Creative, Business, Opinion</div>
              </div>
              <div className="bg-white p-3 rounded-lg border border-orange-200">
                <div className="font-medium text-gray-900 mb-1">Customization</div>
                <div className="text-sm text-gray-600">Tone, Length, SEO optimization, Fact-checking</div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'start',
      title: 'Ready to Get Started?',
      description: 'Begin creating your first synthesized article',
      icon: <CheckCircle className="h-8 w-8 text-green-600" />,
      content: (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border border-green-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Your Next Steps</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">1</div>
                <div>
                  <div className="font-medium text-gray-900">Search for Articles</div>
                  <div className="text-sm text-gray-600">Use the search box to find relevant news sources</div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">2</div>
                <div>
                  <div className="font-medium text-gray-900">Choose Your Style</div>
                  <div className="text-sm text-gray-600">Select writing style, tone, and length preferences</div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">3</div>
                <div>
                  <div className="font-medium text-gray-900">Synthesize & Edit</div>
                  <div className="text-sm text-gray-600">Generate your article and refine it with AI editing</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const handleComplete = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  if (!isVisible) return null;

  const currentStepData = steps[currentStep];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transition-all duration-300 ${
        isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            {currentStepData.icon}
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{currentStepData.title}</h2>
              <p className="text-gray-600">{currentStepData.description}</p>
            </div>
          </div>
          <button
            onClick={handleSkip}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Step {currentStep + 1} of {steps.length}</span>
            <span className="text-sm text-gray-600">{Math.round(((currentStep + 1) / steps.length) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {currentStepData.content}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentStep 
                    ? 'bg-blue-500' 
                    : index < currentStep 
                      ? 'bg-green-500' 
                      : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center space-x-3">
            {currentStep > 0 && (
              <button
                onClick={handlePrevious}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Previous</span>
              </button>
            )}

            {currentStep < steps.length - 1 ? (
              <button
                onClick={handleNext}
                className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
              >
                <span>Next</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={handleComplete}
                className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition-all"
              >
                <span>Get Started</span>
                <Sparkles className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Skip Option */}
        <div className="px-6 pb-6">
          <button
            onClick={handleSkip}
            className="w-full text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Skip introduction
          </button>
        </div>
      </div>
    </div>
  );
};