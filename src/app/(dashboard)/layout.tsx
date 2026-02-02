import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/global/app-sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      {/* Yahan se bg-black hata kar bg-background kiya hai */}
      <div className="flex h-screen w-full bg-background transition-colors duration-300">
        <AppSidebar />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="flex items-center mb-8">
            <SidebarTrigger className="hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors" />
          </div>
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}