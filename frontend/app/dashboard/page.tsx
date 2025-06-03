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
import { useEffect, useState } from "react";
import { columns } from "./columns";
import * as React from "react"

interface ContainerInfo {
  name: string;
  deviceName: string;
  image: string;
}
function ContainerCard({ container }: { container: ContainerInfo }) {
  return (
    <div className="p-5 shadow-sm">
      <p className="h-9 font-bold">{container.name}</p>
      <p>{container.image}</p>
      <p>{container.deviceName}</p>
    </div>
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

export interface DeviceInfo {
  name: string;
  subnet: string;
  userEmail: string;
  last_activate: Date;
}

function InviteButton() {
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
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(
    null,
  );
  const [containers, setContainers] = useState<ContainerInfo[]>([]);
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const router = useRouter();

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

        console.log(jwt);

        // Check if user is in a team
        const meRes = await backendFetch("/users/me", "GET", jwt);
        const meJson = await meRes.json();
        const teams: string[] = meJson["teamIds"];
        if (teams.length == 0) {
          console.log(teams);
          router.push("/onboarding");
          return;
        }

      const containersPromise = backendFetch("/teams/me/containers", "GET", jwt);
      const devicesPromise = backendFetch("/teams/me/devices", "GET", jwt);

      // Promise.all을 사용하여 두 요청이 모두 완료될 때까지 기다립니다.
      const [containersRes, devicesRes] = await Promise.all([
        containersPromise,
        devicesPromise,
      ]);

        // Get containers
        //const containersRes = await backendFetch(
        //  "/teams/me/containers",
        //  "GET",
        //  jwt,
        //);
        const containerJsons: any[] = await containersRes.json();
        const containers: ContainerInfo[] = containerJsons.map((cont) => {
          return {
            name: cont["name"],
            image: cont["image"],
            deviceName: cont["device"]["name"],
          };
        });
        setContainers(containers);

        // Get devices
        //const devicesRes = await backendFetch("/teams/me/devices", "GET", jwt);
        const deviceJsons: any[] = await devicesRes.json();
        const devices: DeviceInfo[] = deviceJsons.map((dev) => {
          return {
            name: dev["name"],
            subnet: dev["ipBlock24"],
            userEmail: dev["user"]["email"],
            last_activate: new Date(dev["lastActivatedAt"]),
          };
        });
        setDevices(devices);
      })();
    } catch (e) {
      console.log(e);
    }
  }, []);

  if (loading) return <></>;

  return (
    <MainLayout user={user!}>
      <div className="ml-8">
        <div>
          <p className="text-2xl">Recent Containers</p>
          <div className="container"><ContainerScrollArea containers={containers}/></div>
        </div>

        <div className="mt-8">
          <p className="text-2xl">Devices</p>
          <div>
            <DataTable columns={columns} data={devices} filterColumnKey="name" option={<InviteButton/>}/>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
