import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Fuel, TrendingUp, Activity } from "lucide-react";

const fuelData = [
  { month: "Jan", efficiency: 45 },
  { month: "Feb", efficiency: 52 },
  { month: "Mar", efficiency: 48 },
  { month: "Apr", efficiency: 70 },
  { month: "May", efficiency: 65 },
  { month: "Jun", efficiency: 80 },
  { month: "Jul", efficiency: 75 },
  { month: "Aug", efficiency: 90 },
  { month: "Sep", efficiency: 85 },
];

const costliestVehicles = [
  { name: "TRK-01", cost: 120 },
  { name: "TRK-02", cost: 95 },
  { name: "VAN-05", cost: 80 },
  { name: "TRK-07", cost: 65 },
  { name: "VAN-03", cost: 50 },
];

const summaryData = [
  { month: "Jan", revenue: 1700000, fuelCost: 600000, maintenance: 200000, netProfit: 900000 },
  { month: "Feb", revenue: 1500000, fuelCost: 550000, maintenance: 180000, netProfit: 770000 },
  { month: "Mar", revenue: 1900000, fuelCost: 700000, maintenance: 250000, netProfit: 950000 },
  { month: "Apr", revenue: 2100000, fuelCost: 650000, maintenance: 220000, netProfit: 1230000 },
];

const formatCurrency = (v: number) => `₹${(v / 100000).toFixed(1)}L`;

const Analytics = () => {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs text-primary uppercase tracking-[0.2em] font-semibold mb-1">Intelligence</p>
        <h1 className="page-title">Analytics & Financial Reports</h1>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="kpi-card text-center">
          <Fuel className="h-5 w-5 text-f1-yellow mx-auto mb-2" />
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Fuel Cost</p>
          <p className="text-2xl font-racing text-foreground mt-1">₹2.6L</p>
        </div>
        <div className="kpi-card text-center">
          <TrendingUp className="h-5 w-5 text-f1-green mx-auto mb-2" />
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Fleet ROI</p>
          <p className="text-2xl font-racing text-foreground mt-1">+18%</p>
        </div>
        <div className="kpi-card text-center">
          <Activity className="h-5 w-5 text-f1-blue mx-auto mb-2" />
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Utilization Rate</p>
          <p className="text-2xl font-racing text-foreground mt-1">82%</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="f1-card">
          <h3 className="font-racing text-sm text-foreground tracking-wider mb-4">Fuel Efficiency Trend (km/L)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={fuelData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 18%)" />
              <XAxis dataKey="month" stroke="hsl(220 10% 55%)" fontSize={12} />
              <YAxis stroke="hsl(220 10% 55%)" fontSize={12} />
              <Tooltip
                contentStyle={{ backgroundColor: "hsl(220 18% 10%)", border: "1px solid hsl(220 15% 18%)", borderRadius: "8px", color: "hsl(0 0% 95%)" }}
              />
              <Line type="monotone" dataKey="efficiency" stroke="hsl(0 85% 45%)" strokeWidth={2} dot={{ fill: "hsl(0 85% 45%)", strokeWidth: 0, r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="f1-card">
          <h3 className="font-racing text-sm text-foreground tracking-wider mb-4">Top 5 Costliest Vehicles</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={costliestVehicles}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 18%)" />
              <XAxis dataKey="name" stroke="hsl(220 10% 55%)" fontSize={12} />
              <YAxis stroke="hsl(220 10% 55%)" fontSize={12} />
              <Tooltip
                contentStyle={{ backgroundColor: "hsl(220 18% 10%)", border: "1px solid hsl(220 15% 18%)", borderRadius: "8px", color: "hsl(0 0% 95%)" }}
              />
              <Bar dataKey="cost" fill="hsl(0 85% 45%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary Table */}
      <div className="f1-card">
        <h3 className="font-racing text-sm text-foreground tracking-wider mb-4">Summary of Month</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {["Month", "Revenue", "Fuel Cost", "Maintenance", "Net Profit"].map((h) => (
                  <th key={h} className="text-left text-xs text-muted-foreground uppercase tracking-wider py-3 px-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {summaryData.map((row) => (
                <tr key={row.month} className="data-table-row">
                  <td className="py-3 px-4 text-sm text-foreground">{row.month}</td>
                  <td className="py-3 px-4 text-sm text-f1-green">{formatCurrency(row.revenue)}</td>
                  <td className="py-3 px-4 text-sm text-f1-yellow">{formatCurrency(row.fuelCost)}</td>
                  <td className="py-3 px-4 text-sm text-primary">{formatCurrency(row.maintenance)}</td>
                  <td className="py-3 px-4 text-sm font-semibold text-f1-green">{formatCurrency(row.netProfit)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
