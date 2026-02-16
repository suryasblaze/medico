'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, Eye, Download } from 'lucide-react'
import { formatDateShort } from '@/lib/utils/formatters'
import { ExportButton } from './ExportButton'

interface SubmissionsListProps {
  submissions: any[]
  forms: any[]
  currentFilters: {
    form?: string
    status?: string
  }
}

export function SubmissionsList({
  submissions,
  forms,
  currentFilters,
}: SubmissionsListProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')

  const filteredSubmissions = submissions.filter((submission) => {
    const query = searchQuery.toLowerCase()
    return (
      submission.patient_name?.toLowerCase().includes(query) ||
      submission.patient_email?.toLowerCase().includes(query) ||
      submission.forms?.title?.toLowerCase().includes(query)
    )
  })

  const handleFormFilter = (formId: string) => {
    const params = new URLSearchParams()
    if (formId !== 'all') params.set('form', formId)
    if (currentFilters.status) params.set('status', currentFilters.status)
    router.push(`/submissions?${params.toString()}`)
  }

  const handleStatusFilter = (status: string) => {
    const params = new URLSearchParams()
    if (currentFilters.form) params.set('form', currentFilters.form)
    if (status !== 'all') params.set('status', status)
    router.push(`/submissions?${params.toString()}`)
  }

  if (submissions.length === 0 && !currentFilters.form && !currentFilters.status) {
    return (
      <Card className="p-12">
        <div className="text-center">
          <h3 className="text-lg font-semibold">No submissions yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Submissions will appear here when patients fill out your forms
          </p>
          <Link href="/forms">
            <Button className="mt-4">View Forms</Button>
          </Link>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by patient name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select
          value={currentFilters.form || 'all'}
          onValueChange={handleFormFilter}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All forms" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All forms</SelectItem>
            {forms.map((form) => (
              <SelectItem key={form.id} value={form.id}>
                {form.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={currentFilters.status || 'all'}
          onValueChange={handleStatusFilter}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All status</SelectItem>
            <SelectItem value="unread">Unread</SelectItem>
            <SelectItem value="read">Read</SelectItem>
          </SelectContent>
        </Select>

        {submissions.length > 0 && <ExportButton submissions={submissions} />}
      </div>

      {/* Submissions Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Patient</TableHead>
              <TableHead>Form</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSubmissions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No submissions found matching your search
                </TableCell>
              </TableRow>
            ) : (
              filteredSubmissions.map((submission) => (
                <TableRow key={submission.id}>
                  <TableCell>
                    {submission.is_read ? (
                      <Badge variant="secondary">Read</Badge>
                    ) : (
                      <Badge>New</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">
                        {submission.patient_name || 'Anonymous'}
                      </p>
                      {submission.patient_email && (
                        <p className="text-sm text-muted-foreground">
                          {submission.patient_email}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{submission.forms?.title || 'Unknown'}</TableCell>
                  <TableCell>{formatDateShort(submission.submitted_at)}</TableCell>
                  <TableCell className="text-right">
                    <Link href={`/submissions/${submission.id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Results Count */}
      {searchQuery && (
        <p className="text-sm text-muted-foreground">
          Showing {filteredSubmissions.length} of {submissions.length} submissions
        </p>
      )}
    </div>
  )
}
