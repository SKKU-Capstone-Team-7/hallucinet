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
import { Account, AppwriteException, Models } from "appwrite";
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
import { useEffect, useState } from "react";
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
  menuDisabled,
  onUserUpdated,
}: {
  user: Models.User<Models.Preferences>;
  menuDisabled: boolean;
  onUserUpdated?: () => Promise<void>;
}) {
  const [isAccountSettingsDialogOpen, setIsAccountSettingsDialogOpen] = useState(false);

  if (!user) {
    return <></>
  }
  const { 
    register: registerAccountForm,
    handleSubmit: handleSubmitAccountForm, 
    setValue: setAccountFormValue,
    reset: resetAccountForm,
    watch: watchAccountForm,
    formState: { errors: accountFormErrors, isSubmitting: isAccountFormSubmitting } 
  } = useForm<UpdateUserInfo>({
    defaultValues: {
      username: user.name || '',
      oldPassword: '',
      newPassword: '',
    }
  });

  useEffect(() => {
    if (isAccountSettingsDialogOpen) {
      resetAccountForm({
        username: user.name || '',
        oldPassword: '',
        newPassword: '',
      });
    }
  }, [isAccountSettingsDialogOpen, user, resetAccountForm]);

  const onAccountSettingsSubmit: SubmitHandler<UpdateUserInfo> = async (data) => {
    const updatePayload: { name: string; password?: string; oldPassword?: string } = {
      name: data.username,
    };

    if (data.newPassword) {
      if (!data.oldPassword) {
        toast.error("Update Failed", { description: "To set a new password, please enter your current password." });
        return;
      }
      if (data.newPassword.length < 8) { 
        toast.error("Update Failed", { description: "New password must be at least 8 characters long." });
        return;
      }
      updatePayload.password = data.newPassword; 
      updatePayload.oldPassword = data.oldPassword;
    } else if (data.oldPassword && !data.newPassword) {
      toast.error("Update Failed", { description: "Please enter a new password if you've provided your current password." });
      return;
    }

    try {
      const account = new Account(getAppwriteClient());
      const jwt = (await account.createJWT()).jwt;
      //console.log(updatePayload);
      const updateRes = await backendFetch("/users/me", "PATCH", jwt, updatePayload);
      if (updateRes.ok) {
        toast.success("Account settings updated successfully!");
        setIsAccountSettingsDialogOpen(false);

        resetAccountForm({
          username: data.username,
          oldPassword: '',
          newPassword: '',
        });

        window.location.reload();
      } else {
        const errorData = await updateRes.json();
        console.error("Failed to save account settings:", errorData);
        toast.error("Update Failed", { description: errorData.message || "Could not update account settings." });
      }
    } catch (error) {
      console.error("Exception during account settings update:", error);
      const errorMessage = (error as AppwriteException)?.message || "An unexpected error occurred during update.";
      toast.error("Update Error", { description: errorMessage });
    }
  } 

  const watchedNewPassword = watchAccountForm("newPassword");

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <div className="px-16 py-4 mb-8">
            <Link href="/dashboard">
              <img src="logoWhite.svg" />
            </Link>
          </div>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={menuDisabled ? "#" : item.url}
                    className={cn(
                          "flex items-center w-full", // 기존 스타일 유지 (필요시 추가)
                          menuDisabled && "text-slate-500 cursor-not-allowed pointer-events-none"
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
            <Dialog open={isAccountSettingsDialogOpen} onOpenChange={(open) => {
              setIsAccountSettingsDialogOpen(open);
              if (open) {
                resetAccountForm({
                  username: user.name || '',
                  oldPassword: '',
                  newPassword: '',
                });
              }
            }}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton className="cursor-pointer">
                    <User2 /> {user.name}
                    <ChevronUp className="ml-auto" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-[--radix-popper-anchor-width] bg-[#1A2841] border border-slate-700"
              >
                <DialogTrigger asChild>
                  <DropdownMenuItem className="cursor-pointer text-white">Account Settings</DropdownMenuItem>
                </DialogTrigger>

                <Link href="/logout">
                  <DropdownMenuItem className="cursor-pointer text-white">Sign out</DropdownMenuItem>
                </Link>

              </DropdownMenuContent>
            </DropdownMenu>
              <DialogContent className="sm:max-w-md bg-[#1A2841] border-slate-700 border">
                <form onSubmit={handleSubmitAccountForm(onAccountSettingsSubmit)}>
                <DialogHeader>
                  <DialogTitle>Account Settings</DialogTitle>
                  <DialogDescription className="text-white">
                    Make changes to your account here. Click save when you're done.
                  </DialogDescription>
                </DialogHeader>
                <div className="mt-4 text-sm">
                  <div className="flex items-center justify-between gap-4 text-sm">
                  <label htmlFor="username">Username:</label>
                  <Input 
                    id="username"
                    {...registerAccountForm("username", { required: "Username is required" })} 
                    disabled={isAccountFormSubmitting}
                    className="text-sm max-w-50"
                  />
                  </div>
                </div>
                <div className="gap-4 mt-4 text-sm">
                  <div className="flex items-center justify-between gap-4 text-sm">
                  <label htmlFor="oldPassword">Old password:</label>
                  <Input 
                    id="oldPassword"
                    type="password" 
                    {...registerAccountForm("oldPassword")} 
                    disabled={isAccountFormSubmitting}
                    className="text-sm max-w-50"
                  />
                  </div>
                </div>
                <div className="gap-4 mt-4 text-sm">
                  <div className="flex items-center justify-between gap-4 text-sm">
                  <label htmlFor="newPassword">New password:</label>
                  <Input
                    id="newPassword"
                    type="password"
                    {...registerAccountForm("newPassword", {
                      minLength: watchedNewPassword ? { value: 8, message: "Min. 8 characters" } : undefined,
                    })}
                    disabled={isAccountFormSubmitting}
                    className="text-sm max-w-50"
                  />
                    </div>
                </div>
          <DialogFooter className="mt-4">
            <Button type="submit" className="cursor-pointer">Save Changes</Button>
          </DialogFooter>
          </form>
          <div className="mt-0">
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
            <DialogDescription className="text-white">
                    Permanently delete your account. This action cannot be undone.
                  </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
              <DialogClose asChild>
                <Button variant="ghost" className="cursor-pointer">Cancel</Button>
              </DialogClose>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button className="w-30 bg-red-600 hover:bg-red-700 cursor-pointer">
                    Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-[#1A2841] border-slate-700 border">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription className="text-white">
                      This action cannot be undone. This will permanently delete your
                      account and remove your data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="cursor-pointer bg-[#1A2841]">Cancel</AlertDialogCancel>
                    <AlertDialogAction className="cursor-pointer">
                      <Link href="/">
                        Continue
                      </Link>
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
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
  menuDisabled=false,
}: {
  children: React.ReactNode;
  user: Models.User<Models.Preferences>;
  menuDisabled?: boolean;
}) {
  return (
    <SidebarProvider>
      <AppSidebar user={user} menuDisabled={menuDisabled}/>
      <main className="w-full p-5 flex">
        <SidebarTrigger className="cursor-pointer" />
        <div className="grow mr-8">{children}</div>
      </main>
    </SidebarProvider>
  );
}
