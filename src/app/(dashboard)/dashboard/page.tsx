"use client";
import { motion, Variants } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Dumbbell, Code2, ListTodo, Trophy } from "lucide-react";

// Variants ko explicitly type diya hai taaki ease: string wala error na aaye
const textVariant: Variants = {
  hidden: { filter: "blur(8px)", opacity: 0, y: 12 },
  visible: { 
    filter: "blur(0px)", 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.6, ease: "easeOut" } 
  }
};

const container: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

export default function DashboardPage() {
  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="visible"
      className="max-w-7xl mx-auto space-y-10"
    >
      <div className="space-y-2">
        <motion.h1 
          variants={textVariant}
          className="text-5xl font-black tracking-tight text-zinc-950 dark:text-white"
        >
          Command Center
        </motion.h1>
        <motion.p 
          variants={textVariant}
          className="text-lg text-zinc-500 dark:text-zinc-400 font-medium"
        >
          System operational. All modules synced.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Fitness Card */}
        <motion.div whileHover={{ y: -4 }} className="cursor-pointer">
          <Card className="p-6 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md transition-all duration-300 h-full">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-600 dark:text-blue-400">
                <Dumbbell className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-xl text-zinc-900 dark:text-white">Fitness</h3>
            </div>
            <div className="space-y-1">
              {/* Escape character: Today&apos;s use kiya hai */}
              <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Today&apos;s Schedule</p>
              <p className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">Heavy Legs + Abs</p>
            </div>
          </Card>
        </motion.div>

        {/* Builder Mode */}
        <motion.div whileHover={{ y: -4 }} className="cursor-pointer">
          <Card className="p-6 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md transition-all h-full">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-600 dark:text-purple-400">
                <Code2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-xl text-zinc-900 dark:text-white">Builder Mode</h3>
            </div>
            <div className="space-y-3">
              <p className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">InnerLoop Logic</p>
              <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "65%" }}
                  transition={{ duration: 1.2, ease: "circOut" }}
                  className="h-full bg-purple-500" 
                />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Execution Card */}
        <motion.div whileHover={{ y: -4 }} className="cursor-pointer">
          <Card className="p-6 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md transition-all h-full">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-600 dark:text-emerald-400">
                <ListTodo className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-xl text-zinc-900 dark:text-white">Execution</h3>
            </div>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 font-medium">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Setup Neon Schema
              </li>
              <li className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 font-medium">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Clerk Webhooks
              </li>
            </ul>
          </Card>
        </motion.div>
      </div>

      {/* Arena Schedule */}
      <motion.div variants={textVariant}>
        <Card className="p-8 border-zinc-200 dark:border-zinc-800 bg-zinc-100/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-orange-500/10 rounded-2xl text-orange-600">
              <Trophy className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-xl uppercase tracking-tighter text-zinc-900 dark:text-white">Arena Schedule</h3>
          </div>
          <div className="bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex justify-between items-center shadow-sm">
             <span className="font-bold text-zinc-900 dark:text-zinc-100 text-lg">Real Madrid vs Barca</span>
             <span className="text-xs font-black bg-orange-600 text-white px-4 py-1.5 rounded-full tracking-tighter shadow-lg shadow-orange-500/20">LIVE 01:30</span>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}