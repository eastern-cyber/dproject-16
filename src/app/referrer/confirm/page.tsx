"use client";

import { client } from "@/app/client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { inAppWallet, walletConnect } from "thirdweb/wallets";
import WalletConnect from "@/components/WalletConnect";
import { ConnectButton, useActiveAccount } from "thirdweb/react";
import dprojectIcon from "@public/DProjectLogo_650x600.svg";
import { defineChain, getContract } from "thirdweb";
import { polygon } from "thirdweb/chains";
import Footer from "@/components/Footer";
import { prepareContractCall, toWei, sendTransaction, readContract } from "thirdweb";
import { PlanAConfirmModal } from "@/components/planAconfirmModal";

// Constants
const RECIPIENT_ADDRESS = "0x3BBf139420A8Ecc2D06c64049fE6E7aE09593944";
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
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [polBalance, setPolBalance] = useState<string>("0");
  const account = useActiveAccount();

  // Fetch wallet balance when account changes
  useEffect(() => {
    const fetchBalance = async () => {
      if (!account) {
        setPolBalance("0");
        return;
      }
      
      try {
        const balanceResult = await readContract({
          contract: getContract({
            client,
            chain: defineChain(polygon),
            address: "0x0000000000000000000000000000000000001010" // Native MATIC token address
          }),
          method: {
            type: "function",
            name: "balanceOf",
            inputs: [{ type: "address", name: "owner" }],
            outputs: [{ type: "uint256" }],
            stateMutability: "view"
          },
          params: [account.address]
        });

        // Convert balance from wei to POL (MATIC)
        const balanceInPOL = Number(balanceResult) / 10**18;
        setPolBalance(balanceInPOL.toFixed(4));
      } catch (err) {
        console.error("Error fetching balance:", err);
        setPolBalance("0");
      }
    };

    fetchBalance();
  }, [account]);

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
    return polAmount.toFixed(4); // Return as string with 4 decimal places
  };

  const handleConfirmTransaction = async () => {
  if (!account || !exchangeRate) return;
  
  setIsProcessing(true);
  try {
    const polAmount = calculatePolAmount();
    if (!polAmount) throw new Error("Unable to calculate POL amount");

    // Create a prepared transaction for simple value transfer
    const transaction = prepareContractCall({
      contract: getContract({
        client,
        chain: defineChain(polygon),
        address: "0x0000000000000000000000000000000000001010" // Native token address
      }),
      method: {
        type: "function",
        name: "transfer",
        inputs: [
          { type: "address", name: "to" },
          { type: "uint256", name: "value" }
        ],
        outputs: [{ type: "bool" }],
        stateMutability: "payable"
      },
      params: [RECIPIENT_ADDRESS, toWei(polAmount)],
      value: BigInt(toWei(polAmount))
    });

    // Send the transaction
    const { transactionHash } = await sendTransaction({
      transaction,
      account: account
    });

      setTxHash(transactionHash);

      // Create confirmation report
      const now = new Date();
      const bkkTime = new Date(now.getTime() + (7 * 60 * 60 * 1000)); // GMT+7
      const formattedDate = bkkTime.toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }).replace(/\//g, '/');

      const report = {
        senderAddress: account.address,
        dateTime: formattedDate,
        referrer: data?.var1 || "",
        transactionHash: transactionHash,
        amountPOL: polAmount,
        amountTHB: MEMBERSHIP_FEE_THB
      };

      // Download report as JSON
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'planAconfirmReport.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      alert("การชำระเงินเรียบร้อยแล้ว");
    } catch (err) {
      console.error("Transaction failed:", err);
      alert("การทำรายการล้มเหลว: " + (err as Error).message);
    } finally {
      setIsProcessing(false);
      setShowConfirmationModal(false);
    }
  };

  const PaymentButton = () => {
    return (
      <div className="flex flex-col gap-4 md:gap-8">
        <p className="mt-4 text-center text-[18px]">
          <b>ค่าสมาชิก: <p className="text-yellow-500 text-[22px]">{MEMBERSHIP_FEE_THB} THB
          {exchangeRate && (
            <>
                &nbsp; ( ≈ {calculatePolAmount()} POL )
            </>
          )}
          </p></b>
          {exchangeRate && (
            <>
              <span className="text-[17px]">
                อัตราแลกเปลี่ยน: {exchangeRate.toFixed(2)} THB/POL
              </span><br />
            </>
          )}
          {loading && !error && (
            <span className="text-sm text-gray-400">กำลังโหลดอัตราแลกเปลี่ยน...</span>
          )}
          {error && (
            <span className="text-sm text-red-500">{error}</span>
          )}
        </p>
        <div className="flex flex-col gap-2 md:gap-4">
          <button
            className={`flex flex-col mt-1 border border-zinc-100 px-4 py-3 rounded-lg transition-colors ${
              !account || !exchangeRate || isProcessing
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-red-700 hover:bg-red-800 hover:border-zinc-400"
            }`}
            onClick={() => setShowConfirmationModal(true)}
            disabled={!account || !exchangeRate || isProcessing}
          >
            <span className="text-[18px]">
              {!account ? "กรุณาเชื่อมต่อกระเป๋า" : "ดำเนินการต่อ"}
            </span>
          </button>
        </div>
        <p className="text-center text-[18px]">
          <p>
          เพื่อสนับสนุน <b>แอพพลิเคชั่น <span className="text-[26px] text-red-600">ก๊อกๆๆ</span></b> <br />
          ถือเป็นการยืนยันสถานภาพ
          </p>
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
          </div>
        )}
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
              <PaymentButton />
              
              {/* Confirmation Modal */}
              {showConfirmationModal && (
                <PlanAConfirmModal onClose={() => setShowConfirmationModal(false)}>
                  <div className="p-6 bg-gray-900 rounded-lg border border-gray-700 max-w-md">
                    <h3 className="text-xl font-bold mb-4 text-center">ยืนยันการชำระ</h3>
                    <div className="mb-6 text-center">
                      <p className="text-lg">
                        คุณกำลังจะชำระค่าสมาชิกจำนวน<br />
                        <span className="text-yellow-500 text-2xl font-bold">
                          {MEMBERSHIP_FEE_THB} THB (≈ {calculatePolAmount()} POL)
                        </span>
                      </p>
                      {account && (
                        <p className="mt-3 text-sm">
                          POL ในกระเป๋าของคุณ: <span className="text-green-400">{polBalance}</span>
                        </p>
                      )}
                      {account && parseFloat(polBalance) < parseFloat(calculatePolAmount() || "0") && (
                        <p className="mt-2 text-red-400 text-sm">
                          ⚠️ จำนวน POL ในกระเป๋าของคุณไม่เพียงพอ
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-3">
                      <button
                        className={`px-6 py-3 rounded-lg font-medium ${
                          !account || parseFloat(polBalance) < parseFloat(calculatePolAmount() || "0")
                            ? "bg-gray-600 cursor-not-allowed"
                            : "bg-red-600 hover:bg-red-700"
                        }`}
                        onClick={handleConfirmTransaction}
                        disabled={!account || isProcessing || parseFloat(polBalance) < parseFloat(calculatePolAmount() || "0")}
                      >
                        {isProcessing ? 'กำลังดำเนินการ...' : 'ยืนยัน'}
                      </button>
                      <button
                        className="px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg"
                        onClick={() => setShowConfirmationModal(false)}
                        disabled={isProcessing}
                      >
                        ยกเลิก
                      </button>
                    </div>
                  </div>
                </PlanAConfirmModal>
              )}
            </div>
            <div className="w-full text-center flex flex-col items-center justify-center p-3 m-2 border border-gray-800 rounded-lg break-all">
              <p className="mb-4 font-medium"><u>ข้อมูลเพื่อการตรวจสอบระบบ</u></p> 
              <p className="mb-3">เลขกระเป๋าผู้แนะนำ:<br /> {data.var1}</p>
              <p className="mb-3">อีเมล: {data.var2}</p>
              <p className="mb-3">ชื่อ: {data.var3}</p>
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