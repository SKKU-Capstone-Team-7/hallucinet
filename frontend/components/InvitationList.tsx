'use client';

import React, { useState, useEffect } from 'react';
import { Client, Databases } from 'appwrite';
import { InvitationRow } from './InvitationRow';

export const InvitationList = () => {
  const [invitations, setInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!;
    const project = process.env.NEXT_PUBLIC_APPWRITE_PROJECT!;

    const client = new Client().setEndpoint(endpoint).setProject(project);
    const databases = new Databases(client);

    const fetchInvitations = async () => {
      try {
        const response = await databases.listDocuments(
          'invitations-db',
          'invitations-collection'
        );
        setInvitations(response.documents);
      } catch (error) {
        console.error('Error fetching invitations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInvitations();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-semibold mt-12 mb-2">Join in a Team</h2>
      <p className="text-sm text-gray-300 mb-4">
        Check the invitations you got and join in a team. After you choose one team, others are automatically rejected.
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
          invitations.map((invitation, index) => (
            <InvitationRow
              key={index}
              email={invitation.email}
              dateTime={invitation.dateTime}
              onAccept={() => handleAccept(invitation.id)}
              onReject={() => handleReject(invitation.id)}
            />
          ))
        )}
      </div>
    </div>
  );
};

// 초대 수락/거절 핸들러 (추후 구현)
const handleAccept = (id: string) => {};
const handleReject = (id: string) => {};
