import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  MapPin, 
  Phone, 
  Navigation, 
  Clock, 
  Radio,
  AlertTriangle,
  CheckCircle,
  Users,
  Building,
  Route,
  Eye,
  Activity,
  Bell,
  Zap,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';

interface PoliceStation {
  id: string;
  name: string;
  distance: string;
  address: string;
  phone: string;
  responseTime: string;
  available: boolean;
}

interface AlertStatus {
  active: boolean;
  timestamp: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  officersResponding: number;
  estimatedArrival: string;
}

export default function PoliceIntegration() {
  const [alertStatus, setAlertStatus] = useState<AlertStatus>({
    active: false,
    timestamp: '',
    priority: 'low',
    officersResponding: 0,
    estimatedArrival: ''
  });

  const [nearestStations, setNearestStations] = useState<PoliceStation[]>([
    {
      id: '1',
      name: 'Central Police Station',
      distance: '0.8 km',
      address: '123 Main Street, Downtown',
      phone: '100',
      responseTime: '3-5 min',
      available: true
    },
    {
      id: '2',
      name: 'North District Police',
      distance: '1.2 km',
      address: '456 North Avenue',
      phone: '100',
      responseTime: '5-8 min',
      available: true
    },
    {
      id: '3',
      name: 'East Side Police Post',
      distance: '2.1 km',
      address: '789 East Boulevard',
      phone: '100',
      responseTime: '8-12 min',
      available: false
    }
  ]);

  const [liveTracking, setLiveTracking] = useState(false);
  const [responseProgress, setResponseProgress] = useState(0);
  const [currentLocation, setCurrentLocation] = useState({ lat: 0, lng: 0 });

  useEffect(() => {
    // Simulate location updates
    if (liveTracking) {
      const interval = setInterval(() => {
        setCurrentLocation(prev => ({
          lat: prev.lat + (Math.random() - 0.5) * 0.001,
          lng: prev.lng + (Math.random() - 0.5) * 0.001
        }));
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [liveTracking]);

  useEffect(() => {
    // Simulate response progress when alert is active
    if (alertStatus.active) {
      const interval = setInterval(() => {
        setResponseProgress(prev => {
          if (prev >= 100) return 100;
          return prev + 5;
        });
      }, 500);
      return () => clearInterval(interval);
    } else {
      setResponseProgress(0);
    }
  }, [alertStatus.active]);

  const handleCallPolice = () => {
    toast.success('Connecting to emergency services...');
    
    // Create an anchor element and click it programmatically
    const anchor = document.createElement('a');
    anchor.href = 'tel:100';
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    
    // Fallback for desktop browsers
    setTimeout(() => {
      if (!window.location.href.startsWith('tel:')) {
        toast.info('Please dial 100 for emergency police services');
      }
    }, 1000);
  };

  const handleViewMap = () => {
    toast.info('Opening live map view...');
    // In a real app, this would navigate to a map view
    window.open('/location', '_blank');
  };

  const handleCallStation = (phoneNumber: string) => {
    toast.success(`Connecting to ${phoneNumber}...`);
    
    // Create an anchor element and click it programmatically
    const anchor = document.createElement('a');
    anchor.href = `tel:${phoneNumber}`;
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    
    // Fallback for desktop browsers
    setTimeout(() => {
      if (!window.location.href.startsWith('tel:')) {
        toast.info(`Please dial ${phoneNumber} for police services`);
      }
    }, 1000);
  };

  const handleSendAlert = () => {
    setAlertStatus({
      active: true,
      timestamp: new Date().toLocaleTimeString(),
      priority: 'critical',
      officersResponding: 2,
      estimatedArrival: '3-5 min'
    });
    setLiveTracking(true);
    toast.success('Police alert sent! Help is on the way.');
  };

  const handleCancelAlert = () => {
    setAlertStatus({
      active: false,
      timestamp: '',
      priority: 'low',
      officersResponding: 0,
      estimatedArrival: ''
    });
    setLiveTracking(false);
    toast.info('Police alert cancelled.');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'secondary';
      case 'medium': return 'outline';
      case 'low': return 'default';
      default: return 'secondary';
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-lg">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Police Integration</h1>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Direct connection to law enforcement with real-time tracking and emergency response coordination
        </p>
      </div>

      {/* Alert Status Card */}
      <Card className="relative overflow-hidden border-0 shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 opacity-50"></div>
        <CardHeader className="relative">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Radio className="h-6 w-6 text-blue-600" />
              <span>Police Alert Status</span>
            </div>
            <Badge variant={getPriorityBadge(alertStatus.priority)} className="animate-pulse">
              {alertStatus.active ? 'ACTIVE' : 'STANDBY'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="relative space-y-6">
          {alertStatus.active ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="text-sm text-gray-600">Alert Time</div>
                    <div className="font-semibold">{alertStatus.timestamp}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                  <Users className="h-5 w-5 text-green-600" />
                  <div>
                    <div className="text-sm text-gray-600">Officers Responding</div>
                    <div className="font-semibold">{alertStatus.officersResponding} units</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                  <Navigation className="h-5 w-5 text-orange-600" />
                  <div>
                    <div className="text-sm text-gray-600">ETA</div>
                    <div className="font-semibold">{alertStatus.estimatedArrival}</div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Response Progress</span>
                  <span>{responseProgress}%</span>
                </div>
                <Progress value={responseProgress} className="h-3" />
              </div>

              <Button onClick={handleCancelAlert} variant="outline" className="w-full hover:bg-red-50">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Cancel Alert
              </Button>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
                <Shield className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Active Alert</h3>
              <p className="text-gray-600 mb-6">Press the SOS button to send emergency alert to police</p>
              <Button onClick={handleSendAlert} size="lg" className="bg-red-600 hover:bg-red-700">
                <Zap className="h-4 w-4 mr-2" />
                Send Police Alert
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Nearest Stations */}
      <Card className="border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Building className="h-6 w-6 text-blue-600" />
            Nearest Police Stations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {nearestStations.map((station, index) => (
              <div 
                key={station.id} 
                className="flex items-center justify-between p-4 border rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${station.available ? 'bg-green-100' : 'bg-gray-100'}`}>
                    <Building className={`h-6 w-6 ${station.available ? 'text-green-600' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{station.name}</h4>
                    <p className="text-sm text-gray-600">{station.address}</p>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {station.distance}
                      </span>
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {station.responseTime}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={station.available ? "default" : "secondary"}>
                    {station.available ? 'Available' : 'Busy'}
                  </Badge>
                  <Button size="sm" variant="outline" onClick={() => handleCallStation(station.phone)}>
                    <Phone className="h-3 w-3 mr-1" />
                    Call
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Live Tracking */}
      <Card className="border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Navigation className="h-6 w-6 text-blue-600" />
              Live Location Tracking
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${liveTracking ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
              <span className="text-sm text-gray-600">
                Active
              </span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="font-semibold">Current Location</div>
                    <div className="text-sm text-gray-600">
                      {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => setLiveTracking(!liveTracking)}
                  variant={liveTracking ? "default" : "outline"}
                  size="sm"
                >
                  {liveTracking ? (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Tracking
                    </>
                  ) : (
                    <>
                      <Activity className="h-4 w-4 mr-2" />
                      Start Tracking
                    </>
                  )}
                </Button>
              </div>
              
              {liveTracking && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Radio className="h-4 w-4 text-green-600 animate-pulse" />
                    <span className="text-sm text-green-600">Real-time location sharing active</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-blue-600">Police can see your location</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button 
          onClick={handleCallPolice} 
          size="lg" 
          className="bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
        >
          <Phone className="h-5 w-5 mr-3" />
          Call Emergency Police
          <span className="ml-auto font-bold">100</span>
        </Button>
        
        <Button 
          onClick={handleViewMap} 
          size="lg" 
          variant="outline"
          className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
        >
          <MapPin className="h-5 w-5 mr-3" />
          View Live Map
          <ExternalLink className="h-4 w-4 ml-auto" />
        </Button>
      </div>
    </div>
  );
}
