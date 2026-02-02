import { HeroSection } from "@/components/global/hero";
import { checkUser } from "@/lib/actions/user";

export default async function Home() {
  const user = await checkUser();
  
  // Debugging ke liye taaki ESLint error na de
  if (user) console.log("User in session:", user.email);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-black overflow-hidden">
      <HeroSection />
    </main>
  );
}