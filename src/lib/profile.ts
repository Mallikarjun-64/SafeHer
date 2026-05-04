import { supabase } from '@/integrations/supabase/client'
import type { Database } from '@/integrations/supabase/types'

type Profile = Database['public']['Tables']['profiles']['Row']
type ProfileInsert = Database['public']['Tables']['profiles']['Insert']

export const createProfile = async (userData: {
  id: string
  full_name?: string
  phone?: string
  email?: string
  role?: string
}): Promise<{ error: any }> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: userData.id,
        full_name: userData.full_name || null,
        phone: userData.phone || null,
        verified: false,
        blocked: false
      } as ProfileInsert)

    if (error) {
      console.error('Error creating profile:', error)
      return { error }
    }

    // Also create user role if provided
    if (userData.role) {
      try {
        const { error: roleError } = await supabase
          .from('user_roles')
          .upsert({
            user_id: userData.id,
            role: userData.role as any
          })

        if (roleError) {
          console.error('Error creating user role:', roleError)
          // Don't fail the whole profile creation if role table is missing
          // Just log the error and continue
        }
      } catch (err) {
        console.error('Unexpected error creating user role:', err)
        // Continue without role creation
      }
    }

    return { error: null }
  } catch (error) {
    console.error('Unexpected error creating profile:', error)
    return { error }
  }
}

export const getProfile = async (userId: string): Promise<{ data: Profile | null, error: any }> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    return { data, error }
  } catch (error) {
    console.error('Error fetching profile:', error)
    return { data: null, error }
  }
}

export const updateProfile = async (userId: string, updates: Partial<ProfileInsert>): Promise<{ error: any }> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)

    return { error }
  } catch (error) {
    console.error('Error updating profile:', error)
    return { error }
  }
}
