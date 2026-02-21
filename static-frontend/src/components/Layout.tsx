import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Car,
  MapPin,
  Wrench,
  DollarSign,
  Users,
  BarChart3,
  Menu,
  X,
  Flag,
  ChevronRight,
} from "lucide-react";
import racingBg from "@/assets/racing-bg.jpg";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Command Center" },
  { to: "/vehicles", icon: Car, label: "Vehicle Registry" },
  { to: "/trips", icon: MapPin, label: "Trip Dispatcher" },
  { to: "/maintenance", icon: Wrench, label: "Maintenance Logs" },
  { to: "/expenses", icon: DollarSign, label: "Expense & Fuel" },
  { to: "/drivers", icon: Users, label: "Driver Performance" },
  { to: "/analytics", icon: BarChart3, label: "Analytics" },
];

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const currentPage = navItems.find((item) => item.to === location.pathname);

  return (
    <div className="flex h-screen overflow-hidden relative">
      {/* Global background */}
      <div className="fixed inset-0 z-0">
        <img src={racingBg} alt="" className="w-full h-full object-cover opacity-[0.04]" />
        <div className="absolute inset-0 bg-background/95" />
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 lg:relative lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-full bg-sidebar/95 backdrop-blur-xl border-r border-sidebar-border flex flex-col">
          <div className="flex items-center gap-3 px-6 py-5 border-b border-sidebar-border">
            <div className="relative">
              <Flag className="h-7 w-7 text-primary" />
              <div className="absolute inset-0 blur-md bg-primary/20" />
            </div>
            <h1 className="font-racing text-xl text-foreground tracking-wider">
              Fleet<span className="text-primary">Flow</span>
            </h1>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `group flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 relative overflow-hidden ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full shadow-lg shadow-primary/50" />
                    )}
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span className="flex-1">{item.label}</span>
                    {isActive && <ChevronRight className="h-3 w-3 text-primary/50" />}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="p-4 border-t border-sidebar-border">
            <div className="bg-secondary/50 rounded-lg p-4 border border-border/30">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-2 w-2 rounded-full bg-f1-green animate-pit-pulse" />
                <span className="text-[10px] text-f1-green uppercase tracking-wider font-semibold">All Systems Go</span>
              </div>
              <p className="text-[10px] text-muted-foreground">FleetFlow v1.0 • Race-Ready</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main */}
      <main className="flex-1 overflow-auto relative z-10">
        <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-background/70 backdrop-blur-xl border-b border-border/50">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden text-foreground hover:text-primary transition-colors"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            {currentPage && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="text-muted-foreground/40">FleetFlow</span>
                <ChevronRight className="h-3 w-3 text-muted-foreground/40" />
                <span className="text-foreground font-medium">{currentPage.label}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border/30">
              <div className="h-2 w-2 rounded-full bg-f1-green animate-pit-pulse" />
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">Live</span>
            </div>
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/20 flex items-center justify-center shadow-lg shadow-primary/10">
              <span className="text-xs font-bold text-primary">FM</span>
            </div>
          </div>
        </header>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
};

export default Layout;
