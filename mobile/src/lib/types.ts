// mobile/src/lib/types.ts

// --- FITNESS TYPES ---

export interface Set {
  id: string;
  weight: number;
  reps: number;
  completed: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  sets: Set[];
  isCollapsed?: boolean;
}

export interface WorkoutSession {
  id: string;
  name: string;
  startTime: number;
  endTime?: number | null;
  exercises: Exercise[];
}

export interface FoodItem {
  id: string;
  name: string;
  cals: number;
  p: number;
  c: number;
  f: number;
}

export interface FitnessData {
  date: string;
  isRestDay: boolean;

  // Goals (User can edit these now)
  waterGoal: number;
  waterIntake: number;
  stepGoal: number;
  stepCount: number;

  bodyWeight?: number | null;
  targetWeight?: number | null;

  // Complex Data
  sessions: WorkoutSession[];
  meals: FoodItem[];

  // Macros
  macroGoal: { cals: number; p: number; c: number; f: number };
}

// --- TASK TYPES ---

export interface Task {
  id: string;
  title: string;
  category: "work" | "personal" | "health" | "learning";
  status: "pending" | "completed";
  startTime?: string; // "09:00"
  duration: number; // minutes
}

// --- TECH/BUILDER TYPES ---

export interface Project {
  id: string;
  name: string;
  status: "building" | "shipped";
  techStack: string[];
}

// --- DASHBOARD OVERVIEW ---

export interface DashboardData {
  greeting: string; // "Good Morning, Siddhant"
  fitness: FitnessData;
  tasks: Task[];
  activeProject?: Project;
  liveMatch?: {
    team1: string;
    team2: string;
    score?: string;
  };
}