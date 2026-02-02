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

// 2. Daily Logs - The "Feed" for the AI
export const dailyLogs = pgTable("daily_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  // Yahan hum clerkId use kar rahe hain linking ke liye as per instructions
  userId: text("user_id").notNull(), 
  type: text("type").notNull(), // 'fitness', 'tech', 'task', 'meeting'
  
  // Storing flexible data as JSONB
  content: jsonb("content").notNull(), 
  
  mood: text("mood"), // 🔥, 😐, 😵
  energyLevel: integer("energy_level"), // 1-10
  
  date: timestamp("date").defaultNow(),
});