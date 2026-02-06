// "use client";

// import React, { useState, useEffect, useCallback } from "react";
// import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
// import {
//   Play, Pause, Plus, Star, Tv, Film, BookOpen, 
//   Edit2, Trash2, X, Sparkles, Loader2, Filter, 
//   CheckCircle2, Clock, Search, ChevronDown, MonitorPlay, 
//   Archive, Folder, ArrowRight, ArrowLeft, Clapperboard, Video, Popcorn, Maximize2
// } from "lucide-react";
// import { clsx, type ClassValue } from "clsx";
// import { twMerge } from "tailwind-merge";

// // --- ACTIONS ---
// import { getLibrary, upsertContent, deleteContent, generateRecommendations } from "@/lib/actions/entertainment";

// // --- UTILS ---
// function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

// // ============================================================================
// // 1. DATA & CONFIG
// // ============================================================================

// interface ContentItem {
//     id?: string;
//     title: string;
//     type: string;
//     genre: string;
//     platform: string;
//     status: string;
//     currentSeason: number;
//     currentEpisode: number;
//     totalEpisodes?: number;
//     rating: number; 
//     notes: string;
//     image?: string;
//     updatedAt?: string;
// }

// const GENRE_LIST = [
//   "Action", "Adventure", "Animation", "Anthology", "Biopic", "Comedy", "Crime", 
//   "Cyberpunk", "Coming-of-Age", "Documentary", "Drama", "Dystopian", "Ecchi", 
//   "Family", "Fantasy", "Film-Noir", "Heist", "Historical", "Horror", "Isekai", 
//   "Josei", "Legal", "Martial Arts", "Mecha", "Medical", "Military", "Musical", 
//   "Mystery", "Mythology", "Parody", "Political", "Post-Apocalyptic", "Psychological", 
//   "Reality TV", "Romance", "Samurai", "Satire", "Sci-Fi", "Seinen", "Shojo", 
//   "Shonen", "Slice of Life", "Space-Opera", "Sports", "Spy", "Supernatural", 
//   "Superhero", "Suspense", "Thriller", "War", "Western", "Zombie"
// ];

// const GENRE_ASSETS: Record<string, string> = {
//     "Sci-Fi": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072",
//     "Action": "https://images.unsplash.com/photo-1552072092-7f9b8d63efcb?q=80&w=2070",
//     "Horror": "https://images.unsplash.com/photo-1505635552518-3448ff116af3?q=80&w=1931",
//     "Romance": "https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?q=80&w=1986",
//     "Anime": "https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1936",
//     "Cyberpunk": "https://images.unsplash.com/photo-1515630278258-407f66498911?q=80&w=1998",
//     "Fantasy": "https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?q=80&w=1974",
//     "Default": "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2070"
// };

// interface ThemeConfig {
//     label: string;
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     icon: any;
//     color: string;
//     bg: string;
// }

// const TYPE_CONFIG: Record<string, ThemeConfig> = {
//     movie: { label: "Movie", icon: Film, color: "text-purple-500", bg: "bg-purple-500/20" },
//     series: { label: "Series", icon: Tv, color: "text-blue-500", bg: "bg-blue-500/20" },
//     anime: { label: "Anime", icon: Sparkles, color: "text-pink-500", bg: "bg-pink-500/20" },
//     documentary: { label: "Docu", icon: BookOpen, color: "text-emerald-500", bg: "bg-emerald-500/20" }
// };

// // ============================================================================
// // 2. MAIN COMPONENT
// // ============================================================================

// export default function EntertainmentFinal() {
//   const [library, setLibrary] = useState<ContentItem[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [activeTab, setActiveTab] = useState("manager"); 
  
//   const [showModal, setShowModal] = useState(false);
//   const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  
//   // States for Folders & Focus
//   const [openFolder, setOpenFolder] = useState<'towatch' | 'onhold' | null>(null);
//   const [focusedItem, setFocusedItem] = useState<ContentItem | null>(null);

//   const fetchData = useCallback(async () => {
//     try {
//         // eslint-disable-next-line @typescript-eslint/no-explicit-any
//         const res: any = await getLibrary();
//         setLibrary(res || []);
//     } finally {
//         setLoading(false);
//     }
//   }, []);

//   useEffect(() => { fetchData(); }, [fetchData]);

//   const handleSave = async (data: ContentItem) => {
//       const optimisticItem = { 
//           ...data, 
//           id: data.id || `temp-${Math.random().toString(36).substr(2, 9)}`,
//           updatedAt: new Date().toISOString()
//       };

//       if (data.id) {
//           setLibrary(prev => prev.map(item => item.id === data.id ? { ...item, ...data } : item));
//       } else {
//           setLibrary(prev => [optimisticItem, ...prev]);
//       }
      
//       await upsertContent(data);
//       setShowModal(false);
//       setEditingItem(null);
//       fetchData(); 
//   };

//   const handleDelete = async (id: string) => {
//       if(confirm("Archive this entry forever?")) {
//           setLibrary(prev => prev.filter(item => item.id !== id));
//           await deleteContent(id);
//           fetchData();
//           if (focusedItem?.id === id) setFocusedItem(null);
//       }
//   };

//   const handleQuickStatus = async (item: ContentItem, newStatus: string) => {
//       const updatedItem = { ...item, status: newStatus };
//       setLibrary(prev => prev.map(i => i.id === item.id ? updatedItem : i));
//       if (focusedItem?.id === item.id) setFocusedItem(updatedItem);
//       await upsertContent(updatedItem);
//   };

//   const handleTogglePeak = async (item: ContentItem) => {
//       const newRating = item.rating === 5 ? 0 : 5; 
//       const updatedItem = { ...item, rating: newRating };
//       setLibrary(prev => prev.map(i => i.id === item.id ? updatedItem : i));
//       if (focusedItem?.id === item.id) setFocusedItem(updatedItem);
//       await upsertContent(updatedItem);
//   };

//   return (
//     <div className="min-h-screen bg-zinc-50 dark:bg-[#020202] text-zinc-900 dark:text-zinc-100 font-sans relative overflow-x-hidden transition-colors duration-500">
      
//       {/* 1. BACKGROUND */}
//       <div className="fixed inset-0 pointer-events-none z-0">
//           <div className="absolute top-[-20%] right-[-10%] w-[80vw] h-[80vh] bg-purple-500/5 dark:bg-purple-900/20 rounded-full blur-[150px]" />
//           <div className="absolute bottom-[-20%] left-[-10%] w-[60vw] h-[60vh] bg-blue-500/5 dark:bg-blue-900/20 rounded-full blur-[150px]" />
//           <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 dark:opacity-30 mix-blend-overlay" />
//       </div>

//       <div className="relative z-10 max-w-[1600px] mx-auto p-6 md:p-10 space-y-10 pb-32">
        
//         {/* 2. HEADER (Fixed Theme Colors) */}
//         <header className="flex flex-col md:flex-row justify-between items-end gap-6 pt-4 border-b border-zinc-200 dark:border-white/5 pb-6">
//             <div className="space-y-2">
//                 <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.3em] text-purple-600 dark:text-purple-400">
//                     <MonitorPlay size={14} /> Entertainment OS
//                 </div>
                
//                 {/* HEADLINE: Native Tailwind classes for instant theme switch */}
//                 <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tight leading-none cursor-default">
//                     <span className="text-zinc-900 dark:text-white transition-colors duration-200">WATCH</span>
//                     <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400">LIST</span>
//                 </h1>
//             </div>

//             <div className="flex items-center gap-4">
//                 <div className="flex p-1 bg-zinc-100 dark:bg-zinc-900 rounded-full border border-zinc-200 dark:border-zinc-800">
//                     {['manager', 'directory', 'ai'].map(tab => (
//                         <button 
//                             key={tab}
//                             onClick={() => setActiveTab(tab)}
//                             className={cn(
//                                 "px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all relative overflow-hidden",
//                                 activeTab === tab ? "text-white shadow-md bg-black dark:bg-zinc-800" : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
//                             )}
//                         >
//                             {tab === 'manager' ? "Active" : tab === 'directory' ? "Archive" : "AI Gen"}
//                         </button>
//                     ))}
//                 </div>

//                 <AnimatePresence mode="wait">
//                     {activeTab !== 'ai' && (
//                         <motion.button 
//                             key={activeTab === 'directory' ? 'archive-btn' : 'add-btn'}
//                             initial={{ scale: 0, opacity: 0 }}
//                             animate={{ scale: 1, opacity: 1 }}
//                             exit={{ scale: 0, opacity: 0 }}
//                             whileHover={{ scale: 1.05 }} 
//                             whileTap={{ scale: 0.95 }}
//                             onClick={() => { setEditingItem(null); setShowModal(true); }} 
//                             className={cn(
//                                 "flex items-center justify-center w-12 h-12 text-white rounded-2xl shadow-lg transition-all",
//                                 activeTab === 'directory' 
//                                     ? "bg-zinc-800 hover:bg-zinc-700" 
//                                     : "bg-black dark:bg-white dark:text-black hover:shadow-purple-500/20"
//                             )}
//                         >
//                             {activeTab === 'directory' ? <Archive size={20} /> : <Plus size={24} />}
//                         </motion.button>
//                     )}
//                 </AnimatePresence>
//             </div>
//         </header>

//         {/* 3. CONTENT AREA */}
//         <AnimatePresence mode="wait">
//             {loading ? (
//                 <div className="flex justify-center py-40"><Loader2 className="animate-spin text-purple-500" size={40}/></div>
//             ) : activeTab === 'manager' ? (
//                 <WatchManagerView 
//                     library={library} 
//                     onEdit={(item) => { setEditingItem(item); setShowModal(true); }} 
//                     onQuickStatus={handleQuickStatus}
//                     onTogglePeak={handleTogglePeak}
//                     onOpenFolder={setOpenFolder}
//                 />
//             ) : activeTab === 'directory' ? (
//                 <DirectoryView 
//                     library={library} 
//                     onEdit={(item) => { setEditingItem(item); setShowModal(true); }} 
//                     onDelete={handleDelete} 
//                     onTogglePeak={handleTogglePeak}
//                     onFocus={setFocusedItem}
//                 />
//             ) : (
//                 <AIDiscoveryView />
//             )}
//         </AnimatePresence>

//       </div>

//       {/* OVERLAYS (FOLDERS) */}
//       <AnimatePresence>
//           {openFolder === 'towatch' && (
//               <ToWatchOverlay 
//                   items={library.filter(i => i.status === 'to_watch')} 
//                   onClose={() => setOpenFolder(null)}
//                   onEdit={(item) => { setEditingItem(item); setShowModal(true); }}
//                   onQuickStatus={handleQuickStatus}
//               />
//           )}
//           {openFolder === 'onhold' && (
//               <OnHoldOverlay 
//                   items={library.filter(i => i.status === 'on_hold')}
//                   onClose={() => setOpenFolder(null)}
//                   onEdit={(item) => { setEditingItem(item); setShowModal(true); }}
//                   onQuickStatus={handleQuickStatus}
//               />
//           )}
          
//           {/* FOCUS MODE (Detail View) */}
//           {focusedItem && (
//               <FocusOverlay 
//                   item={focusedItem} 
//                   onClose={() => setFocusedItem(null)}
//                   onEdit={() => { setEditingItem(focusedItem); setFocusedItem(null); setShowModal(true); }}
//                   onDelete={() => handleDelete(focusedItem.id!)}
//                   onTogglePeak={() => handleTogglePeak(focusedItem)}
//               />
//           )}
//       </AnimatePresence>

//       {/* MODAL */}
//       <AnimatePresence>
//           {showModal && <ContentModal onClose={() => setShowModal(false)} onSave={handleSave} initialData={editingItem} />}
//       </AnimatePresence>

//     </div>
//   );
// }

// // ============================================================================
// // VIEW 1: WATCH MANAGER (With Folders)
// // ============================================================================
// function WatchManagerView({ library, onEdit, onQuickStatus, onTogglePeak, onOpenFolder }: { library: ContentItem[], onEdit: any, onQuickStatus: any, onTogglePeak: any, onOpenFolder: any }) {
//     const watching = library.filter(i => i.status === 'watching');
//     const onHoldCount = library.filter(i => i.status === 'on_hold').length;
//     const toWatchCount = library.filter(i => i.status === 'to_watch').length;

//     return (
//         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-12">
            
//             <section>
//                 <div className="flex items-center gap-4 mb-6">
//                     <div className="p-2 bg-green-500/10 rounded-lg"><Play size={20} className="text-green-500 fill-current"/></div>
//                     <h3 className="text-xl font-black uppercase text-zinc-800 dark:text-white tracking-wide">Now Playing</h3>
//                 </div>

//                 <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
//                     {watching.length > 0 ? watching.map(item => (
//                         <PosterCard key={item.id} item={item} onEdit={onEdit} onQuickStatus={onQuickStatus} onTogglePeak={onTogglePeak} />
//                     )) : (
//                         <div className="col-span-full h-64 border-2 border-dashed border-zinc-300 dark:border-zinc-800 rounded-[2rem] flex flex-col items-center justify-center text-zinc-400 bg-white/50 dark:bg-zinc-900/20">
//                             <Film size={40} className="mb-2 opacity-50"/>
//                             <p className="font-bold uppercase tracking-widest text-sm">No Active Content</p>
//                         </div>
//                     )}
//                 </div>
//             </section>

//             <section>
//                 <div className="flex items-center gap-4 mb-6">
//                     <div className="p-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg"><Folder size={20} className="text-zinc-600 dark:text-zinc-400 fill-current"/></div>
//                     <h3 className="text-xl font-black uppercase text-zinc-800 dark:text-white tracking-wide">Shelves</h3>
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//                     <FolderCard title="To Watch" count={toWatchCount} color="bg-blue-500" onClick={() => onOpenFolder('towatch')} icon={<Clock size={32} className="text-white"/>} />
//                     <FolderCard title="On Hold" count={onHoldCount} color="bg-orange-500" onClick={() => onOpenFolder('onhold')} icon={<Pause size={32} className="text-white fill-current"/>} />
//                 </div>
//             </section>
//         </motion.div>
//     )
// }

// function FolderCard({ title, count, color, onClick, icon }: { title: string, count: number, color: string, onClick: () => void, icon: React.ReactNode }) {
//     return (
//         <motion.div whileHover={{ scale: 1.02, y: -5 }} onClick={onClick} className="group relative h-48 rounded-[2rem] cursor-pointer overflow-hidden shadow-xl">
//             <div className={cn("absolute inset-0 opacity-90", color)} />
//             <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
//             <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-40 transition-opacity transform group-hover:scale-110 duration-500"><Folder size={120} /></div>
//             <div className="absolute inset-0 p-8 flex flex-col justify-between z-10 text-white">
//                 <div className="flex justify-between items-start"><div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">{icon}</div><span className="text-4xl font-black opacity-80">{count}</span></div>
//                 <div><h3 className="text-2xl font-black uppercase tracking-wider">{title}</h3><p className="text-white/60 text-xs font-bold uppercase tracking-widest mt-1">Tap to Open</p></div>
//             </div>
//         </motion.div>
//     )
// }

// function PosterCard({ item, onEdit, onQuickStatus, onTogglePeak }: { item: ContentItem, onEdit: (i: ContentItem) => void, onQuickStatus: (i: ContentItem, s: string) => void, onTogglePeak: (i: ContentItem) => void }) {
//     const theme = TYPE_CONFIG[item.type] || TYPE_CONFIG.movie;
//     // eslint-disable-next-line @typescript-eslint/no-unused-vars
//     const progress = item.totalEpisodes ? Math.round((item.currentEpisode / item.totalEpisodes) * 100) : 0;
//     const bgImage = item.image || GENRE_ASSETS[item.genre.split(',')[0].trim()] || GENRE_ASSETS.Default;
//     const isPeak = item.rating === 5;

//     return (
//         <motion.div layoutId={item.id} whileHover={{ y: -5 }} className="group relative h-[450px] w-full bg-zinc-900 rounded-[2rem] overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all">
//             <div className="absolute inset-0">
//                 {/* eslint-disable-next-line @next/next/no-img-element */}
//                 <img src={bgImage} alt={item.title} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" />
//                 <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
//             </div>
            
//             <button onClick={(e) => { e.stopPropagation(); onTogglePeak(item); }} className={cn("absolute top-4 right-4 p-2 bg-black/40 backdrop-blur-md rounded-full hover:bg-yellow-500 text-white transition-all z-20", isPeak ? "opacity-100" : "opacity-0 group-hover:opacity-100")}>
//                 <Star size={16} fill={isPeak ? "currentColor" : "none"} className={isPeak ? "text-yellow-400" : "text-white/70"} />
//             </button>

//             <div className="absolute top-4 right-14 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0 z-20">
//                 <button onClick={() => onQuickStatus(item, 'on_hold')} className="p-2 bg-black/60 backdrop-blur-md rounded-full text-white hover:bg-orange-500 transition-colors" title="Pause / Hold"><Pause size={16} fill="currentColor" /></button>
//                 <button onClick={() => onQuickStatus(item, 'completed')} className="p-2 bg-black/60 backdrop-blur-md rounded-full text-white hover:bg-green-500 transition-colors" title="Finish"><CheckCircle2 size={16} /></button>
//                 <button onClick={() => onEdit(item)} className="p-2 bg-black/60 backdrop-blur-md rounded-full text-white hover:bg-blue-500 transition-colors"><Edit2 size={16} /></button>
//             </div>
            
//             <div className="absolute inset-0 p-8 flex flex-col justify-between z-10 text-white pointer-events-none">
//                 <div className="flex justify-between items-start">
//                     <span className={cn("px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border backdrop-blur-md", theme.color, theme.border, "bg-black/60")}>{theme.label}</span>
//                 </div>
//                 <div>
//                     <h2 className="text-4xl font-black leading-[0.9] mb-2 line-clamp-2 drop-shadow-xl">{item.title}</h2>
//                     <p className="text-xs font-bold text-zinc-300 mb-6 uppercase tracking-wider line-clamp-1">{item.genre}</p>
//                     {(item.type === 'series' || item.type === 'anime') ? (
//                         <div className="flex flex-col gap-1.5">
//                             <div className="flex items-center gap-3 text-[10px] font-black uppercase text-zinc-300 tracking-widest">
//                                 <span>Season {item.currentSeason} : Episode {item.currentEpisode}</span>
//                             </div>
//                         </div>
//                     ) : (
//                         <div className="flex items-center gap-2 text-xs font-bold text-green-400"><div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> Playing Now</div>
//                     )}
//                 </div>
//             </div>
//         </motion.div>
//     )
// }

// // ============================================================================
// // VIEW 2: CONTENT DIRECTORY (Archive)
// // ============================================================================
// function DirectoryView({ library, onEdit, onDelete, onTogglePeak, onFocus }: any) {
//     const [selectedCategory, setSelectedCategory] = useState("all");
//     const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
//     const [peakOnly, setPeakOnly] = useState(false);
//     const [isGenreOpen, setIsGenreOpen] = useState(false);

//     const filtered = library.filter((item: ContentItem) => {
//         const matchesCategory = selectedCategory === "all" || item.type === selectedCategory;
//         const matchesPeak = peakOnly ? item.rating === 5 : true;
//         const itemGenres = item.genre.split(',').map(g => g.trim().toLowerCase());
//         const matchesGenre = selectedGenres.length === 0 || selectedGenres.some(sg => itemGenres.includes(sg.toLowerCase()));
//         return matchesCategory && matchesPeak && matchesGenre;
//     });

//     return (
//         <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
//             <div className="flex flex-col gap-6 mb-8">
//                 <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
//                     {['all', 'movie', 'series', 'anime', 'documentary'].map(type => (
//                         <button 
//                             key={type}
//                             onClick={() => setSelectedCategory(type)}
//                             className={cn(
//                                 "px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all whitespace-nowrap",
//                                 selectedCategory === type 
//                                     ? "bg-zinc-900 dark:bg-white text-white dark:text-black border-transparent shadow-lg" 
//                                     : "text-zinc-500 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 bg-white/50 dark:bg-zinc-900/50"
//                             )}
//                         >
//                             {type}
//                         </button>
//                     ))}
//                 </div>

//                 <div className="flex flex-wrap gap-4 items-center justify-between">
//                     <div className="flex gap-4">
//                         <div className="relative">
//                             <button onClick={() => setIsGenreOpen(!isGenreOpen)} className={cn("flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors border", selectedGenres.length > 0 ? "bg-purple-600 text-white border-purple-600" : "text-zinc-500 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900")}>
//                                 <Filter size={14} /> {selectedGenres.length > 0 ? `${selectedGenres.length} Genres` : "Filter Genre"} <ChevronDown size={14} />
//                             </button>
//                             {isGenreOpen && <GenreSelector selected={selectedGenres} onChange={setSelectedGenres} onClose={() => setIsGenreOpen(false)} />}
//                         </div>
//                         <button onClick={() => setPeakOnly(!peakOnly)} className={cn("flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors border", peakOnly ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/50" : "text-zinc-500 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800")}>
//                             <Star size={14} fill={peakOnly ? "currentColor" : "none"} /> Peak Only
//                         </button>
//                     </div>
//                     <span className="text-xs font-bold text-zinc-400">{filtered.length} Entries</span>
//                 </div>
//             </div>

//             <LayoutGroup>
//                 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
//                     <AnimatePresence>
//                         {filtered.map((item: ContentItem, i: number) => (
//                             <DirectoryCard 
//                                 key={item.id} 
//                                 item={item} 
//                                 index={i} 
//                                 onEdit={onEdit} 
//                                 onDelete={onDelete} 
//                                 onTogglePeak={onTogglePeak}
//                                 onClick={() => onFocus(item)}
//                             />
//                         ))}
//                     </AnimatePresence>
//                 </div>
//             </LayoutGroup>
//         </motion.div>
//     )
// }

// function DirectoryCard({ item, index, onEdit, onDelete, onTogglePeak, onClick }: { item: ContentItem, index: number, onEdit: any, onDelete: any, onTogglePeak: any, onClick: any }) {
//     const theme = TYPE_CONFIG[item.type] || TYPE_CONFIG.movie;
//     const isPeak = item.rating === 5;
//     const bgImage = item.image || GENRE_ASSETS[item.genre.split(',')[0].trim()] || GENRE_ASSETS.Default;
    
//     return (
//         <motion.div 
//             layout
//             initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: index * 0.03 }}
//             onClick={onClick}
//             className={cn(
//                 "group relative aspect-[2/3] bg-zinc-900 rounded-2xl overflow-hidden border transition-all shadow-sm hover:shadow-2xl hover:-translate-y-2 cursor-pointer",
//                 isPeak ? "border-yellow-500/50 shadow-yellow-500/10" : "border-zinc-200 dark:border-zinc-800"
//             )}
//         >
//             <div className="absolute inset-0">
//                 {/* eslint-disable-next-line @next/next/no-img-element */}
//                 <img src={bgImage} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100" />
//                 <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
//             </div>
            
//             <button 
//                 onClick={(e) => { e.stopPropagation(); onTogglePeak(item); }} 
//                 className={cn(
//                     "absolute top-3 right-3 p-1.5 bg-black/40 backdrop-blur-md rounded-full hover:bg-yellow-500 text-white transition-all z-20",
//                     isPeak ? "opacity-100" : "opacity-0 group-hover:opacity-100"
//                 )}
//             >
//                 <Star size={12} fill={isPeak ? "currentColor" : "none"} className={isPeak ? "text-yellow-400" : "text-white/50"} />
//             </button>

//             <div className="absolute top-3 left-3 z-10">
//                 <span className={cn("text-[9px] font-black uppercase px-2 py-1 rounded bg-black/60 backdrop-blur-md text-white border border-white/10 tracking-widest", theme.color)}>
//                     {item.type}
//                 </span>
//             </div>

