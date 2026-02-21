import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { driverService } from "@/services";

interface Driver {
  id: number;
  name: string;
  license: string;
  expiry: string;
  completionRate: string;
  safetyScore: string;
  complaints: number;
  status: string;
}

const statusClass = (s: string) => {
  switch (s) {
    case "On Duty": return "status-available";
    case "Off Duty": return "status-in-shop";
    case "Suspended": return "status-retired";
    default: return "status-pill";
  }
};

const DriverPerformance = () => {
  const [search, setSearch] = useState("");
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadDrivers = async () => {
    try {
      const response = await driverService.listDrivers();
      const mapped = response.drivers.map((driver) => {
        const completionRate = driver.totalTrips
          ? Math.round((driver.completedTrips / driver.totalTrips) * 100)
          : 0;

        const statusLabel = driver.status
          .split("_")
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join(" ");

        return {
          id: driver.id,
          name: `${driver.firstName} ${driver.lastName}`,
          license: driver.licenseNumber,
          expiry: new Date(driver.licenseExpiryDate).toLocaleDateString(),
          completionRate: `${completionRate}%`,
          safetyScore: `${Math.round(driver.safetyScore * 10)}%`,
          complaints: driver.cancelledTrips,
          status: statusLabel,
        };
      });
      setDrivers(mapped);
    } catch (err: any) {
      setError(err.message || "Failed to load drivers");
    }
  };

  useEffect(() => {
    loadDrivers();
  }, []);

  const filtered = drivers.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.license.includes(search)
  );

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs text-primary uppercase tracking-[0.2em] font-semibold mb-1">Crew</p>
        <h1 className="page-title">Driver Performance & Safety</h1>
      </div>

      <div className="f1-card">
        {error && <p className="text-xs text-destructive mb-3">{error}</p>}
        <div className="flex gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-10 bg-secondary/50 border-border/50 text-foreground h-11" placeholder="Search drivers..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {["Name", "License#", "Expiry", "Completion Rate", "Safety Score", "Complaints", "Status"].map((h) => (
                  <th key={h} className="text-left text-xs text-muted-foreground uppercase tracking-wider py-3 px-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <tr key={d.id} className="data-table-row">
                  <td className="py-3 px-4 text-sm text-foreground font-medium">{d.name}</td>
                  <td className="py-3 px-4 text-sm font-mono text-foreground">{d.license}</td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">{d.expiry}</td>
                  <td className="py-3 px-4 text-sm text-foreground">{d.completionRate}</td>
                  <td className="py-3 px-4">
                    <span className={`text-sm font-semibold ${Number(d.safetyScore.replace('%', '')) >= 85 ? 'text-f1-green' : Number(d.safetyScore.replace('%', '')) >= 75 ? 'text-f1-yellow' : 'text-destructive'}`}>
                      {d.safetyScore}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-foreground">{d.complaints}</td>
                  <td className="py-3 px-4"><span className={statusClass(d.status)}>{d.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DriverPerformance;
