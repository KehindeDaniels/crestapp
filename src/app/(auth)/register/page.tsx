"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Link from "next/link";
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
  registerPersonalInfoSchema,
  type RegisterPersonalInfoInput,
} from "@/features/auth";
import { isApiError } from "@/lib/api/errors";

export default function RegisterPage() {
  const router = useRouter();
  const setPersonalInfo = useRegisterWizardStore((s) => s.setPersonalInfo);
  const setDevOtp = useRegisterWizardStore((s) => s.setDevOtp);
  const sendVerification = useSendVerification();
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<RegisterPersonalInfoInput>({
    resolver: zodResolver(registerPersonalInfoSchema),
    defaultValues: { first_name: "", last_name: "", email: "" },
  });

  function onSubmit(values: RegisterPersonalInfoInput) {
    setFormError(null);
    sendVerification.mutate(
      { type: "email", identifier: values.email },
      {
        onSuccess: (data) => {
          setPersonalInfo({
            firstName: values.first_name,
            lastName: values.last_name,
            email: values.email,
          });
          setDevOtp(data.code ?? null);
          router.push("/register/verify-email");
        },
        onError: (error) => {
          setFormError(isApiError(error) ? error.message : "Something went wrong.");
        },
      },
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Create Account</h1>
        <p className="text-sm text-muted-foreground">
          Start by creating your account to access trusted services
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="last_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input placeholder="Enter" type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {formError && <p className="text-sm text-destructive">{formError}</p>}

          <Button type="submit" className="w-full" disabled={sendVerification.isPending}>
            {sendVerification.isPending ? "Please wait…" : "Create Account"}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            By creating an account or signing you agree to our Terms and Conditions
          </p>
        </form>
      </Form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
