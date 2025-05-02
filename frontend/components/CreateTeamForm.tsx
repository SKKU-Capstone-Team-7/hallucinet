'use client';

import { useState } from 'react';

const CreateTeamForm = () => {
  const [teamName, setTeamName] = useState('');

  const handleCreate = () => {
    if (!teamName.trim()) {
      alert('Empty name!');
      return;
    }

    alert(`Creating team: ${teamName}`);
  };

  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold mb-2">Create a Team</h2>
      <p className="mb-4">Create your own team and become an owner.</p>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Team Name Here"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          className="flex-1 p-2 rounded bg-[#1a2841] text-white border border-gray-600"
        />
        <button
          onClick={handleCreate}
          className="bg-[#1f8cf0] text-black px-4 py-2 rounded"
        >
          Confirm
        </button>
      </div>
    </section>
  );
};

export default CreateTeamForm;
