"use client";
import MainLayout from "@/components/MainLayout";
import { TimeAgo } from "@/components/TimeAgo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getAppwriteClient, getCurrentUser } from "@/lib/appwrite";
import { backendFetch } from "@/lib/utils";
import { Account, Models } from "appwrite";
import { Check, LucideSearch, Plus, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface InvitationInfo {
  id: string;
  sender: string;
  invitation_time: Date;
}

function InvitationTable({ invitations }: { invitations: InvitationInfo[] }) {
  const router = useRouter();
  return (
    <div className="flex gap-5 max-w-4xl justify-between w-full">
      <div className="grow">
        <p className="grow text-lg mb-5">Name</p>
        {invitations.map((invi) => {
          return (
            <div className="h-10" key={invi.invitation_time.toTimeString()}>
              {invi.sender}
            </div>
          );
        })}
      </div>
      <div className="grow">
        <p className="grow text-lg mb-5">Invitation Date</p>
        {invitations.map((invi) => {
          return (
            <div className="h-10" key={invi.invitation_time.toLocaleString()}>
              {invi.invitation_time.toLocaleString()}
            </div>
          );
        })}
      </div>
      <div className="grow text-center">
        <p className="grow text-lg mb-5">Select</p>
        {invitations.map((invi) => {
          return (
            <div
              className="flex justify-center mx-auto cursor-pointer"
              onClick={async () => {
                try {
                  const account = new Account(getAppwriteClient());
                  const jwt = (await account.createJWT()).jwt;
                  const joinRes = await backendFetch(
                    "/invitations/" + invi.id + "/accept",
                    "POST",
                    jwt,
                  );

                  if (joinRes.ok) {
                    router.push("/dashboard");
                  } else {
                    console.log(await joinRes.json());
                  }
                } catch (e) {
                  console.log(e);
                }
              }}
            >
              <Check />
            </div>
          );
        })}
      </div>
    </div>
  );
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
        }

        const account = new Account(getAppwriteClient());
        const jwt = (await account.createJWT()).jwt;

        // Check if user is in a team
        const meRes = await backendFetch("/users/me", "GET", jwt);
        const meJson = await meRes.json();
        const teams: string[] = meJson["teamIds"];
        if (teams.length > 0) {
          router.push("/dashboard");
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
            sender: invi["inviter"]["email"],
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
    <div className="mx-8 mt-8">
      <p className="text-center text-3xl">Hello, {user?.name}</p>
      <div className="mt-4">
        <p className="text-2xl">Create a team</p>
        <p className="mt-4">Create your own team and become an owner</p>
        <div className="w-full p-4 flex gap-4 mt-4 shadow-md rounded-md">
          <Input placeholder="Team name here" />
          <Button>Confirm</Button>
        </div>
      </div>

      <div className="mt-4">
        <p className="text-2xl">Join in a team</p>
        <p className="mt-4">
          Check the invitations you got and join in a team. After you choose one
          team, others are automatically rejected.
        </p>

        <div className="flex gap-5 mt-4">
          <InvitationTable invitations={invitations} />
        </div>
      </div>
    </div>
  );
}
