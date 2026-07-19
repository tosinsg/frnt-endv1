/** Lightweight full-page placeholder for lazy routes / auth restore. */
export default function PageLoader() {
  return (
    <div className="min-h-[40vh] bg-paper flex items-center justify-center" role="status" aria-label="Loading">
      <div className="flex items-center gap-2.5">
        <span className="size-2 rounded-full bg-leaf animate-pulse-soft" style={{ animationDelay: '0ms' }} />
        <span className="size-2 rounded-full bg-leaf animate-pulse-soft" style={{ animationDelay: '150ms' }} />
        <span className="size-2 rounded-full bg-leaf animate-pulse-soft" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  )
}
