import { Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Activity, Users, Shield, Phone } from "lucide-react";
import AlertFeed from "./AlertFeed";
import AdminUsers from "./admin/AdminUsers";
import AdminStations from "./admin/AdminStations";
import AdminHelplines from "./admin/AdminHelplines";

const nav = [
  { to: "/dashboard/admin", label: "Alerts", icon: Activity },
  { to: "/dashboard/admin/users", label: "Users", icon: Users },
  { to: "/dashboard/admin/stations", label: "Police stations", icon: Shield },
  { to: "/dashboard/admin/helplines", label: "Helplines", icon: Phone },
];

function Layout() {
  const location = useLocation();
  const titles: Record<string, string> = {
    "/dashboard/admin": "All alerts",
    "/dashboard/admin/users": "Users",
    "/dashboard/admin/stations": "Police stations",
    "/dashboard/admin/helplines": "Helplines",
  };
  return (
    <DashboardLayout title={titles[location.pathname] ?? "Admin"} nav={nav}>
      <Outlet />
    </DashboardLayout>
  );
}

export default function AdminDashboard() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<AlertFeed canUpdate={true} emptyText="No alerts yet." />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="stations" element={<AdminStations />} />
        <Route path="helplines" element={<AdminHelplines />} />
        <Route path="*" element={<Navigate to="/dashboard/admin" replace />} />
      </Route>
    </Routes>
  );
}