//             {/* View Details Hover */}
//             <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 z-10">
//                <Maximize2 size={32} className="text-white opacity-80" />
//                <p className="text-white/80 text-[10px] font-black uppercase tracking-widest">View Details</p>
//             </div>

//             <div className="absolute bottom-0 left-0 right-0 p-4 text-white z-10 pointer-events-none">
//                 <h4 className="font-black text-lg leading-tight line-clamp-2 mb-1 drop-shadow-md">{item.title}</h4>
//                 <div className="flex flex-col gap-1">
//                     <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest truncate max-w-[90%]">
//                         {item.genre.split(',')[0]}
//                     </span>
//                     {(item.type === 'series' || item.type === 'anime') && (
//                         <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
//                             S{item.currentSeason} E{item.currentEpisode}
//                         </span>
//                     )}
//                 </div>
//             </div>
//         </motion.div>
//     )
// }

// // ============================================================================
// // VIEW 3: AI DISCOVERY (Fixed Floating Elements)
// // ============================================================================
// function AIDiscoveryView() {
//     const [prompt, setPrompt] = useState("");
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     const [result, setResult] = useState<any>(null);
//     const [thinking, setThinking] = useState(false);

//     const handleAskAI = async () => {
//         if(!prompt) return;
//         setThinking(true);
//         const res = await generateRecommendations(prompt);
//         setResult(res);
//         setThinking(false);
//     };

//     return (
//         <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-[500px] w-full max-w-4xl mx-auto relative group">
            
//             {/* FLOATING ICONS (Always Visible) */}
//             <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
//                 <motion.div animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }} transition={{ duration: 5, repeat: Infinity }} className="absolute top-10 left-10 text-purple-500/20 dark:text-purple-500/30"><Popcorn size={64}/></motion.div>
//                 <motion.div animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }} transition={{ duration: 6, repeat: Infinity, delay: 1 }} className="absolute bottom-20 right-10 text-blue-500/20 dark:text-blue-500/30"><Clapperboard size={80}/></motion.div>
//                 <motion.div animate={{ x: [0, 20, 0] }} transition={{ duration: 7, repeat: Infinity, delay: 2 }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-pink-500/10 dark:text-pink-500/20"><Video size={120}/></motion.div>
//             </div>

//             {/* MAIN CARD */}
//             <div className="absolute inset-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-white/20 dark:border-white/5 rounded-[3rem] shadow-2xl flex flex-col overflow-hidden z-10">
//                 <div className="flex-1 p-8 flex flex-col items-center justify-center relative z-10 overflow-y-auto custom-scrollbar">
//                     {!result && !thinking && (
//                         <div className="text-center space-y-4">
//                             <div className="inline-flex p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full text-white shadow-lg animate-pulse">
//                                 <Sparkles size={32} />
//                             </div>
//                             <h2 className="text-3xl font-black uppercase text-zinc-800 dark:text-white tracking-tight">AI Curator</h2>
//                             <p className="text-zinc-500 font-medium">&quot;I need a dark sci-fi series with time travel...&quot;</p>
//                         </div>
//                     )}

//                     {thinking && (
//                         <div className="flex flex-col items-center gap-4 text-purple-500">
//                             <Loader2 size={40} className="animate-spin" />
//                             <p className="font-mono text-sm uppercase tracking-widest">Analyzing your taste...</p>
//                         </div>
//                     )}

//                     {result && (
//                         <div className="w-full h-full flex flex-col">
//                             <div className="text-left mb-6">
//                                 <p className="text-purple-600 dark:text-purple-400 text-xs font-bold uppercase tracking-widest mb-2">AI Suggestion</p>
//                                 <p className="text-lg text-zinc-700 dark:text-zinc-200 italic leading-relaxed">"{result.intel}"</p>
//                             </div>
//                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
//                                 {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
//                                 {result.data.map((rec: any, i: number) => (
//                                     <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-white dark:bg-black/40 border border-zinc-200 dark:border-white/10 p-4 rounded-2xl flex flex-col justify-between hover:border-purple-500/50 transition-colors shadow-sm">
//                                         <div><span className="text-[10px] text-zinc-400 font-black uppercase tracking-wider">{rec.type}</span><h4 className="font-bold text-zinc-900 dark:text-white leading-tight mt-1">{rec.title}</h4></div>
//                                         <div className="mt-4 flex justify-end"><button className="text-xs font-bold text-purple-500 hover:underline">Add +</button></div>
//                                     </motion.div>
//                                 ))}
//                             </div>
//                         </div>
//                     )}
//                 </div>
//                 <div className="p-4 bg-white/50 dark:bg-black/20 border-t border-zinc-200 dark:border-white/5 backdrop-blur-md">
//                     <div className="relative flex items-center">
//                         <input placeholder="Type your mood..." className="w-full bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-white/10 p-4 pr-32 rounded-2xl font-medium text-zinc-900 dark:text-white outline-none focus:border-purple-500 transition-all placeholder:text-zinc-400" value={prompt} onChange={(e) => setPrompt(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAskAI()} />
//                         <button onClick={handleAskAI} disabled={!prompt || thinking} className="absolute right-2 bg-black dark:bg-white text-white dark:text-black px-6 py-2 rounded-xl font-bold uppercase tracking-wider text-xs hover:scale-105 transition-transform disabled:opacity-50 disabled:scale-100">Generate</button>
//                     </div>
//                 </div>
//             </div>
//         </motion.div>
//     )
// }

// // ============================================================================
// // COMPONENT: FOCUS OVERLAY (Detail View for Archive)
// // ============================================================================
// function FocusOverlay({ item, onClose, onEdit, onDelete, onTogglePeak }: { item: ContentItem, onClose: () => void, onEdit: any, onDelete: any, onTogglePeak: any }) {
//     const bgImage = item.image || GENRE_ASSETS[item.genre.split(',')[0].trim()] || GENRE_ASSETS.Default;
//     const isPeak = item.rating === 5;

//     return (
//         <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-white/80 dark:bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
//             <button onClick={onClose} className="absolute top-8 right-8 p-2 bg-black/10 dark:bg-white/10 rounded-full hover:bg-black/20 dark:hover:bg-white/20 text-zinc-900 dark:text-white transition-all"><X size={32}/></button>
//             <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="relative w-full max-w-4xl bg-white dark:bg-zinc-900 rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row h-[70vh] border border-zinc-200 dark:border-zinc-800">
//                 <div className="w-full md:w-1/2 h-1/2 md:h-full relative">
//                     <img src={bgImage} alt={item.title} className="absolute inset-0 w-full h-full object-cover" />
//                     <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/60 to-transparent" />
//                     <button onClick={(e) => { e.stopPropagation(); onTogglePeak(item); }} className={cn("absolute top-6 left-6 p-3 bg-black/40 backdrop-blur-md rounded-full hover:bg-yellow-500 text-white transition-all z-20", isPeak ? "text-yellow-400" : "text-white/70")}>
//                         <Star size={24} fill={isPeak ? "currentColor" : "none"} />
//                     </button>
//                 </div>
//                 <div className="w-full md:w-1/2 h-1/2 md:h-full p-8 md:p-12 flex flex-col overflow-y-auto">
//                     <div className="mb-auto">
//                         <div className="flex items-center gap-3 mb-4">
//                             <span className="px-3 py-1 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs font-black uppercase tracking-widest border border-purple-200 dark:border-purple-500/20">{item.type}</span>
//                             <span className="px-3 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-xs font-bold uppercase tracking-widest">{item.status.replace('_', ' ')}</span>
//                         </div>
//                         <h2 className="text-4xl md:text-5xl font-black text-zinc-900 dark:text-white leading-[0.9] mb-4">{item.title}</h2>
//                         <p className="text-zinc-500 font-bold uppercase tracking-wider text-sm mb-8">{item.genre}</p>
//                         {(item.type === 'series' || item.type === 'anime') && (
//                             <div className="flex items-center gap-4 text-sm font-bold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 p-4 rounded-xl mb-8">
//                                 <Tv size={20} /><span>Season {item.currentSeason}</span><span className="w-1 h-4 bg-zinc-300 dark:bg-zinc-700"/><span>Episode {item.currentEpisode}</span>
//                             </div>
//                         )}
//                         <div className="bg-zinc-50 dark:bg-black/20 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800">
//                             <p className="text-[10px] font-black uppercase text-zinc-400 mb-2 tracking-widest">Personal Notes</p>
//                             <p className="text-zinc-700 dark:text-zinc-300 italic text-lg leading-relaxed">"{item.notes || "No notes added."}"</p>
//                         </div>
//                     </div>
//                     <div className="flex gap-4 mt-8 pt-8 border-t border-zinc-100 dark:border-zinc-800">
//                         <button onClick={onEdit} className="flex-1 py-4 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white rounded-2xl font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2"><Edit2 size={18}/> Edit</button>
//                         <button onClick={onDelete} className="flex-1 py-4 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/50 rounded-2xl font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2"><Trash2 size={18}/> Archive</button>
//                     </div>
//                 </div>
//             </motion.div>
//         </motion.div>
//     )
// }

// function ToWatchOverlay({ items, onClose, onEdit, onQuickStatus }: { items: ContentItem[], onClose: () => void, onEdit: any, onQuickStatus: any }) {
//     const [index, setIndex] = useState(0);
//     const current = items[index];
//     const next = () => setIndex((i) => (i + 1) % items.length);
//     const prev = () => setIndex((i) => (i - 1 + items.length) % items.length);

//     useEffect(() => {
//         const handleKeyDown = (e: KeyboardEvent) => {
//             if (e.key === 'ArrowRight') next();
//             if (e.key === 'ArrowLeft') prev();
//             if (e.key === 'Escape') onClose();
//         };
//         window.addEventListener('keydown', handleKeyDown);
//         return () => window.removeEventListener('keydown', handleKeyDown);
//     }, [items.length]);

//     if (!current) return <EmptyOverlay onClose={onClose} title="To Watch List Empty" />;
//     const bgImage = current.image || GENRE_ASSETS[current.genre.split(',')[0].trim()] || GENRE_ASSETS.Default;

//     return (
//         <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-4">
//             <button onClick={onClose} className="absolute top-8 right-8 text-white/50 hover:text-white p-2 rounded-full hover:bg-white/10 transition-all"><X size={32}/></button>
//             <h2 className="absolute top-8 left-8 text-2xl font-black uppercase text-white/20 tracking-widest pointer-events-none">To Watch Queue</h2>
//             <div className="flex items-center gap-8 w-full max-w-6xl">
//                 <button onClick={prev} className="hidden md:flex p-4 rounded-full bg-white/5 text-white/50 hover:bg-white/20 hover:text-white transition-all"><ArrowLeft size={32}/></button>
//                 <div className="flex-1 flex justify-center">
//                     <AnimatePresence mode="wait">
//                         <motion.div key={current.id} initial={{ x: 100, opacity: 0, scale: 0.8 }} animate={{ x: 0, opacity: 1, scale: 1 }} exit={{ x: -100, opacity: 0, scale: 0.8 }} transition={{ type: "spring", stiffness: 300, damping: 30 }} className="relative w-full max-w-md aspect-[2/3] bg-zinc-900 rounded-[3rem] overflow-hidden shadow-2xl border border-white/10">
//                             <img src={bgImage} alt={current.title} className="absolute inset-0 w-full h-full object-cover opacity-80" />
//                             <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
//                             <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
//                                 <span className="inline-block px-3 py-1 rounded-lg bg-blue-600 text-[10px] font-black uppercase tracking-widest mb-4">{current.type}</span>
//                                 <h2 className="text-4xl font-black leading-none mb-2">{current.title}</h2>
//                                 <p className="text-zinc-400 font-bold uppercase tracking-wider text-xs mb-6">{current.genre}</p>
//                                 <div className="flex gap-3">
//                                     <button onClick={() => { onQuickStatus(current, 'watching'); onClose(); }} className="flex-1 py-3 bg-white text-black font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-transform flex items-center justify-center gap-2"><Play size={16} fill="currentColor"/> Start</button>
//                                     <button onClick={() => onEdit(current)} className="p-3 bg-white/10 text-white rounded-xl hover:bg-white/20 backdrop-blur-md transition-colors"><Edit2 size={20} /></button>
//                                 </div>
//                             </div>
//                         </motion.div>
//                     </AnimatePresence>
//                 </div>
//                 <button onClick={next} className="hidden md:flex p-4 rounded-full bg-white/5 text-white/50 hover:bg-white/20 hover:text-white transition-all"><ArrowRight size={32}/></button>
//             </div>
//             <div className="absolute bottom-8 text-white/30 font-mono text-sm">{index + 1} / {items.length}</div>
//         </motion.div>
//     )
// }

// function OnHoldOverlay({ items, onClose, onEdit, onQuickStatus }: { items: ContentItem[], onClose: () => void, onEdit: any, onQuickStatus: any }) {
//     return (
//         <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="fixed inset-0 z-50 bg-zinc-950/95 backdrop-blur-xl p-8 overflow-y-auto">
//             <div className="max-w-6xl mx-auto">
//                 <div className="flex justify-between items-center mb-12"><h2 className="text-3xl font-black uppercase text-white flex items-center gap-3"><Pause size={32} className="text-orange-500 fill-current"/> On Hold Shelf</h2><button onClick={onClose} className="p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors"><X size={24}/></button></div>
//                 {items.length === 0 ? <EmptyOverlay onClose={onClose} title="No Content On Hold" /> : (
//                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                         {items.map((item, i) => (
//                             <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="group bg-zinc-900 border border-zinc-800 rounded-3xl p-6 hover:border-orange-500/50 transition-all hover:-translate-y-1 relative">
//                                 <div className="flex justify-between items-start mb-4"><span className="text-[10px] font-black uppercase bg-zinc-800 text-zinc-400 px-3 py-1 rounded-lg">{item.type}</span><div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={() => onQuickStatus(item, 'watching')} className="p-2 bg-green-500/20 text-green-500 rounded-full hover:bg-green-500 hover:text-white transition-colors"><Play size={14} fill="currentColor"/></button><button onClick={() => onEdit(item)} className="p-2 bg-zinc-800 text-zinc-400 rounded-full hover:text-white transition-colors"><Edit2 size={14}/></button></div></div>
//                                 <h3 className="text-2xl font-black text-white leading-none mb-2">{item.title}</h3>
//                                 {item.notes && <p className="text-orange-400/80 text-xs italic mb-4 line-clamp-2">"{item.notes}"</p>}
//                                 <div className="mt-auto pt-4 border-t border-zinc-800 flex justify-between items-center text-xs font-bold text-zinc-500 uppercase tracking-wider"><span>{item.genre.split(',')[0]}</span>{(item.type === 'series' || item.type === 'anime') && <span>S{item.currentSeason} E{item.currentEpisode}</span>}</div>
//                             </motion.div>
//                         ))}
//                     </div>
//                 )}
//             </div>
//         </motion.div>
//     )
// }

// function EmptyOverlay({ onClose, title }: { onClose: () => void, title: string }) {
//     return (
//         <div className="flex flex-col items-center justify-center h-full text-zinc-500"><Archive size={64} className="mb-4 opacity-20"/><h3 className="text-2xl font-black uppercase tracking-widest mb-8">{title}</h3><button onClick={onClose} className="px-6 py-2 border border-zinc-700 rounded-full hover:bg-zinc-800 text-white transition-colors text-xs font-bold uppercase">Close</button></div>
//     )
// }

// function GenreSelector({ selected, onChange, onClose }: { selected: string[], onChange: (g: string[]) => void, onClose: () => void }) {
//     const [search, setSearch] = useState("");
//     const toggleGenre = (genre: string) => { if (selected.includes(genre)) { onChange(selected.filter(g => g !== genre)); } else { onChange([...selected, genre]); } };
//     const filteredGenres = GENRE_LIST.filter(g => g.toLowerCase().includes(search.toLowerCase()));

//     return (
//         <div className="absolute top-full left-0 mt-2 w-full md:w-[400px] bg-white dark:bg-[#0F0F0F] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl z-50 p-4 overflow-hidden">
//             <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-900 p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 mb-3"><Search size={16} className="text-zinc-400"/><input placeholder="Search genres..." className="bg-transparent w-full text-sm font-bold text-zinc-900 dark:text-white outline-none placeholder:text-zinc-500" value={search} onChange={(e) => setSearch(e.target.value)} autoFocus /></div>
//             <div className="h-[200px] overflow-y-auto custom-scrollbar pr-2"><div className="flex flex-wrap gap-2">{filteredGenres.map(genre => (<button key={genre} onClick={() => toggleGenre(genre)} className={cn("px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-all", selected.includes(genre) ? "bg-purple-600 text-white border-purple-600 shadow-lg shadow-purple-500/20" : "bg-zinc-50 dark:bg-zinc-900 text-zinc-500 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600")}>{genre}</button>))}</div></div>
//             <div className="mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-center"><span className="text-xs font-bold text-zinc-400">{selected.length} selected</span><button onClick={onClose} className="text-xs font-black uppercase text-purple-500 hover:underline">Done</button></div>
//         </div>
//     )
// }

// function ContentModal({ onClose, onSave, initialData }: { onClose:()=>void, onSave:(d:ContentItem)=>void, initialData?: ContentItem | null }) {
//     const [form, setForm] = useState<ContentItem>(initialData || { title: '', type: 'movie', genre: '', platform: '', status: 'to_watch', currentSeason: 1, currentEpisode: 0, notes: '', rating: 0, image: '' });
//     const [showGenrePicker, setShowGenrePicker] = useState(false);
//     const selectedGenres = form.genre ? form.genre.split(',').map((g: string) => g.trim()).filter(Boolean) : [];
//     const isSeries = form.type === 'series' || form.type === 'anime';
//     const handleGenreChange = (newGenres: string[]) => { setForm({ ...form, genre: newGenres.join(', ') }); };
//     const handleSearchCover = () => { if (!form.title) return alert("Type a title first!"); const query = `${form.title} ${form.type} poster wallpaper`; window.open(`https://www.google.com/search?tbm=isch&q=${encodeURIComponent(query)}`, '_blank'); };

//     return (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl">
//             <motion.div initial={{scale:0.95, opacity:0}} animate={{scale:1, opacity:1}} className="bg-white dark:bg-[#0A0A0A] w-full max-w-2xl rounded-[2.5rem] p-8 border border-zinc-200 dark:border-white/10 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
//                 <div className="flex justify-between items-center mb-6 shrink-0"><h2 className="text-2xl font-black uppercase text-zinc-900 dark:text-white flex items-center gap-3"><Edit2 size={24} className="text-purple-600 dark:text-purple-500" /> {initialData ? "Update Entry" : "New Entry"}</h2><button onClick={onClose}><X size={24} className="text-zinc-400 hover:text-black dark:hover:text-white transition-colors"/></button></div>
//                 <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar flex-1">
//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                         <div className="md:col-span-2 group"><label className="text-[10px] font-bold uppercase text-zinc-500 mb-1 block tracking-wider">Title</label><input autoFocus placeholder="e.g. Inception" className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl font-black text-zinc-900 dark:text-white outline-none focus:border-purple-500 transition-all text-lg" value={form.title} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, title: e.target.value})} /></div>
//                         <div><label className="text-[10px] font-bold uppercase text-zinc-500 mb-1 block tracking-wider">Type</label><select className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl font-bold text-zinc-900 dark:text-white outline-none appearance-none" value={form.type} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setForm({...form, type: e.target.value})}><option value="movie">Movie</option><option value="series">Series</option><option value="anime">Anime</option><option value="documentary">Docu</option></select></div>
//                     </div>
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         <div className="relative"><label className="text-[10px] font-bold uppercase text-zinc-500 mb-1 block tracking-wider">Genres</label><div onClick={() => setShowGenrePicker(!showGenrePicker)} className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl font-bold text-zinc-900 dark:text-white cursor-pointer flex justify-between items-center hover:border-purple-500 transition-colors"><span className="truncate">{form.genre || "Select Genres..."}</span><ChevronDown size={16} className="text-zinc-500"/></div>{showGenrePicker && <GenreSelector selected={selectedGenres} onChange={handleGenreChange} onClose={() => setShowGenrePicker(false)} />}</div>
//                         <div><label className="text-[10px] font-bold uppercase text-zinc-500 mb-1 block tracking-wider">Platform</label><input placeholder="Netflix, Prime..." className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl font-bold text-zinc-900 dark:text-white outline-none" value={form.platform} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, platform: e.target.value})} /></div>
//                     </div>
//                     <div><label className="text-[10px] font-bold uppercase text-zinc-500 mb-1 block tracking-wider flex justify-between"><span>Poster URL (Optional)</span><button onClick={handleSearchCover} className="text-purple-500 hover:underline flex items-center gap-1"><Search size={10}/> Find on Google</button></label><div className="flex gap-2"><input placeholder="Paste image address here..." className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl font-medium text-zinc-900 dark:text-white outline-none text-sm" value={form.image || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, image: e.target.value})} />{form.image && <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-zinc-700">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={form.image} alt="prev" className="w-full h-full object-cover" /></div>}</div><p className="text-[10px] text-zinc-500 mt-1 italic">*Leave empty for auto-generated cinematic theme.</p></div>
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         <div><label className="text-[10px] font-bold uppercase text-zinc-500 mb-1 block tracking-wider">Status</label><select className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl font-bold text-zinc-900 dark:text-white outline-none appearance-none" value={form.status} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setForm({...form, status: e.target.value})}><option value="to_watch">To Watch</option><option value="watching">Watching</option><option value="on_hold">On Hold</option><option value="completed">Completed</option></select></div>
//                         {isSeries ? (<div className="grid grid-cols-2 gap-2"><div><label className="text-[10px] font-bold uppercase text-zinc-500 mb-1 block">Season(s)</label><input type="number" className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl font-bold text-zinc-900 dark:text-white outline-none" value={form.currentSeason} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, currentSeason: parseInt(e.target.value) || 0})} /></div><div><label className="text-[10px] font-bold uppercase text-zinc-500 mb-1 block">Episode(s)</label><input type="number" className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl font-bold text-zinc-900 dark:text-white outline-none" value={form.currentEpisode} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, currentEpisode: parseInt(e.target.value) || 0})} /></div></div>) : <div />}
//                     </div>
//                     <div><label className="text-[10px] font-bold uppercase text-zinc-500 mb-1 block tracking-wider">Personal Notes</label><textarea placeholder="Why you liked it? Or why you dropped it?" className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl font-medium text-zinc-900 dark:text-white outline-none h-24 resize-none" value={form.notes} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm({...form, notes: e.target.value})} /></div>
//                 </div>
//                 <div className="flex gap-3 mt-6 shrink-0"><button onClick={onClose} className="flex-1 py-4 font-bold text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-2xl transition-colors uppercase tracking-wider">Cancel</button><button onClick={() => onSave(form)} className="flex-1 py-4 bg-black dark:bg-white text-white dark:text-black font-black rounded-2xl hover:scale-[1.02] transition-transform tracking-widest shadow-xl uppercase">Save Entry</button></div>
//             </motion.div>
//         </div>
//     )
// }

// ------------------------------------------------------------------------------------------------------------

// "use client";

// import React, { useState, useEffect, useCallback, useRef } from "react";
// import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
// import {
//   Play, Pause, Plus, Star, Tv, Film, BookOpen, 
//   Edit2, Trash2, X, Sparkles, Loader2, Filter, 
//   CheckCircle2, Clock, Search, ChevronDown, MonitorPlay, 
//   Archive, Folder, ArrowRight, ArrowLeft, Clapperboard, Video, Popcorn, Maximize2, Send, Bot, User, Cpu
// } from "lucide-react";
// import { clsx, type ClassValue } from "clsx";
// import { twMerge } from "tailwind-merge";

