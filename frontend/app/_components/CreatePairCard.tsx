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
import { Textarea } from "@/components/ui/textarea";

import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { type BaseError, useWriteContract } from "wagmi";
import { Address } from "viem";
import LPNFTPAIR from "@/contracts/KimLPNFTPair.json";
import LP404 from "@/contracts/LP404.json";
import LPNFTFACTORY from "@/contracts/KimLPNFTFactory.json";
import { getFactoryAddress, getPairAddress } from "@/lib/serverFunctions";

const CreatePairSchema = z.object({
  tokenA: z.string().min(32, "Invalid Address Length"),
  tokenB: z.string().min(32, "Invalid Address Length"),
  name: z.string({ required_error: "Provide a name for the pair" }),
  symbol: z.string({ required_error: "Provide a symbol for the pair" }),
  traitCID: z.string({ required_error: "Provide the trait CID" }),
  description: z.string({
    required_error: "Provide a description of the NFT",
  }),
  decimals: z.number({ required_error: "Provide number of decimals" }),
});

export default function CreatePairCard({
  setPair,
  setLp404,
}: {
  setPair: Function;
  setLp404: Function;
}) {
  const { data: hash, writeContract, isPending, error } = useWriteContract();

  const form = useForm<z.infer<typeof CreatePairSchema>>({
    resolver: zodResolver(CreatePairSchema),
    defaultValues: {
      tokenA: "0x5Ce0d5186575FaeEBe56F9Db7c3559Ff05A90191",
      tokenB: "0x804fAeEC0ce2712c4C954a8C4d7b6fd21B7C749F",
      name: "Test",
      symbol: "TST",
      traitCID: "Whatever",
      description: "This is a cool test",
      decimals: 18,
    },
  });
  type CreatePairValues = z.infer<typeof CreatePairSchema>;

  async function createPairOnSubmit(data: CreatePairValues) {
    // Connect to the factory Create the pair

    const LPNFT_FACTORY_ADDRESS = (await getFactoryAddress()) as Address;
    if (!LPNFT_FACTORY_ADDRESS) {
      throw new Error("LPNFT_FACTORY_ADDRESS not set");
    }

    const args = [
      data.tokenA as Address,
      data.tokenB as Address,
      data.name,
      data.symbol,
      data.traitCID,
      data.description,
      BigInt(data.decimals),
    ];

    console.log("Form Data: ", data);
    console.log("Fatory Address: ", LPNFT_FACTORY_ADDRESS);

    // Create the pair
    writeContract({
      address: LPNFT_FACTORY_ADDRESS,
      abi: LPNFTFACTORY.abi,
      functionName: "createPair",
      args,
    });

    // Get the pair

    // Set the pair and lp404
    setPair(await getPairAddress());
  }

  // useEffect(() => {
  //   if (error) {
  //     console.log(error);
  //   }
  // }, [error]);

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Create New LPNFT Pair</CardTitle>
        <CardDescription>
          Enter your information to create a pair
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(createPairOnSubmit)}>
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="tokenA"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Token A</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tokenB"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Token B</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="symbol"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Symbol</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="traitCID"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trait CID</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="decimals"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Decimals</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter a description of your LPNFT Token"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button disabled={isPending} type="submit" className="w-full">
                {isPending ? "Confirming..." : "Create Pair"}
              </Button>
              {hash && <div>Transaction Hash: {hash}</div>}
              {error && (
                <div>
                  Error: {(error as BaseError).shortMessage || error.message}
                </div>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
