"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Terminal, Code2, Cpu, Zap, Lightbulb, GitCommit,
  Plus, X, Check, RefreshCw, Calendar as CalendarIcon,
  Trash2, Edit2, Bot, Layers, BrainCircuit, Sparkles, Loader2, 
  ChevronLeft, ChevronRight, BarChart3, Timer, 
  ExternalLink, FileText, ListTodo, ArrowRight
} from "lucide-react";
import { 
  ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell 
} from "recharts";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// --- BACKEND ACTIONS ---
import { 
    getTechDashboard, upsertProject, upsertIdea, logDevWork, 
    deleteIdea, deleteProject, generateProjectBlueprint,
    getProjectResources, addProjectResource, deleteResource, toggleResourceComplete,
    ProjectData, IdeaData, DevLogData, ResourceData
} from "@/lib/actions/tech";

// --- UTILS ---
function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
const formatDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// --- ANIMATIONS ---
const containerVar = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVar = { hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } };

// --- GLITCH TEXT COMPONENT ---
const GlitchText = ({ text }: { text: string }) => {
    return (
        <div className="relative group inline-block">
            <span className="relative z-10">{text}</span>
            <span className="absolute top-0 left-0 -z-10 w-full h-full text-green-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-100 select-none">{text}</span>
            <span className="absolute top-0 left-0 -z-10 w-full h-full text-purple-500 opacity-0 group-hover:opacity-100 group-hover:-translate-x-0.5 transition-all duration-100 select-none">{text}</span>
        </div>
    )
}

