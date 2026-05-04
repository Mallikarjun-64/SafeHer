import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Trash2, Plus, Loader2 } from "lucide-react";

interface Station { id: string; name: string; phone: string | null; address: string | null; }

export default function AdminStations() {
  const [list, setList] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", phone: "", address: "" });

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("police_stations").select("id,name,phone,address").order("name");
    setList((data ?? []) as Station[]);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Name required");
    const { error } = await supabase.from("police_stations").insert([{ name: form.name.trim(), phone: form.phone || null, address: form.address || null }]);
    if (error) return toast.error(error.message);
    setForm({ name: "", phone: "", address: "" });
    toast.success("Added");
    load();
  };
  const remove = async (id: string) => {
    const { error } = await supabase.from("police_stations").delete().eq("id", id);
    if (error) return toast.error(error.message);
    load();
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
      <Card className="p-6">
        <h2 className="text-lg font-semibold">Add police station</h2>
        <form onSubmit={add} className="mt-4 space-y-3">
          <div className="space-y-2"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
          <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          <div className="space-y-2"><Label>Address</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
          <Button type="submit" className="w-full"><Plus className="h-4 w-4" /> Add</Button>
        </form>
      </Card>
      <Card className="p-6">
        <h2 className="text-lg font-semibold">Stations</h2>
        {loading ? <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div> :
          list.length === 0 ? <p className="mt-4 text-sm text-muted-foreground">None yet.</p> :
          <ul className="mt-4 space-y-2">
            {list.map((s) => (
              <li key={s.id} className="flex items-start justify-between rounded-lg border p-3">
                <div><p className="font-medium">{s.name}</p>{s.phone && <p className="text-sm text-muted-foreground">{s.phone}</p>}{s.address && <p className="text-sm text-muted-foreground">{s.address}</p>}</div>
                <Button variant="ghost" size="icon" onClick={() => remove(s.id)}><Trash2 className="h-4 w-4" /></Button>
              </li>
            ))}
          </ul>}
      </Card>
    </div>
  );
}