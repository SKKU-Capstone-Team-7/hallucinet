"use client";
import { ReloadButton } from "@/components/common/ReloadButtion";
import MainLayout from "@/components/MainLayout";
import { TimeAgo } from "@/components/TimeAgo";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { getAppwriteClient, getCurrentUser } from "@/lib/appwrite";
import { backendFetch } from "@/lib/utils";
import { Account, Models } from "appwrite";
import { LucideSearch, Plus, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { columns } from "./columns";

export interface ContainerInfo {
  name: string;
  userEmail: string;
  deviceName: string;
  image: string;
  ip: string;
  last_seen: Date;
}

export default function ContainerPage() {
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [isContainersLoading, setIsContainersLoading] = useState<boolean>(false);
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(
    null,
  );
  const [containers, setContainers] = useState<ContainerInfo[]>([]);
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

  if (initialLoading) return <></>;

  return (
    <MainLayout user={user!}>
      <div className="ml-8">
        <div className="mt-18">
          <p className="text-2xl">Containers</p>
          <div>
            <DataTable 
              columns={columns} 
              data={containers} 
              option={
                <ReloadButton onClick={loadContainers} isLoading={isContainersLoading}/>
              } 
              filterColumnKey="name"
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
