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

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const DepositToPairSchema = z.object({
  amount: z.number({ required_error: "Provide number of decimals" }),
});

export default function DepositToPairCard({
  token0,
  token1,
}: {
  token0: any;
  token1: any;
}) {
  // 1. Define your form.
  const depositForm = useForm<z.infer<typeof DepositToPairSchema>>({
    resolver: zodResolver(DepositToPairSchema),
    defaultValues: {
      amount: 10,
    },
  });
  type DepositToPairValues = z.infer<typeof DepositToPairSchema>;

  // 2. Define a submit handler.
  function depositFormOnSubmit(data: DepositToPairValues) {
    // Transfer token0 amount to the pair
    // Transfer token1 amount to the pair
    // Mint LP404 from the pair
  }

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Deposit from LPNFT Pair</CardTitle>
        <CardDescription>
          Enter amount you wish to deposit from the Pair
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...depositForm}>
          <form onSubmit={depositForm.handleSubmit(depositFormOnSubmit)}>
            <div className="grid gap-4">
              <FormField
                control={depositForm.control}
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

              <Button type="submit" className="w-full bg-green-600">
                Deposit
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
