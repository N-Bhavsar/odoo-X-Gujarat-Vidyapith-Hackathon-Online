import { useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { expenseService } from "@/services";

interface Expense {
  id: number;
  tripId: number;
  driver: string;
  distance: string;
  fuelExpense: string;
  miscExpense: string;
  status: string;
}

const statusClass = (s: string) => {
  switch (s) { case "Done": return "status-done"; case "Pending": return "status-on-trip"; default: return "status-pill"; }
};

const ExpenseLogging = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ tripId: "", driverId: "", amount: "", type: "fuel" });
  const [error, setError] = useState<string | null>(null);

  const loadExpenses = async () => {
    try {
      const response = await expenseService.listExpenses();
      const mapped = response.expenses.map((expense) => ({
        id: expense.id,
        tripId: expense.tripId || 0,
        driver: expense.driver ? `${expense.driver.firstName} ${expense.driver.lastName}` : "Driver",
        distance: "N/A",
        fuelExpense: `₹${expense.amount}`,
        miscExpense: "-",
        status: expense.status === "paid" ? "Done" : "Pending",
      }));
      setExpenses(mapped);
    } catch (err: any) {
      setError(err.message || "Failed to load expenses");
    }
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  const filtered = expenses.filter((e) => e.driver.toLowerCase().includes(search.toLowerCase()));

  const handleCreate = async () => {
    setError(null);
    try {
      await expenseService.createExpense({
        tripId: form.tripId ? Number(form.tripId) : undefined,
        driverId: form.driverId ? Number(form.driverId) : undefined,
        type: form.type,
        amount: Number(form.amount) || 0,
        date: new Date().toISOString(),
      });
      setForm({ tripId: "", driverId: "", amount: "", type: "fuel" });
      setShowForm(false);
      loadExpenses();
    } catch (err: any) {
      setError(err.message || "Failed to create expense");
    }
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
        {error && <p className="text-xs text-destructive mb-3">{error}</p>}
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
              { label: "Driver ID", key: "driverId", placeholder: "1" },
              { label: "Amount", key: "amount", placeholder: "19000" },
              { label: "Type", key: "type", placeholder: "fuel" },
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
