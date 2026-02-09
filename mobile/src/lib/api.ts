import { API_BASE_URL } from "./constants";

// Helper function to handle API calls
async function fetcher<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log(`📡 Fetching: ${url}`); // Debugging ke liye

    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        // Future: Yahan hum Clerk ka token bhejenge
        // "Authorization": `Bearer ${token}` 
      },
      ...options,
    });

    if (!res.ok) {
      throw new Error(`API Error: ${res.status}`);
    }

    const data = await res.json();
    return data as T;
  } catch (error) {
    console.error("❌ API Call Failed:", error);
    throw error;
  }
}

// API Methods
export const api = {
  // Dashboard
  getDashboard: (userId: string) => fetcher<any>(`/dashboard?userId=${userId}`),

  // Fitness
  getFitness: (userId: string, date: string) => fetcher<any>(`/fitness?userId=${userId}&date=${date}`),
  updateFitness: (data: any) => fetcher("/fitness", { method: "POST", body: JSON.stringify(data) }),

  // Tasks
  getTasks: (userId: string) => fetcher<any>(`/tasks?userId=${userId}`),
  
  // Aur baaki bhi hum yahan add karenge...
};