'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Download, Trash2, Loader2, Plus, X, Pencil, Check } from 'lucide-react'

interface PrescriptionFormProps {
  doctorId: string
}

export function PrescriptionForm({ doctorId }: PrescriptionFormProps) {
  const [downloading, setDownloading] = useState(false)
  const [editingHeader, setEditingHeader] = useState(false)

  // Header details (editable)
  const [headerData, setHeaderData] = useState({
    doctorName: 'Prof. Dr.V.M.Senthil Kumar',
    credentials: 'B.D.S., M.D.S',
    specialty: 'Pediatric Dentist',
    mobile: '75983 39534',
    phone: '0422 - 2430431',
    address: '218-C, G.S.Complex, N.S.R. Road,\nSaibaba Colony, Coimbatore - 641 011.',
    clinicHours: 'Morning 10:00 AM - 1:00 PM | Evening 5:00 PM - 8:30 PM',
    closedDay: 'Sunday Closed',
  })

  const [formData, setFormData] = useState({
    patientName: '',
    patientAge: '',
    prescriptionDate: new Date().toISOString().split('T')[0],
    bp: '',
    sugar: '',
    pulse: '',
  })

  const handleHeaderChange = (field: string, value: string) => {
    setHeaderData(prev => ({ ...prev, [field]: value }))
  }

  // Multiple prescription sections
  const [sections, setSections] = useState([
    { id: 1, medicine: '', m: '', a: '', n: '' }
  ])

  const addSection = () => {
    setSections(prev => [...prev, { id: Date.now(), medicine: '', m: '', a: '', n: '' }])
  }

  const removeSection = (id: number) => {
    if (sections.length > 1) {
      setSections(prev => prev.filter(s => s.id !== id))
    }
  }

  const updateSection = (id: number, field: string, value: string) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s))
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  const handleDownloadPDF = () => {
    setDownloading(true)
    try {
      const printWindow = window.open('', '_blank')

      if (printWindow) {
        const medicineRows = sections
          .filter(s => s.medicine.trim())
          .map((s, i) => `
            <tr>
              <td style="width: 40px; text-align: center; padding: 8px 4px; border: 1px solid #e5e5e5; background: #fdf4ff;">
                ${i === 0 ? '<span style="font-family: serif; font-style: italic; font-size: 18px; font-weight: bold; color: #a855f7;">Rx</span>' : `<span style="color: #888;">${i + 1}.</span>`}
              </td>
              <td style="padding: 8px 12px; border: 1px solid #e5e5e5;">${s.medicine}</td>
              <td style="width: 50px; text-align: center; padding: 8px 4px; border: 1px solid #e5e5e5; background: #fdf4ff;">${s.m || ''}</td>
              <td style="width: 50px; text-align: center; padding: 8px 4px; border: 1px solid #e5e5e5; background: #fff7ed;">${s.a || ''}</td>
              <td style="width: 50px; text-align: center; padding: 8px 4px; border: 1px solid #e5e5e5; background: #faf5ff;">${s.n || ''}</td>
            </tr>
          `).join('')

        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Prescription - ${formData.patientName || 'Patient'}</title>
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: white;
                padding: 20px;
                font-size: 13px;
                line-height: 1.4;
                color: #333;
              }
              .container {
                max-width: 210mm;
                margin: 0 auto;
                border: 1px solid #e0e0e0;
                padding: 20px;
              }
              .header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 15px;
              }
              .logo-section img {
                height: 50px;
                margin-bottom: 8px;
              }
              .doctor-info {
                margin-top: 5px;
              }
              .doctor-name {
                font-size: 14px;
                font-weight: 600;
                color: #333;
              }
              .doctor-credentials {
                font-size: 11px;
                color: #666;
              }
              .doctor-specialty {
                font-size: 11px;
                color: #a855f7;
                font-weight: 500;
              }
              .contact-info {
                text-align: right;
                font-size: 12px;
              }
              .contact-info .label {
                color: #999;
                font-size: 10px;
              }
              .contact-info .value {
                color: #333;
                font-weight: 500;
              }
              .address {
                font-size: 11px;
                color: #666;
                margin-top: 5px;
                white-space: pre-line;
              }
              .divider {
                height: 2px;
                background: linear-gradient(to right, #a855f7, #8b5cf6, #f97316);
                border-radius: 2px;
                margin: 15px 0;
              }
              .patient-row, .vitals-row {
                display: flex;
                border: 1px solid #e5e5e5;
                border-radius: 6px;
                overflow: hidden;
                margin-bottom: 10px;
              }
              .field-label {
                background: #f9fafb;
                padding: 8px 12px;
                font-size: 11px;
                font-weight: 600;
                color: #555;
                border-right: 1px solid #e5e5e5;
                display: flex;
                align-items: center;
              }
              .field-value {
                padding: 8px 12px;
                flex: 1;
                border-right: 1px solid #e5e5e5;
                font-size: 13px;
              }
              .field-value:last-child {
                border-right: none;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 15px;
              }
              th {
                padding: 8px 4px;
                font-size: 11px;
                font-weight: 600;
                border: 1px solid #e5e5e5;
                background: #f9fafb;
              }
              .timing-header {
                font-size: 10px;
                font-weight: bold;
              }
              .timing-sub {
                font-size: 8px;
                color: #888;
                display: block;
              }
              .th-m { background: #fdf4ff; color: #a855f7; }
              .th-a { background: #fff7ed; color: #ea580c; }
              .th-n { background: #faf5ff; color: #7c3aed; }
              .footer {
                margin-top: 20px;
                padding-top: 15px;
                border-top: 1px solid #e5e5e5;
                text-align: center;
                font-size: 11px;
                color: #666;
              }
              .footer .hours {
                color: #555;
              }
              .footer .closed {
                color: #dc2626;
                font-weight: 600;
                margin-top: 3px;
              }
              @media print {
                body { padding: 0; }
                .container { border: none; }
                @page { margin: 10mm; }
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="logo-section">
                  <img src="/logo.png" alt="VR Dental Care" onerror="this.style.display='none'"/>
                  <div class="doctor-info">
                    <div class="doctor-name">${headerData.doctorName} <span class="doctor-credentials">${headerData.credentials}</span></div>
                    <div class="doctor-specialty">${headerData.specialty}</div>
                  </div>
                </div>
                <div class="contact-info">
                  <div><span class="label">Mobile: </span><span class="value">${headerData.mobile}</span></div>
                  <div><span class="label">Phone: </span><span class="value">${headerData.phone}</span></div>
                  <div class="address">${headerData.address}</div>
                </div>
              </div>

              <div class="divider"></div>

              <div class="patient-row">
                <div class="field-label" style="width: 50px;">Name</div>
                <div class="field-value" style="flex: 2;">${formData.patientName}</div>
                <div class="field-label" style="width: 40px;">Age</div>
                <div class="field-value" style="width: 60px;">${formData.patientAge}</div>
                <div class="field-label" style="width: 40px;">Date</div>
                <div class="field-value" style="width: 90px;">${formatDate(formData.prescriptionDate)}</div>
              </div>

              <div class="vitals-row">
                <div class="field-label" style="width: 35px;">BP</div>
                <div class="field-value">${formData.bp || '-'}</div>
                <div class="field-label" style="width: 45px;">Sugar</div>
                <div class="field-value">${formData.sugar || '-'}</div>
                <div class="field-label" style="width: 40px;">Pulse</div>
                <div class="field-value">${formData.pulse || '-'}</div>
              </div>

              <table>
                <thead>
                  <tr>
                    <th style="width: 40px;"></th>
                    <th style="text-align: left; padding-left: 12px;">Medicine / Instructions</th>
                    <th class="th-m" style="width: 50px;">
                      <span class="timing-header">M</span>
                      <span class="timing-sub">காலை</span>
                    </th>
                    <th class="th-a" style="width: 50px;">
                      <span class="timing-header">A</span>
                      <span class="timing-sub">மதியம்</span>
                    </th>
                    <th class="th-n" style="width: 50px;">
                      <span class="timing-header">N</span>
                      <span class="timing-sub">இரவு</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  ${medicineRows || '<tr><td colspan="5" style="padding: 20px; text-align: center; color: #999; border: 1px solid #e5e5e5;">No medicines added</td></tr>'}
                </tbody>
              </table>

              <div class="footer">
                <div class="hours">${headerData.clinicHours}</div>
                <div class="closed">${headerData.closedDay}</div>
              </div>
            </div>
            <script>
              window.onload = function() {
                setTimeout(function() { window.print(); }, 300);
              };
            </script>
          </body>
          </html>
        `)
        printWindow.document.close()
      }
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Failed to generate PDF')
    } finally {
      setDownloading(false)
    }
  }

  const handleClear = () => {
    if (confirm('Are you sure you want to clear all fields?')) {
      setFormData({
        patientName: '',
        patientAge: '',
        prescriptionDate: new Date().toISOString().split('T')[0],
        bp: '',
        sugar: '',
        pulse: '',
      })
      setSections([{ id: 1, medicine: '', m: '', a: '', n: '' }])
    }
  }

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      <div className="flex flex-wrap justify-end gap-3">
        <Button
          variant="outline"
          onClick={handleClear}
          className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Clear
        </Button>
        <Button
          onClick={handleDownloadPDF}
          disabled={downloading}
          className="bg-gradient-to-r from-fuchsia-600 to-fuchsia-700 hover:from-fuchsia-700 hover:to-fuchsia-800 text-white"
        >
          {downloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
          {downloading ? 'Generating...' : 'Print / Download PDF'}
        </Button>
      </div>

      {/* Prescription Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6 md:p-8" style={{ minHeight: '700px' }}>

          {/* Header */}
          <div className="relative">
            {/* Edit Button */}
            <button
              type="button"
              onClick={() => setEditingHeader(!editingHeader)}
              className="absolute -top-2 -right-2 p-1.5 rounded-full bg-gray-100 hover:bg-fuchsia-100 text-gray-500 hover:text-fuchsia-600 transition-colors z-10"
              title={editingHeader ? "Done editing" : "Edit header"}
            >
              {editingHeader ? <Check className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
            </button>

            <div className="flex justify-between items-start gap-4 pb-4">
              {/* Left - Logo & Doctor Info */}
              <div className="flex-shrink-0">
                <div className="w-36 h-14 md:w-44 md:h-16 relative mb-2">
                  <Image
                    src="/logo.png"
                    alt="VR Dental Care"
                    fill
                    className="object-contain object-left"
                    priority
                  />
                </div>
                <div className="pl-1">
                  {editingHeader ? (
                    <div className="space-y-1">
                      <input
                        type="text"
                        value={headerData.doctorName}
                        onChange={(e) => handleHeaderChange('doctorName', e.target.value)}
                        className="text-sm font-semibold text-gray-800 border-b border-fuchsia-300 focus:border-fuchsia-500 outline-none bg-transparent w-full"
                        placeholder="Doctor Name"
                      />
                      <input
                        type="text"
                        value={headerData.credentials}
                        onChange={(e) => handleHeaderChange('credentials', e.target.value)}
                        className="text-xs text-gray-500 border-b border-fuchsia-300 focus:border-fuchsia-500 outline-none bg-transparent w-full"
                        placeholder="Credentials"
                      />
                      <input
                        type="text"
                        value={headerData.specialty}
                        onChange={(e) => handleHeaderChange('specialty', e.target.value)}
                        className="text-xs text-fuchsia-600 border-b border-fuchsia-300 focus:border-fuchsia-500 outline-none bg-transparent w-full"
                        placeholder="Specialty"
                      />
                    </div>
                  ) : (
                    <>
                      <p className="text-sm font-semibold text-gray-800">
                        {headerData.doctorName} <span className="text-xs font-normal text-gray-500">{headerData.credentials}</span>
                      </p>
                      <p className="text-xs text-fuchsia-600">{headerData.specialty}</p>
                    </>
                  )}
                </div>
              </div>

              {/* Right - Contact Info */}
              <div className="text-right text-sm space-y-0.5 flex-shrink-0">
                {editingHeader ? (
                  <div className="space-y-1">
                    <div className="flex items-center justify-end gap-1">
                      <span className="text-xs text-gray-400">Mobile:</span>
                      <input
                        type="text"
                        value={headerData.mobile}
                        onChange={(e) => handleHeaderChange('mobile', e.target.value)}
                        className="font-medium text-gray-700 border-b border-fuchsia-300 focus:border-fuchsia-500 outline-none bg-transparent w-28 text-right"
                      />
                    </div>
                    <div className="flex items-center justify-end gap-1">
                      <span className="text-xs text-gray-400">Phone:</span>
                      <input
                        type="text"
                        value={headerData.phone}
                        onChange={(e) => handleHeaderChange('phone', e.target.value)}
                        className="font-medium text-gray-700 border-b border-fuchsia-300 focus:border-fuchsia-500 outline-none bg-transparent w-28 text-right"
                      />
                    </div>
                    <textarea
                      value={headerData.address}
                      onChange={(e) => handleHeaderChange('address', e.target.value)}
                      className="text-xs text-gray-500 border border-fuchsia-300 focus:border-fuchsia-500 outline-none bg-transparent w-full text-right rounded p-1 mt-1"
                      rows={2}
                      placeholder="Address"
                    />
                  </div>
                ) : (
                  <>
                    <p className="text-gray-700">
                      <span className="text-xs text-gray-400">Mobile: </span>
                      <span className="font-medium">{headerData.mobile}</span>
                    </p>
                    <p className="text-gray-700">
                      <span className="text-xs text-gray-400">Phone: </span>
                      <span className="font-medium">{headerData.phone}</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1 whitespace-pre-line">
                      {headerData.address}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Thin Gradient Line */}
          <div className="h-[2px] bg-gradient-to-r from-fuchsia-500 via-purple-500 to-orange-400 rounded-full mb-5" />

          {/* Patient Info Row */}
          <div className="flex border border-gray-200 rounded-lg overflow-hidden mb-3">
            <div className="bg-gray-50 px-3 py-2.5 flex items-center border-r border-gray-200 w-16 flex-shrink-0">
              <span className="text-xs font-semibold text-gray-600">Name</span>
            </div>
            <div className="flex-1 bg-white px-3 py-1.5 border-r border-gray-200 min-w-0">
              <Input
                value={formData.patientName}
                onChange={(e) => handleChange('patientName', e.target.value)}
                placeholder="Patient name"
                className="border-0 shadow-none h-8 px-0 text-sm"
              />
            </div>
            <div className="bg-gray-50 px-3 py-2.5 flex items-center border-r border-gray-200 w-12 flex-shrink-0">
              <span className="text-xs font-semibold text-gray-600">Age</span>
            </div>
            <div className="w-16 bg-white px-3 py-1.5 border-r border-gray-200 flex-shrink-0">
              <Input
                value={formData.patientAge}
                onChange={(e) => handleChange('patientAge', e.target.value)}
                placeholder="Age"
                className="border-0 shadow-none h-8 px-0 text-sm"
              />
            </div>
            <div className="bg-gray-50 px-3 py-2.5 flex items-center border-r border-gray-200 w-12 flex-shrink-0">
              <span className="text-xs font-semibold text-gray-600">Date</span>
            </div>
            <div className="w-32 bg-white px-3 py-1.5 flex-shrink-0">
              <Input
                type="date"
                value={formData.prescriptionDate}
                onChange={(e) => handleChange('prescriptionDate', e.target.value)}
                className="border-0 shadow-none h-8 px-0 text-sm"
              />
            </div>
          </div>

          {/* Vitals Row */}
          <div className="flex border border-gray-200 rounded-lg overflow-hidden mb-4">
            <div className="bg-gray-50 px-3 py-2.5 flex items-center border-r border-gray-200 w-12 flex-shrink-0">
              <span className="text-xs font-semibold text-gray-600">BP</span>
            </div>
            <div className="flex-1 bg-white px-3 py-1.5 border-r border-gray-200 min-w-0">
              <Input
                value={formData.bp}
                onChange={(e) => handleChange('bp', e.target.value)}
                placeholder="120/80"
                className="border-0 shadow-none h-8 px-0 text-sm"
              />
            </div>
            <div className="bg-gray-50 px-3 py-2.5 flex items-center border-r border-gray-200 w-14 flex-shrink-0">
              <span className="text-xs font-semibold text-gray-600">Sugar</span>
            </div>
            <div className="flex-1 bg-white px-3 py-1.5 border-r border-gray-200 min-w-0">
              <Input
                value={formData.sugar}
                onChange={(e) => handleChange('sugar', e.target.value)}
                placeholder="100 mg/dL"
                className="border-0 shadow-none h-8 px-0 text-sm"
              />
            </div>
            <div className="bg-gray-50 px-3 py-2.5 flex items-center border-r border-gray-200 w-12 flex-shrink-0">
              <span className="text-xs font-semibold text-gray-600">Pulse</span>
            </div>
            <div className="flex-1 bg-white px-3 py-1.5 min-w-0">
              <Input
                value={formData.pulse}
                onChange={(e) => handleChange('pulse', e.target.value)}
                placeholder="72 bpm"
                className="border-0 shadow-none h-8 px-0 text-sm"
              />
            </div>
          </div>

          {/* Prescription Area - Section by Section */}
          <div className="rounded-xl overflow-hidden border border-gray-200">
            {/* Header Row */}
            <div className="flex border-b border-gray-200 bg-gray-50">
              <div className="w-12 flex-shrink-0 border-r border-gray-200" />
              <div className="flex-1 min-w-0 px-4 py-2">
                <span className="text-xs font-semibold text-gray-500">Medicine / Instructions</span>
              </div>
              <div className="w-14 flex-shrink-0 border-l border-gray-200 text-center py-2 bg-fuchsia-50">
                <span className="text-xs font-bold text-fuchsia-700">M</span>
                <span className="block text-[8px] text-fuchsia-500">காலை</span>
              </div>
              <div className="w-14 flex-shrink-0 border-l border-gray-200 text-center py-2 bg-orange-50">
                <span className="text-xs font-bold text-orange-700">A</span>
                <span className="block text-[8px] text-orange-500">மதியம்</span>
              </div>
              <div className="w-14 flex-shrink-0 border-l border-gray-200 text-center py-2 bg-purple-50">
                <span className="text-xs font-bold text-purple-700">N</span>
                <span className="block text-[8px] text-purple-500">இரவு</span>
              </div>
              <div className="w-10 flex-shrink-0 border-l border-gray-200" />
            </div>

            {/* Prescription Sections */}
            {sections.map((section, index) => (
              <div key={section.id} className="flex border-b border-gray-100 last:border-b-0">
                {/* Rx Symbol - only on first row */}
                <div className="w-12 flex-shrink-0 border-r border-gray-200 flex items-center justify-center bg-gradient-to-b from-fuchsia-50/50 to-white">
                  {index === 0 && (
                    <span className="text-xl font-serif italic text-fuchsia-600 font-bold">Rx</span>
                  )}
                  {index > 0 && (
                    <span className="text-xs text-gray-400">{index + 1}.</span>
                  )}
                </div>

                {/* Medicine Input - Resizable */}
                <div className="flex-1 min-w-0 border-r border-gray-200">
                  <textarea
                    value={section.medicine}
                    onChange={(e) => updateSection(section.id, 'medicine', e.target.value)}
                    placeholder={index === 0 ? "Tab. Amoxicillin 500mg - 5 days (After food)" : "Medicine name - dosage - duration"}
                    className="w-full p-3 text-sm leading-6 border-0 outline-none resize-y focus:bg-fuchsia-50/20"
                    style={{ minHeight: '60px' }}
                  />
                </div>

                {/* M Column */}
                <div className="w-14 flex-shrink-0 border-r border-gray-200 bg-fuchsia-50/20">
                  <input
                    type="text"
                    value={section.m}
                    onChange={(e) => updateSection(section.id, 'm', e.target.value)}
                    placeholder="1"
                    className="w-full h-full p-2 text-sm text-center border-0 outline-none bg-transparent"
                  />
                </div>

                {/* A Column */}
                <div className="w-14 flex-shrink-0 border-r border-gray-200 bg-orange-50/20">
                  <input
                    type="text"
                    value={section.a}
                    onChange={(e) => updateSection(section.id, 'a', e.target.value)}
                    placeholder="0"
                    className="w-full h-full p-2 text-sm text-center border-0 outline-none bg-transparent"
                  />
                </div>

                {/* N Column */}
                <div className="w-14 flex-shrink-0 border-r border-gray-200 bg-purple-50/20">
                  <input
                    type="text"
                    value={section.n}
                    onChange={(e) => updateSection(section.id, 'n', e.target.value)}
                    placeholder="1"
                    className="w-full h-full p-2 text-sm text-center border-0 outline-none bg-transparent"
                  />
                </div>

                {/* Remove Button */}
                <div className="w-10 flex-shrink-0 flex items-center justify-center">
                  {sections.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSection(section.id)}
                      className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Add Section Button */}
            <div className="p-3 bg-gray-50 border-t border-gray-100">
              <button
                type="button"
                onClick={addSection}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-fuchsia-600 hover:text-fuchsia-700 hover:bg-fuchsia-50 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Medicine
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-gray-100 text-center">
            {editingHeader ? (
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-xs text-gray-500">Clinic Hours:</span>
                  <input
                    type="text"
                    value={headerData.clinicHours}
                    onChange={(e) => handleHeaderChange('clinicHours', e.target.value)}
                    className="text-xs text-gray-600 border-b border-fuchsia-300 focus:border-fuchsia-500 outline-none bg-transparent w-64 text-center"
                  />
                </div>
                <input
                  type="text"
                  value={headerData.closedDay}
                  onChange={(e) => handleHeaderChange('closedDay', e.target.value)}
                  className="text-xs font-semibold text-red-500 border-b border-fuchsia-300 focus:border-fuchsia-500 outline-none bg-transparent w-32 text-center"
                />
              </div>
            ) : (
              <>
                <p className="text-xs text-gray-500">
                  <span className="font-medium text-gray-600">Clinic Hours:</span> {headerData.clinicHours}
                </p>
                <p className="text-xs font-semibold text-red-500 mt-1">{headerData.closedDay}</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
