import { createClient } from '@/lib/supabase/server'
import { getCurrentDoctor } from '@/lib/supabase/queries'
import { ExpensesList } from '@/components/expenses/ExpensesList'

export default async function ExpensesPage() {
  // Use cached doctor - already fetched in layout
  const doctorData = await getCurrentDoctor()
  const supabase = createClient()

  if (!doctorData) {
    return <div>Doctor profile not found</div>
  }

  // Fetch expenses
  const { data: expenses } = await supabase
    .from('expenses')
    .select('*')
    .eq('doctor_id', doctorData.id)
    .order('expense_date', { ascending: false })

  // Calculate totals
  const totalExpenses = expenses?.reduce((sum, e) => sum + Number(e.amount), 0) || 0

  // Get current month expenses
  const now = new Date()
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
  const monthlyExpenses = expenses?.filter(e => e.expense_date >= firstOfMonth)
    .reduce((sum, e) => sum + Number(e.amount), 0) || 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-fuchsia-700 via-fuchsia-600 to-orange-500 bg-clip-text text-transparent">Expenses</h1>
        <p className="text-fuchsia-600/70 dark:text-fuchsia-400/70">Track and manage your clinic expenses</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-card p-6">
          <p className="text-sm text-muted-foreground">Total Expenses</p>
          <p className="text-2xl font-bold text-red-600">
            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(totalExpenses)}
          </p>
        </div>
        <div className="rounded-xl border bg-card p-6">
          <p className="text-sm text-muted-foreground">This Month</p>
          <p className="text-2xl font-bold text-orange-600">
            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(monthlyExpenses)}
          </p>
        </div>
        <div className="rounded-xl border bg-card p-6">
          <p className="text-sm text-muted-foreground">Total Entries</p>
          <p className="text-2xl font-bold">{expenses?.length || 0}</p>
        </div>
      </div>

      <ExpensesList expenses={expenses || []} doctorId={doctorData.id} />
    </div>
  )
}
