import { pgTable, text, integer, boolean, jsonb, real, uuid, timestamp } from "drizzle-orm/pg-core";

// --- TYPES FOR JSON COLUMNS ---
export interface Set { 
  id: string; 
  weight: number; 
  reps: number; 
  completed: boolean; 
}

export interface Exercise { 
  id: string; 
  name: string; 
  sets: Set[]; 
  isCollapsed: boolean; 
}

export interface WorkoutSession { 
  id: string; 
  name: string; 
  startTime: number; 
  endTime: number | null; 
  exercises: Exercise[]; 
}

export interface FoodItem { 
  id: string; 
  name: string; 
  cals: number; 
  p: number; 
  c: number; 
  f: number; 
}

// 1. User Table (Existing Identity)
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkId: text("clerk_id").unique().notNull(),
  email: text("email").notNull(),
  name: text("name"),
  imageUrl: text("image_url"),
  
  personaMode: text("persona_mode").default("coach"), 
  focusArea: text("focus_area").default("both"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// 2. FITNESS DAYS TABLE
export const fitnessDays = pgTable("fitness_days", {
  id: uuid("id").primaryKey().defaultRandom(),
  
  userId: text("user_id").notNull(), 
  date: text("date").notNull(),

  // Simple Data
  isRestDay: boolean("is_rest_day").default(false).notNull(),
  waterGoal: integer("water_goal").default(3000).notNull(),
  waterIntake: integer("water_intake").default(0).notNull(),
  stepGoal: integer("step_goal").default(10000).notNull(),
  stepCount: integer("step_count").default(0).notNull(),
  bodyWeight: real("body_weight"),
  targetWeight: real("target_weight").default(75),

  // Complex Data (Type-Safe JSONB)
  sessions: jsonb("sessions").$type<WorkoutSession[]>().default([]).notNull(),
  meals: jsonb("meals").$type<FoodItem[]>().default([]).notNull(),
  
  macroGoal: jsonb("macro_goal").$type<{
    cals: number; p: number; c: number; f: number
  }>().default({ cals: 2500, p: 180, c: 250, f: 70 }).notNull(),

  updatedAt: timestamp("updated_at").defaultNow(),
});

// 3. PROJECTS TABLE
export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  vision: text("vision"),
  status: text("status").default("building"), // building, shipped, dropped
  techStack: jsonb("tech_stack").$type<string[]>().default([]).notNull(),
  complexityScore: integer("complexity_score").default(1),
  revenuePotential: integer("revenue_potential").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// 4. IDEA VAULT TABLE
export const ideas = pgTable("ideas", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  problem: text("problem").notNull(),
  audience: text("audience"),
  solution: text("solution"),
  differentiation: text("differentiation"),
  isValidated: boolean("is_validated").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// 5. DAILY DEV LOGS
export const devLogs = pgTable("dev_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  projectId: uuid("project_id").references(() => projects.id),
  date: text("date").notNull(), // YYYY-MM-DD
  tasksCompleted: jsonb("tasks_completed").$type<string[]>().default([]).notNull(),
  blockers: text("blockers"),
  energyLevel: integer("energy_level"), // 1-10 (flow state index)
  commitCount: integer("commit_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});