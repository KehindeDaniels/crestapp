"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { isApiError } from "@/lib/api/errors";
import { useSendVerification, useVerifyCode } from "../hooks";
import { otpSchema, type OtpInput } from "../schema";
import type { VerificationType } from "../types";

/**
 * Shared step UI for the two OTP screens in the register wizard (verify
 * email / verify phone). `prefillCode` is the OTP the backend already
 * returned in `POST /api/auth/verification/send`'s own response — real,
 * confirmed for `type: "phone"` (not `email`, per the Postman collection's
 * two saved examples), because the actual SMS/email-sending service isn't
 * live yet. Auto-filling it (with a visible note, not silently) means
 * testers don't need devtools or a second phone to find the code — see
 * docs/design-vs-backend-gaps.md.
 */
export function VerifyCodeForm({
  type,
  identifier,
  title,
  onVerified,
  prefillCode,
}: {
  type: VerificationType;
  identifier: string;
  title: string;
  onVerified: () => void;
  prefillCode?: string | null;
}) {
  const verifyCode = useVerifyCode();
  const sendVerification = useSendVerification();
  const [formError, setFormError] = useState<string | null>(null);
  const [testCode, setTestCode] = useState<string | null>(prefillCode ?? null);

  const form = useForm<OtpInput>({
    resolver: zodResolver(otpSchema),
    defaultValues: { code: prefillCode ?? "" },
  });

  function onSubmit(values: OtpInput) {
    setFormError(null);
    verifyCode.mutate(
      { type, identifier, otp: values },
      {
        onSuccess: () => onVerified(),
        onError: (error) => {
          setFormError(isApiError(error) ? error.message : "Invalid code.");
        },
      },
    );
  }

  function resend() {
    sendVerification.mutate(
      { type, identifier },
      {
        onSuccess: (data) => {
          toast.success("Code resent");
          if (data.code) {
            form.setValue("code", data.code);
            setTestCode(data.code);
          } else {
            setTestCode(null);
          }
        },
        onError: (error) =>
          toast.error(isApiError(error) ? error.message : "Couldn't resend code."),
      },
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground">
          Please enter the 6 digit code sent to {identifier}
        </p>
      </div>

      {testCode && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-center text-xs font-medium text-amber-800">
          Test mode: the code sending service isn&apos;t live yet, so we&apos;ve filled it in for
          you — <span className="font-semibold">{testCode}</span>
        </p>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col items-center gap-4">
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <InputOTP maxLength={6} {...field}>
                    <InputOTPGroup>
                      {Array.from({ length: 6 }).map((_, i) => (
                        <InputOTPSlot key={i} index={i} />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {formError && <p className="text-sm text-destructive">{formError}</p>}

          <Button type="submit" className="w-full" disabled={verifyCode.isPending}>
            {verifyCode.isPending ? "Verifying…" : "Verify"}
          </Button>
        </form>
      </Form>

      <button
        type="button"
        onClick={resend}
        disabled={sendVerification.isPending}
        className="text-center text-sm text-muted-foreground underline underline-offset-2"
      >
        Didn&apos;t get code? Resend
      </button>
    </div>
  );
}
