"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, Clock, Zap, 
  Calendar as CalendarIcon, Plus, Trash2, 
  Play, BrainCircuit, Loader2, Edit2,
  ChevronLeft, ChevronRight,
  Target, XCircle, Lock, RefreshCw
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

// --- ANIMATED HEADER ---
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
  
  // History Mode Check
  const isPast = useMemo(() => {
      const today = formatDateKey(new Date());
      return dateKey < today;
  }, [dateKey]);

  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals & State
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskData | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [activeTask, setActiveTask] = useState<TaskData | null>(null);
  const [skipModalTask, setSkipModalTask] = useState<TaskData | null>(null);
  
  const [aiPlanning, setAiPlanning] = useState(false);
  const [aiStrategy, setAiStrategy] = useState<string | null>(null);

  // --- FETCH ---
  const fetchData = useCallback(async () => {
    setLoading(true);
    const res = await getDailyTasks(dateKey);
    setTasks(res || []);
    setLoading(false);
  }, [dateKey]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // --- HANDLERS ---
  const handleSaveTask = async (task: TaskData) => {
      if (isPast && !task.id) return; // Prevent new tasks in past
      await upsertTask({ ...task, date: dateKey });
      setShowForm(false);
      setEditingTask(null);
      fetchData();
  };

  const handleEditClick = (task: TaskData) => {
      if (isPast) return;
      setEditingTask(task);
      setShowForm(true);
  };

  const handleProgressChange = async (task: TaskData, newProgress: number) => {
      if (isPast) return;
      let newStatus = task.status;
      if (newProgress === 100) newStatus = 'completed';
      else if (newProgress > 0) newStatus = 'in-progress';
      else newStatus = 'pending';

      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, progress: newProgress, status: newStatus as any } : t));
      await updateTaskProgress(task.id!, newProgress, newStatus!);
  };

  const handleSkipConfirm = async (reason: string) => {
      if (isPast || !skipModalTask) return;
      await updateTaskProgress(skipModalTask.id!, skipModalTask.progress, 'skipped', reason);
      setSkipModalTask(null);
      fetchData();
  };

  const handleDelete = async (id: string) => {
      if (isPast) return;
      if(confirm("Terminate Task?")) {
          await deleteTask(id);
          fetchData();
      }
  };

  const handleAIPlan = async () => {
      if (isPast) return;
      setAiPlanning(true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const plan: any = await aiAutoSchedule(tasks);
      
      if (plan && plan.scheduleUpdates) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          plan.scheduleUpdates.forEach(async (s: any) => {
              const t = tasks.find(tsk => tsk.id === s.id);
              if(t) await upsertTask({ ...t, startTime: s.startTime, taskType: 'fixed' });
          });
          setAiStrategy(plan.battlePlan);
          setTimeout(() => fetchData(), 1000);
      }
      setAiPlanning(false);
  };

  // Rollover Feature
  const handleRollover = async () => {
      const today = formatDateKey(new Date());
      if (dateKey === today) return; 
      
      const pending = tasks.filter(t => t.status !== 'completed' && t.status !== 'skipped');
      if (confirm(`Move ${pending.length} pending tasks to Today?`)) {
          for (const t of pending) {
              await upsertTask({ ...t, date: today });
          }
          alert("Tasks moved to Today.");
          fetchData();
      }
  }

  // Grouping
  const fixedTasks = tasks.filter(t => t.taskType === 'fixed').sort((a,b) => (a.startTime || "99:99").localeCompare(b.startTime || "99:99"));
  const flexibleTasks = tasks.filter(t => t.taskType === 'flexible');
  
  // Stats
  const completed = tasks.filter(t => t.status === 'completed').length;
  const total = tasks.length;
  const overallProgress = total === 0 ? 0 : Math.round(tasks.reduce((acc, t) => acc + t.progress, 0) / total);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#050505] text-zinc-900 dark:text-zinc-100 font-sans relative overflow-hidden transition-colors duration-500">
      
      {/* 1. BACKGROUND */}
      <div className="fixed inset-0 pointer-events-none z-0">
         <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[32px_32px]" />
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
             {/* Progress */}
             <div className="flex flex-col items-end">
                <span className="text-3xl font-black">{overallProgress}%</span>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Completion</span>
             </div>
             
             {/* Calendar Nav */}
             <div className="relative">
                 <button onClick={() => setShowCalendar(!showCalendar)} className={cn("flex items-center gap-3 border px-5 py-3 rounded-2xl shadow-lg transition-all group", isPast ? "bg-zinc-100 dark:bg-zinc-900 border-orange-500/50" : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-blue-500")}>
                    <div className="text-left">
                        <span className={cn("block text-xs font-bold uppercase", isPast ? "text-orange-500" : "text-zinc-400")}>{isPast ? "History Mode" : selectedDate.toLocaleDateString('en-US', { weekday: 'long' })}</span>
                        <span className="block font-black font-mono text-lg leading-none">{selectedDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</span>
                    </div>
                    <CalendarIcon size={20} className={cn("transition-colors", isPast ? "text-orange-500" : "text-zinc-400 group-hover:text-blue-500")} />
                 </button>
                 <AnimatePresence>
                     {showCalendar && (
                         <div className="absolute top-20 right-0 z-50">
                             <CalendarModal current={selectedDate} onSelect={(d) => { setSelectedDate(d); setShowCalendar(false); }} />
                         </div>
                     )}
                 </AnimatePresence>
             </div>
          </div>
        </header>

        {/* AI STRATEGY */}
        <AnimatePresence>
            {aiStrategy && !isPast && (
                <motion.div initial={{opacity:0, y:-10}} animate={{opacity:1, y:0}} exit={{opacity:0}} className="bg-zinc-100 dark:bg-zinc-900 border-l-4 border-purple-500 p-4 rounded-r-xl flex items-center gap-3">
                    <BrainCircuit size={20} className="text-purple-500 animate-pulse"/>
                    <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 italic">&quot;{aiStrategy}&quot;</p>
                </motion.div>
            )}
        </AnimatePresence>

        {/* 3. CONTROL CENTER */}
        <div className="flex justify-end gap-2">
            {isPast && (
                <button onClick={handleRollover} className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider hover:text-orange-500 flex items-center gap-2">
                    <RefreshCw size={14}/> Move Pending to Today
                </button>
            )}
            
            <button 
                onClick={() => { setEditingTask(null); setShowForm(true); }} 
                disabled={isPast}
                className={cn("px-6 py-3 rounded-xl font-bold transition-transform shadow-lg flex items-center justify-center gap-2", 
                isPast ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed" : "bg-black dark:bg-white text-white dark:text-black hover:scale-105 shadow-orange-500/10"
                )}
            >
                {isPast ? <Lock size={18}/> : <Plus size={18} />} {isPast ? "Locked" : "Add Task"}
            </button>
            
            <button 
                onClick={handleAIPlan} 
                disabled={aiPlanning || isPast} 
                className={cn("flex items-center gap-2 text-xs font-bold uppercase tracking-wider border px-4 py-3 rounded-xl transition-all",
                isPast ? "bg-transparent border-zinc-200 dark:border-zinc-800 text-zinc-600 opacity-50 cursor-not-allowed" : "bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-purple-500 hover:border-purple-500"
                )}
            >
                {aiPlanning ? <Loader2 size={14} className="animate-spin"/> : <BrainCircuit size={14} />}
                {aiPlanning ? "Thinking..." : "AI Sort"}
            </button>
        </div>

        {/* 4. SPLIT VIEW (FIXED vs FLEXIBLE) */}
        <div className="min-h-125 grid grid-cols-1 lg:grid-cols-12 gap-8">
           
           {/* LEFT: TIMELINE (FIXED) */}
           <div className="lg:col-span-7">
               <div className="flex items-center gap-2 mb-6">
                   <Clock className="text-blue-500" size={20}/>
                   <h3 className="text-xl font-black uppercase text-zinc-900 dark:text-white">Time Locked</h3>
                   <span className="text-xs font-bold bg-zinc-200 dark:bg-zinc-800 px-2 py-0.5 rounded-full text-zinc-500">{fixedTasks.length}</span>
               </div>

               <div className="relative pl-16 space-y-6">
                   {/* Time Guide Line */}
                   <div className="absolute left-14.5 top-0 bottom-0 w-0.5 bg-zinc-200 dark:bg-zinc-800 border-l border-dashed border-zinc-300 dark:border-zinc-700" />
                   
                   {fixedTasks.length === 0 ? (
                       <div className="text-center py-10 text-zinc-400 text-sm font-mono border-2 border-dashed border-zinc-200 dark:border-zinc-900 rounded-2xl ml-10">No Schedule. Free Flow.</div>
                   ) : (
                       fixedTasks.map((task) => (
                           <motion.div layout initial={{opacity:0, x:-20}} animate={{opacity:1, x:0}} key={task.id} className="relative">
                               {/* Time Label */}
                               <div className="absolute -left-16 top-0 w-12 text-right">
                                   <span className="text-sm font-black font-mono text-zinc-900 dark:text-white block">{task.startTime}</span>
                                   <span className="text-[10px] font-bold text-zinc-400">{task.duration}m</span>
                               </div>
                               {/* Bullet */}
                               <div className="absolute -left-2.25 top-1.5 w-4 h-4 bg-white dark:bg-black rounded-full border-4 border-blue-500 z-10" />
                               
                               <TaskCard 
                                   task={task} 
                                   onProgress={handleProgressChange} 
                                   onDelete={handleDelete} 
                                   onEdit={handleEditClick}
                                   onFocus={setActiveTask} 
                                   onSkip={() => setSkipModalTask(task)} 
                                   isReadOnly={isPast} 
                               />
                           </motion.div>
                       ))
                   )}
               </div>
           </div>

           {/* RIGHT: STACK (FLEXIBLE) */}
           <div className="lg:col-span-5">
               <div className="flex items-center gap-2 mb-6">
                   <Zap className="text-yellow-500" size={20}/>
                   <h3 className="text-xl font-black uppercase text-zinc-900 dark:text-white">Anytime</h3>
                   <span className="text-xs font-bold bg-zinc-200 dark:bg-zinc-800 px-2 py-0.5 rounded-full text-zinc-500">{flexibleTasks.length}</span>
               </div>

               <div className="space-y-4">
                   {flexibleTasks.length === 0 ? (
                       <div className="text-center py-10 text-zinc-400 text-sm font-mono border-2 border-dashed border-zinc-200 dark:border-zinc-900 rounded-2xl">Inbox Zero.</div>
                   ) : (
                       flexibleTasks.map((task) => (
                           <motion.div layout initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} key={task.id}>
                               <TaskCard 
                                   task={task} 
                                   onProgress={handleProgressChange} 
                                   onDelete={handleDelete} 
                                   onEdit={handleEditClick}
                                   onFocus={setActiveTask} 
                                   onSkip={() => setSkipModalTask(task)} 
                                   isReadOnly={isPast} 
                               />
                           </motion.div>
                       ))
                   )}
               </div>
           </div>

        </div>

      </div>

      {/* --- MODALS --- */}
      <AnimatePresence>
         {showForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <TaskForm 
                    onSave={handleSaveTask} 
                    onClose={() => { setShowForm(false); setEditingTask(null); }} 
                    initialData={editingTask} 
                />
            </div>
         )}
         {skipModalTask && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-red-950/80 backdrop-blur-md">
                <SkipForm task={skipModalTask} onConfirm={handleSkipConfirm} onCancel={() => setSkipModalTask(null)} />
            </div>
         )}
         {activeTask && (
            <ZenMode 
                task={activeTask} 
                onComplete={() => { handleProgressChange(activeTask, 100); setActiveTask(null); }} 
                onExit={() => setActiveTask(null)} 
                isReadOnly={isPast} 
            />
         )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// COMPONENT: TASK CARD (UPDATED WITH EDIT)
// ============================================================================
function TaskCard({ task, onProgress, onDelete, onEdit, onFocus, onSkip, isReadOnly }: { task: TaskData, onProgress: (t:any, p:number)=>void, onDelete: (id:string)=>void, onEdit: (t:any)=>void, onFocus: (t:any)=>void, onSkip: ()=>void, isReadOnly: boolean }) {
    return (
        <div className={cn(
            "group relative bg-white dark:bg-[#0F0F11] border p-4 rounded-xl transition-all overflow-hidden",
            isReadOnly ? "opacity-75 grayscale-[0.5]" : "hover:shadow-xl hover:border-blue-500/30",
            task.status === 'completed' ? "border-green-500/20 bg-green-50/5" : 
            task.status === 'skipped' ? "border-red-500/20 bg-red-50/5" :
            "border-zinc-200 dark:border-zinc-800"
        )}>
            {/* Progress Bar Background */}
            <div className="absolute bottom-0 left-0 h-1 bg-blue-500 transition-all duration-500" style={{width: `${task.progress}%`}} />

            <div className="flex justify-between items-start mb-2">
                <div>
                    <h4 className={cn("font-bold text-base leading-tight", task.status === 'completed' && "line-through text-zinc-500")}>{task.title}</h4>
                    {task.description && <p className="text-xs text-zinc-500 mt-1 line-clamp-1">{task.description}</p>}
                </div>
                {!isReadOnly && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {task.status !== 'completed' && (
                            <>
                                <button onClick={() => onFocus(task)} className="p-1.5 text-zinc-400 hover:text-blue-500 hover:bg-blue-500/10 rounded"><Play size={14}/></button>
                                <button onClick={onSkip} className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 rounded"><XCircle size={14}/></button>
                                <button onClick={() => onEdit(task)} className="p-1.5 text-zinc-400 hover:text-orange-500 hover:bg-orange-500/10 rounded"><Edit2 size={14}/></button>
                            </>
                        )}
                        <button onClick={() => onDelete(task.id!)} className="p-1.5 text-zinc-400 hover:text-zinc-600"><Trash2 size={14}/></button>
                    </div>
                )}
                {isReadOnly && <Lock size={12} className="text-zinc-300 dark:text-zinc-700"/>}
            </div>

            <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500">{task.category}</span>
                    <span className="text-[10px] font-bold text-zinc-400 flex items-center gap-1"><Clock size={10}/> {task.duration}m</span>
                </div>
                
                {/* Interactive Progress Slider */}
                {!isReadOnly && task.status !== 'completed' && task.status !== 'skipped' ? (
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-blue-500">{task.progress}%</span>
                        <input 
                            type="range" min="0" max="100" step="25" 
                            value={task.progress} 
                            onChange={(e) => onProgress(task, Number(e.target.value))}
                            className="w-20 h-1 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                    </div>
                ) : (
                    <span className={cn("text-[10px] font-bold flex items-center gap-1", task.status === 'completed' ? "text-green-500" : task.status === 'skipped' ? "text-red-500" : "text-zinc-500")}>
                        {task.status === 'completed' ? "Done" : task.status === 'skipped' ? "Skipped" : `${task.progress}%`}
                    </span>
                )}
            </div>
        </div>
    )
}

