import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createProfile } from '@/lib/profile'

export const AuthCallback: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('Auth callback triggered, URL:', window.location.href)
        
        // Let Supabase handle the magic link from the URL hash automatically
        // Wait a moment for the auth state to be processed
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        const { data: { session }, error } = await supabase.auth.getSession()
        console.log('Session result:', { session, error })
        
        if (error) throw error
        
        if (session) {
          console.log('User authenticated:', session.user.email)
          console.log('User metadata:', session.user.user_metadata)
          
          // Create or update user profile with metadata
          const { error: profileError } = await createProfile({
            id: session.user.id,
            full_name: session.user.user_metadata?.full_name,
            phone: session.user.user_metadata?.phone,
            email: session.user.email,
            role: session.user.user_metadata?.role
          })

          if (profileError) {
            console.error('Profile creation error:', profileError)
            setError('Profile creation failed. Please try again.')
            return
          }

          // Check if user is coming from signup (has user metadata indicating new user)
          const isNewUser = session.user.user_metadata?.role !== undefined;
          console.log('Is new user:', isNewUser)
          
          if (isNewUser) {
            // New user - redirect to main page with navigation bar visible
            console.log('Redirecting new user to main page...')
            navigate('/', { replace: true })
          } else {
            // Existing user - redirect to appropriate dashboard based on role
            const userRole = session.user.user_metadata?.role || 'user';
            console.log('Redirecting existing user with role:', userRole)
            if (userRole === 'guardian') {
              navigate('/dashboard/guardian', { replace: true })
            } else if (userRole === 'police') {
              navigate('/dashboard/police', { replace: true })
            } else if (userRole === 'admin') {
              navigate('/dashboard/admin', { replace: true })
            } else {
              navigate('/dashboard/user', { replace: true })
            }
          }
        } else {
          console.log('No session found')
          setError('Authentication failed. Please try again.')
        }
      } catch (err: any) {
        console.error('Auth callback error:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    handleAuthCallback()
  }, [navigate])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Authenticating...</CardTitle>
            <CardDescription>
              Please wait while we verify your magic link.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Authentication Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return null
}
