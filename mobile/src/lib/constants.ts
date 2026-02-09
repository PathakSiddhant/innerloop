export const COLORS = {
  // Base Colors (Backgrounds)
  background: "#09090b", // Zinc-950 (Darkest)
  surface: "#18181b",    // Zinc-900 (Cards)
  surfaceLight: "#27272a", // Zinc-800 (Hover/Borders)
  
  // Text Colors
  text: "#fafafa",       // Zinc-50 (White)
  textMuted: "#a1a1aa",  // Zinc-400 (Gray)
  textDim: "#52525b",    // Zinc-600 (Dark Gray)

  // Brand Colors (The 6 Pillars)
  fitness: "#10b981",    // Emerald-500 (Green)
  tasks: "#f59e0b",      // Amber-500 (Orange)
  tech: "#6366f1",       // Indigo-500 (Blue)
  sports: "#ef4444",     // Red-500 (Red)
  vault: "#d946ef",      // Fuchsia-500 (Pink)
  entertainment: "#eab308", // Yellow-500 (Gold)

  // UI Accents
  primary: "#6366f1",    // Main Brand Color
  border: "#27272a",     // Border Color
  error: "#ef4444",      // Error Red
  success: "#22c55e",    // Success Green
};

// API URL (Important: Localhost Android Emulator ke liye 10.0.2.2 hota hai)
// Agar real device use kar raha hai, toh apne PC ka IP daalna padega (e.g., 192.168.1.5)
export const API_BASE_URL = "http://10.0.2.2:3000/api/v1";