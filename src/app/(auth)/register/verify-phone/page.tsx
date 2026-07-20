"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRegisterWizardStore, VerifyCodeForm } from "@/features/auth";

export default function VerifyPhonePage() {
  const router = useRouter();
  const phoneNumber = useRegisterWizardStore((s) => s.phoneNumber);
  const markPhoneVerified = useRegisterWizardStore((s) => s.markPhoneVerified);
  const devOtp = useRegisterWizardStore((s) => s.devOtp);
  const setDevOtp = useRegisterWizardStore((s) => s.setDevOtp);

  useEffect(() => {
    if (!phoneNumber) router.replace("/register/phone");
  }, [phoneNumber, router]);

  if (!phoneNumber) return null;

  return (
    <VerifyCodeForm
      type="phone"
      identifier={phoneNumber}
      title="Verify Phone Number"
      prefillCode={devOtp}
      onVerified={() => {
        markPhoneVerified();
        setDevOtp(null);
        router.push("/register/role");
      }}
    />
  );
}
