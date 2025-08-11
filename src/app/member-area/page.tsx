"use client";

import Image from "next/image";
import {  ConnectButton, darkTheme, MediaRenderer, TransactionButton, useActiveAccount, useReadContract } from "thirdweb/react";
import dprojectIcon from "/public/DProjectLogo_650x600.svg";
import { client } from "../client";
import { chain  } from "../chain";
import { getContract, toEther } from "thirdweb";
import { defineChain, polygon } from "thirdweb/chains";
import { claimTo as claimERC1155, balanceOf as balanceOfERC1155 } from "thirdweb/extensions/erc1155";
import { claimTo as claimERC20, balanceOf as balanceOfERC20 } from "thirdweb/extensions/erc20";
import { contract } from "../../../utils/contracts";
import { getContractMetadata } from "thirdweb/extensions/common";
import Link from "next/link";
import WalletConnect from "../../components/WalletConnect";
import Footer from "@/components/Footer";

export default function Refferrer() {
    const account = useActiveAccount();

    const { data: nftMetadata } = useReadContract(
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
                margin: "10px",
                border: "1px solid #333",
                borderRadius: "8px",
              }}>
                {nftMetadata && (

                    <div>
                    <MediaRenderer
                      client={client}
                      src={nftMetadata.image}
                      style={{
                        borderRadius: "8px",
                      }}
                    />
                    </div>
                )}
        </div>
        );
      }

    return (
        <main className="flex p-4 pb-10 min-h-[100vh] flex flex-col items-center">
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
                <Header />
                <div className="flex justify-center mb-10">
                <WalletConnect />
                </div>
                <NFTMetadata />
                {/* <div className="flex flex-col items-center mb-6">
                    <ClaimButtons walletAddress={account?.address || ""}/>
                </div> */}
                <div className="flex flex-col justify-center items-center">
                    <WalletBalances walletAddress={account?.address || ""}/>
                </div>
            </div>
            <div className='px-1 w-full'>
                <Footer />
            </div>
            <div className="flex flex-col mt-2 items-center">
                    <Link 
                        className="flex flex-col mt-4 border border-zinc-500 px-4 py-3 rounded-lg hover:bg-zinc-800 transition-colors hover:border-zinc-800"
                        href="/">
                        กลับหน้าหลัก
                    </Link>
            </div>
        </main>
    )
    
}

function  Header() {
    return (
        <header className="flex flex-col mx-2 items-center mb-12 mb:mb-20">
            <Link href="/" passHref>
                <Image
                    src={dprojectIcon}
                    alt=""
                    className="mb-4 size-[100px] md:size-[100px]"
                    style={{
                        filter: "drop-shadow(0px 0px 24px #a726a9a8"
                    }}
                />
            </Link>

            <h1 className="text-1xl md:text-4xl font-semibold md:font-bold tracking-tighter">
               Member Area
            </h1>
        </header>
    );
}

type walletAddresssProps = {
    walletAddress?: string;
};

