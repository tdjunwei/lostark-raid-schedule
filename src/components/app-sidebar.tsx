import { Calendar, Home, Shield, Swords, Trophy, Users } from "lucide-react"
import Link from "next/link"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

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

export function AppSidebar() {
  return (
    <Sidebar collapsible="offcanvas">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Lost Ark 出團系統</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}