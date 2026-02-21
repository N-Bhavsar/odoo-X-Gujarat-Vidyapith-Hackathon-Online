import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ServiceLog {
  id: number;
  vehicle: string;
  issue: string;
  date: string;
  cost: string;
  status: string;
}

const initialLogs: ServiceLog[] = [
  { id: 321, vehicle: "TATA Ace", issue: "Engine Issue", date: "20/02", cost: "₹10k", status: "New" },
  { id: 322, vehicle: "Ashok Leyland", issue: "Brake Pad Replace", date: "18/02", cost: "₹5k", status: "In Progress" },
  { id: 323, vehicle: "Eicher Pro", issue: "Oil Change", date: "15/02", cost: "₹3k", status: "Done" },
  { id: 324, vehicle: "Mahindra Bolero", issue: "Tire Replacement", date: "12/02", cost: "₹8k", status: "New" },
];

const statusClass = (s: string) => {
  switch (s) {
    case "New": return "status-new";
    case "In Progress": return "status-on-trip";
    case "Done": return "status-done";
    default: return "status-pill";
  }
};

const MaintenanceLogs = () => {
  const [logs, setLogs] = useState(initialLogs);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ vehicle: "", issue: "", date: "" });

  const filtered = logs.filter((l) =>
    l.vehicle.toLowerCase().includes(search.toLowerCase()) ||
    l.issue.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = () => {
    setLogs([...logs, {
      id: logs.length + 321,
      vehicle: form.vehicle,
      issue: form.issue,
      date: form.date,
      cost: "TBD",
      status: "New",
    }]);
    setForm({ vehicle: "", issue: "", date: "" });
    setShowForm(false);
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
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">Vehicle Name</Label>
              <Input className="mt-1 bg-secondary border-border text-foreground" placeholder="TATA Ace" value={form.vehicle} onChange={(e) => setForm({ ...form, vehicle: e.target.value })} />
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
