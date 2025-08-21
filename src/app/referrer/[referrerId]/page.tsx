"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import dprojectIcon from "@public/DProjectLogo_650x600.svg";
import { chain } from "@/app/chain";
import { client } from "@/app/client";
import { ConnectButton, darkTheme } from "thirdweb/react";
import WalletConnect from "@/components/WalletConnect";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    inAppWallet,
    createWallet,
  } from "thirdweb/wallets";
import Footer from "@/components/Footer";

export default function ReferrerDetails({ params }: { params: { referrerId: string } }) {
    const [referrerData, setReferrerData] = useState<{ email?: string; name?: string; tokenId?: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchReferrerData = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await fetch("https://raw.githubusercontent.com/eastern-cyber/dproject-admin-1.0.2/main/public/dProjectUsers.json");
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                
                // Assuming the new structure might be different, let's log it to see
                console.log("Fetched data structure:", data);
                
                // Try different possible structures - adjust based on actual structure
                let referrer;
                
                // Option 1: If data is an array directly
                if (Array.isArray(data)) {
                    referrer = data.find((item: any) => 
                        item.userId?.toLowerCase() === params.referrerId.toLowerCase() ||
                        item.walletAddress?.toLowerCase() === params.referrerId.toLowerCase()
                    );
                } 
                // Option 2: If data has a users property that contains the array
                else if (data.users && Array.isArray(data.users)) {
                    referrer = data.users.find((item: any) => 
                        item.userId?.toLowerCase() === params.referrerId.toLowerCase() ||
                        item.walletAddress?.toLowerCase() === params.referrerId.toLowerCase()
                    );
                }
                // Option 3: If data has a different structure
                else if (typeof data === 'object') {
                    // Try to find the user by ID in any nested structure
                    referrer = Object.values(data).find((item: any) => 
                        item && typeof item === 'object' && 
                        (item.userId?.toLowerCase() === params.referrerId.toLowerCase() ||
                         item.walletAddress?.toLowerCase() === params.referrerId.toLowerCase())
                    );
                }

                if (referrer) {
                    setReferrerData({
                        email: referrer.email || referrer.userEmail || "N/A",
                        name: referrer.name || referrer.userName || referrer.fullName || "N/A",
                        tokenId: referrer.tokenId || referrer.nftTokenId || "N/A"
                    });
                } else {
                    setError("ไม่พบข้อมูลผู้แนะนำ");
                }
            } catch (error) {
                console.error("Error fetching referrer data:", error);
                setError("เกิดข้อผิดพลาดในการโหลดข้อมูล");
            } finally {
                setLoading(false);
            }
        };

        if (params.referrerId) {
            fetchReferrerData();
        }
    }, [params.referrerId]);

    const navigateToConfirmPage = () => {
        const data = {
            var1: params.referrerId || "N/A", // Referrer ID from params
            var2: referrerData?.email || "N/A", // Email from referrerData
            var3: referrerData?.name || "N/A", // Name from referrerData
            var4: referrerData?.tokenId || "N/A", // Token ID from referrerData
        };

        // Store data in sessionStorage before navigation
        sessionStorage.setItem("mintingsData", JSON.stringify(data));

        // Navigate to confirmation page instead of minting page
        router.push("/referrer/confirm");
    };

    return (
        <main className="p-4 pb-10 min-h-[100vh] flex flex-col items-center">
            <div className="flex flex-col items-center justify-center p-10 m-5 border border-gray-800 rounded-lg">
                <Link href="/" passHref>
                    <Image
                        src={dprojectIcon}
                        alt=""
                        className="mb-4 size-[100px] md:size-[100px]"
                        style={{
                            filter: "drop-shadow(0px 0px 24px #a726a9a8",
                        }}
                    />
                </Link>
                <h1 className="p-4 md:text-2xl text-2xl font-semibold md:font-bold tracking-tighter">
                    สมัครใช้งาน
                </h1>
                <div className="flex justify-center m-5">
                    <WalletConnect />
                </div>
                <div className="flex flex-col items-center justify-center p-2 m-2">
                    <p className="flex flex-col items-center justify-center text-[20px] m-2 text-center break-word">
                        <b>ขณะนี้ ท่านกำลังดำเนินการสมัครสมาชิก ภายใต้การแนะนำของ</b>
                    </p>
                    
                    {loading ? (
                        <p className="text-gray-400 text-sm mt-2">กำลังโหลดข้อมูล...</p>
                    ) : error ? (
                        <p className="text-red-400 text-sm mt-2">{error}</p>
                    ) : referrerData ? (
                        <div className="mt-4 text-center gap-6 bg-gray-900 p-4 border border-1 border-gray-400">
                            <p className="text-lg text-gray-300">
                                <b>เลขกระเป๋าผู้แนะนำ:</b> {params.referrerId ? `${params.referrerId.slice(0, 6)}...${params.referrerId.slice(-4)}` : "ไม่พบกระเป๋า"}<br />
                            </p>
                            <p className="text-lg text-gray-300">
                                <b>อีเมล:</b> {referrerData.email}
                            </p>
                            <p className="text-lg text-gray-300 mt-1">
                                <b>ชื่อ:</b> {referrerData.name}
                            </p>
                            <p className="text-lg text-red-600 mt-1">
                                <b>Token ID: {referrerData.tokenId} </b>
                            </p>
                        </div>
                    ) : (
                        <p className="text-gray-600 text-sm mt-2">ไม่พบข้อมูลผู้แนะนำ</p>
                    )}
                    
                    <div className="items-centerflex border border-gray-400 bg-[#2b2b59] p-2.5 mt-5 w-full">
                        <p className="text-[18px] break-all">
                            <center>
                            {params.referrerId ? `${params.referrerId}` : "ไม่พบกระเป๋า"}
                            </center>
                        </p>
                    </div>
                </div>
                
                {!loading && !error && (
                    <div className="flex flex-col items-center mb-6">
                        <button 
                            onClick={navigateToConfirmPage} 
                            className="flex flex-col mt-1 border border-zinc-100 px-4 py-3 rounded-lg bg-red-700 hover:bg-zinc-800 transition-colors hover:border-zinc-400"
                            disabled={!referrerData}
                        >
                            ดำเนินการต่อ
                        </button>
                    </div>
                )}
            </div>
            <div className='px-1 w-full'>
                <Footer />
            </div>
        </main>
    );
}