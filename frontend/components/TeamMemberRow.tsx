'use client';

import { FC } from 'react';
import { cn } from '@/lib/utils'; // 유틸 import는 네 프로젝트 구조에 맞게 조정해줘

export interface TeamMemberProps {
  name: string;
  email: string;
  role: string;
  status: 'online' | 'offline';
}

export const TeamMemberRow: FC<TeamMemberProps> = ({ name, email, role, status }) => {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 text-sm px-6 py-4 border-b border-gray-700 text-white items-center">
      <div>
        <div className="flex items-center gap-2">
          <span className={cn(
            'h-2.5 w-2.5 rounded-full',
            status === 'online' ? 'bg-green-500' : 'bg-red-500'
          )} />
          <span className="font-medium">{name}</span>
        </div>
        <p className="text-gray-400 text-xs">{email}</p>
      </div>

      <span className="text-sm text-white">{role}</span>

      <span className="text-sm text-gray-300">Just Now</span>

      <div className="hidden sm:flex justify-end">
        <button className="text-red-400 text-sm hover:underline">delete</button>
      </div>
    </div>
  );
};
