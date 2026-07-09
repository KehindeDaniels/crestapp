import type { ReactNode } from "react";

/** Guest-only auth screens (login, register, password, verify). Centered card layout. */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-muted flex min-h-screen items-center justify-center p-4">
      <div className="bg-card w-full max-w-md rounded-xl border p-6 shadow-sm sm:p-8">
        {children}
      </div>
    </div>
  );
}
