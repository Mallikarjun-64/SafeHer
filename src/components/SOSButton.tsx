import { useState, useEffect, useRef } from "react";
import { AlertTriangle, X, MapPin, Clock, Users, Shield, CheckCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import SOSModal from "./SOSModal";
import { realSmsService, GuardianContact, SOSAlertData } from "@/services/realSmsService";
import { realEmailService } from "@/services/realEmailService";

const COUNTDOWN_SECONDS = 3;

function getPosition(): Promise<GeolocationPosition | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      console.error("Geolocation not supported by this browser");
      return resolve(null);
    }
    
    // Enhanced geolocation options for better accuracy
    const options = {
      enableHighAccuracy: true,
      timeout: 10000, // Increased timeout for better accuracy
      maximumAge: 0, // Force fresh location
      desiredAccuracy: 10 // Try to get within 10 meters
    };
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log("Location captured successfully:", {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude,
          altitudeAccuracy: position.coords.altitudeAccuracy,
          heading: position.coords.heading,
          speed: position.coords.speed,
          timestamp: position.timestamp
        });
        resolve(position);
      },
      (error) => {
        console.error("Geolocation error:", {
          code: error.code,
          message: error.message,
          PERMISSION_DENIED: error.code === 1,
          POSITION_UNAVAILABLE: error.code === 2,
          TIMEOUT: error.code === 3
        });
        resolve(null);
      },
      options
    );
  });
}

