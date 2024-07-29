"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ethers } from "ethers";
import { useAccount } from "wagmi";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ERC20 from "@/contracts/ERC20.json";
import { Address } from "viem";

interface TokenBalancesCardProps {
  token0: Address | undefined;
  token1: Address | undefined;
  pair: Address | undefined;
  lp404: Address | undefined;
}

const TokenBalancesCard: React.FC<TokenBalancesCardProps> = ({
  token0,
  token1,
  pair,
  lp404,
}) => {
  const { address } = useAccount();
  const [balances, setBalances] = useState({
    token0: "0",
    token1: "0",
    pair: "0",
    pairNFT: "0",
  });
  const [isPending, setIsPending] = useState(false);

  const fetchBalances = useCallback(async () => {
    if (!address || !token0 || !token1 || !pair) return;
    setIsPending(true);

    const provider = new ethers.BrowserProvider(window.ethereum);
    const erc20Contract0 = new ethers.Contract(token0, ERC20, provider);
    const erc20Contract1 = new ethers.Contract(token1, ERC20, provider);
    const pairContract = new ethers.Contract(pair, ERC20, provider);

    const balance0 = await erc20Contract0.balanceOf(address);
    const balance1 = await erc20Contract1.balanceOf(address);
    const balancePair = await pairContract.balanceOf(address);

    const decimals0 = await erc20Contract0.decimals();
    const decimals1 = await erc20Contract1.decimals();
    const decimalsPair = await pairContract.decimals();

    const formattedBalancePair = parseFloat(
      ethers.formatUnits(balancePair, decimalsPair),
    );
    const pairNFTBalance = Math.floor(formattedBalancePair);

    setBalances({
      token0: ethers.formatUnits(balance0, decimals0),
      token1: ethers.formatUnits(balance1, decimals1),
      pair: ethers.formatUnits(balancePair, decimalsPair),
      pairNFT: pairNFTBalance.toString(),
    });
    setIsPending(false);
  }, [address, token0, token1, pair]);

  useEffect(() => {
    fetchBalances();
  }, [fetchBalances, token0, token1, pair]);

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Token Balances</CardTitle>
        <CardDescription>Connected Wallet Balances</CardDescription>
      </CardHeader>
      <CardContent>
        {token0 && token1 && pair && lp404 ? (
          <div className="w-full">
            <div className="gap-3 items-center">
              <h3 className="text-md font-semibold tracking-tight">
                Token 0 Balance:
              </h3>
              <p className="text-lg tracking-widest">{balances.token0}</p>
            </div>
            <div className="gap-3 items-center">
              <h3 className="text-md font-semibold tracking-tight">
                Token 1 Balance:
              </h3>
              <p className="text-lg tracking-widest">{balances.token0}</p>
            </div>
            <div className="gap-3 items-center">
              <h3 className="text-md font-semibold tracking-tight">
                Pair Token Balance:
              </h3>
              <p className="text-lg tracking-widest">{balances.pair}</p>
            </div>
            <div className="gap-3 items-center">
              <h3 className="text-md font-semibold tracking-tight">
                Pair NFT Balance:
              </h3>
              <p className="text-lg tracking-widest">{balances.pairNFT}</p>
            </div>
            <div className="gap-3 items-center">
              <h3 className="text-md font-semibold tracking-tight">
                Pair Contract Address:
              </h3>
              <Link
                href={`https://sepolia.explorer.mode.network/address/${lp404}`}
                className="text-blue-500 hover:underline"
                target="blank"
              >
                {pair.substring(0, 15) + "..."}
              </Link>
            </div>
            <div className="gap-3 items-center ">
              <h3 className="text-md font-semibold tracking-tight">
                LP404 Contract Address:
              </h3>
              <Link
                href={`https://sepolia.explorer.mode.network/address/${lp404}`}
                className="text-blue-500 hover:underline"
                target="blank"
              >
                {lp404.substring(0, 15) + "..."}
              </Link>
            </div>
          </div>
        ) : (
          <p>Please create or fetch a pair to view balances.</p>
        )}
        <Button
          onClick={fetchBalances}
          className="w-full mt-2"
          disabled={isPending || !address || !token0 || !token1 || !pair}
        >
          {!address
            ? "Connect wallet to Access"
            : isPending
              ? "Refreshing..."
              : "Refresh Balances"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default TokenBalancesCard;
