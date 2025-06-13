"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Account, Models } from "appwrite";
import MainLayout from "@/components/MainLayout";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import { Check, Copy, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { getAppwriteClient, getCurrentUser } from "@/lib/appwrite";
import { backendFetch, cn } from "@/lib/utils";
import { toast } from "sonner";
import { getDeviceColumns } from "../dashboard/columns";
import { DataTable } from "@/components/ui/data-table";
import { ReloadButton } from "@/components/common/ReloadButtion";
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

interface DeviceInfo {
  id: string;
  name: string;
  subnet: string;
  userEmail: string;
  last_activate: Date;
  userId: string;
}

function AddDeviceButton() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const title = "Add New Device";
  const description =
    "Run the following command on your new device to register it.";
  const script =
    "curl -fsSL https://github.com/SKKU-Capstone-Team-7/hallucinet/releases/latest/download/install.sh | sh";

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
        if (!open) setIsCopied(false);
      }}
    >
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
                  <Copy className="h-4 w-4 cursor-pointer" />
                )}
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <DialogClose
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "cursor-pointer",
            )}
          >
            Cancel
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function DevicesPage() {
  const [initialLoading, setInitialLoading] = useState(true);
  const [isDevicesLoading, setIsDevicesLoading] = useState<boolean>(false);
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(
    null,
  );
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const router = useRouter();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<DeviceInfo | null>(null);
  const [editedName, setEditedName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        userId: dev["user"]["$id"],
      }));

      setDevices(fetchedDevices);
    } catch (e) {
      console.error("Failed to load devices:", e);
      setDevices([]);
    } finally {
      setIsDevicesLoading(false);
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
        if (!meRes.ok)
          throw new Error(`Initial user check failed: ${meRes.statusText}`);
        const meJson = await meRes.json();
        const teams: string[] = meJson["teamIds"] || [];
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
      loadDevices();
    }
  }, [user, initialLoading, loadDevices]);

  const handleNameClick = (device: DeviceInfo) => {
    setSelectedDevice(device);
    setEditedName(device["name"]);
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!selectedDevice || !editedName.trim()) return;
    setIsSubmitting(true);
    try {
      const account = new Account(getAppwriteClient());
      const jwt = (await account.createJWT()).jwt;

      const deviceRes = await backendFetch(
        `/devices/${selectedDevice.id}`,
        "PATCH",
        jwt,
        {
          name: editedName.trim(),
        },
      );
      if (!deviceRes.ok) {
        const err = await deviceRes.json();
        throw new Error(err.message || "Failed to updtae device name.");
      }
      toast.success("Device name updated successfully!");
      await loadDevices();
    } catch (e) {
      console.error("Error saving device name:", e);
      toast.error("Updated Failed", {
        description: (e as Error).message,
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

      const deleteRes = await backendFetch(
        `/devices/${selectedDevice.id}`,
        "DELETE",
        jwt,
      );
      if (!deleteRes.ok) {
        const err = await deleteRes.json();
        throw new Error(err.message || "Failed to delete the device.");
      }
      toast.success(`Device ${selectedDevice.name} has been deleted.`);
      await loadDevices();
    } catch (e) {
      console.error("Error deleting device:", e);
      toast.error("Deletion Failed", {
        description: (e as Error).message,
      });
    } finally {
      setIsSubmitting(false);
      setIsDialogOpen(false);
    }
  };

  const memoizedColumns = useMemo(
    () => getDeviceColumns(handleNameClick),
    [handleNameClick],
  );

  if (initialLoading || !user) return <div></div>;

  return (
    <MainLayout user={user!}>
      <div className="ml-8">
        <div className="mt-18">
          <p className="text-2xl font-michroma">Devices</p>
          <div>
            <DataTable
              columns={memoizedColumns}
              data={devices}
              filterColumnKey="name"
              option={
                <div className="flex gap-4">
                  <AddDeviceButton />
                  <ReloadButton
                    onClick={loadDevices}
                    isLoading={isDevicesLoading}
                  />
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
              {selectedDevice?.userId === user.$id
                ? "You can change the device name."
                : "You can only view details for devices not registered by you."}
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
                  className="text-right text-sm font-medium max-w-50" // 다른 값들과 정렬을 맞추기 위해 text-right 추가
                />
              </div>
              <div className="flex items-center justify-between border-t pt-4">
                <p className="text-muted-foreground text-white">User:</p>
                <p
                  className="font-medium truncate"
                  title={selectedDevice.userEmail}
                >
                  {selectedDevice.userEmail}
                </p>
              </div>
              <div className="flex items-center justify-between border-t pt-4">
                <p className="text-muted-foreground text-white">
                  Assigned Subnet:
                </p>
                <p className="font-mono font-medium">{selectedDevice.subnet}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "cursor-pointer",
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
                      "cursor-pointer",
                    )}
                    disabled={isSubmitting}
                  >
                    Delete
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-[#1A2841] border-slate-700 border">
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Are you absolutely sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-white">
                        This action cannot be undone. This will permanently
                        delete the device{" "}
                        <span className="font-semibold text-red-500">
                          {selectedDevice?.name}
                        </span>{" "}
                        and any associated containers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="cursor-pointer bg-[#1A2841]">
                        Cancel
                      </AlertDialogCancel>
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
                <Button
                  className="cursor-pointer"
                  onClick={handleSave}
                  disabled={isSubmitting}
                >
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

