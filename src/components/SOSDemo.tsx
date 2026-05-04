import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  MapPin, 
  CheckCircle, 
  Clock, 
  Radio, 
  Navigation, 
  Users, 
  Shield,
  RefreshCw,
  Zap,
  Bell,
  Smartphone
} from 'lucide-react';

type SOSStep = 'idle' | 'countdown' | 'location' | 'alert' | 'completed';

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export default function SOSDemo() {
  const [currentStep, setCurrentStep] = useState<SOSStep>('idle');
  const [countdown, setCountdown] = useState(3);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isDemoActive, setIsDemoActive] = useState(false);

  useEffect(() => {
    if (currentStep === 'countdown' && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (currentStep === 'countdown' && countdown === 0) {
      setCurrentStep('location');
      simulateLocationCapture();
    }
  }, [currentStep, countdown]);

  const simulateLocationCapture = () => {
    // Simulate getting location
    setTimeout(() => {
      const mockLocation: LocationData = {
        latitude: 28.6139 + (Math.random() - 0.5) * 0.01,
        longitude: 77.2090 + (Math.random() - 0.5) * 0.01,
        accuracy: 5 + Math.random() * 10
      };
      setLocation(mockLocation);
      setCurrentStep('alert');
      
      // Simulate alert sending
      setTimeout(() => {
        setCurrentStep('completed');
        setIsDemoActive(false);
      }, 2000);
    }, 1500);
  };

  const handleTapSOS = () => {
    setCurrentStep('countdown');
    setCountdown(3);
    setIsDemoActive(true);
    setLocation(null);
  };

  const handleTryAgain = () => {
    setCurrentStep('idle');
    setCountdown(3);
    setLocation(null);
    setIsDemoActive(false);
  };

  const getStepIcon = () => {
    switch (currentStep) {
      case 'idle':
        return <AlertTriangle className="h-8 w-8" />;
      case 'countdown':
        return <Clock className="h-8 w-8 animate-pulse" />;
      case 'location':
        return <MapPin className="h-8 w-8 animate-bounce" />;
      case 'alert':
        return <Radio className="h-8 w-8 animate-pulse" />;
      case 'completed':
        return <CheckCircle className="h-8 w-8" />;
      default:
        return <AlertTriangle className="h-8 w-8" />;
    }
  };

  const getStepColor = () => {
    switch (currentStep) {
      case 'idle':
        return 'from-gray-500 to-gray-600';
      case 'countdown':
        return 'from-yellow-500 to-orange-500';
      case 'location':
        return 'from-blue-500 to-cyan-500';
      case 'alert':
        return 'from-red-500 to-pink-500';
      case 'completed':
        return 'from-green-500 to-emerald-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'idle':
        return 'Emergency SOS Demo';
      case 'countdown':
        return 'Activating SOS...';
      case 'location':
        return 'Capturing Location...';
      case 'alert':
        return 'Sending Alert...';
      case 'completed':
        return 'Alert Sent Successfully!';
      default:
        return 'Emergency SOS Demo';
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 'idle':
        return 'Tap the SOS button to simulate an emergency alert';
      case 'countdown':
        return `Emergency will be triggered in ${countdown} seconds`;
      case 'location':
        return 'Getting your precise location for emergency services';
      case 'alert':
        return 'Notifying your guardians and emergency contacts';
      case 'completed':
        return 'Your emergency alert has been sent to all contacts';
      default:
        return 'Tap the SOS button to simulate an emergency alert';
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50">
        <CardContent className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br ${getStepColor()} text-white shadow-lg mb-4 transition-all duration-300`}>
              {getStepIcon()}
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {getStepTitle()}
            </h3>
            <p className="text-gray-600">
              {getStepDescription()}
            </p>
          </div>

          {/* SOS Button */}
          {currentStep === 'idle' && (
            <div className="text-center">
              <Button
                onClick={handleTapSOS}
                size="lg"
                className="w-full h-20 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white text-lg font-bold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                <AlertTriangle className="h-6 w-6 mr-3" />
                Tap SOS
                <AlertTriangle className="h-6 w-6 ml-3" />
              </Button>
              <p className="text-sm text-gray-500 mt-4">
                This is a demo only - no real alerts will be sent
              </p>
            </div>
          )}

          {/* Countdown Display */}
          {currentStep === 'countdown' && (
            <div className="text-center">
              <div className="relative inline-flex items-center justify-center">
                <div className="w-32 h-32 rounded-full border-8 border-yellow-200 border-t-yellow-500 animate-spin"></div>
                <div className="absolute text-4xl font-bold text-yellow-600">
                  {countdown}
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-4">
                Hold tight or cancel to prevent accidental activation
              </p>
            </div>
          )}

          {/* Location Capture */}
          {currentStep === 'location' && (
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center animate-pulse">
                  <MapPin className="h-8 w-8 text-blue-600" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900">Finding Location</p>
                  <p className="text-sm text-gray-600">GPS + WiFi + Cell Tower</p>
                </div>
              </div>
              <div className="flex justify-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          )}

          {/* Alert Sending */}
          {currentStep === 'alert' && (
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center animate-pulse">
                  <Radio className="h-8 w-8 text-red-600" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900">Sending Alert</p>
                  <p className="text-sm text-gray-600">To guardians & emergency services</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-center space-x-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Notifying guardians...</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <Shield className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Contacting emergency services...</span>
                </div>
              </div>
            </div>
          )}

          {/* Completed */}
          {currentStep === 'completed' && (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              
              <div className="space-y-3">
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Alert Sent Successfully
                </Badge>
                
                {location && (
                  <div className="bg-gray-50 rounded-lg p-3 text-sm">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">Location Captured</span>
                    </div>
                    <div className="text-gray-600 space-y-1">
                      <p>Lat: {location.latitude.toFixed(6)}</p>
                      <p>Lng: {location.longitude.toFixed(6)}</p>
                      <p>Accuracy: ±{location.accuracy.toFixed(1)}m</p>
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  <div className="flex items-center justify-center space-x-2">
                    <Users className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-600">3 Guardians notified</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <Shield className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-600">Emergency services alerted</span>
                  </div>
                </div>
              </div>
              
              <Button
                onClick={handleTryAgain}
                variant="outline"
                className="border-green-200 hover:bg-green-50"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          )}

          {/* Cancel Button for Active Demo */}
          {isDemoActive && currentStep !== 'completed' && (
            <div className="text-center mt-6">
              <Button
                onClick={handleTryAgain}
                variant="outline"
                size="sm"
                className="border-gray-200 hover:bg-gray-50"
              >
                Cancel Demo
              </Button>
            </div>
          )}

          {/* Demo Info */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-center space-x-6 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <Zap className="h-3 w-3" />
                <span>Instant</span>
              </div>
              <div className="flex items-center space-x-1">
                <Bell className="h-3 w-3" />
                <span>Alerts</span>
              </div>
              <div className="flex items-center space-x-1">
                <Smartphone className="h-3 w-3" />
                <span>Mobile</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
