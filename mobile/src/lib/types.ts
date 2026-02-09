// Fitness Types
export interface WorkoutSession {
  id: string;
  name: string; // "Chest Day"
  duration: number; // minutes
  calories: number;
}

export interface FitnessData {
  steps: number;
  water: number;
  calories: number;
  stepGoal: number;
  waterGoal: number;
  sessions: WorkoutSession[];
}

// Task Types
export interface Task {
  id: string;
  title: string;
  category: "work" | "personal" | "health" | "learning";
  status: "pending" | "completed";
  startTime?: string; // "09:00"
  duration: number; // minutes
}

// Tech/Builder Types
export interface Project {
  id: string;
  name: string;
  status: "building" | "shipped";
  techStack: string[];
}

// Dashboard Overview (Mix of everything)
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