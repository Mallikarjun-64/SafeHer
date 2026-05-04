import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { db } from "@/lib/firebase";
import { collection, query, getDocs, orderBy, Timestamp } from "firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, MapPin } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";

interface Alert {
  id: string;
  created_at: string;
  status: string;
  latitude: number | null;
  longitude: number | null;
  message: string | null;
}

export default function UserHistory() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchHistory = async () => {
      try {
        const q = query(
          collection(db, "users", user.id, "emergency_alerts"),
          orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        const mapped: Alert[] = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            created_at: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : (data.createdAt || new Date().toISOString()),
            status: data.status,
            latitude: data.latitude,
            longitude: data.longitude,
            message: data.address || null,
          };
        });
        setAlerts(mapped);
      } catch (error) {
        console.error("Error fetching history:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [user]);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  if (alerts.length === 0)
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">No alerts yet. Stay safe!</p>
      </Card>
    );

  return (
    <div className="space-y-3">
      {alerts.map((a) => (
        <Card key={a.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <StatusBadge status={a.status} />
              <span className="text-sm text-muted-foreground">{new Date(a.created_at).toLocaleString()}</span>
            </div>
            {a.message && <p className="mt-1 text-sm">{a.message}</p>}
          </div>
          {a.latitude && a.longitude && (
            <a
              href={`https://www.google.com/maps?q=${a.latitude},${a.longitude}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              <MapPin className="h-4 w-4" /> View on map
            </a>
          )}
        </Card>
      ))}
    </div>
  );
}