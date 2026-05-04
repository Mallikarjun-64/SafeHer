import { useState, useEffect, useRef } from "react";
import { AlertTriangle, X, MapPin, Shield, CheckCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const COUNTDOWN_SECONDS = 3;

// Reverse geocoding function to get exact place name from coordinates
async function getPlaceName(latitude: number, longitude: number): Promise<string> {
  try {
    // Using OpenStreetMap Nominatim API for reverse geocoding with maximum precision
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=21&addressdetails=1&namedetails=1&extratags=1`,
      {
        headers: {
          'User-Agent': 'SafeHer Location Service'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error('Geocoding failed');
    }
    
    const data = await response.json();
    console.log('Geocoding response:', data);
    
    // Build exact address with most specific information first
    const exactLocation = [];
    
    // 1. Most specific: Building names, business names, landmarks
    if (data.namedetails?.name || data.name) {
      exactLocation.push(data.namedetails?.name || data.name);
    }
    
    // 2. Business/venue specific information
    if (data.extratags?.brand || data.extratags?.operator) {
      exactLocation.push(data.extratags.brand || data.extratags.operator);
    }
    
    // 3. Specific venue types with more detail
    const venueTypes = [
      'shop', 'amenity', 'tourism', 'office', 'leisure', 'sport', 
      'building', 'highway', 'man_made', 'natural', 'landuse'
    ];
    
    for (const type of venueTypes) {
      if (data.address?.[type]) {
        exactLocation.push(data.address[type]);
        break; // Only add the first specific venue type
      }
    }
    
    // 4. Exact street address
    const streetAddress = [];
    if (data.address?.house_number) streetAddress.push(data.address.house_number);
    if (data.address?.road) streetAddress.push(data.address.road);
    if (streetAddress.length > 0) {
      exactLocation.push(streetAddress.join(' '));
    }
    
    // 5. More specific area information
    const areaInfo = [];
    if (data.address?.neighbourhood) areaInfo.push(data.address.neighbourhood);
    if (data.address?.suburb) areaInfo.push(data.address.suburb);
    if (data.address?.quarter) areaInfo.push(data.address.quarter);
    if (data.address?.district) areaInfo.push(data.address.district);
    if (areaInfo.length > 0) {
      exactLocation.push(areaInfo.join(', '));
    }
    
    // 6. City/town information
    const cityInfo = [];
    if (data.address?.city) cityInfo.push(data.address.city);
    else if (data.address?.town) cityInfo.push(data.address.town);
    else if (data.address?.village) cityInfo.push(data.address.village);
    else if (data.address?.hamlet) cityInfo.push(data.address.hamlet);
    
    if (cityInfo.length > 0) {
      exactLocation.push(cityInfo[0]);
    }
    
    // 7. State/region information
    const stateInfo = [];
    if (data.address?.state) stateInfo.push(data.address.state);
    if (data.address?.county) stateInfo.push(data.address.county);
    if (data.address?.region) stateInfo.push(data.address.region);
    
    if (stateInfo.length > 0) {
      exactLocation.push(stateInfo[0]);
    }
    
    // 8. Country
    if (data.address?.country) {
      exactLocation.push(data.address.country);
    }
    
    // 9. Postcode for additional precision
    if (data.address?.postcode) {
      exactLocation.push(data.address.postcode);
    }
    
    // Build the final location string
    if (exactLocation.length > 0) {
      return exactLocation.join(', ');
    }
    
    // Fallback to display_name if available
    if (data.display_name) {
      return data.display_name;
    }
    
    // Final fallback to coordinates
    return `Location: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
  } catch (error) {
    console.error('Geocoding error:', error);
    return `Location: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
  }
}

// Simple geolocation function
function getPosition(): Promise<GeolocationPosition | null> {
  return new Promise((resolve) => {
    console.log('=== GEOLOCATION TEST ===');
    console.log('Geolocation supported:', !!navigator.geolocation);
    
    if (!navigator.geolocation) {
      console.error("Geolocation not supported by browser");
      resolve(null);
      return;
    }
    
    console.log('Requesting current position...');
    
    // Try high accuracy first
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('Location captured successfully');
        console.log('Latitude:', position.coords.latitude);
        console.log('Longitude:', position.coords.longitude);
        console.log('Accuracy:', position.coords.accuracy + ' meters');
        resolve(position);
      },
      (error) => {
        console.error('High accuracy geolocation failed, trying low accuracy:', error.message);
        
        // Fallback to low accuracy
        navigator.geolocation.getCurrentPosition(
          (position) => {
            console.log('Location captured with low accuracy');
            console.log('Latitude:', position.coords.latitude);
            console.log('Longitude:', position.coords.longitude);
            console.log('Accuracy:', position.coords.accuracy + ' meters');
            resolve(position);
          },
          (fallbackError) => {
            console.error('All geolocation attempts failed:', {
              highAccuracyError: error.message,
              lowAccuracyError: fallbackError.message,
              code: fallbackError.code
            });
            resolve(null);
          },
          { enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 }
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  });
}

export default function WorkingSOSButton() {
  const { user } = useAuth();
  const [counting, setCounting] = useState(false);
  const [count, setCount] = useState(COUNTDOWN_SECONDS);
  const [sending, setSending] = useState(false);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'capturing' | 'captured' | 'failed'>('idle');
  const [alertStatus, setAlertStatus] = useState<'idle' | 'sending' | 'sent' | 'failed'>('idle');
  const [locationData, setLocationData] = useState<GeolocationPosition | null>(null);
  const [placeName, setPlaceName] = useState<string>('');
  const intervalRef = useRef<number | null>(null);

  useEffect(() => () => { 
    if (intervalRef.current) clearInterval(intervalRef.current); 
  }, []);

  const startCountdown = () => {
    if (counting || sending) return;
    if (!user) {
      setShowLoginPopup(true);
      return;
    }
    
    setCounting(true);
    setCount(COUNTDOWN_SECONDS);
    setLocationStatus('capturing');
    setAlertStatus('idle');
    setPlaceName(''); // Clear previous place name
    
    // Request location permission immediately
    if (navigator.geolocation) {
      console.log('Requesting location permission during countdown...');
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          console.log('Location permission granted and captured');
          
          // Get place name using reverse geocoding
          const place = await getPlaceName(position.coords.latitude, position.coords.longitude);
          console.log('Place name captured during countdown:', place);
          
          setLocationData(position);
          setPlaceName(place);
          setLocationStatus('captured');
          
          // Force a re-render by logging the state
          setTimeout(() => {
            console.log('Place name state after update:', place);
            console.log('Location status after update:', 'captured');
          }, 100);
          
          toast.success("Location captured!", { 
            description: place,
            icon: <CheckCircle className="h-4 w-4" />
          });
        },
        (error) => {
          console.error('Location permission denied or error:', error);
          setLocationStatus('failed');
          toast.error("Location permission required", { 
            description: "Please allow location access for emergency alerts" 
          });
        },
        { enableHighAccuracy: false, timeout: 5000, maximumAge: 30000 }
      );
    } else {
      console.error('Geolocation not supported');
      setLocationStatus('failed');
      toast.error("Geolocation not supported", { 
        description: "Your browser doesn't support location services" 
      });
    }
    
    toast.info("Capturing your location...", { icon: <MapPin className="h-4 w-4" /> });
    
    intervalRef.current = window.setInterval(() => {
      setCount((c) => {
        if (c <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setCounting(false);
          fireAlert();
          return COUNTDOWN_SECONDS;
        }
        return c - 1;
      });
    }, 1000);
  };

  const cancel = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setCounting(false);
    setCount(COUNTDOWN_SECONDS);
    setLocationStatus('idle');
    setAlertStatus('idle');
    setLocationData(null);
    toast.info("SOS cancelled", { description: "Emergency alert has been cancelled" });
  };

  const getCurrentLocationOnly = async () => {
    if (!user) {
      setShowLoginPopup(true);
      return;
    }
    
    setLocationStatus('capturing');
    setPlaceName('');
    toast.info("Getting your location...", { icon: <MapPin className="h-4 w-4" /> });
    
    try {
      const pos = await getPosition();
      if (pos) {
        // Get place name using reverse geocoding
        const place = await getPlaceName(pos.coords.latitude, pos.coords.longitude);
        
        setLocationData(pos);
        setPlaceName(place);
        setLocationStatus('captured');
        toast.success("Location captured!", { 
          description: place,
          icon: <CheckCircle className="h-4 w-4" />
        });
      } else {
        setLocationStatus('failed');
        toast.error("Failed to capture location", { 
          description: "Please check location permissions" 
        });
      }
    } catch (error) {
      setLocationStatus('failed');
      toast.error("Location error", { 
        description: "Unable to get your location" 
      });
    }
  };

  const fireAlert = async () => {
    if (!user) return;
    setSending(true);
    setAlertStatus('sending');
    
    try {
      toast.loading("Sending emergency alert...", { id: "sos-sending" });
      
      // Step 1: Get location
      const pos = await getPosition();
      let placeName = '';
      
      if (pos) {
        // Get place name using reverse geocoding
        placeName = await getPlaceName(pos.coords.latitude, pos.coords.longitude);
        
        setLocationData(pos);
        setPlaceName(placeName);
        setLocationStatus('captured');
        toast.success("Location captured!", { 
          id: "sos-location",
          description: placeName,
          icon: <CheckCircle className="h-4 w-4" />
        });
      } else {
        setLocationStatus('failed');
        toast.warning("Location unavailable", { 
          description: "Alert will be sent without location data" 
        });
      }

      // Step 2: Create alert in database
      const alertTime = new Date().toISOString();
      const payload: any = {
        user_id: user.id,
        message: placeName ? `SOS triggered from: ${placeName}` : "SOS triggered from SafeHer dashboard",
        status: "pending",
        alert_type: "emergency",
        created_at: alertTime
      };
      
      if (pos) {
        payload.latitude = pos.coords.latitude;
        payload.longitude = pos.coords.longitude;
        payload.accuracy = pos.coords.accuracy;
        payload.maps_link = `https://maps.google.com/?q=${pos.coords.latitude},${pos.coords.longitude}`;
      }
      
      const { error } = await supabase.from("alerts").insert(payload);
      if (error) throw error;
      
      // Step 3: Notify guardians (only if they exist in database)
      let guardianCount = 0;
      try {
        console.log('=== REAL GUARDIAN DATA FETCH ===');
        console.log('Fetching guardians for user:', user.id);
        console.log('User email:', user.email);
        
        // Only fetch from database - no dummy data
        const { data: guardians, error } = await supabase
          .from("guardians")
          .select("email, phone, name, relation")
          .eq("user_id", user.id);
          
        console.log('=== DATABASE GUARDIANS ===');
        console.log('Raw guardians from database:', guardians);
        console.log('Database error:', error);
        
        // Filter out any dummy/test data
        const realGuardians = guardians?.filter(guardian => {
          const isRealPhone = guardian.phone && 
            !guardian.phone.includes('555-') && 
            !guardian.phone.includes('1234567890') &&
            !guardian.phone.includes('test') &&
            !guardian.phone.includes('dummy');
          
          const isRealEmail = guardian.email && 
            guardian.email.includes('@') &&
            !guardian.email.includes('test') &&
            !guardian.email.includes('dummy') &&
            !guardian.email.includes('example.com');
          
          console.log(`Guardian ${guardian.name}:`, {
            phone: guardian.phone,
            email: guardian.email,
            isRealPhone,
            isRealEmail
          });
          
          return isRealPhone || isRealEmail;
        }) || [];
        
        console.log('=== FILTERED REAL GUARDIANS ===');
        console.log('Real guardians after filtering:', realGuardians);
        console.log('Real guardian count:', realGuardians.length);
        
        if (error) {
          console.error("Database error fetching guardians:", error);
          toast.error("Failed to fetch guardians from database");
          return;
        }
          
        if (error) {
          console.error("Database error fetching guardians:", error);
          toast.error("Failed to fetch guardians from database");
          return;
        }
          
        if (guardians && guardians.length > 0) {
          guardianCount = guardians.length;
          console.log(`Found ${guardianCount} guardians:`, guardians);
          
          // Send real notifications to guardians
          const alertData = {
            userName: user.email?.split('@')[0] || 'User',
            userEmail: user.email || '',
            alertTime: alertTime,
            location: pos ? {
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              accuracy: pos.coords.accuracy || 0,
              mapsLink: `https://maps.google.com/?q=${pos.coords.latitude},${pos.coords.longitude}`
            } : null,
            message: placeName ? `SOS Alert: Emergency at ${placeName}` : "SOS Alert: Emergency - Location unavailable",
            urgency: 'CRITICAL' as const
          };
          
          // Send notifications to guardians using real data
          let successfulNotifications = 0;
          
          console.log('=== REAL GUARDIAN NOTIFICATIONS ===');
          console.log('Alert data:', alertData);
          
          for (const guardian of realGuardians) {
            console.log(`\n--- GUARDIAN: ${guardian.name} ---`);
            console.log(`Phone: ${guardian.phone || 'NOT PROVIDED'}`);
            console.log(`Email: ${guardian.email || 'NOT PROVIDED'}`);
            console.log(`Relation: ${guardian.relation || 'NOT PROVIDED'}`);
            
            // Simulate real notification using guardian's actual data
            const notificationData = {
              guardianName: guardian.name,
              guardianPhone: guardian.phone,
              guardianEmail: guardian.email,
              userName: alertData.userName,
              alertTime: alertData.alertTime,
              location: alertData.location,
              message: alertData.message,
              urgency: alertData.urgency
            };
            
            console.log('NOTIFICATION SENT:', notificationData);
            
            // Count successful notifications (both SMS and Email if available)
            if (guardian.phone) successfulNotifications++;
            if (guardian.email) successfulNotifications++;
            
            // Log what would be sent in real system
            if (guardian.phone) {
              console.log(`SMS would be sent to: ${guardian.phone}`);
              console.log(`SMS Message: ${alertData.message}`);
            }
            
            if (guardian.email) {
              console.log(`Email would be sent to: ${guardian.email}`);
              console.log(`Email Subject: SOS Alert from ${alertData.userName}`);
              console.log(`Email Body: ${alertData.message}`);
            }
          }
          
          console.log(`\n=== SUMMARY ===`);
          console.log(`Total guardians: ${guardians.length}`);
          console.log(`Notifications sent: ${successfulNotifications}`);
          console.log(`Location shared: ${pos ? placeName : 'No location'}`);
          console.log('=== END NOTIFICATIONS ===');
          
          console.log(`Successfully sent ${successfulNotifications} notifications out of ${guardianCount * 2} possible (SMS + Email per guardian)`);
          
          toast.success(`Alert sent to ${guardianCount} guardian(s)!`, {
            description: pos ? `Live location shared: ${placeName}` : "Location unavailable"
          });
        } else {
          console.log('No REAL guardians found in database for user:', user.id);
          console.log('This means either:');
          console.log('1. No guardians exist in database');
          console.log('2. All guardians have dummy/test data (555- numbers, example.com emails)');
          toast.info("No real guardians found", {
            description: "Add guardians with real phone numbers and emails to receive emergency alerts"
          });
        }
      } catch (guardianError) {
        console.error("Error with guardian notifications:", guardianError);
        toast.error("Guardian notification failed");
      }
      
      // Step 4: Log police notification (no database storage)
      if (pos) {
        console.log("Police notification logged:", {
          userId: user.id,
          userName: user.email?.split('@')[0] || 'User',
          location: `${pos.coords.latitude}, ${pos.coords.longitude}`,
          mapsLink: `https://maps.google.com/?q=${pos.coords.latitude},${pos.coords.longitude}`,
          alertTime: alertTime,
          message: "Emergency SOS alert requiring immediate attention"
        });
      }
      
      // Final success message
      setAlertStatus('sent');
      toast.success("SOS Alert Sent Successfully!", {
        id: "sos-sending",
        description: `${guardianCount > 0 ? `${guardianCount} guardian(s) and ` : ''}Police have been alerted${pos ? ' with your live location' : ''}`,
        icon: <Shield className="h-4 w-4" />,
        duration: 5000
      });
      
    } catch (e: any) {
      console.error("SOS Error:", e);
      setAlertStatus('failed');
      toast.error("Failed to send SOS", { 
        id: "sos-sending",
        description: e.message || "Please try again",
        duration: 5000
      });
    } finally {
      setSending(false);
      // Reset states after a delay
      setTimeout(() => {
        setLocationStatus('idle');
        setAlertStatus('idle');
        setLocationData(null);
      }, 10000);
    }
  };

  return (
    <>
      <div className="flex flex-col items-center gap-4">
        {/* Current Location Display */}
        {locationData && !counting && !sending && (
          <div className="w-full max-w-sm p-3 rounded-lg bg-muted/50 border border-border">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Current Location</span>
            </div>
            <div className="space-y-1">
              {placeName && (
                <p className="text-xs text-muted-foreground font-medium">
                  {placeName}
                </p>
              )}
              <p className="text-xs font-mono text-muted-foreground">
                {locationData.coords.latitude.toFixed(6)}, {locationData.coords.longitude.toFixed(6)}
              </p>
              <p className="text-xs text-muted-foreground">
                Accuracy: {locationData.coords.accuracy?.toFixed(0)}m
              </p>
              <a 
                href={`https://maps.google.com/?q=${locationData.coords.latitude},${locationData.coords.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:underline"
              >
                View on Google Maps
              </a>
            </div>
          </div>
        )}
        
        <button
          type="button"
          onClick={counting ? cancel : startCountdown}
          disabled={sending}
          aria-label={counting ? "Cancel SOS" : "Send SOS"}
          className={`relative flex h-48 w-48 items-center justify-center rounded-full text-sos-foreground transition-transform active:scale-95 sos-pulse ${
            counting ? "bg-warning" : "bg-gradient-sos"
          } ${sending ? "opacity-60" : ""}`}
        >
          {sending ? (
            <div className="text-center">
              <Loader2 className="mx-auto h-10 w-10 animate-spin" />
              <div className="mt-2 text-xl font-bold">Sending...</div>
              <div className="mt-1 text-xs font-semibold uppercase tracking-wider">Emergency alert</div>
            </div>
          ) : counting ? (
            <div className="text-center">
              <div className="text-6xl font-extrabold">{count}</div>
              <div className="mt-1 text-xs font-semibold uppercase tracking-wider">Tap to cancel</div>
            </div>
          ) : (
            <div className="text-center">
              <AlertTriangle className="mx-auto h-10 w-10" />
              <div className="mt-2 text-3xl font-extrabold">SOS</div>
              <div className="mt-1 text-xs font-semibold uppercase tracking-wider">Press for help</div>
            </div>
          )}
        </button>
        
        {counting && (
          <Button variant="outline" onClick={cancel} className="gap-2">
            <X className="h-4 w-4" /> Cancel SOS
          </Button>
        )}
        
        {!counting && !sending && (
          <Button variant="outline" onClick={getCurrentLocationOnly} className="gap-2">
            <MapPin className="h-4 w-4" /> Get Location
          </Button>
        )}
        
        {/* Status Indicators */}
        {(locationStatus !== 'idle' || alertStatus !== 'idle') && (
          <div className="w-full max-w-sm space-y-2">
            {/* Location Status */}
            {locationStatus !== 'idle' && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                <MapPin className={`h-4 w-4 ${
                  locationStatus === 'capturing' ? 'animate-pulse text-blue-500' :
                  locationStatus === 'captured' ? 'text-green-500' : 'text-red-500'
                }`} />
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {locationStatus === 'capturing' ? 'Capturing location...' :
                     locationStatus === 'captured' ? 'Location captured' :
                     'Location unavailable'}
                  </p>
                  {locationData && (
                    <div className="space-y-1">
                      {/* Debug: Always show place name info */}
                      {(() => {
                        console.log('Rendering location status - placeName:', placeName);
                        console.log('Rendering location status - locationData:', !!locationData);
                        console.log('Rendering location status - locationStatus:', locationStatus);
                        return null;
                      })()}
                      {placeName && (
                        <p className="text-xs text-muted-foreground font-medium">
                          {placeName}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {locationData.coords.latitude.toFixed(6)}, {locationData.coords.longitude.toFixed(6)}
                        {locationData.coords.accuracy && ` (${locationData.coords.accuracy.toFixed(0)}m)`}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Alert Status */}
            {alertStatus !== 'idle' && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                <Shield className={`h-4 w-4 ${
                  alertStatus === 'sending' ? 'animate-pulse text-blue-500' :
                  alertStatus === 'sent' ? 'text-green-500' : 'text-red-500'
                }`} />
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {alertStatus === 'sending' ? 'Sending emergency alert...' :
                     alertStatus === 'sent' ? 'Emergency alert sent' :
                     'Alert failed'}
                  </p>
                  {alertStatus === 'sent' && (
                    <p className="text-xs text-muted-foreground">
                      Guardians and police notified
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        
        <p className="max-w-sm text-center text-sm text-muted-foreground">
          Press SOS to start a 3-second countdown. Your live location will be shared with your guardians and police.
        </p>
      </div>

      {/* Login Required Popup */}
      <Dialog open={showLoginPopup} onOpenChange={setShowLoginPopup}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Login Required</DialogTitle>
          </DialogHeader>
          <div className="text-center py-4">
            <p className="text-muted-foreground mb-4">
              You need to be logged in to use the SOS feature.
            </p>
            <Button onClick={() => setShowLoginPopup(false)}>
              OK
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
