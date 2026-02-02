"use server"
import { db } from "@/lib/db";
import { dailyLogs } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

// Updated LogContent with Diet & Detailed Sets support
export type LogContent = {
  // Workout details
  workoutName?: string;
  exercises?: Array<{ 
    name: string; 
    sets: Array<{ reps: number; weight: number; completed: boolean }> 
  }>;
  
  // Diet details
  calories?: number;
  macros?: { protein: number; carbs: number; fats: number };
  waterIntake?: number; // in ml
  
  // Meta & Tech details
  project?: string;
  notes?: string;
  duration?: number;
  [key: string]: unknown; // Flexibility for future modules
};

export async function createDailyLog(
  type: string, 
  content: LogContent, 
  energy: number, 
  mood: string
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  try {
    await db.insert(dailyLogs).values({
      userId,
      type,
      content,
      energyLevel: energy,
      mood,
    });

    // Revalidate multiple paths to keep UI in sync
    revalidatePath("/dashboard");
    revalidatePath("/fitness");
    
    return { success: true };
  } catch (error) {
    console.error("Database Insert Error:", error);
    throw new Error("Failed to create log");
  }
}