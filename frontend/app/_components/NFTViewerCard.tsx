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

  const fetchLp404Address = async () => {
    if (pairAddress) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const pairContract = new ethers.Contract(pairAddress, LPNFTPAIR.abi, provider);
      const lp404Addr = await pairContract.lp404();
      setLp404Address(lp404Addr);
    }
  };

  useEffect(() => {
    fetchLp404Address();
  }, [pairAddress]);

  const fetchMetadata = async (tokenId: string) => {
    if (lp404Address && tokenId) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const lp404Contract = new ethers.Contract(lp404Address, ERC404.abi, provider);
      const tokenUri = await lp404Contract.tokenURI(tokenId);
      const response = await fetch(tokenUri);
      const metadata = await response.json();
      setMetadata(metadata);
      setImageUri(metadata.image);
    }
  };

  // Form validation schema
  const NFTViewerSchema = z.object({
    tokenId: z.string().nonempty("Token ID is required"),
  });

  type NFTViewerValues = z.infer<typeof NFTViewerSchema>;

  // Setup form with react-hook-form and zod
  const form = useForm<NFTViewerValues>({
    resolver: zodResolver(NFTViewerSchema),
  });

  const onSubmit = (data: NFTViewerValues) => {
    fetchMetadata(data.tokenId);
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
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-bold">Metadata</h3>
              <pre>{JSON.stringify(metadata, null, 2)}</pre>
            </div>
            <div>
              <h3 className="text-lg font-bold">Image</h3>
              {imageUri ? <img src={imageUri} alt="NFT" className="w-full" /> : <p>No image available</p>}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NFTViewerCard;