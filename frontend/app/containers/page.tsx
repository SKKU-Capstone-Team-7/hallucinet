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
import { useEffect, useState } from "react";
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
            userEmail: cont["device"]["user"]["email"],
            image: cont["image"],
            deviceName: cont["device"]["name"],
            ip: cont["ip"],
            last_seen: new Date(cont["lastAccessed"])
          };
        });
        //console.log(containers);
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
        <div className="mt-18">
          <p className="text-2xl">Containers</p>
          <div>
            <DataTable columns={columns} data={containers} filterColumnKey="name"/>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
