import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Users,
  MapPin,
  Phone,
  Bell,
  Heart,
  Zap,
  ShieldCheck,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Clock,
  Navigation,
  Smartphone,
  Lock,
  Eye
} from "lucide-react";

export default function WomenPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm mx-auto mb-6">
              <Users className="h-10 w-10" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Empower Your Safety
            </h1>
            <p className="text-xl md:text-2xl opacity-90 mb-8">
              Take control of your personal safety with technology designed for women
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-white text-pink-600 hover:bg-gray-100">
                <Link to="/auth?mode=signup">
                  Start Your Safety Journey
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-pink-600">
                <Link to="/">Back to Home</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto space-y-16">
          
          {/* Safety Statistics */}
          <section>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Why Women Need SafeHer
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Empowering women with technology designed for real-world safety challenges
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="border-0 shadow-lg bg-gradient-to-br from-pink-50 to-purple-50">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl font-bold text-pink-600 mb-2">81%</div>
                  <p className="text-gray-600">of women have experienced some form of harassment</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl font-bold text-purple-600 mb-2">3x</div>
                  <p className="text-gray-600">faster emergency response with real-time location</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-purple-50">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">24/7</div>
                  <p className="text-gray-600">protection and support whenever you need it</p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Core Safety Features */}
          <section>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Your Personal Safety Toolkit
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Essential features designed specifically for women's safety needs
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-8">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 text-white mb-6">
                    <AlertTriangle className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Discreet SOS Button</h3>
                  <p className="text-gray-600 mb-6">
                    One-tap emergency alert that works even when your phone is locked. 3-second countdown prevents accidental triggers while ensuring help when you need it most.
                  </p>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 mr-2 text-pink-500" />
                      Works with phone screen off
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 mr-2 text-pink-500" />
                      Silent vibration feedback
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 mr-2 text-pink-500" />
                      Instant guardian notification
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-8">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 text-white mb-6">
                    <MapPin className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Smart Location Sharing</h3>
                  <p className="text-gray-600 mb-6">
                    Precise GPS tracking that activates only during emergencies. Your privacy is protected - location is shared only when you trigger an SOS alert.
                  </p>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 mr-2 text-purple-500" />
                      10-meter accuracy
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 mr-2 text-purple-500" />
                      Real-time updates
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 mr-2 text-purple-500" />
                      Privacy-first approach
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Real Stories */}
          <section>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Real Women, Real Safety
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                How SafeHer has made a difference in women's lives
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="h-12 w-12 rounded-full bg-pink-100 flex items-center justify-center mr-3">
                      <Users className="h-6 w-6 text-pink-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Sarah, 28</h4>
                      <p className="text-sm text-gray-500">Marketing Professional</p>
                    </div>
                  </div>
                  <p className="text-gray-600 italic">
                    "SafeHer gives me peace of mind when working late. I know my family will be alerted instantly if I ever need help."
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                      <Users className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Priya, 22</h4>
                      <p className="text-sm text-gray-500">College Student</p>
                    </div>
                  </div>
                  <p className="text-gray-600 italic">
                    "Walking back to my dorm at night feels much safer knowing I have instant help at my fingertips."
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Maria, 35</h4>
                      <p className="text-sm text-gray-500">Working Mother</p>
                    </div>
                  </div>
                  <p className="text-gray-600 italic">
                    "As a single mom, SafeHer helps me feel secure while juggling work and childcare responsibilities."
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Safety Scenarios */}
          <section>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Perfect for Every Situation
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                SafeHer adapts to your lifestyle and safety needs
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: <Smartphone className="h-6 w-6" />,
                  title: "Night Travel",
                  desc: "Safe commutes home after late hours"
                },
                {
                  icon: <Users className="h-6 w-6" />,
                  title: "Solo Activities",
                  desc: "Running, hiking, or exploring alone"
                },
                {
                  icon: <Navigation className="h-6 w-6" />,
                  title: "New Areas",
                  desc: "Exploring unfamiliar neighborhoods"
                },
                {
                  icon: <Heart className="h-6 w-6" />,
                  title: "Daily Peace",
                  desc: "Everyday confidence and security"
                }
              ].map((scenario, index) => (
                <Card key={index} className="border-0 shadow-lg text-center hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-pink-100 to-purple-100 text-pink-600 mx-auto mb-4">
                      {scenario.icon}
                    </div>
                    <h3 className="font-semibold mb-2">{scenario.title}</h3>
                    <p className="text-sm text-gray-600">{scenario.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Empowerment CTA */}
          <section className="text-center">
            <div className="bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl p-12 text-white">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Take Control of Your Safety Today
              </h2>
              <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
                Join thousands of empowered women who choose proactive safety over reactive fear
              </p>
              <Button asChild size="lg" className="bg-white text-pink-600 hover:bg-gray-100">
                <Link to="/auth?mode=signup">
                  Start Your Empowerment Journey
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Link>
              </Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
