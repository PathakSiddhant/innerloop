
// "use client";

// /* eslint-disable @next/next/no-img-element */
// import React, { useEffect, useState } from "react";
// import { motion, AnimatePresence, type PanInfo } from "framer-motion";
// import Link from "next/link";
// import { 
//   Footprints, Flame, Droplets,
//   Terminal, Clock, Trophy, Play, Loader2, Zap, 
//   List, ArrowRight, ArrowLeft, Barcode, 
//   CheckCircle2, ChevronRight, ChevronLeft,
//   Goal, CircleDot, Flag
// } from "lucide-react";
// import { getDashboardOverview } from "@/lib/actions/dashboard";
// import { cn } from "@/lib/utils";

// // --- STRICT TYPES ---
// interface Task {
//     id: string;
//     title: string;
//     taskType: "fixed" | "flexible";
//     startTime?: string;
//     description?: string;
//     status?: string;
// }

// interface Log {
//     project: string;
//     log_content: string;
//     time?: string;
// }

// interface Match {
//     id: string;
//     team1: string;
//     team2: string;
//     tournament: string;
//     sport: string;
//     match_time: string;
// }

// interface EntertainmentItem {
//     title: string;
//     type: string;
//     genre: string;
//     image?: string;
// }

// interface FitnessData {
//     water: number;
//     steps: number;
//     calories: number;
// }

// interface DashboardData {
//     fitness: FitnessData;
//     tasks: Task[];
//     builder: Log[];
//     entertainment: EntertainmentItem | null;
//     sports: Match[];
// }

// // ============================================================================
// // 1. HEADER (Unified HUD)
// // ============================================================================
// const SectionHeader = () => {
//     const [time, setTime] = useState<Date | null>(null);

//     useEffect(() => {
//         setTime(new Date());
//         const timer = setInterval(() => {
//             setTime(new Date());
//         }, 1000);
//         return () => clearInterval(timer);
//     }, []);

//     if (!time) return null;

//     return (
//         <div className="mb-10 pt-2">
//             <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-6">
//                 <div>
//                     <motion.div 
//                         initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} 
//                         className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.25em] text-zinc-400 mb-2"
//                     >
//                         <Zap size={14} className="fill-indigo-500 text-indigo-500"/> Dashboard Overview
//                     </motion.div>
//                     <motion.h1 
//                         initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 100 }}
//                         className="text-5xl md:text-7xl font-black tracking-tighter text-zinc-900 dark:text-white uppercase leading-[0.85]"
//                     >
//                         NEXUS <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">PRIME</span>
//                     </motion.h1>
//                 </div>

//                 <motion.div 
//                     initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
//                     className="text-right"
//                 >
//                     <div className="flex items-baseline gap-2 justify-end">
//                         <span className="text-4xl md:text-6xl font-mono font-black text-zinc-900 dark:text-white tracking-tighter leading-none tabular-nums">
//                             {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                         </span>
//                         <span className="text-lg md:text-xl font-bold text-zinc-400 dark:text-zinc-600">
//                             {time.toLocaleTimeString([], { hour12: true }).slice(-2)}
//                         </span>
//                     </div>
//                     <div className="flex items-center justify-end gap-3 mt-1">
//                         <span className="h-px w-8 bg-indigo-500/50"></span>
//                         <span className="text-xs font-bold text-zinc-500 uppercase tracking-[0.2em]">
//                             {time.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
//                         </span>
//                     </div>
//                 </motion.div>
//             </div>
//             <motion.div 
//                 initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.4, duration: 0.8 }}
//                 className="w-full h-px opacity-60"
//                 style={{ background: 'linear-gradient(90deg, transparent, rgba(161, 161, 170, 0.5), transparent)' }}
//             />
//         </div>
//     );
// };

