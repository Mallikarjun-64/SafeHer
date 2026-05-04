import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { db } from '@/lib/firebase';
import { 
  collection, 
  query, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  orderBy, 
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { 
  Users, 
  Phone, 
  Mail, 
  MapPin, 
  Bell, 
  Shield, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Clock,
  MessageSquare,
  Navigation,
  UserPlus,
  User,
  ArrowLeft,
  Save,
  Eye,
  EyeOff,
  Smartphone,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { alertService, Guardian as IGuardian, AlertResponse } from '@/services/alertService';

interface Guardian extends IGuardian {
  id: string;
  name: string;
  email: string;
  phone: string;
  relationship: string;
  address: string;
  status: 'active' | 'inactive' | 'pending';
  alerts: {
    sos: boolean;
    location: boolean;
    checkIn: boolean;
    emergency: boolean;
  };
  priority: 'high' | 'medium' | 'low';
  addedDate: string;
  lastNotified?: string;
}

interface GuardianFormData {
  name: string;
  email: string;
  phone: string;
  relationship: string;
  address: string;
  alerts: {
    sos: boolean;
    location: boolean;
    checkIn: boolean;
    emergency: boolean;
  };
  priority: 'high' | 'medium' | 'low';
}

export default function GuardianManagement() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [guardians, setGuardians] = useState<Guardian[]>([]);
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingGuardian, setEditingGuardian] = useState<Guardian | null>(null);
  const [formData, setFormData] = useState<GuardianFormData>({
    name: '',
    email: '',
    phone: '',
    relationship: '',
    address: '',
    alerts: {
      sos: true,
      location: true,
      checkIn: true,
      emergency: true
    },
    priority: 'medium'
  });
  const [loading, setLoading] = useState(false);


  const fetchGuardians = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const q = query(
        collection(db, 'users', user.id, 'guardians'),
        orderBy('addedDate', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const mappedGuardians: Guardian[] = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          relationship: data.relationship,
          address: data.address || '',
          status: data.status || 'active',
          alerts: data.alerts || { sos: true, location: true, checkIn: true, emergency: true },
          priority: data.priority || 'medium',
          addedDate: data.addedDate instanceof Timestamp ? data.addedDate.toDate().toISOString().split('T')[0] : (data.addedDate || new Date().toISOString().split('T')[0]),
          lastNotified: data.lastNotified
        };
      });

      setGuardians(mappedGuardians);
    } catch (error) {
      console.error('Error fetching guardians from Firestore:', error);
      toast.error('Failed to load guardians');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuardians();
  }, [user]);

  const refreshData = async () => {
    await fetchGuardians();
    toast.success('Guardians refreshed');
  };

  const handleAddGuardian = async () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.relationship) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!user) return;

    setLoading(true);
    try {
      const guardianData = {
        ...formData,
        status: 'active',
        addedDate: serverTimestamp()
      };

      await addDoc(collection(db, 'users', user.id, 'guardians'), guardianData);
      
      toast.success('Guardian added successfully');
      setShowAddForm(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        relationship: '',
        address: '',
        alerts: { sos: true, location: true, checkIn: true, emergency: true },
        priority: 'medium'
      });
      fetchGuardians();
    } catch (error: any) {
      console.error('Error adding guardian to Firestore:', error);
      toast.error('Failed to add guardian');
    } finally {
      setLoading(false);
    }
  };



  const handleDeleteGuardian = async (guardianId: string) => {
    if (!user) return;
    
    try {
      await deleteDoc(doc(db, 'users', user.id, 'guardians', guardianId));
      toast.success('Guardian removed successfully');
      fetchGuardians();
    } catch (error) {
      console.error('Error removing guardian from Firestore:', error);
      toast.error('Failed to remove guardian');
    }
  };

  const handleEditGuardian = (guardian: Guardian) => {
    setEditingGuardian(guardian);
    setFormData({
      name: guardian.name,
      email: guardian.email,
      phone: guardian.phone,
      relationship: guardian.relationship,
      address: guardian.address,
      alerts: guardian.alerts,
      priority: guardian.priority
    });
    setShowAddForm(true);
  };

  const handleUpdateGuardian = async () => {
    if (!editingGuardian || !user) return;
    
    setLoading(true);
    try {
      const guardianRef = doc(db, 'users', user.id, 'guardians', editingGuardian.id);
      await updateDoc(guardianRef, {
        ...formData,
        updatedAt: serverTimestamp()
      });
      
      toast.success('Guardian updated successfully');
      setEditingGuardian(null);
      setShowAddForm(false);
      fetchGuardians();
    } catch (error) {
      console.error('Error updating guardian in Firestore:', error);
      toast.error('Failed to update guardian');
    } finally {
      setLoading(false);
    }
  };




  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'inactive': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur-md shadow-lg">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
                <Users className="h-4 w-4 text-white" />
              </div>
              <h1 className="text-lg font-bold">Guardian Management</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={refreshData} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Make Current
            </Button>
            <Button onClick={() => setShowAddForm(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Guardian
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Guardians</p>
                  <p className="text-2xl font-bold">{guardians.length}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active</p>
                  <p className="text-2xl font-bold">{guardians.filter(g => g.status === 'active').length}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold">{guardians.filter(g => g.status === 'pending').length}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">High Priority</p>
                  <p className="text-2xl font-bold">{guardians.filter(g => g.priority === 'high').length}</p>
                </div>
                <div className="p-3 bg-red-100 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Guardians List */}
        <div className="space-y-6">
          {guardians.map((guardian, index) => (
            <Card 
              key={guardian.id} 
              className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                  {/* Guardian Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {guardian.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{guardian.name}</h3>
                          <Badge className={getPriorityColor(guardian.priority)}>
                            {guardian.priority} priority
                          </Badge>
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(guardian.status)} animate-pulse`}></div>
                          <span className="text-sm text-gray-600 capitalize">{guardian.status}</span>
                        </div>
                        
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span>{guardian.relationship}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            <span>{guardian.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            <span>{guardian.phone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{guardian.address}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>Added: {guardian.addedDate}</span>
                          </div>
                          {guardian.lastNotified && (
                            <div className="flex items-center gap-2">
                              <Bell className="h-4 w-4" />
                              <span>Last notified: {guardian.lastNotified}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Alert Preferences */}
                  <div className="flex-1 lg:max-w-md">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Bell className="h-4 w-4" />
                      Alert Preferences
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        <span className="text-sm">SOS Alerts</span>
                        {guardian.alerts.sos && <CheckCircle className="h-4 w-4 text-green-500" />}
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                        <Navigation className="h-4 w-4 text-blue-500" />
                        <span className="text-sm">Location</span>
                        {guardian.alerts.location && <CheckCircle className="h-4 w-4 text-green-500" />}
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                        <Clock className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm">Check-in</span>
                        {guardian.alerts.checkIn && <CheckCircle className="h-4 w-4 text-green-500" />}
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                        <Shield className="h-4 w-4 text-purple-500" />
                        <span className="text-sm">Emergency</span>
                        {guardian.alerts.emergency && <CheckCircle className="h-4 w-4 text-green-500" />}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-2 lg:w-auto">

                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleEditGuardian(guardian)}
                      className="hover:bg-yellow-50"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleDeleteGuardian(guardian.id)}
                      className="hover:bg-red-50 text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {guardians.length === 0 && (
          <Card className="border-0 shadow-xl text-center py-12">
            <CardContent>
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
                <Users className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Guardians Added</h3>
              <p className="text-gray-600 mb-6">Add trusted contacts who will be notified in emergencies</p>
              <Button onClick={() => setShowAddForm(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Guardian
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add/Edit Guardian Dialog */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <UserPlus className="h-5 w-5 text-blue-600" />
              </div>
              {editingGuardian ? 'Edit Guardian' : 'Add New Guardian'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Basic Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter guardian's name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="relationship">Relationship *</Label>
                  <Select
                    value={formData.relationship}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, relationship: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select relationship" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="parent">Parent</SelectItem>
                      <SelectItem value="sibling">Sibling</SelectItem>
                      <SelectItem value="spouse">Spouse</SelectItem>
                      <SelectItem value="friend">Friend</SelectItem>
                      <SelectItem value="relative">Relative</SelectItem>
                      <SelectItem value="colleague">Colleague</SelectItem>
                      <SelectItem value="neighbor">Neighbor</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="guardian@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+1-555-0123"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="123 Main St, City, State 12345"
                />
              </div>
            </div>

            {/* Alert Preferences */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Alert Preferences</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    <div>
                      <div className="font-medium">SOS Alerts</div>
                      <div className="text-sm text-gray-600">Immediate emergency notifications</div>
                    </div>
                  </div>
                  <Switch
                    checked={formData.alerts.sos}
                    onCheckedChange={(checked) => setFormData(prev => ({
                      ...prev,
                      alerts: { ...prev.alerts, sos: checked }
                    }))}
                  />
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Navigation className="h-5 w-5 text-blue-500" />
                    <div>
                      <div className="font-medium">Location Sharing</div>
                      <div className="text-sm text-gray-600">Share GPS coordinates during alerts</div>
                    </div>
                  </div>
                  <Switch
                    checked={formData.alerts.location}
                    onCheckedChange={(checked) => setFormData(prev => ({
                      ...prev,
                      alerts: { ...prev.alerts, location: checked }
                    }))}
                  />
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-yellow-500" />
                    <div>
                      <div className="font-medium">Check-in Reminders</div>
                      <div className="text-sm text-gray-600">Periodic safety check notifications</div>
                    </div>
                  </div>
                  <Switch
                    checked={formData.alerts.checkIn}
                    onCheckedChange={(checked) => setFormData(prev => ({
                      ...prev,
                      alerts: { ...prev.alerts, checkIn: checked }
                    }))}
                  />
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-purple-500" />
                    <div>
                      <div className="font-medium">Emergency Updates</div>
                      <div className="text-sm text-gray-600">Status updates during ongoing emergencies</div>
                    </div>
                  </div>
                  <Switch
                    checked={formData.alerts.emergency}
                    onCheckedChange={(checked) => setFormData(prev => ({
                      ...prev,
                      alerts: { ...prev.alerts, emergency: checked }
                    }))}
                  />
                </div>
              </div>
            </div>

            {/* Priority */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Priority Level</h4>
              <Select
                value={formData.priority}
                onValueChange={(value: 'high' | 'medium' | 'low') => setFormData(prev => ({ ...prev, priority: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High - Primary contact for emergencies</SelectItem>
                  <SelectItem value="medium">Medium - Secondary contact</SelectItem>
                  <SelectItem value="low">Low - Informational alerts only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingGuardian(null);
                  setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    relationship: '',
                    address: '',
                    alerts: {
                      sos: true,
                      location: true,
                      checkIn: true,
                      emergency: true
                    },
                    priority: 'medium'
                  });
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (editingGuardian) {
                    handleUpdateGuardian();
                  } else {
                    handleAddGuardian();
                  }
                }}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    {editingGuardian ? 'Updating...' : 'Adding...'}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {editingGuardian ? 'Update Guardian' : 'Add Guardian'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>


    </div>
  );
}
