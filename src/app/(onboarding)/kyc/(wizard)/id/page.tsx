"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils/cn";
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

export default function KycIdUploadPage() {
  const router = useRouter();
  const setIdDocument = useKycWizardStore((s) => s.setIdDocument);

  const [documentType, setDocumentType] = useState<KycDocumentType>("national_id");
  const [documentNumber, setDocumentNumber] = useState("");
  const [frontFileUrl, setFrontFileUrl] = useState("");
  const [frontFileName, setFrontFileName] = useState("");
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

      <div className="rounded-2xl bg-muted p-4 sm:p-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <section className="space-y-5 rounded-xl border bg-background p-5 sm:p-6">
            <div>
              <p className="text-sm font-semibold text-primary">Step 1</p>
              <h2 className="mt-1 text-lg font-semibold">Tell us about your ID</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Select the document you&apos;ll upload and enter its number.
              </p>
            </div>
            <div>
              <Label className="mb-2 block">Document type</Label>
              <div className="grid gap-2">
                {KYC_DOCUMENT_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setDocumentType(type)}
                    aria-pressed={documentType === type}
                    className={cn(
                      "flex min-h-11 items-center justify-between rounded-lg border px-3 text-left text-sm font-medium transition-colors",
                      documentType === type
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-input text-muted-foreground hover:border-primary/50 hover:text-foreground",
                    )}
                  >
                    {DOCUMENT_TYPE_LABELS[type]}
                    {documentType === type && <CheckCircle2 className="size-4 shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="document_number">Document number</Label>
              <Input
                id="document_number"
                className="h-11 bg-background"
                placeholder="Enter your ID number"
                value={documentNumber}
                onChange={(e) => setDocumentNumber(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Enter the number exactly as it appears on your document.
              </p>
            </div>
          </section>

          <section className="space-y-5 rounded-xl border bg-background p-5 sm:p-6">
            <div>
              <p className="text-sm font-semibold text-primary">Step 2</p>
              <h2 className="mt-1 text-lg font-semibold">Upload both sides</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Add clear photos of the front and back of your {DOCUMENT_TYPE_LABELS[documentType]}.
              </p>
            </div>
            <div className="space-y-4">
            <FileUploadField
              label="Upload Front ID Card"
              purpose="kyc_document_front"
              fileName={frontFileName}
              onUploaded={(url, name) => {
                setFrontFileUrl(url);
                setFrontFileName(name);
              }}
            />
            <FileUploadField
              label="Upload Back ID Card"
              purpose="kyc_document_back"
              fileName={backFileName}
              onUploaded={(url, name) => {
                setBackFileUrl(url);
                setBackFileName(name);
              }}
            />
            </div>
            <Button
              type="button"
              className="h-11 w-full"
              disabled={!canContinue}
              onClick={handleContinue}
            >
              Continue to selfie
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Both sides must finish uploading before you can continue.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
