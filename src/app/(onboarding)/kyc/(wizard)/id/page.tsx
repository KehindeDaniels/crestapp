"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckSquare2, ChevronDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils/cn";
import { formatFileSize } from "@/lib/utils/format";
import {
  FileUploadField,
  useKycWizardStore,
  KYC_DOCUMENT_TYPES,
  type KycDocumentType,
} from "@/features/kyc";

const DOCUMENT_TYPE_LABELS: Record<KycDocumentType, string> = {
  national_id: "National ID card",
  drivers_license: "Driver License",
  international_passport: "International Passport",
};

/** A "Front Side"/"Back Side" status row — mirrors what's happening in the
 * matching drop zone on the right. There's no real byte-level upload
 * progress here (the fetch-based upload client doesn't expose it) — this is
 * a simplified pending/done state, not a literal percentage, unlike the
 * animated progress rings shown in the Figma reference. */
function FileStatusRow({ file, uploaded }: { file: File; uploaded: boolean }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border p-3">
      <CheckSquare2 className="size-5 shrink-0 text-primary" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{file.name}</p>
        <p className="text-xs text-muted-foreground">
          {formatFileSize(file.size)} · {uploaded ? "Uploaded" : "Uploading…"}
        </p>
      </div>
      {uploaded ? (
        <span className="size-5 shrink-0 rounded-full border-2 border-success" />
      ) : (
        <Loader2 className="size-5 shrink-0 animate-spin text-muted-foreground" />
      )}
    </div>
  );
}

export default function KycIdUploadPage() {
  const router = useRouter();
  const setIdDocument = useKycWizardStore((s) => s.setIdDocument);

  const [documentType, setDocumentType] = useState<KycDocumentType>("national_id");
  const [documentNumber, setDocumentNumber] = useState("");
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [frontFileUrl, setFrontFileUrl] = useState("");
  const [frontFileName, setFrontFileName] = useState("");
  const [backFile, setBackFile] = useState<File | null>(null);
  const [backFileUrl, setBackFileUrl] = useState("");
  const [backFileName, setBackFileName] = useState("");

  const canContinue =
    documentNumber.trim().length > 0 && Boolean(frontFileUrl) && Boolean(backFileUrl);

  function handleContinue() {
    setIdDocument({
      documentType,
      documentNumber: documentNumber.trim(),
      frontFileUrl,
      frontFileName,
      backFileUrl,
      backFileName,
    });
    router.push("/kyc/selfie");
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 p-6 sm:justify-center">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Upload a valid ID</h1>
          <p className="text-sm text-muted-foreground">
            Make sure the details are clear and readable.
          </p>
        </div>
        <span className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground">
          1/2
        </span>
      </div>

      <div className="rounded-2xl bg-muted p-6 sm:p-8">
        {/* grid-cols-1 (= minmax(0,1fr)) is required on mobile — without it the
            single column is auto-sized to content, so a long filename overflows
            the viewport horizontally. */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="space-y-5">
            <div>
              <Label className="mb-2 block">Choose an ID to verify your account</Label>
              <div className="flex flex-wrap gap-4">
                {KYC_DOCUMENT_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setDocumentType(type)}
                    className={cn(
                      "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                      documentType === type
                        ? "border border-primary text-primary"
                        : "text-muted-foreground",
                    )}
                  >
                    {DOCUMENT_TYPE_LABELS[type]}
                  </button>
                ))}
              </div>
            </div>

            {/* Cosmetic only — kyc/submit has no country field, and GET /platform/configuration/countries has no documented response shape. Not wired to any endpoint. */}
            <div>
              <Label htmlFor="country" className="mb-2 block">
                Choose your Country/Region
              </Label>
              <div className="relative">
                <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-base">
                  🇳🇬
                </span>
                <Input id="country" defaultValue="Nigeria" className="pr-9 pl-9" readOnly />
                <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>

            <div>
              <Label className="mb-2 block">ID Type</Label>
              <div className="flex items-center justify-between rounded-lg bg-background px-3 py-2.5">
                <span className="text-sm text-muted-foreground">
                  {DOCUMENT_TYPE_LABELS[documentType]}
                </span>
                <CheckSquare2 className="size-4 text-muted-foreground" />
              </div>
            </div>

            <div>
              <Label htmlFor="document_number" className="mb-2 block">
                Document Number
              </Label>
              <Input
                id="document_number"
                placeholder="Enter your ID number"
                value={documentNumber}
                onChange={(e) => setDocumentNumber(e.target.value)}
              />
            </div>

            {frontFile && (
              <div>
                <Label className="mb-2 block">Front Side</Label>
                <FileStatusRow file={frontFile} uploaded={Boolean(frontFileUrl)} />
              </div>
            )}
            {backFile && (
              <div>
                <Label className="mb-2 block">Back Side</Label>
                <FileStatusRow file={backFile} uploaded={Boolean(backFileUrl)} />
              </div>
            )}

            <Button
              type="button"
              className="w-full"
              disabled={!canContinue}
              onClick={handleContinue}
            >
              Continue
            </Button>
          </div>

          <div className="space-y-4">
            <FileUploadField
              label="Upload Front ID Card"
              purpose="kyc_document_front"
              fileName={frontFileName}
              onFileSelected={setFrontFile}
              onUploaded={(url, name) => {
                setFrontFileUrl(url);
                setFrontFileName(name);
              }}
            />
            <FileUploadField
              label="Upload Back ID Card"
              purpose="kyc_document_back"
              fileName={backFileName}
              onFileSelected={setBackFile}
              onUploaded={(url, name) => {
                setBackFileUrl(url);
                setBackFileName(name);
              }}
            />
            <p className="text-center text-sm font-medium text-muted-foreground underline">
              Need Help?
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
