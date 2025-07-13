"use client";

import { AccountProvider, AccountAddress, AccountBalance, ConnectButton, useActiveAccount, AccountAvatar, AccountName, useReadContract, MediaRenderer, TokenProvider, TokenIcon } from "thirdweb/react";
import { useAddress, useContract, useTokenBalance } from "@thirdweb-dev/react";
import { client } from "../client";
import { chain } from "../chain";
import { inAppWallet } from "thirdweb/wallets";
import { getContractMetadata } from "thirdweb/extensions/common";
import { contract } from "../../../utils/contracts";
// import { polygon } from "thirdweb/chains";
// import { inAppWallet } from "thirdweb/wallets";
import { getContract, toEther } from "thirdweb";
import { defineChain, polygon } from "thirdweb/chains";
import { claimTo as claimERC1155, balanceOf as balanceOfERC1155 } from "thirdweb/extensions/erc1155";
import { claimTo as claimERC20, balanceOf as balanceOfERC20 } from "thirdweb/extensions/erc20";



  const DFAST_POLYGON =
    "0xca23b56486035e14F344d6eb591DC27274AF3F47";
  const POL_POLYGON =
    "0x0000000000000000000000000000000000001010";
  const USDC_POLYGON =
    "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359";
  const USDT_POLYGON =
    "0xc2132D05D31c914a87C6611C10748AEb04B58e8F";
  

  export default function Assets() {

    const account = useActiveAccount();

    const { data: contractMetadata } = useReadContract(
        getContractMetadata,
        {
          contract: contract,
        }
      );

    // const {contract} = useContract("0xca23b56486035e14F344d6eb591DC27274AF3F47");

    // const {data: balance }= useTokenBalance(contract, address);

    // const address = useAddress ();

    function Chain() {
      return (
        <div></div>
        // <ChainProvider chain={chain}>
        //   <ChainIcon
        //     client={client}
        //     className="h-auto w-6 rounded-full p-1"
        //     loadingComponent={<span>Loading...</span>}
        //   />
        // </ChainProvider>
      );
    }
  
    function Token() {
      return (
        <TokenProvider
          address={"0xca23b56486035e14F344d6eb591DC27274AF3F47"}
          client={client}
          chain={polygon}
        >
          <TokenIcon className="h-6 w-6 rounded-full mr-1" />
        </TokenProvider>
      );
    }

    return (
        <div 
            className="flex items-center justify-center"
            style={{ flexDirection: "column"}}
        >
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
                      <div style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "20px",
                        marginTop: "20px",
                      }}>
                        <div>
                        <MediaRenderer
                          client={client}
                          src={contractMetadata.image}
                          style={{
                            borderRadius: "8px",
                          }}
                        />
                        </div>
                        <div style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center", 
                          justifyContent: "center",
                          marginTop: "20px",
                        }}>
                          <p style={{ 
                              fontSize: "20px",
                              fontWeight: "bold",
                          }}>
                            รายการทรัพย์สิน
                          </p>
                        </div>
                <div  className="flex justify-items-center mt-4">
                  <AccountProvider
                      address="0xDdF99A33c49884792a89bD8DE9474138e4E0350a"
                      client={client}
                  >
                      บัญชีผู้ใช้งาน : <Chain /> <AccountAddress />
                  </AccountProvider>
                </div>
                <div style={{width: "100%", justifyContent: "center"}} className="flex justify-items-center mt-4">
                  <WalletBalances />
                </div>
                <div className="flex justify-items-center mt-4">
                <AccountProvider
                    address="0xDdF99A33c49884792a89bD8DE9474138e4E0350a"
                    client={client}
                >
                    <Token />
                    <AccountBalance
                        chain={chain}
                        tokenAddress={DFAST_POLYGON}
                        loadingComponent={<span>Loading...</span>}
                        // formatFn={(props: AccountBalanceInfo) =>
                        //   `${props.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${props.symbol}`
                        // }
                    />
                </AccountProvider>
                </div>
                      </div>
                    )}
            </div>

            <div
                style={{
                    marginTop: "20px",
                    display: "flex",
                    margin: "30px",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "20px",
                    width: "80%",
                    border: "1px solid #333",
                    borderRadius: "8px",
            }}>
                <div className="flex justify-center mb-10 mt-10">
                          <ConnectButton locale={"en_US"}
                              client={client}
                              accountAbstraction={{
                                chain: chain,
                                sponsorGas: true,
                              }}
                              wallets={[ inAppWallet ({
                                auth: {
                                  options: [
                                    "email",
                                    // "phone",
                                  ]
                                }
                              }
                              ) ]}
                            />
                          </div>
                {/* <div
                    style={{
                        margin: "30px",
                }}>
                    <ConnectButton locale={"en_US"}
                        client={client}
                        chain={chain}
                    />
                </div> */}
                <div>
                <AccountProvider
                    address="0xDdF99A33c49884792a89bD8DE9474138e4E0350a"
                    client={client}
                >
                    <AccountAvatar />
                    <AccountName />
                </AccountProvider>
                </div>
                <div className="flex justify-items-center mt-4">
                <AccountProvider
                    address="0xDdF99A33c49884792a89bD8DE9474138e4E0350a"
                    client={client}
                >
                    บัญชีผู้ใช้งาน : <AccountAddress />
                </AccountProvider>
                </div>
                <div className="flex justify-items-center mt-4">
                <AccountProvider
                    address="0xDdF99A33c49884792a89bD8DE9474138e4E0350a"
                    client={client}
                >
                    <Token />
                    <AccountBalance
                        chain={chain}
                        tokenAddress={DFAST_POLYGON}
                        loadingComponent={<span>Loading...</span>}
                        // formatFn={(props: AccountBalanceInfo) =>
                        //   `${props.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${props.symbol}`
                        // }
                    />
                </AccountProvider>
                </div>
                <div>
                <AccountProvider
                    address="0xDdF99A33c49884792a89bD8DE9474138e4E0350a"
                    client={client}
                >
                    <AccountBalance
                        chain={chain}
                        tokenAddress={POL_POLYGON}
                        loadingComponent={<span>Loading...</span>}
                        // formatFn={(props: AccountBalanceInfo) =>
                        //   `${props.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${props.symbol}`
                        // }
                    />
                </AccountProvider>
                </div>
                <div>
                <AccountProvider
                    address="0xDdF99A33c49884792a89bD8DE9474138e4E0350a"
                    client={client}
                >
                    <AccountBalance
                        chain={chain}
                        tokenAddress={USDC_POLYGON}
                        loadingComponent={<span>Loading...</span>}
                        // formatFn={(props: AccountBalanceInfo) =>
                        //   `${props.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${props.symbol}`
                        // }
                    />
                </AccountProvider>
                </div>
                <div>
                <AccountProvider
                    address="0xDdF99A33c49884792a89bD8DE9474138e4E0350a"
                    client={client}
                >
                    <AccountBalance
                        chain={chain}
                        tokenAddress={USDT_POLYGON}
                        loadingComponent={<span>Loading...</span>}
                        // formatFn={(props: AccountBalanceInfo) =>
                        //   `${props.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${props.symbol}`
                        // }
                    />
                </AccountProvider>
                </div>
            </div>
            <div>
                <a 
                    className="flex flex-col border border-zinc-500 px-4 py-3 rounded-lg hover:bg-zinc-800 transition-colors hover:border-zinc-800"
                    href="/">กลับหน้าหลัก</a>
            </div>
        </div>
    );
  }

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
              tokenId: 1n
          }
      );
      const { data: dfastBalance } = useReadContract(
          balanceOfERC20,
          {
              contract: getContract({
                  client: client,
                  chain: defineChain(polygon),
                  address: "0xca23b56486035e14F344d6eb591DC27274AF3F47"
              }),
              address: walletAddress || ""
          }
      );
      return (
          <div style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
              border: "1px solid #333",
              borderRadius: "8px",
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
                  borderRadius: "8px",
                }}>
                  <p style={{fontSize: "24px"}}><b>รายการทรัพย์สิน</b></p>
                  <p style={{fontSize: "18px"}}>{walletAddress ? walletAddress || "" : "ยังไม่ได้เชื่อมกระเป๋า !"} </p>    
              </div>
              
              <p>คูปอง 3K NFT: {walletAddress ? nftBalance?.toString() : "0"}</p>
              <p>เหรียญ DFast: {walletAddress ? toEther(dfastBalance || 0n) : "0"}</p>
          </div>
      )
  };
  
// const Home: NextPage = () => {
//     <ThirdwebProvider>
        
//         const address = useAddress();

//         const contract = useContract("0xca23b56486035e14F344d6eb591DC27274AF3F47");

//         const balance= useTokenBalance(contract, address);
//     </ThirdwebProvider>
//     return (
//         <div>
//             บัญชีผู้ใช้งาน
//                 <ConnectWallet />
//                 {balance?.displayValue}
//         </div>
//     )

// };

// export default Home;