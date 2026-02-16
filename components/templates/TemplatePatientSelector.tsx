'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Search, User, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Patient {
  id: string
  full_name: string
  email?: string
  phone?: string
  date_of_birth?: string
}

interface TemplatePatientSelectorProps {
  patients: Patient[]
  templateId: string
  templateTitle: string
}

export function TemplatePatientSelector({ patients, templateId, templateTitle }: TemplatePatientSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()

  const filteredPatients = patients.filter(patient =>
    patient.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.phone?.includes(searchQuery)
  )

  const handleSelectPatient = (patientId: string) => {
    // For now, redirect to patient detail page
    // In a full implementation, you would create a filled template form
    router.push(`/patients/${patientId}`)
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search patients by name, email, or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Patients List */}
      <div className="space-y-2 max-h-[500px] overflow-y-auto">
        {filteredPatients.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No patients found matching "{searchQuery}"
          </div>
        ) : (
          filteredPatients.map((patient) => (
            <Card
              key={patient.id}
              className="p-4 hover:shadow-md transition-shadow cursor-pointer group"
              onClick={() => handleSelectPatient(patient.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-950/20 flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold group-hover:text-blue-600 transition-colors">
                      {patient.full_name}
                    </p>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      {patient.email && <span>{patient.email}</span>}
                      {patient.phone && <span>{patient.phone}</span>}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="group-hover:bg-blue-600 group-hover:text-white transition-colors"
                >
                  Select
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      <div className="bg-blue-50 dark:bg-blue-950/10 p-4 rounded-lg border border-blue-200 dark:border-blue-900">
        <p className="text-sm text-muted-foreground">
          💡 <strong>Note:</strong> After selecting a patient, you'll be taken to their record where you can add medical records using this template information.
        </p>
      </div>
    </div>
  )
}
