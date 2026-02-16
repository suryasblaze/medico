'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Form } from '@/types'
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
import { Search, Eye, ExternalLink, Copy } from 'lucide-react'
import { formatDateShort } from '@/lib/utils/formatters'

interface FormsListProps {
  forms: Form[]
}

export function FormsList({ forms }: FormsListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null)

  const filteredForms = forms.filter((form) => {
    const query = searchQuery.toLowerCase()
    return (
      form.title.toLowerCase().includes(query) ||
      form.description?.toLowerCase().includes(query) ||
      form.slug.toLowerCase().includes(query)
    )
  })

  const copyFormUrl = (slug: string) => {
    const url = `${window.location.origin}/forms/${slug}`
    navigator.clipboard.writeText(url)
    setCopiedSlug(slug)
    setTimeout(() => setCopiedSlug(null), 2000)
  }

  if (forms.length === 0) {
    return (
      <Card className="p-12">
        <div className="text-center">
          <h3 className="text-lg font-semibold">No forms yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Create your first form to start collecting patient submissions
          </p>
          <Link href="/forms/new">
            <Button className="mt-4">Create Form</Button>
          </Link>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search forms by title, description, or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Forms Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Form Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submissions</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredForms.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No forms found matching your search
                </TableCell>
              </TableRow>
            ) : (
              filteredForms.map((form) => (
                <TableRow key={form.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{form.title}</p>
                      {form.description && (
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {form.description}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-muted-foreground">
                        /forms/{form.slug}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={form.is_active ? 'default' : 'secondary'}>
                      {form.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>{form.submission_count}</TableCell>
                  <TableCell>{formatDateShort(form.created_at)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyFormUrl(form.slug)}
                      >
                        {copiedSlug === form.slug ? (
                          <>Copied!</>
                        ) : (
                          <>
                            <Copy className="mr-2 h-4 w-4" />
                            Copy Link
                          </>
                        )}
                      </Button>
                      <Link href={`/forms/${form.slug}`} target="_blank">
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Preview
                        </Button>
                      </Link>
                      <Link href={`/forms/${form.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                      </Link>
                    </div>
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
          Showing {filteredForms.length} of {forms.length} forms
        </p>
      )}
    </div>
  )
}