// // --- ACTIONS ---
// import { getLibrary, upsertContent, deleteContent, chatWithAI } from "@/lib/actions/entertainment";

// // --- UTILS ---
// function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

// // ============================================================================
// // 1. DATA & CONFIG
// // ============================================================================

// interface ContentItem {
//     id?: string;
//     title: string;
//     type: string;
//     genre: string;
//     platform: string;
//     status: string;
//     currentSeason: number;
//     currentEpisode: number;
//     totalEpisodes?: number;
//     rating: number; 
//     notes: string;
//     image?: string;
//     updatedAt?: string;
// }

// const GENRE_LIST = [
//   "Action", "Adventure", "Animation", "Anthology", "Biopic", "Comedy", "Crime", 
//   "Cyberpunk", "Coming-of-Age", "Documentary", "Drama", "Dystopian", "Ecchi", 
//   "Family", "Fantasy", "Film-Noir", "Heist", "Historical", "Horror", "Isekai", 
//   "Josei", "Legal", "Martial Arts", "Mecha", "Medical", "Military", "Musical", 
//   "Mystery", "Mythology", "Parody", "Political", "Post-Apocalyptic", "Psychological", 
//   "Reality TV", "Romance", "Samurai", "Satire", "Sci-Fi", "Seinen", "Shojo", 
//   "Shonen", "Slice of Life", "Space-Opera", "Sports", "Spy", "Supernatural", 
//   "Superhero", "Suspense", "Thriller", "War", "Western", "Zombie"
// ];

// const GENRE_ASSETS: Record<string, string> = {
//     "Sci-Fi": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072",
//     "Action": "https://images.unsplash.com/photo-1552072092-7f9b8d63efcb?q=80&w=2070",
//     "Horror": "https://images.unsplash.com/photo-1505635552518-3448ff116af3?q=80&w=1931",
//     "Romance": "https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?q=80&w=1986",
//     "Anime": "https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1936",
//     "Cyberpunk": "https://images.unsplash.com/photo-1515630278258-407f66498911?q=80&w=1998",
//     "Fantasy": "https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?q=80&w=1974",
//     "Default": "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2070"
// };

// interface ThemeConfig {
//     label: string;
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     icon: any;
//     color: string;
//     bg: string;
// }

// const TYPE_CONFIG: Record<string, ThemeConfig> = {
//     movie: { label: "Movie", icon: Film, color: "text-purple-500", bg: "bg-purple-500/20" },
//     series: { label: "Series", icon: Tv, color: "text-blue-500", bg: "bg-blue-500/20" },
//     anime: { label: "Anime", icon: Sparkles, color: "text-pink-500", bg: "bg-pink-500/20" },
//     documentary: { label: "Docu", icon: BookOpen, color: "text-emerald-500", bg: "bg-emerald-500/20" }
// };

// // ============================================================================
// // 2. MAIN COMPONENT
// // ============================================================================

// export default function EntertainmentFinal() {
//   const [library, setLibrary] = useState<ContentItem[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [activeTab, setActiveTab] = useState("manager"); 
  
//   const [showModal, setShowModal] = useState(false);
//   const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  
//   const [openFolder, setOpenFolder] = useState<'towatch' | 'onhold' | null>(null);
//   const [focusedItem, setFocusedItem] = useState<ContentItem | null>(null);

//   const fetchData = useCallback(async () => {
//     try {
//         // eslint-disable-next-line @typescript-eslint/no-explicit-any
//         const res: any = await getLibrary();
//         setLibrary(res || []);
//     } finally {
//         setLoading(false);
//     }
//   }, []);

//   useEffect(() => { fetchData(); }, [fetchData]);

//   const handleSave = async (data: ContentItem) => {
//       const optimisticItem = { 
//           ...data, 
//           id: data.id || `temp-${Math.random().toString(36).substr(2, 9)}`,
//           updatedAt: new Date().toISOString()
//       };

//       if (data.id && !data.id.startsWith("temp-")) {
//           setLibrary(prev => prev.map(item => item.id === data.id ? { ...item, ...data } : item));
//       } else {
//           setLibrary(prev => [optimisticItem, ...prev]);
//       }
      
//       await upsertContent(data);
//       setShowModal(false);
//       setEditingItem(null);
//       fetchData(); 
//   };

//   const handleDelete = async (id: string) => {
//       if(confirm("Archive this entry forever?")) {
//           setLibrary(prev => prev.filter(item => item.id !== id));
//           await deleteContent(id);
//           fetchData();
//           if (focusedItem?.id === id) setFocusedItem(null);
//       }
//   };

//   const handleQuickStatus = async (item: ContentItem, newStatus: string) => {
//       const updatedItem = { ...item, status: newStatus };
//       setLibrary(prev => prev.map(i => i.id === item.id ? updatedItem : i));
//       if (focusedItem?.id === item.id) setFocusedItem(updatedItem);
//       await upsertContent(updatedItem);
//   };

//   const handleTogglePeak = async (item: ContentItem) => {
//       const newRating = item.rating === 5 ? 0 : 5; 
//       const updatedItem = { ...item, rating: newRating };
//       setLibrary(prev => prev.map(i => i.id === item.id ? updatedItem : i));
//       if (focusedItem?.id === item.id) setFocusedItem(updatedItem);
//       await upsertContent(updatedItem);
//   };

//   return (
//     <div className="min-h-screen bg-zinc-50 dark:bg-[#020202] text-zinc-900 dark:text-zinc-100 font-sans relative overflow-x-hidden transition-colors duration-500">
      
//       {/* 1. BACKGROUND */}
//       <div className="fixed inset-0 pointer-events-none z-0">
//           <div className="absolute top-[-20%] right-[-10%] w-[80vw] h-[80vh] bg-purple-500/5 dark:bg-purple-900/20 rounded-full blur-[150px]" />
//           <div className="absolute bottom-[-20%] left-[-10%] w-[60vw] h-[60vh] bg-blue-500/5 dark:bg-blue-900/20 rounded-full blur-[150px]" />
//           <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 dark:opacity-30 mix-blend-overlay" />
//       </div>

//       <div className="relative z-10 max-w-[1600px] mx-auto p-6 md:p-10 space-y-10 pb-32">
        
//         {/* 2. HEADER */}
//         <header className="flex flex-col md:flex-row justify-between items-end gap-6 pt-4 border-b border-zinc-200 dark:border-white/5 pb-6">
//             <div className="space-y-2">
//                 <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.3em] text-purple-600 dark:text-purple-400">
//                     <MonitorPlay size={14} /> Entertainment OS
//                 </div>
                
//                 <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tight leading-none cursor-default flex">
//                     <span className="text-zinc-900 dark:text-white transition-colors duration-200 mr-2">WATCH</span>
//                     <div className="flex">
//                         {"LIST".split("").map((char, i) => (
//                             <motion.span
//                                 key={i}
//                                 whileHover={{ y: -10, color: "#a855f7" }}
//                                 transition={{ type: "spring", stiffness: 400, damping: 10 }}
//                                 className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 cursor-pointer inline-block"
//                             >
//                                 {char}
//                             </motion.span>
//                         ))}
//                     </div>
//                 </h1>
//             </div>

//             <div className="flex items-center gap-4">
//                 <div className="flex p-1 bg-zinc-100 dark:bg-zinc-900 rounded-full border border-zinc-200 dark:border-zinc-800">
//                     {['manager', 'directory', 'ai'].map(tab => (
//                         <button 
//                             key={tab}
//                             onClick={() => setActiveTab(tab)}
//                             className={cn(
//                                 "px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all relative overflow-hidden",
//                                 activeTab === tab ? "text-white shadow-md bg-black dark:bg-zinc-800" : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
//                             )}
//                         >
//                             {tab === 'manager' ? "Active" : tab === 'directory' ? "Archive" : "AI Gen"}
//                         </button>
//                     ))}
//                 </div>

//                 <AnimatePresence mode="wait">
//                     {activeTab !== 'ai' && (
//                         <motion.button 
//                             key={activeTab === 'directory' ? 'archive-btn' : 'add-btn'}
//                             initial={{ scale: 0, opacity: 0 }}
//                             animate={{ scale: 1, opacity: 1 }}
//                             exit={{ scale: 0, opacity: 0 }}
//                             whileHover={{ scale: 1.05 }} 
//                             whileTap={{ scale: 0.95 }}
//                             onClick={() => { setEditingItem(null); setShowModal(true); }} 
//                             className={cn(
//                                 "flex items-center justify-center w-12 h-12 text-white rounded-2xl shadow-lg transition-all",
//                                 activeTab === 'directory' 
//                                     ? "bg-zinc-800 hover:bg-zinc-700" 
//                                     : "bg-black dark:bg-white dark:text-black hover:shadow-purple-500/20"
//                             )}
//                         >
//                             {activeTab === 'directory' ? <Archive size={20} /> : <Plus size={24} />}
//                         </motion.button>
//                     )}
//                 </AnimatePresence>
//             </div>
//         </header>

//         {/* 3. CONTENT AREA */}
//         <AnimatePresence mode="wait">
//             {loading ? (
//                 <div className="flex justify-center py-40"><Loader2 className="animate-spin text-purple-500" size={40}/></div>
//             ) : activeTab === 'manager' ? (
//                 <WatchManagerView 
//                     library={library} 
//                     onEdit={(item) => { setEditingItem(item); setShowModal(true); }} 
//                     onQuickStatus={handleQuickStatus}
//                     onTogglePeak={handleTogglePeak}
//                     onOpenFolder={setOpenFolder}
//                 />
//             ) : activeTab === 'directory' ? (
//                 <DirectoryView 
//                     library={library} 
//                     onEdit={(item) => { setEditingItem(item); setShowModal(true); }} 
//                     onDelete={handleDelete} 
//                     onTogglePeak={handleTogglePeak}
//                     onFocus={setFocusedItem}
//                 />
//             ) : (
//                 <AIDiscoveryView onAdd={handleSave} />
//             )}
//         </AnimatePresence>

//       </div>

//       {/* OVERLAYS (FOLDERS & FOCUS) */}
//       <AnimatePresence>
//           {openFolder === 'towatch' && (
//               <ToWatchOverlay 
//                   items={library.filter(i => i.status === 'to_watch')} 
//                   onClose={() => setOpenFolder(null)}
//                   onEdit={(item) => { setEditingItem(item); setShowModal(true); }}
//                   onQuickStatus={handleQuickStatus}
//               />
//           )}
//           {openFolder === 'onhold' && (
//               <OnHoldOverlay 
//                   items={library.filter(i => i.status === 'on_hold')}
//                   onClose={() => setOpenFolder(null)}
//                   onEdit={(item) => { setEditingItem(item); setShowModal(true); }}
//                   onQuickStatus={handleQuickStatus}
//                   onTogglePeak={handleTogglePeak} // Added this
//               />
//           )}
          
//           {/* FOCUS MODE (Detail View) */}
//           {focusedItem && (
//               <FocusOverlay 
//                   item={focusedItem} 
//                   onClose={() => setFocusedItem(null)}
//                   onEdit={() => { setEditingItem(focusedItem); setFocusedItem(null); setShowModal(true); }}
//                   onDelete={() => handleDelete(focusedItem.id!)}
//                   onTogglePeak={() => handleTogglePeak(focusedItem)}
//               />
//           )}
//       </AnimatePresence>

//       {/* MODAL */}
//       <AnimatePresence>
//           {showModal && <ContentModal onClose={() => setShowModal(false)} onSave={handleSave} initialData={editingItem} />}
//       </AnimatePresence>

//     </div>
//   );
// }

// // ============================================================================
// // VIEW 1: WATCH MANAGER (FIXED: HORIZONTAL SCROLL)
// // ============================================================================
// function WatchManagerView({ library, onEdit, onQuickStatus, onTogglePeak, onOpenFolder }: { library: ContentItem[], onEdit: any, onQuickStatus: any, onTogglePeak: any, onOpenFolder: any }) {
//     const watching = library.filter(i => i.status === 'watching');
//     const onHoldCount = library.filter(i => i.status === 'on_hold').length;
//     const toWatchCount = library.filter(i => i.status === 'to_watch').length;

//     return (
//         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-12">
            
//             {/* NOW PLAYING - NETFLIX STYLE HORIZONTAL SCROLL */}
//             <section className="relative">
//                 <div className="flex items-center gap-4 mb-6">
//                     <div className="p-2 bg-green-500/10 rounded-lg"><Play size={20} className="text-green-500 fill-current"/></div>
//                     <h3 className="text-xl font-black uppercase text-zinc-800 dark:text-white tracking-wide">Now Playing</h3>
//                 </div>

//                 {watching.length > 0 ? (
//                     <div className="flex overflow-x-auto gap-6 pb-6 pt-2 px-1 snap-x scrollbar-hide">
//                          {watching.map(item => (
//                             <div key={item.id} className="min-w-[300px] md:min-w-[350px] snap-center">
//                                 <PosterCard item={item} onEdit={onEdit} onQuickStatus={onQuickStatus} onTogglePeak={onTogglePeak} />
//                             </div>
//                         ))}
//                     </div>
//                 ) : (
//                     <div className="w-full h-64 border-2 border-dashed border-zinc-300 dark:border-zinc-800 rounded-[2rem] flex flex-col items-center justify-center text-zinc-400 bg-white/50 dark:bg-zinc-900/20">
//                         <Film size={40} className="mb-2 opacity-50"/>
//                         <p className="font-bold uppercase tracking-widest text-sm">No Active Content</p>
//                     </div>
//                 )}
//             </section>

//             {/* FOLDERS SECTION */}
//             <section>
//                 <div className="flex items-center gap-4 mb-6">
//                     <div className="p-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg"><Folder size={20} className="text-zinc-600 dark:text-zinc-400 fill-current"/></div>
//                     <h3 className="text-xl font-black uppercase text-zinc-800 dark:text-white tracking-wide">Shelves</h3>
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//                     <FolderCard title="To Watch" count={toWatchCount} color="bg-blue-500" onClick={() => onOpenFolder('towatch')} icon={<Clock size={32} className="text-white"/>} />
//                     <FolderCard title="On Hold" count={onHoldCount} color="bg-orange-500" onClick={() => onOpenFolder('onhold')} icon={<Pause size={32} className="text-white fill-current"/>} />
//                 </div>
//             </section>
//         </motion.div>
//     )
// }

// // ... (FolderCard, PosterCard remain same as V36 - Paste below) ...

// function FolderCard({ title, count, color, onClick, icon }: { title: string, count: number, color: string, onClick: () => void, icon: React.ReactNode }) {
//     return (
//         <motion.div whileHover={{ scale: 1.02, y: -5 }} onClick={onClick} className="group relative h-48 rounded-[2rem] cursor-pointer overflow-hidden shadow-xl">
//             <div className={cn("absolute inset-0 opacity-90", color)} />
//             <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
//             <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-40 transition-opacity transform group-hover:scale-110 duration-500"><Folder size={120} /></div>
//             <div className="absolute inset-0 p-8 flex flex-col justify-between z-10 text-white">
//                 <div className="flex justify-between items-start"><div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">{icon}</div><span className="text-4xl font-black opacity-80">{count}</span></div>
//                 <div><h3 className="text-2xl font-black uppercase tracking-wider">{title}</h3><p className="text-white/60 text-xs font-bold uppercase tracking-widest mt-1">Tap to Open</p></div>
//             </div>
//         </motion.div>
//     )
// }

// function PosterCard({ item, onEdit, onQuickStatus, onTogglePeak }: { item: ContentItem, onEdit: (i: ContentItem) => void, onQuickStatus: (i: ContentItem, s: string) => void, onTogglePeak: (i: ContentItem) => void }) {
//     const theme = TYPE_CONFIG[item.type] || TYPE_CONFIG.movie;
//     // eslint-disable-next-line @typescript-eslint/no-unused-vars
//     const progress = item.totalEpisodes ? Math.round((item.currentEpisode / item.totalEpisodes) * 100) : 0;
//     const bgImage = item.image || GENRE_ASSETS[item.genre.split(',')[0].trim()] || GENRE_ASSETS.Default;
//     const isPeak = item.rating === 5;

//     return (
//         <motion.div layoutId={item.id} whileHover={{ y: -5 }} className="group relative h-[450px] w-full bg-zinc-900 rounded-[2rem] overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all">
//             <div className="absolute inset-0">
//                 {/* eslint-disable-next-line @next/next/no-img-element */}
//                 <img src={bgImage} alt={item.title} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" />
//                 <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
//             </div>
            
//             <button onClick={(e) => { e.stopPropagation(); onTogglePeak(item); }} className={cn("absolute top-4 right-4 p-2 bg-black/40 backdrop-blur-md rounded-full hover:bg-yellow-500 text-white transition-all z-20", isPeak ? "opacity-100" : "opacity-0 group-hover:opacity-100")}>
//                 <Star size={16} fill={isPeak ? "currentColor" : "none"} className={isPeak ? "text-yellow-400" : "text-white/70"} />
//             </button>

//             <div className="absolute top-4 right-14 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0 z-20">
//                 <button onClick={() => onQuickStatus(item, 'on_hold')} className="p-2 bg-black/60 backdrop-blur-md rounded-full text-white hover:bg-orange-500 transition-colors" title="Pause / Hold"><Pause size={16} fill="currentColor" /></button>
//                 <button onClick={() => onQuickStatus(item, 'completed')} className="p-2 bg-black/60 backdrop-blur-md rounded-full text-white hover:bg-green-500 transition-colors" title="Finish"><CheckCircle2 size={16} /></button>
//                 <button onClick={() => onEdit(item)} className="p-2 bg-black/60 backdrop-blur-md rounded-full text-white hover:bg-blue-500 transition-colors"><Edit2 size={16} /></button>
//             </div>
            
//             <div className="absolute inset-0 p-8 flex flex-col justify-between z-10 text-white pointer-events-none">
//                 <div className="flex justify-between items-start"><span className={cn("px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border backdrop-blur-md", theme.color, theme.border, "bg-black/60")}>{theme.label}</span></div>
//                 <div>
//                     <h2 className="text-4xl font-black leading-[0.9] mb-2 line-clamp-2 drop-shadow-xl">{item.title}</h2>
//                     <p className="text-xs font-bold text-zinc-300 mb-6 uppercase tracking-wider line-clamp-1">{item.genre}</p>
//                     {(item.type === 'series' || item.type === 'anime') ? (
//                         <div className="flex flex-col gap-1.5"><div className="flex items-center gap-3 text-[10px] font-black uppercase text-zinc-300 tracking-widest"><span>Season {item.currentSeason} : Episode {item.currentEpisode}</span></div></div>
//                     ) : (
//                         <div className="flex items-center gap-2 text-xs font-bold text-green-400"><div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> Playing Now</div>
//                     )}
//                 </div>
//             </div>
//         </motion.div>
//     )
// }

// // ============================================================================
// // VIEW 2: CONTENT DIRECTORY (Archive)
// // ============================================================================
// // ... (Use same DirectoryView, DirectoryCard, GenreSelector as V36 - Paste below) ...

// function DirectoryView({ library, onEdit, onDelete, onTogglePeak, onFocus }: any) {
//     const [selectedCategory, setSelectedCategory] = useState("all");
//     const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
//     const [peakOnly, setPeakOnly] = useState(false);
//     const [isGenreOpen, setIsGenreOpen] = useState(false);

//     const filtered = library.filter((item: ContentItem) => {
//         const matchesCategory = selectedCategory === "all" || item.type === selectedCategory;
//         const matchesPeak = peakOnly ? item.rating === 5 : true;
//         const itemGenres = item.genre.split(',').map(g => g.trim().toLowerCase());
//         const matchesGenre = selectedGenres.length === 0 || selectedGenres.some(sg => itemGenres.includes(sg.toLowerCase()));
//         return matchesCategory && matchesPeak && matchesGenre;
//     });

//     return (
//         <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
//             <div className="flex flex-col gap-6 mb-8">
//                 <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
//                     {['all', 'movie', 'series', 'anime', 'documentary'].map(type => (
//                         <button key={type} onClick={() => setSelectedCategory(type)} className={cn("px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all whitespace-nowrap", selectedCategory === type ? "bg-zinc-900 dark:bg-white text-white dark:text-black border-transparent shadow-lg" : "text-zinc-500 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 bg-white/50 dark:bg-zinc-900/50")}>{type}</button>
//                     ))}
//                 </div>
//                 <div className="flex flex-wrap gap-4 items-center justify-between">
//                     <div className="flex gap-4">
//                         <div className="relative">
//                             <button onClick={() => setIsGenreOpen(!isGenreOpen)} className={cn("flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors border", selectedGenres.length > 0 ? "bg-purple-600 text-white border-purple-600" : "text-zinc-500 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900")}>
//                                 <Filter size={14} /> {selectedGenres.length > 0 ? `${selectedGenres.length} Genres` : "Filter Genre"} <ChevronDown size={14} />
//                             </button>
//                             {isGenreOpen && <GenreSelector selected={selectedGenres} onChange={setSelectedGenres} onClose={() => setIsGenreOpen(false)} />}
//                         </div>
//                         <button onClick={() => setPeakOnly(!peakOnly)} className={cn("flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors border", peakOnly ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/50" : "text-zinc-500 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800")}>
//                             <Star size={14} fill={peakOnly ? "currentColor" : "none"} /> Peak Only
//                         </button>
//                     </div>
//                     <span className="text-xs font-bold text-zinc-400">{filtered.length} Entries</span>
//                 </div>
//             </div>
//             <LayoutGroup>
//                 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
//                     <AnimatePresence>
//                         {filtered.map((item: ContentItem, i: number) => (
//                             <DirectoryCard key={item.id} item={item} index={i} onEdit={onEdit} onDelete={onDelete} onTogglePeak={onTogglePeak} onClick={() => onFocus(item)} />
//                         ))}
//                     </AnimatePresence>
//                 </div>
//             </LayoutGroup>
//         </motion.div>
//     )
// }

// function DirectoryCard({ item, index, onEdit, onDelete, onTogglePeak, onClick }: { item: ContentItem, index: number, onEdit: any, onDelete: any, onTogglePeak: any, onClick: any }) {
//     const theme = TYPE_CONFIG[item.type] || TYPE_CONFIG.movie;
//     const isPeak = item.rating === 5;
//     const bgImage = item.image || GENRE_ASSETS[item.genre.split(',')[0].trim()] || GENRE_ASSETS.Default;
    
//     return (
//         <motion.div layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: index * 0.03 }} onClick={onClick} className={cn("group relative aspect-[2/3] bg-zinc-900 rounded-2xl overflow-hidden border transition-all shadow-sm hover:shadow-2xl hover:-translate-y-2 cursor-pointer", isPeak ? "border-yellow-500/50 shadow-yellow-500/10" : "border-zinc-200 dark:border-zinc-800")}>
//             <div className="absolute inset-0">
//                 {/* eslint-disable-next-line @next/next/no-img-element */}
//                 <img src={bgImage} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100" />
//                 <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
//             </div>
            
//             <button onClick={(e) => { e.stopPropagation(); onTogglePeak(item); }} className={cn("absolute top-3 right-3 p-1.5 bg-black/40 backdrop-blur-md rounded-full hover:bg-yellow-500 text-white transition-all z-20", isPeak ? "opacity-100" : "opacity-0 group-hover:opacity-100")}>
//                 <Star size={12} fill={isPeak ? "currentColor" : "none"} className={isPeak ? "text-yellow-400" : "text-white/50"} />
//             </button>

