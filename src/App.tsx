import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { BrowserRouter, Route, Routes } from "react-router-dom";

import { Toaster as Sonner } from "@/components/ui/sonner";

import { Toaster } from "@/components/ui/toaster";

import { TooltipProvider } from "@/components/ui/tooltip";

import { AuthProvider } from "@/contexts/AuthContext";

import ProtectedRoute from "@/components/ProtectedRoute";

import Index from "./pages/Index.tsx";

import NotFound from "./pages/NotFound.tsx";

import Auth from "./pages/Auth.tsx";

import { AuthCallback } from "./pages/auth/AuthCallback";

import GuardianSetup from "./components/GuardianSetup";

import UserDashboard from "./pages/dashboard/UserDashboard";

import GuardianDashboard from "./pages/dashboard/GuardianDashboard";

import PoliceDashboard from "./pages/dashboard/PoliceDashboard";

import AdminDashboard from "./pages/dashboard/AdminDashboard";

import WomenPage from "./pages/roles/WomenPage";

import GuardianPage from "./pages/roles/GuardianPage";

import PolicePage from "./pages/roles/PolicePage";

import FeaturesPage from "./pages/FeaturesPage.tsx";

import ProfilePage from "./pages/ProfilePage.tsx";

import SOSPage from "./pages/SOSPage.tsx";

import LiveLocationPage from "./pages/LiveLocationPage.tsx";

import AlertSettings from "./pages/AlertSettings.tsx";

import PoliceIntegration from "./components/PoliceIntegration.tsx";

import GuardianManagement from "./pages/GuardianManagement.tsx";

import EmergencyServices from "./pages/EmergencyServices.tsx";



const queryClient = new QueryClient();



const App = () => (

  <QueryClientProvider client={queryClient}>

    <TooltipProvider>

      <Toaster />

      <Sonner />

      <BrowserRouter>

        <AuthProvider>

          <Routes>

            <Route path="/" element={<Index />} />

            <Route path="/features" element={<FeaturesPage />} />

            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

            <Route path="/sos" element={<SOSPage />} />

            <Route path="/location" element={<LiveLocationPage />} />

            <Route path="/settings" element={<AlertSettings />} />

            <Route path="/police-integration" element={<PoliceIntegration />} />

            <Route path="/guardian-management" element={<ProtectedRoute><GuardianManagement /></ProtectedRoute>} />

            <Route path="/emergency-services" element={<EmergencyServices />} />

            <Route path="/auth" element={<Auth />} />

            <Route path="/auth/callback" element={<AuthCallback />} />

            <Route path="/guardian-setup" element={<GuardianSetup />} />

            <Route path="/roles/women" element={<WomenPage />} />

            <Route path="/roles/guardian" element={<GuardianPage />} />

            <Route path="/roles/police" element={<PolicePage />} />

            <Route path="/dashboard/user/*" element={<ProtectedRoute allow={["user", "admin"]}><UserDashboard /></ProtectedRoute>} />

            <Route path="/dashboard/guardian" element={<ProtectedRoute allow={["guardian", "admin"]}><GuardianDashboard /></ProtectedRoute>} />

            <Route path="/dashboard/police" element={<ProtectedRoute allow={["police", "admin"]}><PoliceDashboard /></ProtectedRoute>} />

            <Route path="/dashboard/admin/*" element={<ProtectedRoute allow={["admin"]}><AdminDashboard /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />

          </Routes>

        </AuthProvider>

      </BrowserRouter>

    </TooltipProvider>

  </QueryClientProvider>

);



export default App;

