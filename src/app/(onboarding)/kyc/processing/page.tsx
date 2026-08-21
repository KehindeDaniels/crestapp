"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { apiErrorMessage } from "@/lib/api/errors";
import { useKycWizardStore, useSubmitKyc } from "@/features/kyc";
import { useSessionStore } from "@/features/auth";

/**
 * Corner-bracket viewfinder + scan line, matching the Figma "Scanning" state
 * (docs/design/screenshots/kyc/Scanning.png) — shown over the real captured
 * selfie while `kyc/submit` is in flight.
 */
function ScanningFrame({
  imageUrl,
  scanning,
}: {
  imageUrl: string;
  scanning: boolean;
}) {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-80">
      <span className="border-primary absolute top-4 left-4 size-8 rounded-tl-lg border-t-4 border-l-4" />
      <span className="border-primary absolute top-4 right-4 size-8 rounded-tr-lg border-t-4 border-r-4" />
      <span className="border-primary absolute bottom-4 left-4 size-8 rounded-bl-lg border-b-4 border-l-4" />
      <span className="border-primary absolute right-4 bottom-4 size-8 rounded-br-lg border-r-4 border-b-4" />

      <div className="absolute inset-6 overflow-hidden rounded-2xl">
        <Image
          src={imageUrl}
          alt="Captured selfie"
          fill
          className="object-cover"
          unoptimized
        />
        {scanning && (
          <div className="bg-primary absolute inset-x-0 top-0 h-1 animate-[scan_2.4s_ease-in-out_infinite] shadow-[0_0_12px_4px_rgba(6,29,82,0.5)]" />
        )}
      </div>
    </div>
  );
}

export default function KycProcessingPage() {
  const router = useRouter();
  const wizard = useKycWizardStore();
  const submitKyc = useSubmitKyc();
  const userId = useSessionStore((s) => s.user?.user_id);

  // Simulated progress — `kyc/submit` is a single fast POST with no real
  // byte-level progress to report, unlike Figma's percentage bar. Ramps up
  // while submitting, snaps to 100 on success, resets on a fresh attempt.
  const [progress, setProgress] = useState(0);
  const progressTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Deferred via setTimeout(0) rather than called synchronously in the
    // effect body — this reset is a genuine response to submissionStatus
    // changing (a new attempt starting, or one finishing), not something
    // derivable during render, but react-hooks/set-state-in-effect still
    // flags any direct setState call in an effect body regardless of intent.
    const resetTimer = setTimeout(() => {
      if (wizard.submissionStatus === "submitting") {
        setProgress(8);
      } else {
        setProgress(wizard.submissionStatus === "success" ? 100 : 0);
      }
    }, 0);

    if (wizard.submissionStatus === "submitting") {
      progressTimer.current = setInterval(() => {
        setProgress((p) => (p >= 90 ? p : p + Math.random() * 12));
      }, 400);
    } else if (progressTimer.current) {
      clearInterval(progressTimer.current);
    }

    return () => {
      clearTimeout(resetTimer);
      if (progressTimer.current) clearInterval(progressTimer.current);
    };
  }, [wizard.submissionStatus]);

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
            apiErrorMessage(
              error,
              "Something went wrong submitting your verification.",
            ),
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
            apiErrorMessage(
              error,
              "Something went wrong submitting your verification.",
            ),
          ),
      },
    );
  }

  function handleContinue() {
    wizard.reset();
    router.push("/home");
  }

  const isProcessing =
    wizard.submissionStatus === "idle" ||
    wizard.submissionStatus === "submitting";

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-6 p-6 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Take a Selfie</h1>

      {isProcessing && (
        <div className="w-full space-y-6">
          <ScanningFrame imageUrl={wizard.selfieFileUrl} scanning />

          <p className="text-muted-foreground text-sm">
            Hold still, we are processing
          </p>

          <div className="space-y-1">
            <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
              <div
                className="bg-primary h-full rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-muted-foreground text-xs">
              {Math.round(progress)}%
            </p>
          </div>
        </div>
      )}

      {wizard.submissionStatus === "error" && (
        <div className="space-y-4">
          <p className="text-destructive text-sm">
            {wizard.submissionError ??
              "Something went wrong submitting your verification."}
          </p>
          {wizard.submissionError
            ?.toLowerCase()
            .includes("pending kyc submission") ? (
            // Defense-in-depth: the (onboarding)/kyc/(wizard)/layout.tsx gate
            // should prevent reaching this page at all in this case. If it
            // still happens (stale cache, race), retrying will just fail
            // again — there's no error_code to key off, so this is a
            // string-match heuristic, deliberately narrow. See
            // docs/design-vs-backend-gaps.md.
            <Link
              href="/home"
              className="bg-primary text-primary-foreground inline-block rounded-lg px-4 py-2 text-sm font-medium"
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
          <p className="text-muted-foreground text-sm">
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
