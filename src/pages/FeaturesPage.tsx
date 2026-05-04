import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Shield,
  MapPin,
  Bell,
  Users,
  Activity,
  Lock,
  ArrowRight,
  Heart,
  Zap,
  PhoneCall,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

export default function FeaturesPage() {
  const navigate = useNavigate();
  
  // Handle feature card clicks - show feature details without navigation
  const handleFeatureClick = (featureTitle: string) => {
    console.log('Feature clicked:', featureTitle);
    
    // Show feature information without navigation
    toast.info(`Feature: ${featureTitle}`, {
      description: 'Viewing feature details on this page'
    });
  };

  // Handle feature action button clicks - show action details without navigation
  const handleFeatureAction = (action: string) => {
    console.log('Feature action clicked:', action);
    
    // Show action information without navigation
    toast.info(`Action: ${action}`, {
      description: 'Feature action available - explore this functionality'
    });
  };

  // Get color hex values for gradients
  const getColorHex = (colorClass: string) => {
    const colorMap: { [key: string]: { start: string; end: string } } = {
      "from-red-500 to-orange-500": { start: "#ef4444", end: "#f97316" },
      "from-blue-500 to-cyan-500": { start: "#3b82f6", end: "#06b6d4" },
      "from-purple-500 to-pink-500": { start: "#a855f7", end: "#ec4899" },
      "from-green-500 to-emerald-500": { start: "#22c55e", end: "#10b981" },
      "from-indigo-500 to-blue-500": { start: "#6366f1", end: "#3b82f6" },
      "from-gray-500 to-slate-500": { start: "#6b7280", end: "#64748b" },
    };
    return colorMap[colorClass] || { start: "#6b7280", end: "#64748b" };
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-hero">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight">SafeHer</span>
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            <Link to="/#features" className="text-sm font-medium text-muted-foreground hover:text-foreground">Features</Link>
            <Link to="/#how" className="text-sm font-medium text-muted-foreground hover:text-foreground">How it works</Link>
            <Link to="/#roles" className="text-sm font-medium text-muted-foreground hover:text-foreground">For who</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link to="/auth">Sign in</Link>
            </Button>
            <Button asChild>
              <Link to="/auth?mode=signup">Sign up</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-[0.07]" />
        <div className="container relative mx-auto py-20 md:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-semibold text-primary shadow-sm">
              <Zap className="h-3 w-3" /> Interactive Features · Live Demos · Real Actions
            </span>
            <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight md:text-6xl">
              Built for emergencies
            </h1>
            <p className="mt-6 text-lg text-muted-foreground md:text-xl">
              Every second matters. SafeHer minimizes friction so help reaches you faster.
              Try our interactive features below!
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-12 px-8 text-base">
                <Link to="/auth?mode=signup">Get started — it's free <ArrowRight className="h-4 w-4" /></Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-12 px-8 text-base">
                <Link to="/">Back to Home</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Features */}
      <section className="container mx-auto py-20">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Try Our Features</h2>
          <p className="mt-3 text-muted-foreground">Click on any feature card or action button to see how SafeHer works</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { 
              icon: Bell, 
              title: "One-click SOS", 
              desc: "Tap the SOS button. A 3-second countdown helps avoid accidents, then alerts go out instantly.",
              action: "Test SOS Demo",
              color: "from-red-500 to-orange-500"
            },
            { 
              icon: MapPin, 
              title: "Live location", 
              desc: "Your GPS coordinates are shared with guardians and police in real time on a map.",
              action: "View Map Demo",
              color: "from-blue-500 to-cyan-500"
            },
            { 
              icon: Users, 
              title: "Trusted contacts", 
              desc: "Add family and friends as guardians. They get notified the moment you raise an alert.",
              action: "Add Guardians",
              color: "from-purple-500 to-pink-500"
            },
            { 
              icon: Shield, 
              title: "Police dashboard", 
              desc: "Authorities see live alerts, update status, and coordinate response.",
              action: "View Dashboard",
              color: "from-green-500 to-emerald-500"
            },
            { 
              icon: PhoneCall, 
              title: "Helplines & stations", 
              desc: "Quick access to emergency helplines and the nearest police station.",
              action: "Call Helpline",
              color: "from-indigo-500 to-blue-500"
            },
            { 
              icon: Lock, 
              title: "Privacy-first", 
              desc: "Row-level security and role-based access. Your data is yours.",
              action: "Privacy Settings",
              color: "from-gray-500 to-slate-500"
            },
          ].map((f) => (
            <Card 
              key={f.title} 
              className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-white to-gray-50"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${f.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
              <div className="relative p-6">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${f.color} text-white shadow-lg group-hover:scale-110 transition-transform duration-300 mb-4`}>
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text transition-all duration-300" style={{backgroundImage: `linear-gradient(to right, ${getColorHex(f.color).start}, ${getColorHex(f.color).end})`}}>
                  {f.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">{f.desc}</p>
                <div className={`w-full bg-gradient-to-r ${f.color} opacity-90 text-white border-0 shadow-md rounded-md px-4 py-2 text-center font-medium`}>
                  {f.action}
                  <ArrowRight className="ml-2 h-3 w-3 inline" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Additional Info */}
      <section className="bg-muted/30 py-20">
        <div className="container mx-auto">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Ready to Get Started?</h2>
            <p className="mt-3 text-muted-foreground">Join thousands of users who trust SafeHer for their safety</p>
            <div className="mt-8">
              <Button asChild size="lg" className="h-12 px-8 text-base">
                <Link to="/auth?mode=signup">Sign Up Now <ArrowRight className="h-4 w-4" /></Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
