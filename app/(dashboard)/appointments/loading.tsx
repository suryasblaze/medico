import { Skeleton } from '@/components/ui/skeleton'

export default function AppointmentsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-9 w-40 bg-fuchsia-100/50" />
          <Skeleton className="h-4 w-56 mt-2 bg-fuchsia-100/30" />
        </div>
        <Skeleton className="h-10 w-40 bg-fuchsia-100/50 rounded-xl" />
      </div>

      <div className="rounded-xl border border-fuchsia-100/50 bg-white/50 p-6">
        <div className="flex gap-4 mb-6">
          <Skeleton className="h-10 w-32 bg-fuchsia-100/50 rounded-xl" />
          <Skeleton className="h-10 w-32 bg-fuchsia-100/30 rounded-xl" />
        </div>
        <Skeleton className="h-96 w-full bg-fuchsia-100/30 rounded-xl" />
      </div>
    </div>
  )
}
