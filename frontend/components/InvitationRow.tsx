'use client';

import { databases } from '@/lib/appwrite'; // appwrite.js에서 export한 databases 객체 사용

type Props = {
  id: string;
  sender: string;
  datetime: string;
};

const InvitationRow = ({ id, sender, datetime }: Props) => {
  const handleClick = async () => {
    try {
      const response = await databases.updateDocument(
        '[YOUR_DATABASE_ID]', // 데이터베이스 ID
        '[YOUR_INVITATIONS_COLLECTION_ID]', // 초대 컬렉션 ID
        id, // 초대 문서 ID
        { status: 'accepted' } // 상태를 'accepted'로 변경
      );

      alert('Invitation accepted');
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
