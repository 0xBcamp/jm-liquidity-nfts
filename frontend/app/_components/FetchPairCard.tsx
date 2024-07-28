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
import { useClient } from "wagmi";
import { Address } from "viem";
import LPNFTFACTORY from "@/contracts/KimLPNFTFactory.json";
import LPNFTPAIR from "@/contracts/KimLPNFTPair.json";
import LP404 from "@/contracts/LP404.json";
import { getFactoryAddress } from "@/lib/serverFunctions";

export default function FetchPairCard({
  setPair,
  setToken0,
  setToken1,
  setName,
  setSymbol,
  setTraitCID,
  setDescription,
  setDecimals,
}: {
  setPair: Function;
  setToken0: Function;
  setToken1: Function;
  setName: Function;
  setSymbol: Function;
  setTraitCID: Function;
  setDescription: Function;
  setDecimals: Function;
}) {
  // ~~~~~~~~~~~~~~~~~~~~ Setup The Form ~~~~~~~~~~~~~~~~~~~~
  // Form validation schema
  const CreatePairSchema = z.object({
    tokenA: z.string().min(32, "Invalid Address Length"),
    tokenB: z.string().min(32, "Invalid Address Length"),
    name: z.string().optional(),
    symbol: z.string().optional(),
    traitCID: z.string().optional(),
    description: z.string().optional(),
    decimals: z.number().optional(),
  });
  type CreatePairValues = z.infer<typeof CreatePairSchema>;
  // Form object
  const form = useForm<CreatePairValues>({
    resolver: zodResolver(CreatePairSchema),
    defaultValues: {
      tokenA: "",
      tokenB: "",
      name: "",
      symbol: "",
      traitCID: "",
      description: "",
      decimals: undefined,
    },
  });

  // ~~~~~~~~~~~~~~~~~~~~ Setup Interactions ~~~~~~~~~~~~~~~~~~~~
  const client = useClient();

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
  async function fetchPair(formValues: CreatePairValues) {
    try {
      const pairAddress = await getPair(formValues.tokenA as Address, formValues.tokenB as Address);
      if (pairAddress) {
        if (!client) {
          throw new Error("No connected client");
        }
        const url = client.chain.rpcUrls.default.http[0];
        const provider = new ethers.JsonRpcProvider(url);
        const pairContract = new ethers.Contract(pairAddress, LPNFTPAIR.abi, provider);
        const lp404Address = await pairContract.lp404();

        const lp404Contract = new ethers.Contract(lp404Address, LP404.abi, provider);
        const name = await lp404Contract.name();
        const symbol = await lp404Contract.symbol();
        const traitCID = await lp404Contract.traitCID();
        const description = await lp404Contract.description();
        const decimals = await lp404Contract.decimals();

        setPair(pairAddress);
        setToken1(formValues.tokenB as Address);
        setToken0(formValues.tokenA as Address);

        form.setValue('name', name);
        form.setValue('symbol', symbol);
        form.setValue('traitCID', traitCID);
        form.setValue('description', description);
        form.setValue('decimals', Number(decimals));

        console.log("Fetched pair address:", pairAddress);
        console.log("Token A:", formValues.tokenA);
        console.log("Token B:", formValues.tokenB);
      } else {
        console.error("Pair not found");
      }
    } catch (error) {
      console.error("Error fetching pair:", error);
    }
  }

  return (
    <Card className="mx-auto max-w-sm">
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
                        <Input {...field} placeholder="Enter ERC20"/>
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
                        <Input {...field} placeholder="Enter ERC20"/>
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
                        {...field}
                        disabled
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="button" onClick={form.handleSubmit(fetchPair)} className="w-full mt-2">
                Fetch Pair
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
