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
import { useEffect, useMemo, useState } from "react";
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
  } = useForm<InviteInputs>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const onSubmit: SubmitHandler<InviteInputs> = async (data) => {
    const account = new Account(getAppwriteClient());
    const jwt = (await account.createJWT()).jwt;
    const inviteRes = await backendFetch(
      "/teams/me/invitations",
      "POST",
      jwt,
      JSON.stringify({
        email: data.email,
      }),
    );

    if (inviteRes.ok) {
      setIsDialogOpen(false);
      // we need to add some success event
      toast.success("Invitation Sent", {
        description: "The team invitation was sent successfully.",
        duration: 3000,
      })
    } else {
      console.log(await inviteRes.json());
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        {isOwner ? <Button>
          <div className="flex items-center gap-4">
            <Plus />
            Invite
          </div>
        </Button> : <Button disabled>
          <div className="flex items-center gap-4">
            <Plus />
            Invite
          </div>
        </Button>}
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
              {...register("email", { required: true })}
            />
          </div>
          <DialogFooter>
            <Button type="submit">Invite</Button>
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
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(
    null,
  );
  const [teamUsers, setTeamUsers] = useState<UserInfo[]>([]);
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    try {
      (async () => {
        const u = await getCurrentUser();
        setUser(u);
        setLoading(false);

        if (!loading && !user) {
          router.push("/login");
        }

        const account = new Account(getAppwriteClient());
        const jwt = (await account.createJWT()).jwt;

        // Check if user is in a team
        const meRes = await backendFetch("/users/me", "GET", jwt);
        const meJson = await meRes.json();
        const teams: string[] = meJson["teamIds"];
        if (teams.length == 0) {
          router.push("/onboarding");
        }

        // Get Team Users
        const teamUsersRes = await backendFetch("/teams/me/users", "GET", jwt);
        const teamUsersJsons: any[] = await teamUsersRes.json();
        const teamUsers: UserInfo[] = teamUsersJsons.map((usr) => {
          if (usr["role"] === "owner" && usr["$id"] === meJson["$id"]) setIsOwner(true);
          return {
            name: usr["name"],
            email: usr["email"],
            role: (usr["role"] ? usr["role"] : "member"),
            joinedAt: new Date(usr["joinedAt"]),
          };
        });
        setTeamUsers(teamUsers);
      })();
    } catch (e) {
      console.log(e);
    }
  }, []);

  const columns = useMemo(
    () => getColumns(isOwner),
    [isOwner]
  );

  if (loading) return <></>;

  return (
    <MainLayout user={user!}>
      <div className="ml-8">
        <div className="mt-18">
          <p className="text-2xl">Team</p>
          <div className="rounded-lg overflow-hidden">
            <DataTable columns={columns} data={teamUsers} filterColumnKey="name" option={<InviteButton isOwner={isOwner}/>}/>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
