"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { formatCurrency, formatDate, STAGE_COLORS, OPPORTUNITY_STAGES } from "@/lib/utils";
import { ArrowLeft, Pencil, Check, Trash2, Plus, X, Users } from "lucide-react";
import Link from "next/link";

type Opp = {
  id: string; name: string; accountId: string | null; type: string; stage: string;
  arr: number | null; closeDate: string | null; probability: number | null; aeOwner: string | null;
  lossReason: string | null;
  qualMetrics: string | null; qualEconomicBuyer: string | null; qualDecisionCriteria: string | null;
  qualDecisionProcess: string | null; qualIdentifiedPain: string | null; qualChampion: string | null;
  qualCompetition: string | null; qualNotes: string | null;
};

type Account = { id: string; name: string };
type Contact = { id: string; firstName: string; lastName: string; title: string | null; role: string | null };

const ROLE_COLORS: Record<string, string> = {
  economic_buyer: "bg-purple-100 text-purple-700", champion: "bg-green-100 text-green-700",
  technical_buyer: "bg-blue-100 text-blue-700", blocker: "bg-red-100 text-red-700",
  end_user: "bg-gray-100 text-gray-600", influencer: "bg-yellow-100 text-yellow-700",
};

const TYPE_OPTIONS = [
  { value: "new_logo", label: "New Logo" },
  { value: "expansion", label: "Expansion" },
  { value: "renewal", label: "Renewal" },
];

const STAGE_OPTIONS = OPPORTUNITY_STAGES.map(s => ({ value: s.value, label: s.label }));

const QUAL_FIELDS: { key: keyof Opp; label: string; hint: string }[] = [
  { key: "qualIdentifiedPain", label: "Identified Pain", hint: "What business problem are they solving?" },
  { key: "qualMetrics", label: "Success Metrics", hint: "How will they measure success / ROI?" },
  { key: "qualEconomicBuyer", label: "Economic Buyer", hint: "Who controls the budget and signs off?" },
  { key: "qualDecisionCriteria", label: "Decision Criteria", hint: "What matters most in their evaluation?" },
  { key: "qualDecisionProcess", label: "Decision Process", hint: "Steps, timeline, and who's involved in the decision?" },
  { key: "qualChampion", label: "Champion", hint: "Who is selling internally on your behalf?" },
  { key: "qualCompetition", label: "Competition", hint: "Who else are they evaluating?" },
  { key: "qualNotes", label: "Additional Notes", hint: "Other qualification notes" },
];

function qualScore(opp: Opp): number {
  const fields = QUAL_FIELDS.slice(0, 7);
  const filled = fields.filter(f => !!opp[f.key]).length;
  return Math.round((filled / fields.length) * 100);
}

