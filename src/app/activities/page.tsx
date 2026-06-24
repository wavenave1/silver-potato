"use client";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Plus, X, Phone, Mail, Video, FileText, MessageSquare } from "lucide-react";

type Activity = {
  id: string; type: string; subject: string; body: string | null;
  outcome: string | null; nextStep: string | null; owner: string | null;
  accountId: string | null; createdAt: string;
};

type Account = { id: string; name: string };

const TYPE_ICONS: Record<string, React.ElementType> = {
  call: Phone, email: Mail, meeting: Video, demo: Video, note: FileText, other: MessageSquare,
};

const TYPE_COLORS: Record<string, string> = {
  call: "bg-blue-100 text-blue-600",
  email: "bg-indigo-100 text-indigo-600",
  meeting: "bg-violet-100 text-violet-600",
  demo: "bg-purple-100 text-purple-600",
  note: "bg-gray-100 text-gray-600",
  other: "bg-yellow-100 text-yellow-600",
};

const TYPE_OPTIONS = [
  { value: "call", label: "Call" },
  { value: "email", label: "Email" },
  { value: "meeting", label: "Meeting" },
  { value: "demo", label: "Demo" },
  { value: "note", label: "Note" },
  { value: "other", label: "Other" },
];

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    type: "call", subject: "", body: "", outcome: "", nextStep: "", owner: "", accountId: "",
  });

  const load = () => fetch("/api/activities").then(r => r.json()).then(setActivities);
  useEffect(() => { load(); }, []);
  useEffect(() => { fetch("/api/accounts").then(r => r.json()).then(setAccounts); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/activities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, accountId: form.accountId || null, completedAt: new Date().toISOString() }),
    });
    setForm({ type: "call", subject: "", body: "", outcome: "", nextStep: "", owner: "", accountId: "" });
    setShowForm(false);
    load();
  };

  const accountOptions = [
    { value: "", label: "— No Account —" },
    ...accounts.map(a => ({ value: a.id, label: a.name })),
  ];

  const accountMap = Object.fromEntries(accounts.map(a => [a.id, a.name]));

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Activities</h1>
          <p className="text-gray-500 mt-0.5">{activities.length} logged</p>
        </div>
        <Button onClick={() => setShowForm(true)}><Plus size={16} /> Log Activity</Button>
      </div>

      {showForm && (
        <Card className="mb-6 border-indigo-200">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Log Activity</h2>
              <button onClick={() => setShowForm(false)}><X size={18} className="text-gray-400 hover:text-gray-600" /></button>
            </div>
            <form onSubmit={submit} className="grid grid-cols-2 gap-4">
              <Select label="Type" options={TYPE_OPTIONS} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} />
              <Select label="Account" options={accountOptions} value={form.accountId} onChange={e => setForm(f => ({ ...f, accountId: e.target.value }))} />
              <div className="col-span-2">
                <Input label="Subject *" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} required />
              </div>
              <div className="col-span-2">
                <Textarea label="Notes / Body" rows={3} value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} />
              </div>
              <Input label="Outcome" placeholder="What happened?" value={form.outcome} onChange={e => setForm(f => ({ ...f, outcome: e.target.value }))} />
              <Input label="Next Step" placeholder="What's next?" value={form.nextStep} onChange={e => setForm(f => ({ ...f, nextStep: e.target.value }))} />
              <Input label="Owner" value={form.owner} onChange={e => setForm(f => ({ ...f, owner: e.target.value }))} />
              <div className="col-span-2 flex gap-3 justify-end">
                <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit">Log Activity</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {activities.length === 0 && (
          <div className="text-center py-16 text-gray-400">No activities yet. Log your first call, email, or meeting.</div>
        )}
        {activities.map(a => {
          const Icon = TYPE_ICONS[a.type] ?? MessageSquare;
          return (
            <Card key={a.id}>
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${TYPE_COLORS[a.type] ?? "bg-gray-100 text-gray-600"}`}>
                    <Icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-gray-900">{a.subject}</p>
                      {a.accountId && <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{accountMap[a.accountId] ?? a.accountId}</span>}
                    </div>
                    {a.body && <p className="text-sm text-gray-600 mt-1">{a.body}</p>}
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                      {a.outcome && <span>Outcome: <span className="text-gray-600">{a.outcome}</span></span>}
                      {a.nextStep && <span>Next: <span className="text-gray-600">{a.nextStep}</span></span>}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-gray-400">{new Date(a.createdAt).toLocaleDateString()}</p>
                    {a.owner && <p className="text-xs text-gray-500 mt-0.5">{a.owner}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
