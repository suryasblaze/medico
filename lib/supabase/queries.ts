import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import { createClient } from './server'

// Cache getUser within a single request (prevents triple auth calls)
export const getUser = cache(async () => {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
})

// Cache doctor profile with persistent cache (revalidates every 60 seconds)
const getCachedDoctorProfile = unstable_cache(
  async (userId: string) => {
    const supabase = createClient()
    const { data } = await supabase
      .from('doctors')
      .select('id, user_id, full_name, email, phone, specialty, avatar_url, clinic_name, updated_at')
      .eq('user_id', userId)
      .maybeSingle()
    return data
  },
  ['doctor-profile'],
  { revalidate: 60, tags: ['doctor'] }
)

// Cache doctor profile within a single request
export const getDoctorProfile = cache(async (userId: string) => {
  return getCachedDoctorProfile(userId)
})

// Get current doctor (combines user + doctor profile fetch)
export const getCurrentDoctor = cache(async () => {
  const user = await getUser()
  if (!user) return null
  return getDoctorProfile(user.id)
})

// Cache patients list with persistent cache
export const getCachedPatients = unstable_cache(
  async (doctorId: string) => {
    const supabase = createClient()
    const { data } = await supabase
      .from('patients')
      .select('id, full_name, email, phone, medical_record_number, created_at')
      .eq('doctor_id', doctorId)
      .order('created_at', { ascending: false })
      .limit(100)
    return data || []
  },
  ['patients-list'],
  { revalidate: 30, tags: ['patients'] }
)

// Cache dashboard stats with persistent cache
export const getCachedDashboardStats = unstable_cache(
  async (doctorId: string) => {
    const supabase = createClient()
    const now = new Date()
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1)

    const [
      { count: patientsCount },
      { count: medicalRecordsCount },
      { data: recentRecords },
      { data: recentPatients }
    ] = await Promise.all([
      supabase
        .from('patients')
        .select('id', { count: 'exact', head: true })
        .eq('doctor_id', doctorId),
      supabase
        .from('medical_records')
        .select('id', { count: 'exact', head: true })
        .eq('doctor_id', doctorId),
      supabase
        .from('medical_records')
        .select('visit_date, visit_type')
        .eq('doctor_id', doctorId)
        .gte('visit_date', sixMonthsAgo.toISOString())
        .order('visit_date', { ascending: false })
        .limit(200),
      supabase
        .from('patients')
        .select('created_at')
        .eq('doctor_id', doctorId)
        .gte('created_at', sixMonthsAgo.toISOString())
        .order('created_at', { ascending: false })
    ])

    return {
      patientsCount: patientsCount || 0,
      medicalRecordsCount: medicalRecordsCount || 0,
      recentRecords: recentRecords || [],
      recentPatients: recentPatients || []
    }
  },
  ['dashboard-stats'],
  { revalidate: 60, tags: ['dashboard'] }
)
