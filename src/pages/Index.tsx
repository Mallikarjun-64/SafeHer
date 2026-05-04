import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Heart, Lock, Activity, Zap, ArrowRight, Users, MapPin, PhoneCall, Bell, ShieldCheck, LogOut } from 'lucide-react';

import HowItWorks from '@/components/HowItWorks';

import SOSEmergency from '@/components/SOSEmergency';

import HeroIllustration from '@/components/HeroIllustration';

import "../styles/animations.css";

import { useAuth, dashboardPathFor } from "@/contexts/AuthContext";

import { toast } from "sonner";



export default function Index() {

  const { user, roles, signOut } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const ctaLink = user ? dashboardPathFor(roles) : "/auth";
  const ctaLabel = user ? "Open dashboard" : "Get started — it's free";
  const [activeSection, setActiveSection] = useState("home");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Get user's current location
  useEffect(() => {
    const getLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            console.log('User location:', lat, lng);
            setUserLocation({ lat, lng });
          },
          (error) => {
            console.error('Error getting location:', error);
            // Try again with different options
            navigator.geolocation.getCurrentPosition(
              (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                console.log('User location (fallback):', lat, lng);
                setUserLocation({ lat, lng });
              },
              (error) => {
                console.error('Fallback location failed:', error);
                // Set default location if geolocation fails
                setUserLocation({ lat: 40.7128, lng: -74.0060 }); // New York as fallback
              },
              { timeout: 5000 }
            );
          },
          { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
      } else {
        // Fallback if geolocation not supported
        setUserLocation({ lat: 40.7128, lng: -74.0060 });
      }
    };
    
    getLocation();
    
    // Also try to watch position for more accuracy
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          console.log('Watched location:', lat, lng);
          setUserLocation({ lat, lng });
        },
        (error) => {
          console.error('Watch position error:', error);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
      
      return () => {
        navigator.geolocation.clearWatch(watchId);
      };
    }
  }, []);

  // Handle URL parameter for SOS section activation
  useEffect(() => {
    const section = searchParams.get('section');
    if (section === 'sos') {
      setActiveSection('sos');
    }
  }, [searchParams]);

  const handleLogout = async () => {
    await signOut();
    toast.success("Logged out successfully");
    navigate("/");
  };



  // Handle feature card clicks - redirect to relevant pages

  const handleFeatureClick = (featureTitle: string) => {

    console.log(`Feature clicked: ${featureTitle}`);

    

    // Check if user is authenticated

    if (!user) {

      toast.error("Please create an account to access this feature");

      navigate("/auth?mode=signup");

      return;

    }

    

    // Redirect to relevant pages based on feature

    switch (featureTitle) {

      case "One-click SOS":

        setActiveSection("sos");

        break;

      case "Live location":

        navigate("/location");

        break;

      case "Trusted contacts":

        navigate("/roles/guardian");

        break;

      case "Police dashboard":

        navigate("/roles/police");

        break;

      case "Helplines & stations":

        navigate("/roles/women");

        break;

      case "Privacy-first":

        navigate("/auth?mode=signup");

        break;

      default:

        navigate("/features");

    }

  };



  // Handle feature action button clicks - redirect to relevant pages

  const handleFeatureAction = (action: string) => {

    console.log(`Feature action clicked: ${action}`);

    

    // Check if user is authenticated

    if (!user) {

      toast.error("Please create an account to access this feature");

      navigate("/auth?mode=signup");

      return;

    }

    

    // Handle different actions with redirects

    switch (action) {

      case "Test Demo":

        console.log("Redirecting to SOS section");

        setActiveSection("sos");

        break;

      case "View Demo":

        console.log("Redirecting to location page");

        navigate("/location");

        break;

      case "Add Guardians":

        console.log("Redirecting to guardian management page");

        navigate("/guardian-management");

        break;

      case "View Dashboard":

        console.log("Redirecting to police integration page");

        navigate("/police-integration");

        break;

      case "Call Helpline":

        console.log("Redirecting to women roles page");

        navigate("/roles/women");

        break;

      case "Privacy Settings":

        console.log("Redirecting to auth signup page");

        navigate("/auth?mode=signup");

        break;

      default:

        console.log(`Unknown action: ${action}, redirecting to features page`);

        navigate("/features");

    }

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

      <header className="sticky top-0 z-50 border-b border-gray-200/50 bg-white/95 backdrop-blur-md shadow-lg">

        <div className="container mx-auto flex h-16 items-center justify-between">

          <Link to="/" className="flex items-center gap-3 group">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">

              <Shield className="h-6 w-6 text-white group-hover:rotate-12 transition-transform duration-300" />

            </div>

            <span className="text-xl font-bold tracking-tight text-gray-900 group-hover:text-blue-600 transition-colors duration-300">SafeHer</span>

          </Link>

          <nav className="hidden items-center gap-1 md:flex">

            <button 

              onClick={() => setActiveSection("home")}

              className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 hover:scale-105 ${

                activeSection === "home" 

                  ? "bg-blue-600 text-white shadow-lg" 

                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"

              }`}

            >

              <span className="flex items-center gap-2">

                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">

                  <path d="M10.707 2.293a1 1 0 0 1.414 1.414l-4 4a1 1 0 0 1.414 1.414l4-4a1 1 0 0 1.414-1.414L11.586 6.414A1 1 0 0 10.172 5.414L8.464 4.586a1 1 0 0-.707-.293l-4-4a1 1 0 0-1.414-1.414L10.707 2.293z"/>

                </svg>

                Home

              </span>

              {activeSection === "home" && (

                <div className="absolute -bottom-1 left-1/2 w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>

              )}

            </button>

            

            <button 

              onClick={() => setActiveSection("features")}

              className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 hover:scale-105 ${

                activeSection === "features" 

                  ? "bg-blue-600 text-white shadow-lg" 

                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"

              }`}

            >

              <span className="flex items-center gap-2">

                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">

                  <path d="M9 2a1 1 0 0 1 1v4a1 1 0 0 1-1h4a1 1 0 0 1-1V3a1 1 0 0 1-1H9a1 1 0 0 1 1z"/>

                  <path d="M5 8a1 1 0 0 1-1v1a1 1 0 0 1-1h4a1 1 0 0 1 1v1a1 1 0 0 1-1H5a1 1 0 0 1-1v-1a1 1 0 0 1-1z"/>

                </svg>

                Features

              </span>

              {activeSection === "features" && (

                <div className="absolute -bottom-1 left-1/2 w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>

              )}

            </button>

            <button 

              onClick={() => setActiveSection("how")}

              className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 hover:scale-105 ${

                activeSection === "how" 

                  ? "bg-blue-600 text-white shadow-lg" 

                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"

              }`}

            >

              <span className="flex items-center gap-2">

                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">

                  <path d="M10 2a1 1 0 0 1 1v4a1 1 0 0 1-1h4a1 1 0 0 1-1V3a1 1 0 0 1-1H9a1 1 0 0 1 1z"/>

                  <path d="M5 8a1 1 0 0 1-1v1a1 1 0 0 1-1h4a1 1 0 0 1 1v1a1 1 0 0 1-1H5a1 1 0 0 1-1v-1a1 1 0 0 1-1z"/>

                </svg>

                How it works

              </span>

              {activeSection === "how" && (

                <div className="absolute -bottom-1 left-1/2 w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>

              )}

            </button>

            <button 

              onClick={() => setActiveSection("roles")}

              className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 hover:scale-105 ${

                activeSection === "roles" 

                  ? "bg-blue-600 text-white shadow-lg" 

                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"

              }`}

            >

              <span className="flex items-center gap-2">

                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">

                  <path d="M9 6a3 3 0 1 1 0 3 3v4a3 3 0 0 1-3H6a3 3 0 0 1-3v-4a3 3 0 0 1-3h4a3 3 0 0 1 3z"/>

                  <path d="M9 13a1 1 0 0 1 1v1a1 1 0 0 1-1h4a1 1 0 0 1-1v-1a1 1 0 0 1-1H9z"/>

                </svg>

                For who

              </span>

              {activeSection === "roles" && (

                <div className="absolute -bottom-1 left-1/2 w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>

              )}

            </button>

            

                      </nav>

          <div className="flex items-center gap-3">

            {/* SOS Emergency Button */}

            <Button 

              onClick={() => setActiveSection("sos")}

              className="relative bg-red-600 hover:bg-red-700 text-white w-14 h-14 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 group flex items-center justify-center"

            >

              <Bell className="h-6 w-6 animate-pulse" />

              <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full animate-ping"></div>

            </Button>

            

            {user ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-semibold">
                      {user.full_name?.charAt(0) || 'U'}
                    </div>
                    <span className="text-sm font-medium text-gray-900">{user.full_name || 'User'}</span>
                  </div>
                  <Button variant="ghost" onClick={handleLogout} className="text-gray-600 hover:text-gray-900 hover:bg-gray-100">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign out
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild className="text-gray-600 hover:text-gray-900 hover:bg-gray-100">
                  <Link to="/auth">Sign in</Link>
                </Button>
                <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Link to="/auth?mode=signup">Sign up</Link>
                </Button>
              </>
            )}

          </div>

        </div>

      </header>



      {/* Hero */}

      {activeSection === "home" && (

        <section className="relative overflow-hidden">

          {/* Clean Background */}

          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50">

            <div className="absolute inset-0 opacity-10">

              <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200 rounded-full filter blur-3xl animate-float"></div>

              <div className="absolute top-20 right-0 w-64 h-64 bg-purple-200 rounded-full filter blur-2xl animate-float" style={{ animationDelay: '2s' }}></div>

              <div className="absolute bottom-20 left-20 w-80 h-80 bg-pink-200 rounded-full filter blur-2xl animate-float" style={{ animationDelay: '4s' }}></div>

            </div>

          </div>

          

          <div className="container relative mx-auto py-12 md:py-16">

            <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl">

              {/* Left Side - Content */}

              <div className="text-center md:text-left">

                {/* Title with Enhanced Animation */}

                <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold leading-tight tracking-tight text-gray-900 animate-fade-in">

                  <span className="inline-block animate-gradient-shift bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">

                    Safety You Can Trust

                  </span>

                  <br className="hidden sm:block" />

                  <span className="text-blue-600 font-bold animate-gradient-shift bg-gradient-to-r from-blue-500 to-cyan-600 bg-clip-text text-transparent">

                    Protection When It Matters Most

                  </span>

                </h1>

                

                {/* Enhanced Description */}

                <p className="mt-6 text-base md:text-lg text-gray-700 font-light leading-relaxed max-w-xl lg:max-w-2xl animate-fade-in-up">

                  Experience peace of mind with SafeHer's instant emergency response system.

                  <br className="hidden sm:block" />

                  One tap connects you to family, friends, and emergency services —

                  <span className="font-semibold text-gray-900">exactly when you need it most.</span>

                </p>

                

                {/* Enhanced CTA Buttons */}

                <div className="mt-8 lg:mt-12 flex flex-col items-center md:items-start gap-4 sm:flex-row animate-fade-in-up">

                  <Button 

                    asChild 

                    size="lg" 

                    className="group relative px-6 lg:px-8 text-sm lg:text-base bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-semibold"

                  >

                    <Link to={ctaLink}>

                      <span className="flex items-center gap-3">

                        <div className="flex h-5 w-5 lg:h-6 lg:w-6 items-center justify-center rounded-lg bg-white/20 text-white shadow group-hover:scale-110 transition-all duration-300">

                          <Shield className="h-3 w-3 lg:h-4 lg:w-4 group-hover:rotate-12 transition-transform duration-300" />

                        </div>

                        <span>{ctaLabel}</span>

                      </span>

                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-2 transition-transform duration-300" />

                    </Link>

                  </Button>

                  <Button 

                    asChild 

                    variant="outline" 

                    size="lg" 

                    className="group relative px-6 lg:px-8 text-sm lg:text-base border-2 border-blue-600 text-blue-600 hover:bg-blue-50 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-semibold"

                  >

                    <Link to="/features">

                      <span className="flex items-center gap-3">

                        <div className="flex h-5 w-5 lg:h-6 lg:w-6 items-center justify-center rounded-lg bg-blue-100 text-blue-600 shadow group-hover:scale-110 transition-all duration-300">

                          <Zap className="h-3 w-3 lg:h-4 lg:w-4 group-hover:rotate-12 transition-transform duration-300" />

                        </div>

                        <span>Explore Features</span>

                      </span>

                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-2 transition-transform duration-300" />

                    </Link>

                  </Button>

                </div>

                

                {/* Status Cards Below Get Started Line */}

                <div className="mt-12 lg:mt-16 max-w-xl lg:max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in-up">

                  {/* System Active Card */}

                  <div className="group status-card hover-glow">

                    <div className="absolute top-3 right-3">

                      <div className="status-indicator"></div>

                    </div>

                    <div className="flex items-center gap-3">

                      <div className="flex h-10 w-10 lg:h-12 lg:w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-50 to-emerald-100 text-green-600 shadow group-hover:scale-110 transition-all duration-300">

                        <Activity className="h-5 w-5 lg:h-6 lg:w-6 animate-pulse" />

                      </div>

                      <div className="text-left">

                        <div className="font-bold text-gray-900 group-hover:text-green-600 text-xs lg:text-sm">System Active</div>

                        <div className="text-xs text-gray-600">All systems operational</div>

                      </div>

                    </div>

                  </div>

                  

                  {/* Location Tracking Card */}

                  <div className="group status-card hover-glow">

                    <div className="absolute top-3 right-3">

                      <div className="status-indicator"></div>

                    </div>

                    <div className="flex items-center gap-3">

                      <div className="flex h-10 w-10 lg:h-12 lg:w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-cyan-100 text-blue-600 shadow group-hover:scale-110 transition-all duration-300">

                        <MapPin className="h-5 w-5 lg:h-6 lg:w-6 animate-pulse" />

                      </div>

                      <div className="text-left">

                        <div className="font-bold text-gray-900 group-hover:text-blue-600 text-xs lg:text-sm">Location Tracking</div>

                        <div className="text-xs text-gray-600">GPS enabled and monitoring</div>

                      </div>

                    </div>

                  </div>

                </div>

              </div>

              

              {/* Right Side - Custom Illustration */}

              <div className="relative order-first md:order-last">

                <div className="relative rounded-2xl overflow-hidden shadow-2xl animate-fade-in">

                  <HeroIllustration />

                </div>

              </div>

            </div>

          </div>

        </section>

      )}



      {/* Features */}

      {activeSection === "features" && (

        <section id="features" className="py-16">

          <div className="container mx-auto">

            <div className="mx-auto mb-12 max-w-3xl text-center">

              {/* Section Header */}

              <div className="mb-10">

                <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 animate-fade-in">

                  Emergency Features

                </h2>

                <p className="mt-3 text-base text-gray-600 leading-relaxed max-w-2xl mx-auto animate-fade-in-up">

                  Instant protection when you need it most.

                </p>

              </div>

            



          {/* Features Grid */}

          <div className="grid gap-8 md:grid-cols-3">

            {[

              { 

                icon: Bell, 

                title: "One-click SOS", 

                desc: "Instant emergency alerts with 3-second safety countdown. Prevents accidental triggers while ensuring rapid response.",

                action: "Test Demo",

                color: "from-red-500 to-orange-500",

                badge: "Critical"

              },

              { 

                icon: MapPin, 

                title: "Live Location", 

                desc: "Real-time GPS tracking with automatic guardian notifications. Your location is shared securely with trusted contacts.",

                action: "View Demo",

                color: "from-blue-500 to-cyan-500",

                badge: "Essential"

              },

              { 

                icon: Users, 

                title: "Trusted Network", 

                desc: "Add family and friends as guardians. They receive instant alerts and can coordinate emergency response.",

                action: "Add Guardians",

                color: "from-purple-500 to-pink-500",

                badge: "Protection"

              },

              { 

                icon: Shield, 

                title: "Police Integration", 

                desc: "Direct connection to law enforcement. Authorities receive your location and emergency details immediately.",

                action: "View Dashboard",

                color: "from-green-500 to-emerald-500",

                badge: "Official"

              },

              { 

                icon: PhoneCall, 

                title: "Emergency Services", 

                desc: "Quick access to helplines and nearest police stations. One-tap connection to emergency resources.",

                action: "Call Helpline",

                color: "from-indigo-500 to-blue-500",

                badge: "24/7"

              },

              { 

                icon: Lock, 

                title: "Privacy First", 

                desc: "Military-grade encryption with role-based access. Your data remains completely private and secure.",

                action: "Privacy Settings",

                color: "from-gray-500 to-slate-500",

                badge: "Secure"

              },

            ].map((f, index) => (

              <Card 

                key={f.title} 

                className="group relative overflow-hidden border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 cursor-pointer transform hover:scale-105 animate-fade-in-up bg-white h-full"

                style={{ animationDelay: `${index * 150}ms` }}

                onClick={() => handleFeatureClick(f.title)}

              >

                <CardContent className="relative z-10 p-6 flex flex-col h-full">

                  {/* Enhanced Icon */}

                  <div className="flex items-center justify-center mb-4">

                    <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${f.color} text-white shadow-xl group-hover:scale-110 transition-all duration-500`}>

                      <f.icon className="h-8 w-8" />

                    </div>

                  </div>

                  

                  {/* Enhanced Title */}

                  <h3 className="text-xl font-bold text-gray-900 mb-3">

                    {f.title}

                  </h3>

                  

                  {/* Enhanced Description */}

                  <p className="text-gray-600 mb-4 leading-relaxed text-sm flex-grow">{f.desc}</p>

                  {/* Location Map for Live Location card */}
                  {f.title === "Live Location" && userLocation && (
                    <div className="mb-4 rounded-lg overflow-hidden h-32 relative">
                      <img
                        src={`https://staticmap.openstreetmap.de/staticmap.php?center=${userLocation.lat},${userLocation.lng}&zoom=18&size=400x128&maptype=roadmap&markers=${userLocation.lat},${userLocation.lng},red`}
                        alt="Your Location"
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-medium text-gray-700">
                        Your Location
                      </div>
                    </div>
                  )}

                  {/* Enhanced Action Button */}

                  <Button 

                    size="lg"

                    className={`w-full bg-gradient-to-r ${f.color} hover:opacity-90 text-white border-0 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-semibold py-3`}

                    onClick={(e) => {

                      e.stopPropagation();

                      handleFeatureAction(f.action);

                    }}

                  >

                    <span className="flex items-center justify-center">

                      {f.action}

                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />

                    </span>

                  </Button>

                </CardContent>

              </Card>

            ))}

          </div>

          

          {/* CTA Section */}

          <div className="mt-12 text-center">

            <div className="max-w-xl mx-auto animate-fade-in-up">

              <h3 className="text-xl font-bold text-gray-900 mb-3">Ready for Complete Safety?</h3>

              <p className="text-gray-600 mb-5 text-sm">Join thousands who trust SafeHer</p>

              <Button 

                asChild 

                size="lg" 

                className="px-6 hover:scale-105 transition-transform duration-200"

              >

                <Link to="/auth?mode=signup">

                  Start Protection

                  <ArrowRight className="ml-2 h-4 w-4" />

                </Link>

              </Button>

            </div>

          </div>

        </div>

        </div>

      </section>

      )}



      {/* How it works */}

      {activeSection === "how" && (

        <section id="how" className="py-16">

          <div className="container mx-auto">

            <div className="mx-auto mb-10 max-w-xl text-center">

              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 animate-fade-in">How SafeHer works</h2>

            </div>

            <div className="animate-fade-in-up">

              <HowItWorks />

            </div>

          </div>

        </section>

      )}



      {/* Roles */}

      {activeSection === "roles" && (

        <section id="roles" className="container mx-auto py-16">

          <div className="mx-auto mb-10 max-w-xl text-center">

            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 animate-fade-in">

              Who SafeHer Protects

            </h2>

            <p className="mt-3 text-base text-gray-600">

              Safety solution for everyone in protection ecosystem

            </p>

          </div>

          <div className="grid gap-6 md:grid-cols-3">

            {/* Women Card */}

            <Card className="border shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105 animate-fade-in-up" style={{ animationDelay: '100ms' }}>

              <CardContent className="p-5">

                <div className="flex flex-col items-center text-center">

                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600 mb-3 transition-colors duration-300 hover:bg-blue-200">

                    <Users className="h-6 w-6" />

                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Women</h3>

                  <p className="text-gray-600 mb-4 text-sm">

                    Personal safety with instant emergency alerts

                  </p>

                  <Button 

                    asChild

                    variant="outline"

                    size="sm"

                    className="w-full hover:bg-blue-50 transition-colors duration-200"

                  >

                    <Link to="/roles/women">

                      Learn More

                      <ArrowRight className="h-3 w-3 ml-2" />

                    </Link>

                  </Button>

                </div>

              </CardContent>

            </Card>



            {/* Guardians Card */}

            <Card className="border shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105 animate-fade-in-up" style={{ animationDelay: '200ms' }}>

              <CardContent className="p-5">

                <div className="flex flex-col items-center text-center">

                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600 mb-3 transition-colors duration-300 hover:bg-blue-200">

                    <Shield className="h-6 w-6" />

                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Guardians</h3>

                  <p className="text-gray-600 mb-4 text-sm">

                    Real-time alerts and coordination for loved ones

                  </p>

                  <Button 

                    asChild

                    variant="outline"

                    size="sm"

                    className="w-full hover:bg-blue-50 transition-colors duration-200"

                  >

                    <Link to="/guardian-management">

                      Manage Guardians

                      <ArrowRight className="h-3 w-3 ml-2" />

                    </Link>

                  </Button>

                </div>

              </CardContent>

            </Card>



            {/* Police Card */}

            <Card className="border shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105 animate-fade-in-up" style={{ animationDelay: '300ms' }}>

              <CardContent className="p-5">

                <div className="flex flex-col items-center text-center">

                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600 mb-3 transition-colors duration-300 hover:bg-blue-200">

                    <ShieldCheck className="h-6 w-6" />

                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Police</h3>

                  <p className="text-gray-600 mb-4 text-sm">

                    Enhanced response with real-time intelligence

                  </p>

                  <Button 

                    asChild

                    variant="outline"

                    size="sm"

                    className="w-full hover:bg-blue-50 transition-colors duration-200"

                  >

                    <Link to="/roles/police">

                      Learn More

                      <ArrowRight className="h-3 w-3 ml-2" />

                    </Link>

                  </Button>

                </div>

              </CardContent>

            </Card>

          </div>

        </section>

      )}



      {/* SOS Emergency Page */}

      {activeSection === "sos" && (

        <SOSEmergency />

      )}



      {/* CTA */}

      {activeSection === "home" && (

        <section className="container mx-auto pb-16">

          <div className="text-center p-8 md:p-12 animate-fade-in-up">

            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Be ready before you need it</h2>

            <p className="mx-auto mt-3 max-w-lg text-gray-600 text-sm">Set up SafeHer in under a minute</p>

            <Button asChild size="lg" className="mt-5 h-11 px-6 text-base hover:scale-105 transition-transform duration-200">

              <Link to={ctaLink}>{ctaLabel} <ArrowRight className="h-4 w-4" /></Link>

            </Button>

          </div>

        </section>

      )}



      <footer className="border-t py-8">

        <div className="container mx-auto flex flex-col items-center justify-between gap-3 text-sm text-muted-foreground md:flex-row">

          <div className="flex items-center gap-2">

            <Shield className="h-4 w-4" />

            <span>© {new Date().getFullYear()} SafeHer — Women Safety Alert System</span>

          </div>

          <div>Built with care for safer communities.</div>

        </div>

      </footer>

    </div>

  );

}

