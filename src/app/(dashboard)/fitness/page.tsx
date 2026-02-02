"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Plus, Dumbbell, Utensils, Droplets, 
  Zap, Award 
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createDailyLog } from "@/lib/actions/logs";
import { toast } from "sonner";

// PRCard ke liye Interface banaya
interface PRCardProps {
  exercise: string;
  weight: string;
  date: string;
  color: string;
}

export default function FitnessPage() {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    
    const formData = new FormData(event.currentTarget);
    const workoutName = formData.get("workoutName") as string;
    const energy = parseInt(formData.get("energy") as string || "7");
    const mood = formData.get("mood") as string;

    try {
      await createDailyLog(
        "fitness", 
        { workoutName, notes: "Logged via God-tier Dashboard" }, 
        energy, 
        mood
      );
      toast.success("System Updated: Workout logged in the Loop!");
    } catch (error) {
      console.error("Log error:", error);
      toast.error("Failed to sync with the Loop");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto p-4 md:p-8 space-y-10"
    >
      {/* Header Section */}
      <div className="flex justify-between items-end">
        <div className="space-y-2">
          <h1 className="text-5xl font-black tracking-tight text-zinc-950 dark:text-white">Fitness Vault</h1>
          <p className="text-zinc-500 font-medium italic">Build the body, master the mind.</p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button size="lg" className="rounded-2xl bg-blue-600 hover:bg-blue-700 text-white px-8 gap-2 shadow-lg shadow-blue-500/20 transition-all hover:scale-105">
              <Plus className="w-5 h-5" /> Log Session
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-106.25 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Record Entry</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 pt-4">
              <div className="space-y-2">
                <Label htmlFor="workoutName">Session Name</Label>
                <Input id="workoutName" name="workoutName" placeholder="e.g. Push Day, 5km Run" required className="rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="energy">Energy (1-10)</Label>
                  <Input id="energy" name="energy" type="number" min="1" max="10" defaultValue="7" className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mood">Mood</Label>
                  <Input id="mood" name="mood" placeholder="🔥, 🦾" className="rounded-xl" />
                </div>
              </div>
              <Button type="submit" disabled={loading} className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 py-6 text-lg font-bold">
                {loading ? "Syncing..." : "Finalize Entry"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Top Level: Macro & Health Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-2 p-6 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-4xl shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-xl flex items-center gap-2 text-zinc-900 dark:text-white">
              <Utensils className="w-5 h-5 text-orange-500" /> Nutrition Fuel
            </h3>
            <span className="text-sm font-bold text-zinc-400">1,850 / 2,500 kcal</span>
          </div>
          <div className="space-y-4">
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-zinc-500">
                <span>Protein</span>
                <span>120g / 180g</span>
              </div>
              <Progress value={65} className="h-2 bg-zinc-100 dark:bg-zinc-800" />
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2">
               <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50">
                  <p className="text-[10px] uppercase font-bold text-zinc-400">Carbs</p>
                  <p className="text-lg font-black italic dark:text-white">210g</p>
               </div>
               <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50">
                  <p className="text-[10px] uppercase font-bold text-zinc-400">Fats</p>
                  <p className="text-lg font-black italic dark:text-white">55g</p>
               </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-blue-500/5 border-blue-500/10 rounded-4xl relative overflow-hidden group">
            <Droplets className="absolute -right-4 -bottom-4 w-32 h-32 text-blue-500/10 rotate-12" />
            <h3 className="font-bold text-xl mb-4 text-zinc-900 dark:text-white">Hydration</h3>
            <div className="text-4xl font-black text-blue-600 mb-2 tracking-tighter">2.4<span className="text-lg ml-1 text-blue-400">Liters</span></div>
            <Button className="w-full rounded-2xl bg-blue-600 hover:bg-blue-700 text-white mt-4 relative z-10">
              + Log 250ml
            </Button>
        </Card>

        <Card className="p-6 bg-zinc-950 text-white rounded-4xl border-none shadow-2xl relative overflow-hidden">
            <div className="flex items-center gap-2 text-emerald-400 mb-4 uppercase text-[10px] font-black tracking-[0.2em]">
              <Zap className="w-3 h-3 fill-emerald-400" /> System_Insight
            </div>
            <p className="text-sm font-medium leading-relaxed italic text-zinc-300">
              &quot;Calories are on track, but you missed your morning electrolytes. Performance might dip by 12% in the evening.&quot;
            </p>
            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-emerald-500/10 blur-3xl rounded-full" />
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Active Plan</h2>
            <Card className="p-8 border-none bg-linear-to-br from-indigo-600 to-blue-700 text-white rounded-[40px] shadow-2xl relative group overflow-hidden">
               <Dumbbell className="absolute top-8 right-8 w-12 h-12 opacity-20 group-hover:scale-110 transition-transform" />
               <h3 className="text-3xl font-black italic uppercase tracking-tighter">Push Day_V2</h3>
               <p className="mt-2 text-blue-100 font-medium opacity-80">Focus: Upper Chest & Lateral Delts</p>
               <div className="mt-8 flex gap-4">
                  <Button className="rounded-full bg-white text-blue-700 hover:bg-blue-50 font-bold px-8 py-6">Start Session</Button>
                  <Button variant="ghost" className="rounded-full border border-white/20 text-white hover:bg-white/10 px-8">Edit Plan</Button>
               </div>
            </Card>
         </div>

         <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Hall of Fame</h2>
            <div className="grid grid-cols-2 gap-4">
               <PRCard exercise="Deadlift" weight="180kg" date="2 days ago" color="text-red-500" />
               <PRCard exercise="Bench Press" weight="110kg" date="Last week" color="text-blue-500" />
            </div>
         </div>
      </div>
    </motion.div>
  );
}

function PRCard({ exercise, weight, date, color }: PRCardProps) {
  return (
    <motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
      <Card className="p-4 rounded-3xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 shadow-sm">
         <Award className={`w-5 h-5 ${color} mb-2`} />
         <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{exercise}</p>
         <p className="text-2xl font-black text-zinc-900 dark:text-white">{weight}</p>
         <p className="text-[10px] text-zinc-500 mt-1">{date}</p>
      </Card>
    </motion.div>
  );
}