'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Account, Models } from 'appwrite';

import MainLayout from '@/components/MainLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';

import { getAppwriteClient, getCurrentUser } from '@/lib/appwrite';
import { backendFetch } from '@/lib/utils';
"use client";
import { ReloadButton } from "@/components/common/ReloadButtion";
import MainLayout from "@/components/MainLayout";
import { TimeAgo } from "@/components/TimeAgo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getAppwriteClient, getCurrentUser } from "@/lib/appwrite";
import { backendFetch } from "@/lib/utils";
import { Account, Models } from "appwrite";
import { LucideSearch, Plus, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { columns } from "../dashboard/columns";
import { DataTable } from "@/components/ui/data-table";

interface DeviceInfo {
  id: string;
  name: string;
  subnet: string;
  userEmail: string;
  last_activate: Date;
  userId: string;
  status: 'online' | 'offline';
}

export default function DevicesPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [isDevicesLoading, setIsDevicesLoading] = useState<boolean>(false);
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(
    null,
  );
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const [filtered, setFiltered] = useState<DeviceInfo[]>([]);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<DeviceInfo | null>(null);
  const [editedName, setEditedName] = useState('');
  const router = useRouter();

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

  useEffect(() => {
    (async () => {
      try {
        const u = await getCurrentUser();
        setUser(u);
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

        const meRes = await backendFetch('/users/me', 'GET', jwt);
        // Check if user is in a team
        const meRes = await backendFetch("/users/me", "GET", jwt);
        if (!meRes.ok) throw new Error("Failed to fetch user info");
        const meJson = await meRes.json();
        const teams: string[] = meJson['teamIds'];
        if (teams.length === 0) {
          router.push('/onboarding');
          return;
        }

        const devicesRes = await backendFetch('/teams/me/devices', 'GET', jwt);
        const deviceJsons: any[] = await devicesRes.json();
        const devices: DeviceInfo[] = deviceJsons.map((dev) => ({
          id: dev.$id,
          name: dev.name,
          subnet: dev.ipBlock24,
          userEmail: dev.user.email,
          last_activate: new Date(dev.lastActivatedAt),
          userId: dev.user.$id,
          status: 'offline', // set dynamically if needed
        }));
        setDevices(devices);
        setFiltered(devices);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);
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
      loadDevices();
    }
  }, [user, initialLoading, loadDevices]);

  useEffect(() => {
    const lower = search.toLowerCase();
    setFiltered(
      devices.filter(
        (d) =>
          d.name.toLowerCase().includes(lower) ||
          d.userEmail.toLowerCase().includes(lower)
      )
    );
  }, [search, devices]);

  const handleRowClick = (device: DeviceInfo) => {
    setSelectedDevice(device);
    setEditedName(device.name);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!selectedDevice) return;
    const jwt = (await new Account(getAppwriteClient()).createJWT()).jwt;
    await backendFetch(`/teams/me/devices/${selectedDevice.id}`, 'PATCH', jwt, {
      name: editedName,
    });

    setDevices((prev) =>
      prev.map((d) =>
        d.id === selectedDevice.id ? { ...d, name: editedName } : d
      )
    );
    setDialogOpen(false);
  };

  const handleDelete = async () => {
    if (!selectedDevice) return;
    const jwt = (await new Account(getAppwriteClient()).createJWT()).jwt;
    await backendFetch(`/teams/me/devices/${selectedDevice.id}`, 'DELETE', jwt);
    setDevices((prev) => prev.filter((d) => d.id !== selectedDevice.id));
    setDialogOpen(false);
  };

  if (loading || !user) return null;
  if (initialLoading) return <></>;

  return (
    <MainLayout user={user}>
      <div className="p-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">Devices</h1>
        </div>

        <div className="flex items-center gap-4 mb-4">
          <Input
            type="text"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Device
          </Button>
          <Button variant="outline">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>

        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">Name</th>
                <th className="text-left px-4 py-3 font-semibold">Assigned Subnet</th>
                <th className="text-left px-4 py-3 font-semibold">Last Activated</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((device) => (
                <tr
                  key={device.id}
                  className="border-t hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleRowClick(device)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-start gap-2">
                      <span className="mt-1 w-2 h-2 rounded-full bg-red-500" />
                      <div>
                        <div className="font-medium">{device.name}</div>
                        <div className="text-gray-500 text-xs">{device.userEmail}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">{device.subnet}</td>
                  <td className="px-4 py-3">{timeSince(device.last_activate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
    <MainLayout user={user!}>
      <div className="ml-8">
        <div className="mt-18">
          <p className="text-2xl">Devices</p>
          <div>
            <DataTable columns={columns} data={devices} filterColumnKey="name" option={<div className="flex gap-4"><InviteButton/><ReloadButton onClick={loadDevices}/></div>}/>
          </div>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Device</DialogTitle>
              <DialogDescription>Only name can be changed.</DialogDescription>
            </DialogHeader>

            {selectedDevice && (
              <div className="space-y-4 py-2">
                <div>
                  <label className="text-sm font-medium block mb-1">Device Name</label>
                  <Input
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    disabled={selectedDevice.userId !== user.$id}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium block mb-1">Subnet</label>
                  <Input value={selectedDevice.subnet} disabled />
                </div>

                <div>
                  <label className="text-sm font-medium block mb-1">User Email</label>
                  <Input value={selectedDevice.userEmail} disabled />
                </div>

                <div>
                  <label className="text-sm font-medium block mb-1">Last Activated</label>
                  <Input value={timeSince(selectedDevice.last_activate)} disabled />
                </div>
              </div>
            )}

            <DialogFooter className="sm:justify-between">
              <DialogClose asChild>
                <Button variant="ghost">Cancel</Button>
              </DialogClose>
              {selectedDevice?.userId === user.$id && (
                <>
                  <Button onClick={handleSave}>Save</Button>
                  <Button variant="destructive" onClick={handleDelete}>
                    Delete
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}

// Helper
function timeSince(date: Date): string {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days} day${days > 1 ? 's' : ''}`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  return 'Just now';
}
