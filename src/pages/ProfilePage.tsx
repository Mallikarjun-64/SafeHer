import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Shield, 
  Calendar,
  Edit,
  ArrowLeft,
  Settings
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function ProfilePage() {
  const { user, roles, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">Please sign in to view your profile</p>
          <Button asChild className="mt-4">
            <Link to="/auth">Sign In</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-hero">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight">SafeHer</span>
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            <Link to="/features" className="text-sm font-medium text-muted-foreground hover:text-foreground">Features</Link>
            <Link to="/guardian-management" className="text-sm font-medium text-muted-foreground hover:text-foreground">Guardians</Link>
            <Link to="/sos" className="text-sm font-medium text-muted-foreground hover:text-foreground">SOS</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link to="/settings">Settings</Link>
            </Button>
            <Button 
              variant="outline" 
              onClick={handleSignOut}
              disabled={loading}
            >
              {loading ? 'Signing out...' : 'Sign Out'}
            </Button>
          </div>
        </div>
      </header>

      {/* Profile Content */}
      <main className="container mx-auto py-8">
        <div className="mx-auto max-w-4xl">
          {/* Back Button */}
          <div className="mb-6">
            <Button variant="ghost" asChild>
              <Link to="/" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </div>

          {/* Profile Header */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-4 mb-4">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <User className="h-10 w-10 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Your Profile</h1>
                <p className="text-lg text-muted-foreground">Welcome back, {user.user_metadata?.full_name || user.email}</p>
              </div>
            </div>
          </div>

          {/* Profile Cards Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* User Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  User Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input 
                      id="name" 
                      value={user.user_metadata?.full_name || 'Not provided'} 
                      readOnly 
                      className="bg-muted/50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      value={user.email} 
                      readOnly 
                      className="bg-muted/50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input 
                      id="phone" 
                      value={user.user_metadata?.phone || 'Not provided'} 
                      readOnly 
                      className="bg-muted/50"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Status Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Account Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Account Status</span>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Primary Role</span>
                    <Badge className="bg-blue-100 text-blue-800">
                      {roles.length > 0 ? roles[0] : 'User'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Member Since</span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Button asChild className="w-full justify-start">
                    <Link to="/guardian-management" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Manage Guardians
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link to="/settings" className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Account Settings
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link to="/sos" className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Test SOS
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