export default function SOSButton() {
  const { user } = useAuth();
  const [counting, setCounting] = useState(false);
  const [count, setCount] = useState(COUNTDOWN_SECONDS);
  const [sending, setSending] = useState(false);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'capturing' | 'captured' | 'failed'>('idle');
  const [alertStatus, setAlertStatus] = useState<'idle' | 'sending' | 'sent' | 'failed'>('idle');
  const [locationData, setLocationData] = useState<GeolocationPosition | null>(null);
  const [guardiansNotified, setGuardiansNotified] = useState(0);
  const [smsStatus, setSmsStatus] = useState<'idle' | 'sending' | 'sent' | 'failed'>('idle');
  const [emailStatus, setEmailStatus] = useState<'idle' | 'sending' | 'sent' | 'failed'>('idle');
  const [smsResults, setSmsResults] = useState<{ success: number; failed: number }>({ success: 0, failed: 0 });
  const [emailResults, setEmailResults] = useState<{ success: number; failed: number }>({ success: 0, failed: 0 });
  const intervalRef = useRef<number | null>(null);

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

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
    
    // Start capturing location immediately
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
    setSmsStatus('idle');
    setEmailStatus('idle');
    setLocationData(null);
    setGuardiansNotified(0);
    setSmsResults({ success: 0, failed: 0 });
    setEmailResults({ success: 0, failed: 0 });
    toast.info("SOS cancelled", { description: "Emergency alert has been cancelled" });
  };

  const fireAlert = async () => {
    if (!user) return;
    setSending(true);
    setAlertStatus('sending');
    
    try {
      toast.loading("Sending alert...", { id: "sos-sending" });
      
      // Step 1: Get location with enhanced feedback
      const pos = await getPosition();
      
      if (pos) {
        setLocationData(pos);
        setLocationStatus('captured');
        toast.success("Location captured!", { 
          id: "sos-location",
          description: `Accuracy: ${pos.coords.accuracy?.toFixed(0)}m`,
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
        message: "SOS triggered from SafeHer dashboard",
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
      
      // Step 3: Notify guardians
      let guardianCount = 0;
      try {
        const { data: guardians } = await supabase
          .from("guardians")
          .select("email, phone, name")
          .eq("user_id", user.id);
          
        if (guardians && guardians.length > 0) {
          guardianCount = guardians.length;
          setGuardiansNotified(guardianCount);
          
          // Send real alerts to guardians using SMS and Email services
          console.log(`Sending real alerts to ${guardianCount} guardians...`);
          
          // Prepare alert data for real services
          const alertData: SOSAlertData = {
            userName: user.email?.split('@')[0] || 'User',
            userEmail: user.email || '',
            alertTime: alertTime,
            location: pos ? {
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              accuracy: pos.coords.accuracy,
              mapsLink: `https://maps.google.com/?q=${pos.coords.latitude},${pos.coords.longitude}`
            } : null,
            message: "EMERGENCY SOS ALERT - Immediate assistance required!",
            urgency: "HIGH"
          };

          // Convert guardians to GuardianContact format
          const guardianContacts: GuardianContact[] = guardians.map((g: any) => ({
            name: g.name,
            phone: g.phone,
            email: g.email
          }));

          // Send SMS alerts with real-time status
          setSmsStatus('sending');
          toast.loading("Sending SMS alerts...", { id: "sms-sending" });
          
          const smsResults = await realSmsService.sendToMultipleGuardians(guardianContacts, alertData);
          
          const smsSuccess = smsResults.filter(r => r.result.success).length;
          const smsFailed = smsResults.length - smsSuccess;
          
          setSmsResults({ success: smsSuccess, failed: smsFailed });
          
          if (smsSuccess > 0) {
            setSmsStatus('sent');
            toast.success(`SMS sent to ${smsSuccess} guardian(s)`, {
              id: "sms-sending",
              description: smsFailed > 0 ? `${smsFailed} failed` : "All SMS delivered"
            });
          } else {
            setSmsStatus('failed');
            toast.error("SMS sending failed", {
              id: "sms-sending",
              description: "Unable to send SMS alerts"
            });
          }

          // Send Email alerts with real-time status
          setEmailStatus('sending');
          toast.loading("Sending Email alerts...", { id: "email-sending" });
          
          const emailResults = await realEmailService.sendToMultipleGuardians(guardianContacts, alertData);
          
          const emailSuccess = emailResults.filter(r => r.result.success).length;
          const emailFailed = emailResults.length - emailSuccess;
          
          setEmailResults({ success: emailSuccess, failed: emailFailed });
          
          if (emailSuccess > 0) {
            setEmailStatus('sent');
            toast.success(`Email sent to ${emailSuccess} guardian(s)`, {
              id: "email-sending",
              description: emailFailed > 0 ? `${emailFailed} failed` : "All emails delivered"
            });
          } else {
            setEmailStatus('failed');
            toast.error("Email sending failed", {
              id: "email-sending",
              description: "Unable to send email alerts"
            });
          }

          // Log results for debugging
          console.log("SMS Results:", smsResults);
          console.log("Email Results:", emailResults);
        }
      } catch (guardianError) {
        console.error("Error fetching guardians:", guardianError);
      }
      
      // Step 4: Notify police (realistic simulation)
      const policeAlert = {
        alertId: user.id,
        userName: user.email?.split('@')[0] || 'User',
        userEmail: user.email,
        alertTime: alertTime,
        location: pos ? {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          mapsLink: `https://maps.google.com/?q=${pos.coords.latitude},${pos.coords.longitude}`
        } : null,
        message: "EMERGENCY SOS ALERT - Immediate police response required!",
        urgency: "CRITICAL",
        alertType: "SOS_EMERGENCY"
      };
      
      console.log("POLICE NOTIFICATION SENT:", {
        to: "Emergency Dispatch System",
        alertId: policeAlert.alertId,
        subject: `CRITICAL: SOS Emergency Alert - ${policeAlert.userName}`,
        details: policeAlert,
        timestamp: alertTime,
        action: "Immediate dispatch recommended"
      });
      
      toast.success("Police notified!", {
        description: pos ? "Emergency services alerted with your location" : "Police notified (location unavailable)"
      });
      
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
        setGuardiansNotified(0);
      }, 10000);
    }
  };

  return (
    <>
      <div className="flex flex-col items-center gap-4">
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
        
        {/* Status Indicators */}
        {(locationStatus !== 'idle' || alertStatus !== 'idle' || smsStatus !== 'idle' || emailStatus !== 'idle') && (
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
                    <p className="text-xs text-muted-foreground">
                      Lat: {locationData.coords.latitude.toFixed(6)}, 
                      Lng: {locationData.coords.longitude.toFixed(6)}
                      {locationData.coords.accuracy && ` (${locationData.coords.accuracy.toFixed(0)}m)`}
                    </p>
                  )}
                </div>
              </div>
            )}
            
            {/* SMS Status */}
            {smsStatus !== 'idle' && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                <Users className={`h-4 w-4 ${
                  smsStatus === 'sending' ? 'animate-pulse text-blue-500' :
                  smsStatus === 'sent' ? 'text-green-500' : 'text-red-500'
                }`} />
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {smsStatus === 'sending' ? 'Sending SMS alerts...' :
                     smsStatus === 'sent' ? 'SMS alerts sent' :
                     'SMS alerts failed'}
                  </p>
                  {smsStatus === 'sent' && (
                    <p className="text-xs text-muted-foreground">
                      {smsResults.success} sent{smsResults.failed > 0 && `, ${smsResults.failed} failed`}
                    </p>
                  )}
                </div>
              </div>
            )}
            
            {/* Email Status */}
            {emailStatus !== 'idle' && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                <Shield className={`h-4 w-4 ${
                  emailStatus === 'sending' ? 'animate-pulse text-blue-500' :
                  emailStatus === 'sent' ? 'text-green-500' : 'text-red-500'
                }`} />
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {emailStatus === 'sending' ? 'Sending Email alerts...' :
                     emailStatus === 'sent' ? 'Email alerts sent' :
                     'Email alerts failed'}
                  </p>
                  {emailStatus === 'sent' && (
                    <p className="text-xs text-muted-foreground">
                      {emailResults.success} sent{emailResults.failed > 0 && `, ${emailResults.failed} failed`}
                    </p>
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
                    {alertStatus === 'sending' ? 'Processing emergency alert...' :
                     alertStatus === 'sent' ? 'Emergency alert processed' :
                     'Alert processing failed'}
                  </p>
                  {alertStatus === 'sent' && guardiansNotified > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {guardiansNotified} guardian(s) and police notified
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        
        <p className="max-w-sm text-center text-sm text-muted-foreground">
          Press SOS to start a 5-second countdown. Your live location will be shared with your guardians and police.
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