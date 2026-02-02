import { checkUser } from "@/lib/actions/user";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell, Code2, CheckCircle2, TrendingUp, Trophy, Link2 } from "lucide-react";

export default async function DashboardPage() {
  const user = await checkUser();

  if (!user) {
    redirect("/");
  }

  return (
    <div className="space-y-8 p-2">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight text-white italic">SYSTEM_ONLINE</h2>
        <p className="text-muted-foreground">
          Welcome back, <span className="text-white font-semibold">{user.name?.split(' ')[0]}</span>. The Loop is active.
        </p>
      </div>

      {/* Main Bento Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2">
        
        {/* Fitness - Large Card */}
        <Card className="lg:col-span-2 lg:row-span-1 bg-zinc-900/50 border-white/10 text-white backdrop-blur-sm group hover:border-blue-500/50 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-400 uppercase tracking-widest">Body Intelligence</CardTitle>
            <Dumbbell className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">75% Recovery</div>
            <p className="text-xs text-muted-foreground mt-2">AI Suggestion: <span className="text-blue-300">High intensity Push Day recommended.</span></p>
          </CardContent>
        </Card>

        {/* Builder Mode - Small Card */}
        <Card className="bg-zinc-900/50 border-white/10 text-white group hover:border-purple-500/50 transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-purple-400">BUILDER_LOG</CardTitle>
            <Code2 className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">Orbit v2</div>
            <p className="text-[10px] text-muted-foreground uppercase mt-1">Status: Refining Logic</p>
          </CardContent>
        </Card>

        {/* Brutal Truth - Small Card */}
        <Card className="bg-zinc-900/50 border-red-900/30 text-white group hover:border-red-500/50 transition-all border-dashed">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-red-500">BRUTAL_TRUTH</CardTitle>
            <TrendingUp className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <p className="text-sm italic text-gray-300">&quot;Tu busy nahi hai, tu scattered hai. Stop fake work.&quot;</p>
          </CardContent>
        </Card>

        {/* Execution Engine - Medium Card */}
        <Card className="lg:col-span-2 bg-zinc-900/50 border-white/10 text-white group hover:border-green-500/50 transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-green-400">DAILY_EXECUTION</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent className="flex justify-between items-end">
            <div>
              <div className="text-3xl font-bold">12 / 15</div>
              <p className="text-xs text-muted-foreground mt-1">Tasks completed today.</p>
            </div>
            <div className="h-12 w-12 rounded-full border-2 border-green-500/20 flex items-center justify-center text-[10px] font-bold text-green-500">
              80%
            </div>
          </CardContent>
        </Card>

        {/* Sports & Vault - Remaining Space */}
        <Card className="bg-zinc-900/50 border-white/10 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-yellow-500">ARENA</CardTitle>
            <Trophy className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-semibold">Real Madrid vs Barca</div>
            <p className="text-[10px] text-muted-foreground">Tonight, 12:30 AM</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-white/10 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-cyan-400">VAULT</CardTitle>
            <Link2 className="h-4 w-4 text-cyan-400" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">128</div>
            <p className="text-[10px] text-muted-foreground">Links unread.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}