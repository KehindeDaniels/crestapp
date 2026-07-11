"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-6 p-6">
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

      <div className="rounded-xl border p-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div>
              <Label className="mb-2 block">Choose an ID to verify your account</Label>
              <div className="flex gap-1 rounded-lg bg-muted p-1">
                {KYC_DOCUMENT_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setDocumentType(type)}
                    className={cn(
                      "flex-1 rounded-md px-2 py-2 text-xs font-medium transition-colors",
                      documentType === type
                        ? "bg-background text-primary shadow-xs"
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
              <Input id="country" defaultValue="Nigeria" />
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
          </div>

          <div className="space-y-4">
            <FileUploadField
              label="Upload Front ID Card"
              purpose="kyc_document"
              fileName={frontFileName}
              onUploaded={(url, name) => {
                setFrontFileUrl(url);
                setFrontFileName(name);
              }}
            />
            <FileUploadField
              label="Upload Back ID Card"
              purpose="kyc_document"
              fileName={backFileName}
              onUploaded={(url, name) => {
                setBackFileUrl(url);
                setBackFileName(name);
              }}
            />
          </div>
        </div>
      </div>

      <Button className="w-full" disabled={!canContinue} onClick={handleContinue}>
        Continue
      </Button>
    </div>
  );
}
