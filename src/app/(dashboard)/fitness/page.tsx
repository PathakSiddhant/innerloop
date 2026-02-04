"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dumbbell, Utensils, Droplets, Footprints, Calendar as CalendarIcon,
  ChevronLeft, ChevronRight, X, Trash2, Edit2, Check,
  Activity, Moon, Sun, ArrowUpRight, Trophy, Flame, Scale, Play,
  RotateCcw, PartyPopper, Target, Sparkles, Loader2
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, Tooltip as RechartsTooltip, ResponsiveContainer 
} from "recharts";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// --- BACKEND ACTIONS ---
import { getFitnessDay, saveFitnessDay, getFitnessHistory } from "@/lib/actions/fitness";

/** * ------------------------------------------------------------------
 * FITNESS STUDIO - V10.3 (STREAK GRID FIXED + HEADER FIXED)
 * ------------------------------------------------------------------
 */

// --- UTILS ---
function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
const generateId = () => Math.random().toString(36).substring(2, 9);

// --- FIXED DATE FORMATTER (LOCAL TIMEZONE) ---
const formatDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// --- STYLES ---
const globalStyles = `
  input[type=number]::-webkit-inner-spin-button, 
  input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
  input[type=number] { -moz-appearance: textfield; }
  .custom-scrollbar::-webkit-scrollbar { width: 4px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: #52525b; border-radius: 10px; }
`;

// --- TYPES ---
interface Set { id: string; weight: number; reps: number; completed: boolean; }
interface Exercise { id: string; name: string; sets: Set[]; isCollapsed: boolean; }
interface WorkoutSession { 
  id: string; name: string; startTime: number; endTime: number | null; exercises: Exercise[]; 
}
interface FoodItem { id: string; name: string; cals: number; p: number; c: number; f: number; }
type MacroKey = 'cals' | 'p' | 'c' | 'f';

interface DayData {
  date: string; isRestDay: boolean; sessions: WorkoutSession[];
  macroGoal: Record<MacroKey, number>;
  meals: FoodItem[];
  waterGoal: number; waterIntake: number;
  stepGoal: number; stepCount: number;
  bodyWeight: number | null;
  targetWeight: number | null;
}
interface UserSettings { targetWeight: number; }

const DEFAULT_MACROS: Record<MacroKey, number> = { cals: 2500, p: 180, c: 250, f: 70 };

