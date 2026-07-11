"use client";

import { useRouter } from "next/navigation";
import { Lock, IdCard, ScanFace } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function KycIntroPage() {
  const router = useRouter();

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 p-6">
      <div className="mx-auto flex size-24 items-center justify-center rounded-full bg-primary/10">
        <Lock className="size-10 text-primary" />
      </div>

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
          <IdCard className="size-6 shrink-0 text-primary" />
          <div>
            <p className="text-sm font-semibold">Upload a valid ID picture</p>
            <p className="text-sm text-muted-foreground">
              To check your personal informations are correct
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl bg-muted p-4">
          <ScanFace className="size-6 shrink-0 text-primary" />
          <div>
            <p className="text-sm font-semibold">Take a selfie of yourself</p>
            <p className="text-sm text-muted-foreground">
              This confirms your true identity
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-center text-xs text-muted-foreground">
          Your information is only used for your identity verification.
        </p>
        <Button className="w-full" onClick={() => router.push("/kyc/id")}>
          Start now
        </Button>
      </div>
    </div>
  );
}
