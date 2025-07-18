// AI Article Generator Service
import { Article, SearchResult } from '../types';

interface ViralArticle {
  id: string;
  title: string;
  content: string;
  description: string;
  source: string;
  url: string;
  publishedAt: string;
  category: string;
  viralScore: number;
  trending: boolean;
  keywords: string[];
  estimatedReads: number;
  isGenerating?: boolean;
}

// Get OpenAI API key
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

// Check if API key is available
const isApiKeyAvailable = (): boolean => {
  return !!OPENAI_API_KEY && OPENAI_API_KEY !== 'your-openai-api-key-here';
};

// Generate viral articles using ChatGPT
export const generateViralArticles = async (
  searchTerm: string,
  count: number = 8
): Promise<Article[]> => {
  console.log(`Generating viral articles for: ${searchTerm}`);
  
  if (!isApiKeyAvailable()) {
    console.log('No OpenAI API key found, using fallback viral articles');
    return generateFallbackViralArticles(searchTerm, count);
  }

  try {
    // Create prompts for different types of viral content
    const viralPrompts = [
      `Create a viral news article about ${searchTerm} that would trending on social media. Focus on breaking news or shocking discoveries.`,
      `Write a viral analysis piece about ${searchTerm} that experts are talking about. Include surprising statistics or insights.`,
      `Generate a viral story about ${searchTerm} that people are sharing everywhere. Focus on human interest or emotional impact.`,
      `Create a viral investigation about ${searchTerm} that reveals something unexpected. Include exclusive details.`,
      `Write a viral opinion piece about ${searchTerm} that's causing debate. Include controversial but well-reasoned arguments.`,
      `Generate a viral how-to or explainer about ${searchTerm} that's getting millions of views. Make it actionable and valuable.`,
      `Create a viral celebrity or influencer story involving ${searchTerm}. Focus on entertainment value.`,
      `Write a viral technology breakthrough story about ${searchTerm}. Include future implications and expert quotes.`
    ];

    // Generate articles in batches to avoid rate limits
    const articles: Article[] = [];
    const batchSize = 2;
    
    for (let i = 0; i < Math.min(count, viralPrompts.length); i += batchSize) {
      const batch = viralPrompts.slice(i, i + batchSize);
      const batchPromises = batch.map(prompt => generateSingleViralArticle(prompt, searchTerm, i));
      const batchResults = await Promise.allSettled(batchPromises);
      
      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
          articles.push(result.value);
        }
      });
    }

    return articles.length > 0 ? articles : generateFallbackViralArticles(searchTerm, count);
  } catch (error) {
    console.error('Error generating viral articles:', error);
    return generateFallbackViralArticles(searchTerm, count);
  }
};

// Generate a single viral article using ChatGPT
const generateSingleViralArticle = async (
  prompt: string,
  searchTerm: string,
  index: number
): Promise<Article | null> => {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o', // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: 'system',
            content: `You are a viral content creator. Create compelling, engaging articles that people want to share. 
            
            IMPORTANT: 
            1. Do not reference or mention names/titles of other articles in your content
            2. Do not reference or mention the title of your own article within the article content
            3. Use generic phrases like "according to research", "studies show", "experts indicate", or "recent findings suggest"
            4. Write the article content without self-referencing (avoid phrases like "this article", "in this piece", etc.)
            5. Return your response in JSON format with exactly this structure:
            {
              "title": "Compelling headline that hooks readers",
              "content": "Full article content (500-800 words)",
              "description": "Brief description (100-150 words)",
              "category": "news/technology/entertainment/business/health/sports/politics",
              "keywords": ["keyword1", "keyword2", "keyword3"],
              "viralScore": 85
            }
            
            Make it factual but exciting. Include current trends and what people are talking about.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 1500,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = JSON.parse(data.choices[0].message.content);
    
    return {
      id: `ai-viral-${Date.now()}-${index}`,
      title: aiResponse.title,
      content: aiResponse.content,
      source: 'AI News Network',
      url: `https://ai-news.com/viral/${searchTerm.toLowerCase().replace(/\s+/g, '-')}-${index}`,
      publishedAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
      category: aiResponse.category || 'general',
      description: aiResponse.description,
      keywords: aiResponse.keywords || [searchTerm],
      viralScore: aiResponse.viralScore || 75,
      trending: true,
      estimatedReads: Math.floor(Math.random() * 500000) + 50000
    };
  } catch (error) {
    console.error('Error generating single viral article:', error);
    return null;
  }
};

