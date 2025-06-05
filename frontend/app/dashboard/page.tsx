"use client";
import { ReloadButton } from "@/components/common/ReloadButtion";
import MainLayout from "@/components/MainLayout";
import { TimeAgo } from "@/components/TimeAgo";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { getAppwriteClient, getCurrentUser } from "@/lib/appwrite";
import { backendFetch } from "@/lib/utils";
import { Account, Models } from "appwrite";
import { LucideSearch, Plus, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { columns } from "./columns";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import * as React from "react";

interface ContainerInfo {
  name: string;
  deviceName: string;
  image: string;
}

export interface DeviceInfo {
  name: string;
  subnet: string;
  userEmail: string;
  last_activate: Date;
}

function ContainerCard({ container }: { container: ContainerInfo }) {
  const [showTip, setShowTip] = useState(false);
  const text = `${container.name}.${container.deviceName}.test`;

  const handleCopy = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setShowTip(true); 
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  }, [text]);

  useEffect(() => {
    if (!showTip) return;
    const id = setTimeout(() => setShowTip(false), 1500);
    return () => clearTimeout(id);
  }, [showTip]);

  const fadeEffectClasses = "whitespace-nowrap overflow-hidden [mask-image:linear-gradient(to_right,black_75%,transparent_100%)]";

  const cardContent = (
    <div 
      className="p-5 w-40 shadow-sm rounded-lg cursor-pointer select-none hover:bg-muted bg-white dark:bg-gray-800" 
      onClick={handleCopy}
    >
      <p className={`h-9 font-bold ${fadeEffectClasses}`}>
        {container.name} 
      </p>
      <p className={`${fadeEffectClasses}`}>
        {container.image}
      </p>
      <p className={`${fadeEffectClasses}`}>
        {container.deviceName}
      </p>
    </div>
  );

  return (
    <Tooltip open={showTip} delayDuration={200}>
      <TooltipTrigger asChild>{cardContent}</TooltipTrigger>
      <TooltipContent>
        <p>Copied DNS name!</p>
      </TooltipContent>
    </Tooltip>
  );
}

