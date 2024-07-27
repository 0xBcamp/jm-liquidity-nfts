"use client";

// ShadCN Imports
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

// Form Imports
import { useForm } from "react-hook-form";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Ethereum Imports
import { Address } from "viem";
import {
  useWaitForTransactionReceipt,
  useWriteContract,
  useAccount,
  type BaseError,
} from "wagmi";
import ERC20 from "@/contracts/ERC20.json";
import LPNFTPAIR from "@/contracts/KimLPNFTPair.json";
import Link from "next/link";

export default function DepositToPairCard({
  token0,
  token1,
  lpnftPairAddress,
}: {
  token0: Address | undefined;
  token1: Address | undefined;
  lpnftPairAddress: Address | undefined;
}) {
  console.log("token0:", token0);
  console.log("token1:", token1);
  console.log("lpnftPairAddress:", lpnftPairAddress);

  // Setup state Variables
  const [token0Transfered, setToken0Transfered] = useState(false);
  const [token1Transfered, setToken1Transfered] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [completedHash, setCompletedHash] = useState<string | undefined>();
  const [status, setStatus] = useState<Status>(Status["Idle"]);

  enum Status {
    "Idle",
    "Minting",
    "Transferring Token0",
    "Transferring Token1",
  }

  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Form Setup ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  const DepositToPairSchema = z.object({
    amount: z.coerce
      .number({ required_error: "Provide amount to deposit" })
      .min(0.0000001, { message: "Amount must be greater than 0" }),
  });

  const depositForm = useForm<z.infer<typeof DepositToPairSchema>>({
    resolver: zodResolver(DepositToPairSchema),
    defaultValues: {
      amount: 10,
    },
  });
  type DepositToPairValues = z.infer<typeof DepositToPairSchema>;

  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Ethereum Iteractions setup ~~~~~~~~~~~~~~~~~~~~~~~~~
  const {
    data: hash,
    writeContractAsync,
    isPending,
    error,
  } = useWriteContract();
  const account = useAccount();

  // Helper functions
  function reset() {
    setStatus(Status["Idle"]);
  }

  // Transfer token0 and token1 to the pair
  async function transferToken0(amount: number) {
    console.log("Token0 : ", token0);
    // Transfer token0 amount to the pair
    setStatus(Status["Transferring Token0"]);
    const data = await writeContractAsync({
      address: token0 as Address,
      abi: ERC20,
      functionName: "transfer",
      args: [lpnftPairAddress, BigInt(amount) * BigInt(10) ** BigInt(18)],
    });
    if (data) {
      setToken0Transfered(true);
      setStatus(Status["Idle"]);
    }
    return data;
  }
  async function transferToken1(amount: number) {
    console.log("Token1 : ", token1);
    // Transfer token1 amount to the pair
    setStatus(Status["Transferring Token1"]);
    const data = await writeContractAsync({
      address: token1 as Address,
      abi: ERC20,
      functionName: "transfer",
      args: [lpnftPairAddress, BigInt(amount) * BigInt(10) ** BigInt(18)],
    });
    if (data) {
      setToken1Transfered(true);
      setStatus(Status["Idle"]);
    }
    return data;
  }

  // Deposits liquidity to the pair
  async function depositLiquidity(data: DepositToPairValues) {
    setCompleted(false);
    let tx0 = undefined;
    let tx1 = undefined;

    if (data.amount != 0 && !token0Transfered) {
      tx0 = await transferToken0(data.amount).catch((e) => reset());
    }
    if (data.amount != 0 && !token1Transfered) {
      tx1 = await transferToken1(data.amount).catch((e) => reset());
    }
  }

  // Mints LP404
  async function mint() {
    setStatus(Status["Minting"]);
    // Change to && if you want to transfer both tokens before minting
    // Mint LP404 from the pair to the user
    const data = await writeContractAsync({
      address: lpnftPairAddress as Address,
      abi: LPNFTPAIR.abi,
      functionName: "mint",
      args: [account.address],
    }).catch((e) => reset());

    if (data) {
      setToken0Transfered(false);
      setToken1Transfered(false);
      setStatus(Status["Idle"]);
      setCompletedHash(data);
      setCompleted(true);
    }
  }

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Deposit from LPNFT Pair</CardTitle>
        <CardDescription>
          Enter amount you wish to deposit from the Pair.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...depositForm}>
          <form onSubmit={depositForm.handleSubmit(depositLiquidity)}>
            <div className="grid gap-4">
              <FormField
                control={depositForm.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>{" "}
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="w-full flex items-center justify-between gap-6">
                <Button
                  disabled={isPending}
                  type="submit"
                  className="w-full bg-green-600"
                >
                  {(status === Status["Transferring Token0"] &&
                    "Transferring Token0...") ||
                    (status === Status["Transferring Token1"] &&
                      "Transferring Token1...") ||
                    (status === Status["Idle"] && "Deposit") ||
                    "Deposit"}
                </Button>
                <Button
                  disabled={isPending}
                  onClick={mint}
                  className="w-full bg-blue-600"
                >
                  {status === Status.Minting ? "Minting..." : "Mint"}
                </Button>
              </div>
              <div className="w-full">
                {completed && completedHash && (
                  <Link
                    href={`https://sepolia.explorer.mode.network/tx/${completedHash}`}
                    className="text-blue-500"
                    target="blank"
                  >
                    Transaction Hash: {completedHash.substring(0, 10) + "..."}
                  </Link>
                )}
                {error && (
                  <div>
                    Error: {(error as BaseError).shortMessage || error.message}
                  </div>
                )}
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
