'use client';

import React from "react";
import type { Models } from "appwrite";
import { LayoutDashboard, Server, Users2, Package, Settings } from "lucide-react";
import styles from "@/styles/app-sidebar.module.css";
import UserFooter from "@/components/UserFooter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar";
import Image from "next/image";

const items = [
  { title: "Dashboard",   url: "/dashboard", icon: LayoutDashboard },
  { title: "Devices",     url: "/devices",   icon: Server },
  { title: "Team",        url: "/team",      icon: Users2 },
  { title: "Containers",  url: "/containers",icon: Package },
  { title: "Settings",    url: "/settings",  icon: Settings },
];

interface AppSidebarProps {
  user: Models.User<Models.Preferences>;
  onLogout: () => void;
}

export function AppSidebar({ user, onLogout }: AppSidebarProps) {
  return (
    <Sidebar className={styles.sidebar}>
      <SidebarContent>
        <SidebarGroup>
          <div className={styles.navbar}>
            <div className={styles.logo}>
              <Image
                src="/logowhite.svg"
                alt="hallucinet logo"
                fill
                style={{ objectFit: "contain" }}
              />
            </div>
          </div>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url} className="flex items-center gap-2">
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

      <SidebarFooter className="mt-auto">
        <div className="sidebar-footer">
          <UserFooter user={user} onLogout={onLogout} />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
