"use client";

import CreatePairCard from "./_components/CreatePairCard";
import FetchPairCard from "./_components/FetchPairCard";
import TokenBalancesCard from "./_components/TokenBalancesCard";
import React, { useState } from "react";
import WithdrawFromPairCard from "./_components/WithdrawFromPairCard";
import DepositToPairCard from "./_components/DepositToPairCard";
import NFTViewerCard from "./_components/NFTViewerCard";
import { abi as lpnftPairABI } from "@/contracts/KimLPNFTPair.json";
import { abi as lp404ABI } from "@/contracts/LP404.json";
import { getTokenA, getTokenB, getPairAddress } from "@/lib/serverFunctions";

import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { Address } from "viem";
import { mode, modeTestnet, localhost } from "wagmi/chains";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const config = getDefaultConfig({
  appName: "My RainbowKit App",
  projectId: "YOUR_PROJECT_ID",
  chains: [mode, modeTestnet, localhost],
  ssr: true, // If your dApp uses server side rendering (SSR)
});

const queryClient = new QueryClient();

export default function () {
  const [lpnftPairAddress, setLpnftPairAddress] = useState<Address | undefined>(
    undefined,
  );
  const [lp404Address, setLp404Address] = useState<Address | undefined>(
    undefined,
  );

  const [token0, setToken0] = useState<Address | undefined>(undefined);
  const [token1, setToken1] = useState<Address | undefined>(undefined);

  // Add the missing state variables
  const [name, setName] = useState<string | undefined>(undefined);
  const [symbol, setSymbol] = useState<string | undefined>(undefined);
  const [traitCID, setTraitCID] = useState<string | undefined>(undefined);
  const [description, setDescription] = useState<string | undefined>(undefined);
  const [decimals, setDecimals] = useState<number | undefined>(undefined);

  function _setLpnftPairAddress(value: Address | undefined) {
    setLpnftPairAddress(value);
  }
  function _setToken0(value: Address | undefined) {
    setToken0(value);
  }
  function _setToken1(value: Address | undefined) {
    setToken1(value);
  }

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <>
            <header className="w-full flex justify-center items-center">
              <nav className="w-full max-w-screen-xl flex justify-end items-end p-10">
                <ConnectButton />
              </nav>
            </header>
            <main className="w-full flex flex-col justify-center items-center">
              <section className="max-w-screen-lg grid grid-cols-3 gap-4">
                <div className="col-span-1">
                  <CreatePairCard
                    setPair={_setLpnftPairAddress}
                    setToken1={_setToken1}
                    setToken0={_setToken0}
                  />
                </div>
                <div className="col-span-1">
                  <FetchPairCard
                    setPair={_setLpnftPairAddress}
                    setToken1={_setToken1}
                    setToken0={_setToken0}
                    setName={setName}
                    setSymbol={setSymbol}
                    setTraitCID={setTraitCID}
                    setDescription={setDescription}
                    setDecimals={setDecimals}
                    setLp404Address={setLp404Address}
                  />
                </div>
                <div className="col-span-1">
                  <TokenBalancesCard
                    token0={token0 || null}
                    token1={token1 || null}
                    pair={lpnftPairAddress || null}
                    lp404={lp404Address || null}
                  />
                </div>
                <div className="col-span-3 grid grid-cols-2 gap-4">
                  <div className="col-span-1">
                    <DepositToPairCard
                      token0={token0 || ("" as Address)}
                      token1={token1 || ("" as Address)}
                      lpnftPairAddress={lpnftPairAddress}
                    />
                  </div>
                  <div className="col-span-1">
                    <WithdrawFromPairCard lpnftPairAddress={lpnftPairAddress} />
                  </div>
                </div>
                <div className="col-span-3">
                  <NFTViewerCard pairAddress={lpnftPairAddress || null} />
                </div>
              </section>
            </main>
          </>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
