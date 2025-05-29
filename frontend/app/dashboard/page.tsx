"use client";
import MainLayout from "@/components/MainLayout";
import { Input } from "@/components/ui/input";
import { getAppwriteClient, getCurrentUser } from "@/lib/appwrite";
import { backendFetch } from "@/lib/utils";
import { Account, Models } from "appwrite";
import { LucideSearch } from "lucide-react";
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

function SearchBar() {
  return (
    <form>
      <div className="flex items-center bg-gray-500 rounded-sm">
        <div className="p-2">
          <LucideSearch />
        </div>
        <Input
          placeholder="Search"
          className="border-none focus-visible:border-none"
        />
      </div>
    </form>
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
      })();
    } catch (e) {
      console.log(e);
    }
  }, []);

  if (loading) return <></>;

  return (
    <MainLayout>
      <div className="w-full ml-8">
        <div>
          <p className="text-2xl">Recent Containers</p>
          <div className="flex gap-5">
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

        <div className="mt-4">
          <p className="text-2xl">Devices</p>
          <SearchBar />
        </div>
      </div>
    </MainLayout>
  );
}
