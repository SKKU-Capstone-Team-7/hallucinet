"use client";

import React from "react";
import { Home, Inbox, Calendar, Search, Settings } from "lucide-react";
import styles from "@/styles/app-sidebar.module.css";
import UserFooter from "@/components/UserFooter";             
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,                                        
} from "@/components/ui/sidebar";

const items = [
  { title: "Home",     url: "#", icon: Home },
  { title: "Inbox",    url: "#", icon: Inbox },
  { title: "Calendar", url: "#", icon: Calendar },
  { title: "Search",   url: "#", icon: Search },
  { title: "Settings", url: "#", icon: Settings },
];

export function AppSidebar() {
  return (
    <Sidebar className="flex flex-col h-full bg-white">
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
        <UserFooter />
      </SidebarFooter>
    </Sidebar>
  );
}