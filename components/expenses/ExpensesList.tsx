'use client'

import { useState, useMemo, useRef } from 'react'
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Plus, Trash2, Edit2, Check, X, IndianRupee, Search, Paperclip, FileText, FileImage, File, Eye, Loader2 } from 'lucide-react'
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
  const fileInputRef = useRef<HTMLInputElement>(null)
  const editFileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewingExpense, setViewingExpense] = useState<Expense | null>(null)

  // Form state
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  // Edit state
  const [editTitle, setEditTitle] = useState('')
  const [editAmount, setEditAmount] = useState('')
  const [editCategory, setEditCategory] = useState('')
  const [editDate, setEditDate] = useState('')
  const [editFile, setEditFile] = useState<File | null>(null)
  const [existingAttachment, setExistingAttachment] = useState<string | null>(null)

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
    setSelectedFile(null)
    setShowAddForm(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const getFileIcon = (fileType?: string) => {
    if (!fileType) return <File className="h-4 w-4 text-gray-600" />
    if (fileType.startsWith('image/')) return <FileImage className="h-4 w-4 text-blue-600" />
    if (fileType === 'application/pdf') return <FileText className="h-4 w-4 text-red-600" />
    return <File className="h-4 w-4 text-gray-600" />
  }

  const uploadFile = async (file: File): Promise<{ url: string; name: string; type: string } | null> => {
    const supabase = createClient()
    const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    const filePath = `${doctorId}/expenses/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('expense-attachments')
      .upload(filePath, file)

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return null
    }

    const { data: urlData } = supabase.storage
      .from('expense-attachments')
      .getPublicUrl(filePath)

    return {
      url: urlData.publicUrl,
      name: file.name,
      type: file.type,
    }
  }

  const handleAdd = async () => {
    if (!title || !amount) return

    setLoading(true)
    try {
      const supabase = createClient()

      let attachmentData: { url: string; name: string; type: string } | null = null
      if (selectedFile) {
        setUploading(true)
        attachmentData = await uploadFile(selectedFile)
        setUploading(false)
      }

      const { error } = await supabase.from('expenses').insert({
        doctor_id: doctorId,
        title,
        amount: parseFloat(amount),
        category: category || null,
        expense_date: expenseDate,
        attachment_url: attachmentData?.url || null,
        attachment_name: attachmentData?.name || null,
        attachment_type: attachmentData?.type || null,
      })

      if (error) throw error

      resetForm()
      window.location.reload()
    } catch (err) {
      console.error('Failed to add expense:', err)
    } finally {
      setLoading(false)
      setUploading(false)
    }
  }

  const handleEdit = (expense: Expense) => {
    setEditingId(expense.id)
    setEditTitle(expense.title)
    setEditAmount(expense.amount.toString())
    setEditCategory(expense.category || '')
    setEditDate(expense.expense_date)
    setEditFile(null)
    setExistingAttachment(expense.attachment_url || null)
    if (editFileInputRef.current) editFileInputRef.current.value = ''
  }

  const handleUpdate = async () => {
    if (!editingId || !editTitle || !editAmount) return

    setLoading(true)
    try {
      const supabase = createClient()

      let attachmentData: { url: string; name: string; type: string } | null = null
      if (editFile) {
        setUploading(true)
        attachmentData = await uploadFile(editFile)
        setUploading(false)
      }

      const updateData: any = {
        title: editTitle,
        amount: parseFloat(editAmount),
        category: editCategory || null,
        expense_date: editDate,
      }

      // Only update attachment if a new file was uploaded
      if (attachmentData) {
        updateData.attachment_url = attachmentData.url
        updateData.attachment_name = attachmentData.name
        updateData.attachment_type = attachmentData.type
      }

      const { error } = await supabase
        .from('expenses')
        .update(updateData)
        .eq('id', editingId)

      if (error) throw error

      setEditingId(null)
      setEditFile(null)
      setExistingAttachment(null)
      window.location.reload()
    } catch (err) {
      console.error('Failed to update expense:', err)
    } finally {
      setLoading(false)
      setUploading(false)
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
                <TableHead>Attachment</TableHead>
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
                    <div className="flex flex-col gap-1">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        className="h-8 text-xs"
                      >
                        <Paperclip className="h-3 w-3 mr-1" />
                        {selectedFile ? 'Change' : 'Add Bill'}
                      </Button>
                      {selectedFile && (
                        <span className="text-xs text-muted-foreground truncate max-w-[100px]">
                          {selectedFile.name}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-green-600"
                        onClick={handleAdd}
                        disabled={loading || uploading || !title || !amount}
                      >
                        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
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
                      <div className="flex flex-col gap-1">
                        <input
                          ref={editFileInputRef}
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={(e) => setEditFile(e.target.files?.[0] || null)}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => editFileInputRef.current?.click()}
                          className="h-8 text-xs"
                        >
                          <Paperclip className="h-3 w-3 mr-1" />
                          {editFile ? 'Change' : existingAttachment ? 'Replace' : 'Add'}
                        </Button>
                        {(editFile || existingAttachment) && (
                          <span className="text-xs text-muted-foreground truncate max-w-[100px]">
                            {editFile?.name || expense.attachment_name}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-green-600"
                          onClick={handleUpdate}
                          disabled={loading || uploading}
                        >
                          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
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
                      {expense.attachment_url ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 text-xs"
                          onClick={() => setViewingExpense(expense)}
                        >
                          {getFileIcon(expense.attachment_type)}
                          <Eye className="h-3 w-3 ml-1" />
                        </Button>
                      ) : (
                        <span className="text-muted-foreground text-xs">-</span>
                      )}
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
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
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

      {/* Attachment Viewer Dialog */}
      <Dialog open={!!viewingExpense} onOpenChange={() => setViewingExpense(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {getFileIcon(viewingExpense?.attachment_type)}
              {viewingExpense?.title} - Bill/Receipt
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {viewingExpense?.attachment_url && (
              <div className="space-y-4">
                {viewingExpense.attachment_type?.startsWith('image/') ? (
                  <div className="flex justify-center">
                    <img
                      src={viewingExpense.attachment_url}
                      alt={viewingExpense.attachment_name || 'Attachment'}
                      className="max-h-[60vh] rounded-lg object-contain"
                    />
                  </div>
                ) : viewingExpense.attachment_type === 'application/pdf' ? (
                  <iframe
                    src={viewingExpense.attachment_url}
                    className="w-full h-[60vh] rounded-lg border"
                    title={viewingExpense.attachment_name || 'PDF Document'}
                  />
                ) : (
                  <div className="flex flex-col items-center gap-4 py-8">
                    <File className="h-16 w-16 text-gray-400" />
                    <p className="text-muted-foreground">{viewingExpense.attachment_name}</p>
                  </div>
                )}
                <div className="flex justify-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => window.open(viewingExpense.attachment_url, '_blank')}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Open in New Tab
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const link = document.createElement('a')
                      link.href = viewingExpense.attachment_url!
                      link.download = viewingExpense.attachment_name || 'attachment'
                      link.click()
                    }}
                  >
                    Download
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
