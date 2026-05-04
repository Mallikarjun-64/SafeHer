import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { db } from "@/lib/firebase";
import { 
  collection, 
  query, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  doc, 
  orderBy, 
  serverTimestamp 
} from "firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Trash2, UserPlus, Loader2 } from "lucide-react";
import { z } from "zod";

interface Guardian {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  relation: string | null;
}

const schema = z.object({
  name: z.string().trim().min(2).max(100),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  email: z.string().trim().email().max(255).optional().or(z.literal("")),
  relation: z.string().trim().max(50).optional().or(z.literal("")),
});

export default function UserGuardians() {
  const { user } = useAuth();
  const [list, setList] = useState<Guardian[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", relation: "" });

  const load = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const q = query(
        collection(db, "users", user.id, "guardians"),
        orderBy("addedDate", "desc")
      );
      const querySnapshot = await getDocs(q);
      const mapped: Guardian[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
        phone: doc.data().phone,
        email: doc.data().email,
        relation: doc.data().relationship || doc.data().relation,
      }));
      setList(mapped);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [user]);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const parsed = schema.safeParse(form);
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    setSaving(true);
    try {
      await addDoc(collection(db, "users", user.id, "guardians"), {
        name: parsed.data.name,
        phone: parsed.data.phone || null,
        email: parsed.data.email || null,
        relationship: parsed.data.relation || null,
        addedDate: serverTimestamp(),
      });
      toast.success("Guardian added");
      setForm({ name: "", phone: "", email: "", relation: "" });
      load();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, "users", user.id, "guardians", id));
      toast.success("Removed");
      setList((l) => l.filter((g) => g.id !== id));
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
      <Card className="p-6">
        <h2 className="text-lg font-semibold">Add a guardian</h2>
        <p className="mt-1 text-sm text-muted-foreground">They'll receive your SOS alerts and live location.</p>
        <form onSubmit={add} className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Relation</Label>
              <Input placeholder="Mother, friend…" value={form.relation} onChange={(e) => setForm({ ...form, relation: e.target.value })} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <Button type="submit" disabled={saving} className="w-full">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
            Add guardian
          </Button>
        </form>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold">Your guardians</h2>
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : list.length === 0 ? (
          <p className="mt-4 rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            No guardians yet. Add the people who should be alerted.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {list.map((g) => (
              <li key={g.id} className="flex items-start justify-between rounded-lg border p-3">
                <div className="min-w-0">
                  <p className="font-medium">{g.name} {g.relation && <span className="ml-2 text-xs font-normal text-muted-foreground">· {g.relation}</span>}</p>
                  {g.phone && <p className="text-sm text-muted-foreground">{g.phone}</p>}
                  {g.email && <p className="truncate text-sm text-muted-foreground">{g.email}</p>}
                </div>
                <Button variant="ghost" size="icon" onClick={() => remove(g.id)} aria-label="Remove">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}