import { useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { maintenanceService } from "@/services";

interface ServiceLog {
  id: number;
  vehicle: string;
  issue: string;
  date: string;
  cost: string;
  status: string;
}

const statusClass = (s: string) => {
  switch (s) {
    case "New": return "status-new";
    case "In Progress": return "status-on-trip";
    case "Done": return "status-done";
    default: return "status-pill";
  }
};

const MaintenanceLogs = () => {
  const [logs, setLogs] = useState<ServiceLog[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ vehicleId: "", issue: "", date: "" });
  const [error, setError] = useState<string | null>(null);

  const loadLogs = async () => {
    try {
      const response = await maintenanceService.listMaintenance();
      const mapped = response.logs.map((log) => ({
        id: log.id,
        vehicle: log.vehicle?.vehicleNumber || `Vehicle-${log.id}`,
        issue: log.description,
        date: new Date(log.serviceDate).toLocaleDateString(),
        cost: log.cost ? `₹${log.cost}` : "TBD",
        status: log.status === "in_progress" ? "In Progress" : log.status === "done" ? "Done" : "New",
      }));
      setLogs(mapped);
    } catch (err: any) {
      setError(err.message || "Failed to load logs");
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const filtered = logs.filter((l) =>
    l.vehicle.toLowerCase().includes(search.toLowerCase()) ||
    l.issue.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async () => {
    setError(null);
    try {
      await maintenanceService.createMaintenance({
        vehicleId: Number(form.vehicleId),
        type: "service",
        description: form.issue,
        serviceDate: form.date || new Date().toISOString(),
      });
      setForm({ vehicleId: "", issue: "", date: "" });
      setShowForm(false);
      loadLogs();
    } catch (err: any) {
      setError(err.message || "Failed to create log");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-primary uppercase tracking-[0.2em] font-semibold mb-1">Service</p>
          <h1 className="page-title">Maintenance & Service Logs</h1>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-lg shadow-primary/20">
          <Plus className="h-4 w-4 mr-2" /> Create New Service
        </Button>
      </div>

      <div className="f1-card">
        {error && <p className="text-xs text-destructive mb-3">{error}</p>}
        <div className="flex gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-10 bg-secondary/50 border-border/50 text-foreground h-11" placeholder="Search logs..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {["Log ID", "Vehicle", "Issue/Service", "Date", "Cost", "Status"].map((h) => (
                  <th key={h} className="text-left text-xs text-muted-foreground uppercase tracking-wider py-3 px-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((l) => (
                <tr key={l.id} className="data-table-row">
                  <td className="py-3 px-4 text-sm font-mono text-foreground">{l.id}</td>
                  <td className="py-3 px-4 text-sm text-foreground">{l.vehicle}</td>
                  <td className="py-3 px-4 text-sm text-foreground">{l.issue}</td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">{l.date}</td>
                  <td className="py-3 px-4 text-sm text-foreground">{l.cost}</td>
                  <td className="py-3 px-4"><span className={statusClass(l.status)}>{l.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle className="font-racing tracking-wider">New Service</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">Vehicle ID</Label>
              <Input className="mt-1 bg-secondary border-border text-foreground" placeholder="1" value={form.vehicleId} onChange={(e) => setForm({ ...form, vehicleId: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">Issue/Service</Label>
              <Input className="mt-1 bg-secondary border-border text-foreground" placeholder="Engine Issue" value={form.issue} onChange={(e) => setForm({ ...form, issue: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">Date</Label>
              <Input className="mt-1 bg-secondary border-border text-foreground" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div className="flex gap-3 pt-2">
              <Button onClick={handleCreate} className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">Create</Button>
              <Button variant="outline" onClick={() => setShowForm(false)} className="border-border text-foreground">Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MaintenanceLogs;
