"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ChevronLeft, ImagePlus, Video, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  useListPropertyWizardStore,
  listPropertyMediaSchema,
  LIST_PROPERTY_PURPOSE_CARDS,
  type ListPropertyMediaInput,
} from "@/features/properties";

/**
 * Step 2 of 3. Rebuilt against a real Figma pull (nodes 1458:1806 [Sale] and
 * 1465:3487 [Rent] in file `1jtfoprMGUFfoo3CBzhjMV`), not screenshot
 * inference. Purpose-specific extras (Price negotiable for Sale; Payment
 * Period + Additional Fees for Rent) and Landmark are shown per the design
 * but disabled — none of them exist in the confirmed create payload. Video
 * upload is shown but disabled too — the media endpoint's only confirmed
 * `media_type` example is "image". See docs/design-vs-backend-gaps.md.
 */
export default function ListPropertyMediaPage() {
  const router = useRouter();
  const wizard = useListPropertyWizardStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<File[]>(wizard.images);
  const isRent = wizard.purpose === "rent";

  useEffect(() => {
    if (!wizard.detailsComplete) router.replace("/properties/new/details");
    // Mount-only guard — same pattern as the register wizard's step guards.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const form = useForm<ListPropertyMediaInput>({
    resolver: zodResolver(listPropertyMediaSchema),
    defaultValues: {
      title: wizard.title,
      price: wizard.price ? String(wizard.price) : "",
      locationAddress: wizard.locationAddress,
      city: wizard.city,
      state: wizard.state,
    },
  });

  function addFiles(files: FileList | null) {
    if (!files) return;
    setImages((prev) => [...prev, ...Array.from(files)]);
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  function onSubmit(values: ListPropertyMediaInput) {
    wizard.setMedia({ ...values, price: Number(values.price), images });
    router.push("/properties/new/review");
  }

  if (!wizard.detailsComplete) return null;

  return (
    <div className="max-w-8xl mx-auto space-y-6 p-4 sm:space-y-8 sm:p-6 lg:p-10">
      {/* Persistent purpose row — read-only here, only step 1 lets you change it. */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {LIST_PROPERTY_PURPOSE_CARDS.map((card) => {
          const Icon = card.icon;
          const isSelected = wizard.purpose === card.value;
          return (
            <div
              key={card.value}
              className={`bg-background flex items-start gap-3 rounded-xl border p-4 ${
                isSelected ? "shadow-md" : "border-border opacity-50"
              }`}
            >
              <Icon className="text-muted-foreground size-8 shrink-0" />
              <div>
                <p className="text-sm font-semibold">{card.label}</p>
                <p className="text-muted-foreground text-xs">
                  {card.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between">
        <Link
          href="/properties/new/details"
          className="text-muted-foreground flex items-center gap-1 text-sm font-medium"
        >
          <ChevronLeft className="size-4" />
          Back
        </Link>
        <p className="text-muted-foreground text-xs font-medium">Step 2 of 4</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="space-y-5 rounded-2xl border p-5">
              <div className="space-y-1">
                <h2 className="text-base font-semibold">
                  Price &amp; Location
                </h2>
                <p className="text-muted-foreground text-xs">
                  Choose the appropriate type that best matches your property
                </p>
              </div>

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem className="gap-3">
                    <FormLabel>Price (₦)</FormLabel>
                    <FormControl>
                      <Input
                        size="xl"
                        type="number"
                        min={1}
                        placeholder="Enter"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {isRent ? (
                <>
                  <div className="space-y-2">
                    <FormLabel>Payment Period</FormLabel>
                    <div
                      className="flex gap-4 border-b text-xs"
                      title="Not collected — no matching backend field on property creation"
                    >
                      <span className="border-foreground text-muted-foreground border-b-2 pb-2 font-medium">
                        Yearly payment
                      </span>
                      <span className="text-muted-foreground/60 pb-2">
                        Monthly payment
                      </span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <p className="text-sm font-semibold">
                      Additional Fees (Optional)
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <FormLabel className="text-xs">
                          Service Charge
                        </FormLabel>
                        <Input
                          size="xl"
                          disabled
                          placeholder="Enter"
                          title="Not collected — no matching backend field on property creation"
                        />
                      </div>
                      <div className="space-y-2">
                        <FormLabel className="text-xs">
                          Security Deposit
                        </FormLabel>
                        <Input
                          size="xl"
                          disabled
                          placeholder="Enter"
                          title="Not collected — no matching backend field on property creation"
                        />
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div
                  className="bg-muted flex items-center justify-between rounded-xl px-3 py-3"
                  title="Not collected — no matching backend field on property creation"
                >
                  <span className="text-muted-foreground text-sm">
                    Price negotiable
                  </span>
                  <div className="bg-foreground/20 h-5 w-9 shrink-0 rounded-full" />
                </div>
              )}

              <FormField
                control={form.control}
                name="locationAddress"
                render={({ field }) => (
                  <FormItem className="gap-3">
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input
                        size="xl"
                        placeholder="e.g. 31 Mega Chicken Rd"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem className="gap-3">
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input size="xl" placeholder="e.g. Lekki" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem className="gap-3">
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input size="xl" placeholder="e.g. Lagos" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-2">
                <FormLabel>Landmark (optional)</FormLabel>
                <Textarea
                  disabled
                  placeholder="E.g Near main road"
                  title="Not collected — no matching backend field on property creation"
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-3 rounded-2xl border p-5">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem className="gap-3">
                      <FormLabel>Display Title</FormLabel>
                      <FormControl>
                        <Input
                          size="xl"
                          placeholder="e.g. Beautiful 2-bedroom apartment"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-5 rounded-2xl border p-5">
                <div className="space-y-3">
                  <p className="text-sm font-semibold">Image (up to 30)</p>
                  <input
                    ref={fileInputRef}
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
                    {images.map((file, i) => (
                      <ImagePreviewTile
                        key={`${file.name}-${i}`}
                        file={file}
                        onRemove={() => removeImage(i)}
                      />
                    ))}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="border-input bg-input-background text-muted-foreground flex aspect-video flex-col items-center justify-center gap-2 rounded-xl border border-dashed p-3 text-center text-xs"
                    >
                      <ImagePlus className="size-6" />
                      <span>
                        Drag your image or{" "}
                        <span className="text-primary">Browse</span>
                      </span>
                      <span className="text-[10px]">
                        Max 5mb image size are allowed
                      </span>
                    </button>
                  </div>
                </div>

                <div
                  className="space-y-2"
                  title="Not built — the media endpoint's only confirmed media_type is 'image'"
                >
                  <p className="text-muted-foreground/60 text-sm font-semibold">
                    Video (up to 2)
                  </p>
                  <div className="border-input bg-input-background text-muted-foreground/60 flex w-full cursor-not-allowed flex-col items-center gap-2 rounded-xl border border-dashed py-8 text-sm">
                    <Video className="size-6" />
                    Upload your video or Browse
                    <span className="text-xs">
                      Max 1min video size are allowed
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Button type="submit" size="xl" className="w-full">
            Continue
          </Button>
        </form>
      </Form>
    </div>
  );
}

/**
 * Thumbnail preview grid tile — per feedback, uploaded images should show
 * an actual preview (matching the Figma grid), not just a filename in a
 * flat list. Manages its own `URL.createObjectURL`/`revokeObjectURL` since
 * each tile owns exactly one file's preview.
 */
function ImagePreviewTile({
  file,
  onRemove,
}: {
  file: File;
  onRemove: () => void;
}) {
  const [url] = useState(() => URL.createObjectURL(file));
  useEffect(() => () => URL.revokeObjectURL(url), [url]);

  return (
    <div className="bg-muted relative aspect-video overflow-hidden rounded-xl">
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
