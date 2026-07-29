"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";

/**
 * Image uploader with a thumbnail-preview grid + a dashed "Browse" tile —
 * the same design as the List Property wizard's media step
 * (`properties/new/media/page.tsx`), extracted so the shortlet create flow
 * reuses the exact look. State is owned by the parent (`File[]`); the parent
 * decides when to actually upload. Previews are real `blob:` URLs, revoked on
 * unmount by each tile.
 */
export function ImageDropzone({
  files,
  onChange,
  hint = "Max 5mb image size are allowed",
}: {
  files: File[];
  onChange: (files: File[]) => void;
  hint?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  function addFiles(list: FileList | null) {
    if (!list) return;
    // Snapshot now — `list` is a live FileList the caller invalidates via `value = ""`.
    onChange([...files, ...Array.from(list)]);
  }

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          addFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <div className="grid grid-cols-2 gap-3">
        {files.map((file, i) => (
          <ImagePreviewTile
            key={`${file.name}-${i}`}
            file={file}
            onRemove={() => onChange(files.filter((_, idx) => idx !== i))}
          />
        ))}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex aspect-video flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-input bg-input-background p-3 text-center text-xs text-muted-foreground"
        >
          <ImagePlus className="size-6" />
          <span>
            Drag your image or <span className="text-primary">Browse</span>
          </span>
          <span className="text-[10px]">{hint}</span>
        </button>
      </div>
    </div>
  );
}

function ImagePreviewTile({ file, onRemove }: { file: File; onRemove: () => void }) {
  const [url] = useState(() => URL.createObjectURL(file));
  useEffect(() => () => URL.revokeObjectURL(url), [url]);

  return (
    <div className="relative aspect-video overflow-hidden rounded-xl bg-muted">
      {/* eslint-disable-next-line @next/next/no-img-element -- transient blob: URL, next/image can't optimize these anyway. */}
      <img src={url} alt="" className="size-full object-cover" />
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${file.name}`}
        className="absolute top-1.5 right-1.5 flex size-6 items-center justify-center rounded-full bg-black/60 text-white"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}
