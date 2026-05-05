import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
// Firebase Auth used instead of Supabase
import { useToast } from '@/hooks/use-toast'

export const Signup: React.FC = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { auth } = await import('@/lib/firebase');
      const { createUserWithEmailAndPassword } = await import('firebase/auth');
      await createUserWithEmailAndPassword(auth, email, 'password123');

      toast({
        title: "Check your email",
        description: "We sent you a verification link to complete your signup."
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Sign Up</CardTitle>
        <CardDescription>
          Enter your email to create an account with a magic link
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Sending..." : "Send Magic Link"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
