// Apple Health Inspired Theme
export const THEME_PALETTE = {
  light: {
    background: '#F2F2F7', // System Gray 6
    surface: '#FFFFFF',    // White
    surfaceHighlight: '#E5E5EA', // System Gray 5 (For secondary buttons)
    text: '#000000',
    textSecondary: '#8E8E93', // System Gray
    primary: '#007AFF',    // System Blue
    border: '#D1D1D6',     // System Gray 4
    
    // Activity Colors
    move: '#FA114F',       // Pink
    exercise: '#A4FF00',   // Lime
    stand: '#00E0FF',      // Cyan
  },
  dark: {
    background: '#000000', // Black
    surface: '#1C1C1E',    // Dark Gray Card
    surfaceHighlight: '#2C2C2E', // Lighter Gray (For buttons)
    text: '#FFFFFF',
    textSecondary: '#8E8E93',
    primary: '#0A84FF',    // Dark Mode Blue
    border: '#38383A',     // Dark Border
    
    // Activity Colors
    move: '#FA114F',
    exercise: '#A4FF00',
    stand: '#00E0FF',
  }
};

export const COLORS = {
  fitness: "#FA114F",
  tasks: "#FF9500",
  tech: "#5856D6",
  sports: "#FF2D55",
  vault: "#AF52DE",
  entertainment: "#FFCC00",
  primary: "#007AFF",
};

// ⚠️ Ensure this matches your setup
export const API_BASE_URL = "http://10.0.2.2:3000/api/v1";