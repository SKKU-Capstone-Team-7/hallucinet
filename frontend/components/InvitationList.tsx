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
        const response = await databases.listDocuments('invitations-db', 'invitations-collection');
        setInvitations(response.documents);
      } catch (error) {
        console.error('Error fetching invitations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInvitations();
  }, []);

  if (loading) {
    return <p>Loading invitations...</p>;
  }

  return (
    <div>
      {invitations.length === 0 ? (
        <p>No invitations</p>
      ) : (
        <ul>
          {invitations.map((invitation, index) => (
            <InvitationRow
              key={index}
              email={invitation.email}
              status={invitation.status}
              onAccept={() => handleAccept(invitation.id)}
              onReject={() => handleReject(invitation.id)}
            />
          ))}
        </ul>
      )}
    </div>
  );
};

// 초대를 수락하거나 거부하는 함수
const handleAccept = (id: string) => {
  // 초대 수락 로직을 추가
};

const handleReject = (id: string) => {
  // 초대 거부 로직을 추가
};
