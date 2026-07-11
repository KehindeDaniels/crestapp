"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRegisterWizardStore, VerifyCodeForm } from "@/features/auth";

export default function VerifyEmailPage() {
  const router = useRouter();
  const email = useRegisterWizardStore((s) => s.email);
  const markEmailVerified = useRegisterWizardStore((s) => s.markEmailVerified);

  useEffect(() => {
    if (!email) router.replace("/register");
  }, [email, router]);

  if (!email) return null;

  return (
    <VerifyCodeForm
      type="email"
      identifier={email}
      title="Verify Your Email"
      onVerified={() => {
        markEmailVerified();
        router.push("/register/phone");
      }}
    />
  );
}
