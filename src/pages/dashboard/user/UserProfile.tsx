import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function UserProfile() {
  const { user } = useAuth();
  const [form, setForm] = useState({ full_name: "", phone: "", address: "", medical_notes: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", user.id));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setForm({
            full_name: data.full_name ?? "",
            phone: data.phone ?? "",
            address: data.address ?? "",
            medical_notes: data.medical_notes ?? "",
          });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, "users", user.id), form);
      toast.success("Profile updated");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <Card className="max-w-2xl p-6">
      <form onSubmit={save} className="space-y-4">
        <div className="space-y-2"><Label>Full name</Label>
          <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} maxLength={100} />
        </div>
        <div className="space-y-2"><Label>Phone</Label>
          <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} maxLength={20} />
        </div>
        <div className="space-y-2"><Label>Address</Label>
          <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} maxLength={500} />
        </div>
        <div className="space-y-2"><Label>Medical notes (allergies, conditions)</Label>
          <Textarea value={form.medical_notes} onChange={(e) => setForm({ ...form, medical_notes: e.target.value })} maxLength={1000} rows={4} />
        </div>
        <Button type="submit" disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}Save changes
        </Button>
      </form>
    </Card>
  );
}