export default function BuilderMode() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const dateKey = useMemo(() => formatDateKey(selectedDate), [selectedDate]);
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"dashboard" | "ai-architect">("dashboard");
  const [focusMode, setFocusMode] = useState(false);
  
  const [data, setData] = useState<{ 
      projects: ProjectData[], ideas: IdeaData[], logs: DevLogData[]
  }>({ projects: [], ideas: [], logs: [] });
  
  const [activeModal, setActiveModal] = useState<"project" | "idea" | "log" | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editingItem, setEditingItem] = useState<any>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(null);

  // --- FETCH ---
  const fetchData = useCallback(async () => {
    setLoading(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res: any = await getTechDashboard(dateKey);
    if (res) {
      setData({
        projects: res.projects || [],
        ideas: res.ideas || [],
        logs: res.logs || [],
      });
    }
    setLoading(false);
  }, [dateKey]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // --- HANDLERS ---
  const handleSaveProject = async (proj: ProjectData) => { await upsertProject(proj); fetchData(); setActiveModal(null); };
  const handleDeleteProject = async (id: string) => { if(confirm("Delete protocol?")) { await deleteProject(id); fetchData(); } };
  
  const handleSaveIdea = async (idea: IdeaData) => { await upsertIdea(idea); fetchData(); setActiveModal(null); };
  const handleDeleteIdea = async (id: string) => { await deleteIdea(id); fetchData(); };
  
  const handleLogWork = async (log: DevLogData) => { await logDevWork({ ...log, date: dateKey }); fetchData(); setActiveModal(null); };

  // --- CHART DATA ---
  const scatterData = data.projects.map(p => ({ x: p.complexityScore, y: p.revenuePotential, z: 10, name: p.name, status: p.status }));

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#050505] text-zinc-900 dark:text-zinc-100 font-mono relative overflow-hidden transition-colors duration-500">
      
      {/* 1. CYBER BACKGROUND */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px]" />
        <div className="absolute top-[-20%] left-[-10%] w-96 h-96 bg-purple-500/10 dark:bg-purple-500/5 blur-[120px] rounded-full" />
      </div>

      {/* --- FOCUS MODE OVERLAY --- */}
      <AnimatePresence>
        {focusMode && (
            <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="fixed inset-0 z-100 bg-black text-white flex flex-col items-center justify-center space-y-8">
                <div className="text-9xl font-black tracking-tighter animate-pulse">FOCUS</div>
                <div className="text-xl font-mono text-zinc-400">Time to build. Distractions eliminated.</div>
                <button onClick={() => setFocusMode(false)} className="px-8 py-3 border border-zinc-700 rounded-full hover:bg-white hover:text-black transition-all font-bold">EXIT ZEN MODE</button>
            </motion.div>
        )}
      </AnimatePresence>

      {/* --- PROJECT DEEP DIVE PANEL --- */}
      <AnimatePresence>
          {selectedProject && (
              <ProjectDetailPanel project={selectedProject} onClose={() => setSelectedProject(null)} />
          )}
      </AnimatePresence>

      <div className="relative z-10 max-w-7xl mx-auto p-4 md:p-8 space-y-8">
        
        {/* 2. HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-zinc-200 dark:border-white/10 pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400 animate-pulse">
              <Terminal size={16} />
              <span className="text-[10px] font-bold tracking-[0.3em] uppercase">Builder OS v12.0</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-zinc-900 dark:text-white uppercase flex flex-wrap items-center gap-3 pr-6 pb-1">
               <GlitchText text="FOUNDER" /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-700">BRAIN</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
             {/* TABS NAVIGATION */}
             <div className="flex bg-zinc-200 dark:bg-zinc-900 p-1 rounded-full">
                {[
                    { id: 'dashboard', icon: Layers, label: 'Command' },
                    { id: 'ai-architect', icon: Bot, label: 'Architect' },
                ].map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} 
                    className={cn("flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all", 
                    activeTab === tab.id ? "bg-white dark:bg-zinc-800 shadow-sm" : "text-zinc-500 hover:text-black dark:hover:text-white")}>
                        <tab.icon size={14}/> {tab.label}
                    </button>
                ))}
             </div>

             <div className="relative">
               <button onClick={() => setCalendarOpen(!calendarOpen)} className="p-3 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-full hover:border-green-500 transition-all">
                 <CalendarIcon size={16} />
               </button>
               <AnimatePresence>
                 {calendarOpen && <CalendarDropdown current={selectedDate} onSelect={(d) => { setSelectedDate(d); setCalendarOpen(false); }} />}
               </AnimatePresence>
             </div>
             
             <button onClick={() => setFocusMode(true)} className="p-3 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-full hover:border-purple-500 transition-all text-purple-500">
               <Timer size={16} />
             </button>
          </div>
        </header>

        {/* 3. DYNAMIC CONTENT AREA */}
        <div className="min-h-150">
            {activeTab === 'dashboard' ? (
                <motion.div key="dash" variants={containerVar} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* PROJECTS */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-black uppercase flex items-center gap-2"><Cpu size={20} className="text-purple-500"/> Protocol List</h3>
                            <button onClick={() => { setEditingItem(null); setActiveModal("project"); }} className="text-xs bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg font-bold hover:scale-105 transition-transform flex items-center gap-2">
                                <Plus size={14}/> INIT PROTOCOL
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {data.projects.length === 0 ? (
                            <div className="col-span-2 h-48 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-2xl flex flex-col items-center justify-center text-zinc-400">
                                <Code2 size={40} className="mb-3 opacity-30" />
                                <p className="text-xs tracking-widest uppercase">No Active Protocols</p>
                            </div>
                        ) : (
                            data.projects.map((proj) => (
                                <ProjectCard 
                                    key={proj.id} project={proj} 
                                    onEdit={() => { setEditingItem(proj); setActiveModal("project"); }} 
                                    onDelete={() => handleDeleteProject(proj.id!)}
                                    onClick={() => setSelectedProject(proj)} 
                                />
                            ))
                        )}
                        </div>
                    </div>

                    {/* SIDEBAR */}
                    <div className="lg:col-span-4 flex flex-col gap-6">
                        {/* Scatter Chart */}
                        <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-3xl h-60 relative overflow-hidden">
                            <div className="flex justify-between items-center mb-2 relative z-10">
                                <h4 className="text-xs font-black uppercase text-zinc-500 flex items-center gap-2"><BarChart3 size={12}/> Analysis</h4>
                            </div>
                            <div className="absolute inset-0 pt-8 pr-2 pb-2 pl-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
                                        <XAxis type="number" dataKey="x" name="Complexity" hide domain={[0, 12]} />
                                        <YAxis type="number" dataKey="y" name="Revenue" hide domain={[0, 12]} />
                                        <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ payload }) => {
                                            if (payload && payload.length) {
                                                const d = payload[0].payload;
                                                return <div className="bg-black text-white text-xs p-2 rounded border border-zinc-800 font-bold">{d.name} <br/> <span className="text-zinc-400">C:{d.x} R:{d.y}</span></div>;
                                            }
                                            return null;
                                        }} />
                                        <Scatter name="Projects" data={scatterData} fill="#8884d8">
                                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                            {scatterData.map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={entry.status === 'shipped' ? '#22c55e' : entry.status === 'dropped' ? '#ef4444' : '#3b82f6'} />
                                            ))}
                                        </Scatter>
                                    </ScatterChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Ideas List */}
                        <div className="flex-1 flex flex-col">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-black uppercase flex items-center gap-2"><Lightbulb size={20} className="text-yellow-500"/> Ideas</h3>
                                <button onClick={() => { setEditingItem(null); setActiveModal("idea"); }} className="p-2 bg-zinc-100 dark:bg-zinc-900 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"><Plus size={14} /></button>
                            </div>
                            <div className="flex-1 bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5 rounded-3xl p-2 overflow-y-auto custom-scrollbar space-y-2 max-h-87.5">
                                {data.ideas.map((idea) => (
                                    <motion.div variants={itemVar} key={idea.id} className="group p-4 bg-zinc-50 dark:bg-black border border-zinc-100 dark:border-zinc-800 rounded-2xl hover:border-yellow-500/30 transition-all cursor-default">
                                        <div className="flex justify-between items-start mb-1">
                                            <h5 className="font-bold text-sm leading-tight">{idea.title}</h5>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => { setEditingItem(idea); setActiveModal("idea"); }} className="text-zinc-500 hover:text-white"><Edit2 size={10}/></button>
                                                <button onClick={() => handleDeleteIdea(idea.id!)} className="text-zinc-500 hover:text-red-500"><Trash2 size={10}/></button>
                                            </div>
                                        </div>
                                        <p className="text-[10px] text-zinc-500 mt-2 line-clamp-3">{idea.problem}</p>
                                    </motion.div>
                                ))}
                                {data.ideas.length === 0 && <div className="text-center text-zinc-400 text-xs py-10 font-mono">VAULT EMPTY</div>}
                            </div>
                        </div>
                    </div>

                    {/* LOGS */}
                    <div className="lg:col-span-12">
                         <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black uppercase flex items-center gap-2"><GitCommit className="text-blue-500" /> System Logs</h3>
                            <button onClick={() => { setEditingItem(null); setActiveModal("log"); }} className="text-xs bg-zinc-900 dark:bg-white text-white dark:text-black px-5 py-2.5 rounded-lg font-bold shadow-lg hover:scale-105 transition-transform flex items-center gap-2">
                                <Zap size={14} /> LOG COMMIT
                            </button>
                        </div>
                        <div className="bg-zinc-100 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-900 rounded-3xl p-6 min-h-50">
                            {data.logs.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-zinc-400 font-mono text-sm py-10 opacity-50">
                                    <p>No commits found for this timeline.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {data.logs.map((log, idx) => {
                                        const project = data.projects.find(p => p.id === log.projectId);
                                        return (
                                            <motion.div variants={itemVar} key={log.id} className="flex gap-4 group">
                                                <div className="flex flex-col items-center">
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                                                    {idx !== data.logs.length - 1 && <div className="w-px h-full bg-zinc-300 dark:bg-zinc-800 my-1" />}
                                                </div>
                                                <div className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center hover:border-blue-500/30 transition-colors">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="text-xs font-black uppercase text-blue-600 dark:text-blue-400 tracking-wider">{project?.name || "UNKNOWN"}</span>
                                                            <span className="text-[10px] text-zinc-500 font-mono">{log.date} • Energy: {log.energyLevel}/10</span>
                                                        </div>
                                                        <div className="flex gap-2 flex-wrap">
                                                            {log.tasksCompleted?.map((t, i) => <span key={i} className="text-sm text-zinc-700 dark:text-zinc-300 font-mono">&gt; {t}</span>)}
                                                        </div>
                                                    </div>
                                                    <span className="text-xs font-mono font-bold bg-zinc-100 dark:bg-black border border-zinc-200 dark:border-zinc-800 px-3 py-1 rounded">+{log.commitCount} commits</span>
                                                </div>
                                            </motion.div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            ) : (
                /* === TAB 2: AI ARCHITECT === */
                <motion.div key="ai" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                    <AIArchitectTab onSaveProject={handleSaveProject} />
                </motion.div>
            )}
        </div>
      </div>

      {/* --- MODALS --- */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-zinc-950 w-full max-w-lg rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-8 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-green-500 via-blue-500 to-purple-500" />
              <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 p-2 bg-zinc-100 dark:bg-zinc-900 rounded-full hover:bg-red-100 dark:hover:bg-red-900/20 hover:text-red-500 transition-colors"><X size={16}/></button>
              
              {activeModal === 'project' && <ProjectForm onSave={handleSaveProject} initialData={editingItem} />}
              {activeModal === 'idea' && <IdeaForm onSave={handleSaveIdea} initialData={editingItem} />}
              {activeModal === 'log' && <LogForm projects={data.projects} onSave={handleLogWork} />}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

// --- SUB COMPONENTS ---

function ProjectCard({ project, onEdit, onDelete, onClick }: { project: ProjectData, onEdit: () => void, onDelete: () => void, onClick: () => void }) {
    return (
        <motion.div variants={itemVar} onClick={onClick} className="cursor-pointer group relative bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl hover:border-purple-500/50 transition-all duration-300 shadow-sm hover:shadow-2xl hover:shadow-purple-500/10 flex flex-col justify-between h-full min-h-55">
            <div className="absolute inset-0 bg-linear-to-br from-transparent via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-2xl" />
            <div>
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full animate-pulse", project.status === 'building' ? "bg-blue-500" : project.status === 'shipped' ? "bg-green-500" : "bg-red-500")} />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">{project.status}</span>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                    <button onClick={onEdit} className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors"><Edit2 size={14}/></button>
                    <button onClick={onDelete} className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500 rounded-md transition-colors"><Trash2 size={14}/></button>
                </div>
            </div>
            <h4 className="text-2xl font-black uppercase tracking-tight mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors flex items-center gap-2">
               {project.name} <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all"/>
            </h4>
            <p className="text-xs text-zinc-500 line-clamp-2">{project.vision || "No vision data initialized."}</p>
            <div className="mt-4 flex gap-1.5 flex-wrap">
                {project.techStack?.slice(0, 4).map((t, i) => (
                    <span key={i} className="text-[9px] border border-zinc-200 dark:border-zinc-800 px-2 py-1 rounded bg-zinc-50 dark:bg-black font-mono text-zinc-600 dark:text-zinc-400">{t}</span>
                ))}
            </div>
            </div>
            <div className="mt-6 flex items-center justify-between text-[10px] uppercase font-bold text-zinc-400 border-t border-zinc-100 dark:border-zinc-800 pt-3">
                <div className="flex flex-col">
                    <span>Complexity</span>
                    <span className="text-zinc-900 dark:text-white text-base">{project.complexityScore}/10</span>
                </div>
                <div className="flex flex-col text-right">
                    <span>Potential</span>
                    <span className="text-green-600 dark:text-green-400 text-base">${project.revenuePotential}k</span>
                </div>
            </div>
        </motion.div>
    )
}

function ProjectDetailPanel({ project, onClose }: { project: ProjectData, onClose: () => void }) {
    const [activeTab, setActiveTab] = useState<"resources" | "blueprint">("resources");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [resources, setResources] = useState<any[]>([]);
    const [resourceForm, setResourceForm] = useState<Partial<ResourceData>>({ type: "note", title: "", content: "", url: "" });
    const [showForm, setShowForm] = useState(false);

    const loadResources = useCallback(async () => {
       const res = await getProjectResources(project.id!);
       setResources(res);
    }, [project.id]);

    useEffect(() => { loadResources(); }, [loadResources]);

    const handleAddResource = async () => {
       await addProjectResource({ ...resourceForm, projectId: project.id! } as ResourceData);
       setResourceForm({ type: "note", title: "", content: "", url: "" });
       setShowForm(false);
       loadResources();
    }

    const handleDeleteResource = async (id: string) => {
       await deleteResource(id); loadResources();
    }

    const handleToggleTodo = async (id: string, status: boolean) => {
        await toggleResourceComplete(id, status); loadResources();
    }

    return (
        <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 h-full w-full md:w-150 bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800 z-60 shadow-2xl p-8 overflow-y-auto custom-scrollbar"
        >
            <button onClick={onClose} className="absolute top-6 left-6 p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full"><ChevronLeft size={20}/></button>
            <div className="mt-8 mb-6">
                <h2 className="text-4xl font-black uppercase tracking-tight">{project.name}</h2>
                <div className="flex gap-2 mt-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
                    <button onClick={() => setActiveTab("resources")} className={cn("text-sm font-bold px-4 py-2 rounded-lg transition-colors", activeTab === "resources" ? "bg-zinc-100 dark:bg-zinc-800" : "text-zinc-500")}>Resources & Notes</button>
                    {project.aiBlueprint && <button onClick={() => setActiveTab("blueprint")} className={cn("text-sm font-bold px-4 py-2 rounded-lg transition-colors", activeTab === "blueprint" ? "bg-zinc-100 dark:bg-zinc-800" : "text-zinc-500")}>AI Blueprint</button>}
                </div>
            </div>

            {activeTab === "resources" && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h4 className="text-sm font-bold uppercase text-zinc-500">Project Knowledge</h4>
                        <button onClick={() => setShowForm(!showForm)} className="text-xs bg-black dark:bg-white text-white dark:text-black px-3 py-1.5 rounded-md font-bold flex items-center gap-1"><Plus size={12}/> Add</button>
                    </div>

                    {showForm && (
                        <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-xl space-y-3 animate-in fade-in slide-in-from-top-2">
                            <div className="flex gap-2">
                               {["note", "link", "todo"].map(t => (
                                   <button key={t} onClick={() => setResourceForm({...resourceForm, type: t as any})} 
                                   className={cn("text-[10px] uppercase font-bold px-3 py-1 rounded border", resourceForm.type === t ? "bg-black text-white border-black dark:bg-white dark:text-black" : "border-zinc-300 dark:border-zinc-700")}>{t}</button>
                               ))}
                            </div>
                            <input placeholder="Title" className="w-full p-2 rounded-lg bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-sm" value={resourceForm.title} onChange={e => setResourceForm({...resourceForm, title: e.target.value})} />
                            {resourceForm.type === 'link' && <input placeholder="URL" className="w-full p-2 rounded-lg bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-sm" value={resourceForm.url} onChange={e => setResourceForm({...resourceForm, url: e.target.value})} />}
                            {resourceForm.type !== 'todo' && <textarea placeholder="Content / Details" className="w-full p-2 rounded-lg bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-sm h-20" value={resourceForm.content} onChange={e => setResourceForm({...resourceForm, content: e.target.value})} />}
                            <button onClick={handleAddResource} className="w-full py-2 bg-blue-600 text-white font-bold rounded-lg text-xs">SAVE RESOURCE</button>
                        </div>
                    )}

                    <div className="space-y-3">
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {resources.map((res: any) => (
                            <div key={res.id} className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl group hover:border-zinc-400 transition-colors">
                                <div className="flex justify-between items-start">
                                    <div className="flex gap-3 items-start">
                                        <div className="mt-1">
                                            {res.type === 'link' ? <ExternalLink size={16} className="text-blue-500"/> : res.type === 'todo' ? <ListTodo size={16} className="text-orange-500"/> : <FileText size={16} className="text-zinc-500"/>}
                                        </div>
                                        <div>
                                            <h5 className={cn("font-bold text-sm", res.isCompleted && "line-through text-zinc-500")}>{res.title}</h5>
                                            {res.content && <p className="text-xs text-zinc-500 mt-1 whitespace-pre-wrap">{res.content}</p>}
                                            {res.url && <a href={res.url} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline block mt-1">{res.url}</a>}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        {res.type === 'todo' && (
                                            <button onClick={() => handleToggleTodo(res.id, !res.isCompleted)} className={cn("p-1 rounded", res.isCompleted ? "bg-green-100 text-green-600" : "bg-zinc-100 text-zinc-400")}>
                                                <Check size={14}/>
                                            </button>
                                        )}
                                        <button onClick={() => handleDeleteResource(res.id)} className="p-1 text-zinc-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14}/></button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === "blueprint" && project.aiBlueprint && (
                <div className="space-y-6">
                    <div className="p-4 bg-zinc-100 dark:bg-zinc-900 rounded-xl">
                        <h4 className="text-xs font-bold uppercase text-zinc-500 mb-2">Tagline</h4>
                        <p className="text-lg font-black italic">{project.aiBlueprint.tagline}</p>
                    </div>
                    <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-xl">
                        <h4 className="text-xs font-bold uppercase text-red-500 mb-2">Detaield Explanation</h4>
                        <p className="text-sm font-medium text-red-700 dark:text-red-300">{project.aiBlueprint.detialedExplantation}</p>
                    </div>
                    <div className="space-y-4">
                        <h4 className="text-sm font-bold uppercase text-zinc-500">Roadmap</h4>
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {project.aiBlueprint.roadmap?.map((phase: any, i: number) => (
                            <div key={i} className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                                <div className="flex justify-between mb-2">
                                    <span className="font-bold text-sm">{phase.phase}</span>
                                    <span className="text-xs bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">{phase.weeks} Weeks</span>
                                </div>
                                <ul className="list-disc list-inside text-xs text-zinc-500 space-y-1">
                                    {phase.tasks.map((t: string) => <li key={t}>{t}</li>)}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </motion.div>
    )
}

function AIArchitectTab({ onSaveProject }: { onSaveProject: (p: any) => void }) {
    const [prompt, setPrompt] = useState("");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [result, setResult] = useState<any>(null);
    const [isThinking, setIsThinking] = useState(false);

    const handleGenerate = async () => {
        setIsThinking(true);
        const res = await generateProjectBlueprint(prompt);
        setResult(res);
        setIsThinking(false);
    }
    
    const handleAutoInit = () => {
        if(!result) return;
        onSaveProject({
            name: "AI Generated Protocol",
            vision: result.description,
            status: "building",
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            techStack: result.techStack?.map((t:any) => t.name) || [],
            complexityScore: 8,
            revenuePotential: 8,
            aiBlueprint: result // Saving full JSON
        });
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
            <div className="space-y-6">
                <div className="bg-zinc-100 dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800">
                    <h3 className="text-2xl font-black uppercase mb-2 flex items-center gap-2"><Bot className="text-purple-500"/> Architect AI</h3>
                    <p className="text-xs text-zinc-500 mb-6">Describe your idea. I will generate the stack, roadmap, and DB schema.</p>
                    <textarea className="w-full bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl outline-none text-sm h-40 resize-none mb-4"
                        placeholder="e.g. A Tinder clone for dog walking service..." value={prompt} onChange={e => setPrompt(e.target.value)} />
                    <button onClick={handleGenerate} disabled={!prompt || isThinking} className="w-full py-4 bg-purple-600 text-white font-black uppercase tracking-widest rounded-xl hover:bg-purple-500 transition-all flex items-center justify-center gap-2">
                        {isThinking ? <Loader2 className="animate-spin"/> : <Sparkles size={18}/>} GENERATE BLUEPRINT
                    </button>
                </div>
            </div>
            
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 relative overflow-hidden min-h-100">
                {!result ? (
                    <div className="flex flex-col items-center justify-center h-full text-zinc-400 opacity-50">
                        <BrainCircuit size={48} className="mb-4"/>
                        <p className="text-xs font-mono uppercase tracking-widest">Awaiting Input Data...</p>
                    </div>
                ) : (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 h-full overflow-y-auto custom-scrollbar max-h-150">
                         <div>
                            <h4 className="text-sm font-bold uppercase text-zinc-500 mb-2">Tagline</h4>
                            <p className="text-xl font-black italic">{result.tagline}</p>
                         </div>
                         
                         <div>
                            <h4 className="text-sm font-bold uppercase text-zinc-500 mb-2">Destailed Explanation</h4>
                            <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 p-3 rounded-lg text-red-600 dark:text-red-400 text-xs font-bold">
                                {result.detialedExplantation}
                            </div>
                         </div>

                         <div>
                            <h4 className="text-sm font-bold uppercase text-zinc-500 mb-2">Recommended Stack</h4>
                            <div className="space-y-2">
                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                {result.techStack?.map((s: any, i: number) => (
                                    <div key={i} className="flex justify-between items-center text-xs border-b border-zinc-100 dark:border-zinc-800 pb-1">
                                        <span className="font-bold">{s.name}</span>
                                        <span className="text-zinc-500">{s.reason}</span>
                                    </div>
                                ))}
                            </div>
                         </div>

                         <div>
                            <h4 className="text-sm font-bold uppercase text-zinc-500 mb-2">Database Schema</h4>
                            <div className="grid grid-cols-2 gap-2">
                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                {result.databaseSchema?.map((t: any, i: number) => (
                                    <div key={i} className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
                                        <div className="font-mono text-xs font-bold mb-1 text-blue-500">{t.table}</div>
                                        <div className="text-[10px] text-zinc-500">{t.columns.join(", ")}</div>
                                    </div>
                                ))}
                            </div>
                         </div>

                         <button onClick={handleAutoInit} className="w-full py-3 bg-zinc-900 dark:bg-white text-white dark:text-black font-bold rounded-xl mt-4 hover:opacity-90">
                            INITIALIZE THIS PROJECT
                         </button>
                    </div>
                )}
            </div>
        </div>
    )
}

function ProjectForm({ onSave, initialData }: { onSave: (p: any) => void, initialData?: ProjectData }) {
    const [formData, setFormData] = useState<Partial<ProjectData>>(initialData || {
       name: "", vision: "", status: "building", techStack: [], complexityScore: 5, revenuePotential: 5
    });
 
    return (
       <div className="space-y-5">
          <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
             <Cpu className="text-green-500" /> {initialData ? "Edit Protocol" : "Init Protocol"}
          </h2>
          
          <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-zinc-500">Project Name</label>
              <input className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3 rounded-xl outline-none font-bold focus:border-green-500 transition-colors" 
                 value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} autoFocus />
          </div>
          
          <div>
             <label className="text-[10px] font-bold uppercase text-zinc-500 mb-2 block">Status</label>
             <div className="flex gap-2">
                 {['building', 'shipped', 'dropped'].map(s => (
                    <button key={s} onClick={() => setFormData({...formData, status: s as any})} 
                    className={cn("flex-1 py-2 rounded-lg text-xs font-bold uppercase transition-all border", 
                       formData.status === s 
                          ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white" 
                          : "bg-transparent text-zinc-500 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400")}>
                       {s}
                    </button>
                 ))}
             </div>
          </div>
 
          <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-zinc-500">Vision</label>
              <textarea className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3 rounded-xl outline-none text-sm h-24 focus:border-green-500 transition-colors resize-none"
                 value={formData.vision} onChange={e => setFormData({...formData, vision: e.target.value})} />
          </div>
             
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="text-[10px] uppercase font-bold text-zinc-500">Complexity (1-10)</label>
                <input type="number" max={10} min={1} className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3 rounded-xl outline-none font-mono" 
                   value={formData.complexityScore} onChange={e => setFormData({...formData, complexityScore: Number(e.target.value)})} />
             </div>
             <div>
                <label className="text-[10px] uppercase font-bold text-zinc-500">Revenue (1-10)</label>
                <input type="number" max={10} min={1} className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3 rounded-xl outline-none font-mono" 
                   value={formData.revenuePotential} onChange={e => setFormData({...formData, revenuePotential: Number(e.target.value)})} />
             </div>
          </div>
          
          <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-zinc-500">Tech Stack (Comma Separated)</label>
              <input className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3 rounded-xl outline-none text-sm font-mono focus:border-green-500 transition-colors"
                 value={formData.techStack?.join(', ')}
                 onChange={e => setFormData({...formData, techStack: e.target.value.split(',').map(s => s.trim())})} />
          </div>
 
          <button onClick={() => onSave(formData)} className="w-full py-4 bg-green-600 text-white font-black uppercase tracking-widest rounded-xl hover:bg-green-500 transition-all shadow-lg hover:shadow-green-500/20">
              {initialData ? "Update System" : "Initialize"}
          </button>
       </div>
    )
 }
 
 function IdeaForm({ onSave, initialData }: { onSave: (i: any) => void, initialData?: IdeaData }) {
    const [formData, setFormData] = useState<Partial<IdeaData>>(initialData || { title: "", problem: "", isValidated: false });
    return (
       <div className="space-y-5">
          <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
             <Lightbulb className="text-yellow-500" /> {initialData ? "Refine Idea" : "New Spark"}
          </h2>
          
          <input placeholder="Idea Title" className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3 rounded-xl outline-none font-bold text-lg focus:border-yellow-500 transition-colors" 
             value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} autoFocus />
          
          <textarea placeholder="What problem does it solve?" className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3 rounded-xl outline-none text-sm h-32 resize-none focus:border-yellow-500 transition-colors"
             value={formData.problem} onChange={e => setFormData({...formData, problem: e.target.value})} />
          
          <div className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 cursor-pointer hover:border-zinc-400 transition-colors" onClick={() => setFormData({...formData, isValidated: !formData.isValidated})}>
             <div className={cn("w-6 h-6 rounded border flex items-center justify-center transition-all", formData.isValidated ? "bg-green-500 border-green-500" : "border-zinc-400")}>
                {formData.isValidated && <Check size={16} className="text-white"/>}
             </div>
             <div>
                <span className="text-sm font-bold block">Market Validated?</span>
                <span className="text-[10px] text-zinc-500 block">Have you talked to users?</span>
             </div>
          </div>
 
          <button onClick={() => onSave(formData)} className="w-full py-4 bg-yellow-500 text-black font-black uppercase tracking-widest rounded-xl hover:bg-yellow-400 transition-all shadow-lg hover:shadow-yellow-500/20">
             {initialData ? "Update Vault" : "Lock It In"}
          </button>
       </div>
    )
 }
 
 function LogForm({ projects, onSave }: { projects: ProjectData[], onSave: (l: any) => void }) {
    const [formData, setFormData] = useState<Partial<DevLogData>>({ projectId: projects[0]?.id || "", tasksCompleted: [], energyLevel: 8, commitCount: 0 });
    const [taskInput, setTaskInput] = useState("");
 
    const addTask = () => {
       if(taskInput) {
          setFormData({...formData, tasksCompleted: [...(formData.tasksCompleted || []), taskInput]});
          setTaskInput("");
       }
    }
 
    return (
       <div className="space-y-5">
          <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
             <Zap className="text-blue-500" /> Log Session
          </h2>
          
          <div>
             <label className="text-[10px] font-bold uppercase text-zinc-500 mb-1 block">Target Protocol</label>
             <select className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3 rounded-xl outline-none font-bold" 
                value={formData.projectId} onChange={e => setFormData({...formData, projectId: e.target.value})}>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
             </select>
          </div>
 
          <div>
             <label className="text-[10px] font-bold uppercase text-zinc-500 mb-1 block">Tasks Shipped</label>
             <div className="flex gap-2 mb-2">
                <input placeholder="Type & Enter..." className="flex-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3 rounded-xl outline-none text-sm" 
                   value={taskInput} onChange={e => setTaskInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTask()} />
                <button onClick={addTask} className="bg-blue-500 text-white p-3 rounded-xl hover:bg-blue-600"><Plus size={20}/></button>
             </div>
             <div className="flex flex-wrap gap-2">
                {formData.tasksCompleted?.map((t, i) => (
                   <span key={i} className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 text-xs px-2 py-1 rounded-md border border-blue-200 dark:border-blue-800 flex items-center gap-1">
                      {t} <button onClick={() => setFormData({...formData, tasksCompleted: formData.tasksCompleted?.filter((_, idx) => idx !== i)})}><X size={10}/></button>
                   </span>
                ))}
             </div>
          </div>
 
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="text-[10px] uppercase font-bold text-zinc-500">Flow (1-10)</label>
                <input type="number" max={10} min={1} className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3 rounded-xl outline-none font-mono" 
                   value={formData.energyLevel} onChange={e => setFormData({...formData, energyLevel: Number(e.target.value)})} />
             </div>
             <div>
                <label className="text-[10px] uppercase font-bold text-zinc-500">Commits</label>
                <input type="number" className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3 rounded-xl outline-none font-mono" 
                   value={formData.commitCount} onChange={e => setFormData({...formData, commitCount: Number(e.target.value)})} />
             </div>
          </div>
          
          <div>
             <label className="text-[10px] uppercase font-bold text-zinc-500">Blockers (Optional)</label>
             <input className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3 rounded-xl outline-none text-sm" placeholder="What stopped you?"
                onChange={e => setFormData({...formData, blockers: e.target.value})} />
          </div>
 
          <button onClick={() => onSave(formData)} className="w-full py-4 bg-blue-600 text-white font-black uppercase tracking-widest rounded-xl hover:bg-blue-500 transition-all shadow-lg hover:shadow-blue-500/20">
             Commit Log
          </button>
       </div>
    )
 }

function CalendarDropdown({ current, onSelect }: { current: Date, onSelect: (d: Date) => void }) {
   const [viewDate, setViewDate] = useState(current);
   const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
   const startDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();

   return (
      <div className="absolute top-14 right-0 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl z-50 w-80">
         <div className="flex justify-between items-center mb-4">
            <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}><ChevronLeft size={16} /></button>
            <span className="font-bold text-sm">{viewDate.toLocaleDateString('default', { month: 'long', year: 'numeric' })}</span>
            <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}><ChevronRight size={16} /></button>
         </div>
         <div className="grid grid-cols-7 gap-1 text-center mb-2 text-zinc-500 text-[10px] font-bold">
            {['S','M','T','W','T','F','S'].map((d, i) => <div key={i}>{d}</div>)}
         </div>
         <div className="grid grid-cols-7 gap-1">
            {Array.from({length: startDay}).map((_, i) => <div key={`empty-${i}`} />)}
            {Array.from({length: daysInMonth}).map((_, i) => {
               const dayNum = i + 1;
               const d = new Date(viewDate.getFullYear(), viewDate.getMonth(), dayNum);
               const isSelected = formatDateKey(d) === formatDateKey(current);
               return (
                  <button key={dayNum} onClick={() => onSelect(d)}
                     className={cn("h-8 w-8 rounded-lg text-xs font-bold hover:bg-zinc-100 dark:hover:bg-white/10", isSelected && "bg-black dark:bg-white text-white dark:text-black")}>
                     {dayNum}
                  </button>
               )
            })}
         </div>
      </div>
   );
}