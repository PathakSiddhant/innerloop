// mobile/src/lib/api.ts
import { API_BASE_URL } from "./constants";
import { FitnessData } from "./types"; 

async function fetcher<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log(`📡 Requesting: ${url}`); // Updated logging
    
    const res = await fetch(url, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });

    if (!res.ok) {
      // Instructions wali update: Error detail print karega
      const errorText = await res.text();
      console.error(`API Error ${res.status}:`, errorText);
      throw new Error(`API Error: ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.error("❌ API Call Failed:", error);
    throw error;
  }
}

export const api = {
  // Dashboard
  getDashboard: (userId: string) => fetcher<any>(`/dashboard?userId=${userId}`),
  
  // Fitness Calls (Type Safe)
  getFitness: (userId: string, date: string) => 
    fetcher<FitnessData>(`/fitness?userId=${userId}&date=${date}`),
  
  // Save Data
  updateFitness: (userId: string, date: string, data: Partial<FitnessData>) => 
    fetcher("/fitness", {
      method: "POST",
      body: JSON.stringify({ userId, date, data }),
    }),
    
  // Tasks
  getTasks: (userId: string) => fetcher<any>(`/tasks?userId=${userId}`),
};