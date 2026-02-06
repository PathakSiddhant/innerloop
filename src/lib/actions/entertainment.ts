// "use server";



// import { db } from "@/lib/db";

// import { entertainment } from "@/lib/db/schema";

// import { eq, and, desc } from "drizzle-orm";

// import { auth } from "@clerk/nextjs/server";

// import { revalidatePath } from "next/cache";



// // --- 1. GET LIBRARY ---

// export async function getLibrary() {

//   const { userId } = await auth();

//   if (!userId) return [];



//   const items = await db.select()

//     .from(entertainment)

//     .where(eq(entertainment.userId, userId))

//     .orderBy(desc(entertainment.updatedAt));

 

//   return items;

// }



// // --- 2. ADD / EDIT CONTENT ---

// export async function upsertContent(data: any) {

//   const { userId } = await auth();

//   if (!userId) return { error: "Unauthorized" };



//   if (data.id) {

//     // Update

//     await db.update(entertainment).set({ ...data, updatedAt: new Date() }).where(eq(entertainment.id, data.id));

//   } else {

//     // Insert

//     await db.insert(entertainment).values({ ...data, userId });

//   }

//   revalidatePath("/entertainment");

//   return { success: true };

// }



// // --- 3. DELETE CONTENT ---

// export async function deleteContent(id: string) {

//   const { userId } = await auth();

//   if (!userId) return;

//   await db.delete(entertainment).where(and(eq(entertainment.id, id), eq(entertainment.userId, userId)));

//   revalidatePath("/entertainment");

// }



// // --- 4. AI MOCK RECOMMENDATION (Placeholder for Real AI) ---

// // Bhai abhi real AI cost bachane ke liye logic-based 'AI' bana raha hu.

// // Future mein hum isme OpenAI connect kar denge.

// export async function generateRecommendations(userPreferences: string) {

//   // Simulate AI latency

//   await new Promise(resolve => setTimeout(resolve, 1500));



//   const suggestions = [

//     { title: "Dark", type: "Web Series", reason: "Matches your taste for complex Sci-Fi." },

//     { title: "Arrival", type: "Movie", reason: "Psychological sci-fi similar to your 'Completed' list." },

//     { title: "Vinland Saga", type: "Anime", reason: "Historical action with depth." },

//   ];

 

//   return { intel: `Based on your request for "${userPreferences}", here are top picks:`, data: suggestions };

// }


// Trial : 

"use server";

import { db } from "@/lib/db";
import { entertainment } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { GoogleGenerativeAI } from "@google/generative-ai";

// --- 1. GET LIBRARY ---
export async function getLibrary() {
  const { userId } = await auth();
  if (!userId) return [];

  const items = await db.select()
    .from(entertainment)
    .where(eq(entertainment.userId, userId))
    .orderBy(desc(entertainment.updatedAt));
  
  return items;
}

// --- 2. UPSERT CONTENT ---
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function upsertContent(data: any) {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  const cleanData = {
    ...data,
    userId,
    rating: data.rating || 0,
    currentSeason: data.currentSeason || 1,
    currentEpisode: data.currentEpisode || 0,
    updatedAt: new Date(),
  };

  if (data.id && !data.id.startsWith("temp-")) {
    await db.update(entertainment).set(cleanData).where(eq(entertainment.id, data.id));
  } else {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...insertData } = cleanData;
    await db.insert(entertainment).values(insertData);
  }
  revalidatePath("/entertainment");
  return { success: true };
}

// --- 3. DELETE CONTENT ---
export async function deleteContent(id: string) {
  const { userId } = await auth();
  if (!userId) return;
  await db.delete(entertainment).where(and(eq(entertainment.id, id), eq(entertainment.userId, userId)));
  revalidatePath("/entertainment");
}

// --- 4. REAL AI AGENT ---
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function chatWithAI(history: { role: string; text: string }[], message: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const systemPrompt = `
      You are 'InnerLoop AI', an elite entertainment curator.
      
      Your Goal: Help the user decide what to watch.
      
      BEHAVIOR MODES:
      1. DISCUSSION: If the user asks general questions (e.g., "Explain the ending of Tenet", "Who is the best Batman?"), provide a concise, witty, and engaging text answer.
      
      2. RECOMMENDATION: If the user asks for suggestions (e.g., "Suggest 3 dark sci-fi movies", "Anime like Naruto"), you MUST return a valid JSON object.
      
      OUTPUT FORMAT FOR RECOMMENDATIONS (Strict JSON):
      {
        "mode": "recommendation",
        "reply": "Here are 3 masterpieces for you:",
        "data": [
          { 
            "title": "Exact Title", 
            "type": "movie/series/anime", 
            "genre": "Main Genre", 
            "platform": "Netflix/Prime", 
            "reason": "One short punchy sentence on why they should watch it." 
          }
        ]
      }

      OUTPUT FORMAT FOR DISCUSSION (Strict JSON):
      {
        "mode": "chat",
        "reply": "Your answer goes here..."
      }
      
      DO NOT use Markdown code blocks (like \`\`\`json). Just return the raw JSON string.
    `;

    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: systemPrompt }] },
        { role: "model", parts: [{ text: "Understood. I am ready to function as the InnerLoop AI Agent." }] },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...history.map((msg: any) => ({
            role: msg.role === 'ai' ? 'model' : 'user',
            parts: [{ text: msg.text }]
        }))
      ],
    });

    const result = await chat.sendMessage(message);
    const response = result.response.text();
    
    try {
        const cleanJson = response.replace(/```json/g, "").replace(/```/g, "").trim();
        return JSON.parse(cleanJson);
    } catch {
        // Fallback if AI forgets JSON
        return { mode: "chat", reply: response };
    }

  } catch (error) {
    console.error("AI Error:", error);
    return { mode: "chat", reply: "I seem to be having trouble accessing the entertainment database. Please try again." };
  }
}