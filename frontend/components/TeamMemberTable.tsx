'use client';

import { TeamMemberRow, TeamMemberProps } from './TeamMemberRow';

const mockMembers: TeamMemberProps[] = [
  { name: 'KANG', email: 'nariveshere@gmail.com', role: 'ADMIN', status: 'online' },
  { name: 'KIM', email: 'nariveshere@gmail.com', role: 'ADMIN', status: 'online' },
  { name: 'PARK', email: 'nariveshere@gmail.com', role: 'ADMIN', status: 'offline' },
  { name: 'JEON', email: 'nariveshere@gmail.com', role: 'OWNER', status: 'online' },
  { name: 'MARK', email: 'nariveshere@gmail.com', role: 'ADMIN', status: 'offline' },
];

export const TeamMemberTable = () => {
  return (
    <div className="bg-[#1a2841] rounded-md overflow-hidden w-full">
      <div className="grid grid-cols-3 sm:grid-cols-4 text-sm font-semibold px-6 py-3 border-b border-gray-600 text-white">
        <span>NAME</span>
        <span>ROLE</span>
        <span>LAST LOGIN</span>
        <span className="hidden sm:block text-right"> </span>
      </div>

      {mockMembers.map((member, idx) => (
        <TeamMemberRow key={idx} {...member} />
      ))}
    </div>
  );
};

