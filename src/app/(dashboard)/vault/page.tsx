"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import {
  Folder, FileText, Link as LinkIcon, Lightbulb, Package, 
  Plus, Search, X, Tag, ExternalLink, 
  Trash2, Edit2, ChevronRight, Hash, Globe, Save, Copy, Check, 
  LayoutGrid, List as ListIcon, CornerUpLeft, Layers
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { getVaultItems, upsertVaultItem, deleteVaultItem } from "@/lib/actions/vault";

function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

// --- UTILS ---
const getSafeLink = (url: string) => {
    if (!url) return "#";
    return url.startsWith("http") ? url : `https://${url}`;
};

// --- CONFIGURATION ---
const CATEGORIES = [
  "Tech & Code", "Finance", "Design", "Life & Health", 
  "Startup", "Ideas", "Resources", "Learning", 
  "Movies & Ent", "Random Gold", "Project X", "Archive"
];

// Consistent Config Name
const TYPE_CONFIG: Record<string, { icon: any, color: string, bg: string, border: string, label: string }> = {
  link: { icon: Globe, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20", label: "Link" },
  note: { icon: FileText, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20", label: "Note" },
  idea: { icon: Lightbulb, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20", label: "Idea" },
  resource: { icon: Package, color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20", label: "Resource" },
};

// --- TYPES ---
interface VaultItem {
    id?: string;
    title: string;
    type: 'link' | 'note' | 'idea' | 'resource';
    category: string;
    tags: string;
    description: string;
    source: string;
    content: string; // Used for Notes OR Multi-Links JSON
    createdAt?: string;
}

interface MultiLink {
    label: string;
    url: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function VaultOS() {
    const [items, setItems] = useState<VaultItem[]>([]);
    const [view, setView] = useState<'root' | 'folder'>('root');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [selectedItem, setSelectedItem] = useState<VaultItem | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const data: any = await getVaultItems();
            setItems(data);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => { fetchData(); }, []);

    // 1. Dynamic Folders (Only show categories that have items)
    const uniqueCategories = Array.from(new Set(items.map(i => i.category))).sort();

    // 2. Filter Items
    const folderItems = items.filter(i => 
        i.category === activeCategory && 
        (i.title.toLowerCase().includes(search.toLowerCase()) || i.tags?.toLowerCase().includes(search.toLowerCase()))
    );

    // CRUD Handlers
    const handleSave = async (data: VaultItem) => {
        const newItem = { ...data, id: data.id || `temp-${Date.now()}` };
        if(data.id) {
            setItems(prev => prev.map(i => i.id === data.id ? newItem : i));
        } else {
            setItems(prev => [newItem, ...prev]);
        }
        await upsertVaultItem(data);
        fetchData();
        setIsModalOpen(false);
        setSelectedItem(null);
    };

    const handleDelete = async (id: string) => {
        if(confirm("Permanently delete this file?")) {
            setItems(prev => prev.filter(i => i.id !== id));
            await deleteVaultItem(id);
            setSelectedItem(null);
        }
    };

    return (
        <div className="min-h-screen bg-[#F2F4F7] dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 font-sans p-6 md:p-10 overflow-hidden relative transition-colors duration-500 selection:bg-blue-500/30">
            
            {/* Background */}
            <div className="fixed inset-0 pointer-events-none z-0 opacity-40 dark:opacity-20">
                <div className="absolute inset-0 bg-[radial-gradient(#a1a1aa_1px,transparent_1px)] [background-size:20px_20px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
            </div>

            {/* Header */}
            <header className="relative z-20 flex flex-col md:flex-row justify-between items-end gap-6 mb-10 pb-6 border-b border-zinc-200 dark:border-white/10">
                <div>
                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">
                        <Layers size={14} /> File System
                    </motion.div>
                    <div className="flex items-center gap-2">
                        <span 
                            onClick={() => { setView('root'); setActiveCategory(null); }}
                            className={cn("text-3xl md:text-5xl font-black tracking-tighter cursor-pointer hover:text-blue-600 transition-colors", view === 'root' ? "text-zinc-900 dark:text-white" : "text-zinc-400")}
                        >
                            VAULT
                        </span>
                        {activeCategory && (
                            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2">
                                <ChevronRight className="text-zinc-400 h-6 w-6 md:h-8 md:w-8" />
                                <span className="text-3xl md:text-5xl font-black tracking-tighter text-blue-600 dark:text-blue-500 truncate max-w-[200px] md:max-w-md">
                                    {activeCategory.toUpperCase()}
                                </span>
                            </motion.div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    {/* Search */}
                    <div className="relative group flex-1 md:flex-none w-full md:w-64">
                        <div className="relative flex items-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-2.5 shadow-sm transition-all focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500">
                            <Search size={16} className="text-zinc-400 mr-3"/>
                            <input 
                                placeholder="Search files..." 
                                className="bg-transparent w-full outline-none text-sm font-medium placeholder:text-zinc-400 text-zinc-900 dark:text-white"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                    
                    {view === 'folder' && (
                        <div className="flex bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-1 rounded-lg shadow-sm">
                            <button onClick={() => setViewMode('grid')} className={cn("p-2 rounded-md transition-all", viewMode === 'grid' ? "bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white" : "text-zinc-400")}><LayoutGrid size={16}/></button>
                            <button onClick={() => setViewMode('list')} className={cn("p-2 rounded-md transition-all", viewMode === 'list' ? "bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white" : "text-zinc-400")}><ListIcon size={16}/></button>
                        </div>
                    )}

                    <motion.button 
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => { setSelectedItem(null); setIsModalOpen(true); }}
                        className="bg-zinc-900 dark:bg-white text-white dark:text-black px-5 py-3 rounded-xl font-bold uppercase tracking-wider text-xs shadow-xl shadow-black/10 flex items-center gap-2"
                    >
                        <Plus size={18}/> <span className="hidden md:inline">New File</span>
                    </motion.button>
                </div>
            </header>

            {/* MAIN CONTENT */}
            <main className="relative z-10 min-h-[60vh]">
                <AnimatePresence mode="wait">
                    
                    {/* VIEW 1: DYNAMIC FOLDERS */}
                    {view === 'root' && (
                        <motion.div 
                            key="root"
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8"
                        >
                            {uniqueCategories.map((cat, i) => (
                                <RealFolderCard 
                                    key={cat} 
                                    name={cat} 
                                    count={items.filter(item => item.category === cat).length}
                                    index={i}
                                    onClick={() => { setActiveCategory(cat); setView('folder'); }}
                                />
                            ))}

                            {uniqueCategories.length === 0 && !loading && (
                                <motion.div 
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                    className="col-span-full flex flex-col items-center justify-center py-20 text-zinc-400 border-2 border-dashed border-zinc-300 dark:border-zinc-800 rounded-[2rem]"
                                >
                                    <Folder size={64} className="mb-4 text-zinc-300 dark:text-zinc-700"/>
                                    <h3 className="text-lg font-bold text-zinc-500">Vault is Empty</h3>
                                    <p className="text-sm mb-6">Create your first item to generate a folder.</p>
                                    <button onClick={() => { setSelectedItem(null); setIsModalOpen(true); }} className="text-blue-500 font-bold hover:underline">
                                        + Create Item
                                    </button>
                                </motion.div>
                            )}
                        </motion.div>
                    )}

                    {/* VIEW 2: FILES */}
                    {view === 'folder' && (
                        <motion.div 
                            key="folder"
                            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                            className="w-full"
                        >
                            <button onClick={() => { setView('root'); setActiveCategory(null); }} className="mb-6 flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors text-xs font-bold uppercase tracking-wider group">
                                <div className="p-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800 group-hover:bg-zinc-300 dark:group-hover:bg-zinc-700 transition-colors"><CornerUpLeft size={14}/></div>
                                Back to Root
                            </button>

                            <div className={cn(
                                "grid gap-5",
                                viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
                            )}>
                                {folderItems.map((item, i) => (
                                    <FileCard 
                                        key={item.id} 
                                        item={item} 
                                        index={i}
                                        viewMode={viewMode}
                                        onClick={() => setSelectedItem(item)}
                                    />
                                ))}
                            </div>
                            
                            {folderItems.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-32 text-zinc-400">
                                    <p className="text-sm font-medium uppercase tracking-widest">This folder is empty.</p>
                                </div>
                            )}
                        </motion.div>
                    )}

                </AnimatePresence>
            </main>

            {/* MODALS */}
            <AnimatePresence>
                {isModalOpen && (
                    <EditModal 
                        onClose={() => setIsModalOpen(false)} 
                        onSave={handleSave} 
                        initialData={selectedItem} 
                        activeCategory={activeCategory}
                    />
                )}
                {selectedItem && !isModalOpen && (
                    <DetailOverlay 
                        item={selectedItem} 
                        onClose={() => setSelectedItem(null)} 
                        onEdit={() => setIsModalOpen(true)}
                        onDelete={() => handleDelete(selectedItem.id!)}
                    />
                )}
            </AnimatePresence>

        </div>
    );
}

// ============================================================================
// UI: FOLDER CARD (MANILA STYLE)
// ============================================================================
function RealFolderCard({ name, count, onClick, index }: { name: string, count: number, onClick: () => void, index: number }) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={onClick}
            whileHover={{ y: -5 }}
            className="group cursor-pointer relative"
        >
            <div className="absolute top-0 left-0 w-[40%] h-8 bg-blue-200 dark:bg-blue-900/40 rounded-t-xl border-t border-l border-r border-blue-300 dark:border-blue-700/50 transition-colors group-hover:bg-blue-300 dark:group-hover:bg-blue-800/50" />
            
            <div className="relative mt-4 bg-blue-50 dark:bg-[#0F1218] border border-blue-200 dark:border-blue-900/30 rounded-xl rounded-tl-none p-6 shadow-sm group-hover:shadow-xl group-hover:shadow-blue-500/10 transition-all aspect-[4/3] flex flex-col justify-between overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-blue-200 dark:bg-blue-900/50" />
                <div className="absolute top-0 left-0 w-[40%] h-[2px] bg-white dark:bg-[#0F1218] -mt-[1px] z-10" />

                <div className="flex justify-between items-start z-10">
                    <div className="p-3 bg-white dark:bg-blue-500/10 rounded-xl border border-blue-100 dark:border-blue-500/20 text-blue-500 group-hover:scale-110 transition-transform">
                        <Folder size={28} fill="currentColor" className="opacity-20 group-hover:opacity-100 transition-opacity" />
                    </div>
                    {count > 0 && <span className="text-[10px] font-bold bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 px-2 py-0.5 rounded-md text-zinc-500 dark:text-zinc-400">{count}</span>}
                </div>

                <div className="z-10">
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white leading-tight mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">{name}</h3>
                    <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Folder
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

// ============================================================================
// UI: FILE CARD
// ============================================================================
function FileCard({ item, onClick, index, viewMode }: { item: VaultItem, onClick: () => void, index: number, viewMode: 'grid'|'list' }) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const theme = (TYPE_CONFIG as any)[item.type] || TYPE_CONFIG.note;
    const Icon = theme.icon;

    if (viewMode === 'list') {
        return (
            <motion.div 
                layoutId={`card-${item.id}`}
                onClick={onClick}
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.03 }}
                className="group flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 hover:border-blue-500/30 hover:shadow-lg transition-all cursor-pointer"
            >
                <div className={cn("p-2.5 rounded-xl border shrink-0", theme.bg, theme.color, theme.border)}>
                    <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-zinc-900 dark:text-white truncate">{item.title}</h4>
                    <div className="flex gap-3 text-[10px] text-zinc-500 mt-0.5">
                        <span className="uppercase tracking-wider font-bold">{item.type}</span>
                        <span>•</span>
                        <span className="truncate">{item.description || "No preview"}</span>
                    </div>
                </div>
                <ChevronRight size={16} className="text-zinc-300 dark:text-zinc-700 group-hover:text-blue-500 transition-colors"/>
            </motion.div>
        )
    }

    return (
        <motion.div 
            layout
            onClick={onClick}
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.05 }}
            whileHover={{ y: -5 }}
            className="group relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-blue-500/30 p-6 rounded-[2rem] cursor-pointer transition-all hover:shadow-xl flex flex-col h-52 overflow-hidden"
        >
            <div className="flex justify-between items-start mb-4">
                <div className={cn("p-3 rounded-2xl border transition-colors", theme.bg, theme.color, theme.border)}>
                    <Icon size={20} />
                </div>
                {item.source && <ExternalLink size={16} className="text-zinc-300 dark:text-zinc-600 group-hover:text-blue-500 transition-colors" />}
            </div>

            <h4 className="font-bold text-lg text-zinc-900 dark:text-white leading-tight mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{item.title}</h4>
            
            <div className="mt-auto">
                <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mb-3 font-medium leading-relaxed">
                    {item.description || "No description provided."}
                </p>
                <div className="flex flex-wrap gap-2">
                    {item.tags?.split(',').slice(0, 2).map((tag, i) => (
                        <span key={i} className="text-[10px] font-bold text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md border border-zinc-200 dark:border-zinc-700">#{tag.trim()}</span>
                    ))}
                </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/0 to-white/40 dark:from-white/0 dark:via-white/0 dark:to-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        </motion.div>
    )
}

