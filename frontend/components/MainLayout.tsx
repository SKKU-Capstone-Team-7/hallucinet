import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { Models } from "appwrite";
import {
  ChevronUp,
  House,
  LucideCommand,
  LucideIcon,
  LucideSettings,
  LucideUsers,
  MonitorSmartphone,
  User2,
} from "lucide-react";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Mode } from "react-hook-form";
import Link from "next/link";

interface SidebarItem {
  title: string;
  url: string;
  icon: LucideIcon;
}

const items: SidebarItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: House,
  },
  {
    title: "Devices",
    url: "/devices",
    icon: MonitorSmartphone,
  },
  {
    title: "Team",
    url: "/team",
    icon: LucideUsers,
  },
  {
    title: "Containers",
    url: "/containers",
    icon: LucideCommand,
  },
  {
    title: "Settings",
    url: "/devices",
    icon: LucideSettings,
  },
];

function AppSidebar({
  user,
  menuDisabled
}: {
  user: Models.User<Models.Preferences> | null;
  menuDisabled: boolean;
}) {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <div className="px-16 py-4 mb-8">
            <img src="sidebar_logo.svg" />
          </div>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={menuDisabled ? "#" : item.url}
                    className={cn(
                          "flex items-center w-full", // 기존 스타일 유지 (필요시 추가)
                          menuDisabled && "opacity-50 cursor-not-allowed pointer-events-none"
                        )}
                        onClick={(e) => {
                          if (menuDisabled) {
                            e.preventDefault(); // 확실하게 클릭 방지
                          }
                        }}
                        aria-disabled={menuDisabled}>
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

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <User2 /> {user?.name}
                  <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-[--radix-popper-anchor-width]"
              >
                <DropdownMenuItem>
                  <span>Account Settings</span>
                </DropdownMenuItem>
                <Link href="/logout">
                  <DropdownMenuItem>Sign out</DropdownMenuItem>
                </Link>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

export default function MainLayout({
  user,
  children,
  menuDisabled=false
}: {
  children: React.ReactNode;
  user: Models.User<Models.Preferences> | null;
  menuDisabled?: boolean;
}) {
  return (
    <SidebarProvider>
      <AppSidebar user={user} menuDisabled={menuDisabled} />
      <main className="w-full p-5 flex">
        <SidebarTrigger />
        <div className="grow mr-8">{children}</div>
      </main>
    </SidebarProvider>
  );
}