// ============================================================================
// COMPONENT: TASK FORM (UPDATED FOR EDIT)
// ============================================================================
function TaskForm({ onSave, onClose, initialData }: { onSave: (t: any) => void, onClose: () => void, initialData?: TaskData | null }) {
    const [form, setForm] = useState<TaskData>(initialData || { 
        title: "", category: "work", priority: "medium", energy: "medium", 
        duration: 30, date: "", startTime: "09:00",
        taskType: "flexible", progress: 0
    });
    
    return (
        <motion.div initial={{scale:0.95, opacity:0}} animate={{scale:1, opacity:1}} className="bg-white dark:bg-zinc-950 w-full max-w-lg rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-600" />
            <h2 className="text-2xl font-black uppercase mb-6 flex justify-between items-center">
                {initialData ? "Edit Mission" : "New Directive"}
            </h2>
            
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
                   <input type="number" className="w-full bg-zinc-50 dark:bg-zinc-900 p-3 rounded-xl text-sm font-bold outline-none" value={form.duration} onChange={e => setForm({...form, duration: Number(e.target.value)})} />
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
               <button onClick={() => onSave(form)} disabled={!form.title} className="flex-1 py-4 bg-black dark:bg-white text-white dark:text-black font-black rounded-xl hover:scale-105 transition-transform uppercase tracking-wider shadow-lg disabled:opacity-50">
                   {initialData ? "Update Task" : "Add Task"}
               </button>
            </div>
        </motion.div>
    )
}

