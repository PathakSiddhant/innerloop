"use client";
import React, { useState, useEffect } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import Link from "next/link";
import { Zap, ArrowRight, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";

export function NavbarFloating() {
  const { scrollY } = useScroll();
  const [visible, setVisible] = useState(true);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useMotionValueEvent(scrollY, "change", (current) => {
    if (typeof current === "number") {
      const direction = current - scrollY.getPrevious()!;
      if (scrollY.get() < 50) {
        setVisible(true);
      } else {
        setVisible(direction < 0);
      }
    }
  });

  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: visible ? 0 : -100, opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.3 }}
      // FIX: Changed 'top-6' to 'top-8'. 
      // This pushes it down just enough to feel perfectly centered vertically in the top space.
      className="fixed top-13 inset-x-0 max-w-2xl mx-auto z-50 px-4"
    >
      <div className="flex items-center justify-between bg-white/80 dark:bg-black/80 backdrop-blur-xl border border-zinc-200 dark:border-white/10 rounded-full py-3 px-6 shadow-2xl shadow-indigo-500/10">
        
        <Link href="/" className="flex items-center gap-2 font-black text-lg tracking-tighter cursor-pointer text-zinc-900 dark:text-white">
            <div className="bg-indigo-600 text-white p-1 rounded-lg">
                <Zap size={16} fill="currentColor"/>
            </div>
            <span>INNERLOOP</span>
        </Link>

        <div className="flex items-center gap-4">
            {mounted && (
                <button 
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
                >
                    {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
                </button>
            )}

            <Link href="/sign-in">
                <button className="bg-black dark:bg-white text-white dark:text-black px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest hover:scale-105 active:scale-95 transition-transform flex items-center gap-2 shadow-lg">
                    Get Started <ArrowRight size={12}/>
                </button>
            </Link>
        </div>
      </div>
    </motion.div>
  );
}