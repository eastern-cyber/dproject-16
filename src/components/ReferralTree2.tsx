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
}

const ReferralTree: React.FC = () => {
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
      .map(user => ({
        user,
        generation,
        children: buildTree(user.userId, generation + 1),
        expanded: false,
      }));

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

  const renderTree = (nodes: TreeNode[], parentKey: string = ''): JSX.Element[] => {
    return nodes.flatMap((node, index) => {
      const key = `${parentKey}-${index}`;
      const row = (
        <tr key={key}>
          <td className="border border-gray-400 px-4 py-2 text-center">{node.generation}</td>
          <td className="border border-gray-400 px-4 py-2">
            <div className="flex items-center">
              {node.children.length > 0 && (
                <button
                  className="mr-2 text-white"
                  onClick={() => toggleNode(node)}
                >
                  {node.expanded ? '➖' : '➕'}
                </button>
              )}
              <span className="text-white" style={{ marginLeft: `${(node.generation - 1) * 20}px` }}>
                {node.user.userId}
              </span>
            </div>
          </td>
        </tr>
      );

      const childRows = node.expanded ? renderTree(node.children, key) : [];
      return [row, ...childRows];
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <input
        type="text"
        placeholder="ใส่เลขกระเป๋า..."
        value={referrerId}
        onChange={(e) => handleSearch(e.target.value)}
        className="text-[18px] text-center border border-gray-400 p-2 rounded mt-4 w-full bg-gray-800 text-white break-all"
      />

      {tree.length > 0 && (
        <table className="table-auto w-full mt-4 border-collapse border border-gray-400">
          <thead>
            <tr>
              <th className="border border-gray-400 px-4 py-2">Gen</th>
              <th className="border border-gray-400 px-4 py-2">User ID</th>
            </tr>
          </thead>
          <tbody>{renderTree(tree)}</tbody>
        </table>
      )}
    </div>
  );
};

export default ReferralTree;
