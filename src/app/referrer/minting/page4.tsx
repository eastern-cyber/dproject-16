"use client";

import { chain } from "@/app/chain";
import { client } from "@/app/client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ConnectButton, MediaRenderer, TransactionButton, useActiveAccount, useReadContract } from "thirdweb/react";
import { inAppWallet } from "thirdweb/wallets";
import dprojectIcon from "@public/DFastLogo_650x600.svg";
import { claimTo as claimERC1155, balanceOf as balanceOfERC1155 } from "thirdweb/extensions/erc1155";
import { defineChain, getContract } from "thirdweb";
import { polygon } from "thirdweb/chains";
import { getContractMetadata } from "thirdweb/extensions/common";
import { contract } from "../../../../utils/contracts";
import Link from "next/link";

const MintingPage = () => {
  const [data, setData] = useState<{ var1: string; var2: string; var3: string; var4: string } | null>(null);

  useEffect(() => {
    // Retrieve stored data when page loads
    const storedData = sessionStorage.getItem("mintingsData");
    if (storedData) {
      setData(JSON.parse(storedData));
    }
  }, []);

  const account = useActiveAccount();

  type walletAddresssProps = {
    walletAddress?: string;
  };

  const WalletBalances: React.FC<walletAddresssProps> = ({ walletAddress }) => {
    const { data: nftBalance } = useReadContract(
      balanceOfERC1155,
      {
        contract: getContract({
          client: client,
          chain: defineChain(polygon),
          address: "0x2a61627c3457cCEA35482cAdEC698C7360fFB9F2"
        }),
        owner: walletAddress || "",
        tokenId: BigInt(data?.var4 || "0")
      }
    );

    return nftBalance;
  };

  const ClaimButtons: React.FC<walletAddresssProps> = ({ walletAddress }) => {
    const nftBalance = WalletBalances({ walletAddress });
    const nftContract = getContract({
      client: client,
      chain: defineChain(polygon),
      address: "0x2a61627c3457cCEA35482cAdEC698C7360fFB9F2"
    });

    return (
      <div className="flex flex-col gap-4 md:gap-8">
        <p className="mt-4 text-center">กดปุ่ม</p>
        <div className="flex flex-col gap-2 md:gap-4">
          {nftBalance === 0 && (
            <TransactionButton
              className="flex flex-col mt-1 border border-zinc-100 px-4 py-3 rounded-lg bg-red-700 hover:bg-red-800 hover:border-zinc-400"
              transaction={() => claimERC1155({
                contract: nftContract,
                to: walletAddress || "",
                tokenId: BigInt(data?.var4 || "0"),
                quantity: 1n
              })}
              onTransactionConfirmed={async () => {
                alert("การยืนยันเรียบร้อย ");
              }}
            >
              ยืนยัน
            </TransactionButton>
          )}
        </div>
        <p className="text-center">การเป็นสมาชิกพรีเมี่ยม <br /> เพื่อสนับสนุนแอพพลิเคชั่น ก๊อกๆๆ</p>
      </div>
    );
  };

  return (
    <main className="p-4 pb-10 min-h-[100vh] flex flex-col items-center">
      <div className="flex flex-col items-center justify-center p-10 m-5 border border-gray-800 rounded-lg">
        <Image
          src={dprojectIcon}
          alt=""
          className="mb-4 size-[100px] md:size-[100px]"
          style={{
            filter: "drop-shadow(0px 0px 24px #a726a9a8"
          }}
        />
        <h1 className="p-4 md:text-2xl text-2xl font-semibold md:font-bold tracking-tighter">Mint 3K NFT</h1>
        <div className="flex justify-center m-2">
          <ConnectButton locale={"en_US"}
            client={client}
            chain={chain}
            wallets={[inAppWallet({ auth: { options: ["email"] } })]}
            connectButton={{ label: "ล็อกอิน" }}
            connectModal={{
              title: "เชื่อมต่อกระเป๋า",
              titleIcon: "https://dfi.fund/_next/static/media/DFastLogo_650x600.4f2ec315.svg",
              size: "wide",
            }}
          />
        </div>

        <div>
          {data ? (
            <>
              <div className="flex flex-col items-center mb-6">
                <ClaimButtons walletAddress={account?.address || ""} />
              </div>
            </>
          ) : (
            <p>ไม่พบข้อมูลผู้แนะนำ</p>
          )}
        </div>
      </div>
    </main>
  );
};

export default MintingPage;