'use client';

import React, { useState, useEffect } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { Client, Account, Models } from 'appwrite';
import { useRouter } from 'next/navigation';
import { TeamMemberTable } from '@/components/TeamMemberTable';
import { RefreshCw } from 'lucide-react';

interface HallucinetUser {
  $id: string;
  name: string;
  email: string;
  teamIds: string[] | string; // 문자열 또는 배열 가능
  password?: string;
}

interface TeamInfo {
  $id: string;
  name: string;
  total: number;
  ipBlock16?: string;
}

export default function TeamPage() {
  const router = useRouter();
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [halluUser, setHalluUser] = useState<HallucinetUser | null>(null);
  const [teamInfo, setTeamInfo] = useState<TeamInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // Appwrite 유저 인증
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

  // Hallucinet API - /users/me 호출해서 user info 가져오기
  useEffect(() => {
    if (!user) return;

    async function fetchHallucinetUser() {
      try {
        const res = await fetch('/api/v1/users/me', {
          headers: {
            'Content-Type': 'application/json',
            // 인증 토큰 필요하면 헤더에 넣어줘야 함 (없으면 제거)
            'Authorization': `Bearer ${"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiI2N2VmNTY3MzAwMmIyYmY1ZDkwOSIsInNlc3Npb25JZCI6IjY4MzQwZjA2ZDY4ZGYxNGZkNjBlIiwiZXhwIjoxNzQ4MjQzMDgzfQ.JFKYipZgDvPTALpLwgXJaNayoAIgeMmu1CHdEsqJ8F8"}`,
          },
          credentials: 'include', // 쿠키 인증이면
        });
        if (!res.ok) throw new Error('Failed to fetch hallucinet user');
        const data: HallucinetUser = await res.json();

        // teamIds가 string일 경우 JSON 배열로 파싱
        if (typeof data.teamIds === 'string') {
          try {
            data.teamIds = JSON.parse(data.teamIds);
          } catch {
            data.teamIds = [];
          }
        }
        setHalluUser(data);
      } catch (error) {
        console.error(error);
      }
    }
    fetchHallucinetUser();
  }, [user]);

  // Hallucinet API - /teams/me 호출해서 팀 정보 가져오기
  useEffect(() => {
    if (!halluUser) return;

    async function fetchTeamInfo() {
      try {
        const res = await fetch('/api/v1/teams/me', {
          headers: {
            'Content-Type': 'application/json',
            // 인증 헤더 필요 시 추가
            'Authorization': `Bearer ${"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiI2N2VmNTY3MzAwMmIyYmY1ZDkwOSIsInNlc3Npb25JZCI6IjY4MzQwZjA2ZDY4ZGYxNGZkNjBlIiwiZXhwIjoxNzQ4MjQzMDgzfQ.JFKYipZgDvPTALpLwgXJaNayoAIgeMmu1CHdEsqJ8F8"}`,
          },
          credentials: 'include',
        });
        if (!res.ok) throw new Error('Failed to fetch team info');
        const data: TeamInfo = await res.json();
        setTeamInfo(data);
      } catch (error) {
        console.error(error);
      }
    }
    fetchTeamInfo();
  }, [halluUser]);

  if (loading) return <div className="p-8 text-white">Loading…</div>;
  if (!user || !halluUser) return null;

  return (
    <SidebarProvider>
      <div className="flex h-screen w-screen overflow-hidden">
        <AppSidebar user={user} onLogout={() => {}} />

        <div className="flex flex-col flex-1 h-full bg-[#050a12] text-white">
          <header className="flex items-center px-6 py-4 border-b border-gray-700">
            <SidebarTrigger />
            <h1 className="text-2xl font-semibold ml-4">Team</h1>
          </header>

          <main className="flex-1 px-8 py-6 overflow-auto">
            <div className="mb-6">
              <p>
                <strong>User:</strong> {halluUser.name} ({halluUser.email})
              </p>
              <p>
                <strong>Teams:</strong> {Array.isArray(halluUser.teamIds) ? halluUser.teamIds.join(', ') : halluUser.teamIds}
              </p>
            </div>

            {teamInfo && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">My Team</h2>
                <p>
                  <strong>Name:</strong> {teamInfo.name}
                </p>
                <p>
                  <strong>Total Members:</strong> {teamInfo.total}
                </p>
                <p>
                  <strong>IP Block:</strong> {teamInfo.ipBlock16 || '-'}
                </p>
              </div>
            )}

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
