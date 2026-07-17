"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ChevronLeft, ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { formatFileSize } from "@/lib/utils/format";
import {
  useListPropertyWizardStore,
  listPropertyMediaSchema,
  type ListPropertyMediaInput,
} from "@/features/properties";

export default function ListPropertyMediaPage() {
  const router = useRouter();
  const wizard = useListPropertyWizardStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<File[]>(wizard.images);

  useEffect(() => {
    if (!wizard.detailsComplete) router.replace("/properties/new");
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
    <div className="mx-auto max-w-2xl space-y-6 p-4 sm:space-y-8 sm:p-6 lg:p-10">
      <div className="flex items-center justify-between">
        <Link
          href="/properties/new"
          className="flex items-center gap-1 text-sm font-medium text-muted-foreground"
        >
          <ChevronLeft className="size-4" />
          Back
        </Link>
        <p className="text-xs font-medium text-muted-foreground">Step 2 of 3</p>
      </div>

      <div className="space-y-1">
        <h1 className="text-xl font-semibold sm:text-2xl">Price, location &amp; photos</h1>
        <p className="text-sm text-muted-foreground">
          Set your price, where it&apos;s located, and add some photos.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem className="gap-3">
                <FormLabel>Price (₦)</FormLabel>
                <FormControl>
                  <Input size="xl" type="number" min={1} placeholder="e.g. 5000000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="locationAddress"
            render={({ field }) => (
              <FormItem className="gap-3">
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input size="xl" placeholder="e.g. 31 Mega Chicken Rd" {...field} />
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

          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">Photos</p>
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
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full flex-col items-center gap-2 rounded-xl border border-dashed border-input bg-input-background py-8 text-sm text-muted-foreground"
            >
              <ImagePlus className="size-6" />
              Tap to add photos
            </button>

            {images.length > 0 && (
              <ul className="space-y-2">
                {images.map((file, i) => (
                  <li
                    key={`${file.name}-${i}`}
                    className="flex items-center justify-between gap-3 rounded-lg bg-muted px-3 py-2 text-sm"
                  >
                    <span className="min-w-0 truncate">{file.name}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
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

          <Button type="submit" size="xl" className="w-full">
            Continue
          </Button>
        </form>
      </Form>
    </div>
  );
}
