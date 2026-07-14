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
import { PasswordInput } from "@/components/ui/password-input";
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
    else if (!wizard.role) router.replace("/register/role");
    // Mount-only guard: checked once when this step is entered. Deliberately
    // NOT reactive to wizard.phoneVerified/role — onSuccess below calls
    // wizard.reset() (which flips them back) in the same render pass as
    // router.push("/login"); a reactive effect here would re-fire on that
    // reset and race router.replace("/register") against the intended
    // navigation. Mirrors the identical mount-only pattern in
    // src/app/(onboarding)/kyc/processing/page.tsx. See
    // docs/design-vs-backend-gaps.md (Phase 2.5) for the full writeup.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const form = useForm<RegisterPasswordInput>({
    resolver: zodResolver(registerPasswordSchema),
    defaultValues: { password: "", password_confirmation: "" },
  });
  const password = useWatch({ control: form.control, name: "password" });

  function onSubmit(values: RegisterPasswordInput) {
    if (!wizard.role) return;
    setFormError(null);
    register.mutate(
      {
        first_name: wizard.firstName,
        last_name: wizard.lastName,
        email: wizard.email,
        phone_number: wizard.phoneNumber,
        password: values.password,
        password_confirmation: values.password_confirmation,
        role: wizard.role,
      },
      {
        onSuccess: () => {
          wizard.reset();
          // Consumed by login-form.tsx: routes the very next successful
          // login to /welcome instead of the normal next/home target. No
          // backend "onboarding_completed" flag exists to key off instead
          // (see docs/design-vs-backend-gaps.md) — sessionStorage is a
          // same-tab-only heuristic for "just registered," not a durable
          // server-tracked state.
          sessionStorage.setItem("crest:just-registered", "1");
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

  if (!wizard.phoneVerified || !wizard.role) return null;

  return (
    <div className="flex flex-col gap-10">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-auth-heading">Create Password</h1>
        <p className="text-sm text-[#585d65]">
          Choose a strong password to keep your account secure
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="gap-3">
                <FormLabel className="text-base font-medium text-foreground">
                  Password
                </FormLabel>
                <FormControl>
                  <PasswordInput placeholder="Enter" className="h-12" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password_confirmation"
            render={({ field }) => (
              <FormItem className="gap-3">
                <FormLabel className="text-base font-medium text-foreground">
                  Confirm Password
                </FormLabel>
                <FormControl>
                  <PasswordInput placeholder="Enter" className="h-12" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <PasswordStrength password={password} />

          {formError && <p className="text-sm text-destructive">{formError}</p>}

          <Button
            type="submit"
            size="xl"
            className="w-full"
            disabled={register.isPending}
          >
            {register.isPending ? "Creating account…" : "Create Account"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
