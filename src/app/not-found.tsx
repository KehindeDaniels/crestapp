import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
      <p className="text-primary text-sm font-semibold">404</p>
      <h1 className="text-2xl font-semibold tracking-tight">Page not found</h1>
      <p className="text-muted-foreground max-w-sm">
        The page you’re looking for doesn’t exist or has moved.
      </p>
      <Link
        href="/"
        className="bg-primary text-primary-foreground mt-2 rounded-lg px-4 py-2 text-sm font-medium"
      >
        Back home
      </Link>
    </main>
  );
}
