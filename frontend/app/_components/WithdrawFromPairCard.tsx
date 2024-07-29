"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Address } from "viem";
import LPNFTPAIR from "@/contracts/KimLPNFTPair.json";

import { useWriteContract, useAccount, type BaseError } from "wagmi";
import { toast } from "sonner";

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

  // Helper functions
  function toastError(error: any) {
    toast(`Failed to Withdraw Tokens `, {
      style: { color: "red" },
      action: "Close",
      description: (error as BaseError).shortMessage || error.message,
    });
  }
  function toastSuccess() {
    toast(`Successfully Withdrawn Tokens`, {
      style: { color: "green" },
      action: "Close",
    });
  }

  async function withdrawFormOnSubmit(values: WithdrawFromPairValues) {
    try {
      // Burn LP404 and return tokens to user
      const txhash = await writeContractAsync({
        address: lpnftPairAddress as Address,
        abi: LPNFTPAIR.abi,
        functionName: "burn",
        args: [account.address],
      });

      toastSuccess();
    } catch (error) {
      toastError(error);
    }
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
                  {isPending ? "Withdrawing..." : "Withdraw"}
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
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
