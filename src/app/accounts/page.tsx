"use client";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input, Select, Textarea } from "@/components/ui/input";
import { formatCurrency, formatDate, daysUntil, STAGE_COLORS } from "@/lib/utils";
import { Plus, Building2, X } from "lucide-react";
import Link from "next/link";

type Account = {
  id: string; name: string; domain: string | null; industry: string | null;
  size: string | null; arr: number | null; healthScore: number | null;
  stage: string; renewalDate: string | null; aeOwner: string | null;
  csOwner: string | null; notes: string | null;
};

const STAGE_OPTIONS = [
  { value: "prospect", label: "Prospect" },
  { value: "customer", label: "Customer" },
  { value: "churned", label: "Churned" },
];

const SIZE_OPTIONS = [
  { value: "", label: "— Size —" },
  { value: "SMB", label: "SMB (< 100)" },
  { value: "Mid-Market", label: "Mid-Market (100–1000)" },
  { value: "Enterprise", label: "Enterprise (1000+)" },
];

function HealthBar({ score }: { score: number | null }) {
  const v = score ?? 50;
  const color = v >= 70 ? "bg-green-500" : v >= 40 ? "bg-yellow-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${v}%` }} />
      </div>
      <span className="text-xs text-gray-500">{v}</span>
    </div>
  );
}

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    name: "", domain: "", industry: "", size: "", arr: "", healthScore: "50",
    stage: "prospect", renewalDate: "", aeOwner: "", csOwner: "", notes: "",
  });

  const load = () => fetch("/api/accounts").then(r => r.json()).then(setAccounts);
  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        arr: parseFloat(form.arr) || 0,
        healthScore: parseInt(form.healthScore) || 50,
      }),
    });
    setForm({ name: "", domain: "", industry: "", size: "", arr: "", healthScore: "50", stage: "prospect", renewalDate: "", aeOwner: "", csOwner: "", notes: "" });
    setShowForm(false);
    load();
  };

  const filtered = accounts.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    (a.domain ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Accounts</h1>
          <p className="text-gray-500 mt-0.5">{accounts.length} total</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus size={16} /> Add Account
        </Button>
      </div>

      <div className="mb-4">
        <Input placeholder="Search accounts..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-sm" />
      </div>

      {showForm && (
        <Card className="mb-6 border-indigo-200">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">New Account</h2>
              <button onClick={() => setShowForm(false)}><X size={18} className="text-gray-400 hover:text-gray-600" /></button>
            </div>
            <form onSubmit={submit} className="grid grid-cols-2 gap-4">
              <Input label="Company Name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              <Input label="Domain" placeholder="acme.com" value={form.domain} onChange={e => setForm(f => ({ ...f, domain: e.target.value }))} />
              <Input label="Industry" value={form.industry} onChange={e => setForm(f => ({ ...f, industry: e.target.value }))} />
              <Select label="Size" options={SIZE_OPTIONS} value={form.size} onChange={e => setForm(f => ({ ...f, size: e.target.value }))} />
              <Input label="ARR ($)" type="number" value={form.arr} onChange={e => setForm(f => ({ ...f, arr: e.target.value }))} />
              <Input label="Health Score (0–100)" type="number" min="0" max="100" value={form.healthScore} onChange={e => setForm(f => ({ ...f, healthScore: e.target.value }))} />
              <Select label="Stage" options={STAGE_OPTIONS} value={form.stage} onChange={e => setForm(f => ({ ...f, stage: e.target.value }))} />
              <Input label="Renewal Date" type="date" value={form.renewalDate} onChange={e => setForm(f => ({ ...f, renewalDate: e.target.value }))} />
              <Input label="AE Owner" value={form.aeOwner} onChange={e => setForm(f => ({ ...f, aeOwner: e.target.value }))} />
              <Input label="CS Owner" value={form.csOwner} onChange={e => setForm(f => ({ ...f, csOwner: e.target.value }))} />
              <div className="col-span-2">
                <Textarea label="Notes" rows={3} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
              <div className="col-span-2 flex gap-3 justify-end">
                <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit">Save Account</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Account</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Stage</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">ARR</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Health</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Renewal</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">AE / CS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                {search ? "No accounts match your search." : "No accounts yet. Add your first one above."}
              </td></tr>
            )}
            {filtered.map(a => {
              const days = daysUntil(a.renewalDate);
              const renewalUrgent = days !== null && days <= 90;
              return (
                <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/accounts/${a.id}`} className="hover:text-indigo-600">
                      <p className="font-medium text-gray-900">{a.name}</p>
                      <p className="text-xs text-gray-400">{a.domain ?? a.size ?? "—"}</p>
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STAGE_COLORS[a.stage] ?? "bg-gray-100 text-gray-700"}`}>
                      {a.stage}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-800">{formatCurrency(a.arr ?? 0)}</td>
                  <td className="px-4 py-3"><HealthBar score={a.healthScore} /></td>
                  <td className="px-4 py-3">
                    {a.renewalDate ? (
                      <span className={renewalUrgent ? "text-red-600 font-medium" : "text-gray-600"}>
                        {formatDate(a.renewalDate)}
                        {days !== null && <span className="text-xs ml-1">({days}d)</span>}
                      </span>
                    ) : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{a.aeOwner ?? "—"} / {a.csOwner ?? "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