//             <div className="absolute top-3 left-3 z-10"><span className={cn("text-[9px] font-black uppercase px-2 py-1 rounded bg-black/60 backdrop-blur-md text-white border border-white/10 tracking-widest", theme.color)}>{item.type}</span></div>
//             <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 z-10"><Maximize2 size={32} className="text-white opacity-80" /><p className="text-white/80 text-[10px] font-black uppercase tracking-widest">View Details</p></div>
//             <div className="absolute bottom-0 left-0 right-0 p-4 text-white z-10 pointer-events-none"><h4 className="font-black text-lg leading-tight line-clamp-2 mb-1 drop-shadow-md">{item.title}</h4><div className="flex flex-col gap-1"><span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest truncate max-w-[90%]">{item.genre.split(',')[0]}</span>{(item.type === 'series' || item.type === 'anime') && (<span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">S{item.currentSeason} E{item.currentEpisode}</span>)}</div></div>
//         </motion.div>
//     )
// }

// // ============================================================================
// // VIEW 3: AI DISCOVERY (AGENTIC)
// // ============================================================================
// function AIDiscoveryView({ onAdd }: { onAdd: (item: ContentItem) => void }) {
//     interface Message {
//         id: string;
//         role: 'user' | 'ai';
//         text: string;
//         // eslint-disable-next-line @typescript-eslint/no-explicit-any
//         recommendations?: any[];
//     }

//     const [messages, setMessages] = useState<Message[]>([
//         { id: 'init', role: 'ai', text: "Hello! I am your Entertainment Agent. I can help you discover new content or discuss your favorites. Try: 'Suggest 3 dark sci-fi anime' or 'Explain the ending of Inception'." }
//     ]);
//     const [prompt, setPrompt] = useState("");
//     const [thinking, setThinking] = useState(false);
//     const scrollRef = useRef<HTMLDivElement>(null);

//     // Auto-scroll to bottom
//     useEffect(() => {
//         if(scrollRef.current) {
//             scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
//         }
//     }, [messages, thinking]);

//     const handleSend = async () => {
//         if(!prompt.trim()) return;
        
//         const userMsg: Message = { id: Date.now().toString(), role: 'user', text: prompt };
//         setMessages(prev => [...prev, userMsg]);
//         setPrompt("");
//         setThinking(true);

//         try {
//             const history = messages.map(m => ({ role: m.role, text: m.text }));
//             // eslint-disable-next-line @typescript-eslint/no-explicit-any
//             const res: any = await chatWithAI(history, userMsg.text);
            
//             const aiMsg: Message = { 
//                 id: (Date.now() + 1).toString(), 
//                 role: 'ai', 
//                 text: res.reply || res.intel, 
//                 recommendations: res.data 
//             };
            
//             setMessages(prev => [...prev, aiMsg]);
//         } catch (e) {
//             console.error(e);
//             setMessages(prev => [...prev, { id: Date.now().toString(), role: 'ai', text: "Network error. Please try again." }]);
//         } finally {
//             setThinking(false);
//         }
//     };

//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     const handleAddToWatchlist = (rec: any) => {
//         const newItem: ContentItem = {
//             title: rec.title,
//             type: (rec.type || 'movie').toLowerCase(),
//             genre: rec.genre || 'Unknown',
//             platform: rec.platform || 'Unknown',
//             status: 'to_watch',
//             currentSeason: 1,
//             currentEpisode: 0,
//             rating: 0,
//             notes: `AI Rec: ${rec.reason}`,
//             updatedAt: new Date().toISOString()
//         };
//         onAdd(newItem);
//         alert(`Added "${rec.title}" to To Watch!`);
//     };

//     return (
//         <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-[650px] w-full max-w-4xl mx-auto relative flex flex-col bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-zinc-200 dark:border-white/5 rounded-[3rem] shadow-2xl overflow-hidden">
            
//             {/* Header */}
//             <div className="p-6 border-b border-zinc-100 dark:border-white/5 bg-zinc-50/50 dark:bg-black/20 flex items-center justify-between">
//                 <div className="flex items-center gap-3">
//                     <div className="p-2 bg-purple-500 rounded-lg text-white shadow-lg shadow-purple-500/20"><Bot size={20}/></div>
//                     <div>
//                         <h3 className="font-black uppercase text-sm tracking-wider text-zinc-900 dark:text-white">InnerLoop AI</h3>
//                         <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"/> Online</p>
//                     </div>
//                 </div>
//             </div>

//             {/* Messages Area */}
//             <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar scroll-smooth">
//                 {messages.map((msg) => (
//                     <div key={msg.id} className={cn("flex gap-4 max-w-[85%]", msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto")}>
//                         <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1", msg.role === 'ai' ? "bg-purple-500 text-white" : "bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-white")}>
//                             {msg.role === 'ai' ? <Bot size={16}/> : <User size={16}/>}
//                         </div>
//                         <div className="space-y-4 w-full">
//                             <div className={cn("p-4 rounded-2xl text-sm font-medium leading-relaxed shadow-sm", msg.role === 'ai' ? "bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border border-zinc-100 dark:border-white/5 rounded-tl-none" : "bg-purple-600 text-white rounded-tr-none")}>
//                                 {msg.text}
//                             </div>
                            
//                             {/* Recommendations Grid */}
//                             {msg.recommendations && msg.recommendations.length > 0 && (
//                                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2 pl-2">
//                                     {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
//                                     {msg.recommendations.map((rec: any, i: number) => (
//                                         <motion.div 
//                                             initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
//                                             key={i} 
//                                             className="bg-white dark:bg-black/40 border border-zinc-200 dark:border-white/10 p-4 rounded-xl flex flex-col justify-between hover:border-purple-500/50 transition-colors shadow-sm group"
//                                         >
//                                             <div>
//                                                 <div className="flex justify-between items-start mb-2">
//                                                     <span className="text-[9px] font-black uppercase tracking-widest bg-zinc-100 dark:bg-white/10 px-2 py-0.5 rounded text-zinc-500 dark:text-zinc-400">{rec.type}</span>
//                                                     <span className="text-[9px] font-bold text-zinc-400">{rec.platform}</span>
//                                                 </div>
//                                                 <h4 className="font-bold text-zinc-900 dark:text-white text-sm leading-tight">{rec.title}</h4>
//                                                 <p className="text-[10px] text-zinc-500 mt-1 line-clamp-2">{rec.reason}</p>
//                                             </div>
//                                             <button 
//                                                 onClick={() => handleAddToWatchlist(rec)}
//                                                 className="mt-3 w-full py-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors flex items-center justify-center gap-2 group-active:scale-95"
//                                             >
//                                                 <Plus size={12}/> Add to Watchlist
//                                             </button>
//                                         </motion.div>
//                                     ))}
//                                 </div>
//                             )}
//                         </div>
//                     </div>
//                 ))}
                
//                 {thinking && (
//                     <div className="flex items-center gap-3 text-purple-500 text-xs font-mono ml-12 animate-pulse">
//                         <Loader2 size={16} className="animate-spin" />
//                         <span>Thinking...</span>
//                     </div>
//                 )}
//             </div>

//             {/* Input Area */}
//             <div className="p-4 bg-white dark:bg-black/20 border-t border-zinc-200 dark:border-white/5 backdrop-blur-md">
//                 <div className="relative flex items-center">
//                     <input 
//                         placeholder="Ask for recommendations..." 
//                         className="w-full bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-white/10 p-4 pr-16 rounded-2xl font-medium text-zinc-900 dark:text-white outline-none focus:border-purple-500 transition-all placeholder:text-zinc-400"
//                         value={prompt}
//                         onChange={(e) => setPrompt(e.target.value)}
//                         onKeyDown={(e) => e.key === 'Enter' && handleSend()}
//                     />
//                     <button 
//                         onClick={handleSend}
//                         disabled={!prompt.trim() || thinking}
//                         className="absolute right-2 p-2.5 bg-black dark:bg-white text-white dark:text-black rounded-xl hover:scale-105 transition-transform disabled:opacity-50 disabled:scale-100"
//                     >
//                         <Send size={18} />
//                     </button>
//                 </div>
//             </div>
//         </motion.div>
//     )
// }

// // ============================================================================
// // COMPONENT: OVERLAYS (FIXED ON HOLD & FOCUS)
// // ============================================================================

// function ToWatchOverlay({ items, onClose, onEdit, onQuickStatus }: { items: ContentItem[], onClose: () => void, onEdit: any, onQuickStatus: any }) {
//     // ... (Same as V36 - Keep Logic)
//     const [index, setIndex] = useState(0);
//     const current = items[index];
//     const next = () => setIndex((i) => (i + 1) % items.length);
//     const prev = () => setIndex((i) => (i - 1 + items.length) % items.length);

//     useEffect(() => {
//         const handleKeyDown = (e: KeyboardEvent) => {
//             if (e.key === 'ArrowRight') next();
//             if (e.key === 'ArrowLeft') prev();
//             if (e.key === 'Escape') onClose();
//         };
//         window.addEventListener('keydown', handleKeyDown);
//         return () => window.removeEventListener('keydown', handleKeyDown);
//     }, [items.length]);

//     if (!current) return <EmptyOverlay onClose={onClose} title="To Watch List Empty" />;
//     const bgImage = current.image || GENRE_ASSETS[current.genre.split(',')[0].trim()] || GENRE_ASSETS.Default;

//     return (
//         <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-4">
//             <button onClick={onClose} className="absolute top-8 right-8 text-white/50 hover:text-white p-2 rounded-full hover:bg-white/10 transition-all"><X size={32}/></button>
//             <h2 className="absolute top-8 left-8 text-2xl font-black uppercase text-white/20 tracking-widest pointer-events-none">To Watch Queue</h2>
//             <div className="flex items-center gap-8 w-full max-w-6xl">
//                 <button onClick={prev} className="hidden md:flex p-4 rounded-full bg-white/5 text-white/50 hover:bg-white/20 hover:text-white transition-all"><ArrowLeft size={32}/></button>
//                 <div className="flex-1 flex justify-center">
//                     <AnimatePresence mode="wait">
//                         <motion.div key={current.id} initial={{ x: 100, opacity: 0, scale: 0.8 }} animate={{ x: 0, opacity: 1, scale: 1 }} exit={{ x: -100, opacity: 0, scale: 0.8 }} transition={{ type: "spring", stiffness: 300, damping: 30 }} className="relative w-full max-w-md aspect-[2/3] bg-zinc-900 rounded-[3rem] overflow-hidden shadow-2xl border border-white/10">
//                             <img src={bgImage} alt={current.title} className="absolute inset-0 w-full h-full object-cover opacity-80" />
//                             <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
//                             <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
//                                 <span className="inline-block px-3 py-1 rounded-lg bg-blue-600 text-[10px] font-black uppercase tracking-widest mb-4">{current.type}</span>
//                                 <h2 className="text-4xl font-black leading-none mb-2">{current.title}</h2>
//                                 <p className="text-zinc-400 font-bold uppercase tracking-wider text-xs mb-6">{current.genre}</p>
//                                 <div className="flex gap-3">
//                                     <button onClick={() => { onQuickStatus(current, 'watching'); onClose(); }} className="flex-1 py-3 bg-white text-black font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-transform flex items-center justify-center gap-2"><Play size={16} fill="currentColor"/> Start</button>
//                                     <button onClick={() => onEdit(current)} className="p-3 bg-white/10 text-white rounded-xl hover:bg-white/20 backdrop-blur-md transition-colors"><Edit2 size={20} /></button>
//                                 </div>
//                             </div>
//                         </motion.div>
//                     </AnimatePresence>
//                 </div>
//                 <button onClick={next} className="hidden md:flex p-4 rounded-full bg-white/5 text-white/50 hover:bg-white/20 hover:text-white transition-all"><ArrowRight size={32}/></button>
//             </div>
//             <div className="absolute bottom-8 text-white/30 font-mono text-sm">{index + 1} / {items.length}</div>
//         </motion.div>
//     )
// }

// function OnHoldOverlay({ items, onClose, onEdit, onQuickStatus, onTogglePeak }: { items: ContentItem[], onClose: () => void, onEdit: any, onQuickStatus: any, onTogglePeak: any }) {
//     return (
//         <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="fixed inset-0 z-50 bg-zinc-950/95 backdrop-blur-xl p-8 overflow-y-auto">
//             <div className="max-w-6xl mx-auto">
//                 <div className="flex justify-between items-center mb-12"><h2 className="text-3xl font-black uppercase text-white flex items-center gap-3"><Pause size={32} className="text-orange-500 fill-current"/> On Hold Shelf</h2><button onClick={onClose} className="p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors"><X size={24}/></button></div>
//                 {items.length === 0 ? <EmptyOverlay onClose={onClose} title="No Content On Hold" /> : (
//                     <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//                         {items.map((item, i) => (
//                             <DirectoryCard key={item.id} item={item} index={i} onEdit={onEdit} onDelete={() => {}} onTogglePeak={onTogglePeak} onClick={() => {}} />
//                         ))}
//                     </div>
//                 )}
//             </div>
//         </motion.div>
//     )
// }

// function FocusOverlay({ item, onClose, onEdit, onDelete, onTogglePeak }: { item: ContentItem, onClose: () => void, onEdit: any, onDelete: any, onTogglePeak: any }) {
//     const bgImage = item.image || GENRE_ASSETS[item.genre.split(',')[0].trim()] || GENRE_ASSETS.Default;
//     const isPeak = item.rating === 5;

//     return (
//         <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-white/80 dark:bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
//             <button onClick={onClose} className="absolute top-8 right-8 p-2 bg-black/10 dark:bg-white/10 rounded-full hover:bg-black/20 dark:hover:bg-white/20 text-zinc-900 dark:text-white transition-all"><X size={32}/></button>
//             <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="relative w-full max-w-4xl bg-white dark:bg-zinc-900 rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row h-auto max-h-[85vh] border border-zinc-200 dark:border-zinc-800">
//                 <div className="w-full md:w-1/2 h-64 md:h-auto relative shrink-0">
//                     <img src={bgImage} alt={item.title} className="absolute inset-0 w-full h-full object-cover" />
//                     <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/60 to-transparent" />
//                     <button onClick={(e) => { e.stopPropagation(); onTogglePeak(item); }} className={cn("absolute top-6 left-6 p-3 bg-black/40 backdrop-blur-md rounded-full hover:bg-yellow-500 text-white transition-all z-20", isPeak ? "text-yellow-400" : "text-white/70")}>
//                         <Star size={24} fill={isPeak ? "currentColor" : "none"} />
//                     </button>
//                 </div>
//                 <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col overflow-y-auto">
//                     <div className="mb-auto">
//                         <div className="flex items-center gap-3 mb-4">
//                             <span className="px-3 py-1 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs font-black uppercase tracking-widest border border-purple-200 dark:border-purple-500/20">{item.type}</span>
//                             <span className="px-3 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-xs font-bold uppercase tracking-widest">{item.status.replace('_', ' ')}</span>
//                         </div>
//                         <h2 className="text-3xl md:text-4xl font-black text-zinc-900 dark:text-white leading-[0.9] mb-4">{item.title}</h2>
//                         <p className="text-zinc-500 font-bold uppercase tracking-wider text-sm mb-8">{item.genre}</p>
//                         {(item.type === 'series' || item.type === 'anime') && (
//                             <div className="flex items-center gap-4 text-sm font-bold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 p-4 rounded-xl mb-8">
//                                 <Tv size={20} /><span>Season {item.currentSeason}</span><span className="w-1 h-4 bg-zinc-300 dark:bg-zinc-700"/><span>Episode {item.currentEpisode}</span>
//                             </div>
//                         )}
//                         <div className="bg-zinc-50 dark:bg-black/20 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800">
//                             <p className="text-[10px] font-black uppercase text-zinc-400 mb-2 tracking-widest">Personal Notes</p>
//                             <p className="text-zinc-700 dark:text-zinc-300 italic text-base leading-relaxed">"{item.notes || "No notes added."}"</p>
//                         </div>
//                     </div>
//                     <div className="flex gap-4 mt-8 pt-8 border-t border-zinc-100 dark:border-zinc-800 shrink-0">
//                         <button onClick={onEdit} className="flex-1 py-4 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white rounded-2xl font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2"><Edit2 size={18}/> Edit</button>
//                         <button onClick={onDelete} className="flex-1 py-4 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/50 rounded-2xl font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2"><Trash2 size={18}/> Archive</button>
//                     </div>
//                 </div>
//             </motion.div>
//         </motion.div>
//     )
// }

// function GenreSelector({ selected, onChange, onClose }: { selected: string[], onChange: (g: string[]) => void, onClose: () => void }) {
//     const [search, setSearch] = useState("");
//     const toggleGenre = (genre: string) => { if (selected.includes(genre)) { onChange(selected.filter(g => g !== genre)); } else { onChange([...selected, genre]); } };
//     const filteredGenres = GENRE_LIST.filter(g => g.toLowerCase().includes(search.toLowerCase()));

//     return (
//         <div className="absolute top-full left-0 mt-2 w-full md:w-[400px] bg-white dark:bg-[#0F0F0F] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl z-50 p-4 overflow-hidden">
//             <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-900 p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 mb-3"><Search size={16} className="text-zinc-400"/><input placeholder="Search genres..." className="bg-transparent w-full text-sm font-bold text-zinc-900 dark:text-white outline-none placeholder:text-zinc-500" value={search} onChange={(e) => setSearch(e.target.value)} autoFocus /></div>
//             <div className="h-[200px] overflow-y-auto custom-scrollbar pr-2"><div className="flex flex-wrap gap-2">{filteredGenres.map(genre => (<button key={genre} onClick={() => toggleGenre(genre)} className={cn("px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-all", selected.includes(genre) ? "bg-purple-600 text-white border-purple-600 shadow-lg shadow-purple-500/20" : "bg-zinc-50 dark:bg-zinc-900 text-zinc-500 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600")}>{genre}</button>))}</div></div>
//             <div className="mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-center"><span className="text-xs font-bold text-zinc-400">{selected.length} selected</span><button onClick={onClose} className="text-xs font-black uppercase text-purple-500 hover:underline">Done</button></div>
//         </div>
//     )
// }

// function ContentModal({ onClose, onSave, initialData }: { onClose:()=>void, onSave:(d:ContentItem)=>void, initialData?: ContentItem | null }) {
//     const [form, setForm] = useState<ContentItem>(initialData || { title: '', type: 'movie', genre: '', platform: '', status: 'to_watch', currentSeason: 1, currentEpisode: 0, notes: '', rating: 0, image: '' });
//     const [showGenrePicker, setShowGenrePicker] = useState(false);
//     const selectedGenres = form.genre ? form.genre.split(',').map((g: string) => g.trim()).filter(Boolean) : [];
//     const isSeries = form.type === 'series' || form.type === 'anime';
//     const handleGenreChange = (newGenres: string[]) => { setForm({ ...form, genre: newGenres.join(', ') }); };
//     const handleSearchCover = () => { if (!form.title) return alert("Type a title first!"); const query = `${form.title} ${form.type} poster wallpaper`; window.open(`https://www.google.com/search?tbm=isch&q=${encodeURIComponent(query)}`, '_blank'); };

//     return (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl">
//             <motion.div initial={{scale:0.95, opacity:0}} animate={{scale:1, opacity:1}} className="bg-white dark:bg-[#0A0A0A] w-full max-w-2xl rounded-[2.5rem] p-8 border border-zinc-200 dark:border-white/10 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
//                 <div className="flex justify-between items-center mb-6 shrink-0"><h2 className="text-2xl font-black uppercase text-zinc-900 dark:text-white flex items-center gap-3"><Edit2 size={24} className="text-purple-600 dark:text-purple-500" /> {initialData ? "Update Entry" : "New Entry"}</h2><button onClick={onClose}><X size={24} className="text-zinc-400 hover:text-black dark:hover:text-white transition-colors"/></button></div>
//                 <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar flex-1">
//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                         <div className="md:col-span-2 group"><label className="text-[10px] font-bold uppercase text-zinc-500 mb-1 block tracking-wider">Title</label><input autoFocus placeholder="e.g. Inception" className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl font-black text-zinc-900 dark:text-white outline-none focus:border-purple-500 transition-all text-lg" value={form.title} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, title: e.target.value})} /></div>
//                         <div><label className="text-[10px] font-bold uppercase text-zinc-500 mb-1 block tracking-wider">Type</label><select className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl font-bold text-zinc-900 dark:text-white outline-none appearance-none" value={form.type} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setForm({...form, type: e.target.value})}><option value="movie">Movie</option><option value="series">Series</option><option value="anime">Anime</option><option value="documentary">Docu</option></select></div>
//                     </div>
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         <div className="relative"><label className="text-[10px] font-bold uppercase text-zinc-500 mb-1 block tracking-wider">Genres</label><div onClick={() => setShowGenrePicker(!showGenrePicker)} className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl font-bold text-zinc-900 dark:text-white cursor-pointer flex justify-between items-center hover:border-purple-500 transition-colors"><span className="truncate">{form.genre || "Select Genres..."}</span><ChevronDown size={16} className="text-zinc-500"/></div>{showGenrePicker && <GenreSelector selected={selectedGenres} onChange={handleGenreChange} onClose={() => setShowGenrePicker(false)} />}</div>
//                         <div><label className="text-[10px] font-bold uppercase text-zinc-500 mb-1 block tracking-wider">Platform</label><input placeholder="Netflix, Prime..." className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl font-bold text-zinc-900 dark:text-white outline-none" value={form.platform} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, platform: e.target.value})} /></div>
//                     </div>
//                     <div><label className="text-[10px] font-bold uppercase text-zinc-500 mb-1 block tracking-wider flex justify-between"><span>Poster URL (Optional)</span><button onClick={handleSearchCover} className="text-purple-500 hover:underline flex items-center gap-1"><Search size={10}/> Find on Google</button></label><div className="flex gap-2"><input placeholder="Paste image address here..." className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl font-medium text-zinc-900 dark:text-white outline-none text-sm" value={form.image || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, image: e.target.value})} />{form.image && <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-zinc-700">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={form.image} alt="prev" className="w-full h-full object-cover" /></div>}</div><p className="text-[10px] text-zinc-500 mt-1 italic">*Leave empty for auto-generated cinematic theme.</p></div>
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         <div><label className="text-[10px] font-bold uppercase text-zinc-500 mb-1 block tracking-wider">Status</label><select className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl font-bold text-zinc-900 dark:text-white outline-none appearance-none" value={form.status} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setForm({...form, status: e.target.value})}><option value="to_watch">To Watch</option><option value="watching">Watching</option><option value="on_hold">On Hold</option><option value="completed">Completed</option></select></div>
//                         {isSeries ? (<div className="grid grid-cols-2 gap-2"><div><label className="text-[10px] font-bold uppercase text-zinc-500 mb-1 block">Season(s)</label><input type="number" className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl font-bold text-zinc-900 dark:text-white outline-none" value={form.currentSeason} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, currentSeason: parseInt(e.target.value) || 0})} /></div><div><label className="text-[10px] font-bold uppercase text-zinc-500 mb-1 block">Episode(s)</label><input type="number" className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl font-bold text-zinc-900 dark:text-white outline-none" value={form.currentEpisode} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, currentEpisode: parseInt(e.target.value) || 0})} /></div></div>) : <div />}
//                     </div>
//                     <div><label className="text-[10px] font-bold uppercase text-zinc-500 mb-1 block tracking-wider">Personal Notes</label><textarea placeholder="Why you liked it? Or why you dropped it?" className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl font-medium text-zinc-900 dark:text-white outline-none h-24 resize-none" value={form.notes} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm({...form, notes: e.target.value})} /></div>
//                 </div>
//                 <div className="flex gap-3 mt-6 shrink-0"><button onClick={onClose} className="flex-1 py-4 font-bold text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-2xl transition-colors uppercase tracking-wider">Cancel</button><button onClick={() => onSave(form)} className="flex-1 py-4 bg-black dark:bg-white text-white dark:text-black font-black rounded-2xl hover:scale-[1.02] transition-transform tracking-widest shadow-xl uppercase">Save Entry</button></div>
//             </motion.div>
//         </div>
//     )
// }


