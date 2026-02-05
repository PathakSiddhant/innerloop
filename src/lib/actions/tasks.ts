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
  
  // Scheduling
  taskType: "fixed" | "flexible";
  startTime?: string; // "09:00"
  duration: number; // minutes
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
    const data = await db.select().from(tasks)
      .where(and(eq(tasks.userId, userId), eq(tasks.date, dateStr)))
      .orderBy(asc(tasks.startTime), desc(tasks.priority));
    
    // Explicit casting to match interface
    return data as unknown as TaskData[]; 
  } catch (e) { return []; }
}

// 2. UPSERT TASK
export async function upsertTask(data: TaskData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const today = new Date().toISOString().split('T')[0];
  
  // Block creation in past
  if (data.date < today && !data.id) {
      return { success: false, error: "Cannot change history." };
  }

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

// 3. UPDATE PROGRESS
export async function updateTaskProgress(id: string, progress: number, status: string, reason?: string) {
    const { userId } = await auth();
    if (!userId) return;
    
    await db.update(tasks).set({ 
        progress,
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

// 5. AI SCHEDULER
export async function aiAutoSchedule(currentTasks: TaskData[]) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const prompt = `
        Productivity Strategist Mode. Tasks: ${JSON.stringify(currentTasks)}.
        Goal: Optimize schedule from 09:00. Keep 'fixed' tasks.
        Return JSON: { "scheduleUpdates": [ { "id": "task_id", "startTime": "09:00" } ], "battlePlan": "string" }
        `;
        const result = await model.generateContent(prompt);
        return JSON.parse(result.response.text().replace(/```json|```/g, "").trim());
    } catch (error) { return null; }
}