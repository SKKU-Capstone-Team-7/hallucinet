'use client';

import React, { useState, useEffect } from 'react';
import { Client, Databases } from 'appwrite';
import { InvitationRow } from './InvitationRow';

export const InvitationList = () => {
  const [invitations, setInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string>('');

  useEffect(() => {
    const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!;
    const project = process.env.NEXT_PUBLIC_APPWRITE_PROJECT!;

    const client = new Client().setEndpoint(endpoint).setProject(project);
    const databases = new Databases(client);

    // Fetch current logged-in user info
    const fetchCurrentUser = async () => {
      const res = await fetch('/users/me', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (!res.ok) throw new Error('Failed to fetch user info');
      const user = await res.json();
      setUserEmail(user.email);
      return user.email;
    };

    // Fetch invitations from DB filtered by current user's email
    const fetchInvitations = async () => {
      try {
        const email = await fetchCurrentUser();

        const response = await databases.listDocuments(
          'invitations-db',
          'invitations-collection'
        );

        const filtered = response.documents.filter(
          (invitation: any) => invitation.email === email
        );

        setInvitations(filtered);
      } catch (error) {
        console.error('Error fetching invitations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInvitations();
  }, []);

  // Accept invitation and automatically reject others
  const handleAccept = async (invitationId: string, teamId: string) => {
    try {
      // Update user's team information (backend API)
      const patchRes = await fetch('/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ teamIds: JSON.stringify([teamId]) }),
      });

      if (!patchRes.ok) throw new Error('Failed to update user info');

      const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!;
      const project = process.env.NEXT_PUBLIC_APPWRITE_PROJECT!;
      const client = new Client().setEndpoint(endpoint).setProject(project);
      const databases = new Databases(client);

      // Delete all invitations for this user (auto reject others)
      await Promise.all(
        invitations.map((inv) =>
          databases.deleteDocument('invitations-db', 'invitations-collection', inv.$id)
        )
      );

      alert('Join completed!');
      setInvitations([]); // Clear all invitations locally
    } catch (error) {
      console.error('Error accepting invitation:', error);
      alert('Error accepting invitation');
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mt-12 mb-2">Join a Team</h2>
      <p className="text-sm text-gray-300 mb-4">
        Check your invitations and join a team. Once you accept one, other invitations are automatically rejected.
      </p>

      <div className="bg-[#1a2841] rounded-lg overflow-hidden">
        <div className="grid grid-cols-3 text-left text-white text-sm font-medium border-b border-gray-600 px-6 py-3">
          <span>SENDER</span>
          <span>INVITATION DATE/TIME</span>
          <span className="text-center">SELECT</span>
        </div>
        {loading ? (
          <div className="text-center p-6 text-gray-400">Loading invitations...</div>
        ) : invitations.length === 0 ? (
          <div className="text-center p-6 text-gray-400">No invitations</div>
        ) : (
          invitations.map((invitation) => (
            <InvitationRow
              key={invitation.$id}
              email={invitation.sender}
              dateTime={invitation.dateTime}
              onAccept={() => handleAccept(invitation.$id, invitation.teamId)}
            />
          ))
        )}
      </div>
    </div>
  );
};