const ClaimButtons: React.FC<walletAddresssProps> = ({ walletAddress }) => {
    const nftContract = getContract({
        client: client,
        chain: defineChain(polygon),
        address: "0x2a61627c3457cCEA35482cAdEC698C7360fFB9F2"
    });
    const dfastContract = getContract({
        client: client,
        chain: defineChain(polygon),
        address: "0xca23b56486035e14F344d6eb591DC27274AF3F47"
    })

    return (
        <div className="flex flex-col gap-4 md:gap-8">
            <TransactionButton
                // className="border bg-zinc-800 border-zinc-500 px-4 py-3 rounded-lg hover:bg-zinc-100 transition-colors hover:border-zinc-300"
                transaction={() => claimERC1155({
                    contract: nftContract,
                    to: walletAddress || "",
                    tokenId: 0n,
                    quantity: 1n
                })}
                onTransactionConfirmed={async () => {
                    alert("ทำรายการซื้อ คูปอง 3K NFT เรียบร้อย ");
                }}
            >ซื้อคูปอง 3K NFT</TransactionButton>
        </div>
    )
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
            tokenId: 0n
        }
    );
    const { data: ktdfiBalance } = useReadContract(
        balanceOfERC20,
        {
            contract: getContract({
                client: client,
                chain: defineChain(polygon),
                address: "0x532313164FDCA3ACd2C2900455B208145f269f0e"
            }),
            address: walletAddress || ""
        }
    );
    const { data: polBalance } = useReadContract(
        balanceOfERC20,
        {
            contract: getContract({
                client: client,
                chain: defineChain(polygon),
                address: "0x0000000000000000000000000000000000001010"
            }),
            address: walletAddress || ""
        }
    );
    const { data: usdcBalance } = useReadContract(
        balanceOfERC20,
        {
            contract: getContract({
                client: client,
                chain: defineChain(polygon),
                address: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359"
            }),
            address: walletAddress || ""
        }
    );
    const { data: usdtBalance } = useReadContract(
        balanceOfERC20,
        {
            contract: getContract({
                client: client,
                chain: defineChain(polygon),
                address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F"
            }),
            address: walletAddress || ""
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
              }}
            >
                <p style={{fontSize: "24px"}}><b>รายการทรัพย์สิน</b></p>
                <p style={{fontSize: "19px"}}><b>เลขที่กระเป๋า</b></p>
                <div style={{border: "1px solid #aaa", background: "#2b2b59", padding: "0px 6px", margin: "6px"}}>
                <p className="text-[18px] break-all">{walletAddress ? walletAddress || "" : "ยังไม่ได้เชื่อมกระเป๋า !"} </p>    
                </div>
            </div>
            
            <div className="mt-8 flex flex-col justify-items-left">
                <div className="flex mt-3 gap-2 md:gap-2">
                    <img className="h-6 w-6 rounded-full mr-1" src="https://polygonscan.com/token/images/polygonmatic_new_32.png" />
                    เหรียญ POL: {walletAddress? 
                    new Intl.NumberFormat("en-US",{minimumFractionDigits: 2,maximumFractionDigits: 6,})
                    .format(Number(toEther(polBalance || 0n))): "0"}
                    {/* {walletAddress ? (Number(toEther(polBalance || 0n))).toFixed(2) : "0"} */}
                </div>
                <div className="flex mt-3 gap-2 md:gap-2">
                    <img className="h-6 w-6 rounded-full mr-1" src="https://ipfs.io/ipfs/QmSLo5e3PSBWgF3wysabPzsBjoRLngrFoVNrGwgL3vm2Zn/KTDFI_600x600.png" />
                    เหรียญ KTDFI: {walletAddress ? (Number(ktdfiBalance) / 1e18).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}
                </div>

                <div className="flex mt-3 gap-2 md:gap-2">
                    <img className="h-6 w-6 rounded-full mr-1" src="https://polygonscan.com/token/images/centre-usdc_32.png" />
                    เหรียญ USDC: {walletAddress ? (Number(usdcBalance) / 1_000_000).toFixed(2) : "0"}
                </div>                
                <div className="flex mt-3 gap-2 md:gap-2">
                    <img className="h-6 w-6 rounded-full mr-1" src="https://polygonscan.com/token/images/tether_32.png" />
                    เหรียญ USDT: {walletAddress ? (Number(usdtBalance) / 1_000_000).toFixed(2) : "0"}
                </div>
                
                <div className="mt-6 flex justify-items-center gap-1 md:gap-4">
                        <Link target="_blank" href="https://opensea.io/account/collected">
                            {/* <NFTMetadata /> */}
                            <img className="flex h-8 w-8 mr-1" src="/KokKokKok_Logo_WhiteBG_686x686.png" alt="" />
                        </Link>
                        <Link target="_blank" href="https://opensea.io/account/collected">
                            <p style={{alignItems: "center", justifyContent: "center", fontSize: "18px"}}>
                                NFT ทั้งหมดที่ท่านถือครอง
                            </p >
                        </Link>
                </div>   
            </div>
            <div className="flex flex-col w-full items-center justify-center mt-6">
                <div className="flex flex-col items-center w-full justify-center pt-[15px] pb-[5px]">
                    <span className="text-center text-[21px]">ลิ้งค์แนะนำของท่าน</span>
                    <div style={{border: "1px solid#dfea08", background: "#2b2b59", padding: "4px 8px", margin: "6px"}}>
                        <p className="text-[18px] break-all">{walletAddress ? `https://dfi.fund/referrer/${walletAddress}` : "ยังไม่ได้เชื่อมกระเป๋า !"} </p>    
                    </div>
                    <span className="text-center mt-2 mb-10 text-[19px] break-words">เพื่อส่งให้ผู้มุ่งหวัง ที่ท่านต้องการแนะนำ</span>
                    <div>
                        {/* <p className="text-[16px] break-all">{walletAddress ? walletAddress || "" : "ยังไม่ได้เชื่อมกระเป๋า !"} </p> */}
                    </div>
                    <div className="flex flex-col justify-center items-center w-[300px]">
                        <Link 
                            className=" mb-8 border border-zinc-500 px-4 py-3 rounded-lg hover:bg-red-600 hover:text-yellow-200 hover:border-yellow-300"
                            href="/member-area/check-user">
                            <p className="text-center text-[19px]">ตรวจสอบรายละเอียดสมาชิก</p>
                        </Link>
                        <Link 
                            className="mb-8 border border-zinc-500 px-4 py-3 rounded-lg hover:bg-red-600 hover:text-yellow-200 hover:border-yellow-300" 
                            href="/member-area/check-payout">
                            <p className="text-center text-[19px]">ตรวจสอบส่วนแบ่งรายได้</p>
                        </Link>
                        <Link 
                            className="border border-zinc-500 px-4 py-3 rounded-lg hover:bg-red-600 hover:text-yellow-200 hover:border-yellow-300"
                            href="/premium-area">
                            <p className="text-center text-[19px]">เข้าสู่พื้นที่สมาชิกพรีเมี่ยม</p>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
};