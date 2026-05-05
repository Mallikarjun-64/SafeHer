import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from "@/contexts/AuthContext";
import { getProfile, createProfile } from "@/lib/profile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const AuthCallback: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const { user } = useAuth();

  useEffect(() => {
    const handleAuth = async () => {
      if (user) {
        try {
          const { data: profile } = await getProfile(user.id);
          if (!profile) {
            await createProfile({ id: user.id, email: user.email || undefined });
          }
          navigate("/dashboard/user", { replace: true });
        } catch (err: any) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      } else {
        // Wait a bit for auth state
        const timeout = setTimeout(() => {
          if (!user) {
            navigate("/auth", { replace: true });
          }
        }, 3000);
        return () => clearTimeout(timeout);
      }
    };
    handleAuth();
  }, [user, navigate]);

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
