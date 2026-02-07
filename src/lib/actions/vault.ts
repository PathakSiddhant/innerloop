"use server";

import { db } from "@/lib/db"; // Agar tera path "@/db" hai toh change kar lena, par maine current wala rakha hai
import { vault } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { GoogleGenerativeAI } from "@google/generative-ai";

// API Key check karne ke liye safe initialization
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// --- 1. GET VAULT ITEMS ---
export async function getVaultItems() {
  const { userId } = await auth();
  if (!userId) return [];
  
  // Naye items sabse upar dikhenge
  return await db.select().from(vault).where(eq(vault.userId, userId)).orderBy(desc(vault.createdAt));
}

// --- 2. SAVE ITEM (UPSERT) ---
export async function upsertVaultItem(data: any) {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  // AI Auto-Tagging (Instruction ke hisaab se simplified)
  // Agar tags nahi hain aur description hai, toh AI se tags maang lo
  if ((!data.tags || data.tags.trim() === "") && data.description) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const prompt = `Generate 3-4 comma separated tags for this content: ${data.title} - ${data.description}. Return ONLY the tags (e.g. "React, Frontend, Guide").`;
      
      const result = await model.generateContent(prompt);
      const generatedTags = result.response.text();
      
      if (generatedTags) {
        data.tags = generatedTags;
      }
    } catch (e) {
      console.log("AI Tagging failed, skipping...", e);
      // Fail hua toh khali chhod dega, error throw nahi karega
    }
  }

  // Data cleanup
  const cleanData = {
    ...data,
    userId,
    updatedAt: new Date(),
  };

  try {
    // Agar ID hai aur wo "temp-" (frontend temporary ID) nahi hai, toh UPDATE karo
    if (data.id && !data.id.toString().startsWith("temp-")) {
      await db.update(vault).set(cleanData).where(eq(vault.id, data.id));
    } else {
      // Agar naya item hai, toh ID remove kardo taaki DB khud nayi UUID banaye
      const { id, ...insertData } = cleanData;
      await db.insert(vault).values(insertData);
    }

    revalidatePath("/vault");
    return { success: true };
  } catch (error) {
    console.error("Database Error:", error);
    return { error: "Failed to save item" };
  }
}

// --- 3. DELETE ITEM ---
export async function deleteVaultItem(id: string) {
  const { userId } = await auth();
  if (!userId) return;

  await db.delete(vault).where(and(eq(vault.id, id), eq(vault.userId, userId)));
  revalidatePath("/vault");
}

// --- 4. TOGGLE FAVORITE (Bonus: Ye current code mein tha, maine rakh liya taaki feature na toote) ---
export async function toggleVaultFavorite(id: string, currentState: boolean) {
    const { userId } = await auth();
    if (!userId) return;
    
    await db.update(vault).set({ isFavorite: !currentState }).where(eq(vault.id, id));
    revalidatePath("/vault");
}