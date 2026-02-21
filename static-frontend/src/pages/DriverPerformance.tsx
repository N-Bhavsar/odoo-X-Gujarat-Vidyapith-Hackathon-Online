import { useEffect, useState } from "react";
import { Search, Plus, UserMinus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
    case "Out Of Service": return "status-retired";
    default: return "status-pill";
  }
};

const DriverPerformance = () => {
  const [search, setSearch] = useState("");
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    licenseNumber: "",
    licenseClass: "Van",
    licenseExpiryDate: "",
  });

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

  const handleCreate = async () => {
    setError(null);
    try {
      await driverService.createDriver({
        ...form,
        safetyScore: 10.0,
        status: "inactive",
      });
      setForm({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        licenseNumber: "",
        licenseClass: "Van",
        licenseExpiryDate: "",
      });
      setShowForm(false);
      loadDrivers();
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError(err.message || "Failed to create driver");
      }
    }
  };

  const handleOutofService = async (id: number) => {
    setError(null);
    try {
      await driverService.updateDriverStatus(id, "out_of_service");
      loadDrivers();
    } catch (err: any) {
      setError(err.message || "Failed to update driver status");
    }
  };

  const filtered = drivers.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.license.includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-primary uppercase tracking-[0.2em] font-semibold mb-1">Crew</p>
          <h1 className="page-title">Driver Performance & Safety</h1>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-lg shadow-primary/20">
          <Plus className="h-4 w-4 mr-2" /> New Driver
        </Button>
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
                {["Name", "License#", "Expiry", "Completion Rate", "Safety Score", "Complaints", "Status", "Actions"].map((h) => (
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
                  <td className="py-3 px-4">
                    {d.status !== "Out Of Service" && (
                      <button onClick={() => handleOutofService(d.id)} className="flex items-center text-xs text-destructive/80 hover:text-destructive transition-colors font-semibold" title="Mark Out of Service">
                        <UserMinus className="h-4 w-4 mr-1" /> Retire
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="bg-card/95 backdrop-blur-xl border-border/50 text-foreground shadow-2xl max-h-[90vh] overflow-y-auto w-[90vw] md:w-full">
          <DialogHeader>
            <DialogTitle className="font-racing tracking-wider text-foreground">New Driver Enrollment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">First Name</Label>
                <Input required className="mt-1.5 bg-secondary/50 border-border/50 text-foreground h-11" placeholder="Alex" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">Last Name</Label>
                <Input required className="mt-1.5 bg-secondary/50 border-border/50 text-foreground h-11" placeholder="Doe" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">Email</Label>
                <Input required type="email" className="mt-1.5 bg-secondary/50 border-border/50 text-foreground h-11" placeholder="alex@fleetflow.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">Phone</Label>
                <Input required className="mt-1.5 bg-secondary/50 border-border/50 text-foreground h-11" placeholder="+1 555-0100" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">License Number</Label>
                <Input required className="mt-1.5 bg-secondary/50 border-border/50 text-foreground h-11" placeholder="DL-123456" value={form.licenseNumber} onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">License Category</Label>
                <select
                  className="flex h-11 w-full rounded-md mt-1.5 bg-secondary/50 border border-border/50 text-foreground px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={form.licenseClass}
                  onChange={(e) => setForm({ ...form, licenseClass: e.target.value })}
                >
                  <option value="A">Class A</option>
                  <option value="B">Class B</option>
                  <option value="C">Class C</option>
                  <option value="D">Class D</option>
                  <option value="BE">Class BE</option>
                  <option value="CE">Class CE</option>
                  <option value="Van">Van</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">License Expiry Date</Label>
                <Input required type="date" className="mt-1.5 bg-secondary/50 border-border/50 text-foreground h-11" value={form.licenseExpiryDate} onChange={(e) => setForm({ ...form, licenseExpiryDate: e.target.value })} />
              </div>
            </div>
            {error && <p className="text-xs text-destructive mb-3">{error}</p>}
            <div className="flex gap-3 pt-3">
              <Button onClick={handleCreate} className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-lg shadow-primary/20">Enroll Driver</Button>
              <Button variant="outline" onClick={() => setShowForm(false)} className="border-border/50 text-foreground hover:bg-secondary">Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DriverPerformance;
