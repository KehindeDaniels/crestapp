"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import {
  useSendVerification,
  useRegisterWizardStore,
  registerPhoneSchema,
  type RegisterPhoneInput,
} from "@/features/auth";
import { isApiError } from "@/lib/api/errors";

export default function RegisterPhonePage() {
  const router = useRouter();
  const emailVerified = useRegisterWizardStore((s) => s.emailVerified);
  const setPhoneNumber = useRegisterWizardStore((s) => s.setPhoneNumber);
  const sendVerification = useSendVerification();
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!emailVerified) router.replace("/register");
  }, [emailVerified, router]);

  const form = useForm<RegisterPhoneInput>({
    resolver: zodResolver(registerPhoneSchema),
    defaultValues: { phone_number: "" },
  });

  function onSubmit(values: RegisterPhoneInput) {
    setFormError(null);
    sendVerification.mutate(
      { type: "phone", identifier: values.phone_number },
      {
        onSuccess: () => {
          setPhoneNumber(values.phone_number);
          router.push("/register/verify-phone");
        },
        onError: (error) => {
          setFormError(isApiError(error) ? error.message : "Something went wrong.");
        },
      },
    );
  }

  if (!emailVerified) return null;

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Enter Your Phone Number</h1>
        <p className="text-sm text-muted-foreground">
          Please enter your phone number for verification
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="phone_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone number</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your phone number" type="tel" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {formError && <p className="text-sm text-destructive">{formError}</p>}

          <Button type="submit" className="w-full" disabled={sendVerification.isPending}>
            {sendVerification.isPending ? "Sending…" : "Send code"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
