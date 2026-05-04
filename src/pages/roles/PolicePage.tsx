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
  Eye,
  Activity,
  Radio,
  MessageSquare,
  Car,
  RadioIcon,
  FileText,
  Database,
  TrendingUp,
  AlertCircle
} from "lucide-react";

export default function PolicePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm mx-auto mb-6">
              <ShieldCheck className="h-10 w-10" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Protect & Serve Faster
            </h1>
            <p className="text-xl md:text-2xl opacity-90 mb-8">
              Advanced technology to help law enforcement respond more effectively
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-white text-green-600 hover:bg-gray-100">
                <Link to="/auth?mode=signup">
                  Request Department Demo
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-green-600">
                <Link to="/">Back to Home</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto space-y-16">
          
          {/* Response Impact */}
          <section>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Response Time Revolution
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                How SafeHer transforms emergency response for law enforcement
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl font-bold text-green-600 mb-2">60%</div>
                  <p className="text-gray-600">faster response with verified location data</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-green-50">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl font-bold text-emerald-600 mb-2">95%</div>
                  <p className="text-gray-600">reduction in false alarms with pre-verified users</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-green-50">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">3x</div>
                  <p className="text-gray-600">more successful interventions with guardian coordination</p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Core Police Tools */}
          <section>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Advanced Response Tools
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Cutting-edge technology designed for modern law enforcement needs
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-8">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 text-white mb-6">
                    <AlertCircle className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Verified Alert Intelligence</h3>
                  <p className="text-gray-600 mb-6">
                    Receive pre-verified SOS alerts with confirmed user identity and precise location. Eliminate false alarms and focus resources on genuine emergencies.
                  </p>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                      Pre-verified user profiles
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                      Priority classification system
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                      Reduced false alarm rate
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-8">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 text-white mb-6">
                    <Car className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Smart Deployment System</h3>
                  <p className="text-gray-600 mb-6">
                    AI-powered unit deployment recommendations based on location, traffic, and available resources. Optimize response efficiency automatically.
                  </p>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 mr-2 text-emerald-500" />
                      Route optimization algorithms
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 mr-2 text-emerald-500" />
                    Real-time traffic integration
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 mr-2 text-emerald-500" />
                      Resource allocation analytics
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Department Success Stories */}
          <section>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Departments Leading the Way
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                How law enforcement agencies are transforming emergency response
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mr-3">
                      <ShieldCheck className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Metro PD</h4>
                      <p className="text-sm text-gray-500">City Police Department</p>
                    </div>
                  </div>
                  <p className="text-gray-600 italic">
                    "SafeHer reduced our response time by 45% and eliminated 95% of false alarms. Our officers can now focus on real emergencies."
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center mr-3">
                      <ShieldCheck className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">County Sheriff</h4>
                      <p className="text-sm text-gray-500">Rural Law Enforcement</p>
                    </div>
                  </div>
                  <p className="text-gray-600 italic">
                    "The guardian coordination feature has been invaluable for our rural communities. We're saving more lives with fewer resources."
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                      <ShieldCheck className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">State Police</h4>
                      <p className="text-sm text-gray-500">Highway Patrol</p>
                    </div>
                  </div>
                  <p className="text-gray-600 italic">
                    "Real-time location data has revolutionized how we respond to highway emergencies. SafeHer is now standard equipment."
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Technology Integration */}
          <section>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Seamless Technology Integration
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                SafeHer works with your existing systems, no complete overhaul required
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: <Radio className="h-6 w-6" />,
                  title: "CAD Systems",
                  desc: "Integrates with Computer Aided Dispatch"
                },
                {
                  icon: <Database className="h-6 w-6" />,
                  title: "Records Management",
                  desc: "Automatic incident logging and reporting"
                },
                {
                  icon: <Car className="h-6 w-6" />,
                  title: "Vehicle Systems",
                  desc: "In-car computer and mobile data terminals"
                },
                {
                  icon: <Phone className="h-6 w-6" />,
                  title: "Radio Systems",
                  desc: "Enhanced communication and coordination"
                }
              ].map((tech, index) => (
                <Card key={index} className="border-0 shadow-lg text-center hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-green-100 to-emerald-100 text-green-600 mx-auto mb-4">
                      {tech.icon}
                    </div>
                    <h3 className="font-semibold mb-2">{tech.title}</h3>
                    <p className="text-sm text-gray-600">{tech.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Police CTA */}
          <section className="text-center">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-12 text-white">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Transform Your Emergency Response
              </h2>
              <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
                Join innovative departments using technology to save more lives and protect communities better
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="bg-white text-green-600 hover:bg-gray-100">
                  <Link to="/auth?mode=signup">
                    Schedule Department Demo
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-green-600">
                  <Link to="/auth?mode=signup">
                    Download Integration Guide
                  </Link>
                </Button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
