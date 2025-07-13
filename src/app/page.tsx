"use client";

import Image from "next/image";
import { ConnectButton, MediaRenderer, useActiveAccount, useReadContract,darkTheme } from "thirdweb/react";
// import thirdwebIcon from "@public/thirdweb.svg";
import dprojectIcon from "@public/DProjectLogo_650x600.svg";
import { chain } from "./chain";
import { client } from "./client";
import { getContractMetadata } from "thirdweb/extensions/common";
import { contract } from "../../utils/contracts";
import Link from "next/link";
import WalletConnect from "@/components/WalletConnect";
import {
  inAppWallet,
  createWallet,
} from "thirdweb/wallets";
import Footer from "@/components/Footer";


export default function Home() {
  const account = useActiveAccount ();

  const { data: contractMetadata } = useReadContract(
    getContractMetadata,
    {
      contract: contract,
    }
  );

  if(!account)
  {
    return (
      <main className="p-4 pb-10 min-h-[100vh] flex items-center justify-center container max-w-screen-lg mx-auto">
        <div className="py-20">
          <Header />
          <ThirdwebResources />
          <Footer />
        </div>
      </main>
    );
  }

  return (
    <div style={{
      display: "flex",
      margin: "30px",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100%",
    }}>
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        border: "1px solid #333",
        borderRadius: "8px",
      }}>
        <Image
          src={dprojectIcon}
          alt=""
          className="size-[150px] md:size-[150px] mb-6"
          style={{
            filter: "drop-shadow(0px 0px 24px #a726a9a8)",
          }}
        />
        <WalletConnect />
        {contractMetadata && (
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            marginTop: "5px",
          }}>
            <div style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center", 
              justifyContent: "center",
              marginTop: "5px",
            }}>
            <p style={{ 
              fontSize: "20px",
              fontWeight: "bold",
          }}>
          ยืนดีต้อนรับสู่ DProject
          </p>
            <p style={{
              fontSize: "16px",
              marginTop: "20px",
            }}>
              <a 
                href="/member-area"
                className="flex flex-col border bg-zinc-800 border-zinc-500 mt-3 px-4 py-3 rounded-lg hover:bg-red-600 transition-colors hover:border-zinc-300"
              >
                <p className="text-[18px] break-words tex-center">เข้าสู่พื้นที่สมาชิก</p>
              </a>
            </p>
            </div>
          </div>
        )}
      </div>
      <div style={{margin:"30px"}}>
        <ThirdwebResources />
      </div>
      <div className='px-1 w-full'>
        <Footer />
      </div>
    </div>
  )
}
function Header() {
  return (
    <header className="flex flex-col items-center md:mb-5">
          <Link href="/" passHref>
        <Image
          src={dprojectIcon}
          alt="DProject"
          className="size-[150px] md:size-[150px]"
          style={{
            filter: "drop-shadow(0px 0px 24px #a726a9a8)",
          }}
        />
      </Link>
      <p>&nbsp;&nbsp;</p>
      <h2 className="text-2xl md:text-6xl font-semibold md:font-bold tracking-tighter mb-6 text-zinc-100">
        <span className="inline-block text-blue-500"> DProject </span>
        &nbsp;&nbsp;&nbsp;
        <span className="inline-block -skew-x-6 text-white"> Login </span>
        &nbsp;
        <span className="text-zinc-300 inline-block mx-1"> + </span>
        &nbsp;
        <span className="inline-block -skew-x-6 text-white"> Register </span>
      </h2>

      <p className="text-center text-zinc-300 text-base m-8 break-word">
        ล็อกอินด้วยอีเมลล์{" "}
        <code className="bg-zinc-800 text-zinc-300 px-2 rounded py-1 text-sm mx-1">
          OTP
        </code>{" "}
        e-mail Login
      </p>
          <WalletConnect />
      </header>
  );
}

function ThirdwebResources() {
  return (
    <div className="grid gap-4 lg:grid-cols-3 justify-center">
      <ArticleCard
        title="เกี่ยวกับโครงการ DProject"
        href="/about"
        description="More detail about DProject"
      />

      <ArticleCard
        title="ต้นแบบ Application ก๊อกๆๆ"
        href="https://3k.aseanquality.com/"
        description="3K หรือ Kok Kok Kok จะต่อยอดจาก SocialApp ยอดนิยม"
      />

      <ArticleCard
        title="DProject Timeline"
        href="/timeline"
        description="แสดงรายละเอียดไทม์ไลน์และความคืบหน้าของโครงการ"
      />

      {/* <ArticleCard
        title="รายการทรัพย์สิน"
        href="/assets"
        description="แสดงรายการทรัพย์สินที่ท่านถือครอง"
      />

      <ArticleCard
        title="ต้นแบบ Application ก๊อกๆๆ"
        href="https://3k.aseanquality.com/"
        description="3K หรือ Kok Kok Kok จะต่อยอดจาก SocialApp ยอดนิยม"
      />

      <ArticleCard
        title="DProject Timeline"
        href="/timeline"
        description="แสดงรายละเอียดไทม์ไลน์และความคืบหน้าของโครงการ"
      /> */}
    </div>
  );
}

function ArticleCard(props: {
  title: string;
  href: string;
  description: string;
}) {
  return (
    <a
      href={props.href + "?utm_source=next-template"}
      // target="_blank"
      className="flex flex-col border border-zinc-800 p-4 rounded-lg hover:bg-zinc-900 transition-colors hover:border-zinc-700"
    >
      <article>
        <h2 className="text-lg font-semibold mb-2">{props.title}</h2>
        <p className="text-sm text-zinc-400">{props.description}</p>
      </article>
    </a>
  );
}
