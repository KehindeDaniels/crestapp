"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isApiError } from "@/lib/api/errors";
import { useKycWizardStore, useSubmitKyc } from "@/features/kyc";
import { useSessionStore } from "@/features/auth";

export default function KycProcessingPage() {
  const router = useRouter();
  const wizard = useKycWizardStore();
  const submitKyc = useSubmitKyc();
  const userId = useSessionStore((s) => s.user?.user_id);
  const hasSubmitted = useRef(false);

  useEffect(() => {
    if (!wizard.selfieFileUrl) {
      router.replace("/kyc/selfie");
      return;
    }
    if (hasSubmitted.current || !userId) return;
    hasSubmitted.current = true;

    submitKyc.mutate({
      requester_id: userId,
      document_type: wizard.documentType,
      document_number: wizard.documentNumber,
      document_front_url: wizard.frontFileUrl,
      document_back_url: wizard.backFileUrl,
      selfie_url: wizard.selfieFileUrl,
    });
    // `userId` is a real dependency, not a mount-only guard: session hydration
    // can resolve after this page mounts, so the effect must re-run once it's
    // available (the `!userId` check above no-ops until then). `hasSubmitted`
    // still prevents a second submission once it has fired.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  if (!wizard.selfieFileUrl) return null;

  function handleContinue() {
    wizard.reset();
    router.push("/home");
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-6 p-6 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Take a Selfie</h1>

      {submitKyc.isPending && (
        <>
          <Loader2 className="size-12 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            Hold still, we are processing
          </p>
        </>
      )}

      {submitKyc.isError && (
        <div className="space-y-4">
          <p className="text-sm text-destructive">
            {isApiError(submitKyc.error)
              ? submitKyc.error.message
              : "Something went wrong submitting your verification."}
          </p>
          <Button
            disabled={!userId}
            onClick={() => {
              if (!userId) return;
              hasSubmitted.current = false;
              submitKyc.mutate({
                requester_id: userId,
                document_type: wizard.documentType,
                document_number: wizard.documentNumber,
                document_front_url: wizard.frontFileUrl,
                document_back_url: wizard.backFileUrl,
                selfie_url: wizard.selfieFileUrl,
              });
              hasSubmitted.current = true;
            }}
          >
            Try again
          </Button>
        </div>
      )}

      {submitKyc.isSuccess && (
        <div className="w-full space-y-4 rounded-xl border p-6">
          <p className="font-semibold">Verification submitted</p>
          <p className="text-sm text-muted-foreground">
            Processing typically takes 24hrs. You will be notify via email or
            phone number upon successful verification.
          </p>
          <Button className="w-full" onClick={handleContinue}>
            Continue
          </Button>
        </div>
      )}
    </div>
  );
}
