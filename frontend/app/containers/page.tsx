"use client";

import { ReloadButton } from "@/components/common/ReloadButtion";
import MainLayout from "@/components/MainLayout";
import { Button, buttonVariants } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { getAppwriteClient, getCurrentUser } from "@/lib/appwrite";
import { backendFetch, cn } from "@/lib/utils";
import { Account, Models } from "appwrite";
import { Check, Copy } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getContainerColumns } from "./columns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { toast } from "sonner";

export interface ContainerInfo {
  id: string;
  name: string;
  userEmail: string;
  deviceName: string;
  image: string;
  ip: string;
  last_seen: Date;
  userId: string;
}

export default function ContainerPage() {
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [isContainersLoading, setIsContainersLoading] = useState<boolean>(false);
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(
    null,
  );
  const [containers, setContainers] = useState<ContainerInfo[]>([]);
  const router = useRouter();

  const [isInfoDialogOpen, setIsInfoDialogOpen] = useState(false);
  const [selectedContainer, setSelectedContainer] = useState<ContainerInfo | null>(null);

  const [isCopied, setIsCopied] = useState(false);

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
        id: cont["$id"],
        name: cont["name"],
        userEmail: cont["device"]["user"]["email"],
        image: cont["image"],
        deviceName: cont["device"]["name"],
        ip: cont["ip"],
        last_seen: new Date(cont["lastAccessed"]),
        userId: cont["device"]["user"]["$id"]
      }));
      setContainers(fetchedContainers);
    } catch (e) {
      console.error("Failed to load containers:", e);
      setContainers([]);
    } finally {
      setIsContainersLoading(false);
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
        if (!meRes.ok) throw new Error("Failed to fetch user info");
        const meJson = await meRes.json();
        const teams: string[] = meJson["teamIds"];
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
      loadContainers();
    } 
  }, [user, initialLoading, loadContainers]);

  const handleNameClick = (container: ContainerInfo) => {
    setSelectedContainer(container);
    setIsInfoDialogOpen(true);
  };

  const handleCopyDns = useCallback(async () => {
    if (!selectedContainer) return;

    const text = `${selectedContainer.name}.${selectedContainer.deviceName}.test`;

    try {
      await navigator.clipboard.writeText(text);

      toast.success("DNS name copied to clipboard!");
      setIsCopied(true);

      setTimeout(() => {
        setIsCopied(false);
      }, 1500);
    } catch (e) {
      console.error("Failed to copy DNS name: ", e);
      toast.error("Copy Failed", {
        description: "Could not copy to clipboard."
      });
    }
  }, [selectedContainer]);

  const memoizedColumns = useMemo(() => getContainerColumns(handleNameClick), [handleNameClick]);

  if (initialLoading || !user) return <div></div>;

  return (
    <MainLayout user={user!}>
      <div className="ml-8">
        <div className="mt-18">
          <p className="text-2xl font-michroma">Containers</p>
          <div>
            <DataTable 
              columns={memoizedColumns} 
              data={containers} 
              option={
                <ReloadButton onClick={loadContainers} isLoading={isContainersLoading}/>
              } 
              filterColumnKey="name"
            />
          </div>
        </div>
      </div>

      <Dialog open={isInfoDialogOpen} onOpenChange={(open) => {
        setIsInfoDialogOpen(open);
        if (!open) {
          setIsCopied(false);
        }
      }}>
        <DialogContent className="sm:max-w-md bg-[#1A2841] border-slate-700 border">
          <DialogHeader>
            <DialogTitle>{selectedContainer?.name}</DialogTitle>
            <DialogDescription className="text-white">
              Detailed information for the container.
            </DialogDescription>
          </DialogHeader>
          {selectedContainer && (
            <div className="space-y-3 py-2 text-sm">
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground text-white">Device:</span>
                <span className="font-medium">{selectedContainer.deviceName}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground text-white">User:</span>
                <span className="font-medium">{selectedContainer.userEmail}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground text-white">Image:</span>
                <span className="font-medium truncate max-w-[250px]">{selectedContainer.image}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground text-white">IP Address:</span>
                <span className="font-mono font-medium">{selectedContainer.ip}</span>
              </div>
              <div className="flex items-center justify-between border-b pb-2">
                <p className="text-muted-foreground text-white">DNS name:</p>
                <div className="flex items-center gap-2">
                  <code className="font-mono text-sm bg-muted px-2 py-1 rounded-md text-muted-foreground">
                    {`${selectedContainer.name}.${selectedContainer.deviceName}.test`}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"     
                    onClick={handleCopyDns}
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
          )}
          <DialogFooter>
            <DialogClose 
              className={cn(
              buttonVariants({ variant: "ghost" }),
              "cursor-pointer"
              )}
            >
              Close  
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
