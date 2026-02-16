'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { Patient } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { useDebounce } from '@/hooks/useDebounce'
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
import { Search, Eye, Mail, Phone } from 'lucide-react'

interface PatientsListProps {
  patients: Patient[]
  doctorId: string
}

export function PatientsList({ patients: initialPatients, doctorId }: PatientsListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearch = useDebounce(searchQuery, 300)
  const [patients, setPatients] = useState<Patient[]>(initialPatients)

  // Real-time subscription
  useEffect(() => {
    const supabase = createClient()

    // Subscribe to changes
    const channel = supabase
      .channel('patients-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'patients',
          filter: `doctor_id=eq.${doctorId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setPatients((prev) => [payload.new as Patient, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setPatients((prev) =>
              prev.map((p) => (p.id === payload.new.id ? (payload.new as Patient) : p))
            )
          } else if (payload.eventType === 'DELETE') {
            setPatients((prev) => prev.filter((p) => p.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [doctorId])

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Memoize filtered patients for performance
  const filteredPatients = useMemo(() => {
    if (!debouncedSearch) return patients

    const query = debouncedSearch.toLowerCase()
    return patients.filter((patient) =>
      patient.full_name.toLowerCase().includes(query) ||
      patient.email?.toLowerCase().includes(query) ||
      patient.phone?.toLowerCase().includes(query) ||
      patient.medical_record_number?.toLowerCase().includes(query)
    )
  }, [patients, debouncedSearch])

  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage)
  const paginatedPatients = filteredPatients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearch])

  if (patients.length === 0) {
    return (
      <Card className="p-12">
        <div className="text-center">
          <h3 className="text-lg font-semibold">No patients yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Get started by adding your first patient
          </p>
          <Link href="/patients/new">
            <Button className="mt-4">Add Patient</Button>
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
            placeholder="Search patients by name, email, phone, or MRN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Patients Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Date of Birth</TableHead>
              <TableHead>MRN</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedPatients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No patients found matching your search
                </TableCell>
              </TableRow>
            ) : (
              paginatedPatients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell className="font-medium">
                    {patient.full_name}
                    {patient.gender && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        ({patient.gender})
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {patient.email && (
                        <div className="flex items-center gap-1 text-sm">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">{patient.email}</span>
                        </div>
                      )}
                      {patient.phone && (
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">{patient.phone}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {patient.date_of_birth
                      ? new Date(patient.date_of_birth).toLocaleDateString()
                      : '-'}
                  </TableCell>
                  <TableCell>
                    {patient.medical_record_number || '-'}
                  </TableCell>
                  <TableCell>
                    {new Date(patient.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/patients/${patient.id}`}>
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
            {Math.min(currentPage * itemsPerPage, filteredPatients.length)} of{' '}
            {filteredPatients.length} patients
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {[...Array(totalPages)].map((_, i) => (
                <Button
                  key={i}
                  variant={currentPage === i + 1 ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentPage(i + 1)}
                  className="w-10"
                >
                  {i + 1}
                </Button>
              )).slice(
                Math.max(0, currentPage - 3),
                Math.min(totalPages, currentPage + 2)
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Results Count */}
      {searchQuery && (
        <p className="text-sm text-muted-foreground">
          Found {filteredPatients.length} patient{filteredPatients.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  )
}
