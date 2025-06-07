"use client";
import MainLayout from "@/components/MainLayout";
import { TimeAgo } from "@/components/TimeAgo";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { getAppwriteClient, getCurrentUser } from "@/lib/appwrite";
import { backendFetch } from "@/lib/utils";
import { Account, Models } from "appwrite";
import { Check, LucideSearch, Plus, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { getInvitationColumns } from "./columns";
import { ReloadButton } from "@/components/common/ReloadButtion";
import { toast } from "sonner";

type CreateTeamInputs = {
  name: string;
};

function CreateTeamForm() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateTeamInputs>();
  const router = useRouter();

  const onSubmit: SubmitHandler<CreateTeamInputs> = async (data) => {
    try {
      const account = new Account(getAppwriteClient());
      const jwt = (await account.createJWT()).jwt;
      const createTeamRes = await backendFetch(
        "/teams",
        "POST",
        jwt,
        {
          name: data.name,
        },
      );

      if (createTeamRes.ok) {
        toast.success("Team Created!", {
          description: "Redirecting to your dashboard..."
        });
        router.push("/dashboard");
        return;
      } else {
        const errorData = await createTeamRes.json();
        console.error("Team creation failed: ", errorData);
        toast.error("Team Creation Failed", {
          description: errorData.message || "Could not create the team.",
        });
      }
    } catch (error) {
      console.error("Error submitting create team form:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full">
      <div className="flex gap-5">
        <div className="w-full max-w-2xl">
          <Input
            className="grow max-w-2xl"
            placeholder="Team name here"
            {...register("name", { required: true })}
            disabled={isSubmitting}
          />
        </div>
        <div className="flex-grow"></div>
        <Button className="mr-0 cursor-pointer" type="submit" disabled={isSubmitting}>Confirm</Button>
      </div>
    </form>
  );
}

export interface InvitationInfo {
  id: string;
  senderName: string;
  senderEmail: string;
  invitation_time: Date;
}

export default function OnboardingPage() {
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [isInvitationsLoading, setIsInvitationsLoading] = useState<boolean>(false);
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(
    null,
  );
  const [invitations, setInvitations] = useState<InvitationInfo[]>([]);
  const [userHasTeam, setUserHasTeam] = useState<boolean | null>(null);

  const router = useRouter();

  const loadInvitations = useCallback(async () => {
    if (!user) {
      console.log("User not available, cannot load invitations.");
      return;
    }
    if (userHasTeam == true) return;

    setIsInvitationsLoading(true);
    try {
      const account = new Account(getAppwriteClient());
      const jwt = (await account.createJWT()).jwt;

      // Get invitations
        const invitationRes = await backendFetch(
          "/me/invitations?status=pending",
          "GET",
          jwt,
        );
        if (!invitationRes.ok) throw new Error(`Failed to fetch invitations: ${invitationRes.statusText} (${invitationRes.status})`);
        const invitationJsons: any[] = await invitationRes.json();
        const fetchedinvitations: InvitationInfo[] = invitationJsons.map((invi) => ({
          id: invi["$id"],
          senderName: invi["inviter"]["name"],
          senderEmail: invi["inviter"]["email"],
          invitation_time: new Date(invi["createdAt"]),
        }));
        setInvitations(fetchedinvitations);
      } catch (e) {
        console.error("Failed to load invitations:", e);
        setInvitations([]);
      } finally {
        setIsInvitationsLoading(false);
      }
  }, [user, userHasTeam]);

  useEffect(() => {
    const initializePage = async () => {
      setInitialLoading(true);
      setUserHasTeam(null);
      try {
        const user = await getCurrentUser();
        setUser(user);

        if (!user) {
          router.push("/login");
          setInitialLoading(false);
          return;
        } else if (!user.emailVerification) {
          router.push("/verify-email");
          setInitialLoading(false);
          return;
        }

        const account = new Account(getAppwriteClient());
        const jwt = (await account.createJWT()).jwt;

        // Check if user is in a team
        const meRes = await backendFetch("/users/me", "GET", jwt);
        if (!meRes.ok) throw new Error(`Failed to perform initial user check: ${meRes.statusText}`);
        const meJson = await meRes.json();
        const teams: string[] = meJson["teamIds"] || [];
        if (teams.length > 0) {
          setUserHasTeam(true);
          toast.info("Already in a team!", { description: "Redirecting to your dashboard..."});
          router.push("/dashboard");
          setInitialLoading(false);
          return;
        } else {
          setUserHasTeam(false);
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
    if (user && !initialLoading && userHasTeam === false) {
      loadInvitations();
    }
  }, [user, initialLoading, userHasTeam, loadInvitations]);

  const memoizedColumns = useMemo(
    () => getInvitationColumns(loadInvitations, router.push),
    [loadInvitations, router]
  );

  if (initialLoading || userHasTeam === null) {
    return <div></div>
  };

  if (userHasTeam === true) { 
    return <div></div>
  };

  return (
    <MainLayout user={user!} menuDisabled={true}>
      <div className="mx-8 mt-8">
        <p className="text-center text-2xl font-michroma">Hello, {user?.name || "there"}</p>
        <div className="mt-4">
          <p className="text-2xl font-michroma">Create a team</p>
          <p className="mt-4 text-sm">Create your own team and become an owner</p>
          <div className="max-w-4xl p-4 flex gap-4 mt-4 shadow-md rounded-md bg-[#1A2841] border border-slate-700">
            <CreateTeamForm />
          </div>
        </div>

        <div className="mt-4">
          <p className="text-2xl font-michroma">Join in a team</p>
          <p className="mt-4 text-sm">
            Check the invitations you got and join in a team. After you choose one
            team, others are automatically rejected.
          </p>
          <div>
            <DataTable 
              columns={memoizedColumns} 
              data={invitations} 
              option={<ReloadButton onClick={loadInvitations} isLoading={isInvitationsLoading}/>}
              filterColumnKey="senderName"
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