// Generate fallback viral articles when API is not available
const generateFallbackViralArticles = (searchTerm: string, count: number): Article[] => {
  const viralTypes = [
    'Breaking News',
    'Exclusive Investigation',
    'Viral Analysis',
    'Celebrity Connection',
    'Technology Breakthrough',
    'Social Media Buzz',
    'Expert Opinion',
    'Trending Story'
  ];

  const articles: Article[] = [];
  
  for (let i = 0; i < count; i++) {
    const type = viralTypes[i % viralTypes.length];
    const viralScore = Math.floor(Math.random() * 40) + 40; // 40-80 viral score (lowered from 70-100)
    
    articles.push({
      id: `viral-fallback-${Date.now()}-${i}`,
      title: `${type}: ${searchTerm} - What Everyone's Talking About`,
      content: generateViralContent(searchTerm, type),
      source: 'Viral News Today',
      url: `https://viral-news.com/${searchTerm.toLowerCase().replace(/\s+/g, '-')}-${type.toLowerCase().replace(/\s+/g, '-')}`,
      publishedAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
      category: 'trending',
      description: `This ${type.toLowerCase()} about ${searchTerm} is going viral across social media platforms. Find out why everyone's sharing this story.`,
      keywords: [searchTerm, 'viral', 'trending', 'breaking'],
      viralScore,
      trending: true,
      estimatedReads: Math.floor(Math.random() * 1000000) + 100000
    });
  }
  
  return articles;
};

// Generate viral content for fallback articles
const generateViralContent = (searchTerm: string, type: string): string => {
  const templates = {
    'Breaking News': `🚨 BREAKING: ${searchTerm} has just been reported with stunning developments that are sending shockwaves through the industry. Sources close to the matter reveal unprecedented details that nobody saw coming.

This story is developing rapidly, with new information emerging every hour. Social media is exploding with reactions as people share their thoughts and experiences related to ${searchTerm}.

Key developments include:
• Unexpected revelations that challenge everything we thought we knew
• Industry experts calling this "the most significant development in years"
• Social media trending worldwide with millions of discussions
• Potential implications that could change the landscape forever

The story began when insiders first noticed unusual activity surrounding ${searchTerm}. What started as whispers quickly became a roar as more evidence emerged.

"This is absolutely unprecedented," said one industry analyst who wished to remain anonymous. "We've never seen anything like this before."

The implications are far-reaching, with experts predicting this could be a turning point. As the story continues to unfold, millions are watching to see what happens next.

Stay tuned for more updates as this viral story develops.`,

    'Exclusive Investigation': `🔍 EXCLUSIVE: Our investigation into ${searchTerm} has uncovered shocking details that will change everything you thought you knew.

After months of research, we've discovered information that's been hidden from the public. This exclusive report reveals the truth behind ${searchTerm} and why it's become the most talked-about topic online.

Our investigation found:
• Previously unreported facts that change the entire narrative
• Documents that reveal the real story behind ${searchTerm}
• Insider accounts that provide crucial context
• Evidence that contradicts popular assumptions

The investigation began when our team noticed inconsistencies in public reports about ${searchTerm}. What we found was more extraordinary than we expected.

"The public deserves to know the truth," said our lead investigator. "This story has implications that go far beyond what people realize."

Through careful analysis and multiple sources, we've pieced together a comprehensive picture that reveals the full scope of ${searchTerm}'s impact.

This exclusive investigation is already generating intense discussion across social media platforms, with readers sharing their own experiences and insights.`,

    'Viral Analysis': `📊 VIRAL ANALYSIS: Why ${searchTerm} is dominating social media and what it means for everyone.

The numbers are staggering. In just 24 hours, ${searchTerm} has generated over 10 million social media interactions, making it one of the most viral topics of the year.

Our analysis reveals why this story has captured global attention:
• Perfect timing with current events and trending topics
• Emotional resonance that connects with diverse audiences
• Shareable content that encourages discussion and debate
• Influencer amplification across multiple platforms

The viral nature of ${searchTerm} demonstrates how modern information spreads at unprecedented speed. What started as a simple story has evolved into a global phenomenon.

"This is textbook viral content," explains social media expert Dr. Sarah Chen. "It hits all the right notes for maximum engagement."

The implications extend beyond social media. Traditional news outlets are now covering the story, creating a feedback loop that amplifies the reach even further.

As ${searchTerm} continues to trend, we're seeing real-world impacts that go beyond online discussions. This analysis reveals why some stories capture our collective imagination while others fade into obscurity.`,

    'Celebrity Connection': `⭐ CELEBRITY BUZZ: Major celebrities are weighing in on ${searchTerm}, and their reactions are surprising everyone.

Hollywood and social media personalities are sharing their thoughts on ${searchTerm}, creating a celebrity discourse that's adding fuel to the viral fire.

Notable reactions include:
• A-list actors sharing personal experiences related to ${searchTerm}
• Musicians incorporating themes into their latest releases
• Influencers creating content that's reaching millions of viewers
• Athletes speaking out about how ${searchTerm} affects their industry

The celebrity involvement has elevated ${searchTerm} from a niche topic to mainstream conversation. When celebrities with millions of followers engage with a topic, it creates an amplification effect that can't be ignored.

"It's fascinating to see how ${searchTerm} has resonated with so many different types of public figures," notes entertainment journalist Maria Rodriguez. "This kind of cross-platform, cross-industry engagement is rare."

The celebrity connection has also sparked important conversations about influence, responsibility, and the role of public figures in shaping public opinion.

As more celebrities join the conversation, ${searchTerm} continues to evolve from a simple topic into a cultural moment that's defining our current media landscape.`
  };

  return templates[type] || templates['Breaking News'];
};

