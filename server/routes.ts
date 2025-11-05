import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./auth";
import { createPaypalOrder, capturePaypalOrder, loadPaypalDefault } from "./paypal";
import { synthesizeArticles, editArticle, generateTitles, analyzeQuality } from "./claude";
import { generateArticleImage } from "./imageGeneration";
import { z } from "zod";

// Validation Schemas
const newsSearchSchema = z.object({
  q: z.string().min(1).max(500).trim(),
  language: z.string().optional(),
  sortBy: z.enum(['relevancy', 'popularity', 'publishedAt']).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional()
});

const userCreateSchema = z.object({
  username: z.string().min(3).max(50).trim().regex(/^[a-zA-Z0-9_-]+$/),
  password: z.string().min(8).max(100),
  email: z.string().email().optional()
});

const articleViewSchema = z.object({
  id: z.string().min(1).max(200).trim()
});

const synthesizeSchema = z.object({
  sources: z.array(z.object({
    id: z.string(),
    title: z.string().max(500),
    content: z.string().max(50000),
    source: z.string().optional(),
    url: z.string().url().optional()
  })).min(1).max(20),
  topic: z.string().min(1).max(500).trim(),
  style: z.enum(['academic', 'journalistic', 'blog', 'technical', 'creative', 'business', 'opinion']),
  tone: z.string().max(100).trim(),
  length: z.enum(['short', 'medium', 'long']),
  wordCountRange: z.object({
    min: z.number().int().min(100).max(10000),
    max: z.number().int().min(100).max(100000)
  }).optional()
});

const editArticleSchema = z.object({
  content: z.string().max(100000),
  instruction: z.string().min(1).max(1000).trim()
});

const viralGenerateSchema = z.object({
  searchTerm: z.string().min(1).max(500).trim(),
  count: z.number().int().min(1).max(10).optional()
});

const geminiSearchSchema = z.object({
  query: z.string().min(1).max(500).trim(),
  config: z.object({
    model: z.string().optional(),
    maxResults: z.number().int().min(1).max(50).optional(),
    searchDepth: z.enum(['basic', 'comprehensive', 'deep']).optional(),
    filterRelevance: z.boolean().optional(),
    includeAnalysis: z.boolean().optional(),
    settings: z.object({
      temperature: z.number().min(0).max(2).optional(),
      maxTokens: z.number().int().min(100).max(10000).optional(),
      topP: z.number().min(0).max(1).optional(),
      topK: z.number().int().min(1).max(100).optional()
    }).optional()
  }).optional()
});

const trackClickSchema = z.object({
  affiliateCode: z.string().min(1).max(50).trim(),
  clickedUrl: z.string().url().max(1000).optional(),
  metadata: z.record(z.any()).optional()
});

const trackPurchaseSchema = z.object({
  affiliateCode: z.string().min(1).max(50).trim(),
  purchaseAmount: z.number().min(0).max(1000000),
  orderId: z.string().max(100).optional()
});

const imageGenerationSchema = z.object({
  prompt: z.string().min(1).max(1000).trim(),
  style: z.string().max(100).optional(),
  size: z.enum(['1024x1024', '1792x1024', '1024x1792']).optional()
});

const articleViewTrackingSchema = z.object({
  articleId: z.string().min(1).max(200).trim(),
  articleTitle: z.string().min(1).max(500).trim(),
  articleSource: z.string().max(200).optional(),
  articleUrl: z.string().url().max(1000).optional()
});

const imageGenSchema = z.object({
  articleTitle: z.string().max(500),
  articleContent: z.string().max(50000),
  style: z.enum(['realistic', 'digital-art', 'vivid', 'natural']).optional()
});

const mistralSynthesizeSchema = z.object({
  topic: z.string().min(1).max(500).trim(),
  style: z.enum(['academic', 'journalistic', 'blog', 'technical', 'creative', 'business', 'opinion']),
  urls: z.array(z.string().url()).min(1).max(10),
  maxWords: z.number().int().min(100).max(10000).optional(),
  model: z.string().optional()
});

