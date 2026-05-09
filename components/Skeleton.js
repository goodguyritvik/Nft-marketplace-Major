import clsx from 'clsx'

export function Skeleton({ className }) {
  return (
    <div
      className={clsx(
        'animate-pulse rounded-xl bg-slate-200/90 dark:bg-white/10',
        className
      )}
    />
  )
}

export function NFTCardSkeleton() {
  return (
    <div className="rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-white/5 overflow-hidden backdrop-blur-xl">
      <Skeleton className="h-72 w-full rounded-none" />
      <div className="p-6 space-y-4">
        <div className="flex justify-between gap-4">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-6 w-3/5" />
            <Skeleton className="h-4 w-2/5" />
          </div>
          <Skeleton className="h-8 w-20 shrink-0" />
        </div>
        <Skeleton className="h-12 w-full" />
        <div className="flex justify-between pt-2">
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
    </div>
  )
}