// Generate articles with streaming effect (show immediately, then update content)
export const generateStreamingViralArticles = async (
  searchTerm: string,
  onArticleGenerated: (article: Article) => void,
  count: number = 8
): Promise<void> => {
  console.log(`Starting streaming generation for: ${searchTerm}`);
  
  // First, show placeholder articles immediately for fast loading
  const placeholderArticles = generatePlaceholderArticles(searchTerm, count);
  placeholderArticles.forEach(article => onArticleGenerated(article));
  
  // Then generate real content in the background
  if (isApiKeyAvailable()) {
    try {
      const realArticles = await generateViralArticles(searchTerm, count);
      
      // Replace placeholders with real content
      realArticles.forEach((article, index) => {
        setTimeout(() => {
          onArticleGenerated({ ...article, isGenerating: false });
        }, (index + 1) * 2000); // Stagger updates every 2 seconds
      });
    } catch (error) {
      console.error('Error in streaming generation:', error);
    }
  } else {
    // Generate fallback content with delay to simulate AI processing
    const fallbackArticles = generateFallbackViralArticles(searchTerm, count);
    fallbackArticles.forEach((article, index) => {
      setTimeout(() => {
        onArticleGenerated({ ...article, isGenerating: false });
      }, (index + 1) * 1000);
    });
  }
};

// Generate placeholder articles for immediate display
const generatePlaceholderArticles = (searchTerm: string, count: number): Article[] => {
  const articles: Article[] = [];
  
  for (let i = 0; i < count; i++) {
    articles.push({
      id: `placeholder-${Date.now()}-${i}`,
      title: `Generating viral content about ${searchTerm}...`,
      content: `🤖 AI is creating compelling content about ${searchTerm}. This article is being generated with the latest trends and viral elements in mind.`,
      source: 'AI Content Generator',
      url: '#',
      publishedAt: new Date().toISOString(),
      isGenerating: true
    });
  }
  
  return articles;
};

// Check if Google Search API is available
export const isGoogleSearchAvailable = (): boolean => {
  const googleApiKey = import.meta.env.VITE_GOOGLE_API_KEY;
  const searchEngineId = import.meta.env.VITE_GOOGLE_SEARCH_ENGINE_ID;
  return !!(googleApiKey && searchEngineId);
};

// Convert viral article to regular article format
export const convertViralArticleToArticle = (viralArticle: ViralArticle): Article => {
  return {
    id: viralArticle.id,
    title: viralArticle.title,
    content: viralArticle.content,
    source: viralArticle.source,
    url: viralArticle.url,
    publishedAt: viralArticle.publishedAt
  };
};