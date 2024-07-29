"use client";

import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useClient } from "wagmi";
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
import { toast } from "sonner";
import { BaseError } from "viem";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import LPNFTPAIR from "@/contracts/KimLPNFTPair.json";
import ERC404 from "@/contracts/LP404.json";

interface NFTViewerCardProps {
  pairAddress: string | null;
}

const NFTViewerCard: React.FC<NFTViewerCardProps> = ({ pairAddress }) => {
  const [metadata, setMetadata] = useState<any>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [lp404Address, setLp404Address] = useState<string | null>(null);
  const client = useClient();
  // Check if the client is connected
  if (!client) {
    throw new Error("No connected client");
  }
  const url = client.chain.rpcUrls.default.http[0];
  const provider = new ethers.JsonRpcProvider(url);

  const fetchLp404Address = async () => {
    if (pairAddress) {
      const pairContract = new ethers.Contract(
        pairAddress,
        LPNFTPAIR.abi,
        provider,
      );
      const lp404Addr = await pairContract.lp404();
      setLp404Address(lp404Addr);
    }
  };

  useEffect(() => {
    fetchLp404Address();
  }, [pairAddress]);

  const fetchMetadata = async (tokenId: string) => {
    if (lp404Address && tokenId) {
      const lp404Contract = new ethers.Contract(
        lp404Address,
        ERC404.abi,
        provider,
      );
      const tokenUri = await lp404Contract.tokenURI(tokenId);
      const response = await fetch(tokenUri);
      const metadata = await response.json();
      setMetadata(metadata);
      const imageUrl = `http://${metadata.image}?t=${new Date().getTime()}`;
      setImageUri(imageUrl); // Add a timestamp to bypass cache
      console.log(`Fetched metadata: ${JSON.stringify(metadata)}`);
      console.log(`Image URL: ${imageUrl}`);
    }
  };

  // Helper Functions
  function toastError(error: any) {
    toast(`Failed to Find NFT`, {
      style: { color: "red" },
      action: "Close",
      description: (error as BaseError).shortMessage || error.message,
    });
  }

  // Form validation schema
  const NFTViewerSchema = z.object({
    tokenId: z.string().nonempty("Token ID is required"),
  });

  type NFTViewerValues = z.infer<typeof NFTViewerSchema>;

  // Setup form with react-hook-form and zod
  const form = useForm<NFTViewerValues>({
    resolver: zodResolver(NFTViewerSchema),
  });

  const onSubmit = async (data: NFTViewerValues) => {
    try {
      await fetchMetadata(data.tokenId);
    } catch (error) {
      toastError(error);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">NFT Viewer</CardTitle>
        <CardDescription>
          Enter a token ID to view the metadata and image.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4">
              <FormField
                control={form.control}
                name="tokenId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Token ID</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter Token ID" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full bg-green-600">
                Fetch Metadata
              </Button>
            </div>
          </form>
        </Form>
        {metadata && (
          <div className="mt-4">
            <div>
              <h3 className="text-lg font-bold">{metadata.name}</h3>
              {imageUri ? (
                <iframe
                  src={imageUri}
                  title="NFT Image"
                  className="w-full h-96"
                  style={{ border: "none" }}
                  onLoad={() => console.log("Iframe loaded successfully")}
                  onError={(e) => console.error("Iframe failed to load", e)}
                />
              ) : (
                <p>Loading image...</p>
              )}
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-bold">Metadata</h3>
              <pre>{JSON.stringify(metadata, null, 2)}</pre>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NFTViewerCard;
