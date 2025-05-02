'use client';

type Props = {
  sender: string;
  datetime: string;
};

const InvitationRow = ({ sender, datetime }: Props) => {
  const handleClick = () => {
    alert('Invitation accepted');
  };

  return (
    <tr className="border-t border-gray-700">
      <td className="py-3 px-4">{sender}</td>
      <td className="py-3 px-4">{datetime}</td>
      <td className="py-3 px-4 text-center">
        <button
          onClick={handleClick}
          className="text-[#1a8cff] hover:underline focus:outline-none"
        >
          ✔
        </button>
      </td>
    </tr>
  );
};

export default InvitationRow;
