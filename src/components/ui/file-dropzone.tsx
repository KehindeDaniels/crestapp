"use client";

import { useRef } from "react";
import { FileText, UploadCloud, X } from "lucide-react";
import { formatFileSize } from "@/lib/utils/format";

/**
 * A plain growing list of files with an add-dropzone and per-row remove —
 * the same interaction model as the List Property wizard's document/media
 * uploaders (see `properties/new/documents/page.tsx`), extracted so the
 * shortlet create flow can reuse the exact design. State is owned by the
 * parent (a `File[]`), so the parent controls when/how the files are actually
 * uploaded.
 */
export function FileDropzone({
  files,
  onChange,
  accept = ".pdf,.jpg,.jpeg,.png",
  multiple = true,
  hint = "Tap to upload PDF, JPG, or PNG",
}: {
  files: File[];
  onChange: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  hint?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  function addFiles(list: FileList | null) {
    if (!list) return;
    // Snapshot to a real array now — `list` is a live reference to the input's
    // FileList, which we invalidate right after via `value = ""`.
    const next = [...files, ...Array.from(list)];
    onChange(next);
  }

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => {
          addFiles(e.target.files);
          e.target.value = "";
        }}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex w-full flex-col items-center gap-2 rounded-xl border border-dashed border-input bg-input-background py-8 text-sm text-muted-foreground"
      >
        <UploadCloud className="size-6" />
        Upload Files
        <span className="text-xs">{hint}</span>
      </button>

      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((file, i) => (
            <li
              key={`${file.name}-${i}`}
              className="flex items-center gap-3 rounded-lg bg-muted px-3 py-2 text-sm"
            >
              <FileText className="size-4 shrink-0 text-muted-foreground" />
              <span className="min-w-0 flex-1 truncate">{file.name}</span>
              <span className="shrink-0 text-xs text-muted-foreground">
                {formatFileSize(file.size)}
              </span>
              <button
                type="button"
                onClick={() => onChange(files.filter((_, idx) => idx !== i))}
                aria-label={`Remove ${file.name}`}
                className="shrink-0 text-muted-foreground hover:text-destructive"
              >
                <X className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
