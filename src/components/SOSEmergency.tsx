import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Phone, MapPin, Users, Bell, X, AlertTriangle, Shield, Clock, Volume2, VolumeX } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

import { alertService, Guardian as IGuardian } from '@/services/alertService';

interface Guardian extends IGuardian {
  notified: boolean;
  location: string;
  smsSent?: boolean;
  emailSent?: boolean;
}

interface Location {
  latitude: number;
  longitude: number;
  address: string;
  timestamp: string;
}

const SOSEmergency: React.FC = () => {
  const { user } = useAuth();
  const [isActive, setIsActive] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [alertStatus, setAlertStatus] = useState<'idle' | 'countdown' | 'active' | 'resolved'>('idle');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [currentLocation, setCurrentLocation] = useState<Location>({
    latitude: 0,
    longitude: 0,
    address: 'Getting location...',
    timestamp: new Date().toLocaleTimeString()
  });
  const [guardians, setGuardians] = useState<Guardian[]>([]);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const locationRef = useRef<NodeJS.Timeout | null>(null);

  // Function to get current GPS location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      console.error('Geolocation not supported by browser');
      // Set fallback location
      setCurrentLocation({
        latitude: 12.9716,
        longitude: 77.5946,
        address: 'Bangalore, India (Fallback Location)',
        timestamp: new Date().toLocaleTimeString()
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setCurrentLocation({
          latitude,
          longitude,
          address: `GPS: ${latitude.toFixed(6)}, ${longitude.toFixed(6)} (±${accuracy?.toFixed(0)}m)`,
          timestamp: new Date().toLocaleTimeString()
        });
        console.log('Current location captured:', { latitude, longitude, accuracy });
      },
      (error) => {
        console.error('Error getting location:', error);
        // Set fallback location based on error
        let fallbackLocation = 'Unknown Location';
        if (error.code === 1) {
          fallbackLocation = 'Location permission denied - Using Bangalore, India';
        } else if (error.code === 2) {
          fallbackLocation = 'Location unavailable - Using Bangalore, India';
        } else if (error.code === 3) {
          fallbackLocation = 'Location timeout - Using Bangalore, India';
        }
        
        setCurrentLocation({
          latitude: 12.9716,
          longitude: 77.5946,
          address: fallbackLocation,
          timestamp: new Date().toLocaleTimeString()
        });
      },
      {
        enableHighAccuracy: false, // Changed to false for better compatibility
        timeout: 5000, // Reduced timeout
        maximumAge: 60000 // Allow cached location
      }
    );
  };

  // Fetch real guardians from Firestore
  const fetchGuardians = async () => {
    if (!user) {
      console.log('No user logged in, skipping guardian fetch');
      setGuardians([]);
      return;
    }

    try {
      console.log('Fetching guardians for emergency notifications from Firestore:', user.id);
      
      const q = query(
        collection(db, 'users', user.id, 'guardians'),
        orderBy('addedDate', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const mappedGuardians: Guardian[] = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          phone: data.phone,
          email: data.email,
          relationship: data.relationship || 'Unknown',
          address: data.address || '',
          status: data.status || 'active',
          alerts: data.alerts || {
            sos: true,
            location: true,
            checkIn: true,
            emergency: true
          },
          priority: data.priority || 'medium',
          addedDate: data.addedDate instanceof Timestamp ? data.addedDate.toDate().toISOString() : data.addedDate,
          notified: false,
          location: 'Ready to notify'
        };
      });
      
      console.log('Loaded guardians for emergency:', mappedGuardians.length);
      setGuardians(mappedGuardians);
    } catch (error) {
      console.error('Error fetching guardians for emergency:', error);
      setGuardians([]);
    }
  };

  // Initialize audio and fetch guardians
  useEffect(() => {
    fetchGuardians(); // Fetch real guardians on component mount
    
    audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmFgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
    
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
      if (locationRef.current) clearInterval(locationRef.current);
      if (audioRef.current) audioRef.current.pause();
    };
  }, [user]);

  // Update location periodically
  useEffect(() => {
    if (isActive) {
      locationRef.current = setInterval(() => {
        getCurrentLocation(); // Get real GPS location periodically
      }, 5000);
    }
    return () => {
      if (locationRef.current) clearInterval(locationRef.current);
    };
  }, [isActive]);

  // Play sound effect
  const playSound = () => {
    if (soundEnabled && audioRef.current) {
      audioRef.current.loop = true;
      audioRef.current.play().catch(e => {
        console.log('Audio play failed - using fallback:', e);
        // Fallback: Create a simple beep sound using Web Audio API
        try {
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.frequency.value = 800; // 800 Hz beep
          oscillator.type = 'sine';
          
          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
          
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.5);
          
          console.log('🔔 Playing fallback beep sound');
        } catch (fallbackError) {
          console.log('Fallback audio also failed:', fallbackError);
        }
      });
    }
  };

  // Stop sound effect
  const stopSound = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  // Notify guardians using the centralized alert service
  const notifyGuardians = async () => {
    if (!user) {
      console.error('No user logged in, cannot send notifications');
      return;
    }

    console.log('🚨 TRIGGERING SOS ALERT VIA ALERT SERVICE');
    
    try {

      const response = await alertService.sendEmergencyAlert(
        guardians, 
        { userId: user.id, userName: user.full_name },
        { 
          lat: currentLocation.latitude, 
          lng: currentLocation.longitude 
        }
      );
      
      const allSuccessful = response.every(r => r.success);
      
      if (allSuccessful) {
        console.log('✅ SOS Alert logged successfully');
        
        // Update guardian status to show they are "notified" in the UI
        setGuardians(prev => prev.map(guardian => ({
          ...guardian,
          notified: true,
          location: 'Alert Logged',
          smsSent: true,
          emailSent: true
        })));

        toast.success('SOS Alert Triggered!', {
          description: 'Your emergency status has been logged and guardians notified internally.'
        });
      } else {
        console.error('❌ Failed to trigger SOS alert for some guardians');
        toast.error('Alert Partially Failed', {
          description: 'Could not log emergency status for all guardians.'
        });
      }
    } catch (error) {
      console.error('❌ Error in SOS notification process:', error);
      toast.error('System Error', {
        description: 'An error occurred while processing your SOS alert.'
      });
    }
  };

  // Handle SOS activation
  const activateSOS = () => {
    setIsActive(true);
    setAlertStatus('countdown');
    setCountdown(3);
    getCurrentLocation(); // Get current GPS location
    
    // Start countdown
    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          // SOS activated
          setAlertStatus('active');
          notifyGuardians(); // Send urgent SMS to guardians
          playSound();
          if (countdownRef.current) clearInterval(countdownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Cancel SOS
  const cancelSOS = () => {
    setIsActive(false);
    setAlertStatus('idle');
    setCountdown(3);
    stopSound();
    
    if (countdownRef.current) clearInterval(countdownRef.current);
    if (locationRef.current) clearInterval(locationRef.current);
    
    // Reset guardian notifications
    setGuardians(prev => prev.map(guardian => ({
      ...guardian,
      notified: false
    })));
  };

  // Reset everything
  const resetSOS = () => {
    cancelSOS();
    setAlertStatus('resolved');
    setTimeout(() => {
      setAlertStatus('idle');
    }, 2000);
  };

  // Make emergency call
  const makeEmergencyCall = (number: string) => {
    window.open(`tel:${number}`);
  };

  // Get status color
  const getStatusColor = () => {
    switch (alertStatus) {
      case 'countdown': return 'text-yellow-600 bg-yellow-100 border-yellow-300';
      case 'active': return 'text-red-600 bg-red-100 border-red-300';
      case 'resolved': return 'text-green-600 bg-green-100 border-green-300';
      default: return 'text-gray-600 bg-gray-100 border-gray-300';
    }
  };

  // Get status text
  const getStatusText = () => {
    switch (alertStatus) {
      case 'countdown': return 'Emergency Countdown';
      case 'active': return 'EMERGENCY ACTIVE';
      case 'resolved': return 'Emergency Resolved';
      default: return 'System Ready';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900 flex items-center justify-center gap-3">
            <AlertTriangle className="h-10 w-10 text-red-600" />
            SOS Emergency System
          </h1>
          <p className="text-gray-600 text-lg">Instant emergency response at your fingertips</p>
        </div>

        {/* Main SOS Button */}
        <Card className={`relative overflow-hidden transition-all duration-500 ${isActive ? 'border-red-500 shadow-red-200' : 'border-gray-200'}`}>
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              {/* Status Indicator */}
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 font-semibold transition-all duration-300 ${getStatusColor()}`}>
                <div className={`w-3 h-3 rounded-full ${alertStatus === 'active' ? 'bg-red-600 animate-pulse' : alertStatus === 'countdown' ? 'bg-yellow-600 animate-pulse' : 'bg-gray-400'}`} />
                {getStatusText()}
              </div>

              {/* Countdown Display */}
              {alertStatus === 'countdown' && (
                <div className="space-y-2 animate-pulse">
                  <div className="text-6xl font-bold text-red-600">{countdown}</div>
                  <p className="text-gray-600">Cancel to stop emergency alert</p>
                </div>
              )}

              {/* SOS Button */}
              <Button
                onClick={isActive ? cancelSOS : activateSOS}
                size="lg"
                className={`w-32 h-32 rounded-full mx-auto text-lg font-bold transition-all duration-300 transform hover:scale-105 flex flex-col items-center justify-center ${
                  isActive 
                    ? 'bg-gray-600 hover:bg-gray-700 text-white' 
                    : 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
                }`}
              >
                {isActive ? (
                  <>
                    <X className="h-8 w-8 mb-1" />
                    <span className="text-xs">Cancel</span>
                  </>
                ) : (
                  <>
                    <Bell className="h-8 w-8 mb-1" />
                    <span className="text-xs">SOS</span>
                  </>
                )}
              </Button>

              {/* Sound Toggle */}
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="flex items-center gap-2"
                >
                  {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                  {soundEnabled ? 'Sound On' : 'Sound Off'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Information Grid */}
        {isActive && (
          <div className="grid md:grid-cols-2 gap-6 animate-fade-in">
            {/* Google Maps View */}
            <Card className="border-purple-200 shadow-purple-100">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-purple-600">
                  <MapPin className="h-5 w-5" />
                  Live Location Map
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg overflow-hidden h-64 relative">
                  <iframe
                    src={`https://maps.google.com/maps?q=${currentLocation.latitude},${currentLocation.longitude}&z=16&output=embed`}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    title="Emergency Location"
                    allowFullScreen
                    loading="lazy"
                  />
                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-medium text-red-600">
                    🚨 EMERGENCY
                  </div>
                </div>
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <p className="font-mono text-sm text-gray-700">
                    {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {currentLocation.address}
                  </p>
                </div>
                <Button
                  onClick={() => {
                    const locationMessage = `🚨 EMERGENCY ALERT 🚨\n\nCurrent Location: ${currentLocation.latitude.toFixed(6)}, ${currentLocation.longitude.toFixed(6)}\n\nView on Google Maps: https://maps.google.com/maps?q=${currentLocation.latitude},${currentLocation.longitude}&z=18\n\nTime: ${new Date().toLocaleString()}`;
                    navigator.clipboard.writeText(locationMessage).then(() => {
                      alert('Location message copied to clipboard!');
                    });
                  }}
                  className="w-full mt-2"
                  variant="outline"
                  size="sm"
                >
                  📋 Copy Location
                </Button>
              </CardContent>
            </Card>

            {/* Guardian Notifications */}
            <Card className="border-green-200 shadow-green-100">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <Users className="h-5 w-5" />
                  Guardian Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {guardians.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p className="font-medium">No Guardians Added</p>
                    <p className="text-sm">Add guardians to receive emergency notifications</p>
                  </div>
                ) : (
                  guardians.map((guardian) => (
                    <div key={guardian.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{guardian.name}</p>
                        <p className="text-sm text-gray-600">{guardian.phone}</p>
                        <p className="text-xs text-gray-500">{guardian.relationship} • {guardian.email}</p>
                        <p className="text-xs text-gray-500">{guardian.location}</p>
                      </div>
                      <Badge variant={guardian.notified ? "default" : "secondary"}>
                        {guardian.notified ? "Notified" : "Pending"}
                      </Badge>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Emergency Call Buttons */}
        {alertStatus === 'active' && (
          <Card className="border-red-200 shadow-red-100 animate-fade-in">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-red-600">
                <Phone className="h-5 w-5" />
                Emergency Services
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <Button
                  onClick={() => makeEmergencyCall('911')}
                  className="bg-red-600 hover:bg-red-700 text-white py-4 flex items-center justify-center gap-2"
                >
                  <Phone className="h-5 w-5" />
                  Call 911
                </Button>
                <Button
                  onClick={() => makeEmergencyCall('112')}
                  className="bg-orange-600 hover:bg-orange-700 text-white py-4 flex items-center justify-center gap-2"
                >
                  <Phone className="h-5 w-5" />
                  Call 112
                </Button>
                <Button
                  onClick={() => makeEmergencyCall('999')}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white py-4 flex items-center justify-center gap-2"
                >
                  <Phone className="h-5 w-5" />
                  Call 999
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Reset Button */}
        {alertStatus === 'active' && (
          <div className="text-center">
            <Button
              onClick={resetSOS}
              variant="outline"
              className="border-green-600 text-green-600 hover:bg-green-50 px-8 py-3"
            >
              <Shield className="h-5 w-5 mr-2" />
              Mark as Resolved
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SOSEmergency;
