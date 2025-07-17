import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./auth";

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

  // Protected route example
  app.get("/api/protected", isAuthenticated, async (req, res) => {
    const userId = req.user?.id;
    res.json({ message: "This is a protected route", userId });
  });

  const httpServer = createServer(app);

  return httpServer;
}
