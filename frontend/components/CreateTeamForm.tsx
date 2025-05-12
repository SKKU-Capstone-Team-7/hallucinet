'use client';

import React, { useState } from 'react';
import { Client, Databases } from 'appwrite';
import { useRouter } from 'next/navigation';

export const CreateTeamForm = () => {
  const [teamName, setTeamName] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCreateTeam = async () => {
    if (!teamName.trim()) {
      alert('Please enter a team name.');
      return;
    }

    setLoading(true);
    const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!;
    const project = process.env.NEXT_PUBLIC_APPWRITE_PROJECT!;

    const client = new Client().setEndpoint(endpoint).setProject(project);
    const databases = new Databases(client);

    try {
      await databases.createDocument('teams-db', 'teams-collection', 'unique()', {
        name: teamName,
      });
      alert('Team created successfully!');
      router.push('/dashboard'); // 팀 생성 후 대시보드로 이동
    } catch (error) {
      console.error('Error creating team:', error);
      alert('Error creating team');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleCreateTeam(); }}>
      <div>
        <label htmlFor="teamName">Team Name</label>
        <input
          type="text"
          id="teamName"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          placeholder="Enter team name"
          required
        />
      </div>
      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Team'}
      </button>
    </form>
  );
};
