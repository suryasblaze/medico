import { cache } from 'react'
import { createClient } from './server'

// Cache getUser within a single request (prevents triple auth calls)
export const getUser = cache(async () => {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
})

// Cache doctor profile within a single request
export const getDoctorProfile = cache(async (userId: string) => {
  const supabase = createClient()
  const { data } = await supabase
    .from('doctors')
    .select('id, user_id, full_name, email, phone, specialty, avatar_url, clinic_name, updated_at')
    .eq('user_id', userId)
    .maybeSingle()
  return data
})

// Get current doctor (combines user + doctor profile fetch)
export const getCurrentDoctor = cache(async () => {
  const user = await getUser()
  if (!user) return null
  return getDoctorProfile(user.id)
})
