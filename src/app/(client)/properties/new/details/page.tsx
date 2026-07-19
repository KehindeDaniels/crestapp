"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { ChevronLeft, Plus, X } from "lucide-react";
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
import { useSessionStore } from "@/features/auth";
import type { ListablePurpose } from "@/features/properties";
import {
  useListPropertyWizardStore,
  listPropertyDetailsSchema,
  LIST_PROPERTY_PURPOSE_CARDS,
  LIST_PROPERTY_TYPES,
  APARTMENT_FEATURES,
  LAND_FEATURES,
  type ListPropertyDetailsInput,
} from "@/features/properties";

/**
 * Step 1 of 4. Rebuilt against a real Figma pull (node 1422:6881 in file
 * `1jtfoprMGUFfoo3CBzhjMV`, "Listing-For Sale (Apartment)"), not screenshot
 * inference. Real layout: purpose is 3 large cards (not a segmented tab),
 * and Property Details / Description+Features are two separate cards
 * side by side, not one stacked form. The Figma "Continue" button sits
 * under the right column only — deliberately made full-width here instead,
 * better for mobile and no real UX reason to keep the asymmetry.
 *
 * Purpose is restricted by the user's account role: `landlord` can only
 * pick Rent, `seller` can only pick Sale — confirmed live that a `landlord`
 * account gets a 403 on `/api/properties/sale` (a real seeded Sale
 * property's owner has role `seller`). This guards the mistake before
 * wasting the user's time filling out the whole wizard.
 */
