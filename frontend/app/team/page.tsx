"use client";
import { ReloadButton } from "@/components/common/ReloadButtion";
import MainLayout from "@/components/MainLayout";
import { TimeAgo } from "@/components/TimeAgo";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getAppwriteClient, getCurrentUser } from "@/lib/appwrite";
import { backendFetch } from "@/lib/utils";
import { Account, Models } from "appwrite";
import { LucideSearch, Plus, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { DataTable } from "@/components/ui/data-table"
import { toast } from "sonner";
import { getColumns } from "./columns";

type InviteInputs = {
  email: string;
};

function InviteButton({isOwner} : {isOwner: boolean}) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<InviteInputs>({
    defaultValues: {
      email: ""
    }
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const onSubmit: SubmitHandler<InviteInputs> = async (data) => {
    try {
      const account = new Account(getAppwriteClient());
      const jwt = (await account.createJWT()).jwt;
      const inviteRes = await backendFetch(
        "/teams/me/invitations",
        "POST",
        jwt,
        {
          email: data.email,
        },
      );

      if (inviteRes.ok) {
        // we need to add some success event
        toast.success("Invitation Sent", {
          description: "The team invitation was sent successfully.",
          duration: 3000,
        });
      } else {
        const errorData = await inviteRes.json();
        toast.error(errorData["error"], {
        description: errorData["message"],
        duration:3000,
      });
      }
    } catch (e) {
      console.error("Error submitting invitation: ", e);
      toast.error("An Unexpected Error Occurred", {
        description: "Please try again later.",
        duration:3000,
      });
    } finally {
      setIsDialogOpen(false);
      reset();
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button className="cursor-pointer" disabled={!isOwner}>
          <div className="flex items-center gap-4">
            <Plus />
            Invite
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Invite Member</DialogTitle>
            <DialogDescription>
              Invite a user to join your team
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Email"
              {...register("email", { 
                required: true,
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address"
                }
              })}
            />
          </div>
          <DialogFooter>
            <Button className="cursor-pointer" type="submit">Invite</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export interface UserInfo {
  name: string;
  email: string;
  role: "owner" | "member";
  joinedAt: Date;
}

export default function TeamPage() {
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [isTeamUsersLoading, setIsTeamUsersLoading] = useState<boolean>(false);
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(
    null,
  );
  const [teamUsers, setTeamUsers] = useState<UserInfo[]>([]);
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const router = useRouter();

  const loadTeamUsers = useCallback(async () => {
    if (!user) {
      console.log("User not available, cannot load team users.");
      return;
    }

    const userId = user.$id;

    setIsTeamUsersLoading(true);
    try {
      const account = new Account(getAppwriteClient());
      const jwt = (await account.createJWT()).jwt;

      // Get Team Users
      const teamUsersRes = await backendFetch("/teams/me/users", "GET", jwt);
      if (!teamUsersRes.ok) throw new Error(`Failed to fetch team users: ${teamUsersRes.statusText} (${teamUsersRes.status})`);
      const teamUsersJsons: any[] = await teamUsersRes.json();
      const fetchedTeamUsers: UserInfo[] = teamUsersJsons.map((usr) => {
          if (usr["role"] === "owner" && usr["$id"] === userId) setIsOwner(true);
          return {
            name: usr["name"],
            email: usr["email"],
            role: usr["role"] || "member",
            joinedAt: new Date(usr["joinedAt"]),
          };
      });

      setTeamUsers(fetchedTeamUsers);
    } catch (e) {
      console.error("Failed to load team users:", e);
      setTeamUsers([]);
      setIsOwner(false);
    } finally {
      setIsTeamUsersLoading(false);
    }
  }, [user]);

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
        if (!meRes.ok) {
          throw new Error(`Failed to fetch user info: ${meRes.statusText}`);
        }
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
      loadTeamUsers();
    }
  }, [user, initialLoading, loadTeamUsers]);

  const columns = useMemo(
    () => getColumns(isOwner),
    [isOwner]
  );

  if (initialLoading) return <></>;

  return (
    <MainLayout user={user!}>
      <div className="ml-8">
        <div className="mt-18">
          <p className="text-2xl font-michroma">Team</p>
          <div>
            <DataTable 
              columns={columns} 
              data={teamUsers} 
              filterColumnKey="name" 
              option={
                <div className="flex gap-4">
                  <InviteButton isOwner={isOwner}/>
                  <ReloadButton onClick={loadTeamUsers} isLoading={isTeamUsersLoading}/>
                </div>
              }
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
