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
  MessageSquare
} from "lucide-react";

export default function GuardianPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm mx-auto mb-6">
              <Shield className="h-10 w-10" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Protect What Matters Most
            </h1>
            <p className="text-xl md:text-2xl opacity-90 mb-8">
              Be the guardian your loved ones can count on in critical moments
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                <Link to="/auth?mode=signup">
                  Become a Guardian Today
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                <Link to="/">Back to Home</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto space-y-16">
          
          {/* Guardian Impact */}
          <section>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                The Guardian Difference
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                How guardians make life-saving impact every day
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">5 min</div>
                  <p className="text-gray-600">Average response time with guardian network</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg bg-gradient-to-br from-cyan-50 to-blue-50">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl font-bold text-cyan-600 mb-2">87%</div>
                  <p className="text-gray-600">faster emergency resolution with guardian coordination</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-blue-50">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl font-bold text-green-600 mb-2">24/7</div>
                  <p className="text-gray-600">peace of mind for families and loved ones</p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Core Guardian Tools */}
          <section>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Your Guardian Toolkit
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Essential tools to protect and support your loved ones effectively
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-8">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 text-white mb-6">
                    <Bell className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Instant Alert System</h3>
                  <p className="text-gray-600 mb-6">
                    Receive immediate SOS notifications with precise location and situation details. Never miss a critical moment with multi-channel alerts.
                  </p>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 mr-2 text-blue-500" />
                      Push + SMS + Email notifications
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 mr-2 text-blue-500" />
                      Priority alert filtering
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 mr-2 text-blue-500" />
                      Custom notification preferences
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-8">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white mb-6">
                    <MapPin className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Live Location Intelligence</h3>
                  <p className="text-gray-600 mb-6">
                    Real-time GPS tracking with address mapping and route optimization. Know exactly where your loved ones are during emergencies.
                  </p>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 mr-2 text-cyan-500" />
                      10-meter location accuracy
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 mr-2 text-cyan-500" />
                      Turn-by-turn navigation
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 mr-2 text-cyan-500" />
                      Safe location suggestions
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Guardian Stories */}
          <section>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Guardian Heroes in Action
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Real stories of guardians making a difference
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                      <Shield className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">David, Father</h4>
                      <p className="text-sm text-gray-500">Guardian for 2 years</p>
                    </div>
                  </div>
                  <p className="text-gray-600 italic">
                    "When my daughter triggered SOS during a late-night study session, I was able to reach her in 3 minutes. SafeHer saved valuable time."
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="h-12 w-12 rounded-full bg-cyan-100 flex items-center justify-center mr-3">
                      <Shield className="h-6 w-6 text-cyan-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Amanda, Sister</h4>
                      <p className="text-sm text-gray-500">Guardian for 1 year</p>
                    </div>
                  </div>
                  <p className="text-gray-600 italic">
                    "Being able to track my sister's location during her solo travels gives our entire family peace of mind."
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mr-3">
                      <Shield className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Robert, Neighbor</h4>
                      <p className="text-sm text-gray-500">Guardian for 6 months</p>
                    </div>
                  </div>
                  <p className="text-gray-600 italic">
                    "Coordinating with other guardians during an emergency made all the difference. We got help there faster than 911 alone."
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Guardian Types */}
          <section>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Who Can Be a Guardian?
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Anyone who cares can protect and support their loved ones
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: <Heart className="h-6 w-6" />,
                  title: "Family Members",
                  desc: "Parents, siblings, spouses, children"
                },
                {
                  icon: <Users className="h-6 w-6" />,
                  title: "Close Friends",
                  desc: "Best friends and trusted companions"
                },
                {
                  icon: <MapPin className="h-6 w-6" />,
                  title: "Neighbors",
                  desc: "Local community members nearby"
                },
                {
                  icon: <Shield className="h-6 w-6" />,
                  title: "Colleagues",
                  desc: "Work friends and professional contacts"
                }
              ].map((type, index) => (
                <Card key={index} className="border-0 shadow-lg text-center hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-100 to-cyan-100 text-blue-600 mx-auto mb-4">
                      {type.icon}
                    </div>
                    <h3 className="font-semibold mb-2">{type.title}</h3>
                    <p className="text-sm text-gray-600">{type.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Guardian CTA */}
          <section className="text-center">
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-12 text-white">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Become Someone's Guardian Angel
              </h2>
              <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
                Join thousands of guardians who provide peace of mind and protection to their loved ones every day
              </p>
              <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                <Link to="/auth?mode=signup">
                  Start Protecting Today
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
