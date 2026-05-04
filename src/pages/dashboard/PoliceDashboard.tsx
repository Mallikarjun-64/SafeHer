import DashboardLayout from "@/components/layout/DashboardLayout";
import { Activity } from "lucide-react";
import AlertFeed from "./AlertFeed";

const nav = [{ to: "/dashboard/police", label: "Live alerts", icon: Activity }];

export default function PoliceDashboard() {
  return (
    <DashboardLayout title="Live alerts" nav={nav}>
      <AlertFeed canUpdate={true} emptyText="No active alerts right now." />
    </DashboardLayout>
  );
}