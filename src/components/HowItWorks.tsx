import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import SOSDemo from "./SOSDemo";
import HelpOnWay from "./HelpOnWay";

// Import interfaces for type safety
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
import { 
  Users, 
  Shield, 
  MapPin, 
  AlertTriangle,
  Phone,
  CheckCircle,
  ArrowRight,
  UserPlus,
  Clock,
  Navigation,
  Bell,
  Settings,
  Sparkles,
  Zap,
  ShieldCheck,
  Radio
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Step {
  n: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
  color: string;
  content?: React.ReactNode;
  // Add missing properties for HelpOnWay component
  policeResponse?: PoliceResponse;
  guardianActivities?: GuardianActivity[];
  // Add missing properties that HelpOnWay component uses
  currentTime?: Date;
  selectedTab?: string;
  isExpanded?: boolean;
  // Add missing sosDemo property
  sosDemo?: React.ReactNode;
  // Add missing emergencyNetwork property
  emergencyNetwork?: React.ReactNode;
}

export default function HowItWorks() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedStep, setSelectedStep] = useState<Step | null>(null);
  const [hoveredStep, setHoveredStep] = useState<string | null>(null);

  const addGuardian = () => {
    if (!user) {
      toast.error("Please login to add guardians");
      return;
    }
    navigate("/guardian-management");
  };

  const configureSettings = () => {
    if (!user) {
      toast.error("Please login to configure settings");
      return;
    }
    navigate("/settings");
  };

  const steps: Step[] = [
    {
      n: "1",
      title: "Sign up & add guardians",
      desc: "Create your account and add trusted contacts who should be alerted.",
      icon: <UserPlus className="h-6 w-6" />,
      color: "from-blue-500 to-blue-600",
      content: (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              Get Started in 2 Minutes
            </div>
          </div>
          
          <div className="space-y-4">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-white">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500 text-white">
                    <Users className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg mb-2">Create Your Account</h4>
                    <p className="text-muted-foreground mb-4">Sign up securely in under 2 minutes with email verification</p>
                    <Button asChild className="bg-blue-500 hover:bg-blue-600">
                      <Link to="/auth?mode=signup">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Sign Up Now
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-50 to-white">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500 text-white">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg mb-2">Add Trusted Guardians</h4>
                    <p className="text-muted-foreground mb-4">Invite family, friends, and neighbors to your safety network</p>
                    <Button onClick={addGuardian} variant="outline" className="border-green-200 hover:bg-green-50">
                      <Users className="h-4 w-4 mr-2" />
                      Add Guardians
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-purple-50 to-white">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500 text-white">
                    <Settings className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg mb-2">Configure Alert Settings</h4>
                    <p className="text-muted-foreground mb-4">Customize your safety preferences and notification channels</p>
                    <Button onClick={configureSettings} variant="outline" className="border-purple-200 hover:bg-purple-50">
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    },
    {
      n: "2",
      title: "Help is on the way",
      desc: "Guardians and police receive your live location and can respond immediately.",
      icon: <ShieldCheck className="h-6 w-6" />,
      color: "from-green-500 to-emerald-600",
      content: (
        <div className="space-y-6">
          <HelpOnWay />
        </div>
      )
    },
    {
      n: "3",
      title: "Tap SOS in an emergency",
      desc: "One press starts a 3-second countdown — cancel if accidental, otherwise alert fires.",
      icon: <AlertTriangle className="h-6 w-6" />,
      color: "from-red-500 to-orange-500",
      content: (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm font-medium">
              <Zap className="h-4 w-4" />
              Instant Emergency Response
            </div>
          </div>
          
          <SOSDemo />
        </div>
      ),
      sosDemo: <SOSDemo />,
      emergencyNetwork: (
        <div className="space-y-4">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-indigo-50 to-white">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500 text-white">
                  <Radio className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-lg mb-2">Always-On Monitoring</h4>
                  <p className="text-muted-foreground mb-4">Professional monitoring team ensures immediate response to any alert</p>
                  <div className="p-4 bg-indigo-100 rounded-lg border border-indigo-200">
                    <p className="text-indigo-800 font-medium mb-2">Network Features</p>
                    <ul className="text-sm text-indigo-700 space-y-1">
                      <li>• Instant alert verification</li>
                      <li>• Automatic escalation to police</li>
                      <li>• Live GPS tracking</li>
                      <li>• 24/7 human monitoring</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-white">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500 text-white">
                  <MapPin className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-lg mb-2">Live Location Tracking</h4>
                  <p className="text-muted-foreground mb-4">Real-time GPS tracking for responders</p>
                  <Button variant="outline" className="border-blue-200 hover:bg-blue-50">
                    <MapPin className="h-4 w-4 mr-2" />
                    View Live Map
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-purple-50 to-white">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500 text-white">
                  <Phone className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-lg mb-2">Emergency Response Network</h4>
                  <p className="text-muted-foreground mb-4">Direct access to emergency services</p>
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" size="sm" asChild className="border-red-200 hover:bg-red-50">
                      <a href="tel:1091">
                        <Phone className="h-3 w-3 mr-1" />
                        Women Helpline
                        <span className="ml-auto font-bold">1091</span>
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" asChild className="border-blue-200 hover:bg-blue-50">
                      <a href="tel:112">
                        <Phone className="h-3 w-3 mr-1" />
                        Emergency
                        <span className="ml-auto font-bold">112</span>
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" asChild className="border-green-200 hover:bg-green-50">
                      <a href="tel:100">
                        <Phone className="h-3 w-3 mr-1" />
                        Police
                        <span className="ml-auto font-bold">100</span>
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" asChild className="border-orange-200 hover:bg-orange-50">
                      <a href="tel:108">
                        <Phone className="h-3 w-3 mr-1" />
                        Ambulance
                        <span className="ml-auto font-bold">108</span>
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }
  ];

  return (
    <>
      <div className="grid gap-8 md:grid-cols-3 lg:grid-cols-3">
        {steps.map((step) => (
          <Card 
            key={step.n}
            className={`group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:scale-105 ${
              hoveredStep === step.n ? 'ring-4 ring-primary/20' : ''
            }`}
            onClick={() => setSelectedStep(step)}
            onMouseEnter={() => setHoveredStep(step.n)}
            onMouseLeave={() => setHoveredStep(null)}
          >
            {/* Background gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-5 group-hover:opacity-10 transition-opacity duration-500`}></div>
            
            {/* Number badge */}
            <div className="absolute top-4 right-4">
              <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${step.color} text-white flex items-center justify-center font-bold text-sm shadow-lg`}>
                {step.n}
              </div>
            </div>

            <CardContent className="p-8 relative">
              <div className="text-center">
                {/* Icon with gradient background */}
                <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${step.color} text-white shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                  {step.icon}
                </div>
                
                <h3 className="mt-6 text-xl font-bold text-gray-900">{step.title}</h3>
                <p className="mt-3 text-gray-600 leading-relaxed">{step.desc}</p>
                
                <Button className="mt-6 w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                  <span className="flex items-center justify-center">
                    Learn More
                    <ArrowRight className="h-4 w-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Enhanced Dialog */}
      <Dialog open={!!selectedStep} onOpenChange={() => setSelectedStep(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto border-0 shadow-2xl">
          <div className={`absolute inset-0 bg-gradient-to-br ${selectedStep?.color} opacity-5`}></div>
          
          <DialogHeader className="relative">
            <DialogTitle className="flex items-center gap-4 text-xl">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${selectedStep?.color} text-white shadow-lg`}>
                {selectedStep?.icon}
              </div>
              <div>
                <div className="font-bold">{selectedStep?.title}</div>
                <div className="text-sm text-muted-foreground font-normal">{selectedStep?.desc}</div>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          <div className="relative">
            {selectedStep?.content}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
