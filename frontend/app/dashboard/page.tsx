'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Client, Account, Models } from 'appwrite';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { CirclePlus, RotateCcw } from 'lucide-react';
import '@/styles/Dashboard.css';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
    const project  = process.env.NEXT_PUBLIC_APPWRITE_PROJECT;

    if (!endpoint || !project) {
      console.error('Appwrite env vars missing');
      router.replace('/login');
      return;
    }

    const client  = new Client().setEndpoint(endpoint).setProject(project);
    const account = new Account(client);

    account.get()
      .then((u: Models.User<Models.Preferences>) => {
        setUser(u);
        setLoading(false);
      })
      .catch(() => {
        router.replace('/login');
      });
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

  const containers = [
    { name: 'Messi',    tag: 'traffic:2.11', host: 'dev-mac' },
    { name: 'Neymar',   tag: 'traffic:2.11', host: 'dev-mac' },
    { name: 'Ronaldo',  tag: 'traffic:2.11', host: 'dev-mac' },
    { name: 'Valverde', tag: 'traffic:2.11', host: 'dev-mac' },
    { name: 'Suarez',   tag: 'traffic:2.11', host: 'dev-mac' },
    { name: 'Iniesta',  tag: 'traffic:2.11', host: 'dev-mac' },
    { name: 'Xavi',     tag: 'traffic:2.11', host: 'dev-mac' },
    { name: 'Pique',    tag: 'traffic:2.11', host: 'dev-mac' },
  ];

  const devices = [
    { name: 'dev-mac', email: 'nariveshere@gmail.com', subnet: '10.2.1.0/24', last: 'Just Now', status: 'offline' },
    { name: 'dev-mac', email: 'nariveshere@gmail.com', subnet: '10.2.1.0/24', last: 'Just Now', status: 'online'  },
    { name: 'dev-mac', email: 'nariveshere@gmail.com', subnet: '10.2.1.0/24', last: 'Just Now', status: 'offline' },
    { name: 'dev-mac', email: 'nariveshere@gmail.com', subnet: '10.2.1.0/24', last: 'Just Now', status: 'online'  },
    { name: 'dev-mac', email: 'nariveshere@gmail.com', subnet: '10.2.1.0/24', last: 'Just Now', status: 'offline' },
  ];

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
              <h2>Recent Containers</h2>
              <div className="containers-list">
                {containers.map((c, i) => (
                  <div key={i} className="container-card">
                    <h3>{c.name}</h3>
                    <p>{c.tag}</p>
                    <p>{c.host}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="devices-section">
              <h2>Devices</h2>
              <div className="devices-controls">
                <input type="text" placeholder="Search" className="search-input" />
                <button className="btn invite-btn"><CirclePlus /> Invite</button>
                <button className="btn refresh-btn"><RotateCcw /> Refresh</button>
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
                        <span className={`status-dot ${d.status}`}></span>
                        <div className="device-name">{d.name}</div>
                        <div className="device-email">{d.email}</div>
                      </td>
                      <td>{d.subnet}</td>
                      <td>{d.last}</td>
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
