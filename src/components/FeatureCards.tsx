import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
  Share2, 
  Phone, 
  MapPin, 
  Users, 
  Shield, 
  AlertTriangle,
  Clock,
  Navigation,
  MessageCircle,
  Heart,
  BookOpen,
  Camera,
  FileText,
  Settings
} from "lucide-react";
import { toast } from "sonner";

interface Feature {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  content?: React.ReactNode;
}

interface FeatureCardsProps {
  user?: any;
}

export default function FeatureCards({ user }: FeatureCardsProps) {
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);

  const shareLocation = () => {
    if (!navigator.geolocation) return toast.error("Geolocation not supported");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const url = `https://www.google.com/maps?q=${pos.coords.latitude},${pos.coords.longitude}`;
        if (navigator.share) {
          navigator.share({ title: "My live location", text: "I'm sharing my location with you", url });
        } else {
          navigator.clipboard.writeText(url);
          toast.success("Location link copied!");
        }
      },
      () => toast.error("Could not get your location")
    );
  };

  const features: Feature[] = [
    {
      id: "location",
      title: "Share Live Location",
      description: "Send your real-time location to trusted contacts",
      icon: <Share2 className="h-5 w-5" />,
      color: "bg-blue-500",
      content: (
        <div className="space-y-4">
          <div className="grid gap-4">
            <Card className="border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  <div>
                    <h4 className="font-medium">Current Location</h4>
                    <p className="text-sm text-muted-foreground">Your live GPS coordinates</p>
                  </div>
                </div>
                <Button onClick={shareLocation} className="w-full mt-3">
                  <Navigation className="h-4 w-4 mr-2" />
                  Share Location Now
                </Button>
              </CardContent>
            </Card>
            
            <Card className="border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-green-600" />
                  <div>
                    <h4 className="font-medium">Trusted Contacts</h4>
                    <p className="text-sm text-muted-foreground">Share with family & friends</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-3">
                  <Users className="h-4 w-4 mr-2" />
                  Manage Contacts
                </Button>
              </CardContent>
            </Card>

            <Card className="border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-purple-600" />
                  <div>
                    <h4 className="font-medium">Location History</h4>
                    <p className="text-sm text-muted-foreground">Track your movement patterns</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-3">
                  <FileText className="h-4 w-4 mr-2" />
                  View History
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    },
    {
      id: "helpline",
      title: "Women Helpline",
      description: "24/7 emergency support and counseling",
      icon: <Phone className="h-5 w-5" />,
      color: "bg-pink-500",
      content: (
        <div className="space-y-4">
          <div className="grid gap-4">
            <Card className="border-red-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-red-600" />
                    <div>
                      <h4 className="font-medium">Women Helpline</h4>
                      <p className="text-sm text-muted-foreground">24/7 Emergency Support</p>
                    </div>
                  </div>
                  <Badge variant="destructive">1091</Badge>
                </div>
                <Button asChild className="w-full mt-3">
                  <a href="tel:1091">
                    <Phone className="h-4 w-4 mr-2" />
                    Call Now
                  </a>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-orange-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <MessageCircle className="h-5 w-5 text-orange-600" />
                  <div>
                    <h4 className="font-medium">Online Counseling</h4>
                    <p className="text-sm text-muted-foreground">Chat with trained counselors</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-3">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Start Chat
                </Button>
              </CardContent>
            </Card>

            <Card className="border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  <div>
                    <h4 className="font-medium">Resources</h4>
                    <p className="text-sm text-muted-foreground">Legal aid & support information</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-3">
                  <BookOpen className="h-4 w-4 mr-2" />
                  View Resources
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    },
    {
      id: "emergency",
      title: "Emergency Services",
      description: "Quick access to all emergency numbers",
      icon: <Shield className="h-5 w-5" />,
      color: "bg-red-500",
      content: (
        <div className="space-y-4">
          <div className="grid gap-4">
            <Card className="border-red-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <div>
                      <h4 className="font-medium">Emergency Services</h4>
                      <p className="text-sm text-muted-foreground">All-in-one emergency number</p>
                    </div>
                  </div>
                  <Badge variant="destructive">112</Badge>
                </div>
                <Button asChild className="w-full mt-3 bg-red-600 hover:bg-red-700">
                  <a href="tel:112">
                    <Phone className="h-4 w-4 mr-2" />
                    Call Emergency
                  </a>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-blue-600" />
                    <div>
                      <h4 className="font-medium">Police</h4>
                      <p className="text-sm text-muted-foreground">Report crimes & seek help</p>
                    </div>
                  </div>
                  <Badge variant="secondary">100</Badge>
                </div>
                <Button variant="outline" asChild className="w-full mt-3">
                  <a href="tel:100">
                    <Phone className="h-4 w-4 mr-2" />
                    Call Police
                  </a>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Heart className="h-5 w-5 text-green-600" />
                    <div>
                      <h4 className="font-medium">Ambulance</h4>
                      <p className="text-sm text-muted-foreground">Medical emergency services</p>
                    </div>
                  </div>
                  <Badge variant="secondary">108</Badge>
                </div>
                <Button variant="outline" asChild className="w-full mt-3">
                  <a href="tel:108">
                    <Phone className="h-4 w-4 mr-2" />
                    Call Ambulance
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    },
    {
      id: "guardians",
      title: "My Guardians",
      description: "Manage your trusted safety network",
      icon: <Users className="h-5 w-5" />,
      color: "bg-green-500",
      content: (
        <div className="space-y-4">
          <div className="grid gap-4">
            <Card className="border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-green-600" />
                  <div>
                    <h4 className="font-medium">Active Guardians</h4>
                    <p className="text-sm text-muted-foreground">3 guardians monitoring your safety</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-3">
                  <Users className="h-4 w-4 mr-2" />
                  View All Guardians
                </Button>
              </CardContent>
            </Card>

            <Card className="border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Settings className="h-5 w-5 text-blue-600" />
                  <div>
                    <h4 className="font-medium">Guardian Settings</h4>
                    <p className="text-sm text-muted-foreground">Configure alert preferences</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-3">
                  <Settings className="h-4 w-4 mr-2" />
                  Manage Settings
                </Button>
              </CardContent>
            </Card>

            <Card className="border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-purple-600" />
                  <div>
                    <h4 className="font-medium">Emergency Contacts</h4>
                    <p className="text-sm text-muted-foreground">Quick contact your guardians</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-3">
                  <Phone className="h-4 w-4 mr-2" />
                  Contact Guardians
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    },
    {
      id: "safety",
      title: "Safety Tips",
      description: "Learn essential safety guidelines",
      icon: <BookOpen className="h-5 w-5" />,
      color: "bg-purple-500",
      content: (
        <div className="space-y-4">
          <div className="grid gap-4">
            <Card className="border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-5 w-5 text-purple-600" />
                  <div>
                    <h4 className="font-medium">Personal Safety</h4>
                    <p className="text-sm text-muted-foreground">Self-defense & awareness tips</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-3">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Read Tips
                </Button>
              </CardContent>
            </Card>

            <Card className="border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Camera className="h-5 w-5 text-blue-600" />
                  <div>
                    <h4 className="font-medium">Evidence Collection</h4>
                    <p className="text-sm text-muted-foreground">How to document incidents</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-3">
                  <Camera className="h-4 w-4 mr-2" />
                  Learn More
                </Button>
              </CardContent>
            </Card>

            <Card className="border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-green-600" />
                  <div>
                    <h4 className="font-medium">Legal Rights</h4>
                    <p className="text-sm text-muted-foreground">Know your legal protections</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-3">
                  <FileText className="h-4 w-4 mr-2" />
                  View Rights
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    },
    {
      id: "reports",
      title: "Report Incident",
      description: "Document and report safety incidents",
      icon: <FileText className="h-5 w-5" />,
      color: "bg-orange-500",
      content: (
        <div className="space-y-4">
          <div className="grid gap-4">
            <Card className="border-orange-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-orange-600" />
                  <div>
                    <h4 className="font-medium">File Report</h4>
                    <p className="text-sm text-muted-foreground">Create detailed incident report</p>
                  </div>
                </div>
                <Button className="w-full mt-3">
                  <FileText className="h-4 w-4 mr-2" />
                  New Report
                </Button>
              </CardContent>
            </Card>

            <Card className="border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Camera className="h-5 w-5 text-blue-600" />
                  <div>
                    <h4 className="font-medium">Upload Evidence</h4>
                    <p className="text-sm text-muted-foreground">Add photos, videos, documents</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-3">
                  <Camera className="h-4 w-4 mr-2" />
                  Upload Files
                </Button>
              </CardContent>
            </Card>

            <Card className="border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-purple-600" />
                  <div>
                    <h4 className="font-medium">Report History</h4>
                    <p className="text-sm text-muted-foreground">View past incident reports</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-3">
                  <Clock className="h-4 w-4 mr-2" />
                  View History
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    }
  ];

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <Card 
            key={feature.id}
            className="p-5 cursor-pointer transition-all hover:shadow-lg hover:scale-105 border-2 hover:border-primary/20"
            onClick={() => setSelectedFeature(feature)}
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${feature.color} text-white`}>
              {feature.icon}
            </div>
            <h3 className="mt-3 font-semibold">{feature.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{feature.description}</p>
            <Button variant="outline" className="mt-4 w-full">
              Explore Feature
            </Button>
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedFeature} onOpenChange={() => setSelectedFeature(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${selectedFeature?.color} text-white`}>
                {selectedFeature?.icon}
              </div>
              {selectedFeature?.title}
            </DialogTitle>
          </DialogHeader>
          {selectedFeature?.content}
        </DialogContent>
      </Dialog>
    </>
  );
}
