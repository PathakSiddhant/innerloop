"use client";
import React, { useRef } from "react";
import { useScroll, useTransform, motion } from "framer-motion";
import { Search, Bell, Activity, GitCommit, Trophy } from "lucide-react";

export function MacbookScroll() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const scale = useTransform(scrollYProgress, [0, 0.5], [0.8, 1]);
  const rotateX = useTransform(scrollYProgress, [0, 0.5], [20, 0]);
  const y = useTransform(scrollYProgress, [0, 0.5], [100, 0]);

  return (
    <div ref={ref} className="min-h-[120vh] bg-zinc-50 dark:bg-[#050505] relative flex flex-col justify-center items-center py-40 overflow-hidden">
      
      {/* Section Header */}
      <div className="text-center mb-20 px-4 z-10">
        <h2 className="text-4xl md:text-6xl font-black text-zinc-900 dark:text-white mb-6 tracking-tighter">
            THE <span className="text-indigo-600">COMMAND CENTER</span>
        </h2>
        <p className="text-lg text-zinc-500 max-w-2xl mx-auto">
            Experience your digital life in high resolution.
        </p>
      </div>

      {/* THE MACBOOK */}
      <motion.div 
        style={{ scale, rotateX, y }}
        className="relative w-[95%] max-w-6xl aspect-[16/10] perspective-[1000px] z-20"
      >
         {/* Lid */}
         <div className="relative bg-[#1a1a1a] rounded-[24px] p-2 md:p-4 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border border-zinc-800">
            {/* Camera */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-4 w-32 bg-[#1a1a1a] rounded-b-xl z-30 flex justify-center items-center">
                <div className="w-1.5 h-1.5 rounded-full bg-[#333] mb-1"></div>
            </div>

            {/* Screen */}
            <div className="bg-white dark:bg-[#0A0A0A] rounded-[16px] overflow-hidden w-full h-full border border-zinc-800/50 relative flex flex-col">
                
                {/* 1. Header */}
                <div className="h-14 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between px-6 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md sticky top-0 z-10 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="flex gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-red-500"/>
                            <div className="w-3 h-3 rounded-full bg-yellow-500"/>
                            <div className="w-3 h-3 rounded-full bg-green-500"/>
                        </div>
                        <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-700 mx-2"></div>
                        <span className="text-sm font-bold text-zinc-500">Nexus OS</span>
                    </div>
                    <div className="flex gap-4 text-zinc-400">
                        <Search size={18}/>
                        <Bell size={18}/>
                        <div className="w-8 h-8 rounded-full bg-indigo-500"></div>
                    </div>
                </div>

                {/* 2. Content */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar */}
                    <div className="hidden md:flex w-64 border-r border-zinc-100 dark:border-zinc-800 flex-col p-4 gap-2 bg-zinc-50/50 dark:bg-black/20">
                        {['Dashboard', 'Fitness', 'Sports', 'Dev', 'Vault', 'Settings'].map((item, i) => (
                            <div key={i} className={`px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-3 ${i===0 ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800'}`}>
                                {item}
                            </div>
                        ))}
                    </div>

                    {/* Dashboard Grid */}
                    <div className="flex-1 p-8 overflow-y-auto bg-zinc-50 dark:bg-[#050505]">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            
                            {/* Widget 1 */}
                            <div className="p-6 rounded-3xl bg-white dark:bg-[#111] border border-zinc-200 dark:border-zinc-800 shadow-sm hover:border-indigo-500/50 transition-colors">
                                <div className="flex justify-between mb-4">
                                    <div className="p-3 bg-emerald-100 dark:bg-emerald-900/20 rounded-2xl text-emerald-600"><Activity/></div>
                                    <span className="text-xs font-bold bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded text-zinc-500 h-fit">Today</span>
                                </div>
                                <h3 className="text-3xl font-black text-zinc-900 dark:text-white">2,400</h3>
                                <p className="text-zinc-500 font-medium">Calories Burned</p>
                            </div>

                            {/* Widget 2 */}
                            <div className="p-6 rounded-3xl bg-white dark:bg-[#111] border border-zinc-200 dark:border-zinc-800 shadow-sm hover:border-indigo-500/50 transition-colors">
                                <div className="flex justify-between mb-4">
                                    <div className="p-3 bg-indigo-100 dark:bg-indigo-900/20 rounded-2xl text-indigo-600"><GitCommit/></div>
                                    <span className="text-xs font-bold bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded text-zinc-500 h-fit">GitHub</span>
                                </div>
                                <h3 className="text-3xl font-black text-zinc-900 dark:text-white">12</h3>
                                <p className="text-zinc-500 font-medium">Commits Pushed</p>
                            </div>

                            {/* Widget 3 */}
                            <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-700 text-white shadow-xl">
                                <div className="flex justify-between mb-4">
                                    <div className="p-3 bg-white/20 rounded-2xl"><Trophy/></div>
                                    <span className="text-xs font-bold bg-red-500 px-2 py-1 rounded text-white h-fit animate-pulse">LIVE</span>
                                </div>
                                <h3 className="text-3xl font-black">IND vs AUS</h3>
                                <p className="text-white/80 font-medium">240/3 (42.1 Ov)</p>
                            </div>

                            {/* Large Graph */}
                            <div className="col-span-1 md:col-span-3 h-64 bg-white dark:bg-[#111] rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-8 flex items-end gap-3 relative overflow-hidden">
                                <p className="absolute top-6 left-6 font-bold text-zinc-900 dark:text-white">Activity Velocity</p>
                                {[40, 70, 50, 90, 60, 80, 45, 75, 55, 85, 65, 95, 70, 50, 80, 60].map((h, i) => (
                                    <div key={i} className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-t-lg hover:bg-indigo-500 transition-colors duration-300" style={{ height: `${h}%` }} />
                                ))}
                            </div>

                        </div>
                    </div>
                </div>
            </div>
         </div>

         {/* Keyboard Base */}
         <div className="relative mx-auto bg-[#c7c7c7] dark:bg-[#1a1a1a] w-[120%] -ml-[10%] h-4 md:h-8 rounded-b-[30px] shadow-2xl z-10 border-t border-zinc-400 dark:border-zinc-700">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-2 bg-zinc-400 dark:bg-zinc-800 rounded-b-lg"></div>
         </div>
      </motion.div>
    </div>
  );
}