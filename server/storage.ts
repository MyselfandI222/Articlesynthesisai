import {
  users,
  affiliateLinks,
  referralRewards,
  articleViews,
  type User,
  type InsertUser,
  type AffiliateLink,
  type ReferralReward,
  type ArticleView,
  type InsertArticleView,
} from "@shared/schema";
import { db } from "./db";
import { eq, sql } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

// Interface for storage operations
export interface IStorage {
  // User operations for local authentication
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User>;
  
  // Affiliate operations
  generateAffiliateCode(userId: number): Promise<string>;
  getAffiliateByCode(code: string): Promise<AffiliateLink | undefined>;
  trackAffiliateClick(code: string): Promise<void>;
  trackAffiliateConversion(code: string, referredUserId: number): Promise<void>;
  getUserReferrals(userId: number): Promise<User[]>;
  createReferralReward(referrerId: number, referredUserId: number, rewardType: string, rewardAmount: number): Promise<ReferralReward>;
  getUserRewards(userId: number): Promise<ReferralReward[]>;
  
  // Subscription management
  updateUserSubscription(userId: number, tier: string, paymentDetails: any): Promise<void>;
  
  // Article view tracking
  trackArticleView(articleView: InsertArticleView): Promise<void>;
  getMostViewedArticles(limit?: number): Promise<Array<{articleId: string, articleTitle: string, articleSource: string | null, articleUrl: string | null, viewCount: number}>>;
  
  sessionStore: session.Store;
}

const PostgresSessionStore = connectPg(session);

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: false,
      tableName: 'sessions'
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    // Generate a unique ID and affiliate code
    const id = Math.floor(Math.random() * 1000000) + 1;
    const affiliateCode = `REF${id}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    
    const [user] = await db
      .insert(users)
      .values({ ...userData, id, affiliateCode })
      .returning();
    
    // Create affiliate link entry
    await db.insert(affiliateLinks).values({
      id: Math.floor(Math.random() * 1000000) + 1,
      userId: user.id,
      affiliateCode: affiliateCode,
    });
    
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async generateAffiliateCode(userId: number): Promise<string> {
    const user = await this.getUser(userId);
    if (!user) throw new Error('User not found');
    
    if (user.affiliateCode) {
      return user.affiliateCode;
    }
    
    const affiliateCode = `REF${userId}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    await this.updateUser(userId, { affiliateCode });
    
    // Create affiliate link entry if not exists
    const existing = await db.select().from(affiliateLinks).where(eq(affiliateLinks.userId, userId));
    if (existing.length === 0) {
      await db.insert(affiliateLinks).values({
        id: Math.floor(Math.random() * 1000000) + 1,
        userId: userId,
        affiliateCode: affiliateCode,
      });
    }
    
    return affiliateCode;
  }

  async getAffiliateByCode(code: string): Promise<AffiliateLink | undefined> {
    const [affiliate] = await db.select().from(affiliateLinks).where(eq(affiliateLinks.affiliateCode, code));
    return affiliate;
  }

  async trackAffiliateClick(code: string): Promise<void> {
    await db
      .update(affiliateLinks)
      .set({ clickCount: sql`${affiliateLinks.clickCount} + 1` })
      .where(eq(affiliateLinks.affiliateCode, code));
  }

  async trackAffiliateConversion(code: string, referredUserId: number): Promise<void> {
    const affiliate = await this.getAffiliateByCode(code);
    if (!affiliate) return;

    // Update referrer's user record
    await db
      .update(users)
      .set({ totalReferrals: sql`${users.totalReferrals} + 1` })
      .where(eq(users.id, affiliate.userId));

    // Update referred user's record
    await this.updateUser(referredUserId, { referredBy: affiliate.userId });

    // Update affiliate link stats
    await db
      .update(affiliateLinks)
      .set({ conversions: sql`${affiliateLinks.conversions} + 1` })
      .where(eq(affiliateLinks.affiliateCode, code));

    // Create referral reward (20% discount for referrer)
    await this.createReferralReward(affiliate.userId, referredUserId, 'discount', 20);
  }

  async getUserReferrals(userId: number): Promise<User[]> {
    const referrals = await db.select().from(users).where(eq(users.referredBy, userId));
    return referrals;
  }

  async createReferralReward(referrerId: number, referredUserId: number, rewardType: string, rewardAmount: number): Promise<ReferralReward> {
    const [reward] = await db
      .insert(referralRewards)
      .values({
        id: Math.floor(Math.random() * 1000000) + 1,
        referrerId,
        referredUserId,
        rewardType,
        rewardAmount,
      })
      .returning();
    return reward;
  }

  async getUserRewards(userId: number): Promise<ReferralReward[]> {
    const rewards = await db.select().from(referralRewards).where(eq(referralRewards.referrerId, userId));
    return rewards;
  }
  
  async updateUserSubscription(userId: number, tier: string, paymentDetails: any): Promise<void> {
    await db
      .update(users)
      .set({ 
        subscriptionStatus: tier,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
  }
  
  async trackArticleView(articleView: InsertArticleView): Promise<void> {
    await db.insert(articleViews).values({
      ...articleView,
    });
  }
  
  async getMostViewedArticles(limit: number = 10): Promise<Array<{articleId: string, articleTitle: string, articleSource: string | null, articleUrl: string | null, viewCount: number}>> {
    // Get articles viewed in the last month, grouped by articleId with count
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    const results = await db
      .select({
        articleId: articleViews.articleId,
        articleTitle: articleViews.articleTitle,
        articleSource: articleViews.articleSource,
        articleUrl: articleViews.articleUrl,
        viewCount: sql<number>`count(*)::int`,
      })
      .from(articleViews)
      .where(sql`${articleViews.viewedAt} >= ${oneMonthAgo}`)
      .groupBy(articleViews.articleId, articleViews.articleTitle, articleViews.articleSource, articleViews.articleUrl)
      .orderBy(sql`count(*) DESC`)
      .limit(limit);
    
    return results;
  }
}

export const storage = new DatabaseStorage();