const mistralEditSchema = z.object({
  article: z.string().max(100000),
  title: z.string().max(500),
  instructions: z.string().min(1).max(1000).trim(),
  model: z.string().optional()
});

const claudeTitlesSchema = z.object({
  article: z.object({
    title: z.string().max(500).optional(),
    content: z.string().max(50000)
  }),
  count: z.number().int().min(1).max(10).optional()
});

const claudeQualitySchema = z.object({
  article: z.object({
    title: z.string().max(500),
    content: z.string().max(50000)
  })
});

const paypalOrderSchema = z.object({
  intent: z.enum(['CAPTURE', 'AUTHORIZE']).optional(),
  amount: z.string().regex(/^\$?\d+(\.\d{1,2})?$/).transform(val => val.replace('$', '')).or(z.number().positive()),
  currency: z.string().length(3).optional()
});

const subscribeSchema = z.object({
  tier: z.enum(['pro-monthly', 'pro-lifetime', 'free']),
  paymentDetails: z.object({
    orderId: z.string().optional(),
    payerId: z.string().optional(),
    paymentMethod: z.string().optional()
  }).optional()
});

const affiliateClickSchema = z.object({
  code: z.string().min(1).max(50).trim()
});

const affiliateSignupSchema = z.object({
  code: z.string().min(1).max(50).trim(),
  userId: z.number().int().positive()
});

const mostViewedSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional()
});

const affiliateRefSchema = z.object({
  code: z.string().min(1).max(50).trim()
});

