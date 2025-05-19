'use client';

import React from 'react';
import { Check } from 'lucide-react';

interface InvitationRowProps {
  email: string;
  dateTime: string;
  onAccept: () => void;
  onReject: () => void;
}

export const InvitationRow: React.FC<InvitationRowProps> = ({
  email,
  dateTime,
  onAccept,
}) => {
  return (
    <div className="grid grid-cols-3 items-center px-6 py-4 text-white text-sm border-t border-gray-700 hover:bg-[#1c1c2e]">
      <span>{email}</span>
      <span>{dateTime}</span>
      <div className="flex justify-center">
        <button onClick={onAccept}>
          <Check className="text-[#1c8cf0] w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