// // ============================================================================
// // MAIN PAGE COMPONENT
// // ============================================================================
// export default function DashboardOverview() {
//     const [data, setData] = useState<DashboardData | null>(null);
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         const loadData = async () => {
//             try {
//                 // eslint-disable-next-line @typescript-eslint/no-explicit-any
//                 const res: any = await getDashboardOverview();
//                 setData(res);
//             } catch (error) {
//                 console.error("Error:", error);
//             } finally {
//                 setLoading(false);
//             }
//         };
//         loadData();
//     }, []);

//     if (loading) {
//         return (
//             <div className="h-screen flex flex-col items-center justify-center bg-[#F2F4F7] dark:bg-[#050505] text-zinc-400 gap-4">
//                 <Loader2 className="animate-spin text-indigo-500" size={48}/>
//                 <p className="text-xs font-bold uppercase tracking-[0.3em] animate-pulse">System Boot...</p>
//             </div>
//         );
//     }

//     if (!data) return null;

//     return (
//         <div className="min-h-screen bg-[#F0F2F5] dark:bg-[#050505] text-zinc-900 dark:text-zinc-100 font-sans p-6 md:p-10 relative overflow-hidden transition-colors duration-500 selection:bg-indigo-500/30">
            
//             <div className="fixed inset-0 pointer-events-none z-0">
//                 <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
//                 <div className="absolute top-[-10%] right-[-5%] w-[40vw] h-[40vh] bg-blue-500/5 dark:bg-blue-600/5 rounded-full blur-[120px]" />
//                 <div className="absolute bottom-[-10%] left-[-5%] w-[40vw] h-[40vh] bg-purple-500/5 dark:bg-purple-600/5 rounded-full blur-[120px]" />
//             </div>

//             <div className="relative z-10 mx-auto" style={{ maxWidth: '1600px' }}>
//                 <SectionHeader />

//                 {/* MASTER GRID */}
//                 <div className="grid grid-cols-1 md:grid-cols-12 gap-8 auto-rows-[minmax(180px,auto)]">

//                     {/* 1. FITNESS (Col 4) - Holograms */}
//                     <div className="md:col-span-12 lg:col-span-4 flex flex-col justify-center">
//                         <FitnessHolograms data={data.fitness} />
//                     </div>

//                     {/* 2. SPORTS (Col 4) - Arena */}
//                     <div className="md:col-span-12 lg:col-span-4 h-full">
//                         <VibeySportsCard matches={data.sports} />
//                     </div>

//                     {/* 3. TERMINAL (Col 4) - Console */}
//                     <div className="md:col-span-12 lg:col-span-4 h-full">
//                         <LightDarkTerminal data={data.builder} />
//                     </div>

//                     {/* 4. TASKS (Col 7) - UNIFIED SPLIT DECK */}
//                     <div className="md:col-span-12 lg:col-span-7 h-full" style={{ minHeight: '340px' }}>
//                         <UnifiedTaskDeck data={data.tasks} />
//                     </div>

//                     {/* 5. ENTERTAINMENT (Col 5) - Real Ticket */}
//                     <div className="md:col-span-12 lg:col-span-5 h-full flex items-center">
//                         <CinemaTicketReal data={data.entertainment} />
//                     </div>

//                 </div>
//             </div>
//         </div>
//     );
// }

// // ============================================================================
// // 1. FITNESS: FLOATING HOLOGRAMS
// // ============================================================================
// function FitnessHolograms({ data }: { data: FitnessData }) {
//     return (
//         <Link href="/fitness" className="block w-full group">
//             <div className="grid grid-cols-3 gap-4 items-center">
//                 <HoloRing value={data.steps} max={10000} icon={Footprints} color="text-emerald-600 dark:text-emerald-400" stroke="stroke-emerald-500" label="Steps" unit="" delay={0}/>
//                 <HoloRing value={data.calories} max={2500} icon={Flame} color="text-orange-600 dark:text-orange-400" stroke="stroke-orange-500" label="Cals" unit="" delay={0.1}/>
//                 <HoloRing value={data.water} max={3000} icon={Droplets} color="text-blue-600 dark:text-blue-400" stroke="stroke-blue-500" label="Aqua" unit="ml" delay={0.2}/>
//             </div>
//         </Link>
//     )
// }

// // eslint-disable-next-line @typescript-eslint/no-explicit-any
// function HoloRing({ value, max, icon: Icon, color, stroke, label, unit, delay }: { value: number, max: number, icon: any, color: string, stroke: string, label: string, unit: string, delay: number }) {
//     const percent = Math.min((value / max) * 100, 100);
//     return (
//         <motion.div 
//             initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: delay }}
//             whileHover={{ y: -10, scale: 1.05 }}
//             className="flex flex-col items-center justify-center relative cursor-pointer"
//         >
//             <div className="relative w-24 h-24 mb-3 filter drop-shadow-xl">
//                 <svg className="w-full h-full -rotate-90">
//                     <circle cx="50%" cy="50%" r="40" className="stroke-zinc-200 dark:stroke-zinc-800/60" strokeWidth="8" fill="transparent" />
//                     <motion.circle initial={{ pathLength: 0 }} animate={{ pathLength: percent / 100 }} transition={{ duration: 1.5, ease: "easeOut" }} cx="50%" cy="50%" r="40" className={stroke} strokeWidth="8" fill="transparent" strokeLinecap="round" />
//                 </svg>
//                 <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-zinc-900 rounded-full w-16 h-16 m-auto shadow-inner">
//                     <Icon size={22} className={color}/>
//                 </div>
//             </div>
//             <div className="text-center">
//                 <div className="text-lg font-black text-zinc-800 dark:text-white leading-none tracking-tight">
//                     {value > 1000 && unit !== 'ml' ? (value/1000).toFixed(1) + 'k' : value}
//                 </div>
//                 <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">{label}</div>
//             </div>
//         </motion.div>
//     )
// }

// // ============================================================================
// // 2. SPORTS: VIBEY ARENA
// // ============================================================================
// function VibeySportsCard({ matches }: { matches: Match[] }) {
//     const [index, setIndex] = useState(0);
//     const nextMatch = (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); if (matches?.length > 0) setIndex((prev) => (prev + 1) % matches.length); };
//     const prevMatch = (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); if (matches?.length > 0) setIndex((prev) => (prev - 1 + matches.length) % matches.length); };
//     const currentMatch = matches?.length > 0 ? matches[index] : null;

//     const getSportTheme = (match: Match | null) => {
//         if (!match) return { gradient: "from-zinc-800 to-black", accent: "text-indigo-400", icon: Trophy, texture: "opacity-10", label: "Sports" };
//         const s = (match.sport || "").toLowerCase(); const t = (match.tournament || "").toLowerCase();
//         if (s.includes('cricket') || t.includes('cricket') || t.includes('ipl')) return { gradient: "from-[#0f5132] to-[#052c1a]", accent: "text-yellow-400", icon: CircleDot, texture: "opacity-30", label: "Cricket" };
//         if (s.includes('football') || t.includes('fc')) return { gradient: "from-[#1e3a8a] to-[#0f172a]", accent: "text-sky-400", icon: Goal, texture: "opacity-20", label: "Football" };
//         if (s.includes('f1') || t.includes('gp')) return { gradient: "from-[#991b1b] to-[#450a0a]", accent: "text-white", icon: Flag, texture: "opacity-40", label: "F1 Racing" };
//         return { gradient: "from-zinc-800 to-zinc-950", accent: "text-indigo-400", icon: Trophy, texture: "opacity-10", label: "Sports" };
//     };
//     const theme = getSportTheme(currentMatch);
//     const SportIcon = theme.icon;

//     return (
//         <Link href="/sports" className="block h-full group">
//             <motion.div whileHover={{ scale: 1.02 }} className={cn("h-full rounded-[2.5rem] shadow-2xl overflow-hidden relative flex flex-col text-white", theme.gradient && `bg-gradient-to-br ${theme.gradient}`)}>
//                 <div className={cn("absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay", theme.texture)} />
//                 <div className="relative z-10 px-6 py-4 flex justify-between items-center border-b border-white/10 bg-black/10 backdrop-blur-md">
//                     <div className="flex items-center gap-2"><SportIcon size={18} className={theme.accent}/><span className="text-xs font-black uppercase tracking-widest text-white/80">{currentMatch?.tournament || theme.label}</span></div>
//                     {currentMatch && <span className="bg-red-600/90 backdrop-blur-sm text-white text-[9px] font-black px-2 py-0.5 rounded shadow-lg animate-pulse">LIVE</span>}
//                 </div>
//                 <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 text-center">
//                     <AnimatePresence mode="wait">
//                         {currentMatch ? (
//                             <motion.div key={currentMatch.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="w-full">
//                                 <div className="flex justify-between items-center w-full mb-6 gap-2">
//                                     <div className="flex-1 text-right"><h3 className="text-2xl md:text-3xl font-black text-white leading-none uppercase tracking-tighter truncate drop-shadow-lg">{currentMatch.team1.substring(0,3)}</h3><p className="text-[10px] font-bold text-white/60 uppercase mt-1 truncate">{currentMatch.team1}</p></div>
//                                     <div className="px-2"><span className="text-3xl font-black text-white/20 italic">VS</span></div>
//                                     <div className="flex-1 text-left"><h3 className="text-2xl md:text-3xl font-black text-white leading-none uppercase tracking-tighter truncate drop-shadow-lg">{currentMatch.team2.substring(0,3)}</h3><p className="text-[10px] font-bold text-white/60 uppercase mt-1 truncate">{currentMatch.team2}</p></div>
//                                 </div>
//                                 <div className="inline-flex items-center gap-2 bg-black/30 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl font-mono text-sm shadow-xl"><Clock size={14} className={theme.accent}/><span className="font-bold tracking-wide">{new Date(currentMatch.match_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span></div>
//                             </motion.div>
//                         ) : (
//                             <div className="text-white/40"><Trophy size={48} className="mx-auto mb-3 opacity-50"/><p className="text-sm font-bold uppercase tracking-widest">No Matches Today</p></div>
//                         )}
//                     </AnimatePresence>
//                 </div>
//                 {matches?.length > 1 && (
//                     <div className="absolute bottom-4 right-4 flex gap-2 z-20">
//                         <button onClick={prevMatch} className="p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md"><ArrowLeft size={14}/></button>
//                         <button onClick={nextMatch} className="p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md"><ArrowRight size={14}/></button>
//                     </div>
//                 )}
//             </motion.div>
//         </Link>
//     )
// }

// // ============================================================================
// // 3. TERMINAL: CLEAN CONSOLE (FIXED HEIGHT + SCROLL)
// // ============================================================================
// function LightDarkTerminal({ data }: { data: Log[] }) {
//     return (
//         <Link href="/builder" className="block h-full group">
//             <motion.div 
//                 whileHover={{ y: -4 }} 
//                 // Bhai yahan 'h-full' ki jagah 'h-[320px]' kar diya hai taki ye stretch na ho
//                 className="h-[320px] bg-white dark:bg-[#0D1117] rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-xl relative overflow-hidden flex flex-col font-mono"
//             >
//                 {/* Header Section */}
//                 <div className="bg-zinc-100 dark:bg-[#161B22] px-5 py-3 flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
//                     <div className="flex gap-1.5">
//                         <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56] border border-black/10"/>
//                         <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E] border border-black/10"/>
//                         <div className="w-2.5 h-2.5 rounded-full bg-[#27C93F] border border-black/10"/>
//                     </div>
//                     <div className="ml-auto text-[10px] font-bold text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
//                         <Terminal size={12}/> builder.sh
//                     </div>
//                 </div>

//                 {/* Content Body - Ab ye scroll hoga agar content badhega */}
//                 <div className="flex-1 p-5 text-xs overflow-hidden relative bg-white dark:bg-[#0D1117]">
//                     <div className="relative z-10 space-y-3 h-full overflow-y-auto custom-scrollbar pr-2">
                        
//                         {/* Command Prompt */}
//                         <div className="flex gap-2 text-zinc-500 dark:text-zinc-400 pb-2 border-b border-zinc-100 dark:border-zinc-800/50 shrink-0">
//                             <span className="text-blue-600 dark:text-blue-400 font-bold">➜</span>
//                             <span className="text-purple-600 dark:text-purple-400 font-bold">~</span>
//                             <span>git log --recent</span>
//                         </div>

//                         {/* Logs List */}
//                         {data && data.length > 0 ? data.map((log, i) => (
//                             <div key={i} className="flex gap-3 group/log opacity-90 hover:opacity-100 transition-opacity cursor-default items-start font-medium">
//                                 <span className="text-zinc-400 dark:text-zinc-500 w-12 shrink-0 text-right">
//                                     {log.time ? new Date(log.time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : "--:--"}
//                                 </span>
//                                 <div className="flex-1 min-w-0 flex gap-2">
//                                     <span className="text-indigo-600 dark:text-indigo-400 font-bold shrink-0">[{log.project}]</span>
//                                     <span className="text-zinc-700 dark:text-zinc-300 truncate">{log.log_content}</span>
//                                 </div>
//                             </div>
//                         )) : (
//                             <p className="text-zinc-400 italic">{"// System idle."}</p>
//                         )}
                        
//                         {/* Blinking Cursor */}
//                         <div className="flex gap-2 pt-2 animate-pulse shrink-0">
//                             <span className="text-blue-600 dark:text-blue-400 font-bold">➜</span>
//                             <div className="w-2 h-4 bg-zinc-400 dark:bg-zinc-600"/>
//                         </div>
//                     </div>
//                 </div>
//             </motion.div>
//         </Link>
//     )
// }

// // ============================================================================
// // 4. TASKS: UNIFIED COMMAND DECK
// // ============================================================================
// function UnifiedTaskDeck({ data }: { data: Task[] }) {
//     const timeLocked = data.filter((t) => t.taskType === 'fixed');
//     const flexible = data.filter((t) => t.taskType === 'flexible');
//     const [cardIndex, setCardIndex] = useState(0);
//     const activeTask = timeLocked[cardIndex];

//     const handleNext = () => { if (timeLocked.length > 0) setCardIndex((prev) => (prev + 1) % timeLocked.length); };
//     const handlePrev = () => { if (timeLocked.length > 0) setCardIndex((prev) => (prev - 1 + timeLocked.length) % timeLocked.length); };
    
//     const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => { 
//         if (info.offset.x < -50) handleNext(); 
//         else if (info.offset.x > 50) handlePrev(); 
//     };

//     return (
//         <Link href="/tasks" className="block h-full group">
//             <div className="h-full bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden flex flex-col md:flex-row relative">
                
//                 {/* 1. LEFT: Fixed Schedule (CLEAN SWIPE) */}
//                 <div className="w-full md:w-1/2 p-6 flex flex-col border-b md:border-b-0 md:border-r border-zinc-100 dark:border-zinc-800">
//                     <div className="flex justify-between items-center mb-4">
//                         <h4 className="text-[10px] font-black uppercase text-zinc-400 tracking-widest flex items-center gap-2"><Clock size={12} className="text-indigo-500"/> Schedule</h4>
//                         {timeLocked.length > 1 && (
//                             <div className="flex gap-1">
//                                 <button onClick={(e) => {e.preventDefault(); handlePrev()}} className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded text-zinc-400"><ChevronLeft size={14}/></button>
//                                 <button onClick={(e) => {e.preventDefault(); handleNext()}} className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded text-zinc-400"><ChevronRight size={14}/></button>
//                             </div>
//                         )}
//                     </div>
                    
//                     <div className="relative flex-1 w-full" style={{ minHeight: '200px' }}>
//                         <AnimatePresence mode="wait">
//                             {activeTask ? (
//                                 <motion.div 
//                                     key={activeTask.id}
//                                     drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.2} onDragEnd={handleDragEnd} whileTap={{ cursor: "grabbing" }}
//                                     initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
//                                     className="absolute inset-0 z-20 h-full bg-white dark:bg-zinc-800 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-700 shadow-lg cursor-grab flex flex-col justify-between hover:border-indigo-500/30 transition-colors"
//                                 >
//                                     <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-indigo-500 to-purple-500" style={{ background: 'linear-gradient(to bottom, #6366f1, #a855f7)' }} />
//                                     <div>
//                                         <div className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-900/20 px-3 py-1 rounded-lg w-fit mb-3 border border-indigo-100 dark:border-indigo-900/30">@{activeTask.startTime || "Today"}</div>
//                                         <h3 className="text-xl font-bold text-zinc-900 dark:text-white leading-tight line-clamp-3">{activeTask.title}</h3>
//                                     </div>
//                                     <div className="flex justify-between items-center text-xs font-bold text-zinc-400 uppercase tracking-widest mt-2 border-t border-zinc-100 dark:border-zinc-800 pt-4">
//                                         <div className="flex items-center gap-2 text-emerald-500"><CheckCircle2 size={14}/> Active</div>
//                                         <div>{cardIndex + 1} / {timeLocked.length}</div>
//                                     </div>
//                                 </motion.div>
//                             ) : (
//                                 <div className="absolute inset-0 flex items-center justify-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
//                                     <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest">Free Time</p>
//                                 </div>
//                             )}
//                         </AnimatePresence>
//                         {timeLocked.length > 1 && <div className="absolute top-3 left-3 right-[-6px] bottom-[-6px] bg-zinc-100 dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 -z-10" />}
//                     </div>
//                 </div>

//                 {/* 2. RIGHT: Flexible Notes (Notepad) */}
//                 <div className="w-full md:w-1/2 p-6 bg-[#FEFCE8] dark:bg-[#1C1C1E] relative flex flex-col">
//                     <div className="absolute top-0 left-6 w-12 h-3 bg-yellow-400/20 dark:bg-zinc-800 backdrop-blur-sm rounded-b-lg border-x border-b border-yellow-400/30 dark:border-zinc-700" />
//                     <h4 className="text-[10px] font-black uppercase text-yellow-700 dark:text-zinc-500 tracking-widest mb-4 mt-2 flex items-center gap-2"><List size={12}/> Notes</h4>
//                     <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar">
//                         {flexible.length > 0 ? flexible.slice(0, 5).map((t: any, i: number) => (
//                             <div key={i} className="flex gap-3 items-start group/item">
//                                 <div className="mt-1.5 w-4 h-4 border-2 border-yellow-600/30 dark:border-zinc-500 rounded-md group-hover/item:bg-yellow-500/50 transition-colors shrink-0 cursor-pointer"/>
//                                 <p className="text-sm font-medium text-yellow-900 dark:text-zinc-300 leading-snug line-clamp-2 decoration-yellow-700/30 group-hover/item:line-through transition-all cursor-default">{t.title}</p>
//                             </div>
//                         )) : <p className="text-yellow-800/50 dark:text-zinc-500/50 text-sm italic text-center mt-10">{"Nothing pending."}</p>}
//                     </div>
//                     <div className="absolute bottom-4 right-6 text-[9px] font-black text-yellow-800/20 dark:text-zinc-700 uppercase tracking-widest">NEXUS PAD</div>
//                 </div>

//             </div>
//         </Link>
//     )
// }

// // ============================================================================
// // 5. COMPONENT: CINEMA TICKET (REAL CENTERED CUTOUT)
// // ============================================================================
// function CinemaTicketReal({ data }: { data: EntertainmentItem | null }) {
//     return (
//         <Link href="/entertainment" className="block w-full max-w-3xl group mx-auto">
//             <motion.div whileHover={{ scale: 1.02 }} className="relative filter drop-shadow-2xl">
//                 <div className="flex h-48 w-full">
//                     <div className="flex-1 bg-[#EBEBEB] dark:bg-[#121212] relative rounded-l-3xl overflow-hidden flex border border-zinc-200 dark:border-zinc-800 border-r-0">
//                         <div className="w-32 h-full relative shrink-0">
//                             {data?.image ? <img src={data.image} alt="poster" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"/> : <div className="w-full h-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center"><Play size={24} className="text-zinc-400"/></div>}
//                             <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#EBEBEB] dark:to-[#121212]" style={{ background: 'linear-gradient(to right, transparent, var(--tw-gradient-to))' }}/>
//                         </div>
//                         <div className="flex-1 p-6 flex flex-col justify-between relative z-10 border-l border-zinc-300/50 dark:border-zinc-800">
//                             <div>
//                                 <div className="flex items-center gap-2 mb-2"><span className="bg-rose-600 text-white text-[9px] font-black px-2 py-0.5 rounded shadow-sm shadow-rose-500/30">ADMIT ONE</span><span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">{data ? "Now Playing" : "Idle"}</span></div>
//                                 <h3 className="text-2xl md:text-3xl font-black text-zinc-900 dark:text-white leading-none line-clamp-2 uppercase tracking-tighter">{data?.title || "No Media Active"}</h3>
//                             </div>
//                             {data && <div className="flex items-center gap-4 text-xs font-mono text-zinc-600 dark:text-zinc-400 border-t border-zinc-300 dark:border-zinc-800 pt-3 mt-2"><span className="font-bold">{data.type.toUpperCase()}</span><span>•</span><span>{data.genre.split(',')[0]}</span><span>•</span><span>RESUME</span></div>}
//                         </div>
//                         <div className="absolute right-0 top-0 bottom-0 w-4 translate-x-[50%] z-30 flex flex-col justify-between py-2" style={{ right: '-6px' }}>{[...Array(8)].map((_, i) => <div key={i} className="w-3 h-3 rounded-full bg-[#F0F2F5] dark:bg-[#050505] shadow-inner"></div>)}</div>
//                     </div>
//                     <div className="w-24 bg-[#EBEBEB] dark:bg-[#121212] rounded-r-3xl border-y border-r border-zinc-300 dark:border-zinc-800 border-l-0 flex flex-col items-center justify-center relative">
//                         <div className="h-full border-l-2 border-dashed border-zinc-400/30 dark:border-zinc-700 w-full flex flex-col items-center justify-center gap-4"><Barcode className="text-zinc-400 rotate-90 h-16 w-8 opacity-60"/><div className="p-3 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-full shadow-lg group-hover:scale-110 transition-transform z-10"><Play size={14} fill="currentColor"/></div></div>
//                     </div>
//                 </div>
//             </motion.div>
//         </Link>
//     )
// }




"use client";

/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence, type PanInfo } from "framer-motion";
import Link from "next/link";
import { 
  Footprints, Flame, Droplets,
  Terminal, Clock, Trophy, Play, Loader2, Zap, 
  List, Barcode, 
  CheckCircle2, ChevronRight, ChevronLeft,
  Goal, CircleDot, Flag,
  ArrowLeft,
  ArrowRight
} from "lucide-react";
import { getDashboardOverview } from "@/lib/actions/dashboard";
import { cn } from "@/lib/utils";

