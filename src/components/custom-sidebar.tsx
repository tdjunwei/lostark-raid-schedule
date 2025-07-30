"use client"

import * as React from "react"
import { Calendar, Home, Shield, Swords, Trophy, Users, PanelLeftIcon } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const SidebarContext = React.createContext<{
  isOpen: boolean
  toggle: () => void
} | null>(null)

function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within SidebarProvider")
  }
  return context
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState(true)
  
  const toggle = () => setIsOpen(!isOpen)
  
  return (
    <SidebarContext.Provider value={{ isOpen, toggle }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function SidebarTrigger() {
  const { toggle } = useSidebar()
  
  return (
    <Button variant="ghost" size="icon" onClick={toggle} className="size-7">
      <PanelLeftIcon className="h-4 w-4" />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  )
}

const items = [
  {
    title: "總覽",
    url: "/",
    icon: Home,
  },
  {
    title: "玩家管理",
    url: "/players",
    icon: Users,
  },
  {
    title: "排程",
    url: "/schedule",
    icon: Calendar,
  },
  {
    title: "天界",
    url: "/raids/celestial",
    icon: Shield,
  },
  {
    title: "夢幻",
    url: "/raids/dream",
    icon: Shield,
  },
  {
    title: "象牙塔",
    url: "/raids/ivory-tower",
    icon: Shield,
  },
  {
    title: "瘟疫",
    url: "/raids/plague",
    icon: Swords,
  },
  {
    title: "收益管理",
    url: "/revenue",
    icon: Trophy,
  },
]

export function CustomSidebar() {
  const { isOpen } = useSidebar()
  
  return (
    <div className={cn(
      "h-screen bg-sidebar border-r border-border transition-all duration-300 ease-in-out",
      isOpen ? "w-64" : "w-0"
    )}>
      <div className={cn(
        "h-full overflow-hidden transition-opacity duration-300",
        isOpen ? "opacity-100" : "opacity-0"
      )}>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-sidebar-foreground mb-6">
            Lost Ark 出團系統
          </h2>
          <nav className="space-y-2">
            {items.map((item) => (
              <Link
                key={item.title}
                href={item.url}
                className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
              >
                <item.icon className="h-5 w-5" />
                <span>{item.title}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  )
}

export function MainContent({ children }: { children: React.ReactNode }) {
  const { isOpen } = useSidebar()
  
  return (
    <main className={cn(
      "flex-1 transition-all duration-300 ease-in-out min-w-0 overflow-visible",
      isOpen ? "ml-0" : "ml-0"
    )}>
      {children}
    </main>
  )
}