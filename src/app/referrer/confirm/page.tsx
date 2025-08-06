"use client";

import { chain } from "@/app/chain";
import { client } from "@/app/client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ConnectButton, TransactionButton, useActiveAccount, useReadContract } from "thirdweb/react";
import dprojectIcon from "@public/DProjectLogo_650x600.svg";
import { claimTo as claimERC1155, balanceOf as balanceOfERC1155 } from "thirdweb/extensions/erc1155";
import { defineChain, getContract } from "thirdweb";
import { polygon } from "thirdweb/chains";
import { contract } from "../../../../utils/contracts";
import Link from "next/link";
import { inAppWallet, createWallet } from "thirdweb/wallets";
import WalletConnect from "@/components/WalletConnect";
import Footer from "@/components/Footer";

// Constants
const NFT_CONTRACT_ADDRESS = "0xf96190438548F0A6D6C3116D8e57058AB76DC986";
const MEMBERSHIP_FEE_THB = 400;
const EXCHANGE_RATE_REFRESH_INTERVAL = 300000; // 5 minutes in ms

type UserData = {
  var1: string;
  var2: string;
  var3: string;
  var4: string;
};

const ConfirmPage = () => {
  const [data, setData] = useState<UserData | null>(null);
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const account = useActiveAccount();

  // Fetch THB to POL exchange rate (MATIC price in THB)
  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        const response = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=matic-network&vs_currencies=thb"
        );
        if (!response.ok) throw new Error("Failed to fetch exchange rate");
        
        const data = await response.json();
        setExchangeRate(data["matic-network"].thb);
        setError(null);
      } catch (err) {
        setError("ไม่สามารถโหลดอัตราแลกเปลี่ยนได้");
        console.error("Error fetching exchange rate:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchExchangeRate();
    const interval = setInterval(fetchExchangeRate, EXCHANGE_RATE_REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  // Retrieve stored data when page loads
  useEffect(() => {
    const storedData = sessionStorage.getItem("mintingsData");
    if (storedData) {
      try {
        setData(JSON.parse(storedData));
      } catch (err) {
        console.error("Error parsing stored data:", err);
      }
    }
  }, []);

  const calculatePolAmount = () => {
    if (!exchangeRate) return null;
    const polAmount = MEMBERSHIP_FEE_THB / exchangeRate;
    return polAmount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4
    });
  };

  const ClaimButtons = () => {
    const nftContract = getContract({
      client,
      chain: defineChain(polygon),
      address: NFT_CONTRACT_ADDRESS
    });

    return (
      <div className="flex flex-col gap-4 md:gap-8">
        <p className="mt-4 text-center text-[18px]">กดปุ่ม</p>
        <div className="flex flex-col gap-2 md:gap-4">
          <TransactionButton
            className="flex flex-col mt-1 border border-zinc-100 px-4 py-3 rounded-lg bg-red-700 hover:bg-red-800 hover:border-zinc-400 transition-colors"
            transaction={() => claimERC1155({
              contract: nftContract,
              to: account?.address || "",
              tokenId: BigInt(data?.var4 || "0"),
              quantity: 1n
            })}
            onTransactionConfirmed={() => {
              alert("การยืนยันเรียบร้อยแล้ว");
            }}
          >
            <span className="text-[18px]">ยืนยัน</span>
          </TransactionButton>
        </div>
        <p className="text-center text-[18px]">
          <b>ค่าสมาชิก: <span className="text-yellow-500 text-[22px]">{MEMBERSHIP_FEE_THB} THB</span></b><br />
          {exchangeRate && (
            <>
              <span className="text-[16px]">
                (≈ {calculatePolAmount()} POL @ {exchangeRate.toFixed(2)} THB/POL)
              </span><br />
            </>
          )}
          {loading && !error && (
            <span className="text-sm text-gray-400">กำลังโหลดอัตราแลกเปลี่ยน...</span>
          )}
          {error && (
            <span className="text-sm text-red-500">{error}</span>
          )}
          เพื่อสนับสนุน <b>แอพพลิเคชั่น <span className="text-[26px] text-red-600">ก๊อกๆๆ</span></b> <br />
          ถือเป็นการยืนยันสถานภาพ<br /> 
          <span className="text-yellow-500 text-[22px]">
            <b>&quot;สมาชิกพรีเมี่ยม&quot;</b>
          </span><br />
          ภายใต้การแนะนำของ<br />
        </p>
        {data && (
          <div className="text-center text-[18px] bg-gray-900 p-4 border border-zinc-300 rounded-lg">
            <p className="text-lg text-gray-300">
              <b>เลขกระเป๋าผู้แนะนำ:</b> {data.var1.slice(0, 6)}...{data.var1.slice(-4)}
            </p>
            <p className="text-lg text-gray-300 mt-2">
              <b>อีเมล:</b> {data.var2}
            </p>
            <p className="text-lg text-gray-300 mt-2">
              <b>ชื่อ:</b> {data.var3}
            </p>
            <p className="text-lg text-red-500 mt-2">
              <b>Token ID: {data.var4}</b>
            </p>
          </div>
        )}
      </div>
    );
  };

  const WalletBalances = () => {
    const { data: nftBalance } = useReadContract(
      balanceOfERC1155,
      {
        contract: getContract({
          client,
          chain: defineChain(polygon),
          address: NFT_CONTRACT_ADDRESS
        }),
        owner: account?.address || "",
        tokenId: BigInt(data?.var4 || "0")
      }
    );

    if (!nftBalance || nftBalance <= 0) return null;

    return (
      <div className="flex flex-col items-center mt-6">
        <Link
          className="flex flex-col mt-8 border border-zinc-500 px-4 py-3 rounded-lg hover:bg-red-800 transition-colors hover:border-zinc-800 text-center"
          href="/premium-area/"
        >
          เข้าพื้นที่สมาชิกพรีเมี่ยม
        </Link>
      </div>
    );
  };

  return (
    <main className="p-4 pb-10 min-h-[100vh] flex flex-col items-center bg-gray-950">
      <div className="flex flex-col items-center justify-center p-6 md:p-10 m-2 md:m-5 border border-gray-800 rounded-lg max-w-md w-full">
        <Image
          src={dprojectIcon}
          alt="DProject Logo"
          className="mb-4 size-[80px] md:size-[100px]"
          style={{
            filter: "drop-shadow(0px 0px 24px #a726a9a8"
          }}
          priority
        />
        <h1 className="p-4 text-2xl font-semibold md:font-bold tracking-tighter text-center">
          ยืนยันการเป็นสมาชิก
        </h1>
        
        <WalletConnect />
        
        {data ? (
          <>
            <div className="flex flex-col items-center justify-center w-full p-2 m-2">
              <ClaimButtons />
              <WalletBalances />
            </div>
            <div className="w-full text-center flex flex-col items-center justify-center p-3 m-2 border border-gray-800 rounded-lg break-all">
              <p className="mb-4 font-medium"><u>ข้อมูลเพื่อการตรวจสอบระบบ</u></p> 
              <p className="mb-3">เลขกระเป๋าผู้แนะนำ:<br /> {data.var1}</p>
              <p className="mb-3">อีเมล: {data.var2}</p>
              <p className="mb-3">ชื่อ: {data.var3}</p>
              <p>TokenId: {data.var4}</p>
            </div>
          </>
        ) : (
          <p className="text-red-400 py-4">ไม่พบข้อมูลผู้แนะนำ</p>
        )}
      </div>
      <div className='w-full mt-8'>
        <Footer />
      </div>
    </main>
  );
};

export default ConfirmPage;