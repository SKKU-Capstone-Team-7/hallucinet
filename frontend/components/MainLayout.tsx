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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { backendFetch, cn } from "@/lib/utils";
import { Account, Models } from "appwrite";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
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
import { Mode, SubmitHandler, useForm } from "react-hook-form";
import Link from "next/link";
import { useState } from "react";
import { Label } from "@radix-ui/react-dropdown-menu";
import { Input } from "./ui/input";
import { DialogClose } from "@radix-ui/react-dialog";
import { Button } from "./ui/button";
import { Trash2 } from 'lucide-react';
import { getAppwriteClient } from "@/lib/appwrite";
import { toast } from "sonner";

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
    url: "/settings",
    icon: LucideSettings,
  },
];

interface UpdateUserInfo {
  username: string;
  oldPassword? : string;
  newPassword? : string;
}

function AppSidebar({
  user,
  menuDisabled
}: {
  user: Models.User<Models.Preferences>;
  menuDisabled: boolean;
}) {
  const [isAccountSettingsDialogOpen, setIsAccountSettingsDialogOpen] = useState(false);

  if (!user) {
    return <></>
  }
  const { 
    register: registerAccountForm,
    handleSubmit: handleSubmitAccountForm, 
    setValue: setAccountFormValue,
    formState: { errors: accountFormErrors } 
  } = useForm<UpdateUserInfo>({
    defaultValues: {
      username: user.name || '',
      oldPassword: '',
      newPassword: '',
    }
  });

  const onAccountSettingsSubmit: SubmitHandler<UpdateUserInfo> = async (data) => {

    try {
      const account = new Account(getAppwriteClient());
      const jwt = (await account.createJWT()).jwt;

      const payload = {
        name: data.username,
        password: data.newPassword,
        oldPassword: data.oldPassword
      }
      console.log(payload);
      await backendFetch("/users/me", "PATCH", jwt, JSON.stringify(payload));
      window.location.reload();
      toast.success("Account settings updated successfully!");
      setIsAccountSettingsDialogOpen(false);
      return;
    } catch (error) {
      console.error("Failed to save account settings:", error);
    }
  } 

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
            <Dialog open={isAccountSettingsDialogOpen} onOpenChange={setIsAccountSettingsDialogOpen}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton>
                    <User2 /> {user.name}
                    <ChevronUp className="ml-auto" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-[--radix-popper-anchor-width]"
              >
                <DialogTrigger asChild>
                  <DropdownMenuItem>Account Settings</DropdownMenuItem>
                </DialogTrigger>

                <Link href="/logout">
                  <DropdownMenuItem>Sign out</DropdownMenuItem>
                </Link>

              </DropdownMenuContent>
            </DropdownMenu>
              <DialogContent>
                <form onSubmit={handleSubmitAccountForm(onAccountSettingsSubmit)}>
                <DialogHeader>
                  <DialogTitle>Account Settings</DialogTitle>
                  <DialogDescription>
                    Make changes to your account here. Click save when you're done.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 mt-4">
                  <div className="grid gap-3">
                  <label htmlFor="username">Username</label>
                  <Input 
                    id="username"
                    {...registerAccountForm("username", { required: "Username is required" })} 
                  />
                  </div>
                </div>
                <div className="grid gap-4 mt-4">
                  <div className="grid gap-3">
                  <label htmlFor="oldPassword">Old password</label>
                  <Input 
                    id="oldPassword"
                    type="password" 
                    {...registerAccountForm("oldPassword")} 
                  />
                  </div>
                </div>
                <div className="grid gap-4 mt-4">
                  <div className="grid gap-3">
                  <label htmlFor="newPassword">New password</label>
                  <Input
                    id="newPassword"
                    type="password"
                    {...registerAccountForm("newPassword")}
                  />
                    </div>
                </div>
          <DialogFooter className="mt-4">
            <Button type="submit">Save changes</Button>
          </DialogFooter>
          </form>
          <div className="mt-0">
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
            <DialogDescription>
                    Permanently delete your account. This action cannot be undone.
                  </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button className="w-30 bg-red-600 hover:bg-red-700"><Link href="/logout">Delete Account</Link></Button>
          </DialogFooter>
          </div>
              </DialogContent>
            </Dialog>

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
  user: Models.User<Models.Preferences>;
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
