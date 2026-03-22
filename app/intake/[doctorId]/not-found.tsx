import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-fuchsia-50 via-white to-orange-50/40 dark:from-gray-950 dark:via-fuchsia-950/10 dark:to-gray-950">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-fuchsia-800 dark:text-fuchsia-200 mb-4">
          Doctor Not Found
        </h2>
        <p className="text-fuchsia-600/70 dark:text-fuchsia-400/70 mb-6">
          The intake form link you followed may be invalid or expired.
        </p>
        <Link href="/">
          <Button>Go Home</Button>
        </Link>
      </div>
    </div>
  )
}
