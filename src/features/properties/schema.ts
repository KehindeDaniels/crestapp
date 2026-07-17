import { z } from "zod";

/**
 * Numeric fields stay `string` end-to-end through the form (matching the
 * native `<input type="number">`'s actual value type) rather than
 * `z.coerce.number()` — coerce gives the schema a different input vs.
 * output type, which `zodResolver`'s `Resolver<Input, Context, Output>`
 * can't reconcile with `useForm<T>`'s single-generic `Resolver<T>` shape.
 * Callers convert with `Number(...)` at the point of use (wizard store
 * setters / the final payload), keeping the form itself simple.
 */
function numberField(message: string, min = 0) {
  return z
    .string()
    .trim()
    .min(1, { error: message })
    .refine((v) => !Number.isNaN(Number(v)) && Number(v) >= min, { error: message });
}

/**
 * List Property wizard, per-step schemas. Scoped to what
 * `POST /api/properties/{rental,sale}` actually accepts (confirmed against
 * the Postman collection + the live `ApiProperty` shape in types.ts) —
 * `propertyType` is deliberately limited to "apartment" | "land", the only
 * two with a real Figma design; bedrooms/bathrooms are always present in
 * the form values (defaulted to "0", hidden for land) since the backend has
 * no separate land-details schema. See docs/design-vs-backend-gaps.md.
 */
export const listPropertyDetailsSchema = z.object({
  purpose: z.enum(["sale", "rent"], { error: "Choose a purpose" }),
  propertyType: z.enum(["apartment", "land"], { error: "Choose a property type" }),
  bedrooms: numberField("Enter a number"),
  bathrooms: numberField("Enter a number"),
  squareMeters: numberField("Enter a size", 1),
  description: z
    .string()
    .trim()
    .min(10, { error: "Add a short description (10+ characters)" }),
});
export type ListPropertyDetailsInput = z.infer<typeof listPropertyDetailsSchema>;

/**
 * Figma's single "Location" field is split into address/city/state — the
 * backend requires them separately and there's no reliable way to parse one
 * free-text string into three fields. `country` is hardcoded elsewhere
 * (not user-facing).
 */
export const listPropertyMediaSchema = z.object({
  title: z.string().trim().min(3, { error: "Enter a display title" }),
  price: numberField("Enter a price", 1),
  locationAddress: z.string().trim().min(3, { error: "Enter an address" }),
  city: z.string().trim().min(1, { error: "Enter a city" }),
  state: z.string().trim().min(1, { error: "Enter a state" }),
});
export type ListPropertyMediaInput = z.infer<typeof listPropertyMediaSchema>;
