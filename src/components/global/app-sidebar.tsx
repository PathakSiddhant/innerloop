"use client"
import { LayoutDashboard, Dumbbell, Code2, ListTodo, Trophy, Film, Library, Settings } from "lucide-react"
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar"
import { ModeToggle } from "./mode-toggle"
import { UserButton } from "@clerk/nextjs"

const menuItems = [
  { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
  { icon: Dumbbell, label: "Fitness", href: "/fitness" },
  { icon: Code2, label: "Builder Mode", href: "/builder" },
  { icon: ListTodo, label: "Daily Tasks", href: "/tasks" },
  { icon: Trophy, label: "Sports", href: "/sports" },
  { icon: Film, label: "Entertainment", href: "/entertainment" },
  { icon: Library, label: "The Vault", href: "/vault" },
]

export function AppSidebar() {
  return (
    <Sidebar className="border-r dark:border-zinc-800 bg-white dark:bg-zinc-950">
      <SidebarHeader className="flex flex-row items-center justify-between p-4">
        <span className="font-black text-xl tracking-tighter dark:text-white">INNERLOOP</span>
        <ModeToggle />
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton asChild tooltip={item.label} className="hover:bg-zinc-100 dark:hover:bg-zinc-900 h-12 rounded-xl transition-all">
                <a href={item.href} className="flex items-center gap-3">
                  <item.icon className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
                  <span className="font-semibold text-zinc-700 dark:text-zinc-200">{item.label}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <div className="mt-auto p-4 border-t dark:border-zinc-800">
        <UserButton afterSignOutUrl="/" showName />
      </div>
    </Sidebar>
  )
}