function ContainerScrollArea({ containers }: {containers: ContainerInfo[]}) {
  return (
    <ScrollArea className="w-full whitespace-nowrap">
      <div className="flex gap-5 mt-4 mb-4">
        {containers.map((cont) => (
          <ContainerCard container={cont} key={cont.name}/>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}

function AddDeviceButton() {
  return (
    <Button className="cursor-pointer">
      <div className="flex items-center gap-4">
        <Plus />
        Add Device
      </div>
    </Button>
  );
}

export default function DashboardPage() {
  const [initialLoading, setInitialLoading] = useState<boolean>(false);
  const [isReadyForDashboard, setIsReadyForDashboard] = useState<boolean>(false);
  const [isDataLoading, setIsDataLoading] = useState<boolean>(false);
  const [isDevicesLoading, setIsDevicesLoading] = useState<boolean>(false);
  const [isContainersLoading, setIsContainersLoading] = useState<boolean>(false);
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(
    null,
  );
  const [containers, setContainers] = useState<ContainerInfo[]>([]);
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const router = useRouter();

  const loadContainers = useCallback(async () => {
    if (!user) {
      console.log("User not available, cannot load containers.");
      return;
    }
  
    console.log("fetch container");
    setIsContainersLoading(true);
    try {
      const account = new Account(getAppwriteClient());
      const jwt = (await account.createJWT()).jwt;
  
      const containersRes = await backendFetch(
        "/teams/me/containers",
        "GET",
        jwt,
      );
      if (!containersRes.ok) {
        throw new Error(`Failed to fetch containers: ${containersRes.statusText} (${containersRes.status})`);
      }
      const containerJsons: any[] = await containersRes.json();
      const fetchedContainers: ContainerInfo[] = containerJsons.map((cont) => ({
        name: cont["name"],
        userEmail: cont["device"]["user"]["email"],
        image: cont["image"],
        deviceName: cont["device"]["name"],
        ip: cont["ip"],
        last_seen: new Date(cont["lastAccessed"])
      }));
      setContainers(fetchedContainers);
    } catch (e) {
      console.error("Failed to load containers:", e);
      setContainers([]);
    } finally {
      setIsContainersLoading(false);
    }
  }, [user]);

  const loadDevices = useCallback(async () => {
    if (!user) {
      console.log("User not available, cannot load devices.");
      return;
    }
  
    console.log("fetch device");
    setIsDevicesLoading(true);
    try {
      const account = new Account(getAppwriteClient());
      const jwt = (await account.createJWT()).jwt;
  
      const devicesRes = await backendFetch("/teams/me/devices", "GET", jwt);
      if (!devicesRes.ok) {
        throw new Error(`Failed to fetch devices: ${devicesRes.statusText}`);
      }
      const deviceJsons: any[] = await devicesRes.json();
      const fetchedDevices: DeviceInfo[] = deviceJsons.map((dev) => ({
        name: dev["name"],
        subnet: dev["ipBlock24"],
        userEmail: dev["user"]["email"],
        last_activate: new Date(dev["lastActivatedAt"]),
      }));
  
      setDevices(fetchedDevices);
    } catch (e) {
      console.error("Failed to load devices:", e);
      setDevices([]);
    } finally {
      setIsDevicesLoading(false);
    }
  }, [user]);

  const loadDashBoardData = useCallback(async () => {
    if (!user) return;

    try {
      await Promise.all([
        loadContainers(),
        loadDevices()
      ]);
    } catch (e) {
      console.error("Failed to load dashboard data (outer catch):", e);
    } finally {
      setIsDataLoading(false);
    }
  }, [user, loadContainers, loadDevices]);

  useEffect(() => {
    const initializePage = async () => {
      setInitialLoading(true);
      setIsReadyForDashboard(false);
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

        console.log(jwt);

        // Check if user is in a team
        const meRes = await backendFetch("/users/me", "GET", jwt);
        if (!meRes.ok) throw new Error(`Initial user check failed: ${meRes.statusText}`);
        const meJson = await meRes.json();
        const teams: string[] = meJson["teamIds"] || [];
        if (teams.length == 0) {
          router.push("/onboarding");
          setInitialLoading(false);
          return;
        }

        setIsReadyForDashboard(true);
      } catch (e) {
        console.error("Initialization error:", e);
      } finally {
        setInitialLoading(false);
      }
    };
    initializePage();
  }, [router]);

  useEffect(() => {
    if (isReadyForDashboard) {
      loadDashBoardData();
    }
    if (!user && !initialLoading) {
      setContainers([]);
      setDevices([]);
    }
  }, [isReadyForDashboard, user, initialLoading, loadDashBoardData]);

  useEffect(() => {
    if (!user || !isReadyForDashboard || !process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || !process.env.NEXT_PUBLIC_APPWRITE_CONTAINER_COLLECTION_ID) {
      return;
    }

    const client = getAppwriteClient();
    let unsubscribe: (() => void) | undefined;
    const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
    const collectionId = process.env.NEXT_PUBLIC_APPWRITE_CONTAINER_COLLECTION_ID;
    const channel = `databases.${databaseId}.collections.${collectionId}.documents`;  
    
    try {
      unsubscribe = client.subscribe(channel, response => {
        loadContainers();
      });
    } catch (error) {
      console.log("subscribe error");
    }
    return () => { if (unsubscribe) unsubscribe()};
  }, [user, isReadyForDashboard, loadContainers]);

  if (initialLoading || !user) return <></>;
  if (!user || !isReadyForDashboard) {
    return <div></div>
  }

  return (
    <MainLayout user={user}>
      <div className="ml-8">
        <div>
          <p className="text-2xl">Recent Containers</p>
          <div className="max-w-4xl">
            <div className="container">
              <ContainerScrollArea containers={containers}/>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <p className="text-2xl">Devices</p>
          <div>
            <DataTable 
              columns={columns} 
              data={devices} 
              filterColumnKey="name" 
              option={
                <div className="flex gap-4">
                  <AddDeviceButton/>
                  <ReloadButton onClick={loadDevices}/>
                </div>
              }
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
