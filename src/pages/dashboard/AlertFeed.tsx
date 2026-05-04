import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, MapPin, RefreshCw } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import { useAuth } from "@/contexts/AuthContext";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

interface AlertRow {
  id: string;
  user_id: string;
  status: string;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  message: string | null;
  profile?: { full_name: string | null; phone: string | null };
}

export default function AlertFeed({
  canUpdate,
  emptyText,
}: {
  canUpdate: boolean;
  emptyText: string;
}) {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<AlertRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    setLoading(true);
    const { data: rows } = await supabase
      .from("alerts")
      .select("id,user_id,status,latitude,longitude,created_at,message")
      .order("created_at", { ascending: false })
      .limit(100);
    const list = (rows ?? []) as AlertRow[];
    const ids = Array.from(new Set(list.map((a) => a.user_id)));
    if (ids.length) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("id,full_name,phone")
        .in("id", ids);
      const map = new Map((profs ?? []).map((p: any) => [p.id, p]));
      list.forEach((a) => { a.profile = map.get(a.user_id) as any; });
    }
    setAlerts(list);
    setLoading(false);
  };

  useEffect(() => {
    fetchAlerts();
    const ch = supabase
      .channel("alerts-feed")
      .on("postgres_changes", { event: "*", schema: "public", table: "alerts" }, () => {
        fetchAlerts();
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("alerts")
      .update({ status: status as any })
      .eq("id", id);
    if (error) return toast.error(error.message);
    if (user) {
      await supabase.from("alert_updates").insert([{
        alert_id: id, updated_by: user.id, status: status as any, note: null,
      }]);
    }
    toast.success("Status updated");
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  if (alerts.length === 0)
    return <Card className="p-8 text-center text-muted-foreground">{emptyText}</Card>;

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={fetchAlerts}>
          <RefreshCw className="h-4 w-4" /> Refresh
        </Button>
      </div>
      {alerts.map((a) => (
        <Card key={a.id} className="p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={a.status} />
                <span className="text-sm font-semibold">
                  {a.profile?.full_name || "Unknown user"}
                </span>
                {a.profile?.phone && (
                  <a href={`tel:${a.profile.phone}`} className="text-sm text-primary hover:underline">{a.profile.phone}</a>
                )}
                <span className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleString()}</span>
              </div>
              {a.message && <p className="mt-2 text-sm">{a.message}</p>}
              {a.latitude && a.longitude && (
                <a
                  href={`https://www.google.com/maps?q=${a.latitude},${a.longitude}`}
                  target="_blank" rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                >
                  <MapPin className="h-4 w-4" /> Live location
                </a>
              )}
            </div>
            {canUpdate && (
              <div className="md:w-48">
                <Select value={a.status} onValueChange={(v) => updateStatus(a.id, v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="responded">Responded</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}