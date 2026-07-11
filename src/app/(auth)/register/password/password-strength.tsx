import { cn } from "@/lib/utils/cn";

const REQUIREMENTS = [
  { label: "6 minimum characters", test: (v: string) => v.length >= 6 },
  { label: "1 upper case", test: (v: string) => /[A-Z]/.test(v) },
  { label: "1 number", test: (v: string) => /[0-9]/.test(v) },
  { label: "1 symbol", test: (v: string) => /[^a-zA-Z0-9]/.test(v) },
];

/**
 * Strength label derived from how many requirements pass. Figma shows exactly
 * three labels (Weak/Fair/Strong) with no documented thresholds — this mapping
 * is an inference, not a confirmed spec.
 */
function strengthLabel(password: string): "Weak" | "Fair" | "Strong" | null {
  if (!password) return null;
  const passed = REQUIREMENTS.filter((r) => r.test(password)).length;
  if (passed >= 4) return "Strong";
  if (passed >= 2) return "Fair";
  return "Weak";
}

export function PasswordStrength({ password }: { password: string }) {
  const label = strengthLabel(password);

  return (
    <div className="space-y-2">
      <ul className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
        {REQUIREMENTS.map((req) => {
          const met = req.test(password);
          return (
            <li
              key={req.label}
              className={cn(
                "flex items-center gap-1.5",
                met ? "text-success" : "text-muted-foreground",
              )}
            >
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  met ? "bg-success" : "bg-border",
                )}
              />
              {req.label}
            </li>
          );
        })}
      </ul>
      {label && (
        <p
          className={cn(
            "text-xs font-medium",
            label === "Strong" && "text-success",
            label === "Fair" && "text-muted-foreground",
            label === "Weak" && "text-destructive",
          )}
        >
          ({label})
        </p>
      )}
    </div>
  );
}
