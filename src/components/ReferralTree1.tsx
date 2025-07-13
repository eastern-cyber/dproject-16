import React, { useEffect, useState } from 'react';

interface User {
  userId: string;
  referrerId: string;
  email: string;
  name: string;
  tokenId: string;
  userCreated: string;
  planA: string;
}

interface TreeNode {
  user: User;
  generation: number;
  children: TreeNode[];
  expanded: boolean;
  totalReferrals: number;
}

const ReferralTree1: React.FC = () => {
  const [referrerId, setReferrerId] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [tree, setTree] = useState<TreeNode[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(
        'https://raw.githubusercontent.com/eastern-cyber/dproject-admin-1.0.1/main/public/dproject-users.json'
      );
      const data: User[] = await res.json();
      setUsers(data);
    };

    fetchData();
  }, []);

  const buildTree = (refId: string, generation: number): TreeNode[] => {
    if (generation > 10) return [];

    const children = users
      .filter(user => user.referrerId === refId)
      .map(user => {
        const childNodes = buildTree(user.userId, generation + 1);
        const totalReferrals = childNodes.reduce(
          (acc, child) => acc + child.totalReferrals + 1,
          0
        );

        return {
          user,
          generation,
          children: childNodes,
          expanded: false,
          totalReferrals,
        };
      });

    return children;
  };

  const handleSearch = (id: string) => {
    setReferrerId(id);
    const rootNodes = buildTree(id, 1);
    setTree(rootNodes);
  };

  const toggleNode = (node: TreeNode) => {
    node.expanded = !node.expanded;
    setTree([...tree]);
  };

  const exportToJson = () => {
    const json = JSON.stringify(tree, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `referral-tree-${referrerId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const shortenWallet = (address: string, front = 6, rear = 4) => {
    if (!address) return '';
    return `${address.slice(0, front)}...${address.slice(-rear)}`;
  };
  
  const renderTree = (nodes: TreeNode[], parentKey: string = ''): JSX.Element[] => {
    return nodes.flatMap((node, index) => {
      const key = `${parentKey}-${index}`;
      const directReferrals = node.children.length;
      const totalReferrals = node.totalReferrals;

      const row = (
        <tr key={key}>
          <td className="border border-gray-400 px-4 py-2 text-center">{node.generation}</td>
          <td className="border border-gray-400 px-4 py-2">
            <div className="flex flex-col text-white" style={{ marginLeft: `${(node.generation - 1) * 20}px` }}>
              <div className="flex items-center space-x-2">
                {directReferrals > 0 && (
                  <button className="text-white" onClick={() => toggleNode(node)}>
                    <span className="text-yellow-500 text-[18px]">
                      {node.expanded ? '⏶' : '⏷'}
                    </span>
                  </button>
                )}
                <span className="font-mono block md:hidden">
                  {shortenWallet(node.user.userId)}
                </span>
                <span className="font-mono hidden md:block">
                  {node.user.userId}
                </span>
                {/* <span className="font-mono">{node.user.userId}</span> */}
                {totalReferrals > 0 && (
                  <span className="text-green-400 text-sm">
                    ({directReferrals} / {totalReferrals})
                  </span>
                )}
              </div>
              <div className="ml-6 text-sm">
                👤 ชื่อ: {node.user.name || 'No name'}<br />
                📧 อีเมล: <span className="break-words">{node.user.email}</span><br />
                🪙 Token ID: {node.user.tokenId}
              </div>
            </div>
          </td>
        </tr>
      );

      const childRows = node.expanded ? renderTree(node.children, key) : [];
      return [row, ...childRows];
    });
  };

  return (
    <div className="text-[18px] pt-6 w-full">
        <div className="text-center">
          <span>รายละเอียดสมาชิกทั้งหมดในสายงาน</span>
          <input
            type="text"
            placeholder="ใส่เลขกระเป๋า..."
            value={referrerId}
            onChange={(e) => handleSearch(e.target.value)}
            className="text-[18px] text-center border border-gray-400 p-2 rounded mt-4 w-full bg-gray-900 text-white break-all"
          />
      </div>

      {tree.length > 0 && (
        <>
          <table className="table-auto w-full mt-4 border-collapse border border-gray-400">
            <thead>
              <tr>
                <th className="border border-gray-400 px-4 py-2 text-white">Gen</th>
                <th className="border border-gray-400 px-4 py-2 text-white">สมาชิกในสายงาน</th>
              </tr>
            </thead>
            <tbody>{renderTree(tree)}</tbody>
          </table>
          <div className="w-full justify-items-center">
            <button
              onClick={exportToJson}
              className="mt-4 mb-2 px-4 py-2 border border-gray-300 text-white rounded hover:text-gray-900 hover:border-gray-300 hover:bg-red-600"
            >
              📁 Export JSON
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ReferralTree1;
