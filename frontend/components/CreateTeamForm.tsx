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
    const databaseId = process.env.APPWRITE_DATABASE_ID!;
    const collectionId = process.env.TEAM_COLLECTION_ID!;

    const client = new Client().setEndpoint(endpoint).setProject(project);
    const databases = new Databases(client);

    try {
      await databases.createDocument(databaseId, collectionId, 'unique()', {
        name: teamName,
      });
      alert('Team created successfully!');
      router.push('/dashboard');
    } catch (error) {
      console.error('Error creating team:', error);
      alert('Error creating team');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-semibold mb-2">Create a Team</h2>
      <p className="text-sm text-gray-300 mb-4">
        Create your own team and become an owner.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleCreateTeam();
        }}
        className="flex gap-4 bg-[#1a2841] p-6 rounded-lg"
      >
        <input
          type="text"
          id="teamName"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          placeholder="Team Name Here"
          className="flex-1 px-4 py-2 rounded-md bg-transparent border border-gray-500 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1c8cf0]"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-[#1c8cf0] px-6 py-2 rounded-md text-white font-medium hover:opacity-90 transition"
        >
          {loading ? 'Creating...' : 'Confirm'}
        </button>
      </form>
    </div>
  );
};
