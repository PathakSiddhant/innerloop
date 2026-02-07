// "use server";

// import { db } from "@/lib/db";
// import { fitnessDays, tasks, devLogs, entertainment, sportsMatches, projects } from "@/lib/db/schema";
// import { eq, and, desc, asc } from "drizzle-orm";
// import { auth } from "@clerk/nextjs/server";

// export async function getDashboardOverview() {
//   const { userId } = await auth();
//   if (!userId) return null;

//   const today = new Date();
//   const todayString = today.toISOString().split('T')[0];

//   // 1. FITNESS
//   const fitnessData = await db.select()
//     .from(fitnessDays)
//     .where(and(eq(fitnessDays.userId, userId), eq(fitnessDays.date, todayString)))
//     .limit(1);

//   // 2. TASKS (Fetch ALL pending for today)
//   const todaysTasks = await db.select()
//     .from(tasks)
//     .where(and(
//       eq(tasks.userId, userId),
//       eq(tasks.date, todayString),
//       eq(tasks.status, "pending") 
//     ))
//     .orderBy(asc(tasks.startTime));

//   // 3. BUILDER (STRICTLY TODAY'S LOGS & EXPANDED)
//   const rawLogs = await db.select({
//       log: devLogs,
//       projectName: projects.name,
//       createdAt: devLogs.createdAt
//     })
//     .from(devLogs)
//     .leftJoin(projects, eq(devLogs.projectId, projects.id))
//     .where(and(
//         eq(devLogs.userId, userId),
//         eq(devLogs.date, todayString) // ONLY TODAY
//     ))
//     .orderBy(desc(devLogs.createdAt));

//   // Flatten the logs: One line per task completed
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   const formattedLogs: any[] = [];
  
//   rawLogs.forEach(item => {
//       const projName = item.projectName || "System";
//       const time = item.createdAt;
      
//       // Agar tasks hain, toh har task ko alag line banao
//       if (item.log.tasksCompleted && item.log.tasksCompleted.length > 0) {
//           item.log.tasksCompleted.forEach(task => {
//               formattedLogs.push({
//                   project: projName,
//                   log_content: task, // Specific task desc
//                   time: time
//               });
//           });
//       } 
//       // Agar tasks nahi par blocker hai
//       else if (item.log.blockers) {
//           formattedLogs.push({
//               project: projName,
//               log_content: `Blocker: ${item.log.blockers}`,
//               time: time
//           });
//       }
//       // Fallback
//       else {
//            formattedLogs.push({
//               project: projName,
//               log_content: "Code commit logged",
//               time: time
//           });
//       }
//   });

//   // 4. ENTERTAINMENT
//   const watchingContent = await db.select()
//     .from(entertainment)
//     .where(and(eq(entertainment.userId, userId), eq(entertainment.status, "watching")))
//     .limit(1);

//   // 5. SPORTS
//   const todaysMatchesData = await db.select()
//       .from(sportsMatches)
//       .where(and(
//           eq(sportsMatches.userId, userId),
//           eq(sportsMatches.date, todayString)
//       ))
//       .orderBy(asc(sportsMatches.time));
  
//   const formattedSports = todaysMatchesData.map(match => {
//       const teams = match.title.split(" vs ");
//       return {
//           id: match.id,
//           team1: teams[0] || "TBD",
//           team2: teams[1] || "TBD",
//           match_time: `${match.date}T${match.time}`,
//           sport: match.sport,
//           tournament: match.tournament,
//           aiIntel: match.aiIntel
//       };
//   });

//   return {
//     fitness: { 
//         water: fitnessData[0]?.waterIntake || 0, 
//         steps: fitnessData[0]?.stepCount || 0, 
//         calories: fitnessData[0]?.macroGoal?.cals || 0 
//     },
//     tasks: todaysTasks || [],
//     builder: formattedLogs || [], // Now expanded array
//     entertainment: watchingContent[0] || null,
//     sports: formattedSports
//   };
// }



"use server";

import { db } from "@/lib/db";
import { fitnessDays, tasks, devLogs, entertainment, sportsMatches, projects } from "@/lib/db/schema";
import { eq, and, desc, asc } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export async function getDashboardOverview() {
  const { userId } = await auth();
  if (!userId) return null;

  const today = new Date();
  const todayString = today.toISOString().split('T')[0];

  // 1. FITNESS
  const fitnessData = await db.select()
    .from(fitnessDays)
    .where(and(eq(fitnessDays.userId, userId), eq(fitnessDays.date, todayString)))
    .limit(1);

  // Calculate total calories from meals
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const currentMeals = (fitnessData[0]?.meals as any[]) || [];
  const totalCalories = currentMeals.reduce((acc, meal) => acc + (Number(meal.cals) || 0), 0);

  // 2. TASKS (Fetch ALL pending for today)
  const todaysTasks = await db.select()
    .from(tasks)
    .where(and(
      eq(tasks.userId, userId),
      eq(tasks.date, todayString),
      eq(tasks.status, "pending") 
    ))
    .orderBy(asc(tasks.startTime));

  // 3. BUILDER (Updated: Fetch ALL recent logs)
  const rawLogs = await db.select({
      log: devLogs,
      projectName: projects.name,
      createdAt: devLogs.createdAt
    })
    .from(devLogs)
    .leftJoin(projects, eq(devLogs.projectId, projects.id))
    .where(eq(devLogs.userId, userId)) 
    .orderBy(desc(devLogs.createdAt))
    .limit(10); 

  const formattedLogs = rawLogs.map(item => ({
      project: item.projectName || "System",
      log_content: item.log.tasksCompleted?.[0] || item.log.blockers || "System updated",
      time: item.createdAt ? item.createdAt.toISOString() : null,
      commitCount: item.log.commitCount
  }));

  // 4. ENTERTAINMENT
  const watchingContent = await db.select()
    .from(entertainment)
    .where(and(eq(entertainment.userId, userId), eq(entertainment.status, "watching")))
    .limit(1);

  // 5. SPORTS
  const todaysMatchesData = await db.select()
      .from(sportsMatches)
      .where(and(
          eq(sportsMatches.userId, userId),
          eq(sportsMatches.date, todayString)
      ))
      .orderBy(asc(sportsMatches.time));
  
  const formattedSports = todaysMatchesData.map(match => {
      const teams = match.title.split(" vs ");
      return {
          id: match.id,
          team1: teams[0] || "TBD",
          team2: teams[1] || "TBD",
          match_time: `${match.date}T${match.time}`,
          sport: match.sport,
          tournament: match.tournament,
          aiIntel: match.aiIntel
      };
  });

  return {
    fitness: { 
        water: fitnessData[0]?.waterIntake || 0, 
        waterGoal: fitnessData[0]?.waterGoal || 3000,
        steps: fitnessData[0]?.stepCount || 0, 
        stepGoal: fitnessData[0]?.stepGoal || 10000,
        calories: totalCalories, 
        calorieGoal: fitnessData[0]?.macroGoal?.cals || 2500
    },
    tasks: todaysTasks || [],
    builder: formattedLogs || [],
    entertainment: watchingContent[0] || null,
    sports: formattedSports
  };
}