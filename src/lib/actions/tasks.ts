"use server";

import { db } from "@/lib/db";
import { tasks } from "@/lib/db/schema";
import { eq, and, asc, desc } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

export interface TaskData {
  id?: string;
  title: string;
  description?: string;
  category: "work" | "personal" | "health" | "learning";
  priority: "low" | "medium" | "high" | "urgent";
  energy: "low" | "medium" | "high";
  
  // New Fields for V3
  taskType: "fixed" | "flexible";
  startTime?: string; // e.g. "09:00"
  duration: number;
  progress: number; // 0-100
  
  date: string;
  status?: "pending" | "in-progress" | "completed" | "skipped";
  skippedReason?: string;
}

// 1. GET TASKS
export async function getDailyTasks(dateStr: string) {
  const { userId } = await auth();
  if (!userId) return [];
  try {
    return await db.select().from(tasks)
      .where(and(eq(tasks.userId, userId), eq(tasks.date, dateStr)))
      .orderBy(asc(tasks.startTime), desc(tasks.priority)); 
  } catch (e) { return []; }
}

// 2. UPSERT TASK (Add or Update)
export async function upsertTask(data: TaskData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  try {
    if (data.id) {
      await db.update(tasks).set({ ...data, updatedAt: new Date() }).where(eq(tasks.id, data.id));
    } else {
      await db.insert(tasks).values({ userId, ...data });
    }
    revalidatePath("/tasks");
    return { success: true };
  } catch (e) { return { success: false }; }
}

// 3. UPDATE PROGRESS & STATUS
export async function updateTaskProgress(id: string, progress: number, status: string, reason?: string) {
    const { userId } = await auth();
    if (!userId) return;
    
    await db.update(tasks).set({ 
        progress: progress,
        status: status as any,
        skippedReason: reason || null,
        updatedAt: new Date()
    }).where(eq(tasks.id, id));
    revalidatePath("/tasks");
}

// 4. DELETE TASK
export async function deleteTask(id: string) {
    const { userId } = await auth();
    if (!userId) return;
    await db.delete(tasks).where(eq(tasks.id, id));
    revalidatePath("/tasks");
}

// 5. AI SMART SCHEDULER (Respects Fixed Tasks)
export async function aiAutoSchedule(currentTasks: TaskData[]) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        
        const prompt = `
        You are an Elite Productivity Strategist. User has these tasks: ${JSON.stringify(currentTasks)}.
        
        GOAL: Optimize the day schedule.
        RULES:
        1. Keep 'fixed' tasks exactly at their 'startTime' (Do not move them).
        2. Suggest efficient 'startTime' slots for 'flexible' tasks based on priority/energy.
        3. Fill gaps between fixed tasks.
        4. Provide a 'battlePlan' summary (1 sentence).
        
        Start scheduling from 09:00 unless a fixed task is earlier.
        
        Return JSON (no markdown):
        {
            "scheduleUpdates": [ { "id": "task_id", "startTime": "09:00" }, ... ],
            "battlePlan": "string"
        }
        `;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        
        // Robust cleaning
        const jsonStr = text.replace(/```json|```/g, "").trim();
        return JSON.parse(jsonStr);

    } catch (error) { 
        console.error("AI Schedule Error:", error);
        return null; 
    }
}