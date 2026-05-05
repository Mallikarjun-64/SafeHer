import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { db } from "@/lib/firebase";
import { collection, query, getDocs, addDoc, deleteDoc, doc, orderBy } from "firebase/firestore";
import { toast } from "sonner";
import { Trash2, Plus, Loader2 } from "lucide-react";

interface H { id: string; name: string; phone: string; description: string | null; }

export default function AdminHelplines() {
  const [list, setList] = useState<H[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", phone: "", description: "" });

  const load = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "helplines"), orderBy("name"));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as H));
      setList(data);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone) return toast.error("Name and phone required");
    try {
      await addDoc(collection(db, "helplines"), {
        name: form.name,
        phone: form.phone,
        description: form.description || null
      });
      setForm({ name: "", phone: "", description: "" });
      toast.success("Added");
      load();
    } catch (error: any) {
      toast.error(error.message);
    }
  };
  const remove = async (id: string) => {
    try {
      await deleteDoc(doc(db, "helplines", id));
      load();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
      <Card className="p-6">
        <h2 className="text-lg font-semibold">Add helpline</h2>
        <form onSubmit={add} className="mt-4 space-y-3">
          <div className="space-y-2"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
          <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required /></div>
          <div className="space-y-2"><Label>Description</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <Button type="submit" className="w-full"><Plus className="h-4 w-4" /> Add</Button>
        </form>
      </Card>
      <Card className="p-6">
        <h2 className="text-lg font-semibold">Helplines</h2>
        {loading ? <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div> :
          <ul className="mt-4 space-y-2">
            {list.map((h) => (
              <li key={h.id} className="flex items-start justify-between rounded-lg border p-3">
                <div><p className="font-medium">{h.name} <span className="ml-2 text-sm text-muted-foreground">{h.phone}</span></p>{h.description && <p className="text-sm text-muted-foreground">{h.description}</p>}</div>
                <Button variant="ghost" size="icon" onClick={() => remove(h.id)}><Trash2 className="h-4 w-4" /></Button>
              </li>
            ))}
          </ul>}
      </Card>
    </div>
  );
}