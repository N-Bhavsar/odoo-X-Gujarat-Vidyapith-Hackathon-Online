import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Car, AlertTriangle, Activity, Package, TrendingUp, Fuel, ArrowUpRight } from "lucide-react";
import { analyticsService, tripService } from "@/services";

const statusClass = (s: string) => {
  switch (s) {
    case "On Trip":
    case "In Progress":
      return "status-on-trip";
    case "Completed":
      return "status-done";
    case "Draft":
    case "Scheduled":
      return "status-new";
    case "Dispatched":
      return "status-on-trip";
    default:
      return "status-pill";
  }
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [kpis, setKpis] = useState([
    { label: "Active Fleet", value: "0", icon: Car, change: "+0", color: "text-f1-green", bgColor: "bg-f1-green/10" },
    { label: "In Maintenance", value: "0", icon: AlertTriangle, change: "+0", color: "text-f1-yellow", bgColor: "bg-f1-yellow/10" },
    { label: "Utilization Rate", value: "0%", icon: Activity, change: "+0%", color: "text-f1-blue", bgColor: "bg-f1-blue/10" },
    { label: "Pending Cargo", value: "0", icon: Package, change: "+0", color: "text-primary", bgColor: "bg-primary/10" },
    { label: "Revenue (MTD)", value: "₹0", icon: TrendingUp, change: "+0%", color: "text-f1-green", bgColor: "bg-f1-green/10" },
    { label: "Fuel Cost (MTD)", value: "₹0", icon: Fuel, change: "+0%", color: "text-f1-yellow", bgColor: "bg-f1-yellow/10" },
  ]);
  const [recentTrips, setRecentTrips] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const overview = await analyticsService.fetchOverview();
        const trips = await tripService.listTrips({ limit: 5 });

        setKpis([
          { label: "Active Fleet", value: String(overview.kpis.activeFleet || 0), icon: Car, change: "+0", color: "text-f1-green", bgColor: "bg-f1-green/10" },
          { label: "In Maintenance", value: String(overview.kpis.inMaintenance || 0), icon: AlertTriangle, change: "+0", color: "text-f1-yellow", bgColor: "bg-f1-yellow/10" },
          { label: "Utilization Rate", value: `${overview.kpis.utilizationRate || 0}%`, icon: Activity, change: "+0%", color: "text-f1-blue", bgColor: "bg-f1-blue/10" },
          { label: "Pending Cargo", value: String(overview.kpis.pendingCargo || 0), icon: Package, change: "+0", color: "text-primary", bgColor: "bg-primary/10" },
          { label: "Revenue (MTD)", value: `₹${overview.kpis.revenue || 0}`, icon: TrendingUp, change: "+0%", color: "text-f1-green", bgColor: "bg-f1-green/10" },
          { label: "Fuel Cost (MTD)", value: `₹${overview.kpis.fuelCost || 0}`, icon: Fuel, change: "+0%", color: "text-f1-yellow", bgColor: "bg-f1-yellow/10" },
        ]);

        const mappedTrips = trips.trips.map((trip) => ({
          id: `T-${trip.id.toString().padStart(3, "0")}`,
          vehicle: trip.vehicle?.vehicleNumber || "Fleet",
          driver: trip.driver ? `${trip.driver.firstName} ${trip.driver.lastName}` : "Driver",
          origin: trip.origin,
          dest: trip.destination,
          status: trip.status.replace(/_/g, " "),
        }));
        setRecentTrips(mappedTrips);
      } catch {
        // Ignore for now to keep UI responsive.
      }
    };

    load();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs text-primary uppercase tracking-[0.2em] font-semibold mb-1">Overview</p>
          <h1 className="page-title">Command Center</h1>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="h-1.5 w-1.5 rounded-full bg-f1-green" />
          Last updated: Just now
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="kpi-card flex items-center gap-4">
            <div className={`p-3 rounded-xl ${kpi.bgColor} border border-border/20`}>
              <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
            </div>
            <div className="flex-1">
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">{kpi.label}</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-racing text-foreground">{kpi.value}</span>
                <span className={`text-xs font-semibold ${kpi.color} flex items-center gap-0.5`}>
                  <ArrowUpRight className="h-3 w-3" />
                  {kpi.change}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Trips */}
      <div className="f1-card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-racing text-base text-foreground tracking-wider">Recent Trips</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Latest dispatched & active trips</p>
          </div>
          <span className="text-xs text-primary font-semibold cursor-pointer hover:underline" onClick={() => navigate("/trips")}>View All →</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left text-[11px] text-muted-foreground uppercase tracking-wider py-3 px-4 font-semibold">Trip ID</th>
                <th className="text-left text-[11px] text-muted-foreground uppercase tracking-wider py-3 px-4 font-semibold">Vehicle</th>
                <th className="text-left text-[11px] text-muted-foreground uppercase tracking-wider py-3 px-4 font-semibold">Driver</th>
                <th className="text-left text-[11px] text-muted-foreground uppercase tracking-wider py-3 px-4 font-semibold">Route</th>
                <th className="text-left text-[11px] text-muted-foreground uppercase tracking-wider py-3 px-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentTrips.map((trip) => (
                <tr key={trip.id} className="data-table-row">
                  <td className="py-3.5 px-4 text-sm font-mono text-primary font-semibold">{trip.id}</td>
                  <td className="py-3.5 px-4 text-sm text-foreground">{trip.vehicle}</td>
                  <td className="py-3.5 px-4 text-sm text-foreground">{trip.driver}</td>
                  <td className="py-3.5 px-4 text-sm text-muted-foreground">
                    {trip.origin} <span className="text-primary mx-1">→</span> {trip.dest}
                  </td>
                  <td className="py-3.5 px-4"><span className={statusClass(trip.status)}>{trip.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