// ============================================================================
// UI: DETAIL OVERLAY
// ============================================================================
function DetailOverlay({ item, onClose, onEdit, onDelete }: { item: VaultItem, onClose: () => void, onEdit: () => void, onDelete: () => void }) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const theme = (TYPE_CONFIG as any)[item.type] || TYPE_CONFIG.note;
    const Icon = theme.icon;
    const [copied, setCopied] = useState(false);

    // Helper for Multi-Links
    const getMultiLinks = (): MultiLink[] | null => {
        if(item.type !== 'link' || !item.content) return null;
        try {
            const parsed = JSON.parse(item.content);
            if(Array.isArray(parsed)) return parsed;
        } catch { return null; }
        return null;
    };

    const multiLinks = getMultiLinks();

    const handleCopy = () => {
        if(item.content && !multiLinks) {
            navigator.clipboard.writeText(item.content);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-white/80 dark:bg-black/80 backdrop-blur-xl"
            />
            
            <motion.div 
                layoutId={`card-${item.id}`}
                className="relative w-full max-w-3xl bg-white dark:bg-[#09090b] rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col overflow-hidden max-h-[85vh]"
            >
                {/* Header */}
                <div className="flex items-start justify-between p-8 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                    <div className="flex gap-6">
                        <div className={cn("p-5 rounded-3xl h-fit shadow-sm border", theme.bg, theme.color, theme.border)}>
                            <Icon size={36} />
                        </div>
                        <div className="min-w-0">
                            <div className="flex gap-2 mb-3">
                                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-zinc-200 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">{item.category}</span>
                                <span className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-opacity-20", theme.bg, theme.color)}>{item.type}</span>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-black text-zinc-900 dark:text-white leading-tight break-words">{item.title}</h2>
                            {item.source && (
                                <a href={getSafeLink(item.source)} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline mt-2 text-sm font-bold w-fit">
                                    <Globe size={14} /> {new URL(getSafeLink(item.source)).hostname} <ExternalLink size={12}/>
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-8 md:p-10 custom-scrollbar">
                    {/* Description */}
                    {item.description && (
                        <div className="mb-10">
                            <h3 className="text-xs font-black uppercase text-zinc-400 mb-3 tracking-widest flex items-center gap-2"><Lightbulb size={14}/> Summary</h3>
                            <p className="text-lg text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium whitespace-pre-wrap break-words">
                                {item.description}
                            </p>
                        </div>
                    )}

                    {/* Multi-Links */}
                    {multiLinks ? (
                         <div className="mb-10">
                            <h3 className="text-xs font-black uppercase text-zinc-400 mb-4 tracking-widest flex items-center gap-2"><LinkIcon size={14}/> Related Links</h3>
                            <div className="grid gap-3">
                                {multiLinks.map((link, idx) => (
                                    <a 
                                        key={idx} 
                                        href={getSafeLink(link.url)} 
                                        target="_blank" 
                                        rel="noreferrer"
                                        className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl hover:border-blue-500/50 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-white dark:bg-zinc-800 rounded-lg text-blue-500"><Globe size={16}/></div>
                                            <div>
                                                <div className="font-bold text-sm text-zinc-900 dark:text-white">{link.label}</div>
                                                <div className="text-xs text-zinc-500 truncate max-w-[200px] sm:max-w-xs">{link.url}</div>
                                            </div>
                                        </div>
                                        <ExternalLink size={14} className="text-zinc-400 group-hover:text-blue-500"/>
                                    </a>
                                ))}
                            </div>
                        </div>
                    ) : item.content ? (
                        <div className="relative group mb-10">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xs font-black uppercase text-zinc-400 tracking-widest flex items-center gap-2"><FileText size={14}/> Content</h3>
                                <button onClick={handleCopy} className="text-xs font-bold text-blue-500 hover:text-blue-600 flex items-center gap-1 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-lg transition-colors">
                                    {copied ? <Check size={14}/> : <Copy size={14}/>} {copied ? "Copied" : "Copy"}
                                </button>
                            </div>
                            <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 text-sm font-mono text-zinc-600 dark:text-zinc-300 whitespace-pre-wrap leading-7 selection:bg-blue-500/30 break-words">
                                {item.content}
                            </div>
                        </div>
                    ) : null}

                    {/* Tags */}
                    {item.tags && (
                        <div className="mt-8 pt-8 border-t border-zinc-100 dark:border-zinc-800">
                            <h3 className="text-xs font-black uppercase text-zinc-400 mb-4 tracking-widest">Metadata</h3>
                            <div className="flex flex-wrap gap-2">
                                {item.tags.split(',').map((tag, i) => (
                                    <span key={i} className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs font-bold flex items-center gap-1 border border-zinc-200 dark:border-zinc-700">
                                        <Hash size={12} className="opacity-50"/> {tag.trim()}
                                    </span>
                                ))}
                            </div>
                            <div className="mt-4 text-[10px] font-mono text-zinc-400">
                                Created: {new Date(item.createdAt || "").toLocaleDateString()}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/80 backdrop-blur-md flex justify-end gap-3 z-10">
                     <button onClick={onDelete} className="p-3 hover:bg-red-50 dark:hover:bg-red-900/20 text-zinc-400 hover:text-red-500 rounded-xl transition-all border border-transparent hover:border-red-200 dark:hover:border-red-800/30">
                        <Trash2 size={20}/>
                    </button>
                    <button onClick={onEdit} className="p-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-zinc-400 hover:text-blue-500 rounded-xl transition-all border border-transparent hover:border-blue-200 dark:hover:border-blue-800/30">
                        <Edit2 size={20}/>
                    </button>
                    <button onClick={onClose} className="px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-black font-bold text-sm rounded-xl hover:scale-105 transition-transform shadow-lg">
                        Close
                    </button>
                </div>
            </motion.div>
        </div>
    )
}

// ============================================================================
// COMPONENT: ADD/EDIT MODAL
// ============================================================================
function EditModal({ onClose, onSave, initialData, activeCategory }: { onClose: () => void, onSave: (d: any) => void, initialData?: any, activeCategory: string | null }) {
    const [form, setForm] = useState(initialData || {
        title: "", type: "link", category: activeCategory && activeCategory !== "Tech & Code" ? activeCategory : "Tech & Code", tags: "", description: "", source: "", content: ""
    });

    const [links, setLinks] = useState<MultiLink[]>(() => {
        if(initialData?.type === 'link' && initialData.content) {
            try { return JSON.parse(initialData.content); } catch { return []; }
        }
        return [];
    });

    const addLinkRow = () => setLinks([...links, { label: "", url: "" }]);
    const removeLinkRow = (i: number) => setLinks(links.filter((_, idx) => idx !== i));
    const updateLink = (i: number, field: 'label'|'url', val: string) => {
        const newLinks = [...links];
        newLinks[i][field] = val;
        setLinks(newLinks);
    };

    const handleSaveInternal = () => {
        const finalData = { ...form };
        if(form.type === 'link' && links.length > 0) {
            finalData.content = JSON.stringify(links);
        }
        onSave(finalData);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
                initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} 
                className="bg-white dark:bg-[#0F0F0F] w-full max-w-2xl rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col max-h-[90vh]"
            >
                <div className="flex justify-between items-center p-8 border-b border-zinc-100 dark:border-zinc-800">
                    <h2 className="text-2xl font-black text-zinc-900 dark:text-white flex items-center gap-3">
                        {initialData ? <Edit2 size={24} className="text-blue-500"/> : <Plus size={24} className="text-blue-500"/>}
                        {initialData ? "Edit Item" : "New Item"}
                    </h2>
                    <button onClick={onClose} className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-full hover:rotate-90 transition-transform"><X size={20} className="text-zinc-500"/></button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                    
                    {/* Basic Info */}
                    <div className="space-y-2">
                        <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">Title</label>
                        <input 
                            autoFocus 
                            className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 text-lg font-bold text-zinc-900 dark:text-white outline-none focus:border-blue-500 transition-all placeholder:text-zinc-300 dark:placeholder:text-zinc-700" 
                            value={form.title} 
                            onChange={e => setForm({...form, title: e.target.value})} 
                            placeholder="e.g. Project Resources"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                         <div className="space-y-2">
                            <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">Category</label>
                            <div className="relative">
                                <select 
                                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 text-zinc-900 dark:text-white outline-none appearance-none font-bold text-sm" 
                                    value={form.category} 
                                    onChange={e => setForm({...form, category: e.target.value})}
                                >
                                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                <ChevronRight className="absolute right-4 top-4 rotate-90 text-zinc-400" size={16}/>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">Type</label>
                            <div className="flex gap-2">
                                {Object.keys(TYPE_CONFIG).map(t => {
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    const Icon = (TYPE_CONFIG as any)[t].icon;
                                    return (
                                        <button 
                                            key={t} 
                                            onClick={() => setForm({...form, type: t})} 
                                            className={cn(
                                                "p-4 rounded-2xl border flex-1 flex justify-center transition-all", 
                                                form.type === t 
                                                    ? "bg-zinc-900 dark:bg-white border-transparent text-white dark:text-black shadow-lg" 
                                                    : "border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                            )}
                                            title={t}
                                        >
                                            <Icon size={20}/>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">Description</label>
                        <textarea 
                            className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 text-zinc-900 dark:text-white outline-none focus:border-blue-500 transition-all font-medium text-sm h-24 resize-none" 
                            value={form.description} 
                            onChange={e => setForm({...form, description: e.target.value})} 
                            placeholder="Brief summary..."
                        />
                    </div>

                    <div className="space-y-2">
                         <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">Tags (Comma Sep)</label>
                         <div className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4">
                            <Tag size={18} className="text-zinc-400"/>
                            <input 
                                className="bg-transparent w-full text-zinc-900 dark:text-white outline-none font-bold text-sm" 
                                value={form.tags} 
                                onChange={e => setForm({...form, tags: e.target.value})} 
                                placeholder="react, design, ai"
                            />
                        </div>
                    </div>

                    {/* DYNAMIC FIELDS BASED ON TYPE */}
                    {form.type === 'link' ? (
                        <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                             <div className="flex justify-between items-center">
                                <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">Link Collection</label>
                                <button onClick={addLinkRow} className="text-xs font-bold text-blue-500 hover:underline flex items-center gap-1"><Plus size={12}/> Add Link</button>
                             </div>
                             
                             {/* Primary Source (Main Link) */}
                             <div className="flex items-center gap-2">
                                <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg"><Globe size={16} className="text-zinc-500"/></div>
                                <input 
                                    className="w-full bg-transparent border-b border-zinc-200 dark:border-zinc-800 p-2 text-sm font-mono text-zinc-900 dark:text-white outline-none"
                                    placeholder="Main Source URL..."
                                    value={form.source}
                                    onChange={e => setForm({...form, source: e.target.value})}
                                />
                             </div>

                             {/* Additional Links */}
                             {links.map((link, i) => (
                                 <div key={i} className="flex gap-2 items-center">
                                     <input 
                                        className="flex-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-sm font-medium"
                                        placeholder="Label (e.g. Docs)"
                                        value={link.label}
                                        onChange={e => updateLink(i, 'label', e.target.value)}
                                     />
                                     <input 
                                        className="flex-[2] bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-sm font-mono"
                                        placeholder="https://..."
                                        value={link.url}
                                        onChange={e => updateLink(i, 'url', e.target.value)}
                                     />
                                     <button onClick={() => removeLinkRow(i)} className="p-3 text-zinc-400 hover:text-red-500"><Trash2 size={16}/></button>
                                 </div>
                             ))}
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">Content</label>
                            <textarea 
                                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 text-zinc-900 dark:text-white outline-none focus:border-blue-500 transition-all font-mono text-sm h-48 resize-none leading-relaxed" 
                                value={form.content} 
                                onChange={e => setForm({...form, content: e.target.value})} 
                                placeholder="Write your full notes here..."
                            />
                        </div>
                    )}

                </div>

                <div className="p-8 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-4 bg-zinc-50/50 dark:bg-zinc-900/50 rounded-b-[2.5rem]">
                    <button onClick={onClose} className="px-6 py-3 rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-white font-bold text-sm transition-colors">Cancel</button>
                    <button onClick={handleSaveInternal} className="px-8 py-3 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-black hover:scale-105 transition-transform font-black text-sm shadow-xl flex items-center gap-2">
                        <Save size={18}/> Save to Vault
                    </button>
                </div>
            </motion.div>
        </div>
    )
}