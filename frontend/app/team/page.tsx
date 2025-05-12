'use client';

import React, { useState, useEffect } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { Client, Account, Models } from 'appwrite';
import { useRouter } from 'next/navigation';
import '@/styles/Dashboard.css';

export default function TeamPage() {
  const router = useRouter();
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!;
    const project  = process.env.NEXT_PUBLIC_APPWRITE_PROJECT!;

    const client  = new Client().setEndpoint(endpoint).setProject(project);
    const account = new Account(client);

    account.get()
      .then(u => {
        setUser(u);
        setLoading(false);
      })
      .catch(() => {
        router.replace('/login');
      });
  }, [router]);

  if (loading) return <p className="dashboard-loading">Loading…</p>;
  if (!user) return null;

  return (
    <SidebarProvider>
      <div className="dashboard-layout">
        <AppSidebar user={user} onLogout={() => {}} />
        <div className="dashboard-main">
          <header className="dashboard-header">
            <SidebarTrigger />
          </header>

          <div className="dashboard-container">
            <section className="team-section">
              <h1 className="text-2xl font-semibold mb-4">Team</h1>
              <p className="text-muted-foreground mb-6">
                This page displays your team members.
              </p>
              <div className="team-members-grid">
                {[
                  { name: 'Kang', role: 'Frontend', email: 'kang@hallucinet.io' },
                  { name: 'Kim', role: 'Backend', email: 'kim@hallucinet.io' },
                ].map((m, i) => (
                  <div key={i} className="container-card">
                    <h3>{m.name}</h3>
                    <p>{m.role}</p>
                    <p>{m.email}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
