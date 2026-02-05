"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy, Calendar, Clock, Tv, Plus, Trash2, 
  AlertOctagon, Edit2, X, Ticket,
  Loader2,
  Sparkles
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// --- BACKEND ---
import { getMatches, upsertMatch, deleteMatch, generateMatchIntel, MatchData } from "@/lib/actions/sports";

// --- UTILS ---
function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

// --- THEME ASSETS ---
const BG_PATTERNS = {
    football: "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=2000&q=80",
    cricket: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=2000&q=80", 
    f1: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=2000&q=80",
    default: "https://images.unsplash.com/photo-1556056504-5c7696c4c28d?auto=format&fit=crop&w=2000&q=80"
};

export default function TheArenaFinal() {
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingMatch, setEditingMatch] = useState<MatchData | null>(null);

  const fetchData = useCallback(async () => {
    // We don't set loading to true here to avoid the flash on every update if this is called frequently
    // But for initial load it is handled by the initial state
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const res: any = await getMatches();
        setMatches(res || []);
    } finally {
        setLoading(false);
    }
  }, []);

  useEffect(() => { 
      // This is safe because fetchData is async and state updates happen in the next tick
      fetchData(); 
  }, [fetchData]);

  const handleSave = async (data: MatchData) => {
      await upsertMatch(data);
      setShowModal(false);
      setEditingMatch(null);
      fetchData();
  };

  const handleEdit = (match: MatchData) => {
      setEditingMatch(match);
      setShowModal(true);
  };

  const handleDelete = async (id: string) => {
      if(confirm("Cancel Ticket?")) {
          await deleteMatch(id);
          fetchData();
      }
  };

  const nextMatch = matches[0];

  return (
    <div className="min-h-screen bg-emerald-50/50 dark:bg-[#050505] text-zinc-900 dark:text-zinc-100 font-sans relative overflow-x-hidden selection:bg-orange-500/30 transition-colors duration-500">
      
      {/* 1. BACKGROUND TEXTURES */}
      <div className="fixed inset-0 pointer-events-none z-0">
         <div className="absolute inset-0 bg-emerald-100/20 dark:opacity-0 mix-blend-multiply" />
         <div className="absolute inset-0 opacity-0 dark:opacity-100 transition-opacity">
             <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10" />
             <div className="absolute top-0 left-0 w-full h-full bg-linear-to-b from-blue-900/10 via-transparent to-black" />
         </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-4 md:p-8 space-y-10">
        
        {/* 2. HEADER (ANIMATED & FIXED) */}
        <header className="flex flex-col md:flex-row justify-between items-end border-b border-zinc-300 dark:border-white/10 pb-8 pt-6 pl-2 md:pl-0">
            <div className="space-y-2">
                <motion.div 
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}
                    className="flex items-center gap-3 text-orange-600 dark:text-orange-500 font-bold text-xs tracking-[0.4em] uppercase"
                >
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
                    </span>
                    Live Command Center
                </motion.div>
                
                <div className="overflow-hidden">
                    <motion.h1 
                        initial={{ y: 50, opacity: 0 }} 
                        animate={{ y: 0, opacity: 1 }} 
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter text-zinc-900 dark:text-white leading-[0.9] drop-shadow-xl"
                    >
                        GAME<span className="text-transparent bg-clip-text bg-linear-to-r from-orange-500 to-red-600 inline-block pb-2 hover:scale-105 transition-transform cursor-default origin-left">DAY</span>
                    </motion.h1>
                </div>
            </div>

            <motion.button 
                initial={{ scale: 0.8, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }} 
                transition={{ delay: 0.3, type: "spring" }}
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }}
                onClick={() => { setEditingMatch(null); setShowModal(true); }} 
                className="group bg-zinc-900 dark:bg-white text-white dark:text-black px-8 py-4 rounded-full font-black uppercase tracking-wider shadow-2xl flex items-center gap-3"
            >
                <Plus size={20} className="group-hover:rotate-90 transition-transform"/> 
                <span>Book Fixture</span>
            </motion.button>
        </header>

        {/* 3. HERO: NEXT MATCH */}
        <AnimatePresence>
            {nextMatch ? (
                <HeroMatch match={nextMatch} />
            ) : !loading && (
                <div className="h-64 w-full border-2 border-dashed border-zinc-300 dark:border-zinc-800 bg-white/50 dark:bg-white/5 rounded-3xl flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-600 backdrop-blur-sm">
                    <Trophy size={48} className="mb-4 opacity-50"/>
                    <p className="font-black uppercase tracking-widest text-lg">No Upcoming Fixtures</p>
                </div>
            )}
        </AnimatePresence>

        {/* 4. UPCOMING GRID */}
        <div>
            <div className="flex items-center gap-2 mb-6">
                <Calendar className="text-orange-500" size={20}/> 
                <h3 className="text-xl font-black uppercase text-zinc-900 dark:text-white">Broadcast Schedule</h3>
            </div>
            
            {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="animate-spin text-zinc-400" size={40}/></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
                    <AnimatePresence>
                        {matches.map((match, i) => (
                            <MatchCard key={match.id} match={match} index={i} onDelete={handleDelete} onEdit={handleEdit} />
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>

      </div>

      {/* --- MODAL --- */}
      <AnimatePresence>
          {showModal && (
            <AddMatchModal 
                onClose={() => setShowModal(false)} 
                onSave={handleSave} 
                initialData={editingMatch} 
            />
          )}
      </AnimatePresence>

    </div>
  );
}

// ============================================================================
// COMPONENT: HERO MATCH
// ============================================================================
function HeroMatch({ match }: { match: MatchData }) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const bgImage = BG_PATTERNS[match.sport as keyof typeof BG_PATTERNS] || BG_PATTERNS.default;
    
    return (
        <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} className="relative w-full h-112.5 rounded-[2.5rem] overflow-hidden group shadow-2xl border-4 border-white dark:border-white/10">
            {/* Immersive BG */}
            <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
                style={{ backgroundImage: `url(${bgImage})` }}
            />
            <div className="absolute inset-0 bg-linear-to-t from-black via-black/40 to-transparent" />
            
            {/* Conflict Alert */}
            {match.conflictTask && (
                <div className="absolute top-6 right-6 bg-red-600 text-white px-4 py-2 rounded-full font-black text-xs uppercase tracking-widest flex items-center gap-2 animate-pulse z-20 shadow-lg border-2 border-white">
                    <AlertOctagon size={16}/> Work Clash: {match.conflictTask}
                </div>
            )}

            <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12 z-10">
                <div className="mb-2 flex items-center gap-2 text-white font-bold text-sm uppercase tracking-widest bg-black/30 backdrop-blur-md w-fit px-3 py-1 rounded-full">
                    <span className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"/> Up Next • {match.tournament}
                </div>
                
                <h1 className="text-4xl md:text-7xl font-black uppercase text-white leading-[0.9] mb-6 drop-shadow-xl">
                    {match.title}
                </h1>

                <div className="flex flex-wrap items-center gap-4 text-sm font-bold text-white">
                    <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 shadow-lg">
                        <Calendar size={16}/> {match.date}
                    </div>
                    <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 shadow-lg">
                        <Clock size={16}/> {match.time}
                    </div>
                    {match.platform && (
                        <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 shadow-lg">
                            <Tv size={16}/> {match.platform}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    )
}

// ============================================================================
// COMPONENT: MATCH CARD
// ============================================================================
function MatchCard({ match, index, onDelete, onEdit }: { match: MatchData, index: number, onDelete: (id:string)=>void, onEdit: (m:MatchData)=>void }) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const bgImage = BG_PATTERNS[match.sport as keyof typeof BG_PATTERNS] || BG_PATTERNS.default;
    const isConflict = !!match.conflictTask;

    return (
        <motion.div 
            initial={{opacity:0, y:20}} 
            animate={{opacity:1, y:0}} 
            transition={{delay: index * 0.1}}
            className={cn(
                "group relative h-72 rounded-3xl overflow-hidden border transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl",
                isConflict ? "border-red-500 shadow-[0_0_20px_rgba(220,38,38,0.3)] ring-2 ring-red-500" : "border-white dark:border-white/10"
            )}
        >
            {/* Background Texture */}
            <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: `url(${bgImage})` }} />
            <div className="absolute inset-0 bg-linear-to-t from-zinc-900 via-zinc-900/80 to-transparent" />

            <div className="absolute inset-0 p-6 flex flex-col justify-between z-10">
                <div className="flex justify-between items-start">
                    <span className="bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase text-white shadow-lg">
                        {match.sport}
                    </span>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => onEdit(match)} className="bg-white text-black p-2 rounded-full hover:scale-110 transition-transform"><Edit2 size={12}/></button>
                        <button onClick={() => onDelete(match.id!)} className="bg-white text-black p-2 rounded-full hover:bg-red-500 hover:text-white transition-colors"><Trash2 size={12}/></button>
                    </div>
                </div>

                <div>
                    {isConflict && (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-red-400 bg-red-950/50 w-fit px-2 py-1 rounded mb-2 border border-red-500/30">
                            <AlertOctagon size={12}/> Clash: {match.conflictTask}
                        </div>
                    )}
                    
                    <h3 className="text-2xl font-black uppercase text-white leading-none mb-1 drop-shadow-md line-clamp-2">{match.title}</h3>
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4">{match.tournament}</p>

                    <div className="flex items-center justify-between border-t border-white/10 pt-3">
                        <div className="flex gap-3 text-xs font-bold text-zinc-300">
                            <span className="flex items-center gap-1"><Calendar size={12}/> {match.date}</span>
                            <span className={cn("flex items-center gap-1", isConflict ? "text-red-400 animate-pulse" : "text-white")}><Clock size={12}/> {match.time}</span>
                        </div>
                        {match.aiIntel && (
                            <div className="bg-orange-500/20 p-1.5 rounded-lg border border-orange-500/20 shadow-lg" title={match.aiIntel}>
                                <Sparkles size={12} className="text-orange-500"/>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

// ============================================================================
// COMPONENT: ADD/EDIT MODAL
// ============================================================================
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function AddMatchModal({ onClose, onSave, initialData }: { onClose:()=>void, onSave:(d:any)=>void, initialData?: MatchData | null }) {
    const [form, setForm] = useState<Partial<MatchData>>(initialData || { sport: 'football', title: '', date: '', time: '', platform: 'TV', duration: 180 });
    const [aiAnalysis, setAiAnalysis] = useState(initialData?.aiIntel || "");
    const [thinking, setThinking] = useState(false);
    
    // Future Date Lock
    const today = new Date().toISOString().split('T')[0];

    const handleGenerate = async () => {
        if(!form.title) return;
        setThinking(true);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const intel: any = await generateMatchIntel(form.title, form.sport || 'football');
        setAiAnalysis(intel.intel);
        setForm({ ...form, aiIntel: intel.intel });
        setThinking(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div initial={{scale:0.9, opacity:0}} animate={{scale:1, opacity:1}} className="bg-white dark:bg-[#09090b] w-full max-w-lg rounded-3xl p-8 border border-zinc-200 dark:border-white/10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-orange-500 to-red-600" />
                <h2 className="text-2xl font-black uppercase mb-6 text-zinc-900 dark:text-white flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Ticket size={24} className="text-orange-500" />
                        {initialData ? "Update Fixture" : "Book New Fixture"}
                    </div>
                    <button onClick={onClose}><X size={20} className="text-zinc-400 hover:text-black dark:hover:text-white"/></button>
                </h2>
                
                <div className="space-y-4">
                    <input autoFocus placeholder="Match Title (e.g. India vs Australia)" className="w-full bg-zinc-100 dark:bg-zinc-900 border border-transparent focus:border-orange-500 p-4 rounded-xl font-bold outline-none text-zinc-900 dark:text-white transition-colors" 
                        value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
                    
                    <div className="grid grid-cols-2 gap-4">
                        <select className="bg-zinc-100 dark:bg-zinc-900 p-4 rounded-xl font-bold outline-none text-zinc-900 dark:text-white" value={form.sport} onChange={e => setForm({...form, sport: e.target.value})}>
                            <option value="football">Football</option><option value="cricket">Cricket</option><option value="f1">F1</option>
                        </select>
                        <input placeholder="Platform (e.g. TV)" className="bg-zinc-100 dark:bg-zinc-900 p-4 rounded-xl font-bold outline-none text-zinc-900 dark:text-white" value={form.platform} onChange={e => setForm({...form, platform: e.target.value})} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <input type="date" min={today} className="bg-zinc-100 dark:bg-zinc-900 p-4 rounded-xl font-mono text-sm font-bold outline-none text-zinc-900 dark:text-white uppercase" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
                        <input type="time" className="bg-zinc-100 dark:bg-zinc-900 p-4 rounded-xl font-mono text-sm font-bold outline-none text-zinc-900 dark:text-white uppercase" value={form.time} onChange={e => setForm({...form, time: e.target.value})} />
                    </div>

                    <input placeholder="Tournament" className="w-full bg-zinc-100 dark:bg-zinc-900 p-4 rounded-xl font-bold outline-none text-zinc-900 dark:text-white text-sm" value={form.tournament} onChange={e => setForm({...form, tournament: e.target.value})} />

                    <div className="pt-2">
                        {!aiAnalysis ? (
                            <button onClick={handleGenerate} disabled={!form.title} className="text-xs font-bold text-zinc-500 hover:text-orange-600 flex items-center gap-2 transition-colors disabled:opacity-50">
                                {thinking ? <Loader2 size={12} className="animate-spin"/> : <Sparkles size={14}/>} Generate Pundit Intel
                            </button>
                        ) : (
                            <div className="bg-orange-500/10 p-3 rounded-lg text-xs font-medium text-orange-600 dark:text-orange-400 italic border border-orange-500/20">
                                Pundit: {aiAnalysis}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex gap-3 pt-8">
                    <button onClick={onClose} className="flex-1 py-4 font-bold text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl uppercase tracking-wider">Cancel</button>
                    <button onClick={() => onSave(form)} className="flex-1 py-4 bg-black dark:bg-white text-white dark:text-black font-black rounded-xl hover:scale-105 transition-all uppercase tracking-wider shadow-xl">
                        {initialData ? "Update Ticket" : "Confirm Ticket"}
                    </button>
                </div>
            </motion.div>
        </div>
    )
}