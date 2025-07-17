import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./auth";
import { createPaypalOrder, capturePaypalOrder, loadPaypalDefault } from "./paypal";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  setupAuth(app);
  // NewsAPI proxy endpoint to bypass CORS restrictions
  app.get('/api/news/search', async (req, res) => {
    try {
      const query = req.query.q as string;
      const apiKey = process.env.VITE_NEWS_API_KEY;
      
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
  app.post('/api/debug/create-user', async (req, res) => {
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
      const { scrypt, randomBytes } = require('crypto');
      const { promisify } = require('util');
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
  app.post("/api/affiliate/click", async (req, res) => {
    try {
      const { code } = req.body;
      if (!code) return res.status(400).json({ error: "Affiliate code required" });
      
      await storage.trackAffiliateClick(code);
      res.json({ success: true });
    } catch (error) {
      console.error('Error tracking affiliate click:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Handle affiliate signup
  app.post("/api/affiliate/signup", async (req, res) => {
    try {
      const { code, userId } = req.body;
      if (!code || !userId) return res.status(400).json({ error: "Code and user ID required" });
      
      await storage.trackAffiliateConversion(code, userId);
      res.json({ success: true });
    } catch (error) {
      console.error('Error tracking affiliate conversion:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Short link redirect
  app.get("/ref/:code", async (req, res) => {
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

  app.post("/api/paypal/order", async (req, res) => {
    // Request body should contain: { intent, amount, currency }
    await createPaypalOrder(req, res);
  });

  app.post("/api/paypal/order/:orderID/capture", async (req, res) => {
    await capturePaypalOrder(req, res);
  });

  // Premium subscription endpoints
  app.post("/api/subscribe", isAuthenticated, async (req, res) => {
    try {
      const { tier, paymentDetails } = req.body;
      const userId = (req.user as any).id;
      
      // Validate tier
      if (!['pro-monthly', 'pro-lifetime'].includes(tier)) {
        return res.status(400).json({ error: 'Invalid subscription tier' });
      }
      
      // Update user subscription
      await storage.updateUserSubscription(userId, tier, paymentDetails);
      
      res.json({ success: true, tier });
    } catch (error) {
      console.error('Error creating subscription:', error);
      res.status(500).json({ error: 'Failed to create subscription' });
    }
  });

  app.post("/api/cancel-subscription", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      await storage.updateUserSubscription(userId, 'free', null);
      res.json({ success: true });
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      res.status(500).json({ error: 'Failed to cancel subscription' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