export default function ListPropertyDetailsPage() {
  const router = useRouter();
  const wizard = useListPropertyWizardStore();
  const role = useSessionStore((s) => s.user?.role);
  const allowedPurpose: ListablePurpose | null =
    role === "landlord" ? "rent" : role === "seller" ? "sale" : null;

  useEffect(() => {
    if (!allowedPurpose) router.replace("/properties/new");
    // Mount-only guard — same pattern as the register wizard's step guards.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const form = useForm<ListPropertyDetailsInput>({
    resolver: zodResolver(listPropertyDetailsSchema),
    defaultValues: {
      purpose: wizard.purpose ?? allowedPurpose ?? "sale",
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
  const presetFeatures = isLand ? LAND_FEATURES : APARTMENT_FEATURES;

  if (!allowedPurpose) return null;

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
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:space-y-8 sm:p-6 lg:p-10">
      <div className="flex items-center justify-between">
        <Link
          href="/home"
          className="flex items-center gap-1 text-sm font-medium text-muted-foreground"
        >
          <ChevronLeft className="size-4" />
          Cancel
        </Link>
        <p className="text-xs font-medium text-muted-foreground">Step 1 of 4</p>
      </div>

      <div className="space-y-1">
        <h1 className="text-xl font-semibold sm:text-2xl">List Your Property</h1>
        <p className="text-sm text-muted-foreground">
          Connect directly with verified buyers and renters. Listings are reviewed before
          approval.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="purpose"
            render={({ field }) => (
              <FormItem className="gap-3">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {LIST_PROPERTY_PURPOSE_CARDS.map((card) => {
                    const Icon = card.icon;
                    const isSelected = purpose === card.value;
                    // Airbnb: no endpoint exists at all. Sale/Rent: gated by the account's own role.
                    const isEnabled = card.enabled && card.value === allowedPurpose;
                    const disabledReason = !card.enabled
                      ? `${card.label} — coming soon`
                      : `Your account (${role}) can't list a ${card.label.toLowerCase()}`;
                    return (
                      <button
                        key={card.value}
                        type="button"
                        disabled={!isEnabled}
                        title={isEnabled ? undefined : disabledReason}
                        onClick={() => isEnabled && field.onChange(card.value as typeof field.value)}
                        className={cn(
                          "flex items-start gap-3 rounded-xl border bg-background p-4 text-left transition-shadow",
                          isSelected ? "shadow-md" : "border-border",
                          !isEnabled && "cursor-not-allowed opacity-50",
                        )}
                      >
                        <Icon className="size-8 shrink-0 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-semibold">{card.label}</p>
                          <p className="text-xs text-muted-foreground">{card.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="space-y-6">
              <div className="space-y-5 rounded-2xl border p-5">
                <div className="space-y-1">
                  <h2 className="text-base font-semibold">Select property type</h2>
                  <p className="text-sm text-muted-foreground">
                    Choose the appropriate type that best matches your property
                  </p>
                </div>
                <FormField
                  control={form.control}
                  name="propertyType"
                  render={({ field }) => (
                    <FormItem className="gap-3">
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
              </div>

              <div className="space-y-5 rounded-2xl border p-5">
                <div className="space-y-1">
                  <h2 className="text-base font-semibold">
                    {isLand ? "Land Details" : "Properties Details"}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Provide accurate details to help {isLand ? "buyers" : "renters"} understand
                    the property
                  </p>
                </div>

                {!isLand && (
                  <>
                    <p className="text-sm font-semibold">Rooms</p>
                    <FormField
                      control={form.control}
                      name="bedrooms"
                      render={({ field }) => (
                        <FormItem className="gap-3">
                          <FormLabel>Bedroom</FormLabel>
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
                          <FormLabel>Bathroom</FormLabel>
                          <FormControl>
                            <Input size="xl" type="number" min={0} placeholder="0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                <FormField
                  control={form.control}
                  name="squareMeters"
                  render={({ field }) => (
                    <FormItem className="gap-3">
                      <div className="flex items-center justify-between">
                        <FormLabel>{isLand ? "Land Size" : "Property Size"}</FormLabel>
                        <span className="text-xs text-muted-foreground">sqm</span>
                      </div>
                      <FormControl>
                        <Input size="xl" type="number" min={1} placeholder="e.g. 240" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {isLand && (
                  <div className="space-y-3">
                    <FormLabel>Number of Plots</FormLabel>
                    <Input
                      size="xl"
                      disabled
                      placeholder="0"
                      title="Not collected — no matching backend field on property creation"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-5 rounded-2xl border p-5">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="gap-3">
                    <FormLabel>Property Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Briefly describe property"
                        rows={5}
                        maxLength={200}
                        {...field}
                      />
                    </FormControl>
                    <div className="flex justify-end">
                      <span className="text-xs text-muted-foreground">
                        {field.value.length}/200
                      </span>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FeaturesPicker presetFeatures={presetFeatures} />
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
 * Replaces the earlier prefilled-checkbox list — per feedback, users should
 * be able to pick from common features OR type their own. Fully disabled:
 * no backend field exists for property features at all (confirmed by an
 * exhaustive search of the Postman collection), so this is "build it
 * complete, just non-functional" rather than a working feature, matching
 * every other confirmed-absent field in this wizard.
 */
function FeaturesPicker({ presetFeatures }: { presetFeatures: string[] }) {
  const [customFeature, setCustomFeature] = useState("");

  return (
    <div className="space-y-3" title="No backend field exists for property features yet">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Property Features</p>
        <span className="text-xs text-muted-foreground">Coming soon</span>
      </div>

      <Select size="xl" disabled defaultValue="">
        <option value="">Add a common feature…</option>
        {presetFeatures.map((feature) => (
          <option key={feature} value={feature}>
            {feature}
          </option>
        ))}
      </Select>

      <div className="flex gap-2">
        <Input
          size="xl"
          disabled
          placeholder="Or type your own"
          value={customFeature}
          onChange={(e) => setCustomFeature(e.target.value)}
        />
        <Button type="button" variant="outline" size="icon-lg" disabled>
          <Plus className="size-4" />
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {presetFeatures.slice(0, 3).map((feature) => (
          <span
            key={feature}
            className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs text-muted-foreground/60"
          >
            {feature}
            <X className="size-3" />
          </span>
        ))}
      </div>
    </div>
  );
}
