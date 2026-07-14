"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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

  useEffect(() => {
    if (!wizard.selfieFileUrl) {
      router.replace("/kyc/selfie");
      return;
    }
    // Guarded by store state, not a component-local ref — survives this
    // component being unmounted/remounted while the request is in flight
    // (see wizard-store.ts's doc comment for why that matters here).
    if (wizard.submissionStatus !== "idle" || !userId) return;
    wizard.startSubmission();

    submitKyc.mutate(
      {
        requester_id: userId,
        document_type: wizard.documentType,
        document_number: wizard.documentNumber,
        document_front_url: wizard.frontFileUrl,
        document_back_url: wizard.backFileUrl,
        selfie_url: wizard.selfieFileUrl,
      },
      {
        onSuccess: () => wizard.markSubmissionSuccess(),
        onError: (error) =>
          wizard.markSubmissionError(
            isApiError(error) ? error.message : "Something went wrong submitting your verification.",
          ),
      },
    );
    // `userId` is a real dependency, not a mount-only guard: session hydration
    // can resolve after this page mounts, so the effect must re-run once it's
    // available (the `!userId` check above no-ops until then).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  if (!wizard.selfieFileUrl) return null;

  function handleRetry() {
    if (!userId) return;
    wizard.startSubmission();
    submitKyc.mutate(
      {
        requester_id: userId,
        document_type: wizard.documentType,
        document_number: wizard.documentNumber,
        document_front_url: wizard.frontFileUrl,
        document_back_url: wizard.backFileUrl,
        selfie_url: wizard.selfieFileUrl,
      },
      {
        onSuccess: () => wizard.markSubmissionSuccess(),
        onError: (error) =>
          wizard.markSubmissionError(
            isApiError(error) ? error.message : "Something went wrong submitting your verification.",
          ),
      },
    );
  }

  function handleContinue() {
    wizard.reset();
    router.push("/home");
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-6 p-6 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Take a Selfie</h1>

      {(wizard.submissionStatus === "idle" || wizard.submissionStatus === "submitting") && (
        <>
          <Loader2 className="size-12 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            Hold still, we are processing
          </p>
        </>
      )}

      {wizard.submissionStatus === "error" && (
        <div className="space-y-4">
          <p className="text-sm text-destructive">
            {wizard.submissionError ?? "Something went wrong submitting your verification."}
          </p>
          {wizard.submissionError?.toLowerCase().includes("pending kyc submission") ? (
            // Defense-in-depth: the (onboarding)/kyc/(wizard)/layout.tsx gate
            // should prevent reaching this page at all in this case. If it
            // still happens (stale cache, race), retrying will just fail
            // again — there's no error_code to key off, so this is a
            // string-match heuristic, deliberately narrow. See
            // docs/design-vs-backend-gaps.md.
            <Link
              href="/home"
              className="inline-block rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            >
              Back to Home
            </Link>
          ) : (
            <Button disabled={!userId} onClick={handleRetry}>
              Try again
            </Button>
          )}
        </div>
      )}

      {wizard.submissionStatus === "success" && (
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
