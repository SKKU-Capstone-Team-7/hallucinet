'use client';

import React from "react";
import type { Models } from "appwrite";
import { Home, Inbox, Calendar, Search, Settings } from "lucide-react";
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

const items = [
  { title: "Devices",     url: "#", icon: Home },
  { title: "Team",    url: "#", icon: Inbox },
  { title: "Containers", url: "#", icon: Calendar },
  { title: "Settings",   url: "#", icon: Search },
];

interface AppSidebarProps {
  user: Models.User<Models.Preferences>;
  onLogout: () => void;
}

export function AppSidebar({ user, onLogout }: AppSidebarProps) {
  return (
    <Sidebar className="flex flex-col h-full bg-[#1a2841]">
      <SidebarContent>
        <SidebarGroup>
          <div className={styles.navbar}>
            <div className={styles.title}>hallucinet</div>
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
