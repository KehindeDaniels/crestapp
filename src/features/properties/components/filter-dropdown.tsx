import { ChevronDown } from "lucide-react";

/** Shared visual treatment for the search bar's native-select filter dropdowns (Property Type, Price Range). */
export function FilterDropdown({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="relative flex-1">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 w-full appearance-none rounded-lg border-transparent bg-muted px-3.5 pr-9 text-sm text-foreground outline-none focus-visible:border focus-visible:border-ring"
      >
        <option value="">{label}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
}