function SkipForm({ task, onConfirm, onCancel }: { task: TaskData, onConfirm: (r:string)=>void, onCancel: ()=>void }) {
    return (
        <motion.div initial={{scale:0.95, opacity:0}} animate={{scale:1, opacity:1}} className="bg-white dark:bg-black w-full max-w-md p-8 rounded-3xl border-2 border-red-600 shadow-2xl">
            <h3 className="text-2xl font-black uppercase text-red-600 mb-2 text-center">Abort Mission?</h3>
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

function ZenMode({ task, onComplete, onExit, isReadOnly }: { task: TaskData, onComplete: ()=>void, onExit: ()=>void, isReadOnly: boolean }) {
    return (
        <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-100 bg-zinc-50 dark:bg-[#080808] flex flex-col items-center justify-center p-8">
            <h1 className="text-6xl md:text-8xl font-black leading-tight text-zinc-900 dark:text-white">{task.title}</h1>
            <div className="pt-12 flex gap-6 justify-center">
                {!isReadOnly && <button onClick={onComplete} className="px-10 py-5 bg-green-600 text-white rounded-2xl font-black text-xl hover:scale-105 transition-transform flex items-center gap-3 shadow-2xl"><CheckCircle2 size={24} /> FINISH</button>}
                <button onClick={onExit} className="px-10 py-5 border-2 border-zinc-200 dark:border-zinc-800 rounded-2xl font-black text-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors">EXIT</button>
            </div>
        </motion.div>
    )
}

function CalendarModal({ current, onSelect }: { current: Date, onSelect: (d:Date)=>void }) {
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