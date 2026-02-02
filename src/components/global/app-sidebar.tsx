import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { 
  LayoutDashboard, 
  Dumbbell, 
  Code2, 
  CheckCircle2, 
  Trophy, 
  Video, 
  Link2, 
} from "lucide-react";
import { UserButton } from "@clerk/nextjs";

const items = [
  { title: "Overview", url: "/dashboard", icon: LayoutDashboard },
  { title: "Fitness", url: "/fitness", icon: Dumbbell },
  { title: "Builder Mode", url: "/builder", icon: Code2 },
  { title: "Daily Tasks", url: "/tasks", icon: CheckCircle2 },
  { title: "Sports", url: "/sports", icon: Trophy },
  { title: "Entertainment", url: "/entertainment", icon: Video },
  { title: "Vault", url: "/vault", icon: Link2 },
];

export function AppSidebar() {
  return (
    <Sidebar className="border-r border-white/10 bg-black">
      <SidebarHeader className="p-4">
        <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
          INNERLOOP
        </h1>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-500">System</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url} className="text-gray-300 hover:text-white transition-colors">
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-white/10">
        <div className="flex items-center gap-2 text-white">
          <UserButton afterSignOutUrl="/" />
          <span className="text-sm font-medium">Profile</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}