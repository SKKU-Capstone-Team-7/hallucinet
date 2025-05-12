'use client';

import React from 'react';

interface InvitationRowProps {
  email: string;
  status: string;
  onAccept: () => void;
  onReject: () => void;
}

export const InvitationRow: React.FC<InvitationRowProps> = ({ email, status, onAccept, onReject }) => {
  return (
    <div className="invitation-row">
      <span>{email}</span> - <span>{status}</span>
      <button onClick={onAccept}>Accept</button>
      <button onClick={onReject}>Reject</button>
    </div>
  );
};
