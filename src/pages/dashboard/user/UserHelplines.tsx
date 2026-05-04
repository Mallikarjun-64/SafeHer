import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Phone, Loader2 } from "lucide-react";

interface Helpline { id: string; name: string; phone: string; description: string | null; }

export default function UserHelplines() {
  const [list, setList] = useState<Helpline[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("helplines").select("*").order("name").then(({ data }) => {
      setList((data ?? []) as Helpline[]);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {list.map((h) => (
        <Card key={h.id} className="p-5">
          <h3 className="font-semibold">{h.name}</h3>
          {h.description && <p className="mt-1 text-sm text-muted-foreground">{h.description}</p>}
          <Button asChild className="mt-4 w-full"><a href={`tel:${h.phone}`}><Phone className="h-4 w-4" /> Call {h.phone}</a></Button>
        </Card>
      ))}
    </div>
  );
}