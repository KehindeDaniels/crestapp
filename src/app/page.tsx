import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <span className="bg-primary text-primary-foreground rounded-md px-3 py-1 text-sm font-semibold">
        Crest
      </span>
      <h1 className="text-foreground text-3xl font-semibold tracking-tight">
        Foundation ready
      </h1>
      <p className="text-muted-foreground max-w-md">
        Phase 0 scaffolding is in place. Feature work begins with
        authentication.
      </p>

      <div className="mt-2 flex flex-col items-center gap-3">
        <Button asChild>
          <Link href="/register">Create an account</Link>
        </Button>
        <p className="text-muted-foreground text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-primary font-medium hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
