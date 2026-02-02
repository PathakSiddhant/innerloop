import { checkUser } from "@/lib/actions/user";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const user = await checkUser();

  // Agar login ke baad bhi user sync nahi hua toh security ke liye redirect
  if (!user) {
    redirect("/");
  }

  return (
    <div className="text-white">
      <h2 className="text-3xl font-bold tracking-tight">System Online.</h2>
      <p className="text-gray-400 mt-2">Welcome, {user.name}. All modules are ready.</p>
    </div>
  );
}