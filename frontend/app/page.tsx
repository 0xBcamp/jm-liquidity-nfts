"use client";

import CreatePairCard from "./_components/CreatePairCard";
import FetchPairCard from "./_components/FetchPairCard";
import TokenBalancesCard from "./_components/TokenBalancesCard";
import React, { useState } from "react";
import WithdrawFromPairCard from "./_components/WithdrawFromPairCard";
import DepositToPairCard from "./_components/DepositToPairCard";
import NFTViewerCard from "./_components/NFTViewerCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

export interface PairDetails {
  tokenA: string | undefined;
  tokenB: string | undefined;
  name: string | undefined;
  symbol: string | undefined;
  traitCID: string | undefined;
  description: string | undefined;
  decimals: number | undefined;
}

export default function () {
  const [lpnftPairAddress, setLpnftPairAddress] = useState<Address | undefined>(
    undefined,
  );
  const [lp404Address, setLp404Address] = useState<Address | undefined>(
    undefined,
  );
  const [token0, setToken0] = useState<Address | undefined>(undefined);
  const [token1, setToken1] = useState<Address | undefined>(undefined);
  const [pairDetails, setPairDetails] = useState<PairDetails | undefined>(
    undefined,
  );

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
            <header className="w-full flex justify-end">
              <nav className="w-full max-w-screen-xl flex justify-end items-end p-10">
                <ConnectButton />
              </nav>
            </header>
            <main className="w-full flex flex-col justify-center items-center">
              <section className="max-w-screen-xl w-full mb-4">
                <h1 className="font-bold text-6xl mb-4" style={{ color: "#863ee4" }}>
                  LP NFT
                </h1>
                <Tabs defaultValue="create" className="w-full">
                  <TabsList className="flex justify-center mb-4">
                    <TabsTrigger value="create">Create Pair</TabsTrigger>
                    <TabsTrigger value="fetch">Fetch Pair</TabsTrigger>
                  </TabsList>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="col-span-1">
                      <TabsContent value="create">
                        <CreatePairCard
                          setPair={_setLpnftPairAddress}
                          setToken1={_setToken1}
                          setToken0={_setToken0}
                        />
                      </TabsContent>
                      <TabsContent value="fetch">
                        <FetchPairCard
                          setPairAddress={_setLpnftPairAddress}
                          setToken1={_setToken1}
                          setToken0={_setToken0}
                          setName={setName}
                          setSymbol={setSymbol}
                          setTraitCID={setTraitCID}
                          setDescription={setDescription}
                          setDecimals={setDecimals}
                          setLp404Address={setLp404Address}
                          pairDetails={pairDetails}
                          setPairDetails={setPairDetails}
                        />
                      </TabsContent>
                    </div>
                    <div className="col-span-1">
                      <TokenBalancesCard
                        token0={token0 || undefined}
                        token1={token1 || undefined}
                        pair={lpnftPairAddress || undefined}
                        lp404={lp404Address || undefined}
                      />
                    </div>
                    <div className="col-span-1 grid gap-4">
                      <div className="w-full">
                        <DepositToPairCard
                          token0={token0 || ("" as Address)}
                          token1={token1 || ("" as Address)}
                          lpnftPairAddress={lpnftPairAddress}
                        />
                      </div>
                      <div className="w-full">
                        <WithdrawFromPairCard lpnftPairAddress={lpnftPairAddress} />
                      </div>
                    </div>
                  </div>
                  <div className="col-span-full mt-4">
                    <NFTViewerCard pairAddress={lpnftPairAddress || null} />
                  </div>
                </Tabs>
              </section>
            </main>
          </>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
