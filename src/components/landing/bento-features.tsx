"use client";
import React from "react";
import { motion } from "framer-motion";
import { Activity, Trophy, Terminal, List, Database, Clapperboard, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function BentoFeatures() {
  return (
    <section className="py-32 px-4 max-w-7xl mx-auto bg-white dark:bg-black">
      <div className="mb-20 text-center">
        <h2 className="text-5xl md:text-7xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter mb-6">
          The <span className="text-indigo-600">Six Pillars</span>
        </h2>
        <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
          We didn&apos;t just build features. We built an ecosystem for your life.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* 1. FITNESS */}
        <WobbleCard containerClassName="col-span-1 md:col-span-2 bg-gradient-to-br from-emerald-500 to-teal-700 min-h-[300px]">
            <div className="max-w-md">
                <div className="flex items-center gap-2 text-emerald-100 font-bold mb-2">
                    <Activity/> Bio-Core
                </div>
                <h2 className="text-4xl font-black text-white mb-4">Your Body, Quantified.</h2>
                <p className="text-emerald-50 text-lg">Holographic rings for Steps, Water, and Calories. Visual streaks that force you to stay consistent.</p>
            </div>
            <div className="absolute -right-10 -bottom-10 opacity-20">
                <Activity size={300} className="text-white"/>
            </div>
        </WobbleCard>

        {/* 2. SPORTS */}
        <WobbleCard containerClassName="col-span-1 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 min-h-[300px]">
             <div className="max-w-md">
                <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-500 font-bold mb-2">
                    <Trophy/> The Arena
                </div>
                <h2 className="text-3xl font-black text-zinc-900 dark:text-white mb-4">Live Game Intel.</h2>
                <p className="text-zinc-600 dark:text-zinc-400">Cricket, Football, F1. The dashboard detects the sport and changes the UI theme instantly.</p>
            </div>
             <div className="absolute -right-4 -bottom-4 opacity-10">
                <Trophy size={200} className="text-yellow-500"/>
            </div>
        </WobbleCard>

        {/* 3. BUILDER */}
        <WobbleCard containerClassName="col-span-1 bg-indigo-900 min-h-[300px]">
             <div className="max-w-md">
                <div className="flex items-center gap-2 text-indigo-300 font-bold mb-2">
                    <Terminal/> Builder Mode
                </div>
                <h2 className="text-3xl font-black text-white mb-4">Hacker Terminal.</h2>
                <p className="text-indigo-200">Log your commits. Track bugs. A real CLI experience right in your browser.</p>
            </div>
        </WobbleCard>

        {/* 4. TASKS */}
        <WobbleCard containerClassName="col-span-1 md:col-span-2 bg-gradient-to-r from-orange-500 to-red-600 min-h-[300px]">
             <div className="max-w-md">
                <div className="flex items-center gap-2 text-orange-100 font-bold mb-2">
                    <List/> Command Deck
                </div>
                <h2 className="text-4xl font-black text-white mb-4">Chaos vs Order.</h2>
                <p className="text-orange-50 text-lg">Left side: Fixed Schedule (Time-locked). Right side: Flexible Notepad. The perfect balance for productivity.</p>
            </div>
        </WobbleCard>

        {/* 5. VAULT */}
        <WobbleCard containerClassName="col-span-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 min-h-[300px]">
             <div className="max-w-md">
                <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 font-bold mb-2">
                    <Database/> The Vault
                </div>
                <h2 className="text-3xl font-black text-zinc-900 dark:text-white mb-4">Second Brain.</h2>
                <p className="text-zinc-500 dark:text-zinc-400">Store links, ideas, and secrets. AI auto-tags everything.</p>
            </div>
        </WobbleCard>

        {/* 6. ENTERTAINMENT */}
        <WobbleCard containerClassName="col-span-1 md:col-span-2 bg-rose-950 min-h-[300px]">
             <div className="max-w-md">
                <div className="flex items-center gap-2 text-rose-400 font-bold mb-2">
                    <Clapperboard/> Cinema
                </div>
                <h2 className="text-3xl font-black text-white mb-4">Watchlist Manager.</h2>
                <p className="text-rose-200">Track movies and series with a realistic Cinema Ticket UI. Never forget what episode you were on.</p>
            </div>
        </WobbleCard>

      </div>
    </section>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const WobbleCard = ({ children, containerClassName }: any) => {
    return (
        <motion.div
            whileHover={{ scale: 1.02, rotate: 0.5 }}
            transition={{ type: "spring", stiffness: 300 }}
            className={cn("relative rounded-3xl p-8 overflow-hidden shadow-xl cursor-pointer group", containerClassName)}
        >
            <div className="relative z-10">{children}</div>
            <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowUpRight className="text-white w-8 h-8"/>
            </div>
        </motion.div>
    );
};