export default function FitnessStudio() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const dateKey = useMemo(() => formatDateKey(selectedDate), [selectedDate]);
  
  // Local cache
  const [db, setDb] = useState<Record<string, DayData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<DayData[]>([]); 
  
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [settings, setSettings] = useState({ targetWeight: 75 });

  // Debounce Ref
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // --- 1. FETCH DATA ---
  useEffect(() => {
    const loadData = async () => {
      if (!db[dateKey]) setIsLoading(true);
      
      try {
        const [dayData, historyData] = await Promise.all([
          getFitnessDay(dateKey),
          getFitnessHistory()
        ]);

        if (dayData) {
          setDb(prev => ({ ...prev, [dateKey]: { ...dayData, date: dateKey } as unknown as DayData }));
          if ((dayData as any).targetWeight) {
             setSettings({ targetWeight: (dayData as any).targetWeight });
          }
        } else {
          setDb(prev => ({
            ...prev,
            [dateKey]: {
              date: dateKey, isRestDay: false, sessions: [], macroGoal: DEFAULT_MACROS, meals: [],
              waterGoal: 3000, waterIntake: 0, stepGoal: 10000, stepCount: 0, bodyWeight: null, targetWeight: 75
            }
          }));
        }

        if (historyData) setHistory(historyData as unknown as DayData[]);
      } catch (error) {
        console.error("Failed to load fitness data", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateKey]);

  // --- 2. UPDATE & AUTO-SAVE ---
  const updateDay = (updates: Partial<DayData>) => {
    setDb(prev => {
      const existing = prev[dateKey] || {
        date: dateKey, isRestDay: false, sessions: [], macroGoal: DEFAULT_MACROS, meals: [],
        waterGoal: 3000, waterIntake: 0, stepGoal: 10000, stepCount: 0, bodyWeight: null, targetWeight: 75
      };
      const updatedDay = { ...existing, ...updates };
      
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await saveFitnessDay(dateKey, updatedDay as any); 
      }, 1000);

      return { ...prev, [dateKey]: updatedDay };
    });
  };
  
  const updateSettings = (newSettings: { targetWeight: number }) => {
      setSettings(newSettings);
      updateDay({ targetWeight: newSettings.targetWeight });
  };

  const currentDay = db[dateKey] || {
    date: dateKey, isRestDay: false, sessions: [], macroGoal: DEFAULT_MACROS, meals: [],
    waterGoal: 3000, waterIntake: 0, stepGoal: 10000, stepCount: 0, bodyWeight: null, targetWeight: 75
  };

  const weightHistory = useMemo(() => {
    const source = history.length > 0 ? history : Object.values(db);
    return source
      .filter((d) => d.bodyWeight !== null)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((d: any) => ({ date: d.date.slice(5), weight: d.bodyWeight }));
  }, [history, db]);

  const streakInfo = useMemo(() => {
    const source = history.length > 0 ? [...history] : Object.values(db);
    const today = formatDateKey(new Date());
    let currentStreak = 0;
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    source.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

    for (const day of source) {
      if (day.date > today) continue;
      const isActive = day.sessions?.length > 0 || day.isRestDay || (day.stepGoal > 0 && day.stepCount >= day.stepGoal && day.waterGoal > 0 && day.waterIntake >= day.waterGoal);
      if (isActive) currentStreak++;
      else if (day.date !== today) break;
    }
    return { current: currentStreak, max: Math.max(currentStreak, 5) };
  }, [history, db]);

  return (
    <div className={cn(
      "min-h-screen font-sans transition-colors duration-500 overflow-x-hidden relative",
      "bg-zinc-50 text-zinc-900 dark:bg-[#050505] dark:text-zinc-100"
    )}>
      <div className={cn("transition-all duration-500", currentDay.isRestDay && "grayscale opacity-80 pointer-events-none select-none")} >
        <style>{globalStyles}</style>
        
        {/* 1. BACKGROUND */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]" />
          <div className="absolute top-0 right-0 w-full h-1/2 bg-linear-to-b from-blue-50/50 to-transparent dark:from-blue-950/20 dark:to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto p-4 md:p-8 space-y-10">
          
          {/* 2. HEADER */}
          <header className="flex flex-col md:flex-row justify-between items-end gap-6 pb-6 border-b border-zinc-200 dark:border-white/10 pointer-events-auto">
            <motion.div 
              initial={{ opacity: 0, x: -20 }} 
              animate={{ opacity: 1, x: 0 }}
              className="group cursor-default"
            >
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-1">
                <Activity size={16} />
                <span className="text-[11px] font-black tracking-[0.3em] uppercase">Athletic OS v10.2</span>
                {isLoading && <Loader2 size={12} className="animate-spin text-zinc-400 ml-2" />}
              </div>
              <motion.h1 
                // FIXED: Added pr-6 so 'S' doesn't cut
                className="text-5xl md:text-7xl font-black italic tracking-tighter text-zinc-900 dark:text-white flex flex-wrap gap-x-3 gap-y-0 items-center pr-6 pb-2"
                whileHover={{ x: 10 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">FITNESS</span>
                <span className="text-zinc-400 dark:text-zinc-700">STUDIO</span>
              </motion.h1>
            </motion.div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => updateDay({ isRestDay: !currentDay.isRestDay })}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-full border text-xs font-bold uppercase transition-all shadow-sm pointer-events-auto",
                  currentDay.isRestDay 
                    ? "bg-emerald-100 border-emerald-300 text-emerald-700 dark:bg-emerald-900/30 dark:border-emerald-500/50 dark:text-emerald-400" 
                    : "bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300 dark:bg-zinc-900 dark:border-white/10 dark:text-zinc-400 dark:hover:text-white"
                )}
              >
                {currentDay.isRestDay ? <Moon size={14} /> : <Sun size={14} />}
                {currentDay.isRestDay ? "Rest Day Active" : "Training Mode"}
              </button>

              <div className="relative pointer-events-auto">
                <button 
                  onClick={() => setCalendarOpen(!calendarOpen)}
                  className="flex items-center gap-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 px-5 py-2.5 rounded-full hover:border-indigo-500/50 transition-all text-sm font-bold shadow-sm"
                >
                  <CalendarIcon size={16} className="text-zinc-400" />
                  {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </button>
                <AnimatePresence>
                  {calendarOpen && (
                    <CalendarDropdown 
                      current={selectedDate} 
                      onSelect={(d) => { setSelectedDate(d); setCalendarOpen(false); }} 
                    />
                  )}
                </AnimatePresence>
              </div>
            </div>
          </header>

          {/* 3. DASHBOARD BENTO GRID */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-auto">
            
            {/* STREAK */}
            <motion.div whileHover={{ scale: 1.02 }} onClick={() => !currentDay.isRestDay && setActiveModal('streak')} className="md:col-span-4 cursor-pointer group relative overflow-hidden bg-zinc-900 border border-zinc-800 p-6 rounded-4xl shadow-xl h-80 text-white pointer-events-auto">
               <div 
                 className="absolute inset-0 bg-cover bg-center opacity-40 group-hover:opacity-50 transition-opacity"
                 style={{ backgroundImage: "url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1000&auto=format&fit=crop')" }}
               />
               <div className="absolute inset-0 bg-linear-to-t from-black via-black/40 to-transparent" />
               
               <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className="p-3 bg-orange-500/20 rounded-2xl text-orange-400 border border-orange-500/20"><Flame size={20}/></div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Streak</span>
               </div>
               <div className="relative z-10 mt-auto">
                  <div className="text-7xl font-black text-white tracking-tighter">{streakInfo.current}</div>
                  <div className="text-xs font-bold text-orange-400 uppercase mt-1">Days on Fire</div>
                  <div className="mt-6 flex gap-1">
                     {Array.from({length: 10}).map((_,i) => (
                        <div key={i} className={cn("flex-1 h-1.5 rounded-full transition-all", i < (streakInfo.current % 10) || (streakInfo.current >= 10 && i < 10) ? "bg-orange-500" : "bg-white/20")} />
                     ))}
                  </div>
               </div>
            </motion.div>

            {/* WORKOUT SUMMARY */}
            <motion.div whileHover={{ scale: 1.01 }} onClick={() => !currentDay.isRestDay && setActiveModal('workout')} className="md:col-span-8 cursor-pointer group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-8 rounded-4xl relative overflow-hidden shadow-2xl h-80 pointer-events-auto">
               <div 
                 className="absolute inset-0 w-full h-full bg-cover bg-center opacity-10 dark:opacity-30 group-hover:scale-105 transition-transform duration-700 mix-blend-multiply dark:mix-blend-overlay"
                 style={{ backgroundImage: "url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1000&auto=format&fit=crop')" }}
               />
               <div className="absolute inset-0 bg-linear-to-r from-white/90 via-white/50 to-transparent dark:from-black/90 dark:via-black/50 dark:to-transparent" />
               
               <div className="relative z-10 flex justify-between items-center h-full">
                  <div>
                     <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-purple-500/10 rounded-xl text-purple-600 dark:text-purple-400 border border-purple-500/20"><Dumbbell size={28} /></div>
                        <h2 className="text-4xl font-black italic uppercase text-zinc-900 dark:text-white tracking-tight">Workout Lab</h2>
                     </div>
                     <div className="space-y-2">
                        <p className="text-xl text-zinc-600 dark:text-zinc-300 font-medium">
                           {currentDay.sessions.length > 0 ? `${currentDay.sessions.length} Session(s) Done` : "Start Your Grind"}
                        </p>
                        <div className="flex gap-2">
                           {currentDay.sessions.length > 0 ? (
                              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg text-xs font-bold uppercase">{currentDay.sessions[0].name}</span>
                           ) : (
                              <span className="px-3 py-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg text-xs font-bold text-zinc-500 uppercase">Ready</span>
                           )}
                        </div>
                     </div>
                  </div>
                  <div className="h-24 w-24 bg-white/50 dark:bg-white/10 rounded-full flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-all duration-500 text-zinc-400 dark:text-zinc-500 border border-zinc-200 dark:border-white/10 backdrop-blur-md">
                     <ArrowUpRight size={40} />
                  </div>
               </div>
            </motion.div>

            {/* DIET */}
            <motion.div whileHover={{ scale: 1.02 }} onClick={() => !currentDay.isRestDay && setActiveModal('diet')} className="md:col-span-6 lg:col-span-4 cursor-pointer group bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 p-6 rounded-4xl hover:border-orange-500/50 transition-all shadow-lg relative overflow-hidden h-65 pointer-events-auto">
               <div 
                 className="absolute inset-0 w-full h-full bg-cover bg-center opacity-5 dark:opacity-20 group-hover:opacity-10 dark:group-hover:opacity-30 transition-opacity"
                 style={{ backgroundImage: "url('https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=1000&auto=format&fit=crop')" }}
               />
               
               <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className="p-3 bg-orange-100 dark:bg-orange-500/10 rounded-2xl text-orange-600 dark:text-orange-500 border border-orange-500/20"><Utensils size={20}/></div>
                  <span className="text-[10px] font-bold uppercase text-zinc-400">Nutrition</span>
               </div>
               
               <div className="relative z-10 mt-auto space-y-3">
                  <div className="flex justify-between items-baseline">
                     <span className="text-4xl font-black text-zinc-900 dark:text-white">
                        {currentDay.meals.reduce((acc, m) => acc + m.cals, 0)}
                     </span>
                     <span className="text-xs font-bold text-zinc-500 uppercase">/ {currentDay.macroGoal.cals} kcal</span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                     {(['p', 'c', 'f'] as MacroKey[]).map((m) => {
                        const total = currentDay.meals.reduce((acc, item) => acc + item[m], 0);
                        const goal = currentDay.macroGoal[m];
                        return (
                           <div key={m} className="bg-white/50 dark:bg-black/30 p-2 rounded-xl border border-zinc-200 dark:border-white/5 text-center backdrop-blur-sm">
                              <div className="text-[10px] font-bold uppercase text-zinc-500">{m}</div>
                              <div className="text-sm font-black text-zinc-800 dark:text-zinc-200">{total}g</div>
                              <div className="h-1 w-full bg-zinc-300 dark:bg-zinc-700 rounded-full mt-1 overflow-hidden">
                                 <div className={cn("h-full", m==='p'?'bg-blue-500':m==='c'?'bg-green-500':'bg-yellow-500')} style={{width: `${Math.min((total/goal)*100, 100)}%`}} />
                              </div>
                           </div>
                        )
                     })}
                  </div>
               </div>
            </motion.div>

            {/* WATER */}
            <motion.div whileHover={{ scale: 1.02 }} onClick={() => !currentDay.isRestDay && setActiveModal('water')} className="md:col-span-6 lg:col-span-4 cursor-pointer group bg-blue-600 p-6 rounded-4xl relative overflow-hidden shadow-lg shadow-blue-500/20 h-65 pointer-events-auto">
               <div 
                 className="absolute inset-0 w-full h-full bg-cover bg-center opacity-30 mix-blend-overlay"
                 style={{ backgroundImage: "url('https://images.unsplash.com/photo-1548839140-29a749e1cf4d?q=80&w=1000&auto=format&fit=crop')" }}
               />
               <div className="relative z-10 text-white h-full flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                     <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md"><Droplets size={20}/></div>
                     <span className="text-[10px] font-bold uppercase opacity-80">Hydration</span>
                  </div>
                  <div className="text-center">
                     <div className="text-6xl font-black tracking-tighter drop-shadow-lg">{currentDay.waterIntake}</div>
                     <div className="text-sm font-bold opacity-80 mt-1">/ {currentDay.waterGoal} ml</div>
                  </div>
                  <div className="h-4" /> 
               </div>
               {/* Liquid Wave */}
               <motion.div 
                  animate={{ y: [0, -15, 0], rotate: [0, 2, 0] }} 
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -bottom-10 left-[-20%] w-[140%] h-32 bg-white/20 rounded-[50%] blur-xl" 
               />
            </motion.div>

            {/* STEPS */}
            <motion.div whileHover={{ scale: 1.02 }} onClick={() => !currentDay.isRestDay && setActiveModal('steps')} className="md:col-span-12 lg:col-span-4 cursor-pointer group bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 p-6 rounded-4xl hover:border-emerald-500/50 transition-all shadow-lg dark:shadow-none relative overflow-hidden h-65 flex flex-col justify-between pointer-events-auto">
               <div 
                 className="absolute inset-0 w-full h-full bg-cover bg-center opacity-10 dark:opacity-20 group-hover:opacity-15 dark:group-hover:opacity-30 transition-opacity grayscale mix-blend-multiply dark:mix-blend-overlay"
                 style={{ backgroundImage: "url('https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?q=80&w=1000&auto=format&fit=crop')" }}
               />
               <div className="absolute inset-0 bg-linear-to-t from-zinc-100/50 via-transparent to-transparent dark:from-black/50 dark:via-transparent dark:to-transparent" />

               <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className="p-3 bg-emerald-100 dark:bg-emerald-500/10 rounded-2xl text-emerald-600 dark:text-emerald-500 border border-emerald-500/20"><Footprints size={20}/></div>
                  <span className="text-[10px] font-bold uppercase text-zinc-500">Activity</span>
               </div>
               <div className="relative z-10 flex items-end justify-between">
                  <div>
                     <div className="text-5xl font-black text-zinc-900 dark:text-white">{currentDay.stepCount}</div>
                     <div className="text-xs text-zinc-500 font-bold mt-1">Goal: {currentDay.stepGoal}</div>
                  </div>
                  {/* Speedometer Visual */}
                  <div className="w-16 h-16 relative">
                     <svg className="w-full h-full" viewBox="0 0 100 100">
                        <path d="M 10 50 A 40 40 0 1 1 90 50" fill="none" stroke="currentColor" strokeWidth="8" className="text-zinc-200 dark:text-zinc-800" strokeLinecap="round" />
                        <path d="M 10 50 A 40 40 0 1 1 90 50" fill="none" stroke="#10b981" strokeWidth="8" strokeDasharray={126} strokeDashoffset={126 - (126 * Math.min(currentDay.stepCount/currentDay.stepGoal, 1))} strokeLinecap="round" className="transition-all duration-1000" />
                     </svg>
                  </div>
               </div>
            </motion.div>

            {/* WEIGHT */}
            <motion.div whileHover={{ scale: 1.01 }} onClick={() => !currentDay.isRestDay && setActiveModal('weight')} className="md:col-span-12 cursor-pointer group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 p-6 rounded-4xl hover:border-pink-500/50 transition-all shadow-lg dark:shadow-none h-65 flex flex-col relative overflow-hidden pointer-events-auto">
               <div 
                 className="absolute inset-0 w-full h-full bg-cover bg-center opacity-5 dark:opacity-20 mix-blend-multiply dark:mix-blend-overlay"
                 style={{ backgroundImage: "url('https://images.unsplash.com/photo-1576678927484-cc907957088c?q=80&w=1000&auto=format&fit=crop')" }}
               />
               <div className="flex justify-between items-center mb-4 relative z-10">
                  <div className="flex items-center gap-2 text-pink-500">
                     <div className="p-2 bg-pink-500/10 rounded-xl"><Scale size={20} /></div>
                     <span className="text-xs font-bold uppercase text-zinc-500">Weight Trend</span>
                  </div>
                  <div className="text-center">
                     <div className="text-3xl font-black text-zinc-900 dark:text-white">{currentDay.bodyWeight || "--"} <span className="text-lg font-medium text-zinc-500">kg</span></div>
                     <div className="text-[10px] font-bold text-zinc-400 uppercase">Target: {settings.targetWeight} kg</div>
                  </div>
               </div>
               <div className="flex-1 w-full relative z-10">
                  <ResponsiveContainer width="100%" height="100%">
                     <AreaChart data={weightHistory}>
                        <defs>
                           <linearGradient id="gWeight" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                           </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="weight" stroke="#ec4899" fill="url(#gWeight)" strokeWidth={3} />
                     </AreaChart>
                  </ResponsiveContainer>
               </div>
            </motion.div>

          </div>
        </div>
      </div>

      {/* --- MODALS --- */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
              onClick={() => setActiveModal(null)}
              className="absolute inset-0 bg-zinc-200/80 dark:bg-black/90 backdrop-blur-xl" 
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 40 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 40 }}
              className="relative w-full max-w-4xl h-[90vh] bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 rounded-[48px] shadow-2xl overflow-hidden flex flex-col"
            >
               <button onClick={() => setActiveModal(null)} className="absolute top-6 right-6 p-2 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-500 transition-colors z-50">
                  <X size={20} />
               </button>

               <div className="flex-1 overflow-y-auto custom-scrollbar p-8 pt-20">
                  {activeModal === 'workout' && <WorkoutModal day={currentDay} updateDay={updateDay} />}
                  {activeModal === 'diet' && <DietModal day={currentDay} updateDay={updateDay} />}
                  {activeModal === 'water' && <WaterModal day={currentDay} updateDay={updateDay} />}
                  {activeModal === 'steps' && <StepsModal day={currentDay} updateDay={updateDay} />}
                  {activeModal === 'weight' && <WeightModal day={currentDay} updateDay={updateDay} history={weightHistory} settings={settings} updateSettings={updateSettings} />}
                  {activeModal === 'calendar' && <CalendarModal selected={selectedDate} onSelect={(d) => { setSelectedDate(d); setActiveModal(null); }} />}
                  {activeModal === 'streak' && <StreakModal db={db} streakInfo={streakInfo} history={history} />}
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

// ... [WorkoutModal, DietModal, WaterModal, WeightModal, StepsModal, CalendarDropdown ... NO CHANGE] ...
// (These are same as previous, just ensure they are included below)

// ... [INCLUDED MODALS FOR COMPLETENESS] ...

function WorkoutModal({ day, updateDay }: { day: DayData, updateDay: (updates: Partial<DayData>) => void }) {
   const [tab, setTab] = useState<'new' | 'history'>('new');
   const [activeSession, setActiveSession] = useState<WorkoutSession | null>(null);
   const [elapsed, setElapsed] = useState(0);

   useEffect(() => {
      let interval: NodeJS.Timeout;
      if (activeSession) interval = setInterval(() => setElapsed(Date.now() - activeSession.startTime), 1000);
      return () => clearInterval(interval);
   }, [activeSession]);

   const startSession = (name: string) => setActiveSession({ id: generateId(), name, startTime: Date.now(), endTime: null, exercises: [] });
   
   const addExercise = () => {
      if(!activeSession) return;
      const newEx = { id: generateId(), name: "", sets: [{ id: generateId(), weight: 0, reps: 0, completed: false }], isCollapsed: false };
      setActiveSession({ ...activeSession, exercises: [...activeSession.exercises, newEx] });
   };

   const updateExercise = (idx: number, updates: Partial<Exercise>) => {
      if(!activeSession) return;
      const exs = [...activeSession.exercises];
      exs[idx] = { ...exs[idx], ...updates };
      setActiveSession({ ...activeSession, exercises: exs });
   };

   const endSession = () => {
      if(!activeSession) return;
      updateDay({ sessions: [...day.sessions, { ...activeSession, endTime: Date.now() }] });
      setActiveSession(null);
      setTab('history');
   };

   const updateHistorySession = (sIdx: number, updatedSession: WorkoutSession) => {
      const newSessions = [...day.sessions];
      newSessions[sIdx] = updatedSession;
      updateDay({ sessions: newSessions });
   };

   const deleteHistorySession = (sIdx: number) => {
      if(confirm("Delete this session?")) {
         const newSessions = day.sessions.filter((_, i) => i !== sIdx);
         updateDay({ sessions: newSessions });
      }
   };

   return (
      <div className="max-w-3xl mx-auto space-y-8">
         <div className="text-center space-y-2">
            <h2 className="text-4xl font-black italic uppercase text-zinc-900 dark:text-white">Training Command</h2>
            <p className="text-zinc-500">Log your performance. Analyze your growth.</p>
         </div>

         {!activeSession && (
            <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-2xl border border-zinc-200 dark:border-white/5">
               <button onClick={() => setTab('new')} className={cn("flex-1 py-3 rounded-xl font-bold transition-all", tab === 'new' ? "bg-white dark:bg-zinc-800 text-black dark:text-white shadow" : "text-zinc-500 hover:text-black dark:hover:text-white")}>Start Session</button>
               <button onClick={() => setTab('history')} className={cn("flex-1 py-3 rounded-xl font-bold transition-all", tab === 'history' ? "bg-white dark:bg-zinc-800 text-black dark:text-white shadow" : "text-zinc-500 hover:text-black dark:hover:text-white")}>History</button>
            </div>
         )}

         {activeSession ? (
            <div className="space-y-6 animate-in slide-in-from-bottom-10">
               <div className="sticky top-0 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl p-4 border-b border-zinc-200 dark:border-white/10 flex justify-between items-center z-20 rounded-xl shadow-sm">
                  <div>
                     <span className="text-[10px] font-bold uppercase text-red-500 tracking-widest animate-pulse">Live Recording</span>
                     <h3 className="text-2xl font-black text-zinc-900 dark:text-white">{activeSession.name}</h3>
                  </div>
                  <div className="text-3xl font-mono font-bold text-zinc-900 dark:text-white">{new Date(elapsed).toISOString().substr(11, 8)}</div>
               </div>

               <div className="space-y-4">
                  {activeSession.exercises.map((ex, i) => (
                     <div key={ex.id} className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-4xl p-6 relative transition-all hover:border-purple-500/30">
                        <button onClick={() => {
                           const exs = [...activeSession.exercises]; exs.splice(i, 1);
                           setActiveSession({ ...activeSession, exercises: exs });
                        }} className="absolute top-6 right-6 text-zinc-400 hover:text-red-500"><X size={18}/></button>
                        
                        <input 
                           placeholder="Exercise Name" 
                           className="w-full bg-transparent text-xl font-bold text-zinc-900 dark:text-white outline-none mb-6 placeholder:text-zinc-400" 
                           value={ex.name}
                           onChange={(e) => updateExercise(i, { name: e.target.value })}
                           autoFocus={!ex.name}
                        />
                        
                        <div className="space-y-2">
                           <div className="grid grid-cols-10 gap-2 text-[10px] uppercase font-bold text-zinc-500 mb-2 px-2">
                              <span className="col-span-1 text-center">#</span>
                              <span className="col-span-4 text-center">KG</span>
                              <span className="col-span-4 text-center">Reps</span>
                              <span className="col-span-1"></span>
                           </div>
                           {ex.sets.map((s, j) => (
                              <div key={s.id} className="grid grid-cols-10 gap-2 items-center">
                                 <span className="col-span-1 text-center font-mono text-zinc-500">{j+1}</span>
                                 <input type="number" className="col-span-4 bg-white dark:bg-black border border-zinc-200 dark:border-white/10 rounded-lg p-3 text-center font-bold text-zinc-900 dark:text-white outline-none focus:border-purple-500" 
                                    value={s.weight || ''} onChange={(e) => {
                                       const ns = [...ex.sets]; ns[j].weight = Number(e.target.value);
                                       updateExercise(i, { sets: ns });
                                    }}
                                 />
                                 <input type="number" className="col-span-4 bg-white dark:bg-black border border-zinc-200 dark:border-white/10 rounded-lg p-3 text-center font-bold text-zinc-900 dark:text-white outline-none focus:border-purple-500"
                                    value={s.reps || ''} onChange={(e) => {
                                       const ns = [...ex.sets]; ns[j].reps = Number(e.target.value);
                                       updateExercise(i, { sets: ns });
                                    }}
                                 />
                                 <button onClick={() => {
                                    const ns = [...ex.sets]; ns[j].completed = !ns[j].completed;
                                    updateExercise(i, { sets: ns });
                                 }} className={cn("col-span-1 flex justify-center", s.completed ? "text-green-500" : "text-zinc-400")}>
                                    <Check size={20} />
                                 </button>
                              </div>
                           ))}
                           <div className="flex gap-2 mt-3">
                              <button onClick={() => {
                                 const ns: Set[] = [...ex.sets, { id: generateId(), weight: 0, reps: 0, completed: false }];
                                 updateExercise(i, { sets: ns });
                              }} className="flex-1 py-3 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 text-xs font-bold uppercase text-zinc-500 hover:text-black dark:hover:text-white hover:border-black dark:hover:border-white transition-colors">+ Set</button>
                              
                              {ex.sets.length > 0 && (
                                <button onClick={() => {
                                   const ns = [...ex.sets]; ns.pop();
                                   updateExercise(i, { sets: ns });
                                }} className="px-4 py-3 rounded-xl border border-dashed border-red-200 dark:border-red-900/30 text-xs font-bold uppercase text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">Delete Set</button>
                              )}
                           </div>
                        </div>
                     </div>
                  ))}
                  
                  <button onClick={addExercise} className="w-full py-6 rounded-3xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 font-bold uppercase hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-black dark:hover:text-white transition-all">+ Add Exercise</button>
               </div>

               <div className="fixed bottom-8 left-0 right-0 px-8 flex justify-center pointer-events-none">
                  <button onClick={endSession} className="pointer-events-auto bg-red-600 text-white px-12 py-4 rounded-full font-black uppercase shadow-2xl hover:scale-105 transition-transform">
                     Finish Workout
                  </button>
               </div>
            </div>
         ) : tab === 'new' ? (
            <div className="grid grid-cols-2 gap-4 animate-in fade-in">
               <div className="col-span-2 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-8 rounded-4xl">
                  <label className="text-xs font-bold uppercase text-zinc-500">Session Name</label>
                  <div className="flex gap-4 mt-4">
                     <input id="sessionNameInput" placeholder="e.g. Chest & Back" className="flex-1 bg-transparent text-3xl font-black text-zinc-900 dark:text-white outline-none border-b border-zinc-300 dark:border-zinc-800 focus:border-purple-500 pb-2" />
                     <button onClick={() => startSession((document.getElementById('sessionNameInput') as HTMLInputElement).value || "Workout")} className="h-14 w-14 bg-black dark:bg-white rounded-full flex items-center justify-center text-white dark:text-black hover:scale-110 transition-transform"><ArrowUpRight size={24}/></button>
                  </div>
               </div>
               {['Push Day', 'Pull Day', 'Leg Day', 'Upper Body', 'Cardio'].map(n => (
                  <button key={n} onClick={() => startSession(n)} className="p-6 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-3xl text-left hover:border-purple-500/50 hover:bg-white dark:hover:bg-zinc-800 transition-all">
                     <span className="font-bold text-zinc-900 dark:text-white text-lg">{n}</span>
                  </button>
               ))}
            </div>
         ) : (
            <div className="space-y-6">
               {day.sessions.length === 0 ? (
                  <div className="text-center py-20 text-zinc-500 font-bold">No sessions logged today.</div>
               ) : (
                  day.sessions.map((s, i) => (
                     <HistorySessionItem key={s.id} session={s} onUpdate={(updated) => updateHistorySession(i, updated)} onDelete={() => deleteHistorySession(i)} />
                  ))
               )}
            </div>
         )}
      </div>
   );
}

function HistorySessionItem({ session, onUpdate, onDelete }: { session: WorkoutSession, onUpdate: (s: WorkoutSession) => void, onDelete: () => void }) {
   const [isEditing, setIsEditing] = useState(false);
   const [editedSession, setEditedSession] = useState(session);

   const save = () => { onUpdate(editedSession); setIsEditing(false); };

   return (
      <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 p-6 rounded-4xl">
         <div className="flex justify-between items-start mb-6">
            <div className="flex-1 mr-4">
               {isEditing ? (
                  <input value={editedSession.name} onChange={e => setEditedSession({...editedSession, name: e.target.value})} className="bg-white dark:bg-black border border-zinc-300 dark:border-white/10 p-2 rounded text-xl font-black text-zinc-900 dark:text-white w-full" />
               ) : (
                  <h3 className="text-2xl font-black text-zinc-900 dark:text-white uppercase italic">{session.name}</h3>
               )}
               <p className="text-zinc-500 text-sm font-mono mt-1">{new Date(session.startTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</p>
            </div>
            <div className="flex gap-2">
               {isEditing ? (
                  <button onClick={save} className="p-2 rounded-xl bg-green-600 text-white"><Check size={18}/></button>
               ) : (
                  <>
                     <button onClick={() => setIsEditing(true)} className="p-2 bg-zinc-200 dark:bg-zinc-800 rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-white"><Edit2 size={18}/></button>
                     <button onClick={onDelete} className="p-2 bg-zinc-200 dark:bg-zinc-800 rounded-xl text-zinc-500 hover:text-red-500"><Trash2 size={18}/></button>
                  </>
               )}
            </div>
         </div>

         <div className="space-y-4">
            {editedSession.exercises.map((ex, i) => (
               <div key={ex.id} className="border-l-2 border-zinc-300 dark:border-zinc-800 pl-4 relative group">
                  {isEditing ? (
                     <div className="mb-2 flex justify-between">
                        <input value={ex.name} onChange={e => {
                           const exs = [...editedSession.exercises]; exs[i].name = e.target.value;
                           setEditedSession({...editedSession, exercises: exs});
                        }} className="bg-white dark:bg-black border border-zinc-300 dark:border-white/10 p-1 rounded font-bold text-zinc-900 dark:text-white w-[80%]" />
                        <button onClick={() => {
                           const newExs = [...editedSession.exercises]; newExs.splice(i, 1);
                           setEditedSession({...editedSession, exercises: newExs});
                        }} className="text-red-500"><X size={14}/></button>
                     </div>
                  ) : (
                     <div className="font-bold text-zinc-700 dark:text-zinc-300 mb-2">{ex.name}</div>
                  )}
                  
                  <div className="space-y-1">
                     {ex.sets.map((set, j) => (
                        <div key={set.id} className="flex gap-2 text-sm items-center">
                           {isEditing ? (
                              <>
                                 <input type="number" value={set.weight} onChange={e => {
                                    const exs = [...editedSession.exercises]; exs[i].sets[j].weight = Number(e.target.value);
                                    setEditedSession({...editedSession, exercises: exs});
                                 }} className="w-16 bg-white dark:bg-black border border-zinc-300 dark:border-white/10 p-1 rounded text-center text-zinc-900 dark:text-white" />
                                 <span className="py-1 text-zinc-500">kg</span>
                                 <input type="number" value={set.reps} onChange={e => {
                                    const exs = [...editedSession.exercises]; exs[i].sets[j].reps = Number(e.target.value);
                                    setEditedSession({...editedSession, exercises: exs});
                                 }} className="w-12 bg-white dark:bg-black border border-zinc-300 dark:border-white/10 p-1 rounded text-center text-zinc-900 dark:text-white" />
                                 <span className="py-1 text-zinc-500">reps</span>
                                 <button onClick={() => {
                                    const exs = [...editedSession.exercises]; exs[i].sets.splice(j, 1);
                                    setEditedSession({...editedSession, exercises: exs});
                                 }} className="text-red-500 ml-2"><X size={12}/></button>
                              </>
                           ) : (
                              <div className="px-3 py-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg text-zinc-600 dark:text-zinc-400 font-mono text-xs">
                                 {set.weight}kg × {set.reps}
                              </div>
                           )}
                        </div>
                     ))}
                  </div>
               </div>
            ))}
         </div>
      </div>
   );
}

function DietModal({ day, updateDay }: { day: DayData, updateDay: (updates: Partial<DayData>) => void }) {
   const [newFood, setNewFood] = useState({ name: "", cals: 0, p: 0, c: 0, f: 0 });
   const [isEditingGoal, setIsEditingGoal] = useState(false);
   
   const totals = day.meals.reduce((acc, m) => ({ 
      cals: acc.cals + m.cals, p: acc.p + m.p, c: acc.c + m.c, f: acc.f + m.f 
   }), { cals: 0, p: 0, c: 0, f: 0 });

   return (
      <div className="max-w-2xl mx-auto space-y-8">
         <div className="flex justify-between items-center">
            <h2 className="text-3xl font-black italic uppercase text-orange-500">Nutrition OS</h2>
            <button onClick={() => setIsEditingGoal(!isEditingGoal)} className="text-xs font-bold bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-4 py-2 rounded-full hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors">
               {isEditingGoal ? "Save Goals" : "Edit Goals"}
            </button>
         </div>

         {/* GOALS */}
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(['cals', 'p', 'c', 'f'] as const).map(key => (
               <div key={key} className="bg-zinc-100 dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-white/5">
                  <div className="text-[10px] font-bold uppercase text-zinc-500 mb-1">{key}</div>
                  {isEditingGoal ? (
                     <input type="number" className="w-full bg-white dark:bg-black border border-zinc-300 dark:border-zinc-800 rounded p-1 text-xl font-black text-zinc-900 dark:text-white" 
                        value={day.macroGoal[key]} 
                        onChange={e => updateDay({ macroGoal: { ...day.macroGoal, [key]: Number(e.target.value) } })} 
                     />
                  ) : (
                     <div className="text-2xl font-black text-zinc-900 dark:text-white">{day.macroGoal[key]}</div>
                  )}
                  <div className="text-xs text-zinc-500 mt-1">
                     Used: {(totals as Record<string, number>)[key]}
                  </div>
                  {/* Mini Bar */}
                  <div className="h-1 w-full bg-zinc-300 dark:bg-zinc-800 mt-2 rounded-full overflow-hidden">
                     <div className={cn("h-full", key === 'cals' ? 'bg-orange-500' : key === 'p' ? 'bg-blue-500' : key === 'c' ? 'bg-green-500' : 'bg-yellow-500')} 
                        style={{width: `${Math.min(((totals as any)[key] / day.macroGoal[key])*100, 100)}%`}} />
                  </div>
               </div>
            ))}
         </div>

         {/* ADD FOOD */}
         <div className="bg-zinc-100 dark:bg-zinc-900/50 p-6 rounded-4xl border border-zinc-200 dark:border-white/5">
            <h4 className="text-sm font-bold uppercase text-zinc-500 mb-4">Quick Log</h4>
            <div className="flex flex-col gap-4">
               <input placeholder="Food Name (e.g. Oatmeal)" className="w-full bg-transparent text-xl font-bold text-zinc-900 dark:text-white outline-none border-b border-zinc-300 dark:border-zinc-800 pb-2 focus:border-orange-500 transition-colors placeholder:text-zinc-400"
                  value={newFood.name} onChange={e => setNewFood({...newFood, name: e.target.value})}
               />
               <div className="grid grid-cols-4 gap-4">
                  {(['cals', 'p', 'c', 'f'] as const).map(k => (
                     <div key={k} className="flex flex-col">
                        <label className="text-[9px] font-bold uppercase text-zinc-600 mb-1">{k}</label>
                        <input type="number" className="bg-white dark:bg-black/50 rounded-xl p-3 text-center text-zinc-900 dark:text-white font-bold outline-none focus:ring-1 ring-orange-500 border border-zinc-200 dark:border-zinc-800" 
                           value={newFood[k] || ''} onChange={e => setNewFood({...newFood, [k]: Number(e.target.value)})} 
                        />
                     </div>
                  ))}
               </div>
               <button onClick={() => {
                  if(newFood.name) {
                     updateDay({ meals: [...day.meals, { ...newFood, id: generateId() }] });
                     setNewFood({ name: "", cals: 0, p: 0, c: 0, f: 0 });
                  }
               }} className="w-full py-4 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-xl font-bold uppercase hover:bg-orange-500 dark:hover:bg-orange-500 hover:text-white transition-colors mt-2">
                  Log Meal
               </button>
            </div>
         </div>

         {/* MEAL LIST */}
         <div className="space-y-3">
            {day.meals.map((m, i) => (
               <div key={m.id} className="flex justify-between items-center p-5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-2xl group">
                  <div>
                     <div className="font-bold text-zinc-900 dark:text-white text-lg">{m.name}</div>
                     <div className="text-xs text-zinc-500 font-mono mt-1">
                        {m.cals} cal • P:{m.p} • C:{m.c} • F:{m.f}
                     </div>
                  </div>
                  <button onClick={() => {
                     const nM = [...day.meals]; nM.splice(i, 1);
                     updateDay({ meals: nM });
                  }} className="text-zinc-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={18}/></button>
               </div>
            ))}
         </div>
      </div>
   );
}

function WaterModal({ day, updateDay }: { day: DayData, updateDay: (updates: Partial<DayData>) => void }) {
   const [isEditing, setIsEditing] = useState(false);
   const [isSplash, setIsSplash] = useState(false);
   
   const target = day.waterGoal || 3000;
   const current = day.waterIntake || 0;
   // FIX: Ensure fillHeight calculates correctly from 1ml
   const fillRatio = target > 0 ? Math.min(current / target, 1) : 0;
   const fillHeight = fillRatio * 200;

   // Trigger splash on click, not effect
   const addWater = (amt: number) => {
      const newTotal = day.waterIntake + amt;
      updateDay({ waterIntake: newTotal });
      if (newTotal >= target && current < target) {
         setIsSplash(true);
         setTimeout(() => setIsSplash(false), 2000);
      }
   };

   return (
      <div className="flex flex-col items-center h-full justify-between pb-8">
         <div className="text-center space-y-1 relative w-full">
            <h2 className="text-3xl font-black italic uppercase text-blue-500">Hydration</h2>
            <button onClick={() => setIsEditing(!isEditing)} className="absolute right-0 top-0 text-xs font-bold text-zinc-500 hover:text-blue-500">
               {isEditing ? "Done" : "Edit Goal"}
            </button>
         </div>

         {isEditing && (
            <div className="flex items-center gap-2 animate-in fade-in">
               <span className="text-sm font-bold text-zinc-500">Daily Goal:</span>
               <input type="number" value={day.waterGoal} onChange={e => updateDay({ waterGoal: Number(e.target.value) })} className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 p-2 rounded-lg font-bold w-24 text-center" />
            </div>
         )}

         <motion.div 
            animate={isSplash ? { scale: [1, 1.1, 1], rotate: [0, -5, 5, 0] } : {}}
            transition={{ duration: 0.5 }}
            className="relative w-48 h-75"
         >
            {/* SVG BOTTLE */}
            <svg viewBox="0 0 100 200" className="w-full h-full drop-shadow-[0_0_50px_rgba(59,130,246,0.3)]">
               <defs>
                  <clipPath id="waterClip">
                     <path d="M25,0 L75,0 C80,0 85,5 85,10 L90,40 C95,45 100,50 100,60 L100,190 C100,200 90,200 50,200 C10,200 0,200 0,190 L0,60 C0,50 5,45 10,40 L15,10 C15,5 20,0 25,0 Z" fill="white" />
                  </clipPath>
               </defs>
               
               {/* Bottle Shell */}
               <path d="M25,0 L75,0 C80,0 85,5 85,10 L90,40 C95,45 100,50 100,60 L100,190 C100,200 90,200 50,200 C10,200 0,200 0,190 L0,60 C0,50 5,45 10,40 L15,10 C15,5 20,0 25,0 Z" fill="#18181b" stroke="#27272a" strokeWidth="2" className="fill-zinc-200 dark:fill-zinc-900 stroke-zinc-300 dark:stroke-zinc-800" />
               
               {/* Liquid */}
               <motion.rect 
                  x="0" 
                  y={200 - fillHeight} 
                  width="100" 
                  height={fillHeight} 
                  fill="#3b82f6" 
                  clipPath="url(#waterClip)"
                  animate={{ height: fillHeight, y: 200 - fillHeight }}
                  transition={{ type: "spring", stiffness: 50, damping: 20 }}
               />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mix-blend-difference">
               <span className="text-4xl font-black text-zinc-900 dark:text-white mix-blend-difference">{day.waterIntake}</span>
               <span className="text-xs font-bold text-zinc-500 mix-blend-difference">ml</span>
            </div>
         </motion.div>

         <div className="grid grid-cols-4 gap-3 w-full max-w-md">
            {[250, 500, 750, 1000].map(amt => (
               <button key={amt} onClick={() => addWater(amt)} className="py-4 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl text-blue-500 font-bold hover:bg-blue-600 hover:text-white transition-all shadow-lg">
                  +{amt}
               </button>
            ))}
         </div>
         <button onClick={() => updateDay({ waterIntake: 0 })} className="flex items-center gap-2 text-xs font-bold text-red-500 uppercase hover:text-red-700">
            <RotateCcw size={14}/> Reset Bottle
         </button>
      </div>
   );
}

function WeightModal({ day, updateDay, history, settings, updateSettings }: { day: DayData, updateDay: (updates: Partial<DayData>) => void, history: any[], settings: UserSettings, updateSettings: (s: UserSettings) => void }) {
   return (
      <div className="space-y-10">
         <div className="text-center">
            <h2 className="text-3xl font-black italic uppercase text-pink-500">Body Composition</h2>
         </div>

         <div className="grid grid-cols-2 gap-6">
            <div className="bg-zinc-100 dark:bg-zinc-900 p-6 rounded-4xl border border-zinc-200 dark:border-white/5 flex flex-col items-center justify-center">
               <span className="text-xs font-bold uppercase text-zinc-500 mb-2">Current Weight</span>
               <div className="flex items-baseline gap-1">
                  <input type="number" className="bg-transparent text-5xl font-black text-zinc-900 dark:text-white text-center w-32 outline-none border-b border-transparent focus:border-pink-500 transition-colors" 
                     value={day.bodyWeight || ''} onChange={e => updateDay({ bodyWeight: Number(e.target.value) })} placeholder="0.0" 
                  />
                  <span className="text-sm text-zinc-500 font-bold">KG</span>
               </div>
            </div>
            <div className="bg-zinc-100 dark:bg-zinc-900 p-6 rounded-4xl border border-zinc-200 dark:border-white/5 flex flex-col items-center justify-center relative group">
               <span className="text-xs font-bold uppercase text-zinc-500 mb-2">Target Goal</span>
               <div className="flex items-baseline gap-1">
                  <input type="number" className="bg-transparent text-5xl font-black text-zinc-400 focus:text-zinc-900 dark:focus:text-white text-center w-32 outline-none border-b border-transparent focus:border-green-500 transition-colors" 
                     value={settings.targetWeight} onChange={e => updateSettings({ targetWeight: Number(e.target.value) })} placeholder="0.0" 
                  />
                  <span className="text-sm text-zinc-500 font-bold">KG</span>
               </div>
               <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Edit2 size={12} className="text-zinc-400"/>
               </div>
            </div>
         </div>

         {/* Visual Progress Bar */}
         {day.bodyWeight && settings.targetWeight && (
            <div>
               <div className="flex justify-between text-xs font-bold uppercase text-zinc-500 mb-2">
                  <span>Start</span>
                  <span>Goal</span>
               </div>
               <div className="h-4 bg-zinc-200 dark:bg-zinc-900 rounded-full overflow-hidden border border-zinc-300 dark:border-white/5 relative">
                  <motion.div 
                     initial={{ width: 0 }} 
                     animate={{ width: `${Math.min((day.bodyWeight / settings.targetWeight) * 100, 100)}%` }} 
                     className="h-full bg-linear-to-r from-pink-500 to-purple-500" 
                  />
               </div>
            </div>
         )}

         <div className="h-64 w-full bg-zinc-100 dark:bg-zinc-900/50 rounded-3xl p-4 border border-zinc-200 dark:border-white/5">
            <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={history}>
                  <defs>
                     <linearGradient id="gWeight2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                     </linearGradient>
                  </defs>
                  <XAxis dataKey="date" hide />
                  <RechartsTooltip contentStyle={{ background: '#000', border: '1px solid #333', borderRadius: '12px' }} itemStyle={{ color: '#fff' }} />
                  <Area type="monotone" dataKey="weight" stroke="#ec4899" fill="url(#gWeight2)" strokeWidth={3} />
               </AreaChart>
            </ResponsiveContainer>
         </div>
      </div>
   );
}

function StepsModal({ day, updateDay }: { day: DayData, updateDay: (updates: Partial<DayData>) => void }) {
   const goalMet = day.stepCount >= day.stepGoal && day.stepGoal > 0;

   return (
      <div className="flex flex-col items-center justify-center h-full space-y-10">
         <h2 className="text-3xl font-black italic uppercase text-emerald-500">Activity</h2>
         
         <motion.div 
            animate={goalMet ? { scale: [1, 1.1, 1], rotate: [0, -2, 2, 0] } : {}}
            transition={{ duration: 0.5, repeat: goalMet ? 1 : 0 }}
            className="relative w-72 h-72"
         >
            {/* NEW RADIAL UI */}
            <svg className="w-full h-full -rotate-90">
               <circle cx="144" cy="144" r="120" stroke="currentColor" strokeWidth="24" fill="none" className="text-zinc-200 dark:text-zinc-900" />
               <motion.circle 
                  cx="144" cy="144" r="120" stroke="#10b981" strokeWidth="24" fill="none" 
                  strokeDasharray={753} 
                  strokeDashoffset={753 - (753 * Math.min(day.stepCount / day.stepGoal, 1))} 
                  strokeLinecap="round"
                  initial={{ strokeDashoffset: 753 }}
                  animate={{ strokeDashoffset: 753 - (753 * Math.min(day.stepCount / day.stepGoal, 1)) }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
               />
            </svg>
            
            {/* Center Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
               {goalMet && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-10"><PartyPopper className="text-yellow-500 w-12 h-12" /></motion.div>}
               
               <Footprints size={48} className={cn("mb-4 transition-colors", goalMet ? "text-yellow-500" : "text-emerald-500")} />
               
               <div className="w-48 flex justify-center">
                   <input 
                      type="number" className="bg-transparent text-5xl md:text-6xl font-black text-zinc-900 dark:text-white text-center w-full outline-none" 
                      value={day.stepCount} onChange={e => updateDay({ stepCount: Number(e.target.value) })} 
                   />
               </div>
               <p className="text-xs font-bold uppercase text-zinc-500 mt-2">Steps Today</p>
            </div>
         </motion.div>

         <div className="flex items-center gap-4 bg-zinc-100 dark:bg-zinc-900 px-8 py-4 rounded-2xl border border-zinc-200 dark:border-white/5">
            <span className="text-sm font-bold text-zinc-500 uppercase">Daily Goal:</span>
            <input 
               type="number" className="bg-transparent text-2xl font-black text-zinc-900 dark:text-white text-right w-32 outline-none border-b border-zinc-300 dark:border-zinc-700 focus:border-emerald-500" 
               value={day.stepGoal} onChange={e => updateDay({ stepGoal: Number(e.target.value) })} 
            />
         </div>
      </div>
   );
}

function CalendarDropdown({ current, onSelect }: { current: Date, onSelect: (d: Date) => void }) {
   const [viewDate, setViewDate] = useState(current);
   const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
   const startDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();

   return (
      <div className="absolute top-14 right-0 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-3xl p-6 shadow-2xl z-50 w-80">
         <div className="flex justify-between items-center mb-4">
            <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}><ChevronLeft size={16} className="text-zinc-600 dark:text-white" /></button>
            <span className="font-bold text-sm text-zinc-900 dark:text-white">{viewDate.toLocaleDateString('default', { month: 'long', year: 'numeric' })}</span>
            <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}><ChevronRight size={16} className="text-zinc-600 dark:text-white" /></button>
         </div>
         <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {['S','M','T','W','T','F','S'].map((d, i) => <div key={i} className="text-[10px] text-zinc-500 font-bold">{d}</div>)}
         </div>
         <div className="grid grid-cols-7 gap-1">
            {Array.from({length: startDay}).map((_, i) => <div key={`empty-${i}`} />)}
            {Array.from({length: daysInMonth}).map((_, i) => {
               const dayNum = i + 1;
               const d = new Date(viewDate.getFullYear(), viewDate.getMonth(), dayNum);
               const isSelected = formatDateKey(d) === formatDateKey(current);
               return (
                  <button 
                     key={dayNum} 
                     onClick={() => onSelect(d)}
                     className={cn(
                        "h-8 w-8 rounded-lg text-xs font-bold hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors text-zinc-500 dark:text-zinc-400",
                        isSelected && "bg-black dark:bg-white text-white dark:text-black shadow-lg"
                     )}
                  >
                     {dayNum}
                  </button>
               )
            })}
         </div>
      </div>
   );
}

function CalendarModal({ selected, onSelect }: { selected: Date, onSelect: (d: Date) => void }) {
   const [viewDate, setViewDate] = useState(selected);
   const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
   const startDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();

   return (
      <div className="space-y-8 text-center">
         <h2 className="text-3xl font-black italic uppercase text-zinc-500">Time Travel</h2>
         <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 p-8 rounded-[40px]">
            <div className="flex justify-between items-center mb-8">
               <button onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() - 1)))} className="p-3 hover:bg-white/10 rounded-full transition-colors text-zinc-900 dark:text-white"><ChevronLeft /></button>
               <span className="text-2xl font-black text-zinc-900 dark:text-white">{viewDate.toLocaleDateString('default', { month: 'long', year: 'numeric' })}</span>
               <button onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() + 1)))} className="p-3 hover:bg-white/10 rounded-full transition-colors text-zinc-900 dark:text-white"><ChevronRight /></button>
            </div>
            <div className="grid grid-cols-7 gap-3">
               {['S','M','T','W','T','F','S'].map((d, i) => <div key={i} className="text-xs font-bold text-zinc-600 py-2">{d}</div>)}
               {Array.from({length: startDay}).map((_, i) => <div key={`e-${i}`} />)}
               {Array.from({length: daysInMonth}).map((_, i) => {
                  const d = new Date(viewDate.getFullYear(), viewDate.getMonth(), i + 1);
                  const isSel = formatDateKey(d) === formatDateKey(selected);
                  return (
                     <button key={i} onClick={() => onSelect(d)} className={cn("aspect-square rounded-2xl font-bold text-sm transition-all", isSel ? "bg-black dark:bg-white text-white dark:text-black shadow-lg scale-110" : "text-zinc-400 hover:bg-white/10 hover:text-zinc-900 dark:hover:text-white")}>
                        {i + 1}
                     </button>
                  )
               })}
            </div>
         </div>
      </div>
   );
}

// --- FIXED STREAK MODAL (NO SCROLL, COMPACT GRID, HISTORY AWARE) ---
function StreakModal({ db, streakInfo, history }: { db: Record<string, DayData>, streakInfo: { current: number, max: number }, history: DayData[] }) {
   return (
      <div className="flex flex-col items-center justify-center h-full space-y-8 pb-4">
         
         {/* Flame Animation */}
         <div className="relative">
            <div className="absolute inset-0 bg-orange-500/20 blur-[50px] rounded-full" />
            <Flame size={80} className="text-orange-500 relative z-10" />
         </div>

         {/* Stats */}
         <div className="text-center">
            <h2 className="text-7xl font-black text-zinc-900 dark:text-white tracking-tighter">{streakInfo.current}</h2>
            <p className="text-lg font-bold uppercase text-zinc-500 tracking-[0.3em] mt-1">Day Streak</p>
            <div className="mt-2 inline-flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/30 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-500/20">
               <Trophy size={12} className="text-emerald-600 dark:text-emerald-400" />
               <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Best: {streakInfo.max} Days</span>
            </div>
         </div>
         
         {/* Compact GitHub Grid (7 cols x 5 rows = 35 days) */}
         <div className="bg-zinc-100 dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-white/5">
            <div className="grid grid-cols-7 gap-2">
               {Array.from({length: 35}).map((_, i) => {
                  const date = new Date();
                  date.setDate(date.getDate() - (34 - i));
                  const key = formatDateKey(date);
                  // Look in DB (current edits) OR History (past data)
                  const day = db[key] || history.find((h: any) => h.date === key);
                  
                  // Logic for active day
                  const isActive = day && (day.isRestDay || (day.sessions && day.sessions.length > 0) || (day.waterIntake >= day.waterGoal && day.stepCount >= day.stepGoal));
                  const isFuture = date > new Date();
                  
                  return (
                     <div 
                        key={i} 
                        className={cn(
                           "w-6 h-6 rounded-md transition-all", 
                           isActive 
                              ? "bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.4)] scale-110" 
                              : "bg-zinc-300 dark:bg-zinc-800",
                           isFuture && "opacity-0 pointer-events-none"
                        )} 
                        title={key} 
                     />
                  )
               })}
            </div>
         </div>

         {/* Footer Quote */}
         <div className="max-w-xs text-center">
            <p className="text-xs font-medium text-zinc-400">
               &quot;Consistency is the only currency that matters.&quot;
            </p>
         </div>
      </div>
   );
}