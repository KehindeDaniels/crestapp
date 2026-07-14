import { Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const REQUIREMENTS = [
  { label: "6 minimum characters", test: (v: string) => v.length >= 6 },
  { label: "1 upper case", test: (v: string) => /[A-Z]/.test(v) },
  { label: "1 number", test: (v: string) => /[0-9]/.test(v) },
  { label: "1 symbol", test: (v: string) => /[^a-zA-Z0-9]/.test(v) },
];

/**
 * Strength label derived from how many requirements pass. Confirmed against
 * Figma (node 1398:7558 / 1398:6568): track #edecef, neutral/empty fill
 * #605d67, unmet-circle border #9d9aa4. The colored Weak/Fair/Strong fills
 * and the "(Weak)"/"(Fair)"/"(Strong)" label were only visible in exported
 * screenshots (docs/design/screenshots/), not in the pulled node data (both
 * pulls landed on the 0%-empty variant) — approximated with the app's
 * existing destructive/success tokens rather than guessing exact hex values;
 * "Fair" has no existing token so uses a one-off amber. Thresholds (1 met =
 * Weak, 2-3 = Fair, 4 = Strong) are an inference, not a confirmed spec.
 */
function strengthLabel(password: string): "Weak" | "Fair" | "Strong" | null {
  if (!password) return null;
  const passed = REQUIREMENTS.filter((r) => r.test(password)).length;
  if (passed >= 4) return "Strong";
  if (passed >= 2) return "Fair";
  return "Weak";
}

export function PasswordStrength({ password }: { password: string }) {
  const metCount = REQUIREMENTS.filter((r) => r.test(password)).length;
  const label = strengthLabel(password);
  const widthPercent = password ? Math.max((metCount / REQUIREMENTS.length) * 100, 10) : 2.5;

  return (
    <div className="flex w-full flex-col gap-3">
      <div>
        {label && (
          <p
            className={cn(
              "mb-1 text-right text-xs font-medium",
              label === "Strong" && "text-success",
              label === "Fair" && "text-[#f59e0b]",
              label === "Weak" && "text-destructive",
            )}
          >
            ({label})
          </p>
        )}
        <div className="h-2 w-full overflow-hidden rounded bg-[#edecef]">
          <div
            className={cn(
              "h-full rounded transition-all",
              !label && "bg-[#605d67]",
              label === "Strong" && "bg-success",
              label === "Fair" && "bg-[#f59e0b]",
              label === "Weak" && "bg-destructive",
            )}
            style={{ width: `${widthPercent}%` }}
          />
        </div>
      </div>

      <ul className="flex flex-col gap-1">
        {REQUIREMENTS.map((req) => {
          const met = req.test(password);
          return (
            <li key={req.label} className="flex items-center gap-2">
              {met ? (
                <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-success">
                  <Check className="size-2.5 text-white" strokeWidth={3} />
                </span>
              ) : (
                <span className="size-4 shrink-0 rounded-full border border-[#9d9aa4]" />
              )}
              <span className="text-base text-muted-foreground">{req.label}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