//------------------------------------------------------------------------------------------------------
// "use client";

// import React, { useState, useEffect, useCallback, useRef } from "react";
// import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
// import {
//   Play, Pause, Plus, Star, Tv, Film, BookOpen, 
//   Edit2, Trash2, X, Sparkles, Loader2, Filter, 
//   CheckCircle2, Clock, Search, ChevronDown, MonitorPlay, 
//   Archive, Folder, ArrowRight, ArrowLeft, Clapperboard, Video, Popcorn, Maximize2, Send, Bot, User, Cpu
// } from "lucide-react";
// import { clsx, type ClassValue } from "clsx";
// import { twMerge } from "tailwind-merge";

// // --- ACTIONS ---
// import { getLibrary, upsertContent, deleteContent, chatWithAI } from "@/lib/actions/entertainment";

// // --- UTILS ---
// function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

// // ============================================================================
// // 1. DATA & CONFIG
// // ============================================================================

// interface ContentItem {
//     id?: string;
//     title: string;
//     type: string;
//     genre: string;
//     platform: string;
//     status: string;
//     currentSeason: number;
//     currentEpisode: number;
//     totalEpisodes?: number;
//     rating: number; 
//     notes: string;
//     image?: string;
//     updatedAt?: string;
// }

// const GENRE_LIST = [
//   "Action", "Adventure", "Animation", "Anthology", "Biopic", "Comedy", "Crime", 
//   "Cyberpunk", "Coming-of-Age", "Documentary", "Drama", "Dystopian", "Ecchi", 
//   "Family", "Fantasy", "Film-Noir", "Heist", "Historical", "Horror", "Isekai", 
//   "Josei", "Legal", "Martial Arts", "Mecha", "Medical", "Military", "Musical", 
//   "Mystery", "Mythology", "Parody", "Political", "Post-Apocalyptic", "Psychological", 
//   "Reality TV", "Romance", "Samurai", "Satire", "Sci-Fi", "Seinen", "Shojo", 
//   "Shonen", "Slice of Life", "Space-Opera", "Sports", "Spy", "Supernatural", 
//   "Superhero", "Suspense", "Thriller", "War", "Western", "Zombie"
// ];

// const GENRE_ASSETS: Record<string, string> = {
//     "Sci-Fi": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072",
//     "Action": "https://images.unsplash.com/photo-1552072092-7f9b8d63efcb?q=80&w=2070",
//     "Horror": "https://images.unsplash.com/photo-1505635552518-3448ff116af3?q=80&w=1931",
//     "Romance": "https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?q=80&w=1986",
//     "Anime": "https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1936",
//     "Cyberpunk": "https://images.unsplash.com/photo-1515630278258-407f66498911?q=80&w=1998",
//     "Fantasy": "https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?q=80&w=1974",
//     "Default": "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2070"
// };

// interface ThemeConfig {
//     label: string;
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     icon: any;
//     color: string;
//     bg: string;
// }

// const TYPE_CONFIG: Record<string, ThemeConfig> = {
//     movie: { label: "Movie", icon: Film, color: "text-purple-500", bg: "bg-purple-500/20" },
//     series: { label: "Series", icon: Tv, color: "text-blue-500", bg: "bg-blue-500/20" },
//     anime: { label: "Anime", icon: Sparkles, color: "text-pink-500", bg: "bg-pink-500/20" },
//     documentary: { label: "Docu", icon: BookOpen, color: "text-emerald-500", bg: "bg-emerald-500/20" }
// };

// // ============================================================================
// // 2. MAIN COMPONENT
// // ============================================================================

// export default function EntertainmentV42() {
//   const [library, setLibrary] = useState<ContentItem[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [activeTab, setActiveTab] = useState("manager"); 
  
//   const [showModal, setShowModal] = useState(false);
//   const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  
//   const [openFolder, setOpenFolder] = useState<'towatch' | 'onhold' | null>(null);
//   const [focusedItem, setFocusedItem] = useState<ContentItem | null>(null);

//   const fetchData = useCallback(async () => {
//     try {
//         // eslint-disable-next-line @typescript-eslint/no-explicit-any
//         const res: any = await getLibrary();
//         setLibrary(res || []);
//     } finally {
//         setLoading(false);
//     }
//   }, []);

//   useEffect(() => { fetchData(); }, [fetchData]);

//   const handleSave = async (data: ContentItem) => {
//       const optimisticItem = { 
//           ...data, 
//           id: data.id || `temp-${Math.random().toString(36).substr(2, 9)}`,
//           updatedAt: new Date().toISOString()
//       };

//       if (data.id && !data.id.startsWith("temp-")) {
//           setLibrary(prev => prev.map(item => item.id === data.id ? { ...item, ...data } : item));
//       } else {
//           setLibrary(prev => [optimisticItem, ...prev]);
//       }
      
//       await upsertContent(data);
//       setShowModal(false);
//       setEditingItem(null);
//       fetchData(); 
//   };

//   const handleDelete = async (id: string) => {
//       if(confirm("Archive this entry forever?")) {
//           setLibrary(prev => prev.filter(item => item.id !== id));
//           await deleteContent(id);
//           fetchData();
//           if (focusedItem?.id === id) setFocusedItem(null);
//       }
//   };

//   const handleQuickStatus = async (item: ContentItem, newStatus: string) => {
//       const updatedItem = { ...item, status: newStatus };
//       setLibrary(prev => prev.map(i => i.id === item.id ? updatedItem : i));
//       if (focusedItem?.id === item.id) setFocusedItem(updatedItem);
//       await upsertContent(updatedItem);
//   };

//   const handleTogglePeak = async (item: ContentItem) => {
//       const newRating = item.rating === 5 ? 0 : 5; 
//       const updatedItem = { ...item, rating: newRating };
//       setLibrary(prev => prev.map(i => i.id === item.id ? updatedItem : i));
//       if (focusedItem?.id === item.id) setFocusedItem(updatedItem);
//       await upsertContent(updatedItem);
//   };

//   return (
//     <div className="min-h-screen bg-zinc-50 dark:bg-[#020202] text-zinc-900 dark:text-zinc-100 font-sans relative overflow-x-hidden transition-colors duration-500">
      
//       {/* 1. BACKGROUND */}
//       <div className="fixed inset-0 pointer-events-none z-0">
//           <div className="absolute top-[-20%] right-[-10%] w-[80vw] h-[80vh] bg-purple-500/5 dark:bg-purple-900/20 rounded-full blur-[150px]" />
//           <div className="absolute bottom-[-20%] left-[-10%] w-[60vw] h-[60vh] bg-blue-500/5 dark:bg-blue-900/20 rounded-full blur-[150px]" />
//           <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 dark:opacity-30 mix-blend-overlay" />
//       </div>

//       <div className="relative z-10 max-w-[1600px] mx-auto p-6 md:p-10 space-y-10 pb-32">
        
//         {/* 2. HEADER */}
//         <header className="flex flex-col md:flex-row justify-between items-end gap-6 pt-4 border-b border-zinc-200 dark:border-white/5 pb-6">
//             <div className="space-y-2">
//                 <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.3em] text-purple-600 dark:text-purple-400">
//                     <MonitorPlay size={14} /> Entertainment OS
//                 </div>
                
//                 <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tight leading-none cursor-default flex">
//                     <span className="text-zinc-900 dark:text-white transition-colors duration-200 mr-2">WATCH</span>
//                     <div className="flex">
//                         {"LIST".split("").map((char, i) => (
//                             <motion.span
//                                 key={i}
//                                 whileHover={{ y: -10, color: "#a855f7" }}
//                                 transition={{ type: "spring", stiffness: 400, damping: 10 }}
//                                 className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 cursor-pointer inline-block"
//                             >
//                                 {char}
//                             </motion.span>
//                         ))}
//                     </div>
//                 </h1>
//             </div>

//             <div className="flex items-center gap-4">
//                 <div className="flex p-1 bg-zinc-100 dark:bg-zinc-900 rounded-full border border-zinc-200 dark:border-zinc-800">
//                     {['manager', 'directory', 'ai'].map(tab => (
//                         <button 
//                             key={tab}
//                             onClick={() => setActiveTab(tab)}
//                             className={cn(
//                                 "px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all relative overflow-hidden",
//                                 activeTab === tab ? "text-white shadow-md bg-black dark:bg-zinc-800" : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
//                             )}
//                         >
//                             {tab === 'manager' ? "Active" : tab === 'directory' ? "Archive" : "AI Gen"}
//                         </button>
//                     ))}
//                 </div>

//                 <AnimatePresence mode="wait">
//                     {activeTab !== 'ai' && (
//                         <motion.button 
//                             key={activeTab === 'directory' ? 'archive-btn' : 'add-btn'}
//                             initial={{ scale: 0, opacity: 0 }}
//                             animate={{ scale: 1, opacity: 1 }}
//                             exit={{ scale: 0, opacity: 0 }}
//                             whileHover={{ scale: 1.05 }} 
//                             whileTap={{ scale: 0.95 }}
//                             onClick={() => { setEditingItem(null); setShowModal(true); }} 
//                             className={cn(
//                                 "flex items-center justify-center w-12 h-12 text-white rounded-2xl shadow-lg transition-all",
//                                 activeTab === 'directory' 
//                                     ? "bg-zinc-800 hover:bg-zinc-700" 
//                                     : "bg-black dark:bg-white dark:text-black hover:shadow-purple-500/20"
//                             )}
//                         >
//                             {activeTab === 'directory' ? <Archive size={20} /> : <Plus size={24} />}
//                         </motion.button>
//                     )}
//                 </AnimatePresence>
//             </div>
//         </header>

//         {/* 3. CONTENT AREA */}
//         <AnimatePresence mode="wait">
//             {loading ? (
//                 <div className="flex justify-center py-40"><Loader2 className="animate-spin text-purple-500" size={40}/></div>
//             ) : activeTab === 'manager' ? (
//                 <WatchManagerView 
//                     library={library} 
//                     onEdit={(item) => { setEditingItem(item); setShowModal(true); }} 
//                     onQuickStatus={handleQuickStatus}
//                     onTogglePeak={handleTogglePeak}
//                     onOpenFolder={setOpenFolder}
//                 />
//             ) : activeTab === 'directory' ? (
//                 <DirectoryView 
//                     library={library} 
//                     onEdit={(item) => { setEditingItem(item); setShowModal(true); }} 
//                     onDelete={handleDelete} 
//                     onTogglePeak={handleTogglePeak}
//                     onFocus={setFocusedItem}
//                 />
//             ) : (
//                 <AIDiscoveryView onAdd={handleSave} />
//             )}
//         </AnimatePresence>

//       </div>

//       {/* OVERLAYS */}
//       <AnimatePresence>
//           {openFolder === 'towatch' && (
//               <ToWatchOverlay 
//                   items={library.filter(i => i.status === 'to_watch')} 
//                   onClose={() => setOpenFolder(null)}
//                   onEdit={(item) => { setEditingItem(item); setShowModal(true); }}
//                   onQuickStatus={handleQuickStatus}
//               />
//           )}
//           {openFolder === 'onhold' && (
//               <OnHoldOverlay 
//                   items={library.filter(i => i.status === 'on_hold')}
//                   onClose={() => setOpenFolder(null)}
//                   onEdit={(item) => { setEditingItem(item); setShowModal(true); }}
//                   onQuickStatus={handleQuickStatus}
//                   onTogglePeak={handleTogglePeak}
//                   onFocus={setFocusedItem}
//               />
//           )}
          
//           {/* FOCUS MODE (Detail View) */}
//           {focusedItem && (
//               <FocusOverlay 
//                   item={focusedItem} 
//                   onClose={() => setFocusedItem(null)}
//                   onEdit={() => { setEditingItem(focusedItem); setFocusedItem(null); setShowModal(true); }}
//                   onDelete={() => handleDelete(focusedItem.id!)}
//                   onTogglePeak={() => handleTogglePeak(focusedItem)}
//               />
//           )}
//       </AnimatePresence>

//       {/* MODAL */}
//       <AnimatePresence>
//           {showModal && <ContentModal onClose={() => setShowModal(false)} onSave={handleSave} initialData={editingItem} />}
//       </AnimatePresence>

//     </div>
//   );
// }

// // ============================================================================
// // VIEW 3: AI DISCOVERY (FIXED HEIGHT, NO SCROLL)
// // ============================================================================
// function AIDiscoveryView({ onAdd }: { onAdd: (item: ContentItem) => void }) {
//     interface Message {
//         id: string;
//         role: 'user' | 'ai';
//         text: string;
//         // eslint-disable-next-line @typescript-eslint/no-explicit-any
//         recommendations?: any[];
//     }

//     const [messages, setMessages] = useState<Message[]>([
//         { id: 'init', role: 'ai', text: "Hello! I am InnerLoop AI. Ask for movie recommendations or discuss plots." }
//     ]);
//     const [prompt, setPrompt] = useState("");
//     const [thinking, setThinking] = useState(false);
//     const scrollRef = useRef<HTMLDivElement>(null);

//     // Auto-scroll logic
//     useEffect(() => {
//         if(scrollRef.current) {
//             scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
//         }
//     }, [messages, thinking]);

//     const handleSend = async () => {
//         if(!prompt.trim()) return;
        
//         const userMsg: Message = { id: Date.now().toString(), role: 'user', text: prompt };
//         setMessages(prev => [...prev, userMsg]);
//         setPrompt("");
//         setThinking(true);

//         try {
//             const history = messages.map(m => ({ role: m.role, text: m.text }));
//             // eslint-disable-next-line @typescript-eslint/no-explicit-any
//             const res: any = await chatWithAI(history, userMsg.text);
            
//             // Check if response has data (Recommendation Mode)
//             if (res.data && res.data.length > 0) {
//                  const aiMsg: Message = { 
//                     id: (Date.now() + 1).toString(), 
//                     role: 'ai', 
//                     text: res.reply || res.intel, 
//                     recommendations: res.data 
//                 };
//                 setMessages(prev => [...prev, aiMsg]);
//             } else {
//                 // Chat Mode
//                  const aiMsg: Message = { 
//                     id: (Date.now() + 1).toString(), 
//                     role: 'ai', 
//                     text: res.reply || res.intel || "I didn't catch that.",
//                 };
//                 setMessages(prev => [...prev, aiMsg]);
//             }
//         } catch (e) {
//             console.error(e);
//             setMessages(prev => [...prev, { id: Date.now().toString(), role: 'ai', text: "Network error. Please try again." }]);
//         } finally {
//             setThinking(false);
//         }
//     };

//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     const handleAddToWatchlist = (rec: any) => {
//         const newItem: ContentItem = {
//             title: rec.title,
//             type: (rec.type || 'movie').toLowerCase(),
//             genre: rec.genre || 'Unknown',
//             platform: rec.platform || 'Unknown',
//             status: 'to_watch',
//             currentSeason: 1,
//             currentEpisode: 0,
//             rating: 0,
//             notes: `AI Rec: ${rec.reason}`,
//             updatedAt: new Date().toISOString()
//         };
//         onAdd(newItem);
//         alert(`Added "${rec.title}" to To Watch!`);
//     };

//     return (
//         <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-[600px] w-full max-w-4xl mx-auto relative flex flex-col bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-zinc-200 dark:border-white/5 rounded-[3rem] shadow-2xl overflow-hidden">
            
//             {/* FLOATING ICONS */}
//             <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
//                 <motion.div animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }} transition={{ duration: 5, repeat: Infinity }} className="absolute top-10 left-10 text-purple-500/20 dark:text-purple-500/30"><Popcorn size={64}/></motion.div>
//                 <motion.div animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }} transition={{ duration: 6, repeat: Infinity, delay: 1 }} className="absolute bottom-20 right-10 text-blue-500/20 dark:text-blue-500/30"><Clapperboard size={80}/></motion.div>
//                 <motion.div animate={{ x: [0, 20, 0] }} transition={{ duration: 7, repeat: Infinity, delay: 2 }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-pink-500/10 dark:text-pink-500/20"><Video size={120}/></motion.div>
//             </div>

//             {/* Header */}
//             <div className="px-6 py-4 border-b border-zinc-100 dark:border-white/5 bg-zinc-50/50 dark:bg-black/20 flex items-center justify-between z-10">
//                 <div className="flex items-center gap-3">
//                     <div className="p-2 bg-purple-500 rounded-lg text-white shadow-lg shadow-purple-500/20"><Bot size={20}/></div>
//                     <div>
//                         <h3 className="font-bold text-sm text-zinc-900 dark:text-white">InnerLoop AI</h3>
//                         <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"/> Online</p>
//                     </div>
//                 </div>
//                 <button onClick={() => setMessages([])} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full text-zinc-400 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
//             </div>

//             {/* Chat Area */}
//             <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar z-10">
//                 {messages.map((msg) => (
//                     <div key={msg.id} className={cn("flex gap-4 max-w-[85%]", msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto")}>
//                         <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1", msg.role === 'ai' ? "bg-purple-500 text-white" : "bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-white")}>
//                             {msg.role === 'ai' ? <Bot size={16}/> : <User size={16}/>}
//                         </div>
//                         <div className="space-y-3 w-full">
//                             <div className={cn("p-4 rounded-2xl text-sm font-medium leading-relaxed shadow-sm", msg.role === 'ai' ? "bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border border-zinc-100 dark:border-white/5 rounded-tl-none" : "bg-purple-600 text-white rounded-tr-none")}>
//                                 {msg.text}
//                             </div>
                            
//                             {/* Recommendations Grid */}
//                             {msg.recommendations && msg.recommendations.length > 0 && (
//                                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
//                                     {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
//                                     {msg.recommendations.map((rec: any, i: number) => (
//                                         <motion.div 
//                                             initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
//                                             key={i} 
//                                             className="bg-white dark:bg-black/40 border border-zinc-200 dark:border-white/10 p-4 rounded-xl flex flex-col justify-between hover:border-purple-500/50 transition-colors shadow-sm group"
//                                         >
//                                             <div>
//                                                 <div className="flex justify-between items-start mb-2">
//                                                     <span className="text-[9px] font-black uppercase tracking-widest bg-zinc-100 dark:bg-white/10 px-2 py-0.5 rounded text-zinc-500 dark:text-zinc-400">{rec.type}</span>
//                                                     <span className="text-[9px] font-bold text-zinc-400">{rec.platform}</span>
//                                                 </div>
//                                                 <h4 className="font-bold text-zinc-900 dark:text-white text-sm leading-tight">{rec.title}</h4>
//                                                 <p className="text-[10px] text-zinc-500 mt-1 line-clamp-2">{rec.reason}</p>
//                                             </div>
//                                             <button 
//                                                 onClick={() => handleAddToWatchlist(rec)}
//                                                 className="mt-3 w-full py-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors flex items-center justify-center gap-2 group-active:scale-95"
//                                             >
//                                                 <Plus size={12}/> Add to Watchlist
//                                             </button>
//                                         </motion.div>
//                                     ))}
//                                 </div>
//                             )}
//                         </div>
//                     </div>
//                 ))}
                
//                 {thinking && (
//                     <div className="flex items-center gap-3 text-purple-500 text-xs font-mono ml-12 animate-pulse">
//                         <Loader2 size={16} className="animate-spin" />
//                         <span>Thinking...</span>
//                     </div>
//                 )}
//             </div>

//             {/* Input Area */}
//             <div className="p-4 bg-white dark:bg-black/20 border-t border-zinc-200 dark:border-white/5 backdrop-blur-md z-10">
//                 <div className="relative flex items-center">
//                     <input 
//                         placeholder="Type to chat..." 
//                         className="w-full bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-white/10 p-4 pr-16 rounded-2xl font-medium text-zinc-900 dark:text-white outline-none focus:border-purple-500 transition-all placeholder:text-zinc-400"
//                         value={prompt}
//                         onChange={(e) => setPrompt(e.target.value)}
//                         onKeyDown={(e) => e.key === 'Enter' && handleSend()}
//                     />
//                     <button 
//                         onClick={handleSend}
//                         disabled={!prompt.trim() || thinking}
//                         className="absolute right-2 p-2.5 bg-black dark:bg-white text-white dark:text-black rounded-xl hover:scale-105 transition-transform disabled:opacity-50 disabled:scale-100"
//                     >
//                         <Send size={18} />
//                     </button>
//                 </div>
//             </div>

//         </motion.div>
//     )
// }

// // ============================================================================
// // VIEW 1: WATCH MANAGER (With Folders)
// // ============================================================================
// function WatchManagerView({ library, onEdit, onQuickStatus, onTogglePeak, onOpenFolder }: { library: ContentItem[], onEdit: any, onQuickStatus: any, onTogglePeak: any, onOpenFolder: any }) {
//     const watching = library.filter(i => i.status === 'watching');
//     const onHoldCount = library.filter(i => i.status === 'on_hold').length;
//     const toWatchCount = library.filter(i => i.status === 'to_watch').length;

//     return (
//         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-12">
            
//             <section>
//                 <div className="flex items-center gap-4 mb-6">
//                     <div className="p-2 bg-green-500/10 rounded-lg"><Play size={20} className="text-green-500 fill-current"/></div>
//                     <h3 className="text-xl font-black uppercase text-zinc-800 dark:text-white tracking-wide">Now Playing</h3>
//                 </div>

//                 {watching.length > 0 ? (
//                     <div className="flex overflow-x-auto gap-6 pb-6 pt-2 px-1 snap-x scrollbar-hide">
//                          {watching.map(item => (
//                             <div key={item.id} className="min-w-[300px] md:min-w-[350px] snap-center">
//                                 <PosterCard item={item} onEdit={onEdit} onQuickStatus={onQuickStatus} onTogglePeak={onTogglePeak} />
//                             </div>
//                         ))}
//                     </div>
//                 ) : (
//                     <div className="w-full h-64 border-2 border-dashed border-zinc-300 dark:border-zinc-800 rounded-[2rem] flex flex-col items-center justify-center text-zinc-400 bg-white/50 dark:bg-zinc-900/20">
//                         <Film size={40} className="mb-2 opacity-50"/>
//                         <p className="font-bold uppercase tracking-widest text-sm">No Active Content</p>
//                     </div>
//                 )}
//             </section>

//             <section>
//                 <div className="flex items-center gap-4 mb-6">
//                     <div className="p-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg"><Folder size={20} className="text-zinc-600 dark:text-zinc-400 fill-current"/></div>
//                     <h3 className="text-xl font-black uppercase text-zinc-800 dark:text-white tracking-wide">Shelves</h3>
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//                     <FolderCard title="To Watch" count={toWatchCount} color="bg-blue-500" onClick={() => onOpenFolder('towatch')} icon={<Clock size={32} className="text-white"/>} />
//                     <FolderCard title="On Hold" count={onHoldCount} color="bg-orange-500" onClick={() => onOpenFolder('onhold')} icon={<Pause size={32} className="text-white fill-current"/>} />
//                 </div>
//             </section>
//         </motion.div>
//     )
// }

// function FolderCard({ title, count, color, onClick, icon }: { title: string, count: number, color: string, onClick: () => void, icon: React.ReactNode }) {
//     return (
//         <motion.div whileHover={{ scale: 1.02, y: -5 }} onClick={onClick} className="group relative h-48 rounded-[2rem] cursor-pointer overflow-hidden shadow-xl">
//             <div className={cn("absolute inset-0 opacity-90", color)} />
//             <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
//             <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-40 transition-opacity transform group-hover:scale-110 duration-500"><Folder size={120} /></div>
//             <div className="absolute inset-0 p-8 flex flex-col justify-between z-10 text-white">
//                 <div className="flex justify-between items-start"><div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">{icon}</div><span className="text-4xl font-black opacity-80">{count}</span></div>
//                 <div><h3 className="text-2xl font-black uppercase tracking-wider">{title}</h3><p className="text-white/60 text-xs font-bold uppercase tracking-widest mt-1">Tap to Open</p></div>
//             </div>
//         </motion.div>
//     )
// }

