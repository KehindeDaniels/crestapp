"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils/cn";
import {
  useListPropertyWizardStore,
  listPropertyDetailsSchema,
  LIST_PROPERTY_PURPOSES,
  LIST_PROPERTY_TYPES,
  type ListPropertyDetailsInput,
} from "@/features/properties";

export default function ListPropertyDetailsPage() {
  const router = useRouter();
  const wizard = useListPropertyWizardStore();

  const form = useForm<ListPropertyDetailsInput>({
    resolver: zodResolver(listPropertyDetailsSchema),
    defaultValues: {
      purpose: wizard.purpose ?? "sale",
      propertyType: wizard.propertyType ?? "apartment",
      bedrooms: wizard.bedrooms ? String(wizard.bedrooms) : "0",
      bathrooms: wizard.bathrooms ? String(wizard.bathrooms) : "0",
      squareMeters: wizard.squareMeters ? String(wizard.squareMeters) : "",
      description: wizard.description,
    },
  });
  const purpose = useWatch({ control: form.control, name: "purpose" });
  const propertyType = useWatch({ control: form.control, name: "propertyType" });
  const isLand = propertyType === "land";

  function onSubmit(values: ListPropertyDetailsInput) {
    wizard.setDetails({
      purpose: values.purpose,
      propertyType: values.propertyType,
      description: values.description,
      squareMeters: Number(values.squareMeters),
      // Land has no bedroom/bathroom fields in the design — not collected, sent as 0.
      bedrooms: isLand ? 0 : Number(values.bedrooms),
      bathrooms: isLand ? 0 : Number(values.bathrooms),
    });
    router.push("/properties/new/media");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 sm:space-y-8 sm:p-6 lg:p-10">
      <div className="flex items-center justify-between">
        <Link
          href="/home"
          className="flex items-center gap-1 text-sm font-medium text-muted-foreground"
        >
          <ChevronLeft className="size-4" />
          Cancel
        </Link>
        <p className="text-xs font-medium text-muted-foreground">Step 1 of 3</p>
      </div>

      <div className="space-y-1">
        <h1 className="text-xl font-semibold sm:text-2xl">List your property</h1>
        <p className="text-sm text-muted-foreground">
          Tell us what you&apos;re listing and its basic details.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="purpose"
            render={({ field }) => (
              <FormItem className="gap-3">
                <FormLabel>Purpose</FormLabel>
                <div className="flex h-13.5 items-center gap-2 rounded-xl bg-muted p-1.5">
                  {LIST_PROPERTY_PURPOSES.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => field.onChange(opt.value)}
                      className={cn(
                        "flex-1 rounded-md py-2 text-sm font-medium transition-colors",
                        purpose === opt.value
                          ? "bg-background font-semibold text-foreground shadow-sm"
                          : "text-muted-foreground",
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="propertyType"
            render={({ field }) => (
              <FormItem className="gap-3">
                <FormLabel>Property Type</FormLabel>
                <FormControl>
                  <Select size="xl" {...field}>
                    {LIST_PROPERTY_TYPES.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {!isLand && (
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="bedrooms"
                render={({ field }) => (
                  <FormItem className="gap-3">
                    <FormLabel>Bedrooms</FormLabel>
                    <FormControl>
                      <Input size="xl" type="number" min={0} placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bathrooms"
                render={({ field }) => (
                  <FormItem className="gap-3">
                    <FormLabel>Bathrooms</FormLabel>
                    <FormControl>
                      <Input size="xl" type="number" min={0} placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          <FormField
            control={form.control}
            name="squareMeters"
            render={({ field }) => (
              <FormItem className="gap-3">
                <FormLabel>{isLand ? "Land Size (sqm)" : "Property Size (sqm)"}</FormLabel>
                <FormControl>
                  <Input size="xl" type="number" min={1} placeholder="e.g. 240" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="gap-3">
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe the property — features, condition, what makes it stand out…"
                    rows={5}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" size="xl" className="w-full">
            Continue
          </Button>
        </form>
      </Form>
    </div>
  );
}
