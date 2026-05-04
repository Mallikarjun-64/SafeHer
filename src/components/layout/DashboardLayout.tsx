import { ReactNode } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Shield, LogOut, Menu, Home, Users, History, Phone, UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth, primaryRole } from "@/contexts/AuthContext";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const nav: NavItem[] = [
  { to: "/dashboard/user", label: "SOS", icon: Home },
  { to: "/dashboard/user/guardians", label: "Guardians", icon: Users },
  { to: "/dashboard/user/history", label: "Alert history", icon: History },
  { to: "/dashboard/user/helplines", label: "Helplines", icon: Phone },
  { to: "/dashboard/user/profile", label: "Profile", icon: UserIcon },
  { to: "/auth", label: "Logout", icon: LogOut },
];

export default function DashboardLayout({
  title,
  children,
  nav,
}: {
  title: string;
  children: ReactNode;
  nav?: NavItem[];
}) {
  const { user, roles, signOut } = useAuth();
  const navigate = useNavigate();
  const role = primaryRole(roles);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const SideContent = () => (
    <nav className="flex flex-col gap-1 p-3">
      {nav.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              isActive
                ? "bg-primary text-primary-foreground shadow-elegant"
                : "text-foreground hover:bg-muted"
            }`
          }
        >
          <item.icon className="h-4 w-4" />
          {item.label}
        </NavLink>
      ))}
    </nav>
  );

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-card/80 px-4 backdrop-blur md:px-6">
        <div className="flex items-center gap-3">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <div className="flex items-center gap-2 border-b p-4">
                <Shield className="h-5 w-5 text-primary" />
                <span className="font-bold">SafeHer</span>
              </div>
              <SideContent />
            </SheetContent>
          </Sheet>
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-hero">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight">SafeHer</span>
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-xs text-muted-foreground">Signed in as</p>
            <p className="text-sm font-medium leading-tight">
              {user?.email}{" "}
              <span className="ml-1 rounded bg-accent px-1.5 py-0.5 text-[10px] font-semibold uppercase text-accent-foreground">
                {role}
              </span>
            </p>
          </div>
          {user && (
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          )}
        </div>
      </header>

      <div className="flex flex-1">
        <aside className="hidden w-64 shrink-0 border-r bg-card md:block">
          <SideContent />
        </aside>
        <main className="flex-1 px-4 py-6 md:px-8">
          <h1 className="mb-6 text-2xl font-bold tracking-tight md:text-3xl">{title}</h1>
          {children}
        </main>
      </div>
    </div>
  );
}