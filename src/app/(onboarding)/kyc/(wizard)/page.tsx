"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { Camera, IdCard, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function KycIntroPage() {
  const router = useRouter();

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 p-6">
      <Image
        src="/images/kyc/padlock-fingerprint.svg"
        alt=""
        width={200}
        height={200}
        className="mx-auto"
      />

      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Let&apos;s verify your account
        </h1>
        <p className="text-sm text-muted-foreground">
          This helps keep Crest safe and ensures you&apos;re connecting with real
          people and real properties.
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3 rounded-xl bg-muted p-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent">
            <IdCard className="size-5 text-primary" />
          </span>
          <div>
            <p className="text-sm font-semibold">Upload a valid ID picture</p>
            <p className="text-sm text-muted-foreground">
              To check your personal informations are correct
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl bg-muted p-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent">
            <Camera className="size-5 text-primary" />
          </span>
          <div>
            <p className="text-sm font-semibold">Take a selfie of yourself</p>
            <p className="text-sm text-muted-foreground">
              This confirms your true identity
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
          <ShieldCheck className="size-4 shrink-0" />
          Your information is only used for your identity verification.
        </p>
        <Button className="w-full" onClick={() => router.push("/kyc/id")}>
          Start now
        </Button>
      </div>
    </div>
  );
}
