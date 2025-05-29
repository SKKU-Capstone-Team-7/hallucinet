"use client";
import MainLayout from "@/components/MainLayout";
import { TimeAgo } from "@/components/TimeAgo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getAppwriteClient, getCurrentUser } from "@/lib/appwrite";
import { backendFetch } from "@/lib/utils";
import { Account, Models } from "appwrite";
import { LucideSearch, Plus, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface UserInfo {
    name: string;
    email: string;
    role: string;
    joinedAt: Date;
}

function UserTable({ users }: { users: UserInfo[] }) {
  return (
    <div className="flex gap-5 max-w-4xl justify-between">
      <div>
        <p className="grow text-lg mb-5">Name</p>
        {users.map((usr) => {
          return (
            <div className="h-10" key={usr.email}>
              {" "}
              {usr.name}
            </div>
          );
        })}
      </div>
      <div>
        <p className="grow text-lg mb-5">Role</p>
        {users.map((usr) => {
          return (
            <div className="h-10" key={usr.email}>
              {" "}
              {usr.role}
            </div>
          );
        })}
      </div>
       <div>
        <p className="text-center grow text-lg mb-5">Joined</p>
        {users.map((usr) => {
          return (
            <div className="h-10" key={usr.email}>
              <TimeAgo timestamp={usr.joinedAt} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SearchBar() {
  return (
    <div className="flex items-center shadow-sm rounded-sm">
      <div className="p-2">
        <LucideSearch />
      </div>
      <Input
        placeholder="Search"
        className="border-none shadow-none focus:border-none focus-visible:border-none focus-within:border-none outline-none"
      />
      <button></button>
    </div>
  );
}

function ReloadButton() {
  return (
    <Button>
      <RefreshCw />
    </Button>
  );
}

function InviteButton() {
  return (
    <Button>
      <div className="flex items-center gap-4">
        <Plus />
        Invite
      </div>
    </Button>
  );
}

export default function TeamPage() {
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(
    null,
  );
  const [teamUsers, setTeamUsers] = useState<UserInfo[]>([]);
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

        console.log(jwt); 
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
        console.log(teamUsersJsons);
        const teamUsers: UserInfo[] = teamUsersJsons.map((usr) => {
            return {
                name: usr["name"],
                email: usr["email"],
                role: usr["role"],
                joinedAt: new Date(usr["joinedAt"])
            };
        });
        setTeamUsers(teamUsers);
      })();
    } catch (e) {
      console.log(e);
    }
  }, []);

  if (loading) return <></>;

  return (
    <MainLayout user={user!}>
      <div className="ml-8">
        <div className="mt-48">
          <p className="text-2xl">Team</p>
          <div className="mt-4 flex items-center gap-4">
            <div className="grow max-w-lg">
              <SearchBar />
            </div>
            <InviteButton />
            <ReloadButton />
          </div>
          <div className="mt-4">
            <UserTable users={teamUsers} />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
