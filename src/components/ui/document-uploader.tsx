"use client";

import { useRef, useState } from "react";
import { FileText, UploadCloud, X } from "lucide-react";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { formatFileSize } from "@/lib/utils/format";

export interface TypedDocument {
  file: File;
  /** One of the backend's allowed `document_type` slugs. */
  type: string;
}

/**
 * Ownership-document uploader built around "classify, then add" — the
 * opposite of the photo uploader's bulk-drop, because each ownership document
 * is usually a *different* legal type (a C of O, a survey plan, a deed).
 *
 * A type picker is visible up front (so it's clear from the start that every
 * file needs a category), you pick the type then add the file, repeat. Added
 * files still show an editable type on their row, so a wrong pick is a quick
 * fix, not a delete-and-redo. State is owned by the parent (`TypedDocument[]`).
 */
export function DocumentUploader({
  documents,
  onChange,
  types,
  accept = ".pdf,.jpg,.jpeg,.png",
  hint = "PDF, JPG, or PNG",
}: {
  documents: TypedDocument[];
  onChange: (documents: TypedDocument[]) => void;
  types: { value: string; label: string }[];
  accept?: string;
  hint?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  // The type the *next* added file(s) will get. Persists so several files of
  // the same type can be added in a row without re-picking.
  const [nextType, setNextType] = useState(types[0]?.value ?? "");

  function addFiles(list: FileList | null) {
    if (!list) return;
    const added = Array.from(list).map((file) => ({ file, type: nextType }));
    onChange([...documents, ...added]);
  }

  function setRowType(index: number, type: string) {
    onChange(documents.map((doc, i) => (i === index ? { ...doc, type } : doc)));
  }

  const nextTypeLabel = types.find((t) => t.value === nextType)?.label ?? "document";

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple
        className="hidden"
        onChange={(e) => {
          addFiles(e.target.files);
          e.target.value = "";
        }}
      />

      {/* Composer: pick the type first, then add the file(s) for it. */}
      <div className="space-y-3 rounded-xl border border-dashed border-input bg-input-background p-4">
        <div className="space-y-1.5">
          <Label htmlFor="doc-type">Document type</Label>
          <Select
            id="doc-type"
            value={nextType}
            onChange={(e) => setNextType(e.target.value)}
          >
            {types.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </Select>
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex w-full flex-col items-center gap-1.5 rounded-lg border border-input bg-background py-5 text-sm text-muted-foreground"
        >
          <UploadCloud className="size-5" />
          <span>
            Add <span className="font-medium text-foreground">{nextTypeLabel}</span> file
          </span>
          <span className="text-xs">{hint}</span>
        </button>
      </div>

      {documents.length > 0 && (
        <ul className="space-y-2">
          {documents.map((doc, i) => (
            <li
              key={`${doc.file.name}-${i}`}
              className="flex flex-wrap items-center gap-3 rounded-lg bg-muted px-3 py-2 text-sm"
            >
              <FileText className="size-4 shrink-0 text-muted-foreground" />
              <span className="min-w-0 flex-1 truncate">{doc.file.name}</span>
              <span className="shrink-0 text-xs text-muted-foreground">
                {formatFileSize(doc.file.size)}
              </span>
              {/* Editable per-row type — quick fix for a wrong pick. */}
              <Select
                value={doc.type}
                onChange={(e) => setRowType(i, e.target.value)}
                className="h-8 w-auto shrink-0 py-0 text-xs"
                aria-label={`Document type for ${doc.file.name}`}
              >
                {types.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </Select>
              <button
                type="button"
                onClick={() => onChange(documents.filter((_, idx) => idx !== i))}
                aria-label={`Remove ${doc.file.name}`}
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
