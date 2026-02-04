"use server";

import { db } from "@/lib/db";
import { projects, ideas, devLogs, projectResources, AIBlueprint } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

// --- TYPES ---
export interface ProjectData {
  id?: string;
  name: string;
  vision?: string;
  status: "building" | "shipped" | "dropped";
  techStack: string[];
  complexityScore: number;
  revenuePotential: number;
  aiBlueprint?: AIBlueprint;
}

export interface ResourceData {
  id?: string;
  projectId: string;
  type: "link" | "note" | "todo";
  title: string;
  content?: string;
  url?: string;
  isCompleted?: boolean;
}

export interface IdeaData { id?: string; title: string; problem: string; isValidated: boolean; }
export interface DevLogData { id?: string; projectId: string; date: string; tasksCompleted: string[]; blockers?: string; energyLevel: number; commitCount: number; }

// 1. GET DASHBOARD
export async function getTechDashboard(dateStr: string) {
  const { userId } = await auth();
  if (!userId) return null;

  try {
    const [allProjects, allIdeas, dailyLogs] = await Promise.all([
      db.select().from(projects).where(eq(projects.userId, userId)),
      db.select().from(ideas).where(eq(ideas.userId, userId)),
      db.select().from(devLogs).where(and(eq(devLogs.userId, userId), eq(devLogs.date, dateStr)))
    ]);

    return { projects: allProjects, ideas: allIdeas, logs: dailyLogs };
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
}

// 2. PROJECT ACTIONS
export async function upsertProject(data: ProjectData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  try {
    if (data.id) {
      await db.update(projects).set({ 
        name: data.name, vision: data.vision, status: data.status,
        techStack: data.techStack, complexityScore: data.complexityScore,
        revenuePotential: data.revenuePotential, aiBlueprint: data.aiBlueprint,
        updatedAt: new Date() 
      }).where(eq(projects.id, data.id));
    } else {
      await db.insert(projects).values({ 
        userId, name: data.name, vision: data.vision, status: data.status,
        techStack: data.techStack, complexityScore: data.complexityScore,
        revenuePotential: data.revenuePotential, aiBlueprint: data.aiBlueprint,
      });
    }
    revalidatePath("/builder");
    return { success: true };
  } catch (error) { return { success: false, error }; }
}

export async function deleteProject(id: string) {
  const { userId } = await auth();
  if (!userId) return { success: false };
  try {
    await db.delete(projects).where(and(eq(projects.id, id), eq(projects.userId, userId)));
    revalidatePath("/builder");
    return { success: true };
  } catch (error) { return { success: false, error }; }
}

// 3. RESOURCE ACTIONS (The Neural Link)
export async function getProjectResources(projectId: string) {
    const { userId } = await auth();
    if (!userId) return [];
    try {
        return await db.select().from(projectResources)
            .where(and(eq(projectResources.projectId, projectId), eq(projectResources.userId, userId)))
            .orderBy(desc(projectResources.createdAt));
    } catch { return []; }
}

export async function addProjectResource(data: ResourceData) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");
    try {
        await db.insert(projectResources).values({
            userId,
            projectId: data.projectId,
            type: data.type,
            title: data.title,
            content: data.content,
            url: data.url,
            isCompleted: data.isCompleted || false
        });
        revalidatePath("/builder");
        return { success: true };
    } catch { return { success: false }; }
}

export async function toggleResourceComplete(id: string, status: boolean) {
    const { userId } = await auth();
    if (!userId) return;
    await db.update(projectResources).set({ isCompleted: status }).where(eq(projectResources.id, id));
    revalidatePath("/builder");
}

export async function deleteResource(id: string) {
    const { userId } = await auth();
    if (!userId) return;
    await db.delete(projectResources).where(eq(projectResources.id, id));
    revalidatePath("/builder");
}

// 4. IDEA ACTIONS
export async function upsertIdea(data: IdeaData) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");
    try {
      if (data.id) {
        await db.update(ideas).set({ title: data.title, problem: data.problem, isValidated: data.isValidated })
          .where(eq(ideas.id, data.id));
      } else {
        await db.insert(ideas).values({ userId, ...data });
      }
      revalidatePath("/builder");
      return { success: true };
    } catch (error) { return { success: false, error }; }
}

export async function deleteIdea(id: string) {
  const { userId } = await auth();
  if (!userId) return { success: false };
  try {
    await db.delete(ideas).where(and(eq(ideas.id, id), eq(ideas.userId, userId)));
    revalidatePath("/builder");
    return { success: true };
  } catch (error) { return { success: false, error }; }
}

// 5. LOG WORK
export async function logDevWork(data: DevLogData) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");
    try {
        const existing = await db.select().from(devLogs).where(and(
            eq(devLogs.projectId, data.projectId),
            eq(devLogs.date, data.date)
        )).limit(1);

        if(existing.length > 0) {
            await db.update(devLogs).set({
              tasksCompleted: data.tasksCompleted, blockers: data.blockers,
              energyLevel: data.energyLevel, commitCount: data.commitCount
            }).where(eq(devLogs.id, existing[0].id));
        } else {
            await db.insert(devLogs).values({ userId, ...data });
        }
        revalidatePath("/builder");
        return { success: true };
    } catch (error) { return { success: false, error }; }
}

// 6. REAL AI AGENT (The CTO)
export async function generateProjectBlueprint(idea: string) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        
        const prompt = `
        Act as a world-class CTO. Analyze idea: "${idea}".
        Present the answer in this way : 
        detailed answers to follow a structured Markdown format with: punchy emoji opening, ## and ### headers, horizontal rules (---), bolded key words for skimming, sparse but effective emoji use, blockquotes for pro-tips/important notes, bullet lists for 3+ items, tables for comparisons, and deep detailed explanations unless explicitly asked for short or brief responses.
        Return valid JSON (no markdown):
        {
          "tagline": "string",
          "description": "string",
          "techStack": [{ "name": "string", "reason": "string" }],
          "databaseSchema": [{ "table": "string", "columns": ["string"] }],
          "roadmap": [{ "phase": "string", "weeks": "string", "tasks": ["string"] }],
          "detialedExplantation" : "string"
        }`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        return JSON.parse(text.replace(/```json|```/g, "").trim()) as AIBlueprint;

    } catch (error) {
        console.error("AI Error:", error);
        return null; 
    }
}