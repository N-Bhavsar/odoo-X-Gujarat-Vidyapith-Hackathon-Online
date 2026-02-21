import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Expense {
  id: number;
  tripId: number;
  driver: string;
  distance: string;
  fuelExpense: string;
  miscExpense: string;
  status: string;
}

const initialExpenses: Expense[] = [
  { id: 1, tripId: 321, driver: "John", distance: "1000 km", fuelExpense: "₹19k", miscExpense: "₹3k", status: "Done" },
  { id: 2, tripId: 322, driver: "Alex", distance: "450 km", fuelExpense: "₹8k", miscExpense: "₹1k", status: "Pending" },
  { id: 3, tripId: 323, driver: "Ravi", distance: "780 km", fuelExpense: "₹14k", miscExpense: "₹2k", status: "Done" },
];

const statusClass = (s: string) => {
  switch (s) { case "Done": return "status-done"; case "Pending": return "status-on-trip"; default: return "status-pill"; }
};

const ExpenseLogging = () => {
  const [expenses, setExpenses] = useState(initialExpenses);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ tripId: "", driver: "", fuelCost: "", miscExpense: "" });

  const filtered = expenses.filter((e) => e.driver.toLowerCase().includes(search.toLowerCase()));

  const handleCreate = () => {
    setExpenses([...expenses, {
      id: expenses.length + 1,
      tripId: Number(form.tripId),
      driver: form.driver,
      distance: "N/A",
      fuelExpense: `₹${form.fuelCost}`,
      miscExpense: `₹${form.miscExpense}`,
      status: "Pending",
    }]);
    setForm({ tripId: "", driver: "", fuelCost: "", miscExpense: "" });
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-primary uppercase tracking-[0.2em] font-semibold mb-1">Finance</p>
          <h1 className="page-title">Expense & Fuel Logging</h1>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-lg shadow-primary/20">
          <Plus className="h-4 w-4 mr-2" /> Add an Expense
        </Button>
      </div>

      <div className="f1-card">
        <div className="flex gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-10 bg-secondary/50 border-border/50 text-foreground h-11" placeholder="Search expenses..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {["Trip ID", "Driver", "Distance", "Fuel Expense", "Misc. Expense", "Status"].map((h) => (
                  <th key={h} className="text-left text-xs text-muted-foreground uppercase tracking-wider py-3 px-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <tr key={e.id} className="data-table-row">
                  <td className="py-3 px-4 text-sm font-mono text-foreground">{e.tripId}</td>
                  <td className="py-3 px-4 text-sm text-foreground">{e.driver}</td>
                  <td className="py-3 px-4 text-sm text-foreground">{e.distance}</td>
                  <td className="py-3 px-4 text-sm text-foreground">{e.fuelExpense}</td>
                  <td className="py-3 px-4 text-sm text-foreground">{e.miscExpense}</td>
                  <td className="py-3 px-4"><span className={statusClass(e.status)}>{e.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle className="font-racing tracking-wider">New Expense</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {[
              { label: "Trip ID", key: "tripId", placeholder: "321" },
              { label: "Driver", key: "driver", placeholder: "John" },
              { label: "Fuel Cost", key: "fuelCost", placeholder: "19000" },
              { label: "Misc Expense", key: "miscExpense", placeholder: "3000" },
            ].map((f) => (
              <div key={f.key}>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">{f.label}</Label>
                <Input className="mt-1 bg-secondary border-border text-foreground" placeholder={f.placeholder} value={form[f.key as keyof typeof form]} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} />
              </div>
            ))}
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

export default ExpenseLogging;
