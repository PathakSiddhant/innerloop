"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Dumbbell, History, Timer, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { Card } from "@/components/ui/card";

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
        { workoutName, notes: "Logged via Quick Entry" }, 
        energy, 
        mood
      );
      toast.success("Workout logged in the Loop!");
      // Modal close karne ke liye page refresh ya state reset logic yahan daal sakte ho
    } catch (error) {
      console.error("Log error:", error); // ESLint fixed: error variable used
      toast.error("Failed to sync with the Loop");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto space-y-10 p-6"
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div className="space-y-2">
          <h1 className="text-5xl font-black tracking-tight text-zinc-950 dark:text-white">Fitness Vault</h1>
          <p className="text-zinc-500 font-medium">Build the body, master the mind.</p>
        </div>

        {/* LOG WORKOUT MODAL */}
        <Dialog>
          <DialogTrigger asChild>
            <Button size="lg" className="rounded-2xl bg-blue-600 hover:bg-blue-700 text-white px-8 gap-2 shadow-lg shadow-blue-500/20 transition-all hover:scale-105">
              <Plus className="w-5 h-5" /> Log Workout
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-106.25 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold tracking-tight">Record Session</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 pt-4">
              <div className="space-y-2">
                <Label htmlFor="workoutName">Workout Focus</Label>
                <Input id="workoutName" name="workoutName" placeholder="e.g. Push Day, 5km Run" required className="rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="energy">Energy Level (1-10)</Label>
                  <Input id="energy" name="energy" type="number" min="1" max="10" defaultValue="7" className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mood">Mood (Emoji)</Label>
                  <Input id="mood" name="mood" placeholder="🔥, 🦾, 🥵" className="rounded-xl" />
                </div>
              </div>
              <Button type="submit" disabled={loading} className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 py-6 text-lg font-bold">
                {loading ? "Syncing..." : "Finalize Entry"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Quick Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <StatsCard icon={<Flame className="text-orange-500" />} label="Streak" value="12 Days" />
         <StatsCard icon={<Timer className="text-blue-500" />} label="Total Volume" value="45,200 kg" />
         <StatsCard icon={<History className="text-emerald-500" />} label="Last Sync" value="24h ago" />
      </div>

      {/* Empty State / Previous Logs Placeholder */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-12 p-20 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-[40px] flex flex-col items-center justify-center text-center"
      >
          <div className="p-4 bg-zinc-100 dark:bg-zinc-900 rounded-full mb-4">
            <Dumbbell className="w-10 h-10 text-zinc-400" />
          </div>
          <h3 className="text-xl font-bold text-zinc-800 dark:text-zinc-200">No logs detected in this cycle.</h3>
          <p className="text-zinc-500 max-w-xs mt-2">Start your session and record it to see the AI analysis.</p>
      </motion.div>
    </motion.div>
  );
}

function StatsCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <motion.div whileHover={{ y: -5 }}>
      <Card className="p-6 border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl rounded-3xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white dark:bg-zinc-800 rounded-2xl shadow-sm">{icon}</div>
          <div>
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{label}</p>
            <p className="text-2xl font-black text-zinc-900 dark:text-white">{value}</p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}