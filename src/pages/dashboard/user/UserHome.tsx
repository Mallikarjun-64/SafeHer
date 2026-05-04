import WorkingSOSButton from "@/components/WorkingSOSButton";
import FeatureCards from "@/components/FeatureCards";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";

export default function UserHome() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      <Card className="flex flex-col items-center justify-center gap-6 p-8 md:p-12 shadow-elegant">
        <WorkingSOSButton />
      </Card>

      <FeatureCards user={user} />

      <p className="text-center text-xs text-muted-foreground">Signed in as {user?.email}</p>
    </div>
  );
}