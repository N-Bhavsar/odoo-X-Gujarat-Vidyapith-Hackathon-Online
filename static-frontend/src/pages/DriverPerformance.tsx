import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

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

const drivers: Driver[] = [
  { id: 1, name: "John Kumar", license: "23223", expiry: "22/36", completionRate: "92%", safetyScore: "89%", complaints: 4, status: "On Duty" },
  { id: 2, name: "Alex Singh", license: "45678", expiry: "25/38", completionRate: "95%", safetyScore: "94%", complaints: 1, status: "On Duty" },
  { id: 3, name: "Ravi Patel", license: "78901", expiry: "23/35", completionRate: "88%", safetyScore: "82%", complaints: 6, status: "Off Duty" },
  { id: 4, name: "Priya M", license: "12345", expiry: "24/37", completionRate: "96%", safetyScore: "97%", complaints: 0, status: "On Duty" },
  { id: 5, name: "Suresh R", license: "67890", expiry: "21/34", completionRate: "78%", safetyScore: "71%", complaints: 9, status: "Suspended" },
];

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
