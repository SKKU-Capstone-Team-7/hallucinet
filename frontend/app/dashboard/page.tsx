"use client";
import { ReloadButton } from "@/components/common/ReloadButtion";
import MainLayout from "@/components/MainLayout";
import { TimeAgo } from "@/components/TimeAgo";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { getAppwriteClient, getCurrentUser, getDBId } from "@/lib/appwrite";
import { backendFetch } from "@/lib/utils";
import { Account, Models } from "appwrite";
import { LucideSearch, Plus, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { columns } from "./columns";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import * as React from "react"

interface ContainerInfo {
  name: string;
  deviceName: string;
  image: string;
}

function ContainerCard({ container }: { container: ContainerInfo }) {
  const [showTip, setShowTip] = useState(false);

  const text = `${container.name}.${container.deviceName}.test`;

  const handleCopy = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setShowTip(true); 
    } catch (err) {
      console.error(err);
    }
  }, [text]);

  useEffect(() => {
    if (!showTip) return;
    const id = setTimeout(() => setShowTip(false), 1500);
    return () => clearTimeout(id);
  }, [showTip]);

  const fadeEffectClasses = "whitespace-nowrap overflow-hidden [mask-image:linear-gradient(to_right,black_75%,transparent_100%)]";

  return (
    <Tooltip open={showTip} delayDuration={200}>
      <TooltipTrigger asChild>
        <div 
          className="p-4 w-44 bg-[#1a2841] border border-[#e5e7eb] rounded-md shadow-sm cursor-pointer select-none hover:bg-[#273755] text-white"
          onClick={handleCopy}
        >
          <p className={`h-9 font-bold ${fadeEffectClasses} text-white`}>
            {container.name}
          </p>
          <p className={`${fadeEffectClasses} text-gray-400 text-sm`}>
            {container.image}
          </p>
          <p className={`${fadeEffectClasses} text-gray-300 text-sm`}>
            {container.deviceName}
          </p>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>Copied DNS name!</p>
      </TooltipContent>
    </Tooltip>
  );
}

function ContainerScrollArea({ containers }: {containers: ContainerInfo[]}) {
  return (
    <ScrollArea className="w-full whitespace-nowrap max-w-4xl rounded-md overflow-hidden" style={{backgroundColor: '#1a2841'}}>
      <div className="flex gap-4 mt-4 mb-4 px-4">
        {containers.map((cont) => (
          <ContainerCard container={cont} key={cont.name}/>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}

export interface DeviceInfo {
  name: string;
  subnet: string;
  userEmail: string;
  last_activate: Date;
}

function InviteButton() {
  return (
    <Button className="cursor-pointer bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded-md px-3 py-2 flex items-center gap-2 text-sm">
      <Plus size={16} />
      Add Device
    </Button>
  );
}

export default function DashboardPage() {
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(
    null,
  );
  const [containers, setContainers] = useState<ContainerInfo[]>([]);
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const router = useRouter();

  const refreshContainers = async () => {
    try {
        const account = new Account(getAppwriteClient());
        const jwt = (await account.createJWT()).jwt;

        const containersRes = await backendFetch("/teams/me/containers", "GET", jwt);

        const containerJsons: any[] = await containersRes.json();
        const fetchedContainers: ContainerInfo[] = containerJsons.map((cont) => ({
          name: cont["name"],
          image: cont["image"],
          deviceName: cont["device"]?.["name"] || "N/A",
        }));
        setContainers(fetchedContainers);
    } catch (error) {
      console.error("fetch container error");
    }
  }

  useEffect(() => {
    try {
      (async () => {
        const u = await getCurrentUser();
        setUser(u);
        setLoading(false);

        if (!u) {
          router.push("/login");
          return;
        } else if (!u.emailVerification) {
          router.push("/verify-email");
          return;
        }

        const account = new Account(getAppwriteClient());
        const jwt = (await account.createJWT()).jwt;

        // Check if user is in a team
        const meRes = await backendFetch("/users/me", "GET", jwt);
        const meJson = await meRes.json();
        const teams: string[] = meJson["teamIds"];
        if (teams.length === 0) {
          router.push("/onboarding");
          return;
        }

        const containersPromise = backendFetch("/teams/me/containers", "GET", jwt);
        const devicesPromise = backendFetch("/teams/me/devices", "GET", jwt);

        const [containersRes, devicesRes] = await Promise.all([
          containersPromise,
          devicesPromise,
        ]);

        // Containers
        const containerJsons: any[] = await containersRes.json();
        const containers: ContainerInfo[] = containerJsons.map((cont) => ({
          name: cont["name"],
          image: cont["image"],
          deviceName: cont["device"]["name"],
        }));
        setContainers(containers);

        // Devices
        const deviceJsons: any[] = await devicesRes.json();
        const devices: DeviceInfo[] = deviceJsons.map((dev) => ({
          name: dev["name"],
          subnet: dev["ipBlock24"],
          userEmail: dev["user"]["email"],
          last_activate: new Date(dev["lastActivatedAt"]),
        }));
        setDevices(devices);

      })();
    } catch (e) {
      console.error(e);
    }
  }, [router]);

  useEffect(() => {
    if (!user) {
      return;
    }

    const client = getAppwriteClient();

    let unsubscribe: (() => void) | undefined;
      
    const setupSubscribe = async () => {
      try {
        const databaseId = await getDBId("database");
        const collectionId = await getDBId("container");

        const channel = `databases.${databaseId}.collections.${collectionId}.documents`;

        unsubscribe = client.subscribe(channel, () => {
          refreshContainers();
        });
      } catch (error) {
        console.error("subscribe error:", error);
      }
    };

    setupSubscribe();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    }
  }, [user]);

  if (loading) return <></>;

  return (
    <MainLayout user={user!}>
      <div className="ml-8 mr-8 mt-4 mb-8 bg-[#050a12] flex flex-col h-full max-w-screen-xl">
        <section className="recent-containers">
          <h2 className="text-2xl font-semibold text-white mb-3">Recent Containers</h2>
          <ContainerScrollArea containers={containers}/>
        </section>

        <section className="devices-section mt-10 flex-grow flex flex-col">
          <h2 className="text-2xl font-semibold text-white mb-3">Devices</h2>
          <DataTable 
            columns={columns} 
            data={devices} 
            filterColumnKey="name" 
            option={<InviteButton/>} 
            className="devices-table"
          />
        </section>
      </div>
    </MainLayout>
  );
}
