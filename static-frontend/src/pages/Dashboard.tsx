import { Car, AlertTriangle, Activity, Package, TrendingUp, Fuel, ArrowUpRight } from "lucide-react";

const kpis = [
  { label: "Active Fleet", value: "24", icon: Car, change: "+3", color: "text-f1-green", bgColor: "bg-f1-green/10" },
  { label: "In Maintenance", value: "5", icon: AlertTriangle, change: "-1", color: "text-f1-yellow", bgColor: "bg-f1-yellow/10" },
  { label: "Utilization Rate", value: "82%", icon: Activity, change: "+5%", color: "text-f1-blue", bgColor: "bg-f1-blue/10" },
  { label: "Pending Cargo", value: "12", icon: Package, change: "+2", color: "text-primary", bgColor: "bg-primary/10" },
  { label: "Revenue (MTD)", value: "₹17L", icon: TrendingUp, change: "+8%", color: "text-f1-green", bgColor: "bg-f1-green/10" },
  { label: "Fuel Cost (MTD)", value: "₹6L", icon: Fuel, change: "-3%", color: "text-f1-yellow", bgColor: "bg-f1-yellow/10" },
];

const recentTrips = [
  { id: "T-001", vehicle: "Van-05", driver: "Alex Kumar", origin: "Mumbai", dest: "Pune", status: "On Trip" },
  { id: "T-002", vehicle: "Truck-12", driver: "Ravi Singh", origin: "Delhi", dest: "Jaipur", status: "Completed" },
  { id: "T-003", vehicle: "Bike-03", driver: "Priya Patel", origin: "Bangalore", dest: "Mysore", status: "Draft" },
  { id: "T-004", vehicle: "Van-08", driver: "Suresh M", origin: "Chennai", dest: "Hyderabad", status: "Dispatched" },
  { id: "T-005", vehicle: "Truck-03", driver: "Mohan R", origin: "Kolkata", dest: "Patna", status: "On Trip" },
];

const statusClass = (s: string) => {
  switch (s) {
    case "On Trip": return "status-on-trip";
    case "Completed": return "status-done";
    case "Draft": return "status-new";
    case "Dispatched": return "status-on-trip";
    default: return "status-pill";
  }
};

const Dashboard = () => {
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
          <span className="text-xs text-primary font-semibold cursor-pointer hover:underline">View All →</span>
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
