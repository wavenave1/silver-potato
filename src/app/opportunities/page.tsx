"use client";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { formatCurrency, formatDate, STAGE_COLORS, OPPORTUNITY_STAGES } from "@/lib/utils";
import { Plus, X, ChevronRight } from "lucide-react";
import Link from "next/link";

type Opp = {
  id: string; name: string; accountId: string | null; type: string; stage: string;
  arr: number | null; closeDate: string | null; probability: number | null; aeOwner: string | null;
};

type Account = { id: string; name: string };

const TYPE_OPTIONS = [
  { value: "new_logo", label: "New Logo" },
  { value: "expansion", label: "Expansion" },
  { value: "renewal", label: "Renewal" },
];

const TYPE_COLORS: Record<string, string> = {
  new_logo: "bg-blue-100 text-blue-700",
  expansion: "bg-violet-100 text-violet-700",
  renewal: "bg-amber-100 text-amber-700",
};

export default function OpportunitiesPage() {
  const [opps, setOpps] = useState<Opp[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<"all" | "active">("active");
  const [form, setForm] = useState({
    name: "", accountId: "", type: "new_logo", stage: "discovery",
    arr: "", closeDate: "", probability: "10", aeOwner: "",
  });

  const loadOpps = () => fetch(`/api/opportunities${filter === "active" ? "?active=true" : ""}`).then(r => r.json()).then(setOpps);
  useEffect(() => { loadOpps(); }, [filter]);
  useEffect(() => { fetch("/api/accounts").then(r => r.json()).then(setAccounts); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/opportunities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        arr: parseFloat(form.arr) || 0,
        probability: parseInt(form.probability) || 10,
        accountId: form.accountId || null,
      }),
    });
    setForm({ name: "", accountId: "", type: "new_logo", stage: "discovery", arr: "", closeDate: "", probability: "10", aeOwner: "" });
    setShowForm(false);
    loadOpps();
  };

  const totalArr = opps.filter(o => o.stage !== "closed_won" && o.stage !== "closed_lost")
    .reduce((s, o) => s + (o.arr ?? 0), 0);
  const weightedArr = opps.filter(o => o.stage !== "closed_won" && o.stage !== "closed_lost")
    .reduce((s, o) => s + (o.arr ?? 0) * ((o.probability ?? 0) / 100), 0);

  const accountOptions = [
    { value: "", label: "— No Account —" },
    ...accounts.map(a => ({ value: a.id, label: a.name })),
  ];

  const stageOptions = OPPORTUNITY_STAGES.map(s => ({ value: s.value, label: s.label }));

  return (
    <div className="p-4 md:p-8 max-w-7xl">
      <div className="flex flex-wrap items-start md:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Opportunities</h1>
          <p className="text-gray-500 mt-0.5">{opps.length} deals · {formatCurrency(totalArr)} pipeline · {formatCurrency(weightedArr)} weighted</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            {(["active", "all"] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${filter === f ? "bg-indigo-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
              >
                {f === "active" ? "Active" : "All"}
              </button>
            ))}
          </div>
          <Button onClick={() => setShowForm(true)}><Plus size={16} /> New Opportunity</Button>
        </div>
      </div>

      {showForm && (
        <Card className="mb-6 border-indigo-200">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">New Opportunity</h2>
              <button onClick={() => setShowForm(false)}><X size={18} className="text-gray-400 hover:text-gray-600" /></button>
            </div>
            <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Opportunity Name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              <Select label="Account" options={accountOptions} value={form.accountId} onChange={e => setForm(f => ({ ...f, accountId: e.target.value }))} />
              <Select label="Type" options={TYPE_OPTIONS} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} />
              <Select label="Stage" options={stageOptions} value={form.stage} onChange={e => {
                const stage = OPPORTUNITY_STAGES.find(s => s.value === e.target.value);
                setForm(f => ({ ...f, stage: e.target.value, probability: String(stage?.probability ?? f.probability) }));
              }} />
              <Input label="ARR ($)" type="number" value={form.arr} onChange={e => setForm(f => ({ ...f, arr: e.target.value }))} />
              <Input label="Close Date" type="date" value={form.closeDate} onChange={e => setForm(f => ({ ...f, closeDate: e.target.value }))} />
              <Input label="Probability (%)" type="number" min="0" max="100" value={form.probability} onChange={e => setForm(f => ({ ...f, probability: e.target.value }))} />
              <Input label="AE Owner" value={form.aeOwner} onChange={e => setForm(f => ({ ...f, aeOwner: e.target.value }))} />
              <div className="col-span-2 flex gap-3 justify-end">
                <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit">Save Opportunity</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Opportunity</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Stage</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">ARR</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Prob.</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Close Date</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Owner</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {opps.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-400">No opportunities yet.</td></tr>
            )}
            {opps.map(o => (
              <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <Link href={`/opportunities/${o.id}`} className="hover:text-indigo-600 font-medium text-gray-900">{o.name}</Link>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${TYPE_COLORS[o.type] ?? "bg-gray-100 text-gray-700"}`}>
                    {o.type.replace("_", " ")}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STAGE_COLORS[o.stage] ?? "bg-gray-100 text-gray-700"}`}>
                    {o.stage.replace("_", " ")}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium text-gray-800">{formatCurrency(o.arr ?? 0)}</td>
                <td className="px-4 py-3 text-gray-600">{o.probability ?? 0}%</td>
                <td className="px-4 py-3 text-gray-600">{formatDate(o.closeDate)}</td>
                <td className="px-4 py-3 text-gray-500">{o.aeOwner ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
