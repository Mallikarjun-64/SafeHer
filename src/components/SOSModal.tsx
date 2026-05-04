import { useState, useEffect } from "react";
import { X, Phone, MapPin, Users, AlertTriangle, Shield, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";

const COUNTDOWN_SECONDS = 3;

interface SOSModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SOSModal({ open, onOpenChange }: SOSModalProps) {
  const { user } = useAuth();
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [isActive, setIsActive] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (!open) {
      setCountdown(COUNTDOWN_SECONDS);
      setIsActive(false);
      return;
    }

    // Get current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          });
        },
        () => {
          console.log("Location access denied");
        }
      );
    }
  }, [open]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive && countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            sendSOS();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, countdown]);

  const startSOS = () => {
    if (!user) {
      toast.error("Please login to use SOS feature");
      return;
    }
    setIsActive(true);
  };

  const cancelSOS = () => {
    setIsActive(false);
    setCountdown(COUNTDOWN_SECONDS);
    toast.info("SOS cancelled");
  };

  const sendSOS = async () => {
    if (!user) return;
    
    setIsSending(true);
    try {
      const payload: any = {
        user_id: user.id,
        message: "EMERGENCY SOS ACTIVATED",
        status: "pending"
      };

      if (location) {
        payload.latitude = location.lat;
        payload.longitude = location.lng;
      }

      const { error } = await supabase.from("alerts").insert(payload);
      if (error) throw error;

      toast.success("🚨 SOS Sent Successfully!", {
        description: "Emergency services and your guardians have been alerted."
      });

      // Close modal after successful SOS
      setTimeout(() => {
        onOpenChange(false);
        setIsActive(false);
        setCountdown(COUNTDOWN_SECONDS);
      }, 2000);

    } catch (error: any) {
      toast.error("Failed to send SOS", {
        description: error.message
      });
    } finally {
      setIsSending(false);
    }
  };

  const emergencyContacts = [
    { name: "Women Helpline", number: "1091", icon: Phone },
    { name: "Emergency Services", number: "112", icon: Shield },
    { name: "Police", number: "100", icon: Shield }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Emergency SOS
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Main SOS Button */}
          <Card className={`border-2 ${isActive ? "border-red-500 bg-red-50" : "border-gray-200"}`}>
            <CardContent className="p-6">
              <div className="text-center">
                {isActive ? (
                  <div className="space-y-4">
                    <div className="text-6xl font-bold text-red-600 animate-pulse">
                      {countdown}
                    </div>
                    <p className="text-sm text-red-600 font-medium">
                      Sending SOS in {countdown} seconds...
                    </p>
                    <Button 
                      onClick={cancelSOS}
                      variant="outline"
                      className="w-full border-red-300 text-red-600 hover:bg-red-100"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel SOS
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="h-20 w-20 mx-auto rounded-full bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center text-white shadow-lg">
                      <AlertTriangle className="h-10 w-10" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Press for Emergency Help</h3>
                    <p className="text-sm text-gray-600">
                      Click to start 10-second countdown to send alert
                    </p>
                    <Button 
                      onClick={startSOS}
                      className="w-full bg-red-600 hover:bg-red-700 text-white"
                      size="lg"
                    >
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Activate SOS
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Location Info */}
          {location && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="font-medium">Location Ready</p>
                    <p className="text-gray-600">
                      {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Emergency Contacts */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Emergency Contacts
            </h4>
            <div className="grid gap-2">
              {emergencyContacts.map((contact) => (
                <Button
                  key={contact.name}
                  variant="outline"
                  className="justify-start"
                  asChild
                >
                  <a href={`tel:${contact.number}`}>
                    <contact.icon className="h-4 w-4 mr-2" />
                    {contact.name} - {contact.number}
                  </a>
                </Button>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm">
              <Users className="h-4 w-4 mr-1" />
              Alert Guardians
            </Button>
            <Button variant="outline" size="sm">
              <MapPin className="h-4 w-4 mr-1" />
              Share Location
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
