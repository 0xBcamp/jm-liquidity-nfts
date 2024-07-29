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
import { useState } from "react";
import { z } from "zod";
import { PairDetails } from "@/app/page";
// Ethereum Imports
import { ethers } from "ethers";
import { useClient } from "wagmi";
import { Address } from "viem";
import LPNFTFACTORY from "@/contracts/KimLPNFTFactory.json";
import LPNFTPAIR from "@/contracts/KimLPNFTPair.json";
import LP404 from "@/contracts/LP404.json";
import { getFactoryAddress } from "@/lib/serverFunctions";

export default function FetchPairCard({
  setPairAddress,
  setToken0,
  setToken1,
  setPairDetails,
  pairDetails,
  setName,
  setSymbol,
  setTraitCID,
  setDescription,
  setDecimals,
  setLp404Address,
}: {
  setPairAddress: Function;
  setToken0: Function;
  setToken1: Function;
  setPairDetails: Function;
  pairDetails: PairDetails | undefined;
  setName: Function;
  setSymbol: Function;
  setTraitCID: Function;
  setDescription: Function;
  setDecimals: Function;
  setLp404Address: Function;
}) {
  // ~~~~~~~~~~~~~~~~~~~~ Setup The Form ~~~~~~~~~~~~~~~~~~~~
  // Form validation schema
  const FetchPairSchema = z.object({
    tokenA: z.string().min(32, "Invalid Address Length"),
    tokenB: z.string().min(32, "Invalid Address Length"),
    name: z.string().optional(),
    symbol: z.string().optional(),
    traitCID: z.string().optional(),
    description: z.string().optional(),
    decimals: z.number().optional(),
  });
  type FetchPairValues = z.infer<typeof FetchPairSchema>;
  // Form object
  const form = useForm<FetchPairValues>({
    resolver: zodResolver(FetchPairSchema),
    defaultValues: {
      tokenA: pairDetails?.tokenA || "",
      tokenB: pairDetails?.tokenB || "",
      name: pairDetails?.name || "",
      symbol: pairDetails?.symbol || "",
      traitCID: pairDetails?.traitCID || "",
      description: pairDetails?.description || "",
      decimals: pairDetails?.decimals || 0,
    },
  });

  // ~~~~~~~~~~~~~~~~~~~~ Setup Interactions ~~~~~~~~~~~~~~~~~~~~
  const client = useClient();
  const [foundPair, setFoundPair] = useState(pairDetails && true);
  const [isPending, setIsPending] = useState(false);

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

  // Fetch pair details and populate the form
  async function fetchPair(formValues: FetchPairValues) {
    try {
      setFoundPair(false);
      setIsPending(true);
      const pairAddress = await getPair(
        formValues.tokenA as Address,
        formValues.tokenB as Address,
      );
      if (pairAddress) {
        if (!client) {
          throw new Error("No connected client");
        }
        const url = client.chain.rpcUrls.default.http[0];
        const provider = new ethers.JsonRpcProvider(url);
        const pairContract = new ethers.Contract(
          pairAddress,
          LPNFTPAIR.abi,
          provider,
        );
        const lp404Address = await pairContract.lp404();

        const lp404Contract = new ethers.Contract(
          lp404Address,
          LP404.abi,
          provider,
        );
        const name = await lp404Contract.name();
        const symbol = await lp404Contract.symbol();
        const traitCID = await lp404Contract.traitCID();
        const description = await lp404Contract.description();
        const decimals = await lp404Contract.decimals();

        setPairAddress(pairAddress);
        setToken1(formValues.tokenB as Address);
        setToken0(formValues.tokenA as Address);
        setLp404Address(lp404Address);

        form.setValue("name", name);
        form.setValue("symbol", symbol);
        form.setValue("traitCID", traitCID);
        form.setValue("description", description);
        form.setValue("decimals", Number(decimals));

        console.log("Fetched pair address:", pairAddress);
        console.log("LP404 address:", lp404Address);
        console.log("Token A:", formValues.tokenA);
        console.log("Token B:", formValues.tokenB);
        setFoundPair(true);
        setPairDetails(form.getValues);
      } else {
        console.error("Pair not found");
      }
    } catch (error) {
      console.error("Error fetching pair:", error);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Card className="mx-auto max-w-sm lg:max-w-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Fetch Existing LP_NFT Pair</CardTitle>
        <CardDescription>
          Enter ERC20 addresses to fetch the LP_NFT pair.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(fetchPair)}>
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="tokenA"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Token A</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter ERC20" />
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
                        <Input {...field} placeholder="Enter ERC20" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <span
                className={(!foundPair ? "hidden" : "grid gap-3") + " mt-6"}
              >
                <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight mb-2">
                  Pair Details
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input {...field} disabled />
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
                          <Input {...field} disabled />
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
                          <Input {...field} disabled />
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
                          <Input type="number" {...field} disabled />
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
                          disabled
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </span>
              <Button
                type="button"
                onClick={form.handleSubmit(fetchPair)}
                className="w-full mt-2"
                disabled={isPending}
              >
                {isPending
                  ? "Fetching..."
                  : foundPair
                    ? "Fetch New Pair"
                    : "Fetch Pair"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
