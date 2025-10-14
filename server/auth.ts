import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || 'your-secret-key-here',
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: false,
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        console.log('Login attempt for username:', username);
        const user = await storage.getUserByUsername(username);
        console.log('User found:', user ? 'Yes' : 'No');
        if (!user) {
          console.log('No user found with username:', username);
          return done(null, false);
        }
        const passwordMatch = await comparePasswords(password, user.password);
        console.log('Password match:', passwordMatch);
        if (!passwordMatch) {
          console.log('Password mismatch for user:', username);
          return done(null, false);
        }
        console.log('Login successful for user:', username);
        return done(null, user);
      } catch (error) {
        console.error('Login error:', error);
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => {
    console.log('🔵 serializeUser called with user:', user.id);
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id: number, done) => {
    try {
      console.log('🟢 deserializeUser called with id:', id);
      const user = await storage.getUser(id);
      console.log('🟢 deserializeUser found user:', user ? user.username : 'null');
      done(null, user);
    } catch (error) {
      console.error('🔴 deserializeUser error:', error);
      done(error);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const { username, password, email, firstName, lastName, referralCode } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
      }

      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }

      const user = await storage.createUser({
        username,
        email,
        password: await hashPassword(password),
        firstName,
        lastName,
      });

      // Handle referral code if provided
      if (referralCode) {
        try {
          await storage.trackAffiliateConversion(referralCode, user.id);
        } catch (error) {
          console.error("Error tracking referral:", error);
          // Continue with registration even if referral tracking fails
        }
      }

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json({ 
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profileImageUrl: user.profileImageUrl,
          subscriptionStatus: user.subscriptionStatus,
          affiliateCode: user.affiliateCode,
        });
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  app.post("/api/login", passport.authenticate("local"), (req, res) => {
    const user = req.user as SelectUser;
    
    // Explicitly save session before sending response
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.status(500).json({ error: 'Failed to save session' });
      }
      
      console.log('Session saved successfully. Session ID:', req.sessionID);
      console.log('Session data after save:', req.session);
      
      res.status(200).json({
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
        subscriptionStatus: user.subscriptionStatus,
        affiliateCode: user.affiliateCode,
      });
    });
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    console.log('GET /api/user - Session ID:', req.sessionID);
    console.log('GET /api/user - Session data:', req.session);
    console.log('GET /api/user - Is authenticated:', req.isAuthenticated());
    console.log('GET /api/user - User:', req.user);
    
    if (!req.isAuthenticated()) {
      console.log('Not authenticated - returning 401');
      return res.sendStatus(401);
    }
    const user = req.user as SelectUser;
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImageUrl: user.profileImageUrl,
      subscriptionStatus: user.subscriptionStatus,
      affiliateCode: user.affiliateCode,
      totalReferrals: user.totalReferrals,
    });
  });
}

export function isAuthenticated(req: any, res: any, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
}