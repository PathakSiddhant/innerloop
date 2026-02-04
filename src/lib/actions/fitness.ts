"use server";

import { db } from "@/lib/db";
import { fitnessDays, type WorkoutSession, type FoodItem } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

// Type for the data coming from frontend
interface FitnessUpdateData {
  isRestDay: boolean;
  sessions: WorkoutSession[];
  macroGoal: { cals: number; p: number; c: number; f: number };
  meals: FoodItem[];
  waterGoal: number;
  waterIntake: number;
  stepGoal: number;
  stepCount: number;
  bodyWeight: number | null;
  targetWeight: number | null;
}

// 1. GET DATA
export async function getFitnessDay(dateKey: string) {
  const { userId } = await auth();
  if (!userId) return null;

  try {
    const day = await db.select().from(fitnessDays).where(
      and(
        eq(fitnessDays.userId, userId),
        eq(fitnessDays.date, dateKey)
      )
    ).limit(1);

    return day[0] || null;
  } catch (error) {
    console.error("Error fetching fitness day:", error);
    return null;
  }
}

// 2. SAVE DATA
export async function saveFitnessDay(dateKey: string, data: FitnessUpdateData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  try {
    const existingDay = await db.select().from(fitnessDays).where(
      and(
        eq(fitnessDays.userId, userId),
        eq(fitnessDays.date, dateKey)
      )
    ).limit(1);

    if (existingDay.length > 0) {
      await db.update(fitnessDays)
        .set({
          isRestDay: data.isRestDay,
          sessions: data.sessions,
          meals: data.meals,
          macroGoal: data.macroGoal,
          waterGoal: data.waterGoal,
          waterIntake: data.waterIntake,
          stepGoal: data.stepGoal,
          stepCount: data.stepCount,
          bodyWeight: data.bodyWeight,
          targetWeight: data.targetWeight || 75, // Fallback if null
          updatedAt: new Date(),
        })
        .where(eq(fitnessDays.id, existingDay[0].id));
    } else {
      await db.insert(fitnessDays).values({
        userId,
        date: dateKey,
        isRestDay: data.isRestDay,
        sessions: data.sessions,
        meals: data.meals,
        macroGoal: data.macroGoal,
        waterGoal: data.waterGoal,
        waterIntake: data.waterIntake,
        stepGoal: data.stepGoal,
        stepCount: data.stepCount,
        bodyWeight: data.bodyWeight,
        targetWeight: data.targetWeight || 75,
      });
    }

    revalidatePath("/fitness");
    return { success: true };
  } catch (error) {
    console.error("Error saving fitness day:", error);
    return { success: false, error };
  }
}

// 3. GET HISTORY
export async function getFitnessHistory() {
  const { userId } = await auth();
  if (!userId) return [];

  try {
    const history = await db.select().from(fitnessDays)
      .where(eq(fitnessDays.userId, userId));
    
    return history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch {
    // Removed unused 'error' variable
    return [];
  }
}