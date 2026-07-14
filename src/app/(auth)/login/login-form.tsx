"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";
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
import { PasswordInput } from "@/components/ui/password-input";
import { useLogin, loginSchema, type LoginInput } from "@/features/auth";
import { isApiError } from "@/lib/api/errors";

export function LoginForm({ nextPath }: { nextPath: string }) {
  const router = useRouter();
  const login = useLogin();
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  function onSubmit(values: LoginInput) {
    setFormError(null);
    login.mutate(values, {
      onSuccess: () => {
        toast.success("Welcome back");
        router.replace(nextPath);
      },
      onError: (error) => {
        if (isApiError(error) && error.fieldErrors) {
          for (const [field, messages] of Object.entries(error.fieldErrors)) {
            form.setError(field as keyof LoginInput, { message: messages[0] });
          }
          return;
        }
        setFormError(
          isApiError(error) ? error.message : "Something went wrong.",
        );
      },
    });
  }

  return (
    <div className="flex flex-col gap-10">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-auth-heading">
          Welcome to Crestapp
        </h1>
        <p className="text-base leading-[1.32] text-muted-foreground">
          kindly login with your email address
        </p>
      </div>

      <div className="flex flex-col gap-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="gap-3">
                  <FormLabel className="text-base font-medium text-foreground">
                    Email
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your email"
                      type="email"
                      size="xl"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="gap-3">
                  <FormLabel className="text-base font-medium text-foreground">
                    Password
                  </FormLabel>
                  <FormControl>
                    <PasswordInput placeholder="Enter" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {formError && (
              <p className="text-sm text-destructive">{formError}</p>
            )}

            <div className="flex flex-col items-center gap-3">
              <Button
                type="submit"
                size="xl"
                className="w-full"
                disabled={login.isPending}
              >
                {login.isPending ? "Logging in…" : "Log in"}
              </Button>
              <p className="flex gap-1 text-xs font-medium">
                <span className="text-muted-foreground">
                  Forgot your password?
                </span>
                <Link href="/forgot-password" className="text-primary">
                  Reset
                </Link>
              </p>
            </div>
          </form>
        </Form>

        <div className="flex flex-col gap-3">
          <div className="relative flex h-[17px] items-center justify-center">
            <Image
              src="/images/auth/shared/divider-line.svg"
              alt=""
              fill
              sizes="100vw"
              className="object-fill"
            />
            <span className="relative bg-background px-2.5 text-xs font-medium tracking-[0.5px] text-foreground">
              Or login with
            </span>
          </div>

          {/* TODO(backend): /api/auth/login/google has no documented response shape yet — disabled until verified. */}
          <button
            type="button"
            disabled
            className="flex h-13.5 w-full items-center justify-center gap-2 rounded-xl bg-black/[0.06] text-base text-foreground disabled:opacity-50"
          >
            <Image
              src="/images/auth/shared/icon-google.svg"
              alt=""
              width={28}
              height={27}
              className="size-[27px]"
            />
            Log In with Google
          </button>
        </div>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-medium text-primary hover:underline">
          Create one
        </Link>
      </p>
    </div>
  );
}
