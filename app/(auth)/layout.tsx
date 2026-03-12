export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      {/* Soft gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-50 via-pink-50/30 to-orange-50/40 dark:from-fuchsia-950/40 dark:via-gray-950 dark:to-orange-950/20">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-30 [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
      </div>

      {/* Decorative elements - static for better performance */}
      <div className="absolute top-10 left-10 h-64 w-64 rounded-full bg-gradient-to-br from-fuchsia-400/15 to-pink-400/15 blur-3xl"></div>
      <div className="absolute bottom-20 right-10 h-80 w-80 rounded-full bg-gradient-to-br from-orange-300/15 to-yellow-300/15 blur-3xl"></div>
      <div className="absolute top-1/2 left-1/4 h-40 w-40 rounded-full bg-gradient-to-br from-green-300/10 to-emerald-300/10 blur-3xl"></div>

      {/* Main content */}
      <main className="relative z-10 flex flex-1 items-center justify-center p-6">
        {children}
      </main>

      {/* Footer */}
      <div className="relative z-10 py-6">
        <p className="text-center text-sm text-fuchsia-700/60 dark:text-fuchsia-400/60 font-medium">
          Quality dental care with modern technology
        </p>
      </div>
    </div>
  )
}
