"use server";

import { db } from "@/lib/db";
import { sportsMatches, tasks } from "@/lib/db/schema";
import { eq, and, asc, gte } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

export interface MatchData {
  id?: string;
  sport: string;
  title: string;
  tournament?: string;
  platform?: string;
  date: string;
  time: string;
  duration: number; // minutes
  aiIntel?: string;
  conflictTask?: string | null; 
}

// Helper: Convert "14:30" to minutes (870)
const getMinutes = (timeStr: string) => {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
};

// 1. GET MATCHES (WITH PRECISE TIME CONFLICT CHECK)
export async function getMatches() {
  const { userId } = await auth();
  if (!userId) return [];
  
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // 1. Get Matches (Future Only)
    const matches = await db.select().from(sportsMatches)
      .where(and(eq(sportsMatches.userId, userId), gte(sportsMatches.date, today)))
      .orderBy(asc(sportsMatches.date), asc(sportsMatches.time));

    // 2. Get Potential Task Conflicts
    const taskList = await db.select().from(tasks).where(eq(tasks.userId, userId));

    // 3. Precise Collision Detection
    const enrichedMatches = matches.map(match => {
        const matchStart = getMinutes(match.time);
        const matchEnd = matchStart + (match.duration || 180);

        // Find specific clash
        const clash = taskList.find(t => {
            // Must be same date
            if (t.date !== match.date) return false;
            
            // Must be 'fixed' type task (Flexible tasks can move)
            if (t.taskType !== 'fixed') return false; 
            
            // Must overlap in time
            const taskStart = getMinutes(t.startTime || "00:00");
            const taskEnd = taskStart + (t.duration || 30);

            // Overlap formula: (StartA < EndB) and (EndA > StartB)
            return (matchStart < taskEnd && matchEnd > taskStart);
        });
        
        return {
            ...match,
            conflictTask: clash ? clash.title : null
        };
    });

    return enrichedMatches;
  } catch (e) { return []; }
}

// 2. UPSERT MATCH
export async function upsertMatch(data: MatchData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  try {
    if (data.id) {
      await db.update(sportsMatches).set({ ...data }).where(eq(sportsMatches.id, data.id));
    } else {
      await db.insert(sportsMatches).values({ userId, ...data });
    }
    revalidatePath("/sports");
    return { success: true };
  } catch (e) { return { success: false }; }
}

// 3. DELETE
export async function deleteMatch(id: string) {
  const { userId } = await auth();
  if (!userId) return;
  await db.delete(sportsMatches).where(eq(sportsMatches.id, id));
  revalidatePath("/sports");
}

// 4. AI PUNDIT
export async function generateMatchIntel(title: string, sport: string) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const prompt = `
        Sports Analyst Mode. Match: "${title}" (${sport}).
        Write ONE hyped sentence about the key battle.
        Return JSON: { "intel": "string" }
        `;
        const result = await model.generateContent(prompt);
        return JSON.parse(result.response.text().replace(/```json|```/g, "").trim());
    } catch {
        return { intel: "High stakes game!" };
    }
}