// Validation middleware factory
function validateRequest<T extends z.ZodType>(schema: T, source: 'body' | 'query' | 'params' = 'body') {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = source === 'body' ? req.body : source === 'query' ? req.query : req.params;
      const validated = await schema.parseAsync(data);
      
      // Replace the original data with sanitized version
      if (source === 'body') req.body = validated;
      else if (source === 'query') req.query = validated as any;
      else req.params = validated as any;
      
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: 'Invalid request data',
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        });
      }
      next(error);
    }
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  setupAuth(app);
  // NewsAPI proxy endpoint to bypass CORS restrictions
  app.get('/api/news/search', validateRequest(newsSearchSchema, 'query'), async (req, res) => {
    try {
      const query = req.query.q as string;
      const apiKey = process.env.VITE_NEWS_API_KEY || process.env.NEWS_API_KEY;
      
      console.log('Environment check:', {
        VITE_NEWS_API_KEY: process.env.VITE_NEWS_API_KEY ? `${process.env.VITE_NEWS_API_KEY.substring(0, 8)}...` : 'NOT SET',
        NEWS_API_KEY: process.env.NEWS_API_KEY ? `${process.env.NEWS_API_KEY.substring(0, 8)}...` : 'NOT SET'
      });
      console.log('Current API key:', apiKey ? `${apiKey.substring(0, 8)}...` : 'NOT SET');
      
      if (!query) {
        return res.status(400).json({ error: 'Query parameter is required' });
      }
      
      if (!apiKey) {
        return res.status(500).json({ error: 'NewsAPI key not configured' });
      }
      
      const response = await fetch(`https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=en&sortBy=publishedAt&pageSize=20&apiKey=${apiKey}`, {
        method: 'GET',
        headers: {
          'User-Agent': 'NewsApp/1.0',
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`NewsAPI error: ${response.status} - ${errorText}`);
        return res.status(response.status).json({ error: `NewsAPI error: ${response.status}` });
      }
      
      const data = await response.json();
      
      if (data.status === 'error') {
        console.error('NewsAPI returned error:', data.message);
        return res.status(400).json({ error: data.message });
      }
      
      res.json(data);
    } catch (error) {
      console.error('NewsAPI proxy error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  // Auth routes are now handled in auth.ts
  
  // Debug endpoint to create a test user
  app.post('/api/debug/create-user', validateRequest(userCreateSchema), async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
      }
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }
      
      // Create user using the auth system's password hashing
      const { scrypt, randomBytes } = await import('crypto');
      const { promisify } = await import('util');
      const scryptAsync = promisify(scrypt);
      
      const salt = randomBytes(16).toString("hex");
      const buf = (await scryptAsync(password, salt, 64)) as Buffer;
      const hashedPassword = `${buf.toString("hex")}.${salt}`;
      
      // Create user
      const user = await storage.createUser({
        username,
        password: hashedPassword,
        email: `${username}@example.com`,
        subscriptionStatus: 'free'
      });
      
      res.json({ 
        success: true, 
        user: { 
          id: user.id, 
          username: user.username,
          subscriptionStatus: user.subscriptionStatus 
        } 
      });
    } catch (error) {
      console.error('Error creating test user:', error);
      res.status(500).json({ error: 'Failed to create user' });
    }
  });

  // Protected route example
  app.get("/api/protected", isAuthenticated, async (req, res) => {
    const userId = req.user?.id;
    res.json({ message: "This is a protected route", userId });
  });

  // Affiliate Marketing Routes
  
  // Get user's affiliate link
  app.get("/api/affiliate/link", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      
      const affiliateCode = await storage.generateAffiliateCode(userId);
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const affiliateLink = `${baseUrl}/signup?ref=${affiliateCode}`;
      
      res.json({ 
        affiliateCode, 
        affiliateLink,
        shortLink: `${baseUrl}/ref/${affiliateCode}`
      });
    } catch (error) {
      console.error('Error generating affiliate link:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get user's referral stats
  app.get("/api/affiliate/stats", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      
      const user = await storage.getUser(userId);
      const referrals = await storage.getUserReferrals(userId);
      const rewards = await storage.getUserRewards(userId);
      const affiliate = await storage.getAffiliateByCode(user?.affiliateCode || '');
      
      res.json({
        totalReferrals: user?.totalReferrals || 0,
        referrals: referrals.map(r => ({ username: r.username, createdAt: r.createdAt })),
        rewards: rewards,
        clickCount: affiliate?.clickCount || 0,
        conversions: affiliate?.conversions || 0,
        totalEarnings: affiliate?.totalEarnings || 0
      });
    } catch (error) {
      console.error('Error fetching affiliate stats:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Track affiliate click
  app.post("/api/affiliate/click", validateRequest(affiliateClickSchema), async (req, res) => {
    try {
      const { code } = req.body;
      
      await storage.trackAffiliateClick(code);
      res.json({ success: true });
    } catch (error) {
      console.error('Error tracking affiliate click:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Handle affiliate signup
  app.post("/api/affiliate/signup", validateRequest(affiliateSignupSchema), async (req, res) => {
    try {
      const { code, userId } = req.body;
      
      await storage.trackAffiliateConversion(code, userId);
      res.json({ success: true });
    } catch (error) {
      console.error('Error tracking affiliate conversion:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Short link redirect
  app.get("/ref/:code", validateRequest(affiliateRefSchema, 'params'), async (req, res) => {
    try {
      const { code } = req.params;
      const affiliate = await storage.getAffiliateByCode(code);
      
      if (!affiliate) {
        return res.redirect('/signup');
      }
      
      // Track the click
      await storage.trackAffiliateClick(code);
      
      // Redirect to signup with affiliate code
      res.redirect(`/signup?ref=${code}`);
    } catch (error) {
      console.error('Error handling affiliate redirect:', error);
      res.redirect('/signup');
    }
  });

  // PayPal payment routes
  app.get("/api/paypal/setup", async (req, res) => {
    await loadPaypalDefault(req, res);
  });

  app.post("/api/paypal/order", validateRequest(paypalOrderSchema), async (req, res) => {
    // Request body should contain: { intent, amount, currency }
    await createPaypalOrder(req, res);
  });

  app.post("/api/paypal/order/:orderID/capture", validateRequest(z.object({
    orderID: z.string().min(1).max(100).trim()
  }), 'params'), async (req, res) => {
    await capturePaypalOrder(req, res);
  });

  // Pro subscription endpoints
  app.post("/api/subscribe", isAuthenticated, validateRequest(subscribeSchema), async (req, res) => {
    try {
      const { tier, paymentDetails } = req.body;
      const userId = (req.user as any).id;
      
      // Validate tier
      if (!['pro-monthly', 'pro-lifetime', 'free'].includes(tier)) {
        return res.status(400).json({ error: 'Invalid subscription tier' });
      }
      
      // Map tier to subscription status
      let subscriptionStatus = 'free';
      if (tier === 'pro-monthly' || tier === 'pro-lifetime') {
        subscriptionStatus = 'pro';
      }
      
      // Update user subscription
      await storage.updateUserSubscription(userId, subscriptionStatus, paymentDetails);
      
      res.json({ success: true, tier: subscriptionStatus });
    } catch (error) {
      console.error('Error creating subscription:', error);
      res.status(500).json({ error: 'Failed to create subscription' });
    }
  });

  app.post("/api/cancel-subscription", isAuthenticated, validateRequest(z.object({})), async (req, res) => {
    try {
      const userId = (req.user as any).id;
      await storage.updateUserSubscription(userId, 'free', null);
      res.json({ success: true });
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      res.status(500).json({ error: 'Failed to cancel subscription' });
    }
  });

  // Article view tracking endpoints
  app.post("/api/article/view", validateRequest(articleViewTrackingSchema), async (req, res) => {
    try {
      const { articleId, articleTitle, articleSource, articleUrl } = req.body;
      const userId = req.user?.id || null;
      
      if (!articleId || !articleTitle) {
        return res.status(400).json({ error: 'Article ID and title are required' });
      }
      
      await storage.trackArticleView({
        articleId,
        articleTitle,
        articleSource: articleSource || null,
        articleUrl: articleUrl || null,
        userId,
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error tracking article view:', error);
      res.status(500).json({ error: 'Failed to track article view' });
    }
  });

  app.get("/api/article/most-viewed", validateRequest(mostViewedSchema, 'query'), async (req, res) => {
    try {
      const limit = (req.query.limit as number) || 10;
      const mostViewed = await storage.getMostViewedArticles(limit);
      res.json(mostViewed);
    } catch (error) {
      console.error('Error fetching most viewed articles:', error);
      res.status(500).json({ error: 'Failed to fetch most viewed articles' });
    }
  });

  // Claude API routes
  app.post("/api/claude/synthesize", isAuthenticated, validateRequest(synthesizeSchema), async (req, res) => {
    await synthesizeArticles(req, res);
  });

  app.post("/api/claude/edit", isAuthenticated, validateRequest(editArticleSchema), async (req, res) => {
    await editArticle(req, res);
  });

  app.post("/api/claude/titles", isAuthenticated, validateRequest(claudeTitlesSchema), async (req, res) => {
    await generateTitles(req, res);
  });

  app.post("/api/claude/quality", isAuthenticated, validateRequest(claudeQualitySchema), async (req, res) => {
    await analyzeQuality(req, res);
  });

  // Mistral API routes
  app.post("/api/mistral/synthesize", isAuthenticated, validateRequest(mistralSynthesizeSchema), async (req, res) => {
    try {
      const { topic, style, urls, maxWords, model } = req.body;
      
      if (!process.env.MISTRAL_API_KEY) {
        return res.status(400).json({ error: "Mistral API key not configured" });
      }
      
      const { generateSynthesis } = await import('./mistralPipeline');
      const result = await generateSynthesis({
        topic,
        style,
        urls,
        maxWords,
        model
      });
      
      res.json(result);
    } catch (error: any) {
      console.error("Mistral synthesis error:", error);
      res.status(500).json({ error: "Failed to synthesize articles with Mistral" });
    }
  });

  app.post("/api/mistral/edit", isAuthenticated, validateRequest(mistralEditSchema), async (req, res) => {
    try {
      const { article, title, instructions, model } = req.body;
      
      if (!process.env.MISTRAL_API_KEY) {
        return res.status(400).json({ error: "Mistral API key not configured" });
      }
      
      const { Mistral } = await import('@mistralai/mistralai');
      const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });
      
      const prompt = `You are an expert article editor. Edit the following article according to the user's instructions.

Original Article:
Title: ${title}
Content: ${article}

User Instructions: ${instructions}

Please provide the edited article with improved content according to the instructions. Maintain quality and factual accuracy.`;

      const response = await client.chat.complete({
        model: model || "mistral-small-latest",
        messages: [
          { role: "system", content: "You are an expert article editor and writer." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
      });

      const editedContent = response.choices[0].message.content;
      
      // Extract title if present
      const lines = typeof editedContent === 'string' ? editedContent.split('\n') : [];
      const firstLine = lines[0].trim();
      let editedTitle = title;
      let content = editedContent;
      
      if (firstLine.startsWith('#') || (firstLine.length < 100 && lines.length > 1)) {
        editedTitle = firstLine.replace(/^#+\s*/, '');
        content = lines.slice(1).join('\n').trim();
      }
      
      res.json({
        editedContent: content,
        editedTitle
      });
      
    } catch (error: any) {
      console.error("Mistral edit error:", error);
      res.status(500).json({ error: "Failed to edit article with Mistral" });
    }
  });

  // OpenAI/ChatGPT API routes
  app.post("/api/openai/synthesize", isAuthenticated, validateRequest(synthesizeSchema), async (req, res) => {
    try {
      const { sources, topic, style, tone, length } = req.body;
      
      if (!sources || !topic) {
        return res.status(400).json({ error: "Sources and topic are required" });
      }
      
      if (!process.env.OPENAI_API_KEY) {
        return res.status(400).json({ error: "OpenAI API key not configured" });
      }
      
      const OpenAI = (await import('openai')).default;
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      
      // Analyze topic similarity first
      const sourcesText = sources.map((source: any, index: number) => 
        `Source ${index + 1}: ${source.content.substring(0, 300)}...\nFrom: ${source.source}\n`
      ).join('\n---\n');
      
      const topicAnalysis = sources.length >= 2 ? await (async () => {
        try {
          const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
              { role: 'system', content: 'You are an expert content analyst. Always respond with valid JSON.' },
              { role: 'user', content: `Analyze these sources to determine if they cover the same topic and identify key themes, perspectives, and conflicting points.\n\nSources:\n${sourcesText}\n\nReturn a JSON object with:\n- isCommonTopic: boolean (true if 2+ sources cover the same main topic)\n- keyThemes: array of main themes/subjects covered\n- perspectives: array of different viewpoints or approaches\n- conflictingPoints: array of contradictory facts or opinions between sources\n\nFocus on factual analysis, not just surface-level similarities.` }
            ],
            temperature: 0.3,
            max_tokens: 500
          });
          
          return JSON.parse(response.choices[0].message.content || '{}');
        } catch {
          return { isCommonTopic: false, keyThemes: [], perspectives: [], conflictingPoints: [] };
        }
      })() : { isCommonTopic: false, keyThemes: [], perspectives: [], conflictingPoints: [] };
      
      // Build synthesis prompt
      const fullSourcesText = sources.map((source: any, index: number) => 
        `Source ${index + 1}: ${source.content.substring(0, 800)}...\nFrom: ${source.source}\n`
      ).join('\n---\n');
      
      const wordCountRanges: any = {
        short: { min: 300, max: 600, target: 450 },
        medium: { min: 700, max: 1200, target: 950 },
        long: { min: 1500, max: Infinity, target: 2000 }
      };
      const targetWordCount = wordCountRanges[length || 'medium']?.target || 950;
      
      let prompt = topicAnalysis.isCommonTopic && sources.length >= 2 ?
        `You are an expert article writer specializing in comparative analysis. Multiple sources cover the same topic "${topic}". Create a comprehensive ${length} article that COMPARES AND CONTRASTS these sources rather than simply combining them.

SYNTHESIS APPROACH:
1. IDENTIFY COMMON GROUND: What facts, findings, or viewpoints do multiple sources agree on?
2. HIGHLIGHT DIFFERENCES: Where do sources disagree, offer different perspectives, or present conflicting information?
3. ANALYZE CONTRADICTIONS: When sources conflict, present both sides fairly and note the disagreement
4. SYNTHESIZE INSIGHTS: Draw connections between different sources' approaches to the same topic
5. PROVIDE BALANCED PERSPECTIVE: Don't favor one source over another - integrate all viewpoints
6. WRITE DETAILED IDEAS: Include specific concepts, findings, data points, and arguments from the sources - don't just summarize, elaborate on the ideas

Key Themes Identified: ${topicAnalysis.keyThemes.join(', ')}
Different Perspectives: ${topicAnalysis.perspectives.join(', ')}
Conflicting Points: ${topicAnalysis.conflictingPoints.join(', ')}

🚫 CRITICAL - TITLE RULES (ABSOLUTE REQUIREMENT):
- FORBIDDEN: Do NOT mention "${topic}" ANYWHERE in the article body text
- FORBIDDEN: Do NOT use "this article", "in this piece", "this story", "the article", "here we"
- FORBIDDEN: Do NOT start sentences with "The ${topic}...", "${topic} reveals...", "${topic} explores...", "${topic} examines..."
- FORBIDDEN: Do NOT write "${topic} shows", "${topic} suggests", "${topic} indicates"
- FORBIDDEN: Do NOT reference the title in ANY way - pretend it doesn't exist
- REQUIRED: Dive straight into the subject matter without meta-references
- REQUIRED: Write as a standalone piece of journalism about the SUBJECT, not about "an article"

Sources:
${fullSourcesText}

Requirements:
- Write in ${style} style with ${tone} tone
- Target length: EXACTLY ${targetWordCount} words
- CREATE COMPARATIVE ANALYSIS, not separate paragraphs for each source
- Include SEO-friendly keywords and fact-checking insights` :
        `You are an expert article writer. Synthesize the following sources into a cohesive ${length} article about "${topic}" in ${style} style with a ${tone} tone.

🚫 CRITICAL - TITLE RULES (ABSOLUTE REQUIREMENT):
- FORBIDDEN: Do NOT mention "${topic}" ANYWHERE in the article body text
- FORBIDDEN: Do NOT use "this article", "in this piece", "this story", "the article", "here we"
- FORBIDDEN: Do NOT start sentences with "The ${topic}...", "${topic} reveals...", "${topic} explores...", "${topic} examines..."
- FORBIDDEN: Do NOT write "${topic} shows", "${topic} suggests", "${topic} indicates"
- FORBIDDEN: Do NOT reference the title in ANY way - pretend it doesn't exist
- REQUIRED: Dive straight into the subject matter without meta-references
- REQUIRED: Write as a standalone piece of journalism about the SUBJECT, not about "an article"

Sources:
${fullSourcesText}

Requirements:
- Write in ${style} style with ${tone} tone
- Target length: EXACTLY ${targetWordCount} words
- Write DETAILED content - elaborate on ideas, don't just list them`;
      
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are an expert article writer and synthesizer.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: length === 'short' ? 800 : length === 'medium' ? 1500 : 2500
      });
      
      const content = response.choices[0].message.content || '';
      const lines = content.split('\n');
      const title = lines[0].replace(/^#\s*/, '') || `${topic}: A Comprehensive Analysis`;
      const articleContent = lines.slice(1).join('\n').trim();
      
      res.json({
        id: Date.now().toString(),
        title,
        content: articleContent,
        summary: articleContent.substring(0, 200) + '...',
        wordCount: articleContent.split(/\s+/).length,
        readingTime: Math.ceil(articleContent.split(/\s+/).length / 200),
        style
      });
    } catch (error: any) {
      console.error("OpenAI synthesis error:", error);
      res.status(500).json({ error: "Failed to synthesize articles with OpenAI" });
    }
  });

  app.post("/api/openai/edit", isAuthenticated, validateRequest(z.object({
    article: z.object({
      title: z.string().max(500),
      content: z.string().max(100000)
    }),
    instructions: z.string().min(1).max(1000).trim()
  })), async (req, res) => {
    try {
      const { article, instructions } = req.body;
      
      if (!process.env.OPENAI_API_KEY) {
        return res.status(400).json({ error: "OpenAI API key not configured" });
      }
      
      const OpenAI = (await import('openai')).default;
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      
      const prompt = `You are an expert article editor. Please edit the following article according to the user's instructions.

Original Article:
Title: ${article.title}
Content: ${article.content}

User Instructions: ${instructions}

🚫 CRITICAL - TITLE RULES (ABSOLUTE REQUIREMENT):
- FORBIDDEN: Do NOT mention "${article.title}" ANYWHERE in the edited article body
- FORBIDDEN: Do NOT use "this article", "in this piece", "this story", "the article", "here we"
- FORBIDDEN: Do NOT start sentences with "The ${article.title}...", "${article.title} reveals...", etc.
- FORBIDDEN: Do NOT reference the title in ANY way - pretend it doesn't exist
- REQUIRED: Focus on the subject matter directly without meta-references

Please provide the edited article with the same structure but improved according to the instructions.`;
      
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are an expert article editor and writer.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000
      });
      
      const editedContent = response.choices[0].message.content || '';
      
      res.json({
        content: editedContent,
        wordCount: editedContent.split(/\s+/).length,
        readingTime: Math.ceil(editedContent.split(/\s+/).length / 200)
      });
    } catch (error: any) {
      console.error("OpenAI edit error:", error);
      res.status(500).json({ error: "Failed to edit article with OpenAI" });
    }
  });

  app.post("/api/openai/generate-viral", isAuthenticated, validateRequest(viralGenerateSchema), async (req, res) => {
    try {
      const { searchTerm, count = 5 } = req.body;
      
      if (!process.env.OPENAI_API_KEY) {
        return res.status(400).json({ error: "OpenAI API key not configured" });
      }
      
      const OpenAI = (await import('openai')).default;
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      
      const viralPrompts = [
        `Create a viral news article about ${searchTerm} that would trending on social media. Focus on breaking news or shocking discoveries.`,
        `Write a viral analysis piece about ${searchTerm} that experts are talking about. Include surprising statistics or insights.`,
        `Generate a viral story about ${searchTerm} that people are sharing everywhere. Focus on human interest or emotional impact.`,
        `Create a viral investigation about ${searchTerm} that reveals something unexpected. Include exclusive details.`,
        `Write a viral opinion piece about ${searchTerm} that's causing debate. Include controversial but well-reasoned arguments.`
      ];
      
      const articles = [];
      
      for (let i = 0; i < Math.min(count, viralPrompts.length); i++) {
        try {
          const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
              {
                role: 'system',
                content: `You are a viral content creator. Create compelling, engaging articles that people want to share. Return your response in JSON format with exactly this structure:
{
  "title": "Compelling headline that hooks readers",
  "content": "Full article content (500-800 words)",
  "description": "Brief description (100-150 words)",
  "category": "news/technology/entertainment/business/health/sports/politics",
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "viralScore": 85
}`
              },
              { role: 'user', content: viralPrompts[i] }
            ],
            temperature: 0.8,
            max_tokens: 1500,
            response_format: { type: "json_object" }
          });
          
          const aiResponse = JSON.parse(response.choices[0].message.content || '{}');
          
          articles.push({
            id: `ai-viral-${Date.now()}-${i}`,
            title: aiResponse.title,
            content: aiResponse.content,
            source: 'AI News Network',
            url: `https://ai-news.com/viral/${searchTerm.toLowerCase().replace(/\s+/g, '-')}-${i}`,
            publishedAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
            category: aiResponse.category || 'general',
            description: aiResponse.description,
            keywords: aiResponse.keywords || [searchTerm],
            viralScore: aiResponse.viralScore || 75,
            trending: true,
            estimatedReads: Math.floor(Math.random() * 500000) + 50000
          });
        } catch (error) {
          console.error(`Error generating viral article ${i}:`, error);
        }
      }
      
      res.json({ articles });
    } catch (error: any) {
      console.error("OpenAI viral generation error:", error);
      res.status(500).json({ error: "Failed to generate viral articles with OpenAI" });
    }
  });

  // Gemini Search API route
  app.post("/api/gemini/search", isAuthenticated, validateRequest(geminiSearchSchema), async (req, res) => {
    try {
      const { query, config } = req.body;
      
      if (!query) {
        return res.status(400).json({ error: "Query is required" });
      }
      
      if (!process.env.GEMINI_API_KEY) {
        return res.status(400).json({ error: "Gemini API key not configured" });
      }
      
      const { GoogleGenAI } = await import("@google/genai");
      const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const model = genAI.getGenerativeModel({ 
        model: config?.model || "gemini-2.0-flash-exp"
      });
      
      const searchPrompt = `You are an expert research assistant. Search for comprehensive information about: "${query}"

Search Requirements:
- Find ${config?.maxResults || 10} most relevant and recent results
- Include news articles, authoritative sources, and expert analysis
- Depth level: ${config?.searchDepth || 'comprehensive'}
- Filter for relevance: ${config?.filterRelevance !== false}
- Include analysis: ${config?.includeAnalysis !== false}

For each result, provide:
1. Title (clear and descriptive)
2. URL (if available)
3. Snippet (2-3 sentences summary)
4. Relevance score (0-100)
5. Source credibility (news outlet, organization, etc.)
6. Published date (if available)
7. Category (news, analysis, opinion, etc.)

Also provide:
- Overall summary of findings
- 3-5 related search queries
- Confidence level in search results (0-100)

Format response as JSON with this structure:
{
  "results": [
    {
      "title": "string",
      "url": "string",
      "snippet": "string",
      "relevanceScore": number,
      "source": "string",
      "publishedDate": "string",
      "category": "string"
    }
  ],
  "summary": "string",
  "relatedQueries": ["string"],
  "totalResults": number,
  "confidence": number
}`;
      
      const startTime = Date.now();
      const result = await model.generateContent(searchPrompt);
      const response = result.response;
      const searchTime = Date.now() - startTime;
      
      const searchResults = JSON.parse(response.text());
      
      res.json({
        ...searchResults,
        searchTime
      });
    } catch (error: any) {
      console.error("Gemini search error:", error);
      res.status(500).json({ error: "Failed to search with Gemini" });
    }
  });

  // AI Image Generation endpoint
  app.post("/api/generate-image", isAuthenticated, validateRequest(imageGenSchema), async (req, res) => {
    try {
      const { articleTitle, articleContent, style } = req.body;
      
      if (!articleTitle || !articleContent) {
        return res.status(400).json({ error: "Article title and content required" });
      }
      
      if (!process.env.OPENAI_API_KEY) {
        return res.status(400).json({ error: "OpenAI API key not configured" });
      }
      
      const validStyles = ['realistic', 'artistic', 'minimalist', 'abstract', 'photographic', 'illustration'];
      const imageStyle = validStyles.includes(style) ? style : 'photographic';
      
      console.log(`Generating AI image for article: "${articleTitle.substring(0, 50)}..."`);
      
      const result = await generateArticleImage(articleTitle, articleContent, imageStyle as any);
      
      res.json({
        success: true,
        imageUrl: result.url,
        revisedPrompt: result.revisedPrompt
      });
      
    } catch (error: any) {
      console.error("Image generation error:", error);
      res.status(500).json({ 
        error: "Failed to generate image",
        message: error.message 
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
