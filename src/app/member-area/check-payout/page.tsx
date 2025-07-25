"use client";

import Image from "next/image";
import { useActiveAccount } from "thirdweb/react";
import dprojectIcon from "@public/DProjectLogo_650x600.svg";
import Link from "next/link";
import { useEffect, useState } from "react";
import WalletConnect from "@/components/WalletConnect";
import Footer from "@/components/Footer";
import ReferralTree from "@/components/ReferralTree";
import ReferralSummary from "@/components/ReferralSummary";
import ReturnBonusData from "@/components/ReturnBonusData";


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
    
    const usersUrl = "https://raw.githubusercontent.com/eastern-cyber/dproject-admin-1.0.2/main/public/dproject-users.json";
    const reportUrl = "https://raw.githubusercontent.com/eastern-cyber/dproject-admin-1.0.2/main/public/send-pol-report.json";

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
                <div className="max-w-4xl mx-auto mt-10 w-full">
                    <ReferralSummary
                        referrerId={referrerId}
                        setReferrerId={setReferrerId}
                        users={users}
                        reportData={reportData}
                    />
                </div>
                <div className="max-w-4xl mx-auto mt-10 w-full">
                    <ReferralTree referrerId={referrerId} />
                </div>
                <div className="max-w-4xl mx-auto mt-10 w-full">
                    <ReturnBonusData
                        referrerId={referrerId}
                        setReferrerId={setReferrerId}
                        users={users}
                        reportData={reportData}
                    />
                </div>
                <WalletBalances walletAddress={account?.address || ""} setReferrerId={setReferrerId} />
                <Link
                    className="mb-8 border border-zinc-500 px-4 py-3 rounded-lg hover:bg-red-600 hover:text-yellow-200 hover:border-yellow-300"
                    href="/member-area/check-user">
                    <p className="text-center text-[19px]">ตรวจสอบรายละเอียดสมาชิก</p>
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