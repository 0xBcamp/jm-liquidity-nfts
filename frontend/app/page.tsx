"use client";

import CreatePairCard from "./_components/CreatePairCard";
import React, { useState } from "react";
import WithdrawFromPairCard from "./_components/WithdrawFromPairCard";
import DepositToPairCard from "./_components/DepositToPairCard";
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
              <section className="max-w-screen-lg grid grid-cols-8 gap-4">
                <div className="col-span-4">
                  <CreatePairCard
                    setPair={_setLpnftPairAddress}
                    setToken1={_setToken1}
                    setToken0={_setToken0}
                  />
                </div>
                <div className="flex flex-col gap-4 col-span-4">
                  <div className="col-span-full">
                    <DepositToPairCard
                      token0={token0 || ("" as Address)}
                      token1={token1 || ("" as Address)}
                      lpnftPairAddress={lpnftPairAddress}
                    />
                  </div>
                  <div className="col-span-full">
                    <WithdrawFromPairCard lpnftPairAddress={lpnftPairAddress} />
                  </div>
                </div>
              </section>
            </main>
          </>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
