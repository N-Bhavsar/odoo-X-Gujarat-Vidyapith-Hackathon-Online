import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Trip {
  id: number;
  fleetType: string;
  origin: string;
  destination: string;
  status: string;
  driver: string;
  cargo: number;
}

const initialTrips: Trip[] = [
  { id: 1, fleetType: "Trailer Truck", origin: "Mumbai", destination: "Pune", status: "On Way", driver: "Alex", cargo: 450 },
  { id: 2, fleetType: "Van", origin: "Delhi", destination: "Jaipur", status: "Completed", driver: "Ravi", cargo: 300 },
  { id: 3, fleetType: "Mini Truck", origin: "Chennai", destination: "Bangalore", status: "Draft", driver: "Priya", cargo: 200 },
];

const statusClass = (s: string) => {
  switch (s) {
    case "On Way": return "status-on-trip";
    case "Completed": return "status-done";
    case "Draft": return "status-new";
    case "Cancelled": return "status-retired";
    default: return "status-pill";
  }
};

const TripDispatcher = () => {
  const [trips, setTrips] = useState(initialTrips);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ vehicle: "", cargo: "", driver: "", origin: "", destination: "", fuelCost: "" });

  const filtered = trips.filter((t) =>
    t.origin.toLowerCase().includes(search.toLowerCase()) ||
    t.destination.toLowerCase().includes(search.toLowerCase()) ||
    t.driver.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = () => {
    setTrips([...trips, {
      id: trips.length + 1,
      fleetType: form.vehicle,
      origin: form.origin,
      destination: form.destination,
      status: "Draft",
      driver: form.driver,
      cargo: Number(form.cargo),
    }]);
    setForm({ vehicle: "", cargo: "", driver: "", origin: "", destination: "", fuelCost: "" });
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-primary uppercase tracking-[0.2em] font-semibold mb-1">Dispatch</p>
          <h1 className="page-title">Trip Dispatcher</h1>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-lg shadow-primary/20">
          <Plus className="h-4 w-4 mr-2" /> New Trip
        </Button>
      </div>

      <div className="f1-card">
        <div className="flex gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-10 bg-secondary/50 border-border/50 text-foreground h-11" placeholder="Search trips..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {["Trip", "Fleet Type", "Origin", "Destination", "Driver", "Cargo (kg)", "Status"].map((h) => (
                  <th key={h} className="text-left text-xs text-muted-foreground uppercase tracking-wider py-3 px-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id} className="data-table-row">
                  <td className="py-3 px-4 text-sm font-mono text-foreground">{t.id}</td>
                  <td className="py-3 px-4 text-sm text-foreground">{t.fleetType}</td>
                  <td className="py-3 px-4 text-sm text-foreground">{t.origin}</td>
                  <td className="py-3 px-4 text-sm text-foreground">{t.destination}</td>
                  <td className="py-3 px-4 text-sm text-foreground">{t.driver}</td>
                  <td className="py-3 px-4 text-sm text-foreground">{t.cargo}</td>
                  <td className="py-3 px-4"><span className={statusClass(t.status)}>{t.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle className="font-racing tracking-wider">New Trip Form</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {[
              { label: "Select Vehicle", key: "vehicle", placeholder: "Trailer Truck" },
              { label: "Cargo Weight (Kg)", key: "cargo", placeholder: "450" },
              { label: "Select Driver", key: "driver", placeholder: "Alex Kumar" },
              { label: "Origin Address", key: "origin", placeholder: "Mumbai" },
              { label: "Destination", key: "destination", placeholder: "Pune" },
              { label: "Estimated Fuel Cost", key: "fuelCost", placeholder: "₹5000" },
            ].map((f) => (
              <div key={f.key}>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">{f.label}</Label>
                <Input
                  className="mt-1 bg-secondary border-border text-foreground"
                  placeholder={f.placeholder}
                  value={form[f.key as keyof typeof form]}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                />
              </div>
            ))}
            <Button onClick={handleCreate} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-racing tracking-wider">
              Confirm & Dispatch Trip
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TripDispatcher;
