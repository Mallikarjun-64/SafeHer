import { Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Home, Users, History, User as UserIcon, Phone } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import UserHome from "./user/UserHome";
import UserGuardians from "./user/UserGuardians";
import UserHistory from "./user/UserHistory";
import UserProfile from "./user/UserProfile";
import UserHelplines from "./user/UserHelplines";

const nav = [
  { to: "/dashboard/user", label: "SOS", icon: Home },
  { to: "/dashboard/user/guardians", label: "Guardians", icon: Users },
  { to: "/dashboard/user/history", label: "Alert history", icon: History },
  { to: "/dashboard/user/helplines", label: "Helplines", icon: Phone },
  { to: "/dashboard/user/profile", label: "Profile", icon: UserIcon },
];

function Layout() {
  const location = useLocation();
  console.log('Current location pathname:', location.pathname);
  
  const titles: Record<string, string> = {
    "/dashboard/user": "Emergency",
    "/dashboard/user/guardians": "Trusted contacts",
    "/dashboard/user/history": "Alert history",
    "/dashboard/user/helplines": "Emergency helplines",
    "/dashboard/user/profile": "Your profile",
  };
  
  const currentTitle = titles[location.pathname] ?? "Dashboard";
  console.log('Dashboard title:', currentTitle);
  
  return (
    <DashboardLayout title={currentTitle} nav={nav}>
      <Outlet />
    </DashboardLayout>
  );
}

export default function UserDashboard() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<UserHome />} />
        <Route path="guardians" element={<UserGuardians />} />
        <Route path="history" element={<UserHistory />} />
        <Route path="helplines" element={<UserHelplines />} />
        <Route path="profile" element={<UserProfile />} />
        <Route path="*" element={<Navigate to="/dashboard/user" replace />} />
      </Route>
    </Routes>
  );
}