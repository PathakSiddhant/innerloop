"use server";

import { db } from "@/lib/db";
import { projects, ideas, devLogs } from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

// --- TYPES (Frontend will use these) ---
export interface ProjectData {
  id?: string;
  name: string;
  vision?: string;
  status: "building" | "shipped" | "dropped";
  techStack: string[];
  complexityScore: number;
  revenuePotential: number;
}

export interface IdeaData {
  id?: string;
  title: string;
  problem: string;
  audience?: string;
  solution?: string;
  differentiation?: string;
  isValidated: boolean;
}

export interface DevLogData {
  id?: string;
  projectId: string; // Links to a project
  date: string; // YYYY-MM-DD
  tasksCompleted: string[];
  blockers?: string;
  energyLevel: number; // 1-10
  commitCount: number;
}

// --- ACTIONS ---

// 1. GET DASHBOARD DATA (Loads everything in one go)
export async function getTechDashboard() {
  const { userId } = await auth();
  if (!userId) return null;

  try {
    const [allProjects, allIdeas, recentLogs] = await Promise.all([
      db.select().from(projects).where(eq(projects.userId, userId)),
      db.select().from(ideas).where(eq(ideas.userId, userId)),
      db.select().from(devLogs).where(eq(devLogs.userId, userId)).orderBy(desc(devLogs.date)).limit(7)
    ]);

    return { 
      projects: allProjects, 
      ideas: allIdeas, 
      recentLogs 
    };
  } catch (error) {
    console.error("Error fetching tech dashboard:", error);
    return null;
  }
}

// 2. MANAGE PROJECTS (Create or Update)
export async function upsertProject(data: ProjectData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  try {
    if (data.id) {
      // Update
      await db.update(projects).set({ 
        name: data.name,
        vision: data.vision,
        status: data.status,
        techStack: data.techStack,
        complexityScore: data.complexityScore,
        revenuePotential: data.revenuePotential,
        updatedAt: new Date() 
      }).where(eq(projects.id, data.id));
    } else {
      // Create
      await db.insert(projects).values({ 
        userId, 
        name: data.name,
        vision: data.vision,
        status: data.status,
        techStack: data.techStack,
        complexityScore: data.complexityScore,
        revenuePotential: data.revenuePotential,
      });
    }
    revalidatePath("/tech");
    return { success: true };
  } catch (error) {
    console.error("Project Save Error:", error);
    return { success: false, error };
  }
}

// 3. MANAGE IDEAS (Pin/Unpin Ideas)
export async function upsertIdea(data: IdeaData) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");
  
    try {
      if (data.id) {
        await db.update(ideas).set({ ...data }).where(eq(ideas.id, data.id));
      } else {
        await db.insert(ideas).values({ userId, ...data });
      }
      revalidatePath("/tech");
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
}

// 4. DELETE IDEA (Drop bad ideas)
export async function deleteIdea(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  try {
    await db.delete(ideas).where(and(eq(ideas.id, id), eq(ideas.userId, userId)));
    revalidatePath("/tech");
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
}

// 5. LOG DAILY DEV WORK (The Grind)
export async function logDevWork(data: DevLogData) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    try {
        // Check if log exists for this project + date
        const existing = await db.select().from(devLogs).where(and(
            eq(devLogs.projectId, data.projectId),
            eq(devLogs.date, data.date)
        )).limit(1);

        if(existing.length > 0) {
            await db.update(devLogs).set({
              tasksCompleted: data.tasksCompleted,
              blockers: data.blockers,
              energyLevel: data.energyLevel,
              commitCount: data.commitCount
            }).where(eq(devLogs.id, existing[0].id));
        } else {
            await db.insert(devLogs).values({ userId, ...data });
        }
        revalidatePath("/tech");
        return { success: true };
    } catch (error) {
        console.error("DevLog Error:", error);
        return { success: false, error };
    }
}