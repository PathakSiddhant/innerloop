"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ListTodo, CheckCircle2, Clock, Zap, 
  Calendar as CalendarIcon, Plus, Trash2, 
  Play, BrainCircuit, Loader2,
  ChevronLeft, ChevronRight, BarChart2,
  MoreVertical, Target, XCircle, AlertTriangle
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// --- BACKEND ACTIONS ---
import { 
    getDailyTasks, upsertTask, updateTaskProgress, deleteTask, aiAutoSchedule,
    TaskData 
} from "@/lib/actions/tasks";

// --- UTILS ---
function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
const formatDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// --- ANIMATED HEADER COMPONENT ---
const MatrixText = ({ text }: { text: string }) => {
  return (
    <motion.div className="flex overflow-hidden">
      {text.split("").map((char, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.1, delay: index * 0.05 }}
          className="inline-block"
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </motion.div>
  );
};

export default function ExecutionOS() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const dateKey = useMemo(() => formatDateKey(selectedDate), [selectedDate]);
  
  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showForm, setShowForm] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [activeTask, setActiveTask] = useState<TaskData | null>(null); // Zen Mode
  const [skipModalTask, setSkipModalTask] = useState<TaskData | null>(null);
  
  const [aiPlanning, setAiPlanning] = useState(false);
  const [aiStrategy, setAiStrategy] = useState<string | null>(null);

  // --- FETCH ---
  const fetchData = useCallback(async () => {
    setLoading(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await getDailyTasks(dateKey);
    setTasks(res as any[]);
    setLoading(false);
  }, [dateKey]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // --- HANDLERS ---
  const handleAddTask = async (task: TaskData) => {
      await upsertTask({ ...task, date: dateKey });
      setShowForm(false);
      fetchData();
  };

  const handleProgressChange = async (task: TaskData, newProgress: number) => {
      let newStatus = task.status;
      if (newProgress === 100) newStatus = 'completed';
      else if (newProgress > 0) newStatus = 'in-progress';
      else newStatus = 'pending';

      // Optimistic Update
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, progress: newProgress, status: newStatus as any } : t));
      
      await updateTaskProgress(task.id!, newProgress, newStatus!);
  };

  const handleSkipConfirm = async (reason: string) => {
      if (skipModalTask) {
          await updateTaskProgress(skipModalTask.id!, skipModalTask.progress, 'skipped', reason);
          setSkipModalTask(null);
          fetchData();
      }
  };

  const handleDelete = async (id: string) => {
      if(confirm("Terminate Task?")) {
          await deleteTask(id);
          fetchData();
      }
  };

  const handleAIPlan = async () => {
      setAiPlanning(true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const plan: any = await aiAutoSchedule(tasks);
      
      if (plan && plan.scheduleUpdates) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          plan.scheduleUpdates.forEach(async (s: any) => {
              const t = tasks.find(tsk => tsk.id === s.id);
              if(t) await upsertTask({ ...t, startTime: s.startTime, taskType: 'fixed' }); // AI fixes the time
          });
          setAiStrategy(plan.battlePlan);
          setTimeout(() => fetchData(), 1000); // Refresh after updates
      }
      setAiPlanning(false);
  };

  // Stats
  const completed = tasks.filter(t => t.status === 'completed').length;
  const total = tasks.length;
  const overallProgress = total === 0 ? 0 : Math.round(tasks.reduce((acc, t) => acc + t.progress, 0) / total);

  // Grouping
  const fixedTasks = tasks.filter(t => t.taskType === 'fixed').sort((a,b) => (a.startTime || "99:99").localeCompare(b.startTime || "99:99"));
  const flexibleTasks = tasks.filter(t => t.taskType === 'flexible');

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#050505] text-zinc-900 dark:text-zinc-100 font-sans relative overflow-hidden transition-colors duration-500">
      
      {/* 1. CYBER GRID BG */}
      <div className="fixed inset-0 pointer-events-none z-0">
         <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px]" />
         <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-blue-500/5 to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-4 md:p-8 space-y-8">
        
        {/* 2. HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-zinc-200 dark:border-zinc-800 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-500 animate-pulse">
              <Target size={16} />
              <span className="text-[10px] font-black tracking-[0.3em] uppercase">SYSTEM ONLINE</span>
            </div>
            <div className="text-5xl md:text-7xl font-black uppercase text-zinc-900 dark:text-white flex items-center gap-4">
               <MatrixText text="EXECUTION" />
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">OS</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
             {/* Overall Progress */}
             <div className="flex flex-col items-end">
                <span className="text-3xl font-black">{overallProgress}%</span>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Daily Completion</span>
             </div>
             
             {/* Calendar Nav */}
             <div className="relative">
                 <button onClick={() => setShowCalendar(!showCalendar)} className="flex items-center gap-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-5 py-3 rounded-2xl shadow-lg hover:border-blue-500 transition-all group">
                    <div className="text-left">
                        <span className="block text-xs font-bold text-zinc-400 uppercase">{selectedDate.toLocaleDateString('en-US', { weekday: 'long' })}</span>
                        <span className="block font-black font-mono text-lg leading-none">{selectedDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</span>
                    </div>
                    <CalendarIcon size={20} className="text-zinc-400 group-hover:text-blue-500 transition-colors" />
                 </button>
                 <AnimatePresence>
                     {showCalendar && (
                         <div className="absolute top-20 right-0 z-50">
                             <CalendarModal current={selectedDate} onSelect={(d) => { setSelectedDate(d); setShowCalendar(false); }} onClose={() => setShowCalendar(false)} />
                         </div>
                     )}
                 </AnimatePresence>
             </div>
          </div>
        </header>

        {/* AI STRATEGY */}
        <AnimatePresence>
            {aiStrategy && (
                <motion.div initial={{opacity:0, y:-10}} animate={{opacity:1, y:0}} exit={{opacity:0}} className="bg-zinc-100 dark:bg-zinc-900 border-l-4 border-purple-500 p-4 rounded-r-xl flex items-center gap-3">
                    <BrainCircuit size={20} className="text-purple-500 animate-pulse"/>
                    <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 italic">"{aiStrategy}"</p>
                </motion.div>
            )}
        </AnimatePresence>

        {/* 3. MAIN WORKSPACE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT: TIMELINE (Fixed Tasks) */}
            <div className="lg:col-span-7 space-y-6">
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-black uppercase flex items-center gap-2"><Clock size={20} className="text-blue-500"/> Schedule</h3>
                    <button onClick={handleAIPlan} disabled={aiPlanning} className="text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-purple-500 flex items-center gap-1 transition-colors">
                        {aiPlanning ? <Loader2 size={12} className="animate-spin"/> : <BrainCircuit size={12} />} AI Sort
                    </button>
                </div>
                
                <div className="relative pl-16 space-y-6 min-h-[300px]">
                    {/* Time Guide Line */}
                    <div className="absolute left-[58px] top-0 bottom-0 w-0.5 bg-zinc-200 dark:bg-zinc-800 border-l border-dashed border-zinc-300 dark:border-zinc-700" />
                    
                    {fixedTasks.length === 0 ? (
                        <div className="text-center py-10 text-zinc-400 text-sm font-mono border-2 border-dashed border-zinc-200 dark:border-zinc-900 rounded-2xl ml-10">No Fixed Schedule</div>
                    ) : (
                        fixedTasks.map((task) => (
                            <motion.div layout initial={{opacity:0, x:-20}} animate={{opacity:1, x:0}} key={task.id} className="relative">
                                {/* Time Label */}
                                <div className="absolute -left-16 top-0 w-12 text-right">
                                    <span className="text-sm font-black font-mono text-zinc-900 dark:text-white block">{task.startTime}</span>
                                    <span className="text-[10px] font-bold text-zinc-400">{task.duration}m</span>
                                </div>
                                {/* Bullet */}
                                <div className="absolute -left-[9px] top-1.5 w-4 h-4 bg-white dark:bg-black rounded-full border-4 border-blue-500 z-10" />
                                
                                <TaskCard task={task} onProgress={handleProgressChange} onDelete={handleDelete} onFocus={setActiveTask} onSkip={() => setSkipModalTask(task)} />
                            </motion.div>
                        ))
                    )}
                </div>
            </div>

            {/* RIGHT: FLEXIBLE TASKS (Anytime) */}
            <div className="lg:col-span-5 space-y-6">
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-black uppercase flex items-center gap-2"><Zap size={20} className="text-yellow-500"/> Anytime</h3>
                    <button onClick={() => setShowForm(true)} className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg font-bold text-xs hover:scale-105 transition-transform flex items-center gap-2">
                        <Plus size={14}/> Add Task
                    </button>
                </div>

                <div className="space-y-4">
                    {flexibleTasks.length === 0 ? (
                        <div className="text-center py-10 text-zinc-400 text-sm font-mono border-2 border-dashed border-zinc-200 dark:border-zinc-900 rounded-2xl">No Flexible Tasks</div>
                    ) : (
                        flexibleTasks.map((task) => (
                            <motion.div layout initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} key={task.id}>
                                <TaskCard task={task} onProgress={handleProgressChange} onDelete={handleDelete} onFocus={setActiveTask} onSkip={() => setSkipModalTask(task)} />
                            </motion.div>
                        ))
                    )}
                </div>
            </div>

        </div>

      </div>

      {/* --- MODALS --- */}
      <AnimatePresence>
         {showForm && <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"><TaskForm onSave={handleAddTask} onClose={() => setShowForm(false)} /></div>}
         {skipModalTask && <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-red-950/80 backdrop-blur-md"><SkipForm task={skipModalTask} onConfirm={handleSkipConfirm} onCancel={() => setSkipModalTask(null)} /></div>}
         {activeTask && <ZenMode task={activeTask} onComplete={() => { handleProgressChange(activeTask, 100); setActiveTask(null); }} onExit={() => setActiveTask(null)} />}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// SUB COMPONENTS
// ============================================================================

function TaskCard({ task, onProgress, onDelete, onFocus, onSkip }: { task: TaskData, onProgress: (t:any, p:number)=>void, onDelete: (id:string)=>void, onFocus: (t:any)=>void, onSkip: ()=>void }) {
    return (
        <div className={cn(
            "group relative bg-white dark:bg-[#0F0F11] border p-4 rounded-xl transition-all hover:shadow-xl hover:border-blue-500/30 overflow-hidden",
            task.status === 'completed' ? "border-green-500/20 opacity-60 bg-green-50/5" : 
            task.status === 'skipped' ? "border-red-500/20 opacity-60 bg-red-50/5" :
            "border-zinc-200 dark:border-zinc-800"
        )}>
            {/* Progress Bar Background */}
            <div className="absolute bottom-0 left-0 h-1 bg-blue-500 transition-all duration-500" style={{width: `${task.progress}%`}} />

            <div className="flex justify-between items-start mb-2">
                <div>
                    <h4 className={cn("font-bold text-base leading-tight", task.status === 'completed' && "line-through text-zinc-500")}>{task.title}</h4>
                    {task.description && <p className="text-xs text-zinc-500 mt-1 line-clamp-1">{task.description}</p>}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {task.status !== 'completed' && (
                        <>
                            <button onClick={() => onFocus(task)} className="p-1.5 text-zinc-400 hover:text-blue-500 hover:bg-blue-500/10 rounded"><Play size={14}/></button>
                            <button onClick={onSkip} className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 rounded"><XCircle size={14}/></button>
                        </>
                    )}
                    <button onClick={() => onDelete(task.id!)} className="p-1.5 text-zinc-400 hover:text-zinc-600"><Trash2 size={14}/></button>
                </div>
            </div>

            <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500">{task.category}</span>
                    <span className="text-[10px] font-bold text-zinc-400 flex items-center gap-1"><Clock size={10}/> {task.estimatedMinutes}m</span>
                </div>
                
                {/* Interactive Progress Slider */}
                {task.status !== 'completed' && task.status !== 'skipped' && (
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-blue-500">{task.progress}%</span>
                        <input 
                            type="range" min="0" max="100" step="25" 
                            value={task.progress} 
                            onChange={(e) => onProgress(task, Number(e.target.value))}
                            className="w-20 h-1 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                    </div>
                )}
                {task.status === 'completed' && <span className="text-[10px] font-bold text-green-500 flex items-center gap-1"><CheckCircle2 size={12}/> Done</span>}
                {task.status === 'skipped' && <span className="text-[10px] font-bold text-red-500">Skipped</span>}
            </div>
        </div>
    )
}

function TaskForm({ onSave, onClose }: { onSave: (t: any) => void, onClose: () => void }) {
    const [form, setForm] = useState<TaskData>({ 
        title: "", category: "work", priority: "medium", energy: "medium", 
        estimatedMinutes: 30, duration: 30, date: "", startTime: "09:00",
        taskType: "flexible", progress: 0
    });
    
    return (
        <motion.div initial={{scale:0.95, opacity:0}} animate={{scale:1, opacity:1}} className="bg-white dark:bg-zinc-950 w-full max-w-lg rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-600" />
            <h2 className="text-2xl font-black uppercase mb-6">New Directive</h2>
            
            <div className="flex gap-4 mb-6">
                <button onClick={() => setForm({...form, taskType: 'flexible'})} className={cn("flex-1 py-3 rounded-xl font-bold border-2 transition-all", form.taskType === 'flexible' ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600" : "border-zinc-200 dark:border-zinc-800 text-zinc-400")}>
                    Anytime (Flexible)
                </button>
                <button onClick={() => setForm({...form, taskType: 'fixed'})} className={cn("flex-1 py-3 rounded-xl font-bold border-2 transition-all", form.taskType === 'fixed' ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-600" : "border-zinc-200 dark:border-zinc-800 text-zinc-400")}>
                    Fixed Time
                </button>
            </div>

            <input autoFocus placeholder="Task Title" className="w-full text-xl font-bold bg-transparent border-b-2 border-zinc-100 dark:border-zinc-800 pb-2 mb-6 outline-none focus:border-blue-500 transition-colors" 
               value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
            
            <div className="grid grid-cols-2 gap-4 mb-6">
               {form.taskType === 'fixed' && (
                   <div className="space-y-1">
                       <label className="text-[10px] font-bold uppercase text-zinc-500">Start Time</label>
                       <input type="time" className="w-full bg-zinc-50 dark:bg-zinc-900 p-3 rounded-xl text-sm font-bold outline-none" value={form.startTime} onChange={e => setForm({...form, startTime: e.target.value})} />
                   </div>
               )}
               <div className="space-y-1">
                   <label className="text-[10px] font-bold uppercase text-zinc-500">Duration (min)</label>
                   <input type="number" className="w-full bg-zinc-50 dark:bg-zinc-900 p-3 rounded-xl text-sm font-bold outline-none" value={form.estimatedMinutes} onChange={e => setForm({...form, estimatedMinutes: Number(e.target.value)})} />
               </div>
               <div className="space-y-1">
                   <label className="text-[10px] font-bold uppercase text-zinc-500">Priority</label>
                   <select className="w-full bg-zinc-50 dark:bg-zinc-900 p-3 rounded-xl text-sm font-bold outline-none" value={form.priority} onChange={e => setForm({...form, priority: e.target.value as any})}>
                       <option value="medium">Medium</option><option value="high">High</option><option value="urgent">Critical</option>
                   </select>
               </div>
               <div className="space-y-1">
                   <label className="text-[10px] font-bold uppercase text-zinc-500">Category</label>
                   <select className="w-full bg-zinc-50 dark:bg-zinc-900 p-3 rounded-xl text-sm font-bold outline-none" value={form.category} onChange={e => setForm({...form, category: e.target.value as any})}>
                       <option value="work">Work</option><option value="personal">Personal</option><option value="health">Health</option>
                   </select>
               </div>
            </div>

            <div className="flex gap-3">
               <button onClick={onClose} className="flex-1 py-4 font-bold text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl uppercase tracking-wider">Cancel</button>
               <button onClick={() => onSave(form)} disabled={!form.title} className="flex-1 py-4 bg-black dark:bg-white text-white dark:text-black font-black rounded-xl hover:scale-105 transition-transform uppercase tracking-wider shadow-lg disabled:opacity-50">Add Task</button>
            </div>
        </motion.div>
    )
}

function SkipForm({ task, onConfirm, onCancel }: { task: TaskData, onConfirm: (r:string)=>void, onCancel: ()=>void }) {
    return (
        <motion.div initial={{scale:0.95, opacity:0}} animate={{scale:1, opacity:1}} className="bg-white dark:bg-black w-full max-w-md p-8 rounded-3xl border-2 border-red-600 shadow-2xl">
            <h3 className="text-2xl font-black uppercase text-red-600 mb-2 text-center">Abort Mission?</h3>
            <p className="text-zinc-500 font-bold mb-6 text-center">State your reason for skipping <strong>{task.title}</strong>.</p>
            <form onSubmit={(e) => { e.preventDefault(); onConfirm((e.currentTarget.elements.namedItem('reason') as HTMLInputElement).value); }}>
                <input name="reason" autoFocus className="w-full bg-zinc-100 dark:bg-zinc-900 p-4 rounded-xl font-bold outline-none focus:border-red-500 text-center mb-6" placeholder="Reason..." required />
                <div className="flex gap-3">
                    <button type="button" onClick={onCancel} className="flex-1 py-4 font-bold text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl uppercase">Back</button>
                    <button type="submit" className="flex-1 py-4 bg-red-600 text-white font-black rounded-xl hover:bg-red-700 uppercase">Skip</button>
                </div>
            </form>
        </motion.div>
    )
}

function ZenMode({ task, onComplete, onExit }: { task: TaskData, onComplete: ()=>void, onExit: ()=>void }) {
    return (
        <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-100 bg-zinc-50 dark:bg-[#080808] flex flex-col items-center justify-center p-8">
            <div className="absolute inset-0 bg-blue-500/5 animate-pulse pointer-events-none"/>
            <div className="relative z-10 text-center space-y-12 max-w-3xl">
                <div className="inline-block px-6 py-2 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-500 text-xs font-black uppercase tracking-[0.3em]">Focus Protocol</div>
                <h1 className="text-6xl md:text-8xl font-black leading-tight text-zinc-900 dark:text-white">{task.title}</h1>
                
                <div className="pt-12 flex gap-6 justify-center">
                    <button onClick={onComplete} className="px-10 py-5 bg-green-600 text-white rounded-2xl font-black text-xl hover:scale-105 transition-transform flex items-center gap-3 shadow-2xl">
                    <CheckCircle2 size={24} /> FINISH
                    </button>
                    <button onClick={onExit} className="px-10 py-5 border-2 border-zinc-200 dark:border-zinc-800 rounded-2xl font-black text-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors">EXIT</button>
                </div>
            </div>
        </motion.div>
    )
}

function CalendarModal({ current, onSelect, onClose }: { current: Date, onSelect: (d:Date)=>void, onClose: ()=>void }) {
    const [viewDate, setViewDate] = useState(current);
    const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
    const startDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();

    return (
        <motion.div initial={{opacity:0, scale:0.9}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.9}} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl w-80">
            <div className="flex justify-between items-center mb-4">
                <button onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() - 1)))}><ChevronLeft size={20}/></button>
                <span className="font-bold">{viewDate.toLocaleDateString('default', { month: 'long', year: 'numeric' })}</span>
                <button onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() + 1)))}><ChevronRight size={20}/></button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center mb-2 text-zinc-400 text-xs font-bold">{['S','M','T','W','T','F','S'].map((d, i) => <div key={i}>{d}</div>)}</div>
            <div className="grid grid-cols-7 gap-1">
                {Array.from({length: startDay}).map((_, i) => <div key={`e-${i}`} />)}
                {Array.from({length: daysInMonth}).map((_, i) => {
                    const d = new Date(viewDate.getFullYear(), viewDate.getMonth(), i + 1);
                    const isSelected = formatDateKey(d) === formatDateKey(current);
                    return <button key={i} onClick={() => onSelect(d)} className={cn("h-8 w-8 rounded-lg text-xs font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800", isSelected && "bg-blue-600 text-white")}>{i+1}</button>
                })}
            </div>
        </motion.div>
    )
}