// --- STRICT TYPES ---
interface Task {
    id: string;
    title: string;
    taskType: "fixed" | "flexible";
    startTime?: string;
    description?: string;
    status?: string;
}

interface Log {
    project: string;
    log_content: string;
    time?: string;
}

interface Match {
    id: string;
    team1: string;
    team2: string;
    tournament: string;
    sport: string;
    match_time: string;
}

interface EntertainmentItem {
    title: string;
    type: string;
    genre: string;
    image?: string;
}

interface FitnessData {
    water: number;
    waterGoal: number;
    steps: number;
    stepGoal: number;
    calories: number;
    calorieGoal: number;
}

interface DashboardData {
    fitness: FitnessData;
    tasks: Task[];
    builder: Log[];
    entertainment: EntertainmentItem | null;
    sports: Match[];
}

// ============================================================================
// 1. HEADER (Unified HUD)
// ============================================================================
const SectionHeader = () => {
    // Initialize with null to avoid hydration mismatch
    const [time, setTime] = useState<Date | null>(null);

    useEffect(() => {
        setTime(new Date());
        const timer = setInterval(() => {
            setTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    if (!time) return null;

    return (
        <div className="mb-10 pt-2">
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-6">
                <div>
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} 
                        className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.25em] text-zinc-400 mb-2"
                    >
                        <Zap size={14} className="fill-indigo-500 text-indigo-500"/> Dashboard Overview
                    </motion.div>
                    <motion.h1 
                        initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 100 }}
                        className="text-5xl md:text-7xl font-black tracking-tighter text-zinc-900 dark:text-white uppercase leading-[0.85]"
                    >
                        NEXUS <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">PRIME</span>
                    </motion.h1>
                </div>

                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                    className="text-right"
                >
                    <div className="flex items-baseline gap-2 justify-end">
                        <span className="text-4xl md:text-6xl font-mono font-black text-zinc-900 dark:text-white tracking-tighter leading-none tabular-nums">
                            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="text-lg md:text-xl font-bold text-zinc-400 dark:text-zinc-600">
                            {time.toLocaleTimeString([], { hour12: true }).slice(-2)}
                        </span>
                    </div>
                    <div className="flex items-center justify-end gap-3 mt-1">
                        <span className="h-px w-8 bg-indigo-500/50"></span>
                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-[0.2em]">
                            {time.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
                        </span>
                    </div>
                </motion.div>
            </div>
            {/* Gradient Separator */}
            <motion.div 
                initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.4, duration: 0.8 }}
                className="w-full h-px opacity-60"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(161, 161, 170, 0.5), transparent)' }}
            />
        </div>
    );
};

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================
export default function DashboardOverview() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const res: any = await getDashboardOverview();
                setData(res);
            } catch (error) {
                console.error("Error:", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    if (loading) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-[#F2F4F7] dark:bg-[#050505] text-zinc-400 gap-4">
                <Loader2 className="animate-spin text-indigo-500" size={48}/>
                <p className="text-xs font-bold uppercase tracking-[0.3em] animate-pulse">System Boot...</p>
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="min-h-screen bg-[#F0F2F5] dark:bg-[#050505] text-zinc-900 dark:text-zinc-100 font-sans p-6 md:p-10 relative overflow-hidden transition-colors duration-500 selection:bg-indigo-500/30">
            
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
                <div className="absolute top-[-10%] right-[-5%] w-[40vw] h-[40vh] bg-blue-500/5 dark:bg-blue-600/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[40vw] h-[40vh] bg-purple-500/5 dark:bg-purple-600/5 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 mx-auto" style={{ maxWidth: '1600px' }}>
                <SectionHeader />

                {/* MASTER GRID */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 auto-rows-[minmax(180px,auto)]">

                    {/* 1. FITNESS (Col 4) - Holograms */}
                    <div className="md:col-span-12 lg:col-span-4 flex flex-col justify-center">
                        <FitnessHolograms data={data.fitness} />
                    </div>

                    {/* 2. SPORTS (Col 4) - Arena */}
                    <div className="md:col-span-12 lg:col-span-4 h-full">
                        <VibeySportsCard matches={data.sports} />
                    </div>

                    {/* 3. TERMINAL (Col 4) - Console */}
                    <div className="md:col-span-12 lg:col-span-4 h-full">
                        <LightDarkTerminal data={data.builder} />
                    </div>

                    {/* 4. TASKS (Col 7) - UNIFIED SPLIT DECK */}
                    <div className="md:col-span-12 lg:col-span-7 h-full" style={{ minHeight: '340px' }}>
                        <UnifiedTaskDeck data={data.tasks} />
                    </div>

                    {/* 5. ENTERTAINMENT (Col 5) - Real Ticket */}
                    <div className="md:col-span-12 lg:col-span-5 h-full flex items-center">
                        <CinemaTicketReal data={data.entertainment} />
                    </div>

                </div>
            </div>
        </div>
    );
}

// ============================================================================
// 1. FITNESS: FLOATING HOLOGRAMS
// ============================================================================
function FitnessHolograms({ data }: { data: FitnessData }) {
    return (
        <Link href="/fitness" className="block w-full group">
            <div className="grid grid-cols-3 gap-4 items-center">
                {/* Dynamically passing goal as max */}
                <HoloRing value={data.steps} max={data.stepGoal} icon={Footprints} color="text-emerald-600 dark:text-emerald-400" stroke="stroke-emerald-500" label="Steps" unit="" delay={0}/>
                <HoloRing value={data.calories} max={data.calorieGoal} icon={Flame} color="text-orange-600 dark:text-orange-400" stroke="stroke-orange-500" label="Cals" unit="" delay={0.1}/>
                <HoloRing value={data.water} max={data.waterGoal} icon={Droplets} color="text-blue-600 dark:text-blue-400" stroke="stroke-blue-500" label="Aqua" unit="ml" delay={0.2}/>
            </div>
        </Link>
    )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function HoloRing({ value, max, icon: Icon, color, stroke, label, unit, delay }: { value: number, max: number, icon: any, color: string, stroke: string, label: string, unit: string, delay: number }) {
    const safeMax = max > 0 ? max : 1; // Prevent division by zero
    const percent = Math.min((value / safeMax) * 100, 100);
    
    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: delay }}
            whileHover={{ y: -10, scale: 1.05 }}
            className="flex flex-col items-center justify-center relative cursor-pointer"
        >
            <div className="relative w-24 h-24 mb-3 filter drop-shadow-xl">
                <svg className="w-full h-full -rotate-90">
                    <circle cx="50%" cy="50%" r="40" className="stroke-zinc-200 dark:stroke-zinc-800/60" strokeWidth="8" fill="transparent" />
                    <motion.circle initial={{ pathLength: 0 }} animate={{ pathLength: percent / 100 }} transition={{ duration: 1.5, ease: "easeOut" }} cx="50%" cy="50%" r="40" className={stroke} strokeWidth="8" fill="transparent" strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-zinc-900 rounded-full w-16 h-16 m-auto shadow-inner">
                    <Icon size={22} className={color}/>
                </div>
            </div>
            <div className="text-center">
                <div className="text-lg font-black text-zinc-800 dark:text-white leading-none tracking-tight">
                    {value > 1000 && unit !== 'ml' ? (value/1000).toFixed(1) + 'k' : value}
                </div>
                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">{label}</div>
            </div>
        </motion.div>
    )
}

