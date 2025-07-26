import Link from 'next/link';
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
        'https://raw.githubusercontent.com/eastern-cyber/dproject-admin-1.0.2/main/public/dproject-users.json'
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

  const [payoutData, setPayoutData] = useState<any[]>([]);
  const [receivedAmount, setReceivedAmount] = useState(0);

  useEffect(() => {
    const fetchPayoutData = async () => {
      try {
        const res = await fetch('https://raw.githubusercontent.com/eastern-cyber/dproject-admin-1.0.2/main/public/CaringBonus-Payout-Success_Polygonscan.json');
        const data = await res.json();
        setPayoutData(data);
      } catch (error) {
        console.error("Error fetching payout data:", error);
      }
    };

    fetchPayoutData();
  }, []);

  // useEffect(() => {
  //   if (!input || payoutData.length === 0) return;

  //   const totalReceivedFromChain = payoutData
  //     .filter((tx: any) => tx.To.toLowerCase() === input.toLowerCase())
  //     .reduce((sum, tx: any) => sum + parseFloat(tx["Value_OUT(POL)"] || "0"), 0);

  //   setReceivedAmount(totalReceivedFromChain);
  // }, [input, payoutData]);
  useEffect(() => {
    if (!input || payoutData.length === 0) return;
  
    const matchedTxs = payoutData.filter((tx: any) => tx.To.toLowerCase() === input.toLowerCase());
  
    const totalReceivedFromChain = matchedTxs.reduce(
      (sum, tx: any) => sum + parseFloat(tx["Value_OUT(POL)"] || "0"), 0
    );
  
    setReceivedAmount(totalReceivedFromChain);
  
    // Find the latest transaction (based on DateTime UTC)
    const latestTx = matchedTxs.reduce((latest, current) => {
      return new Date(current["DateTime (UTC)"]) > new Date(latest["DateTime (UTC)"]) ? current : latest;
    }, matchedTxs[0]);
  
    if (latestTx) {
      setLastReceivedDate(formatUTCToBangkok(latestTx["DateTime (UTC)"]));
    }
  }, [input, payoutData]);
  
  const {
    totalMembers,
    totalUnilevel,
    totalSaved,
    totalReceived: totalExpected,
  } = React.useMemo(() => {
    const genSummary = Object.entries(getGenerationSummary(tree))
      .sort((a, b) => Number(a[0]) - Number(b[0]));
  
    let totalMembers = 0;
    let totalUnilevel = 0;
    let totalSaved = 0;
    let totalReceived = 0;
  
    genSummary.forEach(([_, count]) => {
      const unilevel = count * 0.8;
      const saved = unilevel * 0.25;
      const received = unilevel - saved;
  
      totalMembers += Number(count);
      totalUnilevel += unilevel;
      totalSaved += saved;
      totalReceived += received;
    });
  
    return {
      totalMembers,
      totalUnilevel,
      totalSaved,
      totalReceived,
    };
  }, [tree]);
  
  // const formatUTCToBangkok = (utcDateStr: string): string => {
  //   const utcDate = new Date(utcDateStr + ' UTC'); // Make sure it's treated as UTC
  //   const bangkokTime = new Date(utcDate.getTime() + 7 * 60 * 60 * 1000); // UTC+7
  //   const pad = (n: number) => n.toString().padStart(2, '0');
  
  //   return `${pad(bangkokTime.getDate())}/${pad(bangkokTime.getMonth() + 1)}/${bangkokTime.getFullYear()} ` +
  //          `${pad(bangkokTime.getHours())}:${pad(bangkokTime.getMinutes())}:${pad(bangkokTime.getSeconds())}`;
  // };
  
  function formatUTCToBangkok(utcString: string): string {
    const utcDate = new Date(utcString);
  
    // Convert to Bangkok time (UTC+7)
    const bangkokDate = new Date(utcDate.getTime() + 7 * 60 * 60 * 1000);
  
    const dd = String(bangkokDate.getDate()).padStart(2, '0');
    const mm = String(bangkokDate.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
    const yyyy = bangkokDate.getFullYear();
  
    const HH = String(bangkokDate.getHours()).padStart(2, '0');
    const min = String(bangkokDate.getMinutes()).padStart(2, '0');
    const sec = String(bangkokDate.getSeconds()).padStart(2, '0');
  
    return `${dd}/${mm}/${yyyy} ${HH}:${min}:${sec}`;
  }
  
  const [lastReceivedDate, setLastReceivedDate] = useState<string | null>(null);

  const rowsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  // Flatten the tree into a paginated list
  const flattenedRows = renderTree(tree); // assuming this returns an array of <tr> elements

  const totalPages = Math.ceil(flattenedRows.length / rowsPerPage);
  const paginatedRows = flattenedRows.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <div className="text-[18px] pt-6 w-full">
      <div className="text-center">
        <span>รายละเอียดสมาชิกทั้งหมดในครอบครัว</span>
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
                <th className="border border-gray-400 py-3 px-4">สมาชิกในครอบครัว</th>
              </tr>
            </thead>
            <tbody>
            {paginatedRows}
              <tr className="bg-gray-900 text-gray-300 text-[19px]">
                <td className="border border-gray-400 px-4 py-3 text-center font-bold" colSpan={2}>
                  👥 จำนวนสมาชิกทั้งหมดในครอบครัว &nbsp;&nbsp;
                  <span className="text-[20px] text-yellow-200 font-bold">
                    {countTotalUsers(tree)}
                  </span>
                  &nbsp;&nbsp; คน
                </td>
              </tr>
            </tbody>
          </table>

          <div className="flex justify-center items-center mt-6 space-x-1 text-sm flex-wrap">
            <button
              className="px-2 py-1 bg-gray-700 text-white rounded hover:bg-red-600 disabled:opacity-50"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              |&lt;
            </button>
            <button
              className="px-2 py-1 bg-gray-700 text-white rounded hover:bg-red-600 disabled:opacity-50"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              &lt;
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .slice(
                Math.max(0, currentPage - 3),
                Math.min(totalPages, currentPage + 2)
              )
              .map((page) => (
                <button
                  key={page}
                  className={`px-3 py-1 rounded ${
                    currentPage === page ? "bg-yellow-500 text-black font-bold" : "bg-gray-700 text-white"
                    } hover:bg-red-600`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}

            <button
              className="px-2 py-1 bg-gray-700 text-white rounded hover:bg-red-600 disabled:opacity-50"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              &gt;
            </button>
            <button
              className="px-2 py-1 bg-gray-700 text-white rounded hover:bg-red-600 disabled:opacity-50"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              &gt;|
            </button>
              <div className="pl-2 ml-4 text-white">
                  หน้า <span className="text-yellow-400">{currentPage}</span> /{" "}
                  <span className="text-yellow-400">{totalPages}</span>
              </div>
          </div>

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
                      <th className="border border-gray-400 py-3 px-4">รายได้ Caring Bonus<br /> 2% 10 ชั้นลึก</th>
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

                <div className="w-full mt-6">
                  <table className="table-auto w-full border-collapse border border-gray-400 text-gray-300">
                    {/* Section 1 */}
                    <thead>
                      <tr className="bg-gray-900 text-[19px] font-bold">
                        <th className="border border-gray-400 py-3 px-4 text-center">
                          ส่วนแบ่งรายได้ Caring Bonus
                        </th>
                      </tr>
                    </thead>

                    {/* Section 2 */}
                    <tbody>
                      <tr className="w-full">
                        <th className="border border-gray-400 px-4 py-2">
                          <div className="text-center">
                            <p className="text-center m-4 text-lg font-semibold">
                              <span className="text-[18px] text-center">
                                ยอดรวม&nbsp;&nbsp;&nbsp;
                                <span className="text-[24px] text-yellow-500 animate-blink">
                                  {totalExpected.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })}
                                </span> &nbsp; POL
                              </span>
                            </p>
                            <p className="text-center m-4 text-lg font-semibold">
                              <span className="text-[18px] text-center">
                                รับแล้ว&nbsp;&nbsp;&nbsp;
                                <span className="text-[24px] text-green-500 animate-blink">
                                  {receivedAmount.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })}
                                </span> &nbsp; POL
                              </span>
                            </p>
                            <p className="text-center m-4 text-lg font-semibold">
                              <span className="text-[18px] text-center">
                                ยอดใหม่&nbsp;&nbsp;&nbsp;
                                <span className="text-[24px] text-red-500 animate-blink">
                                  {(totalExpected - receivedAmount).toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })}
                                </span> &nbsp; POL
                              </span>
                            </p>
                          </div>
                        </th>
                      </tr>
                    </tbody>

                    {/* Section 3 */}
                    <tfoot>
                      <tr>
                        <th className="border border-gray-400 px-4 py-2">
                          <p className="text-center m-4 text-lg font-semibold">
                            <span className="text-[19px] text-center">
                              รับครั้งล่าสุด<br />
                              <Link
                                href={`https://polygonscan.com/address/${input}`}
                                className="text-[18px] text-blue-300 hover:text-red-500"
                                target="_blank">
                                <p className="mt-3">
                                  {lastReceivedDate ?? 'ยังไม่มีรายการรับ'}
                                </p>
                              </Link>
                            </span>
                          </p>
                        </th>
                      </tr>
                    </tfoot>
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
