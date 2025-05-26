'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Client, Account, Models } from 'appwrite';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { CirclePlus, Container, RotateCcw } from 'lucide-react';
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
    teamIds: string;
  };
  lastActivatedAt: string;
}

interface Container {
  $id: string
  name: string
  image: string
  ip: string
  device: {
    $id: string
    status: boolean
    name: string
    ipBlock24: string
    user: {
      $id: string
      name: string
      email: string
      teamIds: string
    }
    lastActivatedAt: string
    teamId: string
  }
  lastAccessed: string
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [loading, setLoading] = useState(true);
  const [devices, setDevices] = useState<Device[]>([]);
  const [containers, setContainers] = useState<Container[]>([]);

  useEffect(() => {
    const endpoint   = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!;
    const project    = process.env.NEXT_PUBLIC_APPWRITE_PROJECT!;
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL!;
    const client     = new Client().setEndpoint(endpoint).setProject(project);
    const account    = new Account(client);
  
     (async () => {
      let me: Models.User<Models.Preferences>;
      try {
        me = await account.get();                   
        setUser(me);
        setLoading(false);
      } catch (err) {
        console.error('Auth failed, redirecting to login', err);
        router.replace('/login');
        return;
      }

      try {
        const { jwt } = await account.createJWT();
        const devRes = await fetch(`${apiBaseUrl}/teams/me/devices`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwt}`
          }
        });
        if (devRes.ok) {
          const devData = await devRes.json();
          setDevices(Array.isArray(devData) ? devData : []);
        } else {
          console.warn(`Devices returned ${devRes.status}, showing empty list`);
          setDevices([]);
        }
      } catch (err) {
        console.error('Failed to fetch devices', err);
      }

      try {
        const { jwt } = await account.createJWT();
        const ctrRes = await fetch(
          `${apiBaseUrl}/teams/me/containers?sort=lastAccessed&order=asc&limit=1`,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${jwt}`
            }
          }
        );
        if (ctrRes.ok) {
          const ctrData = await ctrRes.json();
          setContainers(Array.isArray(ctrData) ? ctrData : []);
        } else {
          console.warn(`Containers returned ${ctrRes.status}, showing none`);
          setContainers([]);
        }
      } catch (err) {
        console.error('Failed to fetch containers', err);
      }
    })();}, [router]);

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
              <h2>Containers</h2>
              <div className="containers-list">
                {containers.length === 0 && <p>No containers available.</p>}
                {containers.map((c, i) => (
                  <div key={i} className="container-card">
                    <p>{c.name}</p>
                    <p>{c.image}</p>
                    <h3>{c.device.user.name}</h3>
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
                        <div className="device-email">{d.user.$id}</div>
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
