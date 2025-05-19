'use client';

import React, { useState, useEffect } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { Client, Account, Models } from 'appwrite';
import { useRouter } from 'next/navigation';
import { TeamMemberTable } from '@/components/TeamMemberTable';
import { RefreshCw } from 'lucide-react';

export default function TeamPage() {
  const router = useRouter();
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!;
    const project = process.env.NEXT_PUBLIC_APPWRITE_PROJECT!;
    const client = new Client().setEndpoint(endpoint).setProject(project);
    const account = new Account(client);

    account.get()
      .then(setUser)
      .catch(() => router.replace('/login'))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) return <div className="p-8 text-white">Loading…</div>;
  if (!user) return null;

  return (
    <SidebarProvider>
      <div className="flex h-screen w-screen overflow-hidden">
        <AppSidebar user={user} onLogout={() => {}} />

        {/* 여기서부터 오른쪽 전체 영역 */}
        <div className="flex flex-col flex-1 h-full bg-[#050a12] text-white">
          {/* 상단 헤더 */}
          <header className="flex items-center px-6 py-4 border-b border-gray-700">
            <SidebarTrigger />
            <h1 className="text-2xl font-semibold ml-4">Team</h1>
          </header>

          {/* 메인 콘텐츠 영역 */}
          <main className="flex-1 px-8 py-6 overflow-auto">
            <div className="flex items-center gap-3 mb-6">
              <input
                type="text"
                placeholder="Search"
                className="px-4 py-2 bg-[#1a2841] border border-gray-600 rounded-md text-white placeholder-gray-400 w-64"
              />
              <button className="bg-[#1c8cf0] text-white px-4 py-2 rounded-md hover:opacity-90 text-sm">
                + Invite
              </button>
              <button className="p-2 rounded-md border border-gray-600 hover:bg-[#1a2841]">
                <RefreshCw size={18} className="text-white" />
              </button>
            </div>

            <TeamMemberTable />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
