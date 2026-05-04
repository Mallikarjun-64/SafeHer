import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { 
  Phone, 
  MapPin, 
  Clock, 
  AlertTriangle, 
  Shield, 
  Ambulance, 
  Car, 
  Users, 
  Radio, 
  Navigation, 
  CheckCircle, 
  XCircle, 
  Loader2,
  ArrowLeft,
  Zap,
  Bell,
  Activity,
  Route,
  Eye,
  EyeOff,
  Smartphone,
  MessageSquare,
  UserPlus,
  Heart,
  Star,
  ChevronRight,
  PhoneCall,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface EmergencyService {
  id: string;
  name: string;
  type: 'police' | 'ambulance' | 'fire' | 'helpline' | 'hospital' | 'guardian';
  icon: React.ReactNode;
  phone: string;
  description: string;
  responseTime: string;
  available: boolean;
  priority: 'critical' | 'high' | 'medium' | 'low';
  color: string;
}

interface ServiceRequest {
  id: string;
  serviceId: string;
  serviceName: string;
  status: 'pending' | 'dispatched' | 'enroute' | 'arrived' | 'completed';
  timestamp: string;
  eta: string;
  progress: number;
  location: { lat: number; lng: number };
  assignedUnit?: string;
}

interface NearbyService {
  id: string;
  name: string;
  type: string;
  distance: string;
  eta: string;
  phone: string;
  rating: number;
  available: boolean;
}

export default function EmergencyServices() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState<EmergencyService | null>(null);
  const [activeRequest, setActiveRequest] = useState<ServiceRequest | null>(null);
  const [nearbyServices, setNearbyServices] = useState<NearbyService[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState({ lat: 0, lng: 0 });
  const [trackingEnabled, setTrackingEnabled] = useState(false);

  const emergencyServices: EmergencyService[] = [
    {
      id: 'police',
      name: 'Police Emergency',
      type: 'police',
      icon: <Shield className="h-6 w-6" />,
      phone: '100',
      description: 'Immediate police response for emergencies and threats',
      responseTime: '3-5 min',
      available: true,
      priority: 'critical',
      color: 'from-blue-600 to-blue-800'
    },
    {
      id: 'ambulance',
      name: 'Ambulance Service',
      type: 'ambulance',
      icon: <Ambulance className="h-6 w-6" />,
      phone: '108',
      description: 'Medical emergency response and transportation',
      responseTime: '5-8 min',
      available: true,
      priority: 'critical',
      color: 'from-red-600 to-red-800'
    },
    {
      id: 'fire',
      name: 'Fire Department',
      type: 'fire',
      icon: <AlertTriangle className="h-6 w-6" />,
      phone: '101',
      description: 'Fire rescue and emergency services',
      responseTime: '4-7 min',
      available: true,
      priority: 'high',
      color: 'from-orange-600 to-orange-800'
    },
    {
      id: 'women-helpline',
      name: 'Women Helpline',
      type: 'helpline',
      icon: <PhoneCall className="h-6 w-6" />,
      phone: '1091',
      description: '24/7 support for women in distress',
      responseTime: 'Immediate',
      available: true,
      priority: 'high',
      color: 'from-purple-600 to-purple-800'
    },
    {
      id: 'hospital',
      name: 'Nearest Hospital',
      type: 'hospital',
      icon: <Heart className="h-6 w-6" />,
      phone: '104',
      description: 'Emergency medical care and treatment',
      responseTime: '10-15 min',
      available: true,
      priority: 'medium',
      color: 'from-green-600 to-green-800'
    },
    {
      id: 'guardian',
      name: 'Contact Guardians',
      type: 'guardian',
      icon: <Users className="h-6 w-6" />,
      phone: 'custom',
      description: 'Alert your trusted emergency contacts',
      responseTime: 'Instant',
      available: true,
      priority: 'high',
      color: 'from-pink-600 to-pink-800'
    }
  ];

  useEffect(() => {
    if (!user) {
      navigate('/auth?mode=signup');
      return;
    }
    
    // Simulate getting nearby services
    setNearbyServices([
      {
        id: '1',
        name: 'Central Police Station',
        type: 'police',
        distance: '0.8 km',
        eta: '3 min',
        phone: '100',
        rating: 4.5,
        available: true
      },
      {
        id: '2',
        name: 'City General Hospital',
        type: 'hospital',
        distance: '1.2 km',
        eta: '5 min',
        phone: '104',
        rating: 4.8,
        available: true
      },
      {
        id: '3',
        name: 'Emergency Medical Services',
        type: 'ambulance',
        distance: '2.1 km',
        eta: '7 min',
        phone: '108',
        rating: 4.6,
        available: true
      },
      {
        id: '4',
        name: 'Fire Station Unit 2',
        type: 'fire',
        distance: '1.5 km',
        eta: '4 min',
        phone: '101',
        rating: 4.3,
        available: false
      }
    ]);

    // Get current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Location access denied');
        }
      );
    }
  }, [user, navigate]);

  const handleServiceClick = async (service: EmergencyService) => {
    if (!service.available) {
      toast.error('This service is currently unavailable');
      return;
    }

    setLoading(true);
    setSelectedService(service);

    // Simulate emergency request
    const requestId = Date.now().toString();
    const newRequest: ServiceRequest = {
      id: requestId,
      serviceId: service.id,
      serviceName: service.name,
      status: 'pending',
      timestamp: new Date().toLocaleTimeString(),
      eta: service.responseTime,
      progress: 0,
      location: currentLocation
    };

    setActiveRequest(newRequest);
    setShowDetails(true);

    // Simulate request progression
    setTimeout(() => {
      setActiveRequest(prev => prev ? { ...prev, status: 'dispatched', progress: 20 } : null);
      toast.success(`${service.name} dispatched!`);
    }, 2000);

    setTimeout(() => {
      setActiveRequest(prev => prev ? { 
        ...prev, 
        status: 'enroute', 
        progress: 50,
        assignedUnit: `Unit ${Math.floor(Math.random() * 999) + 1}`
      } : null);
      toast.info('Emergency unit is en route to your location');
    }, 5000);

    setTimeout(() => {
      setActiveRequest(prev => prev ? { ...prev, status: 'arrived', progress: 80 } : null);
      toast.success('Emergency unit has arrived!');
    }, 8000);

    setTimeout(() => {
      setActiveRequest(prev => prev ? { ...prev, status: 'completed', progress: 100 } : null);
      toast.success('Emergency assistance completed');
    }, 12000);

    setLoading(false);
  };

  const handleCallService = (phone: string) => {
    const anchor = document.createElement('a');
    anchor.href = `tel:${phone}`;
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    
    setTimeout(() => {
      if (!window.location.href.startsWith('tel:')) {
        toast.info(`Please dial ${phone} to contact emergency services`);
      }
    }, 1000);
  };

  const handleCancelRequest = () => {
    if (activeRequest) {
      setActiveRequest(null);
      setShowDetails(false);
      toast.info('Emergency request cancelled');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600';
      case 'dispatched': return 'text-blue-600';
      case 'enroute': return 'text-purple-600';
      case 'arrived': return 'text-green-600';
      case 'completed': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'dispatched': return <Radio className="h-4 w-4" />;
      case 'enroute': return <Navigation className="h-4 w-4" />;
      case 'arrived': return <CheckCircle className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

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
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-red-600 to-orange-600">
                <Phone className="h-4 w-4 text-white" />
              </div>
              <h1 className="text-lg font-bold">Emergency Services</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTrackingEnabled(!trackingEnabled)}
            >
              {trackingEnabled ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
              {trackingEnabled ? 'Hide Location' : 'Show Location'}
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Active Request Status */}
        {activeRequest && (
          <Card className="mb-8 border-2 border-red-200 bg-red-50 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-full">
                    <AlertTriangle className="h-5 w-5 text-red-600 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Active Emergency Request</h3>
                    <p className="text-sm text-gray-600">{activeRequest.serviceName}</p>
                  </div>
                </div>
                <Badge className={getStatusColor(activeRequest.status)}>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(activeRequest.status)}
                    <span className="capitalize">{activeRequest.status}</span>
                  </div>
                </Badge>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span>Request Progress</span>
                  <span>{activeRequest.progress}%</span>
                </div>
                <Progress value={activeRequest.progress} className="h-3" />
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span>Started: {activeRequest.timestamp}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Navigation className="h-4 w-4 text-gray-500" />
                    <span>ETA: {activeRequest.eta}</span>
                  </div>
                  {activeRequest.assignedUnit && (
                    <div className="flex items-center gap-2">
                      <Radio className="h-4 w-4 text-gray-500" />
                      <span>Unit: {activeRequest.assignedUnit}</span>
                    </div>
                  )}
                  {trackingEnabled && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span>Location: {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-3">
                  <Button onClick={handleCancelRequest} variant="outline" className="border-red-200 hover:bg-red-50">
                    Cancel Request
                  </Button>
                  <Button onClick={() => handleCallService(selectedService?.phone || '')}>
                    <Phone className="h-4 w-4 mr-2" />
                    Call {selectedService?.name}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Emergency Services Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Emergency Services</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {emergencyServices.map((service, index) => (
              <Card 
                key={service.id}
                className={`group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105 ${
                  !service.available ? 'opacity-50' : ''
                }`}
                onClick={() => handleServiceClick(service)}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}></div>
                
                <CardContent className="p-6 relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${service.color} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      {service.icon}
                    </div>
                    <Badge variant={service.available ? "default" : "secondary"}>
                      {service.available ? 'Available' : 'Busy'}
                    </Badge>
                  </div>
                  
                  <h3 className="text-lg font-bold mb-2">{service.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{service.description}</p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span className="font-mono">{service.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span>Response: {service.responseTime}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-gray-500" />
                      <span className="capitalize">Priority: {service.priority}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex gap-2">
                    <Button 
                      size="sm" 
                      className="flex-1 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
                      disabled={!service.available || loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          Request Help
                        </>
                      )}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCallService(service.phone);
                      }}
                    >
                      <Phone className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Nearby Services */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Nearby Emergency Services</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {nearbyServices.map((service, index) => (
              <Card 
                key={service.id}
                className="hover:shadow-lg transition-all duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        service.type === 'police' ? 'bg-blue-100 text-blue-600' :
                        service.type === 'hospital' ? 'bg-green-100 text-green-600' :
                        service.type === 'ambulance' ? 'bg-red-100 text-red-600' :
                        service.type === 'fire' ? 'bg-orange-100 text-orange-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {service.type === 'police' ? <Shield className="h-4 w-4" /> :
                         service.type === 'hospital' ? <Heart className="h-4 w-4" /> :
                         service.type === 'ambulance' ? <Ambulance className="h-4 w-4" /> :
                         service.type === 'fire' ? <AlertTriangle className="h-4 w-4" /> :
                         <HelpCircle className="h-4 w-4" />}
                      </div>
                      <div>
                        <h4 className="font-semibold">{service.name}</h4>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {service.distance}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {service.eta}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500 fill-current" />
                        <span className="text-sm">{service.rating}</span>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleCallService(service.phone)}
                        disabled={!service.available}
                      >
                        <Phone className="h-3 w-3 mr-1" />
                        Call
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Zap className="h-5 w-5 text-yellow-500" />
              Quick Emergency Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button 
                onClick={() => handleCallService('100')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Phone className="h-4 w-4 mr-2" />
                Police (100)
              </Button>
              <Button 
                onClick={() => handleCallService('108')}
                className="bg-red-600 hover:bg-red-700"
              >
                <Ambulance className="h-4 w-4 mr-2" />
                Ambulance (108)
              </Button>
              <Button 
                onClick={() => handleCallService('1091')}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <PhoneCall className="h-4 w-4 mr-2" />
                Women Helpline (1091)
              </Button>
              <Button 
                onClick={() => navigate('/guardian-management')}
                variant="outline"
                className="border-pink-200 hover:bg-pink-50"
              >
                <Users className="h-4 w-4 mr-2" />
                Alert Guardians
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Service Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-gradient-to-br ${selectedService?.color} text-white`}>
                {selectedService?.icon}
              </div>
              <div>
                <div className="font-bold">{selectedService?.name}</div>
                <div className="text-sm text-gray-600">{selectedService?.description}</div>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          {activeRequest && (
            <div className="space-y-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-3">Request Status</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status</span>
                    <Badge className={getStatusColor(activeRequest.status)}>
                      {activeRequest.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Progress</span>
                    <span className="text-sm font-medium">{activeRequest.progress}%</span>
                  </div>
                  <Progress value={activeRequest.progress} className="h-2" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">ETA</span>
                    <span className="text-sm font-medium">{activeRequest.eta}</span>
                  </div>
                  {activeRequest.assignedUnit && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Assigned Unit</span>
                      <span className="text-sm font-medium">{activeRequest.assignedUnit}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold mb-3">Location Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-blue-600" />
                    <span>Current Location: {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Navigation className="h-4 w-4 text-blue-600" />
                    <span>Location sharing: Enabled</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button onClick={handleCancelRequest} variant="outline" className="border-red-200 hover:bg-red-50">
                  Cancel Request
                </Button>
                <Button onClick={() => handleCallService(selectedService?.phone || '')}>
                  <Phone className="h-4 w-4 mr-2" />
                  Call {selectedService?.name}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
