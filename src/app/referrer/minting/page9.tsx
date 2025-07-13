"use client";

import { chain } from "@/app/chain";
import { client } from "@/app/client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ConnectButton, MediaRenderer, TransactionButton, useActiveAccount, useReadContract, darkTheme } from "thirdweb/react";
import dprojectIcon from "@public/DProjectLogo_650x600.svg";
import { claimTo as claimERC1155, balanceOf as balanceOfERC1155 } from "thirdweb/extensions/erc1155";
// import { claimTo as claimERC721, balanceOf as balanceOfERC721 } from "thirdweb/extensions/erc721";
import { defineChain, getContract } from "thirdweb";
import { polygon } from "thirdweb/chains";
import { getContractMetadata } from "thirdweb/extensions/common";
import { contract } from "../../../../utils/contracts";
import Link from "next/link";
import {
    inAppWallet,
    createWallet,
  } from "thirdweb/wallets";
import WalletConnect from "@/components/WalletConnect";

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

    const ClaimButtons: React.FC<walletAddresssProps> = ({ walletAddress }) => {
        const nftContract = getContract({
            client: client,
            chain: defineChain(polygon),
            address: "0xE92A5360363103eAf73e8E8c0Ad68d93eeA672a1"
        })
    
        return (
            <div className="flex flex-col gap-4 md:gap-8">
                <p className="mt-4 text-center text-[18px]">
                    กดปุ่ม
                </p>
                <div className="flex flex-col gap-2 md:gap-4">
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
                            // disabled={!!data?.var4} // Disable button if data.var4 exists
                    >
                        <span className="text-[18px]">ยืนยัน</span>
                    </TransactionButton>
                </div>
                <p className="text-center text-[18px]">
                <b>ชำระ&nbsp;<span className="text-yellow-500 text-[22px]">40 POL</span></b><br />
                    เพื่อสนับสนุน <b>แอพพลิเคชั่น <span className="text-[26px] text-red-600">ก๊อกๆๆ</span></b> <br />
                    ถือเป็นการยืนยันสถานภาพ<br /> 
                    <span className="text-yellow-500 text-[22px]"><b>&quot;สมาชิกพรีเมี่ยม&quot;</b></span><br /> {/*  Quote Symbol &quot; &ldquo; &rdquo; &#34; */}
                    ภายใต้สายงานของ<br />
                </p>
                <div className="text-center text-[18px] bg-gray-900 p-4 border border-1 border-zinc-300">
                {data ? (
                    <div>
                        <p className="text-lg text-gray-300">
                            <b>เลขกระเป๋าผู้แนะนำ:</b> {data.var1.slice(0, 6)}...{data.var1.slice(-4)}
                        </p>
                        <p className="text-lg text-gray-300 mt-1">
                            <b>อีเมล:</b> {data.var2}
                        </p>
                        <p className="text-lg text-gray-300 mt-1">
                            <b>ชื่อ:</b> {data.var3}
                        </p>
                        <p className="text-lg text-red-600 mt-1">
                            <b>Token ID: {data.var4} </b>
                        </p>
                    </div>
                
                ):(<p>ไม่พบข้อมูลผู้แนะนำ</p>)}
                </div>
            </div>
        )
    };

    const WalletBalances: React.FC<walletAddresssProps> = ({ walletAddress }) => {
    
        const account = useActiveAccount();
    
        const { data: contractMetadata } = useReadContract(
            getContractMetadata,
            {
              contract: contract,
            }
          );
    
          function NFTMetadata() {
            return(
                <div style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "20px",
                    margin: "20px",
                    border: "1px solid #333",
                    borderRadius: "8px",
                  }}>
                    {contractMetadata && (
    
                        <div>
                        <MediaRenderer
                          client={client}
                          src={contractMetadata.image}
                          style={{
                            borderRadius: "8px",
                          }}
                        />
                        </div>
                    )}
            </div>
            );
          }
    
        const { data: nftBalance } = useReadContract(
            balanceOfERC1155,
            {
                contract: getContract({
                    client: client,
                    chain: defineChain(polygon),
                    address: "0xE92A5360363103eAf73e8E8c0Ad68d93eeA672a1"
                }),
                owner: walletAddress || "",
                tokenId: BigInt(data?.var4 || "0")
            }
        );
    
        return (
            <div style={{
                display: "flex",
                flexDirection: "column",
                width: "100%",
                alignItems: "center",
                justifyContent: "center",
                padding: "20px",
                // border: "1px solid #333",
                // borderRadius: "8px",
              }}>
                <div 
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    width: "100%",
                    fontSize: "24px",
                    justifyContent: "center",
                    paddingBottom: "20px",
                    // border: "1px solid #333",
                    // borderRadius: "8px",
                  }}
                >
                    {/* <p style={{fontSize: "24px"}}><b>รายการทรัพย์สิน</b></p> */}
                    {/* <p style={{fontSize: "19px"}}><b>เลขที่กระเป๋าของท่าน</b></p> */}
                    {/* <div style={{border: "1px solid #444", background: "#222", padding: "0px 6px", margin: "6px"}}> */}
                    {/* <p style={{fontSize: "18px"}}>{walletAddress ? walletAddress || "" : "ยังไม่ได้เชื่อมกระเป๋า !"} </p>     */}
                    {/* </div> */}
                </div>
                <div className="flex flex-col gap-2 md:gap-4]">
                    <a target="_blank" href={`https://opensea.io/assets/matic/0xE92A5360363103eAf73e8E8c0Ad68d93eeA672a1/${data?.var4 || "0"}`}>
                    <Image src="/3K_WhiteBG_40POL_PlanA.png" width="150" height={150} alt="" />
                    </a>
                </div>
                <div className="mt-6 flex flex-col justify-center items-center gap-1 md:gap-4 text-[18px]">
                <p>คูปอง NFT ของท่าน</p>
                <p>ที่ซื้อภายใต้การแนะนำของ<br /></p>
                <p>
                    {data ? (
                    <p className="text-[20px] my-3 text-yellow-500">
                        <b>{data.var3}</b>
                    </p>
                    ):(
                        <></>
                    )}
                </p>
                <p>มีจำนวน <span className="text-[24px] my-3 text-yellow-500"><b>{walletAddress ? nftBalance?.toString() : "0"}</b></span> รายการ</p>
                </div>
                {nftBalance && nftBalance > 0 && (
                    <div className="flex flex-col items-center mt-6">
                        <Link
                            className="flex flex-col mt-8 border border-zinc-500 px-4 py-3 rounded-lg hover:bg-red-800 transition-colors hover:border-zinc-800"
                            href="/premium-area/">
                            เข้าพื้นที่สมาชิกพรีเมี่ยม
                        </Link>
                    </div>
                )}
            </div>
        )
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
                <h1 className="p-4 md:text-2xl text-2xl font-semibold md:font-bold tracking-tighter">
                    Mint 3K NFT
                </h1>
                <WalletConnect />                
                <div>
                    {data ? (
                        <>
                        <div className="flex flex-col items-center justify-center p-2 m-2">
                            {/* <p className="flex flex-col items-center justify-center text-[20px] m-3">
                                <b>เลขที่กระเป๋าของผู้แนะนำ</b>
                            </p> */}
                                {/* <div style={{
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center", // Centers vertically
                                    border: "1px solid #666",
                                    background: "#222",
                                    padding: "0px 6px",
                                    margin: "10px",
                                    height: "40px" // Optional: Ensure enough height for centering
                                }}> */}
                                    {/* <p style={{fontSize: "18px"}}>{params.referrerId}</p> */}
                                    {/* <p style={{ fontSize: "18px" }}>
                                        {data.var1 ? `${data.var1.slice(0, 6)}...${data.var1.slice(-4)}` : ""}
                                    </p> */}
                                {/* </div> */}
                                <div className="flex flex-col items-center mb-6">
                                    <ClaimButtons walletAddress={account?.address || ""}/>
                                </div>
                                <div className="flex flex-col items-center mb-6">
                                    <WalletBalances walletAddress={account?.address || ""}/>
                                </div>
                        </div>
                            <div className="flex text-center flex-col items-center justify-center p-3 m-2 border border-gray-800 break-all">
                            <p className="mb-4"><u>ขอมูลเพื่อการตรวจสอบระบบ</u></p> 
                            <p className="mb-4">เลขกระเป๋าผู้แนะนำ:<br /> {data.var1}</p>
                            <p className="mb-4">อีเมล: {data.var2}</p>
                            <p className="mb-4">ชื่อ: {data.var3}</p>
                            <p>TokenId: {data.var4}</p>
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