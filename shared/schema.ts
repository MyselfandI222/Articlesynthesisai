import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  integer,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for local authentication
export const users = pgTable("users", {
  id: integer("id").primaryKey(),
  username: varchar("username").unique().notNull(),
  email: varchar("email").unique(),
  password: varchar("password").notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  subscriptionStatus: varchar("subscription_status").default("free"), // free, pro
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  affiliateCode: varchar("affiliate_code").unique(), // unique code for each user
  referredBy: integer("referred_by"), // user ID who referred this user
  totalReferrals: integer("total_referrals").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Affiliate tracking table
export const affiliateLinks = pgTable("affiliate_links", {
  id: integer("id").primaryKey(),
  userId: integer("user_id").notNull(),
  affiliateCode: varchar("affiliate_code").notNull(),
  clickCount: integer("click_count").default(0),
  conversions: integer("conversions").default(0),
  totalEarnings: integer("total_earnings").default(0), // in cents
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Referral rewards table
export const referralRewards = pgTable("referral_rewards", {
  id: integer("id").primaryKey(),
  referrerId: integer("referrer_id").notNull(),
  referredUserId: integer("referred_user_id").notNull(),
  rewardType: varchar("reward_type").notNull(), // discount, credit, cash
  rewardAmount: integer("reward_amount").notNull(), // in cents or percentage
  status: varchar("status").default("pending"), // pending, applied, expired
  createdAt: timestamp("created_at").defaultNow(),
  appliedAt: timestamp("applied_at"),
});

export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
  affiliateCode: true,
  totalReferrals: true,
});

export const insertAffiliateLinkSchema = createInsertSchema(affiliateLinks).omit({
  createdAt: true,
  updatedAt: true,
  clickCount: true,
  conversions: true,
  totalEarnings: true,
});

export const insertReferralRewardSchema = createInsertSchema(referralRewards).omit({
  createdAt: true,
  appliedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type AffiliateLink = typeof affiliateLinks.$inferSelect;
export type ReferralReward = typeof referralRewards.$inferSelect;