// function PosterCard({ item, onEdit, onQuickStatus, onTogglePeak }: { item: ContentItem, onEdit: (i: ContentItem) => void, onQuickStatus: (i: ContentItem, s: string) => void, onTogglePeak: (i: ContentItem) => void }) {
//     const theme = TYPE_CONFIG[item.type] || TYPE_CONFIG.movie;
//     // eslint-disable-next-line @typescript-eslint/no-unused-vars
//     const progress = item.totalEpisodes ? Math.round((item.currentEpisode / item.totalEpisodes) * 100) : 0;
//     const bgImage = item.image || GENRE_ASSETS[item.genre.split(',')[0].trim()] || GENRE_ASSETS.Default;
//     const isPeak = item.rating === 5;

//     return (
//         <motion.div layoutId={item.id} whileHover={{ y: -5 }} className="group relative h-[450px] w-full bg-zinc-900 rounded-[2rem] overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all">
//             <div className="absolute inset-0">
//                 {/* eslint-disable-next-line @next/next/no-img-element */}
//                 <img src={bgImage} alt={item.title} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" />
//                 <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
//             </div>
            
//             <button onClick={(e) => { e.stopPropagation(); onTogglePeak(item); }} className={cn("absolute top-4 right-4 p-2 bg-black/40 backdrop-blur-md rounded-full hover:bg-yellow-500 text-white transition-all z-20", isPeak ? "opacity-100" : "opacity-0 group-hover:opacity-100")}>
//                 <Star size={16} fill={isPeak ? "currentColor" : "none"} className={isPeak ? "text-yellow-400" : "text-white/70"} />
//             </button>

//             <div className="absolute top-4 right-14 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0 z-20">
//                 <button onClick={() => onQuickStatus(item, 'on_hold')} className="p-2 bg-black/60 backdrop-blur-md rounded-full text-white hover:bg-orange-500 transition-colors" title="Pause / Hold"><Pause size={16} fill="currentColor" /></button>
//                 <button onClick={() => onQuickStatus(item, 'completed')} className="p-2 bg-black/60 backdrop-blur-md rounded-full text-white hover:bg-green-500 transition-colors" title="Finish"><CheckCircle2 size={16} /></button>
//                 <button onClick={() => onEdit(item)} className="p-2 bg-black/60 backdrop-blur-md rounded-full text-white hover:bg-blue-500 transition-colors"><Edit2 size={16} /></button>
//             </div>
            
//             <div className="absolute inset-0 p-8 flex flex-col justify-between z-10 text-white pointer-events-none">
//                 <div className="flex justify-between items-start"><span className={cn("px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border backdrop-blur-md", theme.color, theme.border, "bg-black/60")}>{theme.label}</span></div>
//                 <div>
//                     <h2 className="text-4xl font-black leading-[0.9] mb-2 line-clamp-2 drop-shadow-xl">{item.title}</h2>
//                     <p className="text-xs font-bold text-zinc-300 mb-6 uppercase tracking-wider line-clamp-1">{item.genre}</p>
//                     {(item.type === 'series' || item.type === 'anime') ? (
//                         <div className="flex flex-col gap-1.5"><div className="flex items-center gap-3 text-[10px] font-black uppercase text-zinc-300 tracking-widest"><span>Season {item.currentSeason} : Episode {item.currentEpisode}</span></div></div>
//                     ) : (
//                         <div className="flex items-center gap-2 text-xs font-bold text-green-400"><div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> Playing Now</div>
//                     )}
//                 </div>
//             </div>
//         </motion.div>
//     )
// }

// function DirectoryView({ library, onEdit, onDelete, onTogglePeak, onFocus }: any) {
//     const [selectedCategory, setSelectedCategory] = useState("all");
//     const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
//     const [peakOnly, setPeakOnly] = useState(false);
//     const [isGenreOpen, setIsGenreOpen] = useState(false);

//     const filtered = library.filter((item: ContentItem) => {
//         const matchesCategory = selectedCategory === "all" || item.type === selectedCategory;
//         const matchesPeak = peakOnly ? item.rating === 5 : true;
//         const itemGenres = item.genre.split(',').map(g => g.trim().toLowerCase());
//         const matchesGenre = selectedGenres.length === 0 || selectedGenres.some(sg => itemGenres.includes(sg.toLowerCase()));
//         return matchesCategory && matchesPeak && matchesGenre;
//     });

//     return (
//         <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
//             <div className="flex flex-col gap-6 mb-8">
//                 <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
//                     {['all', 'movie', 'series', 'anime', 'documentary'].map(type => (
//                         <button key={type} onClick={() => setSelectedCategory(type)} className={cn("px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all whitespace-nowrap", selectedCategory === type ? "bg-zinc-900 dark:bg-white text-white dark:text-black border-transparent shadow-lg" : "text-zinc-500 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 bg-white/50 dark:bg-zinc-900/50")}>{type}</button>
//                     ))}
//                 </div>
//                 <div className="flex flex-wrap gap-4 items-center justify-between">
//                     <div className="flex gap-4">
//                         <div className="relative">
//                             <button onClick={() => setIsGenreOpen(!isGenreOpen)} className={cn("flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors border", selectedGenres.length > 0 ? "bg-purple-600 text-white border-purple-600" : "text-zinc-500 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900")}>
//                                 <Filter size={14} /> {selectedGenres.length > 0 ? `${selectedGenres.length} Genres` : "Filter Genre"} <ChevronDown size={14} />
//                             </button>
//                             {isGenreOpen && <GenreSelector selected={selectedGenres} onChange={setSelectedGenres} onClose={() => setIsGenreOpen(false)} />}
//                         </div>
//                         <button onClick={() => setPeakOnly(!peakOnly)} className={cn("flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors border", peakOnly ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/50" : "text-zinc-500 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800")}>
//                             <Star size={14} fill={peakOnly ? "currentColor" : "none"} /> Peak Only
//                         </button>
//                     </div>
//                     <span className="text-xs font-bold text-zinc-400">{filtered.length} Entries</span>
//                 </div>
//             </div>
//             <LayoutGroup>
//                 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
//                     <AnimatePresence>
//                         {filtered.map((item: ContentItem, i: number) => (
//                             <DirectoryCard key={item.id} item={item} index={i} onEdit={onEdit} onDelete={onDelete} onTogglePeak={onTogglePeak} onClick={() => onFocus(item)} />
//                         ))}
//                     </AnimatePresence>
//                 </div>
//             </LayoutGroup>
//         </motion.div>
//     )
// }

// function DirectoryCard({ item, index, onEdit, onDelete, onTogglePeak, onClick, onPlay }: { item: ContentItem, index: number, onEdit: any, onDelete?: any, onTogglePeak: any, onClick: any, onPlay?: any }) {
//     const theme = TYPE_CONFIG[item.type] || TYPE_CONFIG.movie;
//     const isPeak = item.rating === 5;
//     const bgImage = item.image || GENRE_ASSETS[item.genre.split(',')[0].trim()] || GENRE_ASSETS.Default;
    
//     return (
//         <motion.div layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: index * 0.03 }} onClick={onClick} className={cn("group relative aspect-[2/3] bg-zinc-900 rounded-2xl overflow-hidden border transition-all shadow-sm hover:shadow-2xl hover:-translate-y-2 cursor-pointer", isPeak ? "border-yellow-500/50 shadow-yellow-500/10" : "border-zinc-200 dark:border-zinc-800")}>
//             <div className="absolute inset-0">
//                 {/* eslint-disable-next-line @next/next/no-img-element */}
//                 <img src={bgImage} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100" />
//                 <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
//             </div>
            
//             <button onClick={(e) => { e.stopPropagation(); onTogglePeak(item); }} className={cn("absolute top-3 right-3 p-1.5 bg-black/40 backdrop-blur-md rounded-full hover:bg-yellow-500 text-white transition-all z-20", isPeak ? "opacity-100" : "opacity-0 group-hover:opacity-100")}>
//                 <Star size={12} fill={isPeak ? "currentColor" : "none"} className={isPeak ? "text-yellow-400" : "text-white/50"} />
//             </button>

//             <div className="absolute top-3 left-3 z-10"><span className={cn("text-[9px] font-black uppercase px-2 py-1 rounded bg-black/60 backdrop-blur-md text-white border border-white/10 tracking-widest", theme.color)}>{item.type}</span></div>
            
//             {/* HOVER ACTIONS: DIFFERENT FOR ARCHIVE vs ON HOLD */}
//             <div className="absolute inset-0 bg-black/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 z-20">
//                 {onPlay && (
//                     <button onClick={(e) => { e.stopPropagation(); onPlay(item); }} className="px-4 py-2 bg-green-500 text-white rounded-full text-xs font-bold uppercase hover:scale-105 transition-transform flex items-center gap-2"><Play size={12}/> Resume</button>
//                 )}
//                 <button onClick={(e) => { e.stopPropagation(); onEdit(item); }} className="px-4 py-2 bg-white text-black rounded-full text-xs font-bold uppercase hover:scale-105 transition-transform flex items-center gap-2"><Edit2 size={12}/> Edit</button>
//                 {onDelete && (
//                     <button onClick={(e) => { e.stopPropagation(); onDelete(item.id); }} className="px-4 py-2 bg-red-500/20 text-red-500 border border-red-500 rounded-full text-xs font-bold uppercase hover:bg-red-500 hover:text-white transition-colors flex items-center gap-2"><Trash2 size={12}/> Archive</button>
//                 )}
//             </div>

//             <div className="absolute bottom-0 left-0 right-0 p-4 text-white z-10 pointer-events-none"><h4 className="font-black text-lg leading-tight line-clamp-2 mb-1 drop-shadow-md">{item.title}</h4><div className="flex flex-col gap-1"><span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest truncate max-w-[90%]">{item.genre.split(',')[0]}</span>{(item.type === 'series' || item.type === 'anime') && (<span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">S{item.currentSeason} E{item.currentEpisode}</span>)}</div></div>
//         </motion.div>
//     )
// }

// function ToWatchOverlay({ items, onClose, onEdit, onQuickStatus }: { items: ContentItem[], onClose: () => void, onEdit: any, onQuickStatus: any }) {
//     const [index, setIndex] = useState(0);
//     const current = items[index];
//     const next = () => setIndex((i) => (i + 1) % items.length);
//     const prev = () => setIndex((i) => (i - 1 + items.length) % items.length);

//     useEffect(() => {
//         const handleKeyDown = (e: KeyboardEvent) => {
//             if (e.key === 'ArrowRight') next();
//             if (e.key === 'ArrowLeft') prev();
//             if (e.key === 'Escape') onClose();
//         };
//         window.addEventListener('keydown', handleKeyDown);
//         return () => window.removeEventListener('keydown', handleKeyDown);
//     }, [items.length]);

//     if (!current) return <EmptyOverlay onClose={onClose} title="To Watch List Empty" />;
//     const bgImage = current.image || GENRE_ASSETS[current.genre.split(',')[0].trim()] || GENRE_ASSETS.Default;

//     return (
//         <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-4">
//             <button onClick={onClose} className="absolute top-8 right-8 text-white/50 hover:text-white p-2 rounded-full hover:bg-white/10 transition-all"><X size={32}/></button>
//             <h2 className="absolute top-8 left-8 text-2xl font-black uppercase text-white/20 tracking-widest pointer-events-none">To Watch Queue</h2>
//             <div className="flex items-center gap-8 w-full max-w-6xl">
//                 <button onClick={prev} className="hidden md:flex p-4 rounded-full bg-white/5 text-white/50 hover:bg-white/20 hover:text-white transition-all"><ArrowLeft size={32}/></button>
//                 <div className="flex-1 flex justify-center">
//                     <AnimatePresence mode="wait">
//                         <motion.div key={current.id} initial={{ x: 100, opacity: 0, scale: 0.8 }} animate={{ x: 0, opacity: 1, scale: 1 }} exit={{ x: -100, opacity: 0, scale: 0.8 }} transition={{ type: "spring", stiffness: 300, damping: 30 }} className="relative w-full max-w-md aspect-[2/3] bg-zinc-900 rounded-[3rem] overflow-hidden shadow-2xl border border-white/10">
//                             <img src={bgImage} alt={current.title} className="absolute inset-0 w-full h-full object-cover opacity-80" />
//                             <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
//                             <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
//                                 <span className="inline-block px-3 py-1 rounded-lg bg-blue-600 text-[10px] font-black uppercase tracking-widest mb-4">{current.type}</span>
//                                 <h2 className="text-4xl font-black leading-none mb-2">{current.title}</h2>
//                                 <p className="text-zinc-400 font-bold uppercase tracking-wider text-xs mb-6">{current.genre}</p>
//                                 <div className="flex gap-3">
//                                     <button onClick={() => { onQuickStatus(current, 'watching'); onClose(); }} className="flex-1 py-3 bg-white text-black font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-transform flex items-center justify-center gap-2"><Play size={16} fill="currentColor"/> Start</button>
//                                     <button onClick={() => onEdit(current)} className="p-3 bg-white/10 text-white rounded-xl hover:bg-white/20 backdrop-blur-md transition-colors"><Edit2 size={20} /></button>
//                                 </div>
//                             </div>
//                         </motion.div>
//                     </AnimatePresence>
//                 </div>
//                 <button onClick={next} className="hidden md:flex p-4 rounded-full bg-white/5 text-white/50 hover:bg-white/20 hover:text-white transition-all"><ArrowRight size={32}/></button>
//             </div>
//             <div className="absolute bottom-8 text-white/30 font-mono text-sm">{index + 1} / {items.length}</div>
//         </motion.div>
//     )
// }

// function OnHoldOverlay({ items, onClose, onEdit, onQuickStatus, onTogglePeak, onFocus }: { items: ContentItem[], onClose: () => void, onEdit: any, onQuickStatus: any, onTogglePeak: any, onFocus: any }) {
//     return (
//         <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="fixed inset-0 z-50 bg-zinc-950/95 backdrop-blur-xl p-8 overflow-y-auto">
//             <div className="max-w-6xl mx-auto">
//                 <div className="flex justify-between items-center mb-12"><h2 className="text-3xl font-black uppercase text-white flex items-center gap-3"><Pause size={32} className="text-orange-500 fill-current"/> On Hold Shelf</h2><button onClick={onClose} className="p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors"><X size={24}/></button></div>
//                 {items.length === 0 ? <EmptyOverlay onClose={onClose} title="No Content On Hold" /> : (
//                     <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//                         {items.map((item, i) => (
//                             <DirectoryCard 
//                                 key={item.id} 
//                                 item={item} 
//                                 index={i} 
//                                 onEdit={onEdit} 
//                                 onDelete={undefined} // No delete from here directly (keeps it distinct from Archive)
//                                 onTogglePeak={onTogglePeak} 
//                                 onClick={() => onFocus(item)}
//                                 onPlay={() => onQuickStatus(item, 'watching')} // Special Resume Button
//                             />
//                         ))}
//                     </div>
//                 )}
//             </div>
//         </motion.div>
//     )
// }

// function EmptyOverlay({ onClose, title }: { onClose: () => void, title: string }) {
//     return (
//         <div className="flex flex-col items-center justify-center h-full text-zinc-500"><Archive size={64} className="mb-4 opacity-20"/><h3 className="text-2xl font-black uppercase tracking-widest mb-8">{title}</h3><button onClick={onClose} className="px-6 py-2 border border-zinc-700 rounded-full hover:bg-zinc-800 text-white transition-colors text-xs font-bold uppercase">Close</button></div>
//     )
// }

// function FocusOverlay({ item, onClose, onEdit, onDelete, onTogglePeak }: { item: ContentItem, onClose: () => void, onEdit: any, onDelete: any, onTogglePeak: any }) {
//     const bgImage = item.image || GENRE_ASSETS[item.genre.split(',')[0].trim()] || GENRE_ASSETS.Default;
//     const isPeak = item.rating === 5;

//     return (
//         <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-white/80 dark:bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
//             <button onClick={onClose} className="absolute top-8 right-8 p-2 bg-black/10 dark:bg-white/10 rounded-full hover:bg-black/20 dark:hover:bg-white/20 text-zinc-900 dark:text-white transition-all"><X size={32}/></button>
//             <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="relative w-full max-w-4xl bg-white dark:bg-zinc-900 rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row h-auto max-h-[85vh] border border-zinc-200 dark:border-zinc-800">
//                 <div className="w-full md:w-1/2 h-64 md:h-auto relative shrink-0">
//                     <img src={bgImage} alt={item.title} className="absolute inset-0 w-full h-full object-cover" />
//                     <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/60 to-transparent" />
//                     <button onClick={(e) => { e.stopPropagation(); onTogglePeak(item); }} className={cn("absolute top-6 left-6 p-3 bg-black/40 backdrop-blur-md rounded-full hover:bg-yellow-500 text-white transition-all z-20", isPeak ? "text-yellow-400" : "text-white/70")}>
//                         <Star size={24} fill={isPeak ? "currentColor" : "none"} />
//                     </button>
//                 </div>
//                 <div className="w-full md:w-1/2 h-1/2 md:h-full p-8 md:p-12 flex flex-col overflow-y-auto custom-scrollbar">
//                     <div className="mb-auto">
//                         <div className="flex items-center gap-3 mb-4">
//                             <span className="px-3 py-1 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs font-black uppercase tracking-widest border border-purple-200 dark:border-purple-500/20">{item.type}</span>
//                             <span className="px-3 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-xs font-bold uppercase tracking-widest">{item.status.replace('_', ' ')}</span>
//                         </div>
//                         <h2 className="text-3xl md:text-4xl font-black text-zinc-900 dark:text-white leading-[0.9] mb-4">{item.title}</h2>
//                         <p className="text-zinc-500 font-bold uppercase tracking-wider text-sm mb-8">{item.genre}</p>
//                         {(item.type === 'series' || item.type === 'anime') && (
//                             <div className="flex items-center gap-4 text-sm font-bold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 p-4 rounded-xl mb-8">
//                                 <Tv size={20} /><span>Season {item.currentSeason}</span><span className="w-1 h-4 bg-zinc-300 dark:bg-zinc-700"/><span>Episode {item.currentEpisode}</span>
//                             </div>
//                         )}
//                         <div className="bg-zinc-50 dark:bg-black/20 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800">
//                             <p className="text-[10px] font-black uppercase text-zinc-400 mb-2 tracking-widest">Personal Notes</p>
//                             <p className="text-zinc-700 dark:text-zinc-300 italic text-base leading-relaxed">"{item.notes || "No notes added."}"</p>
//                         </div>
//                     </div>
//                     <div className="flex gap-4 mt-8 pt-8 border-t border-zinc-100 dark:border-zinc-800 shrink-0">
//                         <button onClick={onEdit} className="flex-1 py-4 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white rounded-2xl font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2"><Edit2 size={18}/> Edit</button>
//                         <button onClick={onDelete} className="flex-1 py-4 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/50 rounded-2xl font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2"><Trash2 size={18}/> Archive</button>
//                     </div>
//                 </div>
//             </motion.div>
//         </motion.div>
//     )
// }

// function GenreSelector({ selected, onChange, onClose }: { selected: string[], onChange: (g: string[]) => void, onClose: () => void }) {
//     const [search, setSearch] = useState("");
//     const toggleGenre = (genre: string) => { if (selected.includes(genre)) { onChange(selected.filter(g => g !== genre)); } else { onChange([...selected, genre]); } };
//     const filteredGenres = GENRE_LIST.filter(g => g.toLowerCase().includes(search.toLowerCase()));

//     return (
//         <div className="absolute top-full left-0 mt-2 w-full md:w-[400px] bg-white dark:bg-[#0F0F0F] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl z-50 p-4 overflow-hidden">
//             <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-900 p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 mb-3"><Search size={16} className="text-zinc-400"/><input placeholder="Search genres..." className="bg-transparent w-full text-sm font-bold text-zinc-900 dark:text-white outline-none placeholder:text-zinc-500" value={search} onChange={(e) => setSearch(e.target.value)} autoFocus /></div>
//             <div className="h-[200px] overflow-y-auto custom-scrollbar pr-2"><div className="flex flex-wrap gap-2">{filteredGenres.map(genre => (<button key={genre} onClick={() => toggleGenre(genre)} className={cn("px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-all", selected.includes(genre) ? "bg-purple-600 text-white border-purple-600 shadow-lg shadow-purple-500/20" : "bg-zinc-50 dark:bg-zinc-900 text-zinc-500 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600")}>{genre}</button>))}</div></div>
//             <div className="mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-center"><span className="text-xs font-bold text-zinc-400">{selected.length} selected</span><button onClick={onClose} className="text-xs font-black uppercase text-purple-500 hover:underline">Done</button></div>
//         </div>
//     )
// }

// function ContentModal({ onClose, onSave, initialData }: { onClose:()=>void, onSave:(d:ContentItem)=>void, initialData?: ContentItem | null }) {
//     const [form, setForm] = useState<ContentItem>(initialData || { title: '', type: 'movie', genre: '', platform: '', status: 'to_watch', currentSeason: 1, currentEpisode: 0, notes: '', rating: 0, image: '' });
//     const [showGenrePicker, setShowGenrePicker] = useState(false);
//     const selectedGenres = form.genre ? form.genre.split(',').map((g: string) => g.trim()).filter(Boolean) : [];
//     const isSeries = form.type === 'series' || form.type === 'anime';
//     const handleGenreChange = (newGenres: string[]) => { setForm({ ...form, genre: newGenres.join(', ') }); };
//     const handleSearchCover = () => { if (!form.title) return alert("Type a title first!"); const query = `${form.title} ${form.type} poster wallpaper`; window.open(`https://www.google.com/search?tbm=isch&q=${encodeURIComponent(query)}`, '_blank'); };

