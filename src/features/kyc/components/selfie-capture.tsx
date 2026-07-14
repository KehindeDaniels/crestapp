"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { isApiError } from "@/lib/api/errors";
import { useUploadFile } from "../hooks";
import { FileUploadField } from "./file-upload-field";

type CameraState =
  | "requesting"
  | "streaming"
  | "captured"
  | "unsupported"
  | "denied";

/**
 * Live camera capture for the KYC selfie step (getUserMedia), matching the
 * Figma design's in-app camera frame rather than a plain file picker. Falls
 * back to `FileUploadField` (the pre-existing file-input flow) when the
 * browser doesn't support `getUserMedia` or the user denies camera
 * permission — those are the only two fallback triggers, per explicit
 * product direction, not a general "camera didn't work" catch-all.
 *
 * The stream is requested once and kept open for the component's lifetime
 * (not re-requested on every retake) — "Retake" just discards the captured
 * frame and shows the still-live video again, avoiding a second permission
 * prompt / camera re-init. Camera capture itself has no confirmed Figma
 * node yet (only the idle placeholder + a separate processing/scanning
 * state were pulled) — this is a functional pass, not pixel-perfect.
 */
export function SelfieCapture({
  purpose,
  onUploaded,
}: {
  purpose: string;
  onUploaded: (url: string, fileName: string) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [state, setState] = useState<CameraState>(() =>
    typeof navigator !== "undefined" && navigator.mediaDevices
      ? "requesting"
      : "unsupported",
  );
  const [snapshotUrl, setSnapshotUrl] = useState<string | null>(null);
  const upload = useUploadFile();

  useEffect(() => {
    // Already reflected in the lazy initial state above — nothing to do,
    // and no permission prompt to trigger.
    if (!navigator.mediaDevices) return;

    let cancelled = false;
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "user" }, audio: false })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setState("streaming");
      })
      .catch(() => setState("denied"));

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (snapshotUrl) URL.revokeObjectURL(snapshotUrl);
    };
  }, [snapshotUrl]);

  function handleCapture() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        setSnapshotUrl(URL.createObjectURL(blob));
        setState("captured");
      },
      "image/jpeg",
      0.92,
    );
  }

  function handleRetake() {
    if (snapshotUrl) URL.revokeObjectURL(snapshotUrl);
    setSnapshotUrl(null);
    setState("streaming");
  }

  function handleUsePhoto() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], "selfie.jpg", { type: "image/jpeg" });
        upload.mutate(
          { file, purpose },
          { onSuccess: (url) => onUploaded(url, file.name) },
        );
      },
      "image/jpeg",
      0.92,
    );
  }

  if (state === "unsupported" || state === "denied") {
    return (
      <div>
        <p className="mb-3 text-sm text-muted-foreground">
          {state === "denied"
            ? "Camera access was denied — upload a photo instead."
            : "Your browser doesn't support camera capture — upload a photo instead."}
        </p>
        <FileUploadField
          label="Take a Selfie"
          purpose={purpose}
          fileName=""
          accept="image/*"
          capture="user"
          onUploaded={onUploaded}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-muted">
        {state === "requesting" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </div>
        )}

        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={cn(
            "size-full object-cover [transform:scaleX(-1)]",
            state !== "streaming" && "hidden",
          )}
        />

        {state === "captured" && snapshotUrl && (
          // eslint-disable-next-line @next/next/no-img-element -- object URL, next/image can't optimize a blob: source
          <img
            src={snapshotUrl}
            alt="Captured selfie"
            className="size-full object-cover"
          />
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>

      {state === "streaming" && (
        <Button type="button" className="w-full" onClick={handleCapture}>
          <Camera className="size-4" />
          Capture
        </Button>
      )}

      {state === "captured" && (
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={handleRetake}
            disabled={upload.isPending}
          >
            <RotateCcw className="size-4" />
            Retake
          </Button>
          <Button
            type="button"
            className="flex-1"
            onClick={handleUsePhoto}
            disabled={upload.isPending}
          >
            {upload.isPending ? "Uploading…" : "Use Photo"}
          </Button>
        </div>
      )}

      {upload.isError && (
        <p className="text-sm text-destructive">
          {isApiError(upload.error) ? upload.error.message : "Upload failed."}
        </p>
      )}
    </div>
  );
}
