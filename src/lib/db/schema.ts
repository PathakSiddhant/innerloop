import { pgTable, text, uuid, timestamp, integer, jsonb } from "drizzle-orm/pg-core";

// 1. User Table - Core identity & AI Persona
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkId: text("clerk_id").unique().notNull(),
  email: text("email").notNull(),
  name: text("name"),
  imageUrl: text("image_url"),
  
  // AI Personalization
  personaMode: text("persona_mode").default("coach"), // coach, commander, roast
  focusArea: text("focus_area").default("both"), // body, career, both
  
  createdAt: timestamp("created_at").defaultNow(),
});

// 2. Daily Logs - The "Feed" for the AI (Updated as per instructions)
export const dailyLogs = pgTable("daily_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  // ClerkId linking ke liye
  userId: text("user_id").notNull(), 
  
  // Type mein ab 'diet' aur 'health' bhi include honge as per instructions
  type: text("type").notNull(), // 'fitness', 'diet', 'health', 'tech', 'task', 'meeting'
  
  // Flexible data like steps aur target_water isi content (JSONB) mein jayenge
  content: jsonb("content").notNull(), 
  
  mood: text("mood"), // 🔥, 😐, 😵
  energyLevel: integer("energy_level"), // 1-10
  
  date: timestamp("date").defaultNow(),
});