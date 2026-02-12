import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { fitnessDays, tasks, projects } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "UserId required" }, { status: 400 });
    }

    const today = new Date().toISOString().split("T")[0];

    // 1. Fitness Data
    const fitnessData = await db.select()
      .from(fitnessDays)
      .where(and(eq(fitnessDays.userId, userId), eq(fitnessDays.date, today)))
      .limit(1);

    // 2. Pending Tasks Count
    const pendingTasks = await db.select()
      .from(tasks)
      .where(and(eq(tasks.userId, userId), eq(tasks.status, "pending")));

    // 3. Active Project
    const activeProject = await db.select()
      .from(projects)
      .where(and(eq(projects.userId, userId), eq(projects.status, "building")))
      .limit(1);

    // Response Structure
    return NextResponse.json({
      greeting: "Welcome Back",
      fitness: {
        steps: fitnessData[0]?.stepCount || 0,
        stepGoal: fitnessData[0]?.stepGoal || 10000,
        calories: 0, // Placeholder agar DB column nahi hai
      },
      tasksCount: pendingTasks.length,
      activeProject: activeProject[0] || null,
    });

  } catch (error) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}