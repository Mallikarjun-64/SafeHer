import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Users, 
  Plus, 
  X, 
  Phone, 
  Mail, 
  CheckCircle, 
  ArrowRight,
  Shield,
  UserPlus,
  SkipForward,
  User,
  MapPin,
  Heart,
  Sparkles,
  Zap
} from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Guardian {
  id: string;
  name: string;
  email: string;
  phone: string;
  relationship: string;
}

export default function GuardianSetup() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [guardians, setGuardians] = useState<Guardian[]>([]);
  const [currentGuardian, setCurrentGuardian] = useState({
    name: "",
    email: "",
    phone: "",
    relationship: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [animateCard, setAnimateCard] = useState(false);

  const relationships = [
    "Family", "Friend", "Neighbor", "Colleague", "Other"
  ];

  const addGuardian = () => {
    if (!currentGuardian.name || !currentGuardian.email) {
      toast.error("Please fill in at least name and email");
      return;
    }

    const newGuardian: Guardian = {
      id: Date.now().toString(),
      ...currentGuardian
    };

    setGuardians([...guardians, newGuardian]);
    setCurrentGuardian({ name: "", email: "", phone: "", relationship: "" });
    setShowModal(false);
    setAnimateCard(true);
    setTimeout(() => setAnimateCard(false), 500);
    
    toast.success("Guardian added successfully!", {
      icon: <CheckCircle className="h-4 w-4 text-green-500" />
    });
  };

  const removeGuardian = (id: string) => {
    setGuardians(guardians.filter(g => g.id !== id));
  };

  const saveGuardians = async () => {
    if (guardians.length === 0) {
      toast.info("No guardians to save. You can add them later from settings.");
      goToDashboard();
      return;
    }

    if (!user) return;

    setIsSubmitting(true);
    try {
      // Save guardians to Firestore sub-collection
      const guardiansRef = collection(db, "users", user.id, "guardians");
      
      for (const g of guardians) {
        await addDoc(guardiansRef, {
          name: g.name,
          email: g.email,
          phone: g.phone || null,
          relation: g.relationship || null,
          createdAt: new Date().toISOString()
        });
      }

      toast.success(`Successfully added ${guardians.length} guardian(s)!`);
      goToDashboard();
    } catch (error: any) {
      toast.error("Failed to save guardians", { description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const goToDashboard = () => {
    // Get user role from metadata and redirect to appropriate dashboard
    const userRole = user?.user_metadata?.role || 'user';
    
    if (userRole === 'guardian') {
      navigate("/dashboard/guardian");
    } else if (userRole === 'police') {
      navigate("/dashboard/police");
    } else if (userRole === 'admin') {
      navigate("/dashboard/admin");
    } else {
      navigate("/dashboard/user");
    }
  };

  const skipForNow = () => {
    toast.info("You can add guardians later from your dashboard settings");
    goToDashboard();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {[1, 2].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300 ${
                  step <= currentStep 
                    ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg scale-110' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {step === 1 ? <CheckCircle className="h-6 w-6" /> : <Users className="h-6 w-6" />}
                </div>
                <div className="ml-3">
                  <p className={`font-semibold ${step <= currentStep ? 'text-gray-900' : 'text-gray-500'}`}>
                    {step === 1 ? 'Account Created' : 'Add Guardians'}
                  </p>
                  <p className={`text-sm ${step <= currentStep ? 'text-gray-600' : 'text-gray-400'}`}>
                    {step === 1 ? 'Your SafeHer account is ready' : 'Complete your safety network'}
                  </p>
                </div>
                {step < 2 && (
                  <div className="ml-8 w-16 h-0.5 bg-gradient-to-r from-blue-500 to-purple-600"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white mb-6 shadow-2xl animate-pulse">
            <Heart className="h-10 w-10" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Welcome to SafeHer!
          </h1>
          <p className="text-xl text-gray-600 mb-4">
            Your account is ready. Build your safety network with trusted guardians.
          </p>
          <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 text-sm">
            <Sparkles className="h-4 w-4 mr-2" />
            Step 2 of 2: Add Guardians (Optional)
          </Badge>
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Column - Guardian List */}
          <div className="space-y-6">
            <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-blue-50">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <Users className="h-6 w-6 text-blue-600" />
                  Your Guardians
                  <Badge variant="secondary" className="ml-auto">
                    {guardians.length} Added
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {guardians.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 mb-4">
                      <UserPlus className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 mb-4">No guardians added yet</p>
                    <Button 
                      onClick={() => setShowModal(true)}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Guardian
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {guardians.map((guardian, index) => (
                      <div 
                        key={guardian.id} 
                        className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-300 ${
                          animateCard && index === guardians.length - 1
                            ? 'bg-green-50 border-green-200 scale-105'
                            : 'bg-white border-gray-200 hover:shadow-md'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                            <User className="h-6 w-6" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{guardian.name}</p>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Mail className="h-3 w-3" />
                              {guardian.email}
                            </div>
                            {guardian.phone && (
                              <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                                <Phone className="h-3 w-3" />
                                {guardian.phone}
                              </div>
                            )}
                            {guardian.relationship && (
                              <Badge variant="outline" className="mt-1 text-xs">
                                {guardian.relationship}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeGuardian(guardian.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button 
                      onClick={() => setShowModal(true)}
                      variant="outline" 
                      className="w-full border-dashed border-2 border-blue-300 text-blue-600 hover:bg-blue-50"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Another Guardian
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={skipForNow}
                className="flex-1 hover:bg-gray-50"
              >
                <SkipForward className="h-4 w-4 mr-2" />
                Skip for Now
              </Button>
              <Button
                onClick={saveGuardians}
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    {guardians.length > 0 ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Continue with {guardians.length} Guardian{guardians.length > 1 ? 's' : ''}
                      </>
                    ) : (
                      <>
                        <ArrowRight className="h-4 w-4 mr-2" />
                        Continue to Dashboard
                      </>
                    )}
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Right Column - Info and Features */}
          <div className="space-y-6">
            <Card className="shadow-xl border-0 bg-gradient-to-br from-purple-50 to-pink-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <Shield className="h-6 w-6 text-purple-600" />
                  Why Add Guardians?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-purple-600 flex-shrink-0">
                    <Zap className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Instant Alerts</p>
                    <p className="text-sm text-gray-600">Guardians receive immediate SOS notifications with your live location</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 flex-shrink-0">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Live Location Sharing</p>
                    <p className="text-sm text-gray-600">Real-time GPS tracking helps guardians find you quickly</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600 flex-shrink-0">
                    <Heart className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Peace of Mind</p>
                    <p className="text-sm text-gray-600">Your loved ones can help coordinate emergency response</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-xl border-0 bg-gradient-to-br from-blue-50 to-cyan-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <Users className="h-6 w-6 text-blue-600" />
                  Who Can Be a Guardian?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {['Family Members', 'Close Friends', 'Trusted Neighbors', 'Colleagues'].map((person) => (
                  <div key={person} className="flex items-center gap-3 p-3 rounded-lg bg-white/50">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                      <User className="h-4 w-4" />
                    </div>
                    <span className="text-gray-700">{person}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Add Guardian Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-md border-0 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                <UserPlus className="h-4 w-4" />
              </div>
              Add Guardian
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="modal-name">Name *</Label>
              <Input
                id="modal-name"
                placeholder="Enter guardian's name"
                value={currentGuardian.name}
                onChange={(e) => setCurrentGuardian({...currentGuardian, name: e.target.value})}
                className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <Label htmlFor="modal-email">Email *</Label>
              <Input
                id="modal-email"
                type="email"
                placeholder="Enter guardian's email"
                value={currentGuardian.email}
                onChange={(e) => setCurrentGuardian({...currentGuardian, email: e.target.value})}
                className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <Label htmlFor="modal-phone">Phone (Optional)</Label>
              <Input
                id="modal-phone"
                placeholder="Enter guardian's phone number"
                value={currentGuardian.phone}
                onChange={(e) => setCurrentGuardian({...currentGuardian, phone: e.target.value})}
                className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <Label htmlFor="modal-relationship">Relationship</Label>
              <select
                id="modal-relationship"
                className="w-full p-2 border rounded-md transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                value={currentGuardian.relationship}
                onChange={(e) => setCurrentGuardian({...currentGuardian, relationship: e.target.value})}
              >
                <option value="">Select relationship...</option>
                {relationships.map(rel => (
                  <option key={rel} value={rel}>{rel}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-3 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={addGuardian}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Guardian
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
