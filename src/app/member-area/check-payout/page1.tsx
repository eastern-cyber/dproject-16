"use client";

import Image from "next/image";
import { useActiveAccount } from "thirdweb/react";
import dprojectIcon from "@public/DProjectLogo_650x600.svg";
import Link from "next/link";
import { useEffect, useState } from "react";
import WalletConnect from "@/components/WalletConnect";
import Footer from "@/components/Footer";

interface UserData {
    userId: string;
    referrerId: string;
    name?: string;
    email?: string;
    tokenId?: string;
    userCreated?: string;
    planA?: string;
    planB?: string;
}

interface ReportData {
    walletAddress: string;
    sentAmount: number;
    sentDate: string;
}

export default function RefereePage() {
    const [expandedUser, setExpandedUser] = useState<string | null>(null);

    const account = useActiveAccount();
    const [users, setUsers] = useState<UserData[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [referrerId, setReferrerId] = useState("");
    const [reportData, setReportData] = useState<ReportData[] | null>(null);
    
    const usersUrl = "https://raw.githubusercontent.com/eastern-cyber/dproject-admin-1.0.1/main/public/dproject-users.json";
    const reportUrl = "https://raw.githubusercontent.com/eastern-cyber/dproject-admin-1.0.1/main/public/send-pol-report.json";

    useEffect(() => {
        if (account?.address) {
            setReferrerId(account.address);
        }
    }, [account?.address]);

    useEffect(() => {
        Promise.all([
            fetch(usersUrl).then((res) => res.json()),
            fetch(reportUrl).then((res) => res.json()),
        ])
            .then(([userData, reportData]) => {
                setUsers(userData);
                setReportData(reportData);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error loading JSON:", err);
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="p-6">Loading...</div>;
    if (!users || !reportData) return <div className="p-6 text-red-600">Failed to load data.</div>;

    const matchingUser = users.find(user => user.userId === referrerId);

    // Aggregate sentAmount and get the latest sentDate
    const relevantReports = reportData.filter(report => report.walletAddress === matchingUser?.userId);

    // Get the latest sentDate from the last matching record
    const latestSentDate = relevantReports.length > 0 
        ? relevantReports[relevantReports.length - 1].sentDate 
        : "N/A";

    // Properly sum the total sent amount
    const totalSentAmount = relevantReports.reduce((sum, report) => sum + Number(report.sentAmount), 0);
    
    const matchingUsers = users.filter(
        (user) => user.referrerId === referrerId && user.userId.trim() !== ""
    ).map((user, index) => ({ ...user, recordNumber: index + 1 }));

    const walletAddress = account?.address || "";

    const formatDate = (dateString?: string) => {
        if (!dateString) return "N/A";
    
        // Manually parse "07/03/2025, 13:39:10" (DD/MM/YYYY, HH:mm:ss)
        const match = dateString.match(/^(\d{2})\/(\d{2})\/(\d{4}), (\d{2}):(\d{2}):(\d{2})$/);
        if (!match) return "Invalid Date";
    
        const [, day, month, year, hour, minute, second] = match.map(Number);
        
        const date = new Date(year, month - 1, day, hour, minute, second); // Month is 0-based in JS
    
        return date.toLocaleDateString("th-TH", {
            day: "2-digit",
            month: "2-digit",
            year: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false, // Ensures 24-hour format
        });
    };
    
    return (
        <main className="p-4 pb-10 min-h-[100vh] flex flex-col items-center">
            <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "5px",
                margin: "20px",
            }}>
                <Header />
                <h1 className="text-center text-[20px] font-bold">รายละเอียด ส่วนแบ่งรายได้</h1>
                <h2 className="text-center text-[16px] break-all">ใส่เลขกระเป๋าของท่าน หรือ เลขกระเป๋าของผู้ที่ต้องการจะตรวจสอบ</h2>
                <input
                    type="text"
                    placeholder="ใส่เลขกระเป๋า..."
                    value={referrerId}
                    onChange={(e) => setReferrerId(e.target.value)}
                    className="text-[18px] text-center border border-gray-400 p-2 rounded mt-4 w-full bg-gray-800 text-white break-all"
                />
                <h2 className="text-center text-[18px] mt-3 text-yellow-500 break-all">ระบบมีการปรับ <span className="text-red-500 text-[20px] mx-2 animate-blink"><b>Token ID</b></span> เพื่อรองรับ <span className="text-red-500 text-[20px] mx-2 animate-blink"><b>Plan B</b></span></h2>
                {matchingUser && (
                    <table className="table-auto border-collapse border border-gray-500 mt-4 w-full">
                        <thead>
                            <tr>
                                <th className="text-[19px] border border-gray-400 px-4 py-2">รายละเอียดสมาชิก</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <th className="text-[18px] text-left font-normal border border-gray-400 px-6 py-2 break-word">
                                    <b>เลขกระเป๋า:</b> <span className="text-red-500 break-all">{matchingUser.userId}</span><br />
                                    <b>อีเมล:</b> {matchingUser.email || "N/A"}<br />
                                    <b>ชื่อ:</b> {matchingUser.name || "N/A"}<br />
                                    <b>ลงทะเบียน:</b> {matchingUser.userCreated || "N/A"}<br />
                                    <b>เข้า Plan A:</b> {matchingUser.planA || "N/A"}<br />
                                    <b>เข้า Plan B:</b> {matchingUser.planB || "N/A"}<br />
                                    <span className="text-[19px] text-red-600">
                                        <b>Token ID: {matchingUser.tokenId || "N/A"}</b>
                                    </span><br />
                                    <b>Sponsor by:</b>&nbsp;
                                    <button
                                            className="text-left font-normal text-[18px] text-yellow-500 hover:text-red-500 break-all"
                                            onClick={() => setReferrerId(matchingUser.referrerId)}
                                        >
                                            {matchingUser.referrerId}
                                        </button>
                                </th>
                            </tr>
                        </tbody>
                    </table>
                )}
                {matchingUsers.length > 0 && (
                    <div>
                        <table className="table-auto border-collapse mt-4 w-full">
                            <thead>
                                <tr>
                                    <th className="border border-gray-400 px-4 py-2 w-1/6">#</th>
                                    <th className="text-[19px] border border-gray-400 px-4 py-2">รายละเอียดสมาชิกใต้สายงาน</th>
                                </tr>
                            </thead>
                            <tbody>
                                {matchingUsers.map((user) => (
                                    <tr key={user.userId}>
                                        <th className="border border-gray-400 px-4 py-2">{user.recordNumber}</th>
                                        <th className="text-[18px] font-normal text-left border border-gray-400 px-4 py-2 break-all relative">
                                            <b>เลขกระเป๋า:</b>&nbsp;
                                            <button
                                                className="text-left font-normal text-[18px] text-yellow-500 hover:text-red-500 break-all"
                                                onClick={() => setReferrerId(user.userId)}
                                            >
                                                {user.userId}
                                            </button>
                                            <br />
                                            <b>อีเมล:</b> {user.email || "N/A"}
                                            
                                            {/* Toggle Button */}
                                            <button
                                                className="absolute top-2 right-4 text-yellow-500 hover:text-red-500"
                                                onClick={() => setExpandedUser(expandedUser === user.userId ? null : user.userId)}
                                            >
                                                {expandedUser === user.userId ? <span className="text-[18px]">⏶</span> : <span className="text-[18px]">⏷</span>}
                                            </button>

                                            {/* Expanded Details */}
                                            {expandedUser === user.userId && (
                                                <div className="mt-2 break-word">
                                                    <b>ชื่อ:</b> {user.name || "N/A"}<br />
                                                    <b>ลงทะเบียน:</b> {user.userCreated || "N/A"}<br />
                                                    <b>เข้า Plan A:</b> {formatDate(user.planA) || "N/A"}<br />
                                                    <b>เข้า Plan B:</b> {formatDate(user.planB) || "N/A"}<br />
                                                    <span className="text-[19px] text-red-600">
                                                        <b>Token ID: {user.tokenId || "N/A"}</b>
                                                    </span>
                                                </div>
                                            )}
                                        </th>
                                    </tr>
                                ))}
                            </tbody>

                        </table>
                        <table className="w-full justify-center items-center">
                            <tbody>
                                <tr className="colspan-[1]">
                                    <th>
                                        <p className="mb-12 text-center m-4 pr-10 text-lg font-semibold">
                                            <span className="text-[19px] text-center">
                                                รวมจำนวนสมาชิกแนะนำตรง : &nbsp;&nbsp;
                                                <span className="text-[24px] text-yellow-500">{matchingUsers.length}</span>
                                                &nbsp;&nbsp; ท่าน</span>
                                        </p>
                                    </th>
                                </tr>
                            </tbody>
                            <tbody className="mt-6 w-full justify-center items-center">
                                <tr className="mt-4 colspan-[1]">
                                    <th className="border border-gray-400 px-4 py-2">
                                        <p className="text-[19px] text-center m-2 text-lg font-semibold">
                                                ส่วนแบ่งรายได้  การประชาสัมพันธ์
                                        </p>
                                    </th>
                                </tr>
                                <tr className="w-full">
                                    <th className="border border-gray-400 px-4 py-2">
                                        <div className="text-center">
                                            <p className="text-center m-4 text-lg font-semibold">
                                                <span className="text-[18px] text-center">
                                                    ยอดรวม&nbsp;&nbsp;&nbsp;
                                                    <span className="text-[24px] text-yellow-500 animate-blink">
                                                        {matchingUsers.length * 12}
                                                    </span> &nbsp; POL
                                                </span>
                                            </p>
                                            <p className="text-center m-4 text-lg font-semibold">
                                                <span className="text-[18px] text-center">
                                                    รับแล้ว&nbsp;&nbsp;&nbsp;
                                                    <span className="text-[24px] text-green-500 animate-blink">
                                                        {totalSentAmount}
                                                    </span> &nbsp; POL
                                                </span>
                                            </p>
                                            <p className="text-center m-4 text-lg font-semibold">
                                                <span className="text-[18px] text-center">
                                                    ยอดใหม่&nbsp;&nbsp;&nbsp;
                                                    <span className="text-[24px] text-red-500 animate-blink">
                                                        {matchingUsers.length * 12 - totalSentAmount}
                                                    </span> &nbsp; POL
                                                </span>
                                            </p>
                                        </div>
                                    </th>
                                </tr>
                                <tr className="w-full">
                                    <th className="border border-gray-400 px-4 py-2">
                                        <p className="text-center m-4 text-lg font-semibold">
                                            <span className="text-[19px] text-center">
                                                รับครั้งล่าสุด<br />
                                                <Link 
                                                    href={`https://polygonscan.com/address/${referrerId}`} 
                                                    className="text-[18px] text-blue-300 hover:text-red-500"
                                                    target="_blank">
                                                    <p className="mt-3">
                                                        {latestSentDate}
                                                    </p>
                                                </Link>
                                            </span>
                                        </p>
                                    </th>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}
                <WalletBalances walletAddress={account?.address || ""} setReferrerId={setReferrerId} />
                <Link
                    className="mb-8 border border-zinc-500 px-4 py-3 rounded-lg hover:bg-red-600 hover:text-yellow-200 hover:border-yellow-300"
                    href="/member-area/check-referee">
                    <p className="text-center text-[19px]">ตรวจสอบสายงาน</p>
                </Link>
                <Link className="mb-8 border border-zinc-500 px-4 py-3 rounded-lg hover:bg-red-600 hover:text-yellow-200 hover:border-yellow-300"
                    href="/member-area">
                    <p className="text-center text-[19px]">กลับสู่พื้นที่สมาชิก</p>
                </Link>
            </div>
            <div className='px-1 w-full'>
                <Footer />
            </div>
        </main>
    );
}

interface WalletBalancesProps {
    walletAddress?: string;
    setReferrerId: (id: string) => void;
}

const WalletBalances: React.FC<WalletBalancesProps>= ({ walletAddress, setReferrerId }) => (
    <div className="flex flex-col items-center p-6">
        <p className="text-[19px]"><b>เลขกระเป๋าของท่าน</b></p>
        <div className="text-[18px] border border-gray-500 bg-[#1e1d59] p-2 mt-2 rounded">
            <button
                className="text-yellow-500 hover:text-red-500 text-[18px] break-all"
                onClick={() => setReferrerId(walletAddress ?? "")}
            >
                {walletAddress || "ยังไม่ได้เชื่อมกระเป๋า !"}
            </button>
        </div>
            <p className="text-center my-3 text-[16px]">
                คลิ๊กเลขกระเป๋าด้านบนนี้ เพื่อกลับไปเริ่มต้นที่รายละเอียดของตัวท่านเอง
            </p>
    </div>
);

function Header() {
    return (
        <header className="flex flex-col items-center mb-4">
            <Link href="/">
                <Image src={dprojectIcon} alt="" className="m-8 size-[100px]" />
            </Link>
            <h1 className="text-1xl md:text-4xl font-semibold md:font-bold mb-6">Check Payout</h1>
            <WalletConnect />
        </header>
    );
}