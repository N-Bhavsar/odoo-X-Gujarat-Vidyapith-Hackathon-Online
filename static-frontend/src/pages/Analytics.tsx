import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Fuel, TrendingUp, Activity } from "lucide-react";
import { useEffect, useState } from "react";
import { analyticsService } from "@/services";

const formatCurrency = (v: number) => `₹${(v / 100000).toFixed(1)}L`;

const Analytics = () => {
  const [kpis, setKpis] = useState({ fuelCost: 0, utilizationRate: 0, revenue: 0 });
  const [summaryData, setSummaryData] = useState<any[]>([]);
  const [costliestVehicles, setCostliestVehicles] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const overview = await analyticsService.fetchOverview();
        const charts = await analyticsService.fetchCharts();
        setKpis({
          fuelCost: overview.kpis.fuelCost || 0,
          utilizationRate: overview.kpis.utilizationRate || 0,
          revenue: overview.kpis.revenue || 0,
        });
        setSummaryData(charts.summary || []);
        setCostliestVehicles(charts.costliestVehicles || []);
      } catch (err: any) {
        setError(err.message || "Failed to load analytics");
      }
    };
    load();
  }, []);

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
          <p className="text-2xl font-racing text-foreground mt-1">{formatCurrency(kpis.fuelCost)}</p>
        </div>
        <div className="kpi-card text-center">
          <TrendingUp className="h-5 w-5 text-f1-green mx-auto mb-2" />
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Fleet ROI</p>
          <p className="text-2xl font-racing text-foreground mt-1">{kpis.utilizationRate}%</p>
        </div>
        <div className="kpi-card text-center">
          <Activity className="h-5 w-5 text-f1-blue mx-auto mb-2" />
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Utilization Rate</p>
          <p className="text-2xl font-racing text-foreground mt-1">{kpis.utilizationRate}%</p>
        </div>
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="f1-card">
          <h3 className="font-racing text-sm text-foreground tracking-wider mb-4">Fuel Efficiency Trend (km/L)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={summaryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 18%)" />
              <XAxis dataKey="month" stroke="hsl(220 10% 55%)" fontSize={12} />
              <YAxis stroke="hsl(220 10% 55%)" fontSize={12} />
              <Tooltip
                contentStyle={{ backgroundColor: "hsl(220 18% 10%)", border: "1px solid hsl(220 15% 18%)", borderRadius: "8px", color: "hsl(0 0% 95%)" }}
              />
              <Line type="monotone" dataKey="fuelCost" stroke="hsl(0 85% 45%)" strokeWidth={2} dot={{ fill: "hsl(0 85% 45%)", strokeWidth: 0, r: 4 }} />
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
