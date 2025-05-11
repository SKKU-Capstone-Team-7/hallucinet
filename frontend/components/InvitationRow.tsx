'use client';

type Props = {
  id: string;
  sender: string;
  datetime: string;
};

const InvitationRow = ({ id, sender, datetime }: Props) => {
  const handleClick = async () => {
    try {
      const res = await fetch(`/api/invitations/${id}/accept`, {
        method: 'PATCH',
      });

      if (!res.ok) throw new Error();
      alert('Invitation accepted');
      // 선택 후 상태 갱신은 필요에 따라 부모에서 처리 가능
    } catch (err) {
      alert('Failed to accept invitation');
    }
  };

  return (
    <tr className="border-t border-gray-700">
      <td className="py-3 px-4">{sender}</td>
      <td className="py-3 px-4">{datetime}</td>
      <td className="py-3 px-4 text-center">
        <button
          onClick={handleClick}
          className="text-[#1f8cf0] hover:underline focus:outline-none"
        >
          ✔
        </button>
      </td>
    </tr>
  );
};

export default InvitationRow;
