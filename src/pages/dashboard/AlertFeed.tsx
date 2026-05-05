import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/firebase";
import { 
  collection, 
  query, 
  getDocs, 
  orderBy, 
  limit, 
  onSnapshot, 
  updateDoc, 
  doc, 
  getDoc, 
  collectionGroup, 
  Timestamp 
} from "firebase/firestore";
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
    try {
      const q = query(
        collectionGroup(db, "emergency_alerts"),
        orderBy("createdAt", "desc"),
        limit(100)
      );
      
      const querySnapshot = await getDocs(q);
      const list: AlertRow[] = [];
      
      for (const alertDoc of querySnapshot.docs) {
        const d = alertDoc.data();
        const userId = alertDoc.ref.parent.parent?.id || "";
        
        const alertRow: AlertRow = {
          id: alertDoc.id,
          user_id: userId,
          status: d.status,
          latitude: d.latitude,
          longitude: d.longitude,
          created_at: d.createdAt instanceof Timestamp ? d.createdAt.toDate().toISOString() : (d.createdAt || new Date().toISOString()),
          message: d.address || null,
        };

        if (userId) {
          const userDoc = await getDoc(doc(db, "users", userId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            alertRow.profile = {
              full_name: userData.full_name || null,
              phone: userData.phone || null,
            };
          }
        }
        list.push(alertRow);
      }
      setAlerts(list);
    } catch (error: any) {
      console.error("Error fetching alerts:", error);
      toast.error("Failed to load alerts. Ensure collection group indexes are created.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const q = query(
      collectionGroup(db, "emergency_alerts"),
      orderBy("createdAt", "desc"),
      limit(100)
    );
    const unsubscribe = onSnapshot(q, () => {
      fetchAlerts();
    }, (error) => {
      console.error("Real-time alert error:", error);
    });
    return () => unsubscribe();
  }, []);

  const updateStatus = async (id: string, userId: string, status: string) => {
    try {
      const alertRef = doc(db, "users", userId, "emergency_alerts", id);
      await updateDoc(alertRef, { status });
      toast.success("Status updated");
      fetchAlerts();
    } catch (error: any) {
      toast.error(error.message);
    }
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
                <Select value={a.status} onValueChange={(v) => updateStatus(a.id, a.user_id, v)}>
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