import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  blocked: boolean;
  verified: boolean;
  created_at: string;
}

export default function AdminUsers() {
  const [list, setList] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    setList((data ?? []) as Profile[]);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const toggle = async (id: string, field: "blocked" | "verified", value: boolean) => {
    const update = field === "blocked" ? { blocked: value } : { verified: value };
    const { error } = await supabase.from("profiles").update(update).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Updated");
    load();
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-3">
      {list.map((p) => (
        <Card key={p.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium">{p.full_name || "—"} {p.verified && <span className="ml-2 rounded bg-success/15 px-2 py-0.5 text-xs font-semibold text-success">Verified</span>} {p.blocked && <span className="ml-2 rounded bg-destructive/15 px-2 py-0.5 text-xs font-semibold text-destructive">Blocked</span>}</p>
            {p.phone && <p className="text-sm text-muted-foreground">{p.phone}</p>}
            <p className="text-xs text-muted-foreground">Joined {new Date(p.created_at).toLocaleDateString()}</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant={p.verified ? "outline" : "default"} onClick={() => toggle(p.id, "verified", !p.verified)}>
              {p.verified ? "Unverify" : "Verify"}
            </Button>
            <Button size="sm" variant={p.blocked ? "outline" : "destructive"} onClick={() => toggle(p.id, "blocked", !p.blocked)}>
              {p.blocked ? "Unblock" : "Block"}
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}