import { Construction, CreditCard, Clock } from 'lucide-react'
import { Card } from '@/components/ui/card'

export default function PaymentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Payments</h2>
        <p className="text-muted-foreground">
          Track patient payments and invoices
        </p>
      </div>

      <Card className="p-12">
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <div className="relative">
            <div className="h-20 w-20 rounded-full bg-blue-100 dark:bg-blue-950/20 flex items-center justify-center">
              <CreditCard className="h-10 w-10 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="absolute -top-1 -right-1 h-8 w-8 rounded-full bg-yellow-100 dark:bg-yellow-950/20 flex items-center justify-center border-2 border-white dark:border-gray-950">
              <Construction className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-bold">Coming Soon</h3>
            <p className="text-muted-foreground max-w-md">
              We're building a comprehensive payment tracking system with invoicing,
              insurance claims, and payment history.
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-4">
            <Clock className="h-4 w-4" />
            <span>Expected in the next update</span>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-8 w-full max-w-2xl">
            <Card className="p-4">
              <div className="text-center space-y-1">
                <div className="h-8 w-8 rounded-lg bg-green-100 dark:bg-green-950/20 flex items-center justify-center mx-auto">
                  <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-xs font-medium">Invoicing</p>
              </div>
            </Card>

            <Card className="p-4">
              <div className="text-center space-y-1">
                <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-950/20 flex items-center justify-center mx-auto">
                  <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <p className="text-xs font-medium">Payments</p>
              </div>
            </Card>

            <Card className="p-4">
              <div className="text-center space-y-1">
                <div className="h-8 w-8 rounded-lg bg-purple-100 dark:bg-purple-950/20 flex items-center justify-center mx-auto">
                  <svg className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <p className="text-xs font-medium">Reports</p>
              </div>
            </Card>
          </div>
        </div>
      </Card>
    </div>
  )
}
