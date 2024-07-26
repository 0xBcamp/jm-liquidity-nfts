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
import { Textarea } from "@/components/ui/textarea";
// Form Validation Imports
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
// Ethereum Imports
import { ethers } from "ethers";
import { type BaseError, useWriteContract, useClient } from "wagmi";
import { Address } from "viem";
import LPNFTFACTORY from "@/contracts/KimLPNFTFactory.json";
import { getFactoryAddress } from "@/lib/serverFunctions";

export default function CreatePairCard({
  setPair,
  setToken0,
  setToken1,
}: {
  setPair: Function;
  setToken0: Function;
  setToken1: Function;
}) {
  // ~~~~~~~~~~~~~~~~~~~~ Setup The Form ~~~~~~~~~~~~~~~~~~~~
  // Form validation schema
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
  type CreatePairValues = z.infer<typeof CreatePairSchema>;
  // Form object
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

  // ~~~~~~~~~~~~~~~~~~~~ Setup Interactions ~~~~~~~~~~~~~~~~~~~~
  const {
    data: hash,
    writeContractAsync,
    isPending,
    error,
  } = useWriteContract();
  const client = useClient();

  // Creates a Pair
  async function createPair(formValues: CreatePairValues) {
    // Get the factory address
    const LPNFT_FACTORY_ADDRESS = (await getFactoryAddress()) as Address;
    // Check if the factory address is set
    if (!LPNFT_FACTORY_ADDRESS) {
      throw new Error("LPNFT_FACTORY_ADDRESS not set");
    }
    // Create the pair
    const pairInfo = await writeContractAsync({
      address: LPNFT_FACTORY_ADDRESS,
      abi: LPNFTFACTORY.abi,
      functionName: "createPair",
      args: [
        formValues.tokenA as Address,
        formValues.tokenB as Address,
        formValues.name,
        formValues.symbol,
        formValues.traitCID,
        formValues.description,
        BigInt(formValues.decimals),
      ],
    }).catch((e: Error) => {
      console.log((e as BaseError).shortMessage || e.message);
    });
    // Set the pair address and token addresses
    setPair(
      await getPair(formValues.tokenA as Address, formValues.tokenB as Address),
    );
    setToken1(formValues.tokenB as Address);
    setToken0(formValues.tokenA as Address);
  }

  // Gets a pair address
  async function getPair(tokenA: Address, tokenB: Address) {
    // Get the factory address
    const LPNFT_FACTORY_ADDRESS = (await getFactoryAddress()) as Address;
    // Check if the factory address is set
    if (!LPNFT_FACTORY_ADDRESS) {
      throw new Error("LPNFT_FACTORY_ADDRESS not set");
    }
    // Check if the client is connected
    if (!client) {
      throw new Error("No connected client");
    }
    // Get the RPC URL
    const url = client.chain.rpcUrls.default.http[0];
    const provider = new ethers.JsonRpcProvider(url);
    const factoryContract = new ethers.Contract(
      LPNFT_FACTORY_ADDRESS,
      LPNFTFACTORY.abi,
      provider,
    );
    const pairAddress = await factoryContract.getPair(tokenA, tokenB);
    return pairAddress ? (pairAddress as Address) : undefined;
  }

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
          <form onSubmit={form.handleSubmit(createPair)}>
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
