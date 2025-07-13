"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import dprojectIcon from "@public/DProjectLogo_650x600.svg";
import { chain } from "@/app/chain";
import { client } from "@/app/client";
import { ConnectButton, darkTheme } from "thirdweb/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    inAppWallet,
    createWallet,
  } from "thirdweb/wallets";
import WalletConnect from "@/components/WalletConnect";

export default function ReferrerDetails({ params }: { params: { referrerId: string } }) {
    const [referrerData, setReferrerData] = useState<{ email?: string; name?: string; tokenId?: string } | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchReferrerData = async () => {
            try {
                const response = await fetch("https://raw.githubusercontent.com/eastern-cyber/dproject-admin-1.0.1/main/public/dproject-users.json");
                const data = await response.json();
                const referrer = data.find((item: any) => item.userId.toLowerCase() === params.referrerId.toLowerCase());

                if (referrer) {
                    setReferrerData(referrer);
                }
            } catch (error) {
                console.error("Error fetching referrer data:", error);
            }
        };

        if (params.referrerId) {
            fetchReferrerData();
        }
    }, [params.referrerId]);

    const navigateToMintingPage = () => {
        const data = {
            var1: params.referrerId || "N/A", // Referrer ID from params
            var2: referrerData?.email || "N/A", // Email from referrerData
            var3: referrerData?.name || "N/A", // Name from referrerData
            var4: referrerData?.tokenId || "N/A", // Token ID from referrerData
        };

        // Store data in sessionStorage before navigation
        sessionStorage.setItem("mintingsData", JSON.stringify(data));

        // Navigate to minting page without exposing variables in the URL
        router.push("/referrer/minting");
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
                <WalletConnect />
                <div className="flex flex-col items-center justify-center p-2 m-2">
                    <p className="flex flex-col items-center justify-center text-[20px] m-2 text-center break-word">
                        <b>ขณะนี้ ท่านกำลังดำเนินการสมัครสมาชิก ภายใต้การแนะนำของ</b>
                    </p>
                    {referrerData ? (
                        // <div className="text-center text-[18px] bg-gray-900 p-4 border border-1 border-zinc-300">
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
                <div className="flex flex-col items-center mb-6">
                    <button onClick={navigateToMintingPage} className="flex flex-col mt-1 border border-zinc-100 px-4 py-3 rounded-lg bg-red-700 hover:bg-zinc-800 transition-colors hover:border-zinc-400">
                        ดำเนินการต่อ
                    </button>
                </div>
            </div>
        </main>
    );
}