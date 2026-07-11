"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
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
  useRegister,
  useRegisterWizardStore,
  registerPasswordSchema,
  type RegisterPasswordInput,
} from "@/features/auth";
import { isApiError } from "@/lib/api/errors";
import { PasswordStrength } from "./password-strength";

export default function RegisterPasswordPage() {
  const router = useRouter();
  const wizard = useRegisterWizardStore();
  const register = useRegister();
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!wizard.phoneVerified) router.replace("/register");
  }, [wizard.phoneVerified, router]);

  const form = useForm<RegisterPasswordInput>({
    resolver: zodResolver(registerPasswordSchema),
    defaultValues: { password: "", password_confirmation: "" },
  });
  const password = useWatch({ control: form.control, name: "password" });

  function onSubmit(values: RegisterPasswordInput) {
    setFormError(null);
    register.mutate(
      {
        first_name: wizard.firstName,
        last_name: wizard.lastName,
        email: wizard.email,
        phone_number: wizard.phoneNumber,
        password: values.password,
        password_confirmation: values.password_confirmation,
        // TODO(product): no role-selection screen exists in the provided Figma
        // flow, but POST /api/auth/register requires one. Defaulting to
        // "tenant" until a role picker is designed.
        role: "tenant",
      },
      {
        onSuccess: () => {
          wizard.reset();
          toast.success("Account created — please log in.");
          router.push("/login");
        },
        onError: (error) => {
          if (isApiError(error) && error.fieldErrors) {
            for (const [field, messages] of Object.entries(error.fieldErrors)) {
              if (field in values) {
                form.setError(field as keyof RegisterPasswordInput, {
                  message: messages[0],
                });
              }
            }
          }
          setFormError(isApiError(error) ? error.message : "Something went wrong.");
        },
      },
    );
  }

  if (!wizard.phoneVerified) return null;

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Create Password</h1>
        <p className="text-sm text-muted-foreground">
          Choose a strong password to keep your account secure
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input placeholder="Enter" type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password_confirmation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input placeholder="Enter" type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <PasswordStrength password={password} />

          {formError && <p className="text-sm text-destructive">{formError}</p>}

          <Button type="submit" className="w-full" disabled={register.isPending}>
            {register.isPending ? "Creating account…" : "Create Account"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
