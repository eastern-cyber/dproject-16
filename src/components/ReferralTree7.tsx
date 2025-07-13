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

interface ReferralTreeProps {
  referrerId: string;
}

const ReferralTree: React.FC<ReferralTreeProps> = ({ referrerId }) => {
  const [input, setInput] = useState(referrerId);
  const [users, setUsers] = useState<User[]>([]);
  const [tree, setTree] = useState<TreeNode[]>([]);

  useEffect(() => {
    setInput(referrerId);
  }, [referrerId]);

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

  useEffect(() => {
    if (users.length > 0 && input) {
      const builtTree = buildTree(input, 1);
      setTree(builtTree);
    }
  }, [users, input]);

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
          expanded: false, // not auto-expand all by default
          totalReferrals,
        };
      });

    return children;
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

  const exportReferralSummary = () => {
    const map = new Map<string, TreeNode>();
  
    const flattenTree = (nodes: TreeNode[]) => {
      for (const node of nodes) {
        map.set(node.user.tokenId, node); // tokenId as key
        flattenTree(node.children);
      }
    };
  
    flattenTree(tree);
  
    const records = Array.from(map.values()).map((node) => {
      const totalMembers = node.totalReferrals;
      const totalUnilevel = totalMembers * 0.8;
      const totalSaved = totalUnilevel * 0.25;
      const totalReceived = totalUnilevel - totalSaved;
  
      return {
        userId: node.user.userId,
        tokenId: node.user.tokenId,
        totalMembers,
        totalUnilevel: Number(totalUnilevel.toFixed(2)),
        totalSaved: Number(totalSaved.toFixed(2)),
        totalReceived: Number(totalReceived.toFixed(2)),
      };
    });
  
    const json = JSON.stringify(records, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `referral-summary-${referrerId}.json`;
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
            <div
              className="flex flex-col text-gray-300 text-[18px]"
              style={{ marginLeft: `${(node.generation - 1) * 20}px` }}
            >
              <div className="flex items-center space-x-2 text-[18px]">
                {directReferrals > 0 && (
                  <button className="text-gray-300" onClick={() => toggleNode(node)}>
                    <span className="text-yellow-500">{node.expanded ? '⏶' : '⏷'}</span>
                  </button>
                )}
                <span className="font-mono block md:hidden">
                  {shortenWallet(node.user.userId)}
                </span>
                <span className="font-mono hidden md:block">
                  {node.user.userId}
                </span>
                {totalReferrals > 0 && (
                  <span className="text-green-400 text-sm">
                    ({directReferrals}/{totalReferrals})
                  </span>
                )}
              </div>
              <div className="ml-6 text-[17px]">
                👤 ชื่อ: {node.user.name || 'No name'}<br />
                📧 อีเมล: <span className="break-all">{node.user.email}</span><br />
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

  const countTotalUsers = (nodes: TreeNode[]): number => {
    return nodes.reduce((acc, node) => acc + 1 + countTotalUsers(node.children), 0);
  };

  // Add this helper function above the return statement
  const getGenerationSummary = (nodes: TreeNode[], summary: Record<number, number> = {}) => {
    for (const node of nodes) {
      summary[node.generation] = (summary[node.generation] || 0) + 1;
      getGenerationSummary(node.children, summary);
    }
    return summary;
  };

  
  return (
    <div className="text-[18px] pt-6 w-full">
      <div className="text-center">
        <span>รายละเอียดสมาชิกทั้งหมดในสายงาน</span>
        <input
          type="text"
          placeholder="ใส่เลขกระเป๋า..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="text-[18px] text-center border border-gray-400 p-2 rounded mt-4 w-full bg-gray-900 text-gray-300 break-all"
        />
        {/* <button
          onClick={() => {
            const root = buildTree(input, 1);
            setTree(root);
          }}
          className="mt-2 px-4 py-2 border border-gray-300 text-white rounded hover:bg-green-600"
        >
          🔍 ค้นหา
        </button> */}
      </div>

      {tree.length > 0 && (
        <>
          <table className="table-auto w-full mt-4 border-collapse border border-gray-400 text-gray-300">
            <thead>
              <tr className="bg-gray-900 text-[19px] font-bold">
                <th className="border border-gray-400 py-3 px-4">Gen</th>
                <th className="border border-gray-400 py-3 px-4">สมาชิกในสายงาน</th>
              </tr>
            </thead>
            <tbody>
              {renderTree(tree)}
              <tr className="bg-gray-900 text-gray-300 text-[19px]">
                <td className="border border-gray-400 px-4 py-3 text-center font-bold" colSpan={2}>
                  👥 จำนวนสมาชิกทั้งหมดในสายงาน &nbsp;&nbsp;
                  <span className="text-[20px] text-yellow-200 font-bold">
                    {countTotalUsers(tree)}
                  </span>
                  &nbsp;&nbsp; คน
                </td>
              </tr>
            </tbody>
          </table>
          {/* <div className="w-full justify-items-center text-center">
            <button
              onClick={exportToJson}
              className="mt-4 mb-2 px-4 py-2 border border-gray-300 text-white rounded hover:text-gray-900 hover:border-gray-300 hover:bg-red-600"
            >
              📁 Export JSON
            </button>
          </div> */}
          {tree.length > 0 && (
            <>
              <div className="mt-6">

                <table className="table-auto w-full border-collapse border border-gray-400 text-gray-300">
                  <thead>
                    <tr className="bg-gray-900 text-[19px] font-bold">
                      <th className="border border-gray-400 py-3 px-4">Gen</th>
                      <th className="border border-gray-400 py-3 px-4">จำนวนสมาชิก<br />(คน)</th>
                      <th className="border border-gray-400 py-3 px-4">รายได้ครอบครัวอบอุ่น<br /> 2% 10 ชั้นลึก</th>
                      <th className="border border-gray-400 py-3 px-4">เก็บสะสม<br />25%</th>
                      <th className="border border-gray-400 py-3 px-4">ได้รับ<br />POL</th>
                    </tr>
                  </thead>
                  <tbody>
                  {(() => {
                    const genSummary = Object.entries(getGenerationSummary(tree))
                      .sort((a, b) => Number(a[0]) - Number(b[0]));

                    let totalMembers = 0;
                    let totalUnilevel = 0;
                    let totalSaved = 0;
                    let totalReceived = 0;

                    return (
                      <>
                        {genSummary.map(([gen, count]) => {
                          const unilevel = count * 0.8;
                          const saved = unilevel * 0.25;
                          const received = unilevel - saved;

                          totalMembers += count;
                          totalUnilevel += unilevel;
                          totalSaved += saved;
                          totalReceived += received;

                          return (
                            <tr key={gen}>
                              <td className="border border-gray-400 px-5 py-3 text-center">{gen}</td>
                              <td className="border border-gray-400 px-5 py-3 text-center">{count}</td>
                              <td className="border border-gray-400 px-5 py-3 text-right">{unilevel.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                              <td className="border border-gray-400 px-5 py-3 text-right">{saved.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                              <td className="border border-gray-400 px-5 py-3 text-right">{received.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                            </tr>
                          );
                        })}
                            <tr className="bg-gray-900 text-gray-300 text-[19px] font-bold">
                              <td className="border border-gray-400 px-5 py-3 text-[22px] text-center">รวม</td>
                              <td className="border border-gray-400 px-5 py-3 text-center text-yellow-200">{totalMembers}</td>
                              <td className="border border-gray-400 px-5 py-3 text-right text-yellow-200">{totalUnilevel.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                              <td className="border border-gray-400 px-5 py-3 text-right text-yellow-200">{totalSaved.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                              <td className="border border-gray-400 px-5 py-3 text-right text-yellow-200">{totalReceived.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                            </tr>
                          </>
                        );
                      })()}
                  </tbody>
                </table>
                <p className="py-2 text-[18px] text-center"><b>หมายเหตุ :</b> เมื่อเกิดรายได้ทุกช่องทาง ระบบมีการจัดเก็บค่าพัฒนา 5%</p>
              </div>
              <div className="w-full justify-items-center text-center">
                <button
                  onClick={exportReferralSummary}
                  className="mt-4 mb-2 px-4 py-2 border border-gray-300 text-white rounded hover:text-gray-900 hover:border-gray-300 hover:bg-yellow-500"
                >
                  📁 Download JSON Table Report
                </button>
                {/* New Table Starts Here */}
                <div className="w-full mt-6">
                  <table className="table-auto w-full border-collapse border border-gray-400 text-gray-300">
                    <thead>
                      <tr className="bg-gray-900 text-[19px] font-bold">
                        <th className="border border-gray-400 py-3 px-4 text-center">ข้อมูลเพิ่มเติม</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-400 px-4 py-3 text-left">🔸 แถวที่ 1: รายละเอียดเพิ่มเติม</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-400 px-4 py-3 text-left">🔸 แถวที่ 2: ข้อมูลประกอบการวิเคราะห์</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-400 px-4 py-3 text-left">🔸 แถวที่ 3: หมายเหตุหรือข้อแนะนำ</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default ReferralTree;