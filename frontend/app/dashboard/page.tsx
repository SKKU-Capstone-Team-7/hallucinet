"use client";

import { ReloadButton } from "@/components/common/ReloadButtion";
import MainLayout from "@/components/MainLayout";
import { Button, buttonVariants } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { getAppwriteClient, getCurrentUser } from "@/lib/appwrite";
import { backendFetch, cn } from "@/lib/utils";
import { Account, Models } from "appwrite";
import { Check, Copy, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  DialogTrigger
} from '@/components/ui/dialog';
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
import * as React from "react";
import { getDeviceColumns } from "./columns";
import { toast } from "sonner";

interface ContainerInfo {
  name: string;
  deviceName: string;
  image: string;
}

export interface DeviceInfo {
  id: string;
  name: string;
  subnet: string;
  userEmail: string;
  last_activate: Date;
  userId: string;
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
      className="p-5 w-40 rounded-lg cursor-pointer select-none
               bg-[#1A2841] hover:bg-[#253754]" 
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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const title ="Add New Device";
  const description = "Run the following command on your new device to register it.";
  const script = "curl -fsSL https://tailscale.com/install.sh | sh";

  const handleCopy = useCallback(async () => {
    try {
      navigator.clipboard.writeText(script);

      setIsCopied(true);
      toast.success("Script copied to clipboard!");

      setTimeout(() => setIsCopied(false), 1500);
    } catch (e) {
      toast.error("Failed to copy script.");
      console.error("Copy to clipboard failed:", e);
    }
  }, [script]);
  
  return (
    <Dialog
      open={isDialogOpen}
      onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open)
          setIsCopied(false);
      }}>
      <DialogTrigger asChild>
        <Button className="cursor-pointer w-30">
          <div className="flex items-center gap-1">
            <Plus />
            Add Device
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl bg-[#1A2841] border-slate-700 border">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="text-white">
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2 text-sm">
          <div className="flex items-center justify-between border-b pb-2">
            <div className="flex items-center gap-2">
              <code className="w-120 font-mono text-sm bg-muted px-2 py-1 rounded-md text-muted-foreground">
                {script}
              </code>
              <Button
                variant="ghost"
                size="icon"     
                onClick={handleCopy}
                className="h-7 w-7 cursor-pointer" 
                aria-label="Copy DNS name"
              >
                {isCopied ? (
                  <Check className="h-4 w-4" />
                  ) : (
                  <Copy className="h-4 w-4 cursor-pointer"/>
                )}
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <DialogClose 
            className={cn(
            buttonVariants({ variant: "ghost" }),
            "cursor-pointer"
            )}
          >
            Cancel
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<DeviceInfo | null>(null);
  const [editedName, setEditedName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        id: dev["$id"],
        name: dev["name"],
        subnet: dev["ipBlock24"],
        userEmail: dev["user"]["email"],
        last_activate: new Date(dev["lastActivatedAt"]),
        userId: dev["user"]["$id"]
      }));
  
      setDevices(fetchedDevices);
    } catch (e) {
      console.error("Failed to load devices:", e);
      setDevices([]);
    } finally {
      setIsDevicesLoading(false);
    }
  }, [user]);

  const handleNameClick = (device : DeviceInfo) => {
    setSelectedDevice(device);
    setEditedName(device["name"]);
    setIsDialogOpen(true);
  }

  const handleSave = async () => {
    if (!selectedDevice || !editedName.trim()) return;
    setIsSubmitting(true);
    try {
      const account = new Account(getAppwriteClient());
      const jwt = (await account.createJWT()).jwt;

      const deviceRes = await backendFetch(`/devices/${selectedDevice.id}`, 'PATCH', jwt, {
        name: editedName.trim(),
      });
      if (!deviceRes.ok) {
        const err = await deviceRes.json();
        throw new Error(err.message || "Failed to updtae device name.");
      }
      toast.success("Device name updated successfully!");
      await loadDevices();
      await loadContainers();
    } catch (e) {
      console.error("Error saving device name:", e);
      toast.error("Updated Failed", {
        description: (e as Error).message 
      });
    } finally {
      setIsSubmitting(false);
      setIsDialogOpen(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedDevice) return;

    setIsSubmitting(true);
    try {
      const account = new Account(getAppwriteClient());
      const jwt = (await account.createJWT()).jwt;
      
      const deleteRes = await backendFetch(`/devices/${selectedDevice.id}`, 'DELETE', jwt);
      if (!deleteRes.ok) {
        const err = await deleteRes.json();
        throw new Error(err.message || 'Failed to delete the device.');
      }
      toast.success(`Device ${selectedDevice.name} has been deleted.`);
      await loadDevices();
    } catch (e) {
      console.error("Error deleting device:", e);
      toast.error("Deletion Failed", {
        description: (e as Error).message
      });
    } finally {
      setIsSubmitting(false);
      setIsDialogOpen(false);
    }
  };

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
    if (!user || !isReadyForDashboard || !process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || !process.env.NEXT_PUBLIC_CONTAINER_COLLECTION_ID) {
      return;
    }

    const client = getAppwriteClient();
    let unsubscribe: (() => void) | undefined;
    const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
    const collectionId = process.env.NEXT_PUBLIC_CONTAINER_COLLECTION_ID;
    const channel = `databases.${databaseId}.collections.${collectionId}.documents`;  
    
    console.log("Attempting to subscribe to channel:", channel);

    try {
      unsubscribe = client.subscribe(channel, response => {
        console.log("Realtime event received!", response);
        loadContainers();
      });
    } catch (error) {
      console.log("subscribe error");
    }
    return () => { if (unsubscribe) unsubscribe()};
  }, [user, isReadyForDashboard, loadContainers]);

  const memoizedColumns = useMemo(() => getDeviceColumns(handleNameClick), [handleNameClick]);

  if (initialLoading || !user) return <></>;
  if (!user || !isReadyForDashboard) {
    return <div></div>
  }

  return (
    <MainLayout user={user}>
      <div className="ml-8">
        <div>
          <p className="text-2xl font-michroma">Recent Containers</p>
          <div className="max-w-4xl">
            <div className="container">
              <ContainerScrollArea containers={containers}/>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <p className="text-2xl font-michroma">Devices</p>
          <div>
            <DataTable 
              columns={memoizedColumns} 
              data={devices} 
              filterColumnKey="name" 
              option={
                <div className="flex gap-4">
                  <AddDeviceButton/>
                  <ReloadButton onClick={loadDevices} isLoading={isDevicesLoading}/>
                </div>
              }
            />
          </div>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md bg-[#1A2841] border-slate-700 border">
          <DialogHeader>
            <DialogTitle>Edit Device</DialogTitle>
            <DialogDescription className="text-white">
              {selectedDevice?.userId === user.$id ? "You can change the device name." : "You can only view details for devices not registered by you."}
            </DialogDescription>
          </DialogHeader>
          {selectedDevice && (
            <div className="space-y-4 py-2 text-sm">
              <div className="flex items-center justify-between gap-4">
                <label 
                  htmlFor="deviceName-edit" 
                  className="flex-shrink-0 text-white text-muted-foreground"
                >
                  Device Name:
                </label>
                <Input
                  id="deviceName-edit"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  disabled={selectedDevice.userId !== user.$id || isSubmitting}
                  className="text-right text-sm font-medium max-w-50"
                />
              </div>
              <div className="flex items-center justify-between border-t pt-4">
                <p className="text-muted-foreground text-white">User:</p>
                <p className="font-medium truncate" title={selectedDevice.userEmail}>
                  {selectedDevice.userEmail}
                </p>
              </div>
              <div className="flex items-center justify-between border-t pt-4">
                <p className="text-muted-foreground text-white">Assigned Subnet:</p>
                <p className="font-mono font-medium">{selectedDevice.subnet}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose 
              className={cn(
              buttonVariants({ variant: "ghost" }),
              "cursor-pointer"
              )}
            >
              Cancel
            </DialogClose>
            {selectedDevice?.userId === user.$id && (
              <div className="flex gap-2">
                <AlertDialog>
                  <AlertDialogTrigger
                    className={cn( 
                      buttonVariants({ variant: "destructive" }), 
                      "cursor-pointer" 
                    )}
                    disabled={isSubmitting}
                  >
                    Delete
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-[#1A2841] border-slate-700 border">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription className="text-white">
                        This action cannot be undone. This will permanently delete the device 
                        {' '}
                        <span className="font-semibold text-red-500">{selectedDevice?.name}</span>
                        {' '}
                        and any associated containers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="cursor-pointer bg-[#1A2841]">Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        disabled={isSubmitting}
                        className="cursor-pointer"
                      >
                        Continue
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <Button className="cursor-pointer" onClick={handleSave} disabled={isSubmitting}>
                  Save Changes
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
