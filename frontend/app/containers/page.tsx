"use client";
import MainLayout from "@/components/MainLayout";
import { TimeAgo } from "@/components/TimeAgo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { getAppwriteClient, getCurrentUser } from "@/lib/appwrite";
import { backendFetch } from "@/lib/utils";
import { Account, Models } from "appwrite";
import { LucideSearch, Plus, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface ContainerInfo {
  name: string;
  deviceName: string;
  image: string;
  ip: string;
  last_seen: Date;
}

function ContainerTable({ containers }: { containers: ContainerInfo[] }) {
  return (
    <div className="flex gap-5 max-w-4xl justify-between">
      <div>
        <p className="grow text-lg mb-5">Name</p>
        {containers.map((cont) => {
          return (
            <div className="h-10" key={cont.ip}>
              {" "}
              {cont.name}
            </div>
          );
        })}
      </div>
      <div>
        <p className="text-center grow text-lg mb-5">Image</p>
        {containers.map((cont) => {
          return (
            <div className="h-10" key={cont.ip}>
              {" "}
              {cont.image}
            </div>
          );
        })}
      </div>
      <div>
        <p className="text-center grow text-lg mb-5">Assigned Ip</p>
        {containers.map((cont) => {
          return (
            <div className="h-10" key={cont.ip}>
              {" "}
              {cont.ip}
            </div>
          );
        })}
      </div>
      <div>
        <p className="text-center grow text-lg mb-5">Last Seen</p>
        {containers.map((cont) => {
          return (
            <div className="h-10" key={cont.ip}>
              <TimeAgo timestamp={cont.last_seen} />
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
        Add Container
      </div>
    </Button>
  );
}

export default function DashboardPage() {
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(
    null,
  );
  const [containers, setContainers] = useState<ContainerInfo[]>([]);
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

        // Get containers
        const containersRes = await backendFetch(
          "/teams/me/containers",
          "GET",
          jwt,
        );
        const containerJsons: any[] = await containersRes.json();
        const containers: ContainerInfo[] = containerJsons.map((cont) => {
          return {
            name: cont["name"],
            image: cont["image"],
            deviceName: cont["device"]["name"],
            ip: cont["ip"],
            last_seen: new Date(cont["lastActivatedAt"])
          };
        });
        console.log(containers);
        setContainers(containers);
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
          <p className="text-2xl">Containers</p>
          <div className="mt-4 flex items-center gap-4">
            <div className="grow max-w-lg">
              <SearchBar />
            </div>
            <InviteButton />
            <ReloadButton />
          </div>
          <div className="mt-4">
            <ContainerTable containers={containers} />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
