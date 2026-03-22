export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-fuchsia-50 via-white to-orange-50/40 dark:from-gray-950 dark:via-fuchsia-950/10 dark:to-gray-950">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-fuchsia-800 dark:text-fuchsia-200">Form Not Found</h2>
        <p className="text-fuchsia-600/70 dark:text-fuchsia-400/70">
          The form link you followed may be invalid or expired.
        </p>
        <p className="text-sm text-fuchsia-600/60 dark:text-fuchsia-400/50">
          Please contact your healthcare provider for a valid form link.
        </p>
      </div>
    </div>
  )
}
