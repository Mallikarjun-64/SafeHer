import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, MapPin, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getUserLocation, updateUserLocation, LocationData } from "@/api/location";

export default function LiveLocationPage() {
  const { user } = useAuth();
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch user location on component mount
  useEffect(() => {
    if (user) {
      fetchUserLocation();
    }
  }, [user]);

  const fetchUserLocation = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      const location = await getUserLocation(user.id);
      
      if (location) {
        setLocationData(location);
      } else {
        // If no location data exists, get current location and update
        await getCurrentLocationAndUpdate();
      }
    } catch (err) {
      setError("Failed to fetch location data");
      console.error("Error fetching location:", err);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocationAndUpdate = async () => {
    if (!user) return;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const updatedLocation = await updateUserLocation(user.id, latitude, longitude);
          
          if (updatedLocation) {
            setLocationData(updatedLocation);
          }
        },
        (error) => {
          setError("Unable to get your current location");
          console.error("Geolocation error:", error);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setError("Geolocation is not supported by your browser");
    }
  };

  const handleRefreshLocation = async () => {
    if (!user) return;
    
    setRefreshing(true);
    await getCurrentLocationAndUpdate();
    setRefreshing(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
          <div className="container mx-auto flex h-16 items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-hero">
                <Shield className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold tracking-tight">SafeHer</span>
            </Link>
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild>
                <Link to="/">Back to Home</Link>
              </Button>
            </div>
          </div>
        </header>

        <section className="container mx-auto py-20">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">
              Location Access Required
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Please log in to access your location data.
            </p>
            <Button asChild className="mt-6">
              <Link to="/auth">Login</Link>
            </Button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-hero">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight">SafeHer</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link to="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="container mx-auto py-20">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">
              Your Live Location
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Real-time location tracking for {user.full_name}
            </p>
          </div>

          {loading ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading location data...</p>
              </CardContent>
            </Card>
          ) : error ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="text-red-600 mb-4">
                  <MapPin className="h-12 w-12 mx-auto" />
                </div>
                <p className="text-red-600 font-medium mb-4">{error}</p>
                <Button onClick={fetchUserLocation}>Try Again</Button>
              </CardContent>
            </Card>
          ) : locationData ? (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Current Location
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRefreshLocation}
                      disabled={refreshing}
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">Latitude:</span>
                      <span className="text-blue-600">{locationData.latitude.toFixed(6)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">Longitude:</span>
                      <span className="text-blue-600">{locationData.longitude.toFixed(6)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">Accuracy:</span>
                      <span className="text-green-600">±{locationData.accuracy} meters</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">Last Updated:</span>
                      <span className="text-gray-600">
                        {new Date(locationData.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Location Map</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg overflow-hidden h-96">
                    <iframe
                      src={`https://maps.google.com/maps?q=${locationData.latitude},${locationData.longitude}&z=16&output=embed`}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      title="Your Location"
                      allowFullScreen
                      loading="lazy"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
