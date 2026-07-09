export default function Loading() {
  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <div
        className="border-muted border-t-primary size-6 animate-spin rounded-full border-2"
        role="status"
        aria-label="Loading"
      />
    </div>
  );
}
