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
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { columns } from "./columns";

type CreateTeamInputs = {
  name: string;
};
function CreateTeamForm() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreateTeamInputs>();

  const router = useRouter();

  const onSubmit: SubmitHandler<CreateTeamInputs> = async (data) => {
    const account = new Account(getAppwriteClient());
    const jwt = (await account.createJWT()).jwt;
    const createTeamRes = await backendFetch(
      "/teams",
      "POST",
      jwt,
      JSON.stringify({
        name: data.name,
        ipBlock16: "10.2.0.0",
      }),
    );

    if (createTeamRes.ok) {
      router.push("/dashboard");
      return;
    } else {
      console.log(await createTeamRes.json());
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
        />
        </div>
        <div className="flex-grow"></div>
        <Button className="mr-0" type="submit">Confirm</Button>
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

export default function DashboardPage() {
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(
    null,
  );
  const [invitations, setInvitations] = useState<InvitationInfo[]>([]);

  const router = useRouter();

  useEffect(() => {
    try {
      (async () => {
        const u = await getCurrentUser();
        setUser(u);
        setLoading(false);

        if (!u) {
          router.push("/login");
          return;
        } else if (u && !u.emailVerification) {
          router.push("/verify-email");
          return;
        }

        const account = new Account(getAppwriteClient());
        const jwt = (await account.createJWT()).jwt;

        // Check if user is in a team
        const meRes = await backendFetch("/users/me", "GET", jwt);
        const meJson = await meRes.json();
        const teams: string[] = meJson["teamIds"];
        if (teams.length > 0) {
          router.push("/dashboard");
          return;
        }

        // Get invitations
        const invitationRes = await backendFetch(
          "/me/invitations?status=pending",
          "GET",
          jwt,
        );
        const invitationJsons: any[] = await invitationRes.json();
        const invitations: InvitationInfo[] = invitationJsons.map((invi) => {
          return {
            id: invi["$id"],
            senderName: invi["inviter"]["name"],
            senderEmail: invi["inviter"]["email"],
            invitation_time: new Date(invi["createdAt"]),
          };
        });
        setInvitations(invitations);
      })();
    } catch (e) {
      console.log(e);
    }
  }, []);

  if (loading) return <></>;

  return (
    <MainLayout user={user!} menuDisabled={true}>
    <div className="mx-8 mt-8">
      <p className="text-center text-3xl">Hello, {user?.name}</p>
      <div className="mt-4">
        <p className="text-2xl">Create a team</p>
        <p className="mt-4">Create your own team and become an owner</p>
        <div className="w-full p-4 flex gap-4 mt-4 shadow-md rounded-md">
          <CreateTeamForm />
        </div>
      </div>

      <div className="mt-4">
        <p className="text-2xl">Join in a team</p>
        <p className="mt-4">
          Check the invitations you got and join in a team. After you choose one
          team, others are automatically rejected.
        </p>
        <div>
          <DataTable columns={columns} data={invitations} filterColumnKey="id"/>
        </div>
      </div>
    </div>
    </MainLayout>
  );
}
