"use server"
import { db } from "@/lib/db";
import { dailyLogs } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

// Type define kiya taaki 'any' ka error na aaye
export type LogContent = {
  workoutName?: string;
  exercises?: Array<{ name: string; sets: number; reps: number; weight: number }>;
  project?: string;
  notes?: string;
  duration?: number;
  [key: string]: unknown; // Flexibility ke liye
};

export async function createDailyLog(
  type: string, 
  content: LogContent, 
  energy: number, 
  mood: string
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await db.insert(dailyLogs).values({
    userId,
    type,
    content,
    energyLevel: energy,
    mood,
  });

  revalidatePath("/dashboard");
}