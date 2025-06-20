"use client";
import MainLayout from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getAppwriteClient, getCurrentUser } from "@/lib/appwrite";
import { backendFetch } from "@/lib/utils";
import { Account, Models } from "appwrite";
import { AlertCircleIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
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
} from "@/components/ui/alert-dialog";


interface TeamUpdateInfo {
  name: string;
  octet1: string;
  octet2: string;
}

interface TeamInfo {
  id: string;
  name: string;
  subnet: string;
  octet1: number;
  octet2: number;
  totalMembers: number;
}

function LeaveButton({ onLeave }: { onLeave: () => Promise<void> }) {
  const [isLeaving, setIsLeaving] = useState(false);
  const router = useRouter();

  const handleLeave = async () => {
    router.push("/logout");
  };

  return (
    <div className="shadow-sm max-w-lg mt-8 p-4 border border-red-500/30 rounded-md bg-red-950/50">
      <h3 className="text-xl font-medium mb-2">Leave Team</h3>
      <p className="mt-2 text-sm">
        Are you sure you want to leave this team? You’ll immediately lose access to all shared devices and containers.
      </p> 
      <div className="mt-6 flex justify-end">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button className="w-28 bg-red-600 hover:bg-red-700 cursor-pointer">
              Leave Team
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-[#1A2841] border-slate-700 border">
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription className="text-white">
                This action is irreversible and cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="cursor-pointer bg-[#1A2841]">Cancel</AlertDialogCancel>
              <AlertDialogAction className="cursor-pointer" onClick={handleLeave}>Continue</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

function DeleteButton({ onDelete, memberCount}: { onDelete: () => Promise<void>, memberCount: number }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const canDelete = memberCount === 1;

  const handleDelete = async () => {
    if (!canDelete) {
      toast.error("Cannot delete team", {
        description: "Team can only be deleted if you are the sole member."
      });
      return;
    }
  };

  return (
    <div className="shadow-sm max-w-lg mt-8 p-4 border border-red-500/30 rounded-md bg-red-950/60">
      <h3 className="text-xl font-medium mb-2">Delete Team</h3>
      <p className="mt-2 text-sm">
        Before proceeding to delete your team, please be aware that this action is irreversible. This deletion can only be performed only if the team currently has no other members.
      </p> 
      <div className="mt-6 flex justify-end">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button className="w-28 bg-red-600 hover:bg-red-700 cursor-pointer">
              Delete Team
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-[#1A2841] border-slate-700 border">
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription className="text-white">
                This action is irreversible and cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="cursor-pointer bg-[#1A2841]">Cancel</AlertDialogCancel>
              <AlertDialogAction className="cursor-pointer" onClick={handleDelete}>Continue</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

export default function SettingPage() {
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [isSettingsLoading, setIsSettingsLoading] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(
    null,
  );
  const [team, setTeam] = useState<TeamInfo | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const router = useRouter();

  const { register, handleSubmit, setValue, formState: { errors, isDirty } } = useForm<TeamUpdateInfo>({
    defaultValues: {
      name: "",
      octet1: "",
      octet2: "",
    }
  });

  const loadTeamSettings = useCallback(async () => {
    if (!user || !user.$id) {
      console.log("User not available for loading team settings.");
      return;
    }
    
    setIsSettingsLoading(true);
    try {
      const account = new Account(getAppwriteClient());
      const jwt = (await account.createJWT()).jwt;

      // Get team info
      const teamRes = await backendFetch("/teams/me/", "GET", jwt);
      if (!teamRes.ok) throw new Error(`Failed to fetch team info: ${teamRes.statusText}`);
      const teamJson: any = await teamRes.json();
        
      const parts = teamJson["ipBlock16"].split('.');
      setValue("name", teamJson["name"] || "");
      setValue("octet1", parts[0]);
      setValue("octet2", parts[1]);

      const teamData: TeamInfo = {
        id: teamJson["$id"],
        name: teamJson["name"],
        subnet: teamJson["ipBlock16"],
        octet1: parseInt(parts[0]),
        octet2: parseInt(parts[1]),
        totalMembers: teamJson["total"],
      };
      setTeam(team);

      const rolePayload = { teamId: teamData.id, userId: user?.$id};
      const roleRes = await backendFetch("/users/role", "POST", jwt, rolePayload); 
      if (!roleRes.ok) throw new Error(`Failed to fetch user role: ${roleRes.statusText}`);
      const roleJson: any = await roleRes.json();
      setRole(roleJson["roles"]?.[0] || "member");
    } catch (e) {
      console.error("Failed to load team settings:", e);
      setTeam(null);
      setRole(null);
    } finally {
      setIsSettingsLoading(false);
    }
  }, [user, setValue]);

  useEffect(() => {
    const initializePage = async () => {
      setInitialLoading(true);
      try {
        const user = await getCurrentUser();
        setUser(user);

        if (!user) {
          router.push("/login");
          setInitialLoading(false);
          return;
        }

        const account = new Account(getAppwriteClient());
        const jwt = (await account.createJWT()).jwt;

        // Check if user is in a team
        const meRes = await backendFetch("/users/me", "GET", jwt);
        if (!meRes.ok) throw new Error("Failed to perform initial user check.");
        const meJson = await meRes.json();
        const teams: string[] = meJson["teamIds"];
        if (teams.length == 0) {
          router.push("/onboarding");
          setInitialLoading(false);
          return;
        }
      } catch (e) {
        console.error("Initialization error:", e);
      } finally {
        setInitialLoading(false);
      }
    };
    initializePage();
  }, [router]);

  useEffect(() => {
    if (user && !initialLoading) {
      loadTeamSettings();
    }
  }, [user, initialLoading, loadTeamSettings]);

  const onUpdateTeamSubmit: SubmitHandler<TeamUpdateInfo> = async (data) => {
    if (!team?.id || role !== "owner") {
      toast.error("Permission Denied", {
        description: "Only team owners can update settings."
      });
      return;
    }

    setIsUpdating(true);
    try {
      const account = new Account(getAppwriteClient());
      const jwt = (await account.createJWT()).jwt;
      // api doesn't working
    } catch (e) {
      console.error("Failed to update team settings:", e);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLeaveTeam = async () => {
    if (!team?.id) {
      toast.error("Team information is not available.");
      return;
    }
    if (role === "owner") {
      toast.error("Owners must transfer ownership or delete the team (if sole member).");
      return;
    }

    try {
      const account = new Account(getAppwriteClient());
      const jwt = (await account.createJWT()).jwt;
    } catch (e) {
      console.error("Leave team error:", e);
    }
  };

  const handleDeleteTeam = async () => {
    if (!team?.id || role !== "owner" || team.totalMembers !== 1) {
      toast.error("Deletion Not Allowed", {
        description: "Only the sole owner can delete the team.",
      });
      return;
    }

    try {
      const account = new Account(getAppwriteClient());
      const jwt = (await account.createJWT()).jwt;
    } catch (e) {
      console.error("Delete team error:", e);
    }
  };

  if (initialLoading) return <></>;

  const isOwner = role === "owner";

  return (
    <MainLayout user={user!}>
      <div className="ml-8">
        <div className="mt-18">
          <p className="text-2xl font-michroma">Team Settings</p>
          <div className="mt-4 max-w-lg">
          <Alert className="bg-[#1A2841]">
            <AlertCircleIcon color="white" />
            <AlertTitle className="text-white">Important Note</AlertTitle>
            <AlertDescription className="text-white">
              Only the team owner can update or delete the team on this page.
            </AlertDescription>
          </Alert>
          </div>

          <div className="bg-[#1A2841] mt-8 gap-4 flex max-w-4xl shadow-sm max-w-lg p-4 border rounded-md">
            <form className="w-full">
              <div className="grid gap-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                  <label htmlFor="teamName" className="w-full sm:w-32 flex-shrink-0 mb-1 sm:mb-0">
                    Team name:
                  </label>
                  <Input
                    id="teamName"
                    placeholder="Enter team name"
                    className="w-43 sm:w-43 sm:max-w-sm"
                    {...register("name")}
                    disabled={!isOwner || isSettingsLoading || isUpdating}
                  />
                </div>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                  <label htmlFor="subnetOctet1" className="w-full sm:w-32 flex-shrink-0 mb-1 sm:mb-0 pt-1">
                    Team subnet:
                  </label>
                  <div className="flex items-center gap-1"> 
                    <Input
                      id="subnetOctet1"
                      type="tel"
                      className="w-14 text-center"
                      placeholder="XXX"
                      maxLength={3}
                      title="Please enter a number between 0 and 255."
                      inputMode="numeric"
                      {...register("octet1", {
                        pattern: {
                          value: /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
                          message: "0-255"
                        }
                      })}
                      disabled={!isOwner || isSettingsLoading || isUpdating}
                    />
                    <span className="text-gray-600 text-lg font-medium">.</span>
                    <Input
                      id="subnetOctet2"
                      type="tel"
                      className="w-14 text-center"
                      placeholder="YYY"
                      maxLength={3}
                      title="Please enter a number between 0 and 255."
                      inputMode="numeric"
                      {...register("octet2", {
                        pattern: {
                          value: /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
                          message: "0-255"
                        }
                      })}
                      disabled={!isOwner || isSettingsLoading || isUpdating}
                    />
                    <span className="text-gray-600 text-sm pt-px">.0.0/16</span> {/* pt-px for fine-tuning alignment */}
                  </div>
                </div>
              </div>
                
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={!isOwner || isSettingsLoading || isUpdating}
                  className="mt-4 py-4 cursor-pointer"
                >
                  Update
                </Button>
              </div>
            </form>
          </div>

          <div>
          {role !== null && (
            isOwner
            ? <DeleteButton onDelete={handleDeleteTeam} memberCount={team?.totalMembers || 0}/>   
            : <LeaveButton onLeave={handleLeaveTeam}/>    
          )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
