import DashboardLayout from "@/components/layout/DashboardLayout";
import { Bell } from "lucide-react";
import AlertFeed from "./AlertFeed";

const nav = [{ to: "/dashboard/guardian", label: "Linked alerts", icon: Bell }];

export default function GuardianDashboard() {
  return (
    <DashboardLayout title="Linked alerts" nav={nav}>
      <p className="mb-4 text-sm text-muted-foreground">
        You'll see SOS alerts from users who added you as a guardian (linked by your account).
      </p>
      <AlertFeed canUpdate={false} emptyText="No alerts yet from your linked users." />
    </DashboardLayout>
  );
}