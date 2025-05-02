import InvitationRow from './InvitationRow';

const invitations = new Array(5).fill({
  sender: 'nariveshere@gmail.com',
  datetime: '2025-04-28 14:37',
});

const InvitationList = () => (
  <section>
    <h2 className="text-xl font-semibold mb-2">Join in a Team</h2>
    <p className="mb-4">
      Check the invitations you got and join in a team. After you choose one team,
      others are automatically rejected.
    </p>

    <div className="bg-[#1c2a3a] rounded p-4">
      <table className="w-full text-left text-white">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="py-2 px-4">SENDER</th>
            <th className="py-2 px-4">INVITATION DATE/TIME</th>
            <th className="py-2 px-4 text-center">SELECT</th>
          </tr>
        </thead>
        <tbody>
          {invitations.map((inv, idx) => (
            <InvitationRow key={idx} sender={inv.sender} datetime={inv.datetime} />
          ))}
        </tbody>
      </table>
    </div>
  </section>
);

export default InvitationList;