//     return (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl">
//             <motion.div initial={{scale:0.95, opacity:0}} animate={{scale:1, opacity:1}} className="bg-white dark:bg-[#0A0A0A] w-full max-w-2xl rounded-[2.5rem] p-8 border border-zinc-200 dark:border-white/10 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
//                 <div className="flex justify-between items-center mb-6 shrink-0"><h2 className="text-2xl font-black uppercase text-zinc-900 dark:text-white flex items-center gap-3"><Edit2 size={24} className="text-purple-600 dark:text-purple-500" /> {initialData ? "Update Entry" : "New Entry"}</h2><button onClick={onClose}><X size={24} className="text-zinc-400 hover:text-black dark:hover:text-white transition-colors"/></button></div>
//                 <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar flex-1">
//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                         <div className="md:col-span-2 group"><label className="text-[10px] font-bold uppercase text-zinc-500 mb-1 block tracking-wider">Title</label><input autoFocus placeholder="e.g. Inception" className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl font-black text-zinc-900 dark:text-white outline-none focus:border-purple-500 transition-all text-lg" value={form.title} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, title: e.target.value})} /></div>
//                         <div><label className="text-[10px] font-bold uppercase text-zinc-500 mb-1 block tracking-wider">Type</label><select className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl font-bold text-zinc-900 dark:text-white outline-none appearance-none" value={form.type} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setForm({...form, type: e.target.value})}><option value="movie">Movie</option><option value="series">Series</option><option value="anime">Anime</option><option value="documentary">Docu</option></select></div>
//                     </div>
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         <div className="relative"><label className="text-[10px] font-bold uppercase text-zinc-500 mb-1 block tracking-wider">Genres</label><div onClick={() => setShowGenrePicker(!showGenrePicker)} className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl font-bold text-zinc-900 dark:text-white cursor-pointer flex justify-between items-center hover:border-purple-500 transition-colors"><span className="truncate">{form.genre || "Select Genres..."}</span><ChevronDown size={16} className="text-zinc-500"/></div>{showGenrePicker && <GenreSelector selected={selectedGenres} onChange={handleGenreChange} onClose={() => setShowGenrePicker(false)} />}</div>
//                         <div><label className="text-[10px] font-bold uppercase text-zinc-500 mb-1 block tracking-wider">Platform</label><input placeholder="Netflix, Prime..." className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl font-bold text-zinc-900 dark:text-white outline-none" value={form.platform} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, platform: e.target.value})} /></div>
//                     </div>
//                     <div><label className="text-[10px] font-bold uppercase text-zinc-500 mb-1 block tracking-wider flex justify-between"><span>Poster URL (Optional)</span><button onClick={handleSearchCover} className="text-purple-500 hover:underline flex items-center gap-1"><Search size={10}/> Find on Google</button></label><div className="flex gap-2"><input placeholder="Paste image address here..." className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl font-medium text-zinc-900 dark:text-white outline-none text-sm" value={form.image || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, image: e.target.value})} />{form.image && <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-zinc-700">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={form.image} alt="prev" className="w-full h-full object-cover" /></div>}</div><p className="text-[10px] text-zinc-500 mt-1 italic">*Leave empty for auto-generated cinematic theme.</p></div>
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         <div><label className="text-[10px] font-bold uppercase text-zinc-500 mb-1 block tracking-wider">Status</label><select className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl font-bold text-zinc-900 dark:text-white outline-none appearance-none" value={form.status} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setForm({...form, status: e.target.value})}><option value="to_watch">To Watch</option><option value="watching">Watching</option><option value="on_hold">On Hold</option><option value="completed">Completed</option></select></div>
//                         {isSeries ? (<div className="grid grid-cols-2 gap-2"><div><label className="text-[10px] font-bold uppercase text-zinc-500 mb-1 block">Season(s)</label><input type="number" className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl font-bold text-zinc-900 dark:text-white outline-none" value={form.currentSeason} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, currentSeason: parseInt(e.target.value) || 0})} /></div><div><label className="text-[10px] font-bold uppercase text-zinc-500 mb-1 block">Episode(s)</label><input type="number" className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl font-bold text-zinc-900 dark:text-white outline-none" value={form.currentEpisode} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, currentEpisode: parseInt(e.target.value) || 0})} /></div></div>) : <div />}
//                     </div>
//                     <div><label className="text-[10px] font-bold uppercase text-zinc-500 mb-1 block tracking-wider">Personal Notes</label><textarea placeholder="Why you liked it? Or why you dropped it?" className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl font-medium text-zinc-900 dark:text-white outline-none h-24 resize-none" value={form.notes} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm({...form, notes: e.target.value})} /></div>
//                 </div>
//                 <div className="flex gap-3 mt-6 shrink-0"><button onClick={onClose} className="flex-1 py-4 font-bold text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-2xl transition-colors uppercase tracking-wider">Cancel</button><button onClick={() => onSave(form)} className="flex-1 py-4 bg-black dark:bg-white text-white dark:text-black font-black rounded-2xl hover:scale-[1.02] transition-transform tracking-widest shadow-xl uppercase">Save Entry</button></div>
//             </motion.div>
//         </div>
//     )
// }



//-------------------------------------------------------------------------------
"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import {
  Play, Pause, Plus, Star, Tv, Film, BookOpen, 
  Edit2, Trash2, X, Sparkles, Loader2, Filter, 
  CheckCircle2, Clock, Search, ChevronDown, MonitorPlay, 
  Archive, Folder, ArrowRight, ArrowLeft, Clapperboard, Video, Popcorn, Maximize2, Send, Bot, User
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// --- ACTIONS ---
import { getLibrary, upsertContent, deleteContent, chatWithAI } from "@/lib/actions/entertainment";

// --- UTILS ---
function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

// ============================================================================
// 1. DATA & CONFIG
// ============================================================================

interface ContentItem {
    id?: string;
    title: string;
    type: string;
    genre: string;
    platform: string;
    status: string;
    currentSeason: number;
    currentEpisode: number;
    totalEpisodes?: number;
    rating: number; 
    notes: string;
    image?: string;
    updatedAt?: string;
}

const GENRE_LIST = [
  "Action", "Adventure", "Animation", "Anthology", "Biopic", "Comedy", "Crime", 
  "Cyberpunk", "Coming-of-Age", "Documentary", "Drama", "Dystopian", "Ecchi", 
  "Family", "Fantasy", "Film-Noir", "Heist", "Historical", "Horror", "Isekai", 
  "Josei", "Legal", "Martial Arts", "Mecha", "Medical", "Military", "Musical", 
  "Mystery", "Mythology", "Parody", "Political", "Post-Apocalyptic", "Psychological", 
  "Reality TV", "Romance", "Samurai", "Satire", "Sci-Fi", "Seinen", "Shojo", 
  "Shonen", "Slice of Life", "Space-Opera", "Sports", "Spy", "Supernatural", 
  "Superhero", "Suspense", "Thriller", "War", "Western", "Zombie"
];

const GENRE_ASSETS: Record<string, string> = {
    "Sci-Fi": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072",
    "Action": "https://images.unsplash.com/photo-1552072092-7f9b8d63efcb?q=80&w=2070",
    "Horror": "https://images.unsplash.com/photo-1505635552518-3448ff116af3?q=80&w=1931",
    "Romance": "https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?q=80&w=1986",
    "Anime": "https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1936",
    "Cyberpunk": "https://images.unsplash.com/photo-1515630278258-407f66498911?q=80&w=1998",
    "Fantasy": "https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?q=80&w=1974",
    "Default": "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2070"
};

interface ThemeConfig {
    label: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    icon: any;
    color: string;
    bg: string;
    border: string; // Fixed: Added border property
}

const TYPE_CONFIG: Record<string, ThemeConfig> = {
    movie: { label: "Movie", icon: Film, color: "text-purple-500", bg: "bg-purple-500/20", border: "border-purple-500/20" },
    series: { label: "Series", icon: Tv, color: "text-blue-500", bg: "bg-blue-500/20", border: "border-blue-500/20" },
    anime: { label: "Anime", icon: Sparkles, color: "text-pink-500", bg: "bg-pink-500/20", border: "border-pink-500/20" },
    documentary: { label: "Docu", icon: BookOpen, color: "text-emerald-500", bg: "bg-emerald-500/20", border: "border-emerald-500/20" }
};

// ============================================================================
// 2. MAIN COMPONENT
// ============================================================================

