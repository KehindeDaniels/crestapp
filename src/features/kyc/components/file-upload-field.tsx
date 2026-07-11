"use client";

import { useRef } from "react";
import { CheckCircle2, Loader2, Upload } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { isApiError } from "@/lib/api/errors";
import { useUploadFile } from "../hooks";

/** Upload-on-select field styled as a drop zone (matches the Figma "drag a file here or browse" pattern). Real drag-and-drop is not implemented — click-to-browse only. */
export function FileUploadField({
  label,
  purpose,
  fileName,
  onUploaded,
  accept = "image/*,.pdf",
  capture,
}: {
  label: string;
  purpose: string;
  fileName: string;
  onUploaded: (url: string, fileName: string) => void;
  accept?: string;
  /** "user" triggers the front-facing camera on mobile browsers instead of the file picker. No real getUserMedia video capture is implemented — simplification, not a live camera preview. */
  capture?: "user" | "environment";
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const upload = useUploadFile();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    upload.mutate(
      { file, purpose },
      { onSuccess: (url) => onUploaded(url, file.name) },
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex w-full flex-col items-center gap-2 rounded-lg border border-dashed p-6 text-center transition-colors hover:bg-muted",
          fileName && "border-success bg-muted",
        )}
      >
        {upload.isPending ? (
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        ) : fileName ? (
          <CheckCircle2 className="size-6 text-success" />
        ) : (
          <Upload className="size-6 text-muted-foreground" />
        )}
        <span className="text-sm font-medium">{label}</span>
        <span className="text-xs text-muted-foreground">
          {upload.isPending
            ? "Uploading…"
            : fileName || "Drag a file here or browse for a file to upload"}
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        capture={capture}
        className="hidden"
        onChange={handleChange}
      />
      {upload.isError && (
        <p className="mt-1 text-sm text-destructive">
          {isApiError(upload.error) ? upload.error.message : "Upload failed."}
        </p>
      )}
    </div>
  );
}
