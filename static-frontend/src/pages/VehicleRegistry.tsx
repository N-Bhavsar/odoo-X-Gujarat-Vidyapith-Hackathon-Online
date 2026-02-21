import { useEffect, useState } from "react";
import { Plus, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { vehicleService } from "@/services";

interface Vehicle {
  id: number;
  plate: string;
  model: string;
  type: string;
  capacity: string;
  odometer: number;
  status: string;
}

const statusClass = (s: string) => {
  switch (s) {
    case "active":
    case "Active":
    case "Available":
      return "status-available";
    case "maintenance":
    case "Maintenance":
    case "In Shop":
      return "status-in-shop";
    case "inactive":
    case "Inactive":
      return "status-pill";
    case "retired":
    case "Retired":
      return "status-retired";
    default:
      return "status-pill";
  }
};

const VehicleRegistry = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ plate: "", model: "", type: "", capacity: "", odometer: "" });
  const [error, setError] = useState<string | null>(null);

  const loadVehicles = async () => {
    try {
      const response = await vehicleService.listVehicles();
      const mapped = response.vehicles.map((v) => ({
        id: v.id,
        plate: v.vehicleNumber,
        model: `${v.make} ${v.model}`.trim(),
        type: v.type,
        capacity: v.maxLoadCapacity ? `${v.maxLoadCapacity} kg` : "-",
        odometer: v.currentMileage || 0,
        status: v.status.charAt(0).toUpperCase() + v.status.slice(1),
      }));
      setVehicles(mapped);
    } catch (err: any) {
      setError(err.message || "Failed to load vehicles");
    }
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  const filtered = vehicles.filter(
    (v) => v.plate.toLowerCase().includes(search.toLowerCase()) || v.model.toLowerCase().includes(search.toLowerCase())
  );

  const mapVehicleType = (value: string) => {
    const normalized = value.toLowerCase();
    if (normalized.includes("bus")) return "bus";
    if (normalized.includes("van")) return "van";
    if (normalized.includes("bike") || normalized.includes("motor")) return "motorcycle";
    if (normalized.includes("suv")) return "suv";
    if (normalized.includes("sedan")) return "sedan";
    return "truck";
  };

  const parseCapacity = (value: string) => {
    const numeric = Number(value.replace(/[^0-9.]/g, ""));
    return Number.isNaN(numeric) ? undefined : numeric;
  };

  const handleCreate = async () => {
    setError(null);
    try {
      const [make, ...modelParts] = form.model.trim().split(" ");
      await vehicleService.createVehicle({
        vehicleNumber: form.plate,
        registrationNumber: form.plate,
        make: make || "Fleet",
        model: modelParts.join(" ") || form.model || "Vehicle",
        year: new Date().getFullYear(),
        type: mapVehicleType(form.type),
        fuelType: "diesel",
        status: "active",
        currentMileage: Number(form.odometer) || 0,
        maxLoadCapacity: parseCapacity(form.capacity),
      });
      setForm({ plate: "", model: "", type: "", capacity: "", odometer: "" });
      setShowForm(false);
      loadVehicles();
    } catch (err: any) {
      setError(err.message || "Failed to create vehicle");
    }
  };

  const handleDelete = async (id: number) => {
    setError(null);
    try {
      await vehicleService.deleteVehicle(id);
      setVehicles(vehicles.filter((v) => v.id !== id));
    } catch (err: any) {
      setError(err.message || "Failed to delete vehicle");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-primary uppercase tracking-[0.2em] font-semibold mb-1">Assets</p>
          <h1 className="page-title">Vehicle Registry</h1>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-lg shadow-primary/20">
          <Plus className="h-4 w-4 mr-2" /> New Vehicle
        </Button>
      </div>

      <div className="f1-card">
        {error && <p className="text-xs text-destructive mb-3">{error}</p>}
        <div className="flex gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-10 bg-secondary/50 border-border/50 text-foreground h-11" placeholder="Search vehicles..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                {["NO", "Plate", "Model", "Type", "Capacity", "Odometer", "Status", "Actions"].map((h) => (
                  <th key={h} className="text-left text-[11px] text-muted-foreground uppercase tracking-wider py-3 px-4 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((v) => (
                <tr key={v.id} className="data-table-row">
                  <td className="py-3.5 px-4 text-sm text-muted-foreground">{v.id}</td>
                  <td className="py-3.5 px-4 text-sm font-mono text-primary font-semibold">{v.plate}</td>
                  <td className="py-3.5 px-4 text-sm text-foreground font-medium">{v.model}</td>
                  <td className="py-3.5 px-4 text-sm text-muted-foreground">{v.type}</td>
                  <td className="py-3.5 px-4 text-sm text-foreground">{v.capacity}</td>
                  <td className="py-3.5 px-4 text-sm text-foreground">{v.odometer.toLocaleString()} km</td>
                  <td className="py-3.5 px-4"><span className={statusClass(v.status)}>{v.status}</span></td>
                  <td className="py-3.5 px-4">
                    <button onClick={() => handleDelete(v.id)} className="text-destructive/60 hover:text-destructive transition-colors">
                      <X className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="bg-card/95 backdrop-blur-xl border-border/50 text-foreground shadow-2xl">
          <DialogHeader>
            <DialogTitle className="font-racing tracking-wider text-foreground">New Vehicle Registration</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {[
              { label: "License Plate", key: "plate", placeholder: "MH 00 XX 0000" },
              { label: "Model", key: "model", placeholder: "Tata Ace" },
              { label: "Type", key: "type", placeholder: "Truck / Van / Bike" },
              { label: "Max Payload", key: "capacity", placeholder: "5 ton" },
              { label: "Initial Odometer", key: "odometer", placeholder: "79000" },
            ].map((f) => (
              <div key={f.key}>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">{f.label}</Label>
                <Input className="mt-1.5 bg-secondary/50 border-border/50 text-foreground h-11" placeholder={f.placeholder} value={form[f.key as keyof typeof form]} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} />
              </div>
            ))}
            <div className="flex gap-3 pt-3">
              <Button onClick={handleCreate} className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-lg shadow-primary/20">Save</Button>
              <Button variant="outline" onClick={() => setShowForm(false)} className="border-border/50 text-foreground hover:bg-secondary">Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VehicleRegistry;