// ============================================================================
// 2. SPORTS: VIBEY ARENA
// ============================================================================
function VibeySportsCard({ matches }: { matches: Match[] }) {
    const [index, setIndex] = useState(0);
    const nextMatch = (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); if (matches?.length > 0) setIndex((prev) => (prev + 1) % matches.length); };
    const prevMatch = (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); if (matches?.length > 0) setIndex((prev) => (prev - 1 + matches.length) % matches.length); };
    const currentMatch = matches?.length > 0 ? matches[index] : null;

    const getSportTheme = (match: Match | null) => {
        if (!match) return { gradient: "from-zinc-800 to-black", accent: "text-indigo-400", icon: Trophy, texture: "opacity-10", label: "Sports" };
        const s = (match.sport || "").toLowerCase(); const t = (match.tournament || "").toLowerCase();
        if (s.includes('cricket') || t.includes('cricket') || t.includes('ipl')) return { gradient: "from-[#0f5132] to-[#052c1a]", accent: "text-yellow-400", icon: CircleDot, texture: "opacity-30", label: "Cricket" };
        if (s.includes('football') || t.includes('fc')) return { gradient: "from-[#1e3a8a] to-[#0f172a]", accent: "text-sky-400", icon: Goal, texture: "opacity-20", label: "Football" };
        if (s.includes('f1') || t.includes('gp')) return { gradient: "from-[#991b1b] to-[#450a0a]", accent: "text-white", icon: Flag, texture: "opacity-40", label: "F1 Racing" };
        return { gradient: "from-zinc-800 to-zinc-950", accent: "text-indigo-400", icon: Trophy, texture: "opacity-10", label: "Sports" };
    };
    const theme = getSportTheme(currentMatch);
    const SportIcon = theme.icon;

    return (
        <Link href="/sports" className="block h-full group">
            <motion.div whileHover={{ scale: 1.02 }} className={cn("h-full rounded-[2.5rem] shadow-2xl overflow-hidden relative flex flex-col text-white", theme.gradient && `bg-gradient-to-br ${theme.gradient}`)}>
                <div className={cn("absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay", theme.texture)} />
                <div className="relative z-10 px-6 py-4 flex justify-between items-center border-b border-white/10 bg-black/10 backdrop-blur-md">
                    <div className="flex items-center gap-2"><SportIcon size={18} className={theme.accent}/><span className="text-xs font-black uppercase tracking-widest text-white/80">{currentMatch?.tournament || theme.label}</span></div>
                    {currentMatch && <span className="bg-red-600/90 backdrop-blur-sm text-white text-[9px] font-black px-2 py-0.5 rounded shadow-lg animate-pulse">LIVE</span>}
                </div>
                <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 text-center">
                    <AnimatePresence mode="wait">
                        {currentMatch ? (
                            <motion.div key={currentMatch.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="w-full">
                                <div className="flex justify-between items-center w-full mb-6 gap-2">
                                    <div className="flex-1 text-right"><h3 className="text-2xl md:text-3xl font-black text-white leading-none uppercase tracking-tighter truncate drop-shadow-lg">{currentMatch.team1.substring(0,3)}</h3><p className="text-[10px] font-bold text-white/60 uppercase mt-1 truncate">{currentMatch.team1}</p></div>
                                    <div className="px-2"><span className="text-3xl font-black text-white/20 italic">VS</span></div>
                                    <div className="flex-1 text-left"><h3 className="text-2xl md:text-3xl font-black text-white leading-none uppercase tracking-tighter truncate drop-shadow-lg">{currentMatch.team2.substring(0,3)}</h3><p className="text-[10px] font-bold text-white/60 uppercase mt-1 truncate">{currentMatch.team2}</p></div>
                                </div>
                                <div className="inline-flex items-center gap-2 bg-black/30 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl font-mono text-sm shadow-xl"><Clock size={14} className={theme.accent}/><span className="font-bold tracking-wide">{new Date(currentMatch.match_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span></div>
                            </motion.div>
                        ) : (
                            <div className="text-white/40"><Trophy size={48} className="mx-auto mb-3 opacity-50"/><p className="text-sm font-bold uppercase tracking-widest">No Matches Today</p></div>
                        )}
                    </AnimatePresence>
                </div>
                {matches?.length > 1 && (
                    <div className="absolute bottom-4 right-4 flex gap-2 z-20">
                        <button onClick={prevMatch} className="p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md"><ArrowLeft size={14}/></button>
                        <button onClick={nextMatch} className="p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md"><ArrowRight size={14}/></button>
                    </div>
                )}
            </motion.div>
        </Link>
    )
}

// ============================================================================
// 3. TERMINAL: CLEAN CONSOLE (FIXED HEIGHT + SCROLL)
// ============================================================================
function LightDarkTerminal({ data }: { data: Log[] }) {
    return (
        <Link href="/builder" className="block h-full group">
            <motion.div 
                whileHover={{ y: -4 }} 
                className="h-[320px] bg-white dark:bg-[#0D1117] rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-xl relative overflow-hidden flex flex-col font-mono"
            >
                <div className="bg-zinc-100 dark:bg-[#161B22] px-5 py-3 flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
                    <div className="flex gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56] border border-black/10"/><div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E] border border-black/10"/><div className="w-2.5 h-2.5 rounded-full bg-[#27C93F] border border-black/10"/></div>
                    <div className="ml-auto text-[10px] font-bold text-zinc-500 dark:text-zinc-400 flex items-center gap-2"><Terminal size={12}/> builder.sh</div>
                </div>
                <div className="flex-1 p-5 text-xs overflow-hidden relative bg-white dark:bg-[#0D1117]">
                    <div className="relative z-10 space-y-3 h-full overflow-y-auto custom-scrollbar pr-2">
                        <div className="flex gap-2 text-zinc-500 dark:text-zinc-400 pb-2 border-b border-zinc-100 dark:border-zinc-800/50 shrink-0"><span className="text-blue-600 dark:text-blue-400 font-bold">➜</span><span className="text-purple-600 dark:text-purple-400 font-bold">~</span><span>git log --recent</span></div>
                        {data && data.length > 0 ? data.map((log, i) => (
                            <div key={i} className="flex gap-3 group/log opacity-90 hover:opacity-100 transition-opacity cursor-default items-start font-medium">
                                <span className="text-zinc-400 dark:text-zinc-500 w-12 shrink-0 text-right">
                                    {log.time ? new Date(log.time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : "--:--"}
                                </span>
                                <div className="flex-1 min-w-0 flex gap-2"><span className="text-indigo-600 dark:text-indigo-400 font-bold shrink-0">[{log.project}]</span><span className="text-zinc-700 dark:text-zinc-300 truncate">{log.log_content}</span></div>
                            </div>
                        )) : <p className="text-zinc-400 italic">{"// System idle."}</p>}
                        <div className="flex gap-2 pt-2 animate-pulse shrink-0"><span className="text-blue-600 dark:text-blue-400 font-bold">➜</span><div className="w-2 h-4 bg-zinc-400 dark:bg-zinc-600"/></div>
                    </div>
                </div>
            </motion.div>
        </Link>
    )
}

// ============================================================================
// 4. TASKS: UNIFIED COMMAND DECK
// ============================================================================
function UnifiedTaskDeck({ data }: { data: Task[] }) {
    const timeLocked = data.filter((t) => t.taskType === 'fixed');
    const flexible = data.filter((t) => t.taskType === 'flexible');
    const [cardIndex, setCardIndex] = useState(0);
    const activeTask = timeLocked[cardIndex];

    const handleNext = () => { if (timeLocked.length > 0) setCardIndex((prev) => (prev + 1) % timeLocked.length); };
    const handlePrev = () => { if (timeLocked.length > 0) setCardIndex((prev) => (prev - 1 + timeLocked.length) % timeLocked.length); };
    
    const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => { 
        if (info.offset.x < -50) handleNext(); 
        else if (info.offset.x > 50) handlePrev(); 
    };

    return (
        <Link href="/tasks" className="block h-full group">
            <div className="h-full bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden flex flex-col md:flex-row relative">
                
                {/* 1. LEFT: Fixed Schedule (CLEAN SWIPE) */}
                <div className="w-full md:w-1/2 p-6 flex flex-col border-b md:border-b-0 md:border-r border-zinc-100 dark:border-zinc-800">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="text-[10px] font-black uppercase text-zinc-400 tracking-widest flex items-center gap-2"><Clock size={12} className="text-indigo-500"/> Schedule</h4>
                        {timeLocked.length > 1 && (
                            <div className="flex gap-1">
                                <button onClick={(e) => {e.preventDefault(); handlePrev()}} className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded text-zinc-400"><ChevronLeft size={14}/></button>
                                <button onClick={(e) => {e.preventDefault(); handleNext()}} className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded text-zinc-400"><ChevronRight size={14}/></button>
                            </div>
                        )}
                    </div>
                    
                    <div className="relative flex-1 w-full" style={{ minHeight: '200px' }}>
                        <AnimatePresence mode="wait">
                            {activeTask ? (
                                <motion.div 
                                    key={activeTask.id}
                                    drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.2} onDragEnd={handleDragEnd} whileTap={{ cursor: "grabbing" }}
                                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                    className="absolute inset-0 z-20 h-full bg-white dark:bg-zinc-800 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-700 shadow-lg cursor-grab flex flex-col justify-between hover:border-indigo-500/30 transition-colors"
                                >
                                    <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-indigo-500 to-purple-500" style={{ background: 'linear-gradient(to bottom, #6366f1, #a855f7)' }} />
                                    <div>
                                        <div className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-900/20 px-3 py-1 rounded-lg w-fit mb-3 border border-indigo-100 dark:border-indigo-900/30">@{activeTask.startTime || "Today"}</div>
                                        <h3 className="text-xl font-bold text-zinc-900 dark:text-white leading-tight line-clamp-3">{activeTask.title}</h3>
                                    </div>
                                    <div className="flex justify-between items-center text-xs font-bold text-zinc-400 uppercase tracking-widest mt-2 border-t border-zinc-100 dark:border-zinc-800 pt-4">
                                        <div className="flex items-center gap-2 text-emerald-500"><CheckCircle2 size={14}/> Active</div>
                                        <div>{cardIndex + 1} / {timeLocked.length}</div>
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
                                    <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest">Free Time</p>
                                </div>
                            )}
                        </AnimatePresence>
                        {timeLocked.length > 1 && <div className="absolute top-3 left-3 right-[-6px] bottom-[-6px] bg-zinc-100 dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 -z-10" />}
                    </div>
                </div>

                {/* 2. RIGHT: Flexible Notes (Notepad) */}
                <div className="w-full md:w-1/2 p-6 bg-[#FEFCE8] dark:bg-[#1C1C1E] relative flex flex-col">
                    <div className="absolute top-0 left-6 w-12 h-3 bg-yellow-400/20 dark:bg-zinc-800 backdrop-blur-sm rounded-b-lg border-x border-b border-yellow-400/30 dark:border-zinc-700" />
                    <h4 className="text-[10px] font-black uppercase text-yellow-700 dark:text-zinc-500 tracking-widest mb-4 mt-2 flex items-center gap-2"><List size={12}/> Notes</h4>
                    <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar">
                        {flexible.length > 0 ? flexible.slice(0, 5).map((t: any, i: number) => (
                            <div key={i} className="flex gap-3 items-start group/item">
                                <div className="mt-1.5 w-4 h-4 border-2 border-yellow-600/30 dark:border-zinc-500 rounded-md group-hover/item:bg-yellow-500/50 transition-colors shrink-0 cursor-pointer"/>
                                <p className="text-sm font-medium text-yellow-900 dark:text-zinc-300 leading-snug line-clamp-2 decoration-yellow-700/30 group-hover/item:line-through transition-all cursor-default">{t.title}</p>
                            </div>
                        )) : <p className="text-yellow-800/50 dark:text-zinc-500/50 text-sm italic text-center mt-10">{"Nothing pending."}</p>}
                    </div>
                    <div className="absolute bottom-4 right-6 text-[9px] font-black text-yellow-800/20 dark:text-zinc-700 uppercase tracking-widest">NEXUS PAD</div>
                </div>

            </div>
        </Link>
    )
}

// ============================================================================
// 5. COMPONENT: CINEMA TICKET (REAL CENTERED CUTOUT)
// ============================================================================
function CinemaTicketReal({ data }: { data: EntertainmentItem | null }) {
    return (
        <Link href="/entertainment" className="block w-full max-w-3xl group mx-auto">
            <motion.div whileHover={{ scale: 1.02 }} className="relative filter drop-shadow-2xl">
                <div className="flex h-48 w-full">
                    <div className="flex-1 bg-[#EBEBEB] dark:bg-[#121212] relative rounded-l-3xl overflow-hidden flex border border-zinc-200 dark:border-zinc-800 border-r-0">
                        <div className="w-32 h-full relative shrink-0">
                            {data?.image ? <img src={data.image} alt="poster" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"/> : <div className="w-full h-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center"><Play size={24} className="text-zinc-400"/></div>}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#EBEBEB] dark:to-[#121212]" style={{ background: 'linear-gradient(to right, transparent, var(--tw-gradient-to))' }}/>
                        </div>
                        <div className="flex-1 p-6 flex flex-col justify-between relative z-10 border-l border-zinc-300/50 dark:border-zinc-800">
                            <div>
                                <div className="flex items-center gap-2 mb-2"><span className="bg-rose-600 text-white text-[9px] font-black px-2 py-0.5 rounded shadow-sm shadow-rose-500/30">ADMIT ONE</span><span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">{data ? "Now Playing" : "Idle"}</span></div>
                                <h3 className="text-2xl md:text-3xl font-black text-zinc-900 dark:text-white leading-none line-clamp-2 uppercase tracking-tighter">{data?.title || "No Media Active"}</h3>
                            </div>
                            {data && <div className="flex items-center gap-4 text-xs font-mono text-zinc-600 dark:text-zinc-400 border-t border-zinc-300 dark:border-zinc-800 pt-3 mt-2"><span className="font-bold">{data.type.toUpperCase()}</span><span>•</span><span>{data.genre.split(',')[0]}</span><span>•</span><span>RESUME</span></div>}
                        </div>
                        <div className="absolute right-0 top-0 bottom-0 w-4 translate-x-[50%] z-30 flex flex-col justify-between py-2" style={{ right: '-6px' }}>{[...Array(8)].map((_, i) => <div key={i} className="w-3 h-3 rounded-full bg-[#F0F2F5] dark:bg-[#050505] shadow-inner"></div>)}</div>
                    </div>
                    <div className="w-24 bg-[#EBEBEB] dark:bg-[#121212] rounded-r-3xl border-y border-r border-zinc-300 dark:border-zinc-800 border-l-0 flex flex-col items-center justify-center relative">
                        <div className="h-full border-l-2 border-dashed border-zinc-400/30 dark:border-zinc-700 w-full flex flex-col items-center justify-center gap-4"><Barcode className="text-zinc-400 rotate-90 h-16 w-8 opacity-60"/><div className="p-3 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-full shadow-lg group-hover:scale-110 transition-transform z-10"><Play size={14} fill="currentColor"/></div></div>
                    </div>
                </div>
            </motion.div>
        </Link>
    )
}