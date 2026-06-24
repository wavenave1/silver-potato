"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input, Select, Textarea } from "@/components/ui/input";
import { formatCurrency, formatDate, daysUntil, STAGE_COLORS } from "@/lib/utils";
import { ArrowLeft, Plus, X, Pencil, Check, Trash2 } from "lucide-react";
import Link from "next/link";

type Account = {
  id: string; name: string; domain: string | null; industry: string | null;
  size: string | null; arr: number | null; healthScore: number | null;
  stage: string; renewalDate: string | null; aeOwner: string | null;
  csOwner: string | null; notes: string | null;
};

type Opp = { id: string; name: string; type: string; stage: string; arr: number | null; closeDate: string | null; probability: number | null };
type Activity = { id: string; type: string; subject: string; outcome: string | null; nextStep: string | null; createdAt: string; owner: string | null };

const STAGE_OPTIONS = [
  { value: "prospect", label: "Prospect" },
  { value: "customer", label: "Customer" },
  { value: "churned", label: "Churned" },
];

export default function AccountDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<{ account: Account; opportunities: Opp[]; activities: Activity[] } | null>(null);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Account>>({});
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [activityForm, setActivityForm] = useState({ type: "call", subject: "", body: "", outcome: "", nextStep: "", owner: "" });

  const load = () => fetch(`/api/accounts/${id}`).then(r => r.json()).then(d => {
    setData(d);
    setEditForm(d.account);
  });

  useEffect(() => { load(); }, [id]);

  const save = async () => {
    await fetch(`/api/accounts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...editForm, arr: parseFloat(String(editForm.arr ?? 0)), healthScore: parseInt(String(editForm.healthScore ?? 50)) }),
    });
    setEditing(false);
    load();
  };

  const deleteAccount = async () => {
    if (!confirm("Delete this account? This cannot be undone.")) return;
    await fetch(`/api/accounts/${id}`, { method: "DELETE" });
    router.push("/accounts");
  };

  const logActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/activities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...activityForm, accountId: id, completedAt: new Date().toISOString() }),
    });
    setActivityForm({ type: "call", subject: "", body: "", outcome: "", nextStep: "", owner: "" });
    setShowActivityForm(false);
    load();
  };

  if (!data) return <div className="p-8 text-gray-400 animate-pulse">Loading...</div>;

  const { account, opportunities, activities } = data;
  const days = daysUntil(account.renewalDate);

  return (
    <div className="p-4 md:p-8 max-w-6xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/accounts" className="text-gray-400 hover:text-gray-600"><ArrowLeft size={20} /></Link>
        <h1 className="text-2xl font-bold text-gray-900">{account.name}</h1>
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STAGE_COLORS[account.stage]}`}>{account.stage}</span>
        <div className="ml-auto flex gap-2">
          {editing ? (
            <>
              <Button variant="secondary" size="sm" onClick={() => { setEditing(false); setEditForm(account); }}>Cancel</Button>
              <Button size="sm" onClick={save}><Check size={14} /> Save</Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => setEditing(true)}><Pencil size={14} /> Edit</Button>
              <Button variant="danger" size="sm" onClick={deleteAccount}><Trash2 size={14} /></Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6">
        <Card className="md:col-span-2">
          <CardHeader><h2 className="font-semibold text-gray-800">Account Details</h2></CardHeader>
          <CardContent>
            {editing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Name" value={editForm.name ?? ""} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
                <Input label="Domain" value={editForm.domain ?? ""} onChange={e => setEditForm(f => ({ ...f, domain: e.target.value }))} />
                <Input label="Industry" value={editForm.industry ?? ""} onChange={e => setEditForm(f => ({ ...f, industry: e.target.value }))} />
                <Input label="Size" value={editForm.size ?? ""} onChange={e => setEditForm(f => ({ ...f, size: e.target.value }))} />
                <Input label="ARR ($)" type="number" value={editForm.arr ?? ""} onChange={e => setEditForm(f => ({ ...f, arr: parseFloat(e.target.value) }))} />
                <Input label="Health Score (0–100)" type="number" min="0" max="100" value={editForm.healthScore ?? ""} onChange={e => setEditForm(f => ({ ...f, healthScore: parseInt(e.target.value) }))} />
                <Select label="Stage" options={STAGE_OPTIONS} value={editForm.stage ?? "prospect"} onChange={e => setEditForm(f => ({ ...f, stage: e.target.value }))} />
                <Input label="Renewal Date" type="date" value={editForm.renewalDate ?? ""} onChange={e => setEditForm(f => ({ ...f, renewalDate: e.target.value }))} />
                <Input label="AE Owner" value={editForm.aeOwner ?? ""} onChange={e => setEditForm(f => ({ ...f, aeOwner: e.target.value }))} />
                <Input label="CS Owner" value={editForm.csOwner ?? ""} onChange={e => setEditForm(f => ({ ...f, csOwner: e.target.value }))} />
                <div className="col-span-2">
                  <Textarea label="Notes" rows={3} value={editForm.notes ?? ""} onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))} />
                </div>
              </div>
            ) : (
              <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                {[
                  ["Domain", account.domain],
                  ["Industry", account.industry],
                  ["Size", account.size],
                  ["ARR", formatCurrency(account.arr ?? 0)],
                  ["Health Score", String(account.healthScore ?? "—")],
                  ["AE Owner", account.aeOwner],
                  ["CS Owner", account.csOwner],
                  ["Renewal Date", account.renewalDate ? `${formatDate(account.renewalDate)} ${days !== null ? `(${days}d)` : ""}` : null],
                ].map(([label, value]) => (
                  <div key={label as string}>
                    <dt className="text-gray-400 text-xs font-medium uppercase tracking-wide">{label}</dt>
                    <dd className="text-gray-900 font-medium mt-0.5">{value ?? "—"}</dd>
                  </div>
                ))}
                {account.notes && (
                  <div className="col-span-2">
                    <dt className="text-gray-400 text-xs font-medium uppercase tracking-wide">Notes</dt>
                    <dd className="text-gray-700 mt-0.5 whitespace-pre-wrap">{account.notes}</dd>
                  </div>
                )}
              </dl>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Open Opportunities</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {opportunities.filter(o => o.stage !== "closed_won" && o.stage !== "closed_lost").length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Pipeline ARR</p>
              <p className="text-3xl font-bold text-indigo-600 mt-1">
                {formatCurrency(opportunities.filter(o => o.stage !== "closed_won" && o.stage !== "closed_lost").reduce((s, o) => s + (o.arr ?? 0), 0))}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Activities Logged</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{activities.length}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-800">Opportunities</h2>
              <Link href={`/opportunities`} className="text-sm text-indigo-600 hover:text-indigo-700">View all</Link>
            </div>
          </CardHeader>
          <CardContent>
            {opportunities.length === 0 ? (
              <p className="text-sm text-gray-400 py-2">No opportunities. <Link href="/opportunities" className="text-indigo-600">Create one</Link></p>
            ) : (
              <div className="space-y-2">
                {opportunities.map(o => (
                  <div key={o.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{o.name}</p>
                      <p className="text-xs text-gray-400">{o.type.replace("_", " ")} · {formatDate(o.closeDate)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-800">{formatCurrency(o.arr ?? 0)}</p>
                      <span className={`text-xs rounded-full px-2 py-0.5 ${STAGE_COLORS[o.stage]}`}>{o.stage.replace("_", " ")}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-800">Activity Log</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowActivityForm(v => !v)}>
                <Plus size={14} /> Log
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {showActivityForm && (
              <form onSubmit={logActivity} className="mb-4 space-y-3 pb-4 border-b border-gray-100">
                <Select options={[
                  { value: "call", label: "Call" }, { value: "email", label: "Email" },
                  { value: "meeting", label: "Meeting" }, { value: "demo", label: "Demo" },
                  { value: "note", label: "Note" },
                ]} value={activityForm.type} onChange={e => setActivityForm(f => ({ ...f, type: e.target.value }))} />
                <Input placeholder="Subject *" value={activityForm.subject} onChange={e => setActivityForm(f => ({ ...f, subject: e.target.value }))} required />
                <Input placeholder="Outcome" value={activityForm.outcome} onChange={e => setActivityForm(f => ({ ...f, outcome: e.target.value }))} />
                <Input placeholder="Next Step" value={activityForm.nextStep} onChange={e => setActivityForm(f => ({ ...f, nextStep: e.target.value }))} />
                <Input placeholder="Owner" value={activityForm.owner} onChange={e => setActivityForm(f => ({ ...f, owner: e.target.value }))} />
                <div className="flex gap-2">
                  <Button type="submit" size="sm">Log</Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setShowActivityForm(false)}>Cancel</Button>
                </div>
              </form>
            )}
            {activities.length === 0 ? (
              <p className="text-sm text-gray-400 py-2">No activities yet.</p>
            ) : (
              <div className="space-y-3">
                {activities.slice(0, 8).map(a => (
                  <div key={a.id} className="flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-800">{a.subject}</p>
                      <p className="text-xs text-gray-400">{a.type} · {a.owner ?? "—"} · {new Date(a.createdAt).toLocaleDateString()}</p>
                      {a.nextStep && <p className="text-xs text-indigo-600 mt-0.5">Next: {a.nextStep}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
