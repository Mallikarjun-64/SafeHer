import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  Shield, 
  Bell, 
  MapPin, 
  Phone, 
  Users, 
  Settings, 
  Volume2,
  Smartphone,
  Mail,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  ArrowLeft,
  Save
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function AlertSettings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    // Emergency Settings
    sosEnabled: true,
    sosCountdown: 3,
    autoCallPolice: false,
    shareLocation: true,
    
    // Notification Settings
    pushNotifications: true,
    soundAlerts: true,
    vibrationEnabled: true,
    
    // Alert Preferences
    alertFrequency: 'all',
    guardianPriority: 'all',
    emergencyContacts: ['1091', '112'],
    
    // Location Settings
    locationAccuracy: 'high',
    locationUpdateInterval: 30,
    shareWithPolice: true,
    shareWithGuardians: true,
    
    // Advanced Settings
    testMode: false,
    stealthMode: false,
    panicWord: 'help',
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth?mode=signup');
      return;
    }
  }, [user, navigate]);

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { db } = await import('@/lib/firebase');
      const { doc, updateDoc, setDoc } = await import('firebase/firestore');
      
      // Save settings to user document
      await setDoc(doc(db, 'users', user.id), {
        alertSettings: settings,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      toast.success('Alert settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTestAlert = () => {
    toast.success('Test alert sent! Check your notifications.');
  };

  const emergencyContacts = [
    { id: '1091', name: 'Women Helpline', type: 'helpline' },
    { id: '112', name: 'Emergency Services', type: 'emergency' },
    { id: '100', name: 'Police', type: 'police' },
    { id: '108', name: 'Ambulance', type: 'medical' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur-md shadow-lg">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
                <Settings className="h-4 w-4 text-white" />
              </div>
              <h1 className="text-lg font-bold">Alert Settings</h1>
            </div>
          </div>
          <Button onClick={handleSave} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
            {loading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          {/* Emergency Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Emergency Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>SOS Button</Label>
                  <p className="text-sm text-muted-foreground">Enable one-click emergency alerts</p>
                </div>
                <Switch
                  checked={settings.sosEnabled}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, sosEnabled: checked }))}
                />
              </div>

              <div className="space-y-2">
                <Label>SOS Countdown: {settings.sosCountdown} seconds</Label>
                <p className="text-sm text-muted-foreground">Time to cancel accidental SOS activation</p>
                <Slider
                  value={[settings.sosCountdown]}
                  onValueChange={([value]) => setSettings(prev => ({ ...prev, sosCountdown: value }))}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Auto-Call Police</Label>
                  <p className="text-sm text-muted-foreground">Automatically call emergency services</p>
                </div>
                <Switch
                  checked={settings.autoCallPolice}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, autoCallPolice: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Share Location</Label>
                  <p className="text-sm text-muted-foreground">Share GPS coordinates during emergency</p>
                </div>
                <Switch
                  checked={settings.shareLocation}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, shareLocation: checked }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-blue-500" />
                Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-4 w-4" />
                  <div>
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive alerts on your device</p>
                  </div>
                </div>
                <Switch
                  checked={settings.pushNotifications}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, pushNotifications: checked }))}
                />
              </div>



              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Volume2 className="h-4 w-4" />
                  <div>
                    <Label>Sound Alerts</Label>
                    <p className="text-sm text-muted-foreground">Play alert sounds</p>
                  </div>
                </div>
                <Switch
                  checked={settings.soundAlerts}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, soundAlerts: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-4 w-4" />
                  <div>
                    <Label>Vibration</Label>
                    <p className="text-sm text-muted-foreground">Vibrate on alerts</p>
                  </div>
                </div>
                <Switch
                  checked={settings.vibrationEnabled}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, vibrationEnabled: checked }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Location Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-green-500" />
                Location Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Location Accuracy</Label>
                <Select
                  value={settings.locationAccuracy}
                  onValueChange={(value) => setSettings(prev => ({ ...prev, locationAccuracy: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High (Best accuracy, more battery)</SelectItem>
                    <SelectItem value="medium">Medium (Balanced)</SelectItem>
                    <SelectItem value="low">Low (Saves battery)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Location Update Interval: {settings.locationUpdateInterval} seconds</Label>
                <Slider
                  value={[settings.locationUpdateInterval]}
                  onValueChange={([value]) => setSettings(prev => ({ ...prev, locationUpdateInterval: value }))}
                  max={300}
                  min={10}
                  step={10}
                  className="w-full"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Share with Police</Label>
                  <p className="text-sm text-muted-foreground">Share location with law enforcement</p>
                </div>
                <Switch
                  checked={settings.shareWithPolice}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, shareWithPolice: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Share with Guardians</Label>
                  <p className="text-sm text-muted-foreground">Share location with trusted contacts</p>
                </div>
                <Switch
                  checked={settings.shareWithGuardians}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, shareWithGuardians: checked }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contacts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-purple-500" />
                Emergency Contacts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {emergencyContacts.map((contact) => (
                  <div key={contact.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4" />
                      <div>
                        <div className="font-medium">{contact.name}</div>
                        <div className="text-sm text-muted-foreground">{contact.id}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={settings.emergencyContacts.includes(contact.id) ? "default" : "secondary"}>
                        {settings.emergencyContacts.includes(contact.id) ? "Active" : "Inactive"}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (settings.emergencyContacts.includes(contact.id)) {
                            setSettings(prev => ({
                              ...prev,
                              emergencyContacts: prev.emergencyContacts.filter(id => id !== contact.id)
                            }));
                          } else {
                            setSettings(prev => ({
                              ...prev,
                              emergencyContacts: [...prev.emergencyContacts, contact.id]
                            }));
                          }
                        }}
                      >
                        {settings.emergencyContacts.includes(contact.id) ? "Remove" : "Add"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>


        </div>
      </div>
    </div>
  );
}
