'use client';

import { useEffect, useState } from 'react';
import InvitationRow from './InvitationRow';

type Invitation = {
  id: string;
  sender: string;
  datetime: string;
};

const InvitationList = () => {
  const [invitations, setInvitations] = useState<Invitation[]>([]);

  useEffect(() => {
    const fetchInvites = async () => {
      try {
        const res = await fetch('/api/invitations');
        const data = await res.json();
        setInvitations(data);
      } catch (err) {
        console.error('Failed to load invitations');
      }
    };
    fetchInvites();
  }, []);

  return (
    <section>
      <h2 className="text-xl font-semibold mb-2">Join in a Team</h2>
      <p className="mb-4">
        Check the invitations you got and join in a team. After you choose one team,
        others are automatically rejected.
      </p>

      <div className="bg-[#1a2841] rounded p-4">
        <table className="w-full text-left text-white">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="py-2 px-4">SENDER</th>
              <th className="py-2 px-4">INVITATION DATE/TIME</th>
              <th className="py-2 px-4 text-center">SELECT</th>
            </tr>
          </thead>
          <tbody>
            {invitations.map((inv) => (
              <InvitationRow
                key={inv.id}
                id={inv.id}
                sender={inv.sender}
                datetime={inv.datetime}
              />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default InvitationList;
