"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FileUploadField, useKycWizardStore } from "@/features/kyc";

export default function KycSelfiePage() {
  const router = useRouter();
  const frontFileUrl = useKycWizardStore((s) => s.frontFileUrl);
  const setSelfie = useKycWizardStore((s) => s.setSelfie);
  const [selfieUrl, setSelfieUrl] = useState("");
  const [selfieName, setSelfieName] = useState("");

  useEffect(() => {
    if (!frontFileUrl) router.replace("/kyc/id");
  }, [frontFileUrl, router]);

  if (!frontFileUrl) return null;

  function handleContinue() {
    setSelfie(selfieUrl);
    router.push("/kyc/processing");
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 p-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Take a Selfie</h1>
          <p className="text-sm text-muted-foreground">
            This helps us confirm it&apos;s really you and keeps Crest safe for
            everyone.
          </p>
        </div>
        <span className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground">
          2/2
        </span>
      </div>

      <div className="rounded-xl border p-6">
        <p className="mb-4 text-sm font-medium">Look directly into the camera</p>
        <FileUploadField
          label="Take a Selfie"
          purpose="kyc_selfie"
          fileName={selfieName}
          accept="image/*"
          capture="user"
          onUploaded={(url, name) => {
            setSelfieUrl(url);
            setSelfieName(name);
          }}
        />
      </div>

      <Button className="w-full" disabled={!selfieUrl} onClick={handleContinue}>
        Continue
      </Button>
    </div>
  );
}
