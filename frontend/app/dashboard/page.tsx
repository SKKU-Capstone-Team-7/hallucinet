'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Client, Account, Models } from 'appwrite';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { CirclePlus, RotateCcw } from 'lucide-react';
import '@/styles/Dashboard.css';

interface Device {
  $id: string;
  status: boolean;
  name: string;
  ipBlock24: string;
  user: {
    $id: string;
    name: string;
    email: string;
    password: string;
    teamIds: string;
  };
  lastActivatedAt: string;
  teamId: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [loading, setLoading] = useState(true);
  const [devices, setDevices] = useState<Device[]>([]);

  useEffect(() => {
    const endpoint   = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!;
    const project    = process.env.NEXT_PUBLIC_APPWRITE_PROJECT!;
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL!;
    const client     = new Client().setEndpoint(endpoint).setProject(project);
    const account    = new Account(client);
  
    (async () => {
      try {
        await account.get();               // ensure user is signed in
        setLoading(false);
  
        const { jwt } = await account.createJWT();  
        const res = await fetch(`${apiBaseUrl}/devices`, {
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwt}` 
          },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const devices = await res.json();
        setDevices(Array.isArray(devices) ? devices : []);
      } catch (err) {
        console.error(err);
        router.replace('/login');
      }
    })();
  }, [router]);
  

  const handleLogout = async () => {
    const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!;
    const project  = process.env.NEXT_PUBLIC_APPWRITE_PROJECT!;

    const client  = new Client().setEndpoint(endpoint).setProject(project);
    const account = new Account(client);

    await account.deleteSession('current');
    router.replace('/login');
  };

  if (loading) {
    return <p className="dashboard-loading">Loading…</p>;
  }
  if (!user) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="dashboard-layout">
        <AppSidebar user={user} onLogout={handleLogout} />

        <div className="dashboard-main">
          <header className="dashboard-header">
            <SidebarTrigger />
          </header>

          <div className="dashboard-container">
            <section className="recent-containers">
              <h2>Recently Activated Devices</h2>
              <div className="containers-list">
                {devices.length === 0 && <p>No devices available.</p>}
                {devices.map((device, i) => (
                  <div key={i} className="container-card">
                    <h3>{device.name}</h3>
                    <p>{device.ipBlock24}</p>
                    <p>{device.user.email}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="devices-section">
              <h2>Devices</h2>
              <div className="devices-controls">
                <input type="text" placeholder="Search" className="search-input" />
                <button className="btn invite-btn">
                  <CirclePlus /> Invite
                </button>
                <button
                  className="btn refresh-btn"
                  onClick={() => {
                    // re-fetch on refresh click
                    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL!;
                    fetch(`${apiBaseUrl}/teams/me/devices`, {
                      credentials: 'include',
                      headers: { 'Content-Type': 'application/json' },
                    })
                      .then((res) => {
                        if (!res.ok) throw new Error(res.statusText);
                        return res.json();
                      })
                      .then((data) => setDevices(Array.isArray(data) ? data : []))
                      .catch((err) => console.error('Failed to fetch devices', err));
                  }}
                >
                  <RotateCcw /> Refresh
                </button>
              </div>
              <table className="devices-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Assigned Subnet</th>
                    <th>Last Seen</th>
                  </tr>
                </thead>
                <tbody>
                  {devices.map((d, i) => (
                    <tr key={i}>
                      <td>
                        <span
                          className={`status-dot ${d.status ? 'online' : 'offline'}`}
                        ></span>
                        <div className="device-name">{d.name}</div>
                        <div className="device-email">{d.user.email}</div>
                      </td>
                      <td>{d.ipBlock24}</td>
                      <td>{new Date(d.lastActivatedAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
