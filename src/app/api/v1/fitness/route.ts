import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { fitnessDays } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const date = searchParams.get("date");

    if (!userId || !date) return NextResponse.json({ error: "Missing Params" }, { status: 400 });

    const data = await db.select().from(fitnessDays).where(
      and(eq(fitnessDays.userId, userId), eq(fitnessDays.date, date))
    ).limit(1);

    // Default Empty State (Agar DB mein data nahi hai)
    const defaultData = {
      userId,
      date,
      isRestDay: false,
      sessions: [],
      meals: [],
      waterGoal: 3000,
      waterIntake: 0,
      stepGoal: 10000,
      stepCount: 0,
      bodyWeight: 0,
      targetWeight: 75,
      macroGoal: { cals: 2500, p: 180, c: 250, f: 70 }
    };

    return NextResponse.json(data[0] || defaultData);

  } catch (error) {
    console.error("API GET Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, date, data } = body;

    if (!userId || !date) return NextResponse.json({ error: "Invalid Data" }, { status: 400 });

    // Check if entry exists
    const existing = await db.select().from(fitnessDays).where(
      and(eq(fitnessDays.userId, userId), eq(fitnessDays.date, date))
    ).limit(1);

    if (existing.length > 0) {
      // UPDATE
      await db.update(fitnessDays).set({
        isRestDay: data.isRestDay,
        sessions: data.sessions || [], // Ensure array
        meals: data.meals || [],       // Ensure array
        macroGoal: data.macroGoal,
        waterGoal: data.waterGoal,
        waterIntake: data.waterIntake,
        stepGoal: data.stepGoal,
        stepCount: data.stepCount,
        bodyWeight: data.bodyWeight,
        targetWeight: data.targetWeight,
        updatedAt: new Date()
      }).where(eq(fitnessDays.id, existing[0].id));
    } else {
      // INSERT NEW
      await db.insert(fitnessDays).values({
        userId,
        date,
        isRestDay: data.isRestDay || false,
        sessions: data.sessions || [],
        meals: data.meals || [],
        macroGoal: data.macroGoal || { cals: 2500, p: 180, c: 250, f: 70 },
        waterGoal: data.waterGoal || 3000,
        waterIntake: data.waterIntake || 0,
        stepGoal: data.stepGoal || 10000,
        stepCount: data.stepCount || 0,
        bodyWeight: data.bodyWeight || 0,
        targetWeight: data.targetWeight || 75
      });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("API POST Error:", error);
    return NextResponse.json({ error: "Save Failed" }, { status: 500 });
  }
}