export default function EntertainmentV45() {
  const [library, setLibrary] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("manager"); 
  
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  
  const [openFolder, setOpenFolder] = useState<'towatch' | 'onhold' | null>(null);
  const [focusedItem, setFocusedItem] = useState<ContentItem | null>(null);

  const fetchData = useCallback(async () => {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const res: any = await getLibrary();
        setLibrary(res || []);
    } finally {
        setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async (data: ContentItem) => {
      const optimisticItem = { 
          ...data, 
          id: data.id || `temp-${Math.random().toString(36).substr(2, 9)}`,
          updatedAt: new Date().toISOString()
      };

      if (data.id && !data.id.startsWith("temp-")) {
          setLibrary(prev => prev.map(item => item.id === data.id ? { ...item, ...data } : item));
      } else {
          setLibrary(prev => [optimisticItem, ...prev]);
      }
      
      await upsertContent(data);
      setShowModal(false);
      setEditingItem(null);
      fetchData(); 
  };

  const handleDelete = async (id: string) => {
      if(confirm("Archive this entry forever?")) {
          setLibrary(prev => prev.filter(item => item.id !== id));
          await deleteContent(id);
          fetchData();
          if (focusedItem?.id === id) setFocusedItem(null);
      }
  };

  const handleQuickStatus = async (item: ContentItem, newStatus: string) => {
      const updatedItem = { ...item, status: newStatus };
      setLibrary(prev => prev.map(i => i.id === item.id ? updatedItem : i));
      if (focusedItem?.id === item.id) setFocusedItem(updatedItem);
      await upsertContent(updatedItem);
  };

  const handleTogglePeak = async (item: ContentItem) => {
      const newRating = item.rating === 5 ? 0 : 5; 
      const updatedItem = { ...item, rating: newRating };
      setLibrary(prev => prev.map(i => i.id === item.id ? updatedItem : i));
      if (focusedItem?.id === item.id) setFocusedItem(updatedItem);
      await upsertContent(updatedItem);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#020202] text-zinc-900 dark:text-zinc-100 font-sans relative overflow-x-hidden transition-colors duration-500">
      
      {/* 1. BACKGROUND */}
      <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-[-20%] right-[-10%] w-[80vw] h-[80vh] bg-purple-500/5 dark:bg-purple-900/20 rounded-full blur-[150px]" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[60vw] h-[60vh] bg-blue-500/5 dark:bg-blue-900/20 rounded-full blur-[150px]" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 dark:opacity-30 mix-blend-overlay" />
      </div>

      <div className="relative z-10 max-w-[1600px] mx-auto p-6 md:p-10 space-y-10 pb-32">
        
        {/* 2. HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-end gap-6 pt-4 border-b border-zinc-200 dark:border-white/5 pb-6">
            <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.3em] text-purple-600 dark:text-purple-400">
                    <MonitorPlay size={14} /> Entertainment OS
                </div>
                
                <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tight leading-none cursor-default">
                    <span className="text-zinc-900 dark:text-white transition-colors duration-200">WATCH</span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 transition-all duration-300 hover:tracking-wide">LIST</span>
                </h1>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex p-1 bg-zinc-100 dark:bg-zinc-900 rounded-full border border-zinc-200 dark:border-zinc-800">
                    {['manager', 'directory', 'ai'].map(tab => (
                        <button 
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                                "px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all relative overflow-hidden",
                                activeTab === tab ? "text-white shadow-md bg-black dark:bg-zinc-800" : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
                            )}
                        >
                            {tab === 'manager' ? "Active" : tab === 'directory' ? "Archive" : "AI Gen"}
                        </button>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {activeTab !== 'ai' && (
                        <motion.button 
                            key={activeTab === 'directory' ? 'archive-btn' : 'add-btn'}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            whileHover={{ scale: 1.05 }} 
                            whileTap={{ scale: 0.95 }}
                            onClick={() => { setEditingItem(null); setShowModal(true); }} 
                            className={cn(
                                "flex items-center justify-center w-12 h-12 text-white rounded-2xl shadow-lg transition-all",
                                activeTab === 'directory' 
                                    ? "bg-zinc-800 hover:bg-zinc-700" 
                                    : "bg-black dark:bg-white dark:text-black hover:shadow-purple-500/20"
                            )}
                        >
                            {activeTab === 'directory' ? <Archive size={20} /> : <Plus size={24} />}
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>
        </header>

        {/* 3. CONTENT AREA */}
        <AnimatePresence mode="wait">
            {loading ? (
                <div className="flex justify-center py-40"><Loader2 className="animate-spin text-purple-500" size={40}/></div>
            ) : activeTab === 'manager' ? (
                <WatchManagerView 
                    library={library} 
                    onEdit={(item: ContentItem) => { setEditingItem(item); setShowModal(true); }} 
                    onQuickStatus={handleQuickStatus}
                    onTogglePeak={handleTogglePeak}
                    onOpenFolder={setOpenFolder}
                />
            ) : activeTab === 'directory' ? (
                <DirectoryView 
                    library={library} 
                    onEdit={(item: ContentItem) => { setEditingItem(item); setShowModal(true); }} 
                    onDelete={handleDelete} 
                    onTogglePeak={handleTogglePeak}
                    onFocus={setFocusedItem}
                />
            ) : (
                <AIDiscoveryView onAdd={handleSave} />
            )}
        </AnimatePresence>

      </div>

      {/* OVERLAYS (FOLDERS & FOCUS) */}
      <AnimatePresence>
          {openFolder === 'towatch' && (
              <ToWatchOverlay 
                  key="overlay-towatch"
                  items={library.filter(i => i.status === 'to_watch')} 
                  onClose={() => setOpenFolder(null)}
                  onEdit={(item: ContentItem) => { setEditingItem(item); setShowModal(true); }}
                  onQuickStatus={handleQuickStatus}
              />
          )}
          {openFolder === 'onhold' && (
              <OnHoldOverlay 
                  key="overlay-onhold"
                  items={library.filter(i => i.status === 'on_hold')}
                  onClose={() => setOpenFolder(null)}
                  onEdit={(item: ContentItem) => { setEditingItem(item); setShowModal(true); }}
                  onQuickStatus={handleQuickStatus}
                  onTogglePeak={handleTogglePeak}
                  onFocus={setFocusedItem}
              />
          )}
          
          {/* FOCUS MODE (Detail View) */}
          {focusedItem && (
              <FocusOverlay 
                  key="overlay-focus"
                  item={focusedItem} 
                  onClose={() => setFocusedItem(null)}
                  onEdit={() => { setEditingItem(focusedItem); setFocusedItem(null); setShowModal(true); }}
                  onDelete={() => handleDelete(focusedItem.id!)}
                  onTogglePeak={() => handleTogglePeak(focusedItem)}
              />
          )}
      </AnimatePresence>

      {/* MODAL */}
      <AnimatePresence>
          {showModal && <ContentModal onClose={() => setShowModal(false)} onSave={handleSave} initialData={editingItem} />}
      </AnimatePresence>

    </div>
  );
}

// ============================================================================
// COMPONENT: AI DISCOVERY
// ============================================================================
function AIDiscoveryView({ onAdd }: { onAdd: (item: ContentItem) => void }) {
    interface Message {
        id: string;
        role: 'user' | 'ai';
        text: string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recommendations?: any[];
    }

    const [messages, setMessages] = useState<Message[]>([
        { id: 'init', role: 'ai', text: "Hello! I am InnerLoop AI. Ask me for recommendations or discuss your favorite movies." }
    ]);
    const [prompt, setPrompt] = useState("");
    const [thinking, setThinking] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if(scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, thinking]);

    const handleSend = async () => {
        if(!prompt.trim()) return;
        
        const userMsg: Message = { id: Date.now().toString(), role: 'user', text: prompt };
        setMessages(prev => [...prev, userMsg]);
        setPrompt("");
        setThinking(true);

        try {
            const history = messages.map(m => ({ role: m.role, text: m.text }));
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const res: any = await chatWithAI(history, userMsg.text);
            
            if (res.data && res.data.length > 0) {
                 const aiMsg: Message = { 
                    id: (Date.now() + 1).toString(), 
                    role: 'ai', 
                    text: res.reply || res.intel, 
                    recommendations: res.data 
                };
                setMessages(prev => [...prev, aiMsg]);
            } else {
                 const aiMsg: Message = { 
                    id: (Date.now() + 1).toString(), 
                    role: 'ai', 
                    text: res.reply || res.intel || "I didn't catch that.",
                };
                setMessages(prev => [...prev, aiMsg]);
            }
        } catch (e) {
            console.error(e);
            setMessages(prev => [...prev, { id: Date.now().toString(), role: 'ai', text: "Network error. Please try again." }]);
        } finally {
            setThinking(false);
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleAddToWatchlist = (rec: any) => {
        const newItem: ContentItem = {
            title: rec.title,
            type: (rec.type || 'movie').toLowerCase(),
            genre: rec.genre || 'Unknown',
            platform: rec.platform || 'Unknown',
            status: 'to_watch',
            currentSeason: 1,
            currentEpisode: 0,
            rating: 0,
            notes: `AI Rec: ${rec.reason}`,
            updatedAt: new Date().toISOString()
        };
        onAdd(newItem);
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-[650px] w-full max-w-4xl mx-auto relative flex flex-col bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-zinc-200 dark:border-white/5 rounded-[3rem] shadow-2xl overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                <motion.div animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }} transition={{ duration: 5, repeat: Infinity }} className="absolute top-10 left-10 text-purple-500/20 dark:text-purple-500/30"><Popcorn size={64}/></motion.div>
                <motion.div animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }} transition={{ duration: 6, repeat: Infinity, delay: 1 }} className="absolute bottom-20 right-10 text-blue-500/20 dark:text-blue-500/30"><Clapperboard size={80}/></motion.div>
                <motion.div animate={{ x: [0, 20, 0] }} transition={{ duration: 7, repeat: Infinity, delay: 2 }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-pink-500/10 dark:text-pink-500/20"><Video size={120}/></motion.div>
            </div>
            
            <div className="p-6 border-b border-zinc-100 dark:border-white/5 bg-zinc-50/50 dark:bg-black/20 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500 rounded-lg text-white shadow-lg shadow-purple-500/20"><Bot size={20}/></div>
                    <div>
                        <h3 className="font-bold text-sm text-zinc-900 dark:text-white">InnerLoop AI</h3>
                        <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"/> Online</p>
                    </div>
                </div>
                <button onClick={() => setMessages([])} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full text-zinc-400 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar z-10">
                {messages.map((msg) => (
                    <div key={msg.id} className={cn("flex gap-4 max-w-[85%]", msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto")}>
                        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1", msg.role === 'ai' ? "bg-purple-500 text-white" : "bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-white")}>
                            {msg.role === 'ai' ? <Bot size={16}/> : <User size={16}/>}
                        </div>
                        <div className="space-y-3 w-full">
                            <div className={cn("p-4 rounded-2xl text-sm font-medium leading-relaxed shadow-sm", msg.role === 'ai' ? "bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border border-zinc-100 dark:border-white/5 rounded-tl-none" : "bg-purple-600 text-white rounded-tr-none")}>
                                {msg.text}
                            </div>
                            {msg.recommendations && msg.recommendations.length > 0 && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2 pl-2">
                                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                    {msg.recommendations.map((rec: any, i: number) => (
                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} key={i} className="bg-white dark:bg-black/40 border border-zinc-200 dark:border-white/10 p-4 rounded-xl flex flex-col justify-between hover:border-purple-500/50 transition-colors shadow-sm group">
                                            <div><div className="flex justify-between items-start mb-2"><span className="text-[9px] font-black uppercase tracking-widest bg-zinc-100 dark:bg-white/10 px-2 py-0.5 rounded text-zinc-500 dark:text-zinc-400">{rec.type}</span><span className="text-[9px] font-bold text-zinc-400">{rec.platform}</span></div><h4 className="font-bold text-zinc-900 dark:text-white text-sm leading-tight">{rec.title}</h4><p className="text-[10px] text-zinc-500 mt-1 line-clamp-2">{rec.reason}</p></div>
                                            <button onClick={() => handleAddToWatchlist(rec)} className="mt-3 w-full py-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors flex items-center justify-center gap-2 group-active:scale-95"><Plus size={12}/> Add to Watchlist</button>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {thinking && <div className="flex items-center gap-3 text-purple-500 text-xs font-mono ml-12 animate-pulse"><Loader2 size={16} className="animate-spin" /><span>Thinking...</span></div>}
            </div>

            <div className="p-4 bg-white dark:bg-black/20 border-t border-zinc-200 dark:border-white/5 backdrop-blur-md z-10">
                <div className="relative flex items-center">
                    <input placeholder="Type to chat..." className="w-full bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-white/10 p-4 pr-16 rounded-2xl font-medium text-zinc-900 dark:text-white outline-none focus:border-purple-500 transition-all placeholder:text-zinc-400" value={prompt} onChange={(e) => setPrompt(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} />
                    <button onClick={handleSend} disabled={!prompt.trim() || thinking} className="absolute right-2 p-2.5 bg-black dark:bg-white text-white dark:text-black rounded-xl hover:scale-105 transition-transform disabled:opacity-50 disabled:scale-100"><Send size={18} /></button>
                </div>
            </div>
        </motion.div>
    )
}

// ============================================================================
// VIEW 1 & 2 & COMPs (Fixed Keys & Props)
// ============================================================================

function WatchManagerView({ library, onEdit, onQuickStatus, onTogglePeak, onOpenFolder }: { library: ContentItem[], onEdit: (i: ContentItem) => void, onQuickStatus: (i: ContentItem, s: string) => void, onTogglePeak: (i: ContentItem) => void, onOpenFolder: (f: 'towatch'|'onhold') => void }) {
    const watching = library.filter(i => i.status === 'watching');
    const onHoldCount = library.filter(i => i.status === 'on_hold').length;
    const toWatchCount = library.filter(i => i.status === 'to_watch').length;

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-12">
            <section className="relative">
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-2 bg-green-500/10 rounded-lg"><Play size={20} className="text-green-500 fill-current"/></div>
                    <h3 className="text-xl font-black uppercase text-zinc-800 dark:text-white tracking-wide">Now Playing</h3>
                </div>
                {watching.length > 0 ? (
                    <div className="flex overflow-x-auto gap-6 pb-6 pt-2 px-1 snap-x scrollbar-hide">
                         {watching.map(item => (
                            <div key={item.id} className="min-w-[300px] md:min-w-[350px] snap-center">
                                <PosterCard item={item} onEdit={onEdit} onQuickStatus={onQuickStatus} onTogglePeak={onTogglePeak} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="w-full h-64 border-2 border-dashed border-zinc-300 dark:border-zinc-800 rounded-[2rem] flex flex-col items-center justify-center text-zinc-400 bg-white/50 dark:bg-zinc-900/20"><Film size={40} className="mb-2 opacity-50"/><p className="font-bold uppercase tracking-widest text-sm">No Active Content</p></div>
                )}
            </section>
            <section>
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg"><Folder size={20} className="text-zinc-600 dark:text-zinc-400 fill-current"/></div>
                    <h3 className="text-xl font-black uppercase text-zinc-800 dark:text-white tracking-wide">Shelves</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <FolderCard title="To Watch" count={toWatchCount} color="bg-blue-500" onClick={() => onOpenFolder('towatch')} icon={<Clock size={32} className="text-white"/>} />
                    <FolderCard title="On Hold" count={onHoldCount} color="bg-orange-500" onClick={() => onOpenFolder('onhold')} icon={<Pause size={32} className="text-white fill-current"/>} />
                </div>
            </section>
        </motion.div>
    )
}

function FolderCard({ title, count, color, onClick, icon }: { title: string, count: number, color: string, onClick: () => void, icon: React.ReactNode }) {
    return (
        <motion.div whileHover={{ scale: 1.02, y: -5 }} onClick={onClick} className="group relative h-48 rounded-[2rem] cursor-pointer overflow-hidden shadow-xl">
            <div className={cn("absolute inset-0 opacity-90", color)} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-40 transition-opacity transform group-hover:scale-110 duration-500"><Folder size={120} /></div>
            <div className="absolute inset-0 p-8 flex flex-col justify-between z-10 text-white">
                <div className="flex justify-between items-start"><div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">{icon}</div><span className="text-4xl font-black opacity-80">{count}</span></div>
                <div><h3 className="text-2xl font-black uppercase tracking-wider">{title}</h3><p className="text-white/60 text-xs font-bold uppercase tracking-widest mt-1">Tap to Open</p></div>
            </div>
        </motion.div>
    )
}

function PosterCard({ item, onEdit, onQuickStatus, onTogglePeak }: { item: ContentItem, onEdit: (i: ContentItem) => void, onQuickStatus: (i: ContentItem, s: string) => void, onTogglePeak: (i: ContentItem) => void }) {
    const theme = TYPE_CONFIG[item.type] || TYPE_CONFIG.movie;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const progress = item.totalEpisodes ? Math.round((item.currentEpisode / item.totalEpisodes) * 100) : 0;
    const bgImage = item.image || GENRE_ASSETS[item.genre.split(',')[0].trim()] || GENRE_ASSETS.Default;
    const isPeak = item.rating === 5;

    return (
        <motion.div layoutId={item.id} whileHover={{ y: -5 }} className="group relative h-[450px] w-full bg-zinc-900 rounded-[2rem] overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all">
            <div className="absolute inset-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={bgImage} alt={item.title} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            </div>
            <button onClick={(e) => { e.stopPropagation(); onTogglePeak(item); }} className={cn("absolute top-4 right-4 p-2 bg-black/40 backdrop-blur-md rounded-full hover:bg-yellow-500 text-white transition-all z-20", isPeak ? "opacity-100" : "opacity-0 group-hover:opacity-100")}>
                <Star size={16} fill={isPeak ? "currentColor" : "none"} className={isPeak ? "text-yellow-400" : "text-white/70"} />
            </button>
            <div className="absolute top-4 right-14 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0 z-20">
                <button onClick={() => onQuickStatus(item, 'on_hold')} className="p-2 bg-black/60 backdrop-blur-md rounded-full text-white hover:bg-orange-500 transition-colors" title="Pause / Hold"><Pause size={16} fill="currentColor" /></button>
                <button onClick={() => onQuickStatus(item, 'completed')} className="p-2 bg-black/60 backdrop-blur-md rounded-full text-white hover:bg-green-500 transition-colors" title="Finish"><CheckCircle2 size={16} /></button>
                <button onClick={() => onEdit(item)} className="p-2 bg-black/60 backdrop-blur-md rounded-full text-white hover:bg-blue-500 transition-colors"><Edit2 size={16} /></button>
            </div>
            <div className="absolute inset-0 p-8 flex flex-col justify-between z-10 text-white pointer-events-none">
                <div className="flex justify-between items-start"><span className={cn("px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border backdrop-blur-md", theme.color, theme.border, "bg-black/60")}>{theme.label}</span></div>
                <div>
                    <h2 className="text-4xl font-black leading-[0.9] mb-2 line-clamp-2 drop-shadow-xl">{item.title}</h2>
                    <p className="text-xs font-bold text-zinc-300 mb-6 uppercase tracking-wider line-clamp-1">{item.genre}</p>
                    {(item.type === 'series' || item.type === 'anime') ? (
                        <div className="flex flex-col gap-1.5"><div className="flex items-center gap-3 text-[10px] font-black uppercase text-zinc-300 tracking-widest"><span>Season {item.currentSeason} : Episode {item.currentEpisode}</span></div></div>
                    ) : (
                        <div className="flex items-center gap-2 text-xs font-bold text-green-400"><div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> Playing Now</div>
                    )}
                </div>
            </div>
        </motion.div>
    )
}

function DirectoryView({ library, onEdit, onDelete, onTogglePeak, onFocus }: { library: ContentItem[], onEdit: any, onDelete: any, onTogglePeak: any, onFocus: any }) {
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
    const [peakOnly, setPeakOnly] = useState(false);
    const [isGenreOpen, setIsGenreOpen] = useState(false);
    const [search, setSearch] = useState("");

    const filtered = library.filter((item: ContentItem) => {
        const matchesCategory = selectedCategory === "all" || item.type === selectedCategory;
        const matchesPeak = peakOnly ? item.rating === 5 : true;
        const itemGenres = item.genre.split(',').map(g => g.trim().toLowerCase());
        const matchesGenre = selectedGenres.length === 0 || selectedGenres.some(sg => itemGenres.includes(sg.toLowerCase()));
        const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase());
        return matchesCategory && matchesPeak && matchesGenre && matchesSearch;
    });

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="flex flex-col gap-6 mb-8">
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {['all', 'movie', 'series', 'anime', 'documentary'].map(type => (
                        <button key={type} onClick={() => setSelectedCategory(type)} className={cn("px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all whitespace-nowrap", selectedCategory === type ? "bg-zinc-900 dark:bg-white text-white dark:text-black border-transparent shadow-lg" : "text-zinc-500 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 bg-white/50 dark:bg-zinc-900/50")}>{type}</button>
                    ))}
                </div>
                <div className="flex flex-wrap gap-4 items-center justify-between">
                    <div className="flex gap-4 items-center flex-1">
                         <div className="relative">
                            <button onClick={() => setIsGenreOpen(!isGenreOpen)} className={cn("flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors border", selectedGenres.length > 0 ? "bg-purple-600 text-white border-purple-600" : "text-zinc-500 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900")}>
                                <Filter size={14} /> {selectedGenres.length > 0 ? `${selectedGenres.length} Genres` : "Filter Genre"} <ChevronDown size={14} />
                            </button>
                            {isGenreOpen && <GenreSelector selected={selectedGenres} onChange={setSelectedGenres} onClose={() => setIsGenreOpen(false)} />}
                        </div>
                        <button onClick={() => setPeakOnly(!peakOnly)} className={cn("flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors border", peakOnly ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/50" : "text-zinc-500 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800")}>
                            <Star size={14} fill={peakOnly ? "currentColor" : "none"} /> Peak Only
                        </button>
                        
                        {/* SEARCH BAR */}
                        <div className="relative flex-1 max-w-xs">
                             <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"/>
                             <input 
                                placeholder="Search archive..." 
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-medium focus:border-purple-500 transition-all outline-none"
                             />
                        </div>
                    </div>
                    <span className="text-xs font-bold text-zinc-400">{filtered.length} Entries</span>
                </div>
            </div>
            <LayoutGroup>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    <AnimatePresence>
                        {filtered.map((item: ContentItem, i: number) => (
                            <DirectoryCard 
                                key={item.id} 
                                item={item} 
                                index={i} 
                                onEdit={onEdit} 
                                onDelete={onDelete} 
                                onTogglePeak={onTogglePeak} 
                                onClick={() => onFocus(item)}
                            />
                        ))}
                    </AnimatePresence>
                </div>
            </LayoutGroup>
        </motion.div>
    )
}

function DirectoryCard({ item, index, onEdit, onDelete, onTogglePeak, onClick, onPlay }: { item: ContentItem, index: number, onEdit: any, onDelete?: any, onTogglePeak: any, onClick: any, onPlay?: any }) {
    const theme = TYPE_CONFIG[item.type] || TYPE_CONFIG.movie;
    const isPeak = item.rating === 5;
    const bgImage = item.image || GENRE_ASSETS[item.genre.split(',')[0].trim()] || GENRE_ASSETS.Default;
    
    return (
        <motion.div layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: index * 0.03 }} onClick={onClick} className={cn("group relative aspect-[2/3] bg-zinc-900 rounded-2xl overflow-hidden border transition-all shadow-sm hover:shadow-2xl hover:-translate-y-2 cursor-pointer", isPeak ? "border-yellow-500/50 shadow-yellow-500/10" : "border-zinc-200 dark:border-zinc-800")}>
            <div className="absolute inset-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={bgImage} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
            </div>
            
            {/* Star is always clickable */}
            <button onClick={(e) => { e.stopPropagation(); onTogglePeak(item); }} className={cn("absolute top-3 right-3 p-1.5 bg-black/40 backdrop-blur-md rounded-full hover:bg-yellow-500 text-white transition-all z-30", isPeak ? "opacity-100" : "opacity-0 group-hover:opacity-100")}>
                <Star size={12} fill={isPeak ? "currentColor" : "none"} className={isPeak ? "text-yellow-400" : "text-white/50"} />
            </button>

            <div className="absolute top-3 left-3 z-10"><span className={cn("text-[9px] font-black uppercase px-2 py-1 rounded bg-black/60 backdrop-blur-md text-white border border-white/10 tracking-widest", theme.color)}>{item.type}</span></div>
            
            {/* HOVER LAYER */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 z-20">
                {/* ON HOLD ACTIONS */}
                {onPlay ? (
                    <>
                        <button onClick={(e) => { e.stopPropagation(); onPlay(item); }} className="px-4 py-2 bg-green-500 text-white rounded-full text-xs font-bold uppercase hover:scale-105 transition-transform flex items-center gap-2"><Play size={12}/> Resume</button>
                        <button onClick={(e) => { e.stopPropagation(); onEdit(item); }} className="px-4 py-2 bg-white text-black rounded-full text-xs font-bold uppercase hover:scale-105 transition-transform flex items-center gap-2"><Edit2 size={12}/> Edit</button>
                    </>
                ) : (
                    // ARCHIVE MODE: Just clean, user clicks to focus
                     <div className="flex flex-col items-center gap-2 text-white/50">
                        <Maximize2 size={24}/>
                        <span className="text-[10px] font-bold uppercase tracking-widest">Details</span>
                     </div>
                )}
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-4 text-white z-10 pointer-events-none"><h4 className="font-black text-lg leading-tight line-clamp-2 mb-1 drop-shadow-md">{item.title}</h4><div className="flex flex-col gap-1"><span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest truncate max-w-[90%]">{item.genre.split(',')[0]}</span>{(item.type === 'series' || item.type === 'anime') && (<span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">S{item.currentSeason} E{item.currentEpisode}</span>)}</div></div>
        </motion.div>
    )
}

function ToWatchOverlay({ items, onClose, onEdit, onQuickStatus }: { items: ContentItem[], onClose: () => void, onEdit: any, onQuickStatus: any }) {
    // ... (Same ToWatchOverlay Logic)
    const [index, setIndex] = useState(0);
    const current = items[index];
    const next = useCallback(() => setIndex((i) => (i + 1) % items.length), [items.length]);
    const prev = useCallback(() => setIndex((i) => (i - 1 + items.length) % items.length), [items.length]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') next();
            if (e.key === 'ArrowLeft') prev();
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [next, prev, onClose]);

    if (!current) return <EmptyOverlay onClose={onClose} title="To Watch List Empty" />;
    const bgImage = current.image || GENRE_ASSETS[current.genre.split(',')[0].trim()] || GENRE_ASSETS.Default;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-4">
            <button onClick={onClose} className="absolute top-8 right-8 text-white/50 hover:text-white p-2 rounded-full hover:bg-white/10 transition-all"><X size={32}/></button>
            <h2 className="absolute top-8 left-8 text-2xl font-black uppercase text-white/20 tracking-widest pointer-events-none">To Watch Queue</h2>
            <div className="flex items-center gap-8 w-full max-w-6xl">
                <button onClick={prev} className="hidden md:flex p-4 rounded-full bg-white/5 text-white/50 hover:bg-white/20 hover:text-white transition-all"><ArrowLeft size={32}/></button>
                <div className="flex-1 flex justify-center">
                    <AnimatePresence mode="wait">
                        <motion.div key={current.id} initial={{ x: 100, opacity: 0, scale: 0.8 }} animate={{ x: 0, opacity: 1, scale: 1 }} exit={{ x: -100, opacity: 0, scale: 0.8 }} transition={{ type: "spring", stiffness: 300, damping: 30 }} className="relative w-full max-w-md aspect-[2/3] bg-zinc-900 rounded-[3rem] overflow-hidden shadow-2xl border border-white/10">
                            <img src={bgImage} alt={current.title} className="absolute inset-0 w-full h-full object-cover opacity-80" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                                <span className="inline-block px-3 py-1 rounded-lg bg-blue-600 text-[10px] font-black uppercase tracking-widest mb-4">{current.type}</span>
                                <h2 className="text-4xl font-black leading-none mb-2">{current.title}</h2>
                                <p className="text-zinc-400 font-bold uppercase tracking-wider text-xs mb-6">{current.genre}</p>
                                <div className="flex gap-3">
                                    <button onClick={() => { onQuickStatus(current, 'watching'); onClose(); }} className="flex-1 py-3 bg-white text-black font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-transform flex items-center justify-center gap-2"><Play size={16} fill="currentColor"/> Start</button>
                                    <button onClick={() => onEdit(current)} className="p-3 bg-white/10 text-white rounded-xl hover:bg-white/20 backdrop-blur-md transition-colors"><Edit2 size={20} /></button>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
                <button onClick={next} className="hidden md:flex p-4 rounded-full bg-white/5 text-white/50 hover:bg-white/20 hover:text-white transition-all"><ArrowRight size={32}/></button>
            </div>
            <div className="absolute bottom-8 text-white/30 font-mono text-sm">{index + 1} / {items.length}</div>
        </motion.div>
    )
}

function OnHoldOverlay({ items, onClose, onEdit, onQuickStatus, onTogglePeak, onFocus }: { items: ContentItem[], onClose: () => void, onEdit: any, onQuickStatus: any, onTogglePeak: any, onFocus: any }) {
    return (
        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="fixed inset-0 z-50 bg-zinc-950/95 backdrop-blur-xl p-8 overflow-y-auto">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-12"><h2 className="text-3xl font-black uppercase text-white flex items-center gap-3"><Pause size={32} className="text-orange-500 fill-current"/> On Hold Shelf</h2><button onClick={onClose} className="p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors"><X size={24}/></button></div>
                {items.length === 0 ? <EmptyOverlay onClose={onClose} title="No Content On Hold" /> : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {items.map((item, i) => (
                            <DirectoryCard 
                                key={item.id} 
                                item={item} 
                                index={i} 
                                onEdit={onEdit} 
                                onDelete={undefined} // Distinct: No delete in On Hold view
                                onTogglePeak={onTogglePeak} 
                                onClick={() => onFocus(item)}
                                onPlay={() => onQuickStatus(item, 'watching')} // Special prop
                            />
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    )
}

function EmptyOverlay({ onClose, title }: { onClose: () => void, title: string }) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-zinc-500"><Archive size={64} className="mb-4 opacity-20"/><h3 className="text-2xl font-black uppercase tracking-widest mb-8">{title}</h3><button onClick={onClose} className="px-6 py-2 border border-zinc-700 rounded-full hover:bg-zinc-800 text-white transition-colors text-xs font-bold uppercase">Close</button></div>
    )
}

function FocusOverlay({ item, onClose, onEdit, onDelete, onTogglePeak }: { item: ContentItem, onClose: () => void, onEdit: any, onDelete: any, onTogglePeak: any }) {
    const bgImage = item.image || GENRE_ASSETS[item.genre.split(',')[0].trim()] || GENRE_ASSETS.Default;
    const isPeak = item.rating === 5;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-white/80 dark:bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
            <button onClick={onClose} className="absolute top-8 right-8 p-2 bg-black/10 dark:bg-white/10 rounded-full hover:bg-black/20 dark:hover:bg-white/20 text-zinc-900 dark:text-white transition-all"><X size={32}/></button>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="relative w-full max-w-4xl bg-white dark:bg-zinc-900 rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row h-auto max-h-[85vh] border border-zinc-200 dark:border-zinc-800">
                <div className="w-full md:w-1/2 h-64 md:h-auto relative shrink-0">
                    <img src={bgImage} alt={item.title} className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/60 to-transparent" />
                    <button onClick={(e) => { e.stopPropagation(); onTogglePeak(item); }} className={cn("absolute top-6 left-6 p-3 bg-black/40 backdrop-blur-md rounded-full hover:bg-yellow-500 text-white transition-all z-20", isPeak ? "text-yellow-400" : "text-white/70")}>
                        <Star size={24} fill={isPeak ? "currentColor" : "none"} />
                    </button>
                </div>
                <div className="w-full md:w-1/2 h-1/2 md:h-full p-8 md:p-12 flex flex-col overflow-y-auto custom-scrollbar">
                    <div className="mb-auto">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs font-black uppercase tracking-widest border border-purple-200 dark:border-purple-500/20">{item.type}</span>
                            <span className="px-3 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-xs font-bold uppercase tracking-widest">{item.status.replace('_', ' ')}</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black text-zinc-900 dark:text-white leading-[0.9] mb-4">{item.title}</h2>
                        <p className="text-zinc-500 font-bold uppercase tracking-wider text-sm mb-8">{item.genre}</p>
                        {(item.type === 'series' || item.type === 'anime') && (
                            <div className="flex items-center gap-4 text-sm font-bold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 p-4 rounded-xl mb-8">
                                <Tv size={20} /><span>Season {item.currentSeason}</span><span className="w-1 h-4 bg-zinc-300 dark:bg-zinc-700"/><span>Episode {item.currentEpisode}</span>
                            </div>
                        )}
                        <div className="bg-zinc-50 dark:bg-black/20 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                            <p className="text-[10px] font-black uppercase text-zinc-400 mb-2 tracking-widest">Personal Notes</p>
                            <p className="text-zinc-700 dark:text-zinc-300 italic text-base leading-relaxed">"{item.notes || "No notes added."}"</p>
                        </div>
                    </div>
                    <div className="flex gap-4 mt-8 pt-8 border-t border-zinc-100 dark:border-zinc-800 shrink-0">
                        <button onClick={onEdit} className="flex-1 py-4 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white rounded-2xl font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2"><Edit2 size={18}/> Edit</button>
                        <button onClick={onDelete} className="flex-1 py-4 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/50 rounded-2xl font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2"><Trash2 size={18}/> Archive</button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    )
}

function GenreSelector({ selected, onChange, onClose }: { selected: string[], onChange: (g: string[]) => void, onClose: () => void }) {
    const [search, setSearch] = useState("");
    const toggleGenre = (genre: string) => { if (selected.includes(genre)) { onChange(selected.filter(g => g !== genre)); } else { onChange([...selected, genre]); } };
    const filteredGenres = GENRE_LIST.filter(g => g.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="absolute top-full left-0 mt-2 w-full md:w-[400px] bg-white dark:bg-[#0F0F0F] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl z-50 p-4 overflow-hidden">
            <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-900 p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 mb-3"><Search size={16} className="text-zinc-400"/><input placeholder="Search genres..." className="bg-transparent w-full text-sm font-bold text-zinc-900 dark:text-white outline-none placeholder:text-zinc-500" value={search} onChange={(e) => setSearch(e.target.value)} autoFocus /></div>
            <div className="h-[200px] overflow-y-auto custom-scrollbar pr-2"><div className="flex flex-wrap gap-2">{filteredGenres.map(genre => (<button key={genre} onClick={() => toggleGenre(genre)} className={cn("px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-all", selected.includes(genre) ? "bg-purple-600 text-white border-purple-600 shadow-lg shadow-purple-500/20" : "bg-zinc-50 dark:bg-zinc-900 text-zinc-500 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600")}>{genre}</button>))}</div></div>
            <div className="mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-center"><span className="text-xs font-bold text-zinc-400">{selected.length} selected</span><button onClick={onClose} className="text-xs font-black uppercase text-purple-500 hover:underline">Done</button></div>
        </div>
    )
}

function ContentModal({ onClose, onSave, initialData }: { onClose:()=>void, onSave:(d:ContentItem)=>void, initialData?: ContentItem | null }) {
    const [form, setForm] = useState<ContentItem>(initialData || { title: '', type: 'movie', genre: '', platform: '', status: 'to_watch', currentSeason: 1, currentEpisode: 0, notes: '', rating: 0, image: '' });
    const [showGenrePicker, setShowGenrePicker] = useState(false);
    const selectedGenres = form.genre ? form.genre.split(',').map((g: string) => g.trim()).filter(Boolean) : [];
    const isSeries = form.type === 'series' || form.type === 'anime';
    const handleGenreChange = (newGenres: string[]) => { setForm({ ...form, genre: newGenres.join(', ') }); };
    const handleSearchCover = () => { if (!form.title) return alert("Type a title first!"); const query = `${form.title} ${form.type} poster wallpaper`; window.open(`https://www.google.com/search?tbm=isch&q=${encodeURIComponent(query)}`, '_blank'); };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl">
            <motion.div initial={{scale:0.95, opacity:0}} animate={{scale:1, opacity:1}} className="bg-white dark:bg-[#0A0A0A] w-full max-w-2xl rounded-[2.5rem] p-8 border border-zinc-200 dark:border-white/10 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center mb-6 shrink-0"><h2 className="text-2xl font-black uppercase text-zinc-900 dark:text-white flex items-center gap-3"><Edit2 size={24} className="text-purple-600 dark:text-purple-500" /> {initialData ? "Update Entry" : "New Entry"}</h2><button onClick={onClose}><X size={24} className="text-zinc-400 hover:text-black dark:hover:text-white transition-colors"/></button></div>
                <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2 group"><label className="text-[10px] font-bold uppercase text-zinc-500 mb-1 block tracking-wider">Title</label><input autoFocus placeholder="e.g. Inception" className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl font-black text-zinc-900 dark:text-white outline-none focus:border-purple-500 transition-all text-lg" value={form.title} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, title: e.target.value})} /></div>
                        <div><label className="text-[10px] font-bold uppercase text-zinc-500 mb-1 block tracking-wider">Type</label><select className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl font-bold text-zinc-900 dark:text-white outline-none appearance-none" value={form.type} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setForm({...form, type: e.target.value})}><option value="movie">Movie</option><option value="series">Series</option><option value="anime">Anime</option><option value="documentary">Docu</option></select></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative"><label className="text-[10px] font-bold uppercase text-zinc-500 mb-1 block tracking-wider">Genres</label><div onClick={() => setShowGenrePicker(!showGenrePicker)} className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl font-bold text-zinc-900 dark:text-white cursor-pointer flex justify-between items-center hover:border-purple-500 transition-colors"><span className="truncate">{form.genre || "Select Genres..."}</span><ChevronDown size={16} className="text-zinc-500"/></div>{showGenrePicker && <GenreSelector selected={selectedGenres} onChange={handleGenreChange} onClose={() => setShowGenrePicker(false)} />}</div>
                        <div><label className="text-[10px] font-bold uppercase text-zinc-500 mb-1 block tracking-wider">Platform</label><input placeholder="Netflix, Prime..." className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl font-bold text-zinc-900 dark:text-white outline-none" value={form.platform} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, platform: e.target.value})} /></div>
                    </div>
                    <div><label className="text-[10px] font-bold uppercase text-zinc-500 mb-1 block tracking-wider flex justify-between"><span>Poster URL (Optional)</span><button onClick={handleSearchCover} className="text-purple-500 hover:underline flex items-center gap-1"><Search size={10}/> Find on Google</button></label><div className="flex gap-2"><input placeholder="Paste image address here..." className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl font-medium text-zinc-900 dark:text-white outline-none text-sm" value={form.image || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, image: e.target.value})} />{form.image && <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-zinc-700">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={form.image} alt="prev" className="w-full h-full object-cover" /></div>}</div><p className="text-[10px] text-zinc-500 mt-1 italic">*Leave empty for auto-generated cinematic theme.</p></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="text-[10px] font-bold uppercase text-zinc-500 mb-1 block tracking-wider">Status</label><select className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl font-bold text-zinc-900 dark:text-white outline-none appearance-none" value={form.status} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setForm({...form, status: e.target.value})}><option value="to_watch">To Watch</option><option value="watching">Watching</option><option value="on_hold">On Hold</option><option value="completed">Completed</option></select></div>
                        {isSeries ? (<div className="grid grid-cols-2 gap-2"><div><label className="text-[10px] font-bold uppercase text-zinc-500 mb-1 block">Season(s)</label><input type="number" className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl font-bold text-zinc-900 dark:text-white outline-none" value={form.currentSeason} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, currentSeason: parseInt(e.target.value) || 0})} /></div><div><label className="text-[10px] font-bold uppercase text-zinc-500 mb-1 block">Episode(s)</label><input type="number" className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl font-bold text-zinc-900 dark:text-white outline-none" value={form.currentEpisode} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, currentEpisode: parseInt(e.target.value) || 0})} /></div></div>) : <div />}
                    </div>
                    <div><label className="text-[10px] font-bold uppercase text-zinc-500 mb-1 block tracking-wider">Personal Notes</label><textarea placeholder="Why you liked it? Or why you dropped it?" className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl font-medium text-zinc-900 dark:text-white outline-none h-24 resize-none" value={form.notes} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm({...form, notes: e.target.value})} /></div>
                </div>
                <div className="flex gap-3 mt-6 shrink-0"><button onClick={onClose} className="flex-1 py-4 font-bold text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-2xl transition-colors uppercase tracking-wider">Cancel</button><button onClick={() => onSave(form)} className="flex-1 py-4 bg-black dark:bg-white text-white dark:text-black font-black rounded-2xl hover:scale-[1.02] transition-transform tracking-widest shadow-xl uppercase">Save Entry</button></div>
            </motion.div>
        </div>
    )
}




