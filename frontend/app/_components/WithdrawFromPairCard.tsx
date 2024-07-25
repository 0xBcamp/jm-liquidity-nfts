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

const WithdrawFromPairSchema = z.object({
  amount: z.number({ required_error: "Provide number of decimals" }),
});

export default function WithdrawFromPairCard() {
  // 1. Define your form.
  const withdrawForm = useForm<z.infer<typeof WithdrawFromPairSchema>>({
    resolver: zodResolver(WithdrawFromPairSchema),
    defaultValues: {
      amount: 10,
    },
  });
  type WithdrawFromPairValues = z.infer<typeof WithdrawFromPairSchema>;

  // 2. Define a submit handler.
  function withdrawFormOnSubmit(values: WithdrawFromPairValues) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);
  }

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Withdraw from LPNFT Pair</CardTitle>
        <CardDescription>
          Enter amount you wish to withdraw from the Pair
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...withdrawForm}>
          <form onSubmit={withdrawForm.handleSubmit(withdrawFormOnSubmit)}>
            <div className="grid gap-4">
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

              <Button type="submit" className="w-full bg-red-600">
                Withdraw
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
