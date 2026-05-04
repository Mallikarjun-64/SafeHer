import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ShieldCheck,
  MapPin,
  Users,
  Clock,
  Navigation,
  Phone,
  CheckCircle,
  AlertTriangle,
  Radio,
  Activity,
  Heart,
  Shield,
  Star,
  MessageSquare,
  Zap,
  ChevronRight
} from 'lucide-react';

interface GuardianActivity {
  id: string;
  name: string;
  status: 'responding' | 'enroute' | 'arrived' | 'safe';
  lastSeen: string;
  location?: string;
}

interface PoliceResponse {
  unitId: string;
  officerName: string;
  status: 'dispatched' | 'responding' | 'arrived' | 'on-scene';
  eta: string;
  distance: string;
}

function HelpOnWay() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedTab, setSelectedTab] = useState<'guardians' | 'police'>('guardians');
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Mock data for demonstration
  const guardianActivities: GuardianActivity[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      status: 'responding',
      lastSeen: '2 minutes ago',
      location: '0.8 km away'
    },
    {
      id: '2',
      name: 'Michael Chen',
      status: 'enroute',
      lastSeen: '5 minutes ago',
      location: '1.2 km away'
    },
    {
      id: '3',
      name: 'Emily Davis',
      status: 'arrived',
      lastSeen: 'Just now',
      location: 'Your location'
    }
  ];

  const policeResponse: PoliceResponse = {
    unitId: 'UNIT-42',
    officerName: 'Officer Miller',
    status: 'responding',
    eta: '3 minutes',
    distance: '0.5 km'
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'responding':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'enroute':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'arrived':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'safe':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'responding':
        return <Activity className="h-4 w-4" />;
      case 'enroute':
        return <Navigation className="h-4 w-4" />;
      case 'arrived':
        return <CheckCircle className="h-4 w-4" />;
      case 'safe':
        return <Shield className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getPoliceStatusColor = (status: string) => {
    switch (status) {
      case 'dispatched':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'responding':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'arrived':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'on-scene':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPoliceStatusIcon = (status: string) => {
    switch (status) {
      case 'dispatched':
        return <Radio className="h-4 w-4" />;
      case 'responding':
        return <Activity className="h-4 w-4" />;
      case 'arrived':
        return <CheckCircle className="h-4 w-4" />;
      case 'on-scene':
        return <Shield className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const toggleCardExpansion = (cardId: string) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  };

  const callGuardian = (guardianName: string) => {
    console.log(`Calling ${guardianName}...`);
    // In a real app, this would initiate a phone call
    window.open(`tel:+1234567890`); // Replace with actual guardian phone
  };

  const messageGuardian = (guardianName: string) => {
    console.log(`Messaging ${guardianName}...`);
    // In a real app, this would open a messaging interface
    alert(`Opening message with ${guardianName}`);
  };

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50 to-white overflow-hidden">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg animate-pulse">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Help is on the way</h3>
              <p className="text-gray-600">Emergency services have been notified and are responding</p>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            {formatTime(currentTime)}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
          <button
            onClick={() => setSelectedTab('guardians')}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              selectedTab === 'guardians' 
                ? 'bg-white text-green-700 shadow-sm' 
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
          >
            <Users className="h-4 w-4 mr-2" />
            Guardians
          </button>
          <button
            onClick={() => setSelectedTab('police')}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              selectedTab === 'police' 
                ? 'bg-white text-blue-700 shadow-sm' 
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
          >
            <Shield className="h-4 w-4 mr-2" />
            Police Response
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {selectedTab === 'guardians' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-900">Guardian Activity</h4>
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  3 Guardians Responding
                </Badge>
              </div>

              {/* Guardian Cards */}
              <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
                {guardianActivities.map((guardian, index) => (
                  <Card 
                    key={guardian.id}
                    className="border hover:shadow-lg transition-all duration-300 cursor-pointer"
                    onClick={() => toggleCardExpansion(guardian.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getStatusColor(guardian.status)}`}>
                            {getStatusIcon(guardian.status)}
                          </div>
                          <div>
                            <h5 className="font-semibold text-gray-900">{guardian.name}</h5>
                            <p className="text-sm text-gray-600">{guardian.lastSeen}</p>
                            {guardian.location && (
                              <p className="text-xs text-gray-500 flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {guardian.location}
                              </p>
                            )}
                          </div>
                        </div>
                        <ChevronRight 
                          className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                            expandedCards.has(guardian.id) ? 'rotate-90' : ''
                          }`} 
                        />
                      </div>
                      {expandedCards.has(guardian.id) && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <Heart className="h-4 w-4 text-red-500" />
                              <span className="text-gray-700">Emergency alert received at 2:45 PM</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <MessageSquare className="h-4 w-4 text-blue-500" />
                              <span className="text-gray-700">Contacted immediately via SMS and call</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Navigation className="h-4 w-4 text-green-500" />
                              <span className="text-gray-700">Current location: 28.6139°N, 77.2090°E</span>
                            </div>
                          </div>
                          {/* Action Buttons */}
                          <div className="mt-4 pt-3 border-t border-gray-200 flex gap-2">
                            <Button 
                              size="sm" 
                              className="flex-1 bg-green-600 hover:bg-green-700"
                              onClick={(e) => {
                                e.stopPropagation();
                                callGuardian(guardian.name);
                              }}
                            >
                              <Phone className="h-3 w-3 mr-1" />
                              Call
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="flex-1 border-blue-200 hover:bg-blue-50"
                              onClick={(e) => {
                                e.stopPropagation();
                                messageGuardian(guardian.name);
                              }}
                            >
                              <MessageSquare className="h-3 w-3 mr-1" />
                              Message
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Safety Instructions */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h5 className="font-semibold text-blue-900 mb-3">What to do now:</h5>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Stay calm and move to a safe location if possible</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Phone className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Keep your phone available for emergency calls</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Shield className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Follow instructions from emergency responders</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Users className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Your exact location is being shared with trusted contacts</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {selectedTab === 'police' && (
            <div className="space-y-4">
              {/* Police Response Status */}
              <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">Police Response Status</h4>
                  <Badge className={`${getPoliceStatusColor(policeResponse.status)}`}>
                    {getPoliceStatusIcon(policeResponse.status)}
                    <span className="ml-1 capitalize">{policeResponse.status}</span>
                  </Badge>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {/* Unit Information */}
                  <div className="space-y-3">
                    <h5 className="font-medium text-gray-900 mb-2">Responding Unit</h5>
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                          <Shield className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{policeResponse.unitId}</p>
                          <p className="text-sm text-gray-600">Officer {policeResponse.officerName}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span>Dispatched: 2:42 PM</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Navigation className="h-4 w-4 text-gray-500" />
                          <span>ETA: {policeResponse.eta}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Location & Distance */}
                  <div className="space-y-3">
                    <h5 className="font-medium text-gray-900 mb-2">Location & Distance</h5>
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-red-500" />
                          <div>
                            <p className="font-medium text-gray-900">Distance to you</p>
                            <p className="text-2xl font-bold text-red-600">{policeResponse.distance}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Navigation className="h-4 w-4 text-green-500" />
                          <div>
                            <p className="font-medium text-gray-900">Your last known location</p>
                            <p className="text-sm text-gray-600">28.6139°N, 77.2090°E</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button className="flex-1 bg-green-600 hover:bg-green-700">
                    <Phone className="h-4 w-4 mr-2" />
                    Call Officer
                  </Button>
                  <Button variant="outline" className="border-blue-200 hover:bg-blue-50">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </div>
              </div>

              {/* Reassurance Message */}
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Shield className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h5 className="font-semibold text-green-900 mb-2">You're Safe Now</h5>
                    <p className="text-sm text-green-800">
                      Help is on the way and emergency services have been alerted. 
                      Your location is being actively tracked and shared with responders. 
                      Stay where you are and follow instructions from emergency personnel.
                    </p>
                    <div className="mt-3 flex items-center gap-2 text-sm text-green-700">
                      <CheckCircle className="h-4 w-4" />
                      <span>Multiple responders are coordinating to ensure your safety</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default HelpOnWay;
