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

interface ContainerInfo {
  name: string;
  deviceName: string;
  image: string;
}
function ContainerCard({ container }: { container: ContainerInfo }) {
  return (
    <div className="p-5 shadow-sm">
      <p>{container.name}</p>
      <p>{container.image}</p>
      <p>{container.deviceName}</p>
    </div>
  );
}

interface DeviceInfo {
  name: string;
  subnet: string;
  last_seen: Date;
}

function DeviceTable({ devices }: { devices: DeviceInfo[] }) {
  return (
    <div className="flex gap-5 max-w-4xl justify-between">
      <div>
        <p className="grow text-lg mb-5">Name</p>
        {devices.map((dev) => {
          return (
            <div className="h-10" key={dev.subnet}>
              {" "}
              {dev.name}
            </div>
          );
        })}
      </div>
      <div>
        <p className="text-center grow text-lg mb-5">Assigned Subnet</p>
        {devices.map((dev) => {
          return (
            <div className="h-10" key={dev.subnet}>
              {" "}
              {dev.subnet}
            </div>
          );
        })}
      </div>
      <div>
        <p className="text-center grow text-lg mb-5">Last Seen</p>
        {devices.map((dev) => {
          return (
            <div className="h-10" key={dev.subnet}>
              <TimeAgo timestamp={dev.last_seen} />
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
      <div className="flex items-center">
        <Plus />
        Invite
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

        if (!loading && !user) {
          router.push("/login");
        }

        const account = new Account(getAppwriteClient());
        const jwt = (await account.createJWT()).jwt;

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
          };
        });
        setContainers(containers);

        // Get devices
        const devicesRes = await backendFetch("/teams/me/devices", "GET", jwt);
        const deviceJsons: any[] = await devicesRes.json();
        const devices: DeviceInfo[] = deviceJsons.map((dev) => {
          return {
            name: dev["name"],
            subnet: dev["ipBlock24"],
            last_seen: new Date(dev["lastActivatedAt"]),
          };
        });
        console.log(devices);
        setDevices(devices);
      })();
    } catch (e) {
      console.log(e);
    }
  }, []);

  if (loading) return <></>;

  return (
    <MainLayout>
      <div className="ml-8">
        <div>
          <p className="text-2xl">Recent Containers</p>
          <div className="flex gap-5 mt-4">
            {containers.map((cont) => {
              return (
                <ContainerCard
                  key={`${cont.name}.${cont.deviceName}`}
                  container={cont}
                />
              );
            })}
          </div>
        </div>

        <div className="mt-8">
          <p className="text-2xl">Devices</p>
          <div className="mt-4 flex items-center gap-4">
            <div className="grow max-w-lg">
              <SearchBar />
            </div>
            <InviteButton />
            <ReloadButton />
          </div>
          <div className="mt-4">
            <DeviceTable devices={devices} />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
