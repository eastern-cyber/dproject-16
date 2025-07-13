import React, { useState, useEffect } from 'react';

interface User {
  userId: string;
  referrerId: string;
  email: string;
  name: string;
  tokenId: string;
  userCreated: string;
  planA: string;
}

const Dynamic10GensReferralTable: React.FC = () => {
  const [referrerId, setReferrerId] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [genUsers, setGenUsers] = useState<User[][]>([]);

  useEffect(() => {
    // Fetch user data
    const fetchData = async () => {
      try {
        const response = await fetch(
          'https://raw.githubusercontent.com/eastern-cyber/dproject-admin-1.0.2/main/public/dproject-users.json'
        );
        const data: User[] = await response.json();
        setUsers(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!referrerId || users.length === 0) {
      setGenUsers([]);
      return;
    }

    const generations: User[][] = [];
    let currentGen = users.filter(user => user.referrerId === referrerId);

    for (let i = 0; i < 10; i++) {
      generations.push(currentGen);
      const currentIds = currentGen.map(user => user.userId);
      currentGen = users.filter(user => currentIds.includes(user.referrerId));
    }

    setGenUsers(generations);
  }, [referrerId, users]);

  const totalUsers = genUsers.reduce((sum, gen) => sum + gen.length, 0);

  return (
    <div className="text-[18px] text-center pt-6 w-full">
        <span>จำนวนสมาชิกในแต่ละชั้น</span>
      <input
        type="text"
        placeholder="ใส่เลขกระเป๋า..."
        value={referrerId}
        onChange={(e) => setReferrerId(e.target.value)}
        className="text-[18px] text-center border border-gray-400 p-2 rounded mt-4 w-full bg-gray-900 text-gray-300 break-all"
      />

      {genUsers.length > 0 && (
        <table className="table-auto w-full mt-4 border-collapse border border-gray-400">
          <thead>
            <tr className="bg-gray-900 text-gray-300 text-[19px] font-bold">
              <th className="border border-gray-400 px-4 py-2">Gen</th>
              <th className="border border-gray-400 px-4 py-2">จำนวนสมาชิกในแต่ละชั้น (คน)</th>
            </tr>
          </thead>
          <tbody>
            {genUsers.map((gen, index) => (
              <tr key={index}>
                <td className="border border-gray-400 px-4 py-2 text-center">{index + 1}</td>
                <td className="border border-gray-400 px-4 py-2 text-center">{gen.length}</td>
              </tr>
            ))}
            <tr className="bg-gray-900 text-gray-300 text-[19px] font-bold">
              <td className="border border-gray-400 px-4 py-3 text-center">รวมทั้งหมด</td>
              <td className="border border-gray-400 px-4 py-3 text-center">
                <span className="text-yellow-200 text-[20px] font-bold">{totalUsers}</span>
              </td>
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Dynamic10GensReferralTable;
