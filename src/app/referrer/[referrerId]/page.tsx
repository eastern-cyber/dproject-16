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
import Footer from "@/components/Footer";

export default function ReferrerDetails({ params }: { params: { referrerId: string } }) {
    const [referrerData, setReferrerData] = useState<{ email?: string; name?: string; tokenId?: string } | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchReferrerData = async () => {
            try {
                const response = await fetch("https://raw.githubusercontent.com/eastern-cyber/dproject-admin-1.0.2/main/public/dproject-users.json");
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
                    <ConnectButton locale={"en_US"} 
                        client={client}
                        chain={chain}
                        wallets={[ inAppWallet ({
                        auth: {
                            options: [
                                "email",
                            ]
                            }
                        }) ]}
                        connectButton={{ label: "ล็อกอิน" }}
                        connectModal={{
                            title: "เชื่อมต่อกระเป๋า",
                            titleIcon: "https://dfi.fund/_next/static/media/DFastLogo_650x600.4f2ec315.svg",
                            size: "wide", // Change to "compact" or "auto" 
                        }}
                        supportedTokens={{
                        [chain.id]: [
                            {
                                address: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
                                name: "USDC",
                                symbol: "USDC",
                                icon: "https://polygonscan.com/token/images/centre-usdc_32.png",
                            },
                            {
                                address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
                                name: "USDT",
                                symbol: "USDT",
                                icon: "https://polygonscan.com/token/images/tether_32.png",
                                },
                        ],
                        }}
                        supportedNFTs={{
                        [chain.id]: [
                            "0x2a61627c3457cCEA35482cAdEC698C7360fFB9F2", // nft contract address
                            "0x60aD2f102FDb0e09ED50e2ab07573079C956aFB8",
                        ],
                        }}
                        theme={darkTheme({
                        colors: {
                            modalBg: "hsl(241, 51%, 23%)",
                            borderColor: "hsl(60, 99%, 56%)",
                            accentText: "hsl(0, 100%, 60%)",
                            separatorLine: "hsl(22, 100%, 37%)",
                            secondaryText: "hsl(251, 20%, 50%)",
                            primaryText: "hsl(240, 89%, 93%)",
                            accentButtonBg: "hsl(22, 100%, 37%)",
                            tertiaryBg: "hsl(231, 11%, 12%)",
                            accentButtonText: "hsl(0, 0%, 97%)",
                            connectedButtonBg: "hsl(241, 51%, 23%)",
                            connectedButtonBgHover: "hsl(241, 50%, 17%)",
                        },
                        })}
                    />
                </div>
                <div className="flex flex-col items-center justify-center p-2 m-2">
                    <p className="flex flex-col items-center justify-center text-[20px] m-2 text-center break-word">
                        <b>ขณะนี้ ท่านกำลังดำเนินการสมัครสมาชิก ภายใต้การแนะนำของ</b>
                    </p>
                    {referrerData ? (
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
                    <button onClick={navigateToConfirmPage} className="flex flex-col mt-1 border border-zinc-100 px-4 py-3 rounded-lg bg-red-700 hover:bg-zinc-800 transition-colors hover:border-zinc-400">
                        ดำเนินการต่อ
                    </button>
                </div>
            </div>
            <div className='px-1 w-full'>
                <Footer />
            </div>
        </main>
    );
}