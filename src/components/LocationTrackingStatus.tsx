import { useState, useEffect } from "react";
import { MapPin, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { locationTrackingService, LocationData } from "@/services/locationTrackingService";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function LocationTrackingStatus() {
  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>("");

  useEffect(() => {
    console.log('=== LOCATION TRACKING STATUS COMPONENT MOUNTED ===');
    console.log('Location tracking service available:', !!locationTrackingService);
    console.log('Is currently tracking:', locationTrackingService.isCurrentlyTracking());
    
    // Subscribe to location updates
    const unsubscribe = locationTrackingService.subscribe((locationData) => {
      console.log('Location update received in component:', locationData);
      setCurrentLocation(locationData);
      setLastUpdate(new Date().toLocaleTimeString());
    });

    // Check initial tracking status
    setIsTracking(locationTrackingService.isCurrentlyTracking());
    console.log('Initial tracking status set to:', locationTrackingService.isCurrentlyTracking());

    return () => {
      console.log('LocationTrackingStatus component unmounted');
      unsubscribe();
    };
  }, []);

  return (
    <Card className="border-0 shadow-lg">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isTracking ? (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                <MapPin className="h-4 w-4 text-green-600 animate-pulse" />
              </div>
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                <AlertCircle className="h-4 w-4 text-gray-600" />
              </div>
            )}
            <div>
              <p className="text-sm font-medium">
                {isTracking ? "Location Tracking Active" : "Location Tracking Inactive"}
              </p>
              {currentLocation && (
                <p className="text-xs text-muted-foreground">
                  Last update: {lastUpdate}
                </p>
              )}
            </div>
          </div>
          <Badge variant={isTracking ? "default" : "secondary"}>
            {isTracking ? "Active" : "Inactive"}
          </Badge>
        </div>

        {currentLocation && (
          <div className="mt-3 space-y-2">
            <div className="flex items-center gap-2 text-xs">
              <MapPin className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">
                {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
              </span>
              <span className="text-muted-foreground">
                (±{currentLocation.accuracy.toFixed(0)}m)
              </span>
            </div>
            <a 
              href={currentLocation.mapsLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline"
            >
              View on Google Maps
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
