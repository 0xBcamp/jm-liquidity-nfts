"use client";

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

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import ERC20 from "@/contracts/ERC20.json";
import { Address } from "viem";
import LPNFTPAIR from "@/contracts/KimLPNFTPair.json";

import { useWriteContract, useAccount, type BaseError } from "wagmi";

const WithdrawFromPairSchema = z.object({
  amount: z.number(),
});

export default function WithdrawFromPairCard({
  lpnftPairAddress,
}: {
  lpnftPairAddress: Address | undefined;
}) {
  // Setup form validation Schema
  const withdrawForm = useForm<z.infer<typeof WithdrawFromPairSchema>>({
    resolver: zodResolver(WithdrawFromPairSchema),
    defaultValues: {
      amount: 0,
    },
  });
  type WithdrawFromPairValues = z.infer<typeof WithdrawFromPairSchema>;

  // Setup contract interaction
  const {
    data: hash,
    writeContractAsync,
    isPending,
    error,
  } = useWriteContract();
  const account = useAccount();

  async function withdrawFormOnSubmit(values: WithdrawFromPairValues) {
    console.log("Burning LP404...");
    console.log("lpnftPairAddress: ", lpnftPairAddress);
    // Burn LP404 and return tokens to user
    const data = await writeContractAsync({
      address: lpnftPairAddress as Address,
      abi: LPNFTPAIR.abi,
      functionName: "burn",
      args: [account.address],
    });
    console.log("Done Withdrawing!");
  }

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Withdraw from LPNFT Pair</CardTitle>
        <CardDescription>
          Press the button to withdraw your liquidity from the LPNFT pair.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...withdrawForm}>
          <form onSubmit={withdrawForm.handleSubmit(withdrawFormOnSubmit)}>
            <div className="grid gap-4">
              {/*
              <FormField
                control={withdrawForm.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>{" "}
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              */}
              <div className="w-full flex items-center justify-between gap-6">
                <Button
                  disabled={isPending}
                  type="submit"
                  className="w-full bg-red-600"
                  variant={"destructive"}
                >
                  {isPending ? "Confirming..." : "Withdraw"}
                </Button>
              </div>
              <div className="w-full">
                {hash && (
                  <Link
                    href={`https://sepolia.explorer.mode.network/tx/${hash}`}
                    className="text-blue-500"
                    target="blank"
                  >
                    Transaction Hash: {hash.substring(0, 10) + "..."}
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
