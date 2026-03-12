'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, Trash2, Edit2, Check, X, IndianRupee, Search } from 'lucide-react'
import type { Expense } from '@/types'

interface ExpensesListProps {
  expenses: Expense[]
  doctorId: string
}

// Color palette for categories
const categoryColors = [
  'bg-blue-100 text-blue-700',
  'bg-green-100 text-green-700',
  'bg-fuchsia-100 text-fuchsia-700',
  'bg-orange-100 text-orange-700',
  'bg-pink-100 text-pink-700',
  'bg-cyan-100 text-cyan-700',
  'bg-yellow-100 text-yellow-700',
  'bg-indigo-100 text-indigo-700',
  'bg-red-100 text-red-700',
  'bg-teal-100 text-teal-700',
]

const getCategoryColor = (category: string, allCategories: string[]) => {
  const index = allCategories.indexOf(category)
  return categoryColors[index % categoryColors.length] || 'bg-gray-100 text-gray-700'
}

export function ExpensesList({ expenses, doctorId }: ExpensesListProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Form state
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0])

  // Edit state
  const [editTitle, setEditTitle] = useState('')
  const [editAmount, setEditAmount] = useState('')
  const [editCategory, setEditCategory] = useState('')
  const [editDate, setEditDate] = useState('')

  // Get unique categories for coloring
  const uniqueCategories = [...new Set(expenses.map(e => e.category || 'Uncategorized').filter(Boolean))]

  // Filter expenses by search query
  const filteredExpenses = useMemo(() => {
    if (!searchQuery.trim()) return expenses
    const query = searchQuery.toLowerCase()
    return expenses.filter(
      (e) =>
        e.title.toLowerCase().includes(query) ||
        e.category?.toLowerCase().includes(query)
    )
  }, [expenses, searchQuery])

  const resetForm = () => {
    setTitle('')
    setAmount('')
    setCategory('')
    setExpenseDate(new Date().toISOString().split('T')[0])
    setShowAddForm(false)
  }

  const handleAdd = async () => {
    if (!title || !amount) return

    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.from('expenses').insert({
        doctor_id: doctorId,
        title,
        amount: parseFloat(amount),
        category: category || null,
        expense_date: expenseDate,
      })

      if (error) throw error

      resetForm()
      window.location.reload()
    } catch (err) {
      console.error('Failed to add expense:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (expense: Expense) => {
    setEditingId(expense.id)
    setEditTitle(expense.title)
    setEditAmount(expense.amount.toString())
    setEditCategory(expense.category || '')
    setEditDate(expense.expense_date)
  }

  const handleUpdate = async () => {
    if (!editingId || !editTitle || !editAmount) return

    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('expenses')
        .update({
          title: editTitle,
          amount: parseFloat(editAmount),
          category: editCategory || null,
          expense_date: editDate,
        })
        .eq('id', editingId)

      if (error) throw error

      setEditingId(null)
      window.location.reload()
    } catch (err) {
      console.error('Failed to update expense:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) return

    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.from('expenses').delete().eq('id', id)

      if (error) throw error

      window.location.reload()
    } catch (err) {
      console.error('Failed to delete expense:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value)
  }

  // Calculate category totals
  const categoryTotals = expenses.reduce((acc, expense) => {
    const cat = expense.category || 'Uncategorized'
    acc[cat] = (acc[cat] || 0) + Number(expense.amount)
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="space-y-6">
      {/* Category Summary */}
      {Object.keys(categoryTotals).length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Expenses by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Object.entries(categoryTotals).map(([cat, total]) => (
                <div
                  key={cat}
                  className={`px-3 py-2 rounded-lg ${getCategoryColor(cat, uniqueCategories)}`}
                >
                  <span className="text-xs font-medium">{cat}</span>
                  <p className="font-bold">{formatCurrency(total)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Expenses Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-lg">All Expenses</CardTitle>
          <Button onClick={() => setShowAddForm(true)} disabled={showAddForm}>
            <Plus className="mr-2 h-4 w-4" />
            Add Expense
          </Button>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by title or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Add New Row */}
              {showAddForm && (
                <TableRow className="bg-blue-50 dark:bg-blue-950/20">
                  <TableCell>
                    <Input
                      type="date"
                      value={expenseDate}
                      onChange={(e) => setExpenseDate(e.target.value)}
                      className="w-36"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      placeholder="Expense title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      placeholder="Category (optional)"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-32"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <IndianRupee className="h-4 w-4 text-muted-foreground" />
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-28 text-right"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-green-600"
                        onClick={handleAdd}
                        disabled={loading || !title || !amount}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-red-600"
                        onClick={resetForm}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}

              {/* Expense Rows */}
              {filteredExpenses.map((expense) =>
                editingId === expense.id ? (
                  <TableRow key={expense.id} className="bg-yellow-50 dark:bg-yellow-950/20">
                    <TableCell>
                      <Input
                        type="date"
                        value={editDate}
                        onChange={(e) => setEditDate(e.target.value)}
                        className="w-36"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        placeholder="Category"
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value)}
                        className="w-32"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <IndianRupee className="h-4 w-4 text-muted-foreground" />
                        <Input
                          type="number"
                          value={editAmount}
                          onChange={(e) => setEditAmount(e.target.value)}
                          className="w-28 text-right"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-green-600"
                          onClick={handleUpdate}
                          disabled={loading}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-red-600"
                          onClick={() => setEditingId(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  <TableRow key={expense.id}>
                    <TableCell className="text-muted-foreground">
                      {new Date(expense.expense_date).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{expense.title}</p>
                    </TableCell>
                    <TableCell>
                      {expense.category ? (
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(
                            expense.category,
                            uniqueCategories
                          )}`}
                        >
                          {expense.category}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-xs">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(Number(expense.amount))}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => handleEdit(expense)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-red-600"
                          onClick={() => handleDelete(expense.id)}
                          disabled={loading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              )}

              {filteredExpenses.length === 0 && !showAddForm && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    {searchQuery
                      ? 'No expenses found matching your search'
                      : 'No expenses recorded yet. Click "Add Expense" to get started.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
