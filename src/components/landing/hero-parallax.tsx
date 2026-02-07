"use client";
import React, { useRef } from "react";
import { useScroll, useTransform, motion } from "framer-motion";
import { ChevronRight, Zap } from "lucide-react";
import Link from "next/link";

export function HeroParallax() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.5], [0, 50]);

  return (
    // FIX: Increased padding to 'pt-32 md:pt-48'. 
    // This pushes content down perfectly below the navbar.
    <div ref={containerRef} className="min-h-[90vh] bg-zinc-50 dark:bg-black overflow-hidden flex flex-col items-center justify-center pt-32 md:pt-48 pb-20 relative">
      
      {/* Dynamic Background Grid */}
      <div className="absolute inset-0 dark:bg-grid-white/[0.05] bg-grid-black/[0.05] -z-10" />
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-transparent to-zinc-50 dark:to-black z-0 pointer-events-none" />

      {/* Spotlight Effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-500/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Hero Content */}
      <motion.div style={{ opacity, y }} className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-indigo-600 dark:text-indigo-400 text-xs font-black uppercase tracking-widest mb-8 shadow-sm"
        >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            The Ultimate Life OS
        </motion.div>
        
        <h1 className="text-6xl md:text-9xl font-black tracking-tighter text-zinc-900 dark:text-white mb-8 leading-[0.9] drop-shadow-sm">
          REGAIN YOUR <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">SANITY.</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-zinc-600 dark:text-zinc-400 max-w-3xl mx-auto mb-10 font-medium leading-relaxed">
          Fitness. Code. Sports. Life. <br/>
          Stop switching between 10 apps. Use <b>ONE</b>.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/sign-in">
                <button className="px-10 py-4 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-black font-black text-lg hover:scale-105 transition-transform shadow-2xl flex items-center gap-2">
                    Start Free Trial <ChevronRight size={20}/>
                </button>
            </Link>
            <button className="px-10 py-4 rounded-full bg-transparent border-2 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white font-bold text-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all">
                View Demo
            </button>
        </div>
      </motion.div>
    </div>
  );
}