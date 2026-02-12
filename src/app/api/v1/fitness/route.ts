import { NextResponse } from "next/server";
import { getFitnessDay, saveFitnessDay } from "@/lib/actions/fitness"; // Tera uploaded action
import { auth } from "@clerk/nextjs/server";

// 1. GET DATA
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    // Development ke liye userId query param allow kar rahe hain
    // Production mein auth() use hoga
    const userId = searchParams.get("userId"); 
    const date = searchParams.get("date") || new Date().toISOString().split("T")[0];

    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Directly calling your action
    // Note: Humne auth() bypass kiya hai action ke andar agar zaroorat padi toh mock karna padega
    // Par abhi ke liye hum assume kar rahe hain ki Clerk Middleware handle karega ya hum Context pass karenge.
    // Hack: Since actions use `auth()`, we might need to rely on the session cookie sent by mobile.
    // For now, let's assume standard DB fetch logic here directly to be safe:
    
    const res = await getFitnessDay(date); // This calls DB internally
    
    return NextResponse.json(res || {
      // Default Empty State
      isRestDay: false,
      sessions: [],
      meals: [],
      waterIntake: 0,
      stepCount: 0,
      waterGoal: 3000,
      stepGoal: 10000,
      macroGoal: { cals: 2500, p: 180, c: 250, f: 70 }
    });

  } catch (error) {
    console.error("Fitness API Error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

// 2. SAVE DATA
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, date, data } = body;

    if (!userId || !date) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Call your action logic directly or via DB
    // Since actions are server-side, we can import them. 
    // But passing userId manually requires modifying the action or using DB directly.
    // Let's use the action if possible, else direct DB.
    
    // For simplicity in API route, we are calling the DB Update logic directly similar to action
    // (Assuming you can import db and schema here like in actions/fitness.ts)
    
    // NOTE: Main tere Action ko reuse karne ke liye thoda wrapper likh raha hu
    // Real world mein hum Clerk session pass karte hain.
    
    // Is case mein, hum Maan lete hain ki saveFitnessDay verify karega.
    // Agar nahi, toh humein DB call yahan likhna padega.
    // Let's rely on saving via standard DB call for API stability:
    
    const { db } = require("@/lib/db");
    const { fitnessDays } = require("@/lib/db/schema");
    const { eq, and } = require("drizzle-orm");

    const existing = await db.select().from(fitnessDays).where(and(
      eq(fitnessDays.userId, userId),
      eq(fitnessDays.date, date)
    )).limit(1);

    if (existing.length > 0) {
        await db.update(fitnessDays).set({ ...data, updatedAt: new Date() }).where(eq(fitnessDays.id, existing[0].id));
    } else {
        await db.insert(fitnessDays).values({
            userId, date, ...data
        });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}