export default function OpportunityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [opp, setOpp] = useState<Opp | null>(null);
  const [account, setAccount] = useState<Account | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Partial<Opp>>({});
  const [linkedContacts, setLinkedContacts] = useState<Contact[]>([]);
  const [allContacts, setAllContacts] = useState<Contact[]>([]);
  const [showLinkContact, setShowLinkContact] = useState(false);
  const [linkContactId, setLinkContactId] = useState("");

  const loadLinkedContacts = () =>
    fetch(`/api/opportunities/${id}/contacts`).then(r => r.json()).then(setLinkedContacts);

  const load = async () => {
    const oppData: Opp = await fetch(`/api/opportunities/${id}`).then(r => r.json());
    setOpp(oppData);
    setForm(oppData);
    if (oppData.accountId) {
      fetch(`/api/accounts/${oppData.accountId}`).then(r => r.json()).then(d => setAccount(d.account));
    }
  };

  useEffect(() => { load(); loadLinkedContacts(); }, [id]);
  useEffect(() => { fetch("/api/contacts").then(r => r.json()).then(setAllContacts); }, []);

  const linkContact = async () => {
    if (!linkContactId) return;
    await fetch(`/api/opportunities/${id}/contacts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contactId: linkContactId }),
    });
    setShowLinkContact(false);
    setLinkContactId("");
    loadLinkedContacts();
  };

  const unlinkContact = async (contactId: string) => {
    await fetch(`/api/opportunities/${id}/contacts`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contactId }),
    });
    loadLinkedContacts();
  };

  const save = async () => {
    await fetch(`/api/opportunities/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, arr: parseFloat(String(form.arr ?? 0)), probability: parseInt(String(form.probability ?? 10)) }),
    });
    setEditing(false);
    load();
  };

  const deleteOpp = async () => {
    if (!confirm("Delete this opportunity?")) return;
    await fetch(`/api/opportunities/${id}`, { method: "DELETE" });
    router.push("/opportunities");
  };

  if (!opp) return <div className="p-8 text-gray-400 animate-pulse">Loading...</div>;

  const score = qualScore(opp);
  const scoreColor = score >= 70 ? "text-green-600" : score >= 40 ? "text-yellow-600" : "text-red-500";

  return (
    <div className="p-4 md:p-8 max-w-6xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/opportunities" className="text-gray-400 hover:text-gray-600"><ArrowLeft size={20} /></Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{opp.name}</h1>
          {account && <Link href={`/accounts/${account.id}`} className="text-sm text-indigo-600 hover:underline">{account.name}</Link>}
        </div>
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STAGE_COLORS[opp.stage]}`}>{opp.stage.replace("_", " ")}</span>
        <div className="ml-auto flex gap-2">
          {editing ? (
            <>
              <Button variant="secondary" size="sm" onClick={() => { setEditing(false); setForm(opp); }}>Cancel</Button>
              <Button size="sm" onClick={save}><Check size={14} /> Save</Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => setEditing(true)}><Pencil size={14} /> Edit</Button>
              <Button variant="danger" size="sm" onClick={deleteOpp}><Trash2 size={14} /></Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6">
        <Card className="md:col-span-2">
          <CardHeader><h2 className="font-semibold text-gray-800">Deal Details</h2></CardHeader>
          <CardContent>
            {editing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Name" value={form.name ?? ""} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                <Select label="Type" options={TYPE_OPTIONS} value={form.type ?? "new_logo"} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} />
                <Select label="Stage" options={STAGE_OPTIONS} value={form.stage ?? "discovery"} onChange={e => {
                  const s = OPPORTUNITY_STAGES.find(st => st.value === e.target.value);
                  setForm(f => ({ ...f, stage: e.target.value, probability: s?.probability ?? f.probability }));
                }} />
                <Input label="ARR ($)" type="number" value={form.arr ?? ""} onChange={e => setForm(f => ({ ...f, arr: parseFloat(e.target.value) }))} />
                <Input label="Close Date" type="date" value={form.closeDate ?? ""} onChange={e => setForm(f => ({ ...f, closeDate: e.target.value }))} />
                <Input label="Probability (%)" type="number" min="0" max="100" value={form.probability ?? ""} onChange={e => setForm(f => ({ ...f, probability: parseInt(e.target.value) }))} />
                <Input label="AE Owner" value={form.aeOwner ?? ""} onChange={e => setForm(f => ({ ...f, aeOwner: e.target.value }))} />
              </div>
            ) : (
              <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                {[
                  ["Type", opp.type.replace("_", " ")],
                  ["ARR", formatCurrency(opp.arr ?? 0)],
                  ["Close Date", formatDate(opp.closeDate)],
                  ["Probability", `${opp.probability ?? 0}%`],
                  ["AE Owner", opp.aeOwner],
                  ["Loss Reason", opp.lossReason],
                ].map(([label, value]) => value ? (
                  <div key={label as string}>
                    <dt className="text-gray-400 text-xs font-medium uppercase tracking-wide">{label}</dt>
                    <dd className="text-gray-900 font-medium mt-0.5">{value}</dd>
                  </div>
                ) : null)}
              </dl>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardContent className="pt-5">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">Qualification Score</p>
              <div className="flex items-end gap-2">
                <span className={`text-4xl font-bold ${scoreColor}`}>{score}%</span>
              </div>
              <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${score >= 70 ? "bg-green-500" : score >= 40 ? "bg-yellow-500" : "bg-red-500"}`} style={{ width: `${score}%` }} />
              </div>
              <p className="text-xs text-gray-400 mt-2">{QUAL_FIELDS.slice(0, 7).filter(f => !!opp[f.key]).length}/{QUAL_FIELDS.slice(0, 7).length} fields complete</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Weighted Value</p>
              <p className="text-2xl font-bold text-indigo-600 mt-1">{formatCurrency((opp.arr ?? 0) * ((opp.probability ?? 0) / 100))}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users size={14} className="text-gray-500" />
                  <h3 className="font-semibold text-gray-800 text-sm">Stakeholders</h3>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setShowLinkContact(v => !v)}><Plus size={13} /></Button>
              </div>
            </CardHeader>
            <CardContent>
              {showLinkContact && (
                <div className="mb-3 pb-3 border-b border-gray-100 space-y-2">
                  <Select
                    options={[
                      { value: "", label: "— Select contact —" },
                      ...allContacts.filter(c => !linkedContacts.find(l => l.id === c.id))
                        .map(c => ({ value: c.id, label: `${c.firstName} ${c.lastName}` })),
                    ]}
                    value={linkContactId}
                    onChange={e => setLinkContactId(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={linkContact} disabled={!linkContactId}>Link</Button>
                    <Button size="sm" variant="ghost" onClick={() => setShowLinkContact(false)}>Cancel</Button>
                  </div>
                </div>
              )}
              {linkedContacts.length === 0 ? (
                <p className="text-xs text-gray-400">No stakeholders linked.</p>
              ) : (
                <div className="space-y-2">
                  {linkedContacts.map(c => (
                    <div key={c.id} className="flex items-center gap-2">
                      <div className="flex-1 min-w-0">
                        <Link href={`/contacts/${c.id}`} className="text-sm font-medium text-gray-800 hover:text-indigo-600">
                          {c.firstName} {c.lastName}
                        </Link>
                        {c.role && (
                          <span className={`ml-2 inline-flex items-center rounded-full px-1.5 py-0.5 text-xs font-medium ${ROLE_COLORS[c.role] ?? "bg-gray-100 text-gray-600"}`}>
                            {c.role.replace(/_/g, " ")}
                          </span>
                        )}
                        {c.title && <p className="text-xs text-gray-400">{c.title}</p>}
                      </div>
                      <button onClick={() => unlinkContact(c.id)} className="text-gray-200 hover:text-red-500">
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader><h2 className="font-semibold text-gray-800">Deal Qualification</h2></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {QUAL_FIELDS.map(({ key, label, hint }) => (
              <div key={key}>
                {editing ? (
                  <Textarea
                    label={label}
                    placeholder={hint}
                    rows={3}
                    value={(form[key] as string) ?? ""}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  />
                ) : (
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{label}</p>
                      {opp[key] ? (
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-200 flex-shrink-0" />
                      )}
                    </div>
                    {opp[key] ? (
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{opp[key] as string}</p>
                    ) : (
                      <p className="text-sm text-gray-300 italic">{hint}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
