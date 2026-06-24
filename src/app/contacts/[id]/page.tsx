"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { formatCurrency, formatDate, STAGE_COLORS, CONTACT_ROLES } from "@/lib/utils";
import { ArrowLeft, Pencil, Check, Trash2, Mail, Phone, ExternalLink, Plus, X } from "lucide-react";
import Link from "next/link";

type Contact = {
  id: string; accountId: string | null; firstName: string; lastName: string;
  title: string | null; email: string | null; phone: string | null;
  role: string | null; engagementLevel: string | null; linkedinUrl: string | null; notes: string | null;
};

type Opp = { id: string; name: string; stage: string; arr: number | null; type: string; closeDate: string | null };
type Account = { id: string; name: string };

const ROLE_OPTIONS = [{ value: "", label: "— Role —" }, ...CONTACT_ROLES];
const ENGAGEMENT_OPTIONS = [
  { value: "cold", label: "Cold" },
  { value: "warm", label: "Warm" },
  { value: "hot", label: "Hot" },
];
const ENGAGEMENT_COLORS: Record<string, string> = {
  hot: "bg-red-100 text-red-700", warm: "bg-orange-100 text-orange-700", cold: "bg-blue-100 text-blue-700",
};
const ROLE_COLORS: Record<string, string> = {
  economic_buyer: "bg-purple-100 text-purple-700", champion: "bg-green-100 text-green-700",
  technical_buyer: "bg-blue-100 text-blue-700", blocker: "bg-red-100 text-red-700",
  end_user: "bg-gray-100 text-gray-600", influencer: "bg-yellow-100 text-yellow-700",
};

export default function ContactDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [contact, setContact] = useState<Contact | null>(null);
  const [account, setAccount] = useState<Account | null>(null);
  const [linkedOpps, setLinkedOpps] = useState<Opp[]>([]);
  const [allOpps, setAllOpps] = useState<Opp[]>([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Partial<Contact>>({});
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [linkOppId, setLinkOppId] = useState("");

  const loadContact = async () => {
    const c: Contact = await fetch(`/api/contacts/${id}`).then(r => r.json());
    setContact(c);
    setForm(c);
    if (c.accountId) {
      fetch(`/api/accounts/${c.accountId}`).then(r => r.json()).then(d => setAccount(d.account));
    }
  };

  const loadLinkedOpps = () =>
    fetch(`/api/contacts/${id}/opportunities`).then(r => r.json()).then(setLinkedOpps);

  useEffect(() => { loadContact(); loadLinkedOpps(); }, [id]);
  useEffect(() => { fetch("/api/opportunities").then(r => r.json()).then(setAllOpps); }, []);

  const save = async () => {
    await fetch(`/api/contacts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setEditing(false);
    loadContact();
  };

  const deleteContact = async () => {
    if (!confirm("Delete this contact?")) return;
    await fetch(`/api/contacts/${id}`, { method: "DELETE" });
    router.push("/contacts");
  };

  const linkOpp = async () => {
    if (!linkOppId) return;
    await fetch(`/api/opportunities/${linkOppId}/contacts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contactId: id }),
    });
    setShowLinkForm(false);
    setLinkOppId("");
    loadLinkedOpps();
  };

  const unlinkOpp = async (oppId: string) => {
    await fetch(`/api/opportunities/${oppId}/contacts`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contactId: id }),
    });
    loadLinkedOpps();
  };

  if (!contact) return <div className="p-8 text-gray-400 animate-pulse">Loading...</div>;

  const linkedOppIds = new Set(linkedOpps.map(o => o.id));
  const unlinkableOpps = allOpps.filter(o => !linkedOppIds.has(o.id));
  const unlinkableOptions = [
    { value: "", label: "— Select opportunity —" },
    ...unlinkableOpps.map(o => ({ value: o.id, label: o.name })),
  ];

  return (
    <div className="p-4 md:p-8 max-w-5xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/contacts" className="text-gray-400 hover:text-gray-600"><ArrowLeft size={20} /></Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{contact.firstName} {contact.lastName}</h1>
          {contact.title && <p className="text-gray-500 text-sm">{contact.title}</p>}
        </div>
        {contact.role && (
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${ROLE_COLORS[contact.role] ?? "bg-gray-100 text-gray-600"}`}>
            {contact.role.replace(/_/g, " ")}
          </span>
        )}
        {contact.engagementLevel && (
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${ENGAGEMENT_COLORS[contact.engagementLevel] ?? ""}`}>
            {contact.engagementLevel}
          </span>
        )}
        <div className="ml-auto flex gap-2">
          {editing ? (
            <>
              <Button variant="secondary" size="sm" onClick={() => { setEditing(false); setForm(contact); }}>Cancel</Button>
              <Button size="sm" onClick={save}><Check size={14} /> Save</Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => setEditing(true)}><Pencil size={14} /> Edit</Button>
              <Button variant="danger" size="sm" onClick={deleteContact}><Trash2 size={14} /></Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <Card className="md:col-span-2">
          <CardHeader><h2 className="font-semibold text-gray-800">Contact Details</h2></CardHeader>
          <CardContent>
            {editing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="First Name" value={form.firstName ?? ""} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} />
                <Input label="Last Name" value={form.lastName ?? ""} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} />
                <Input label="Title" value={form.title ?? ""} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                <Input label="Email" type="email" value={form.email ?? ""} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                <Input label="Phone" value={form.phone ?? ""} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                <Input label="LinkedIn URL" value={form.linkedinUrl ?? ""} onChange={e => setForm(f => ({ ...f, linkedinUrl: e.target.value }))} />
                <Select label="Role" options={ROLE_OPTIONS} value={form.role ?? ""} onChange={e => setForm(f => ({ ...f, role: e.target.value || null }))} />
                <Select label="Engagement" options={ENGAGEMENT_OPTIONS} value={form.engagementLevel ?? "cold"} onChange={e => setForm(f => ({ ...f, engagementLevel: e.target.value }))} />
                <div className="col-span-2">
                  <Textarea label="Notes" rows={3} value={form.notes ?? ""} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                  <div>
                    <dt className="text-gray-400 text-xs font-medium uppercase tracking-wide">Account</dt>
                    <dd className="text-gray-900 font-medium mt-0.5">
                      {account ? <Link href={`/accounts/${account.id}`} className="text-indigo-600 hover:underline">{account.name}</Link> : "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-400 text-xs font-medium uppercase tracking-wide">Title</dt>
                    <dd className="text-gray-900 font-medium mt-0.5">{contact.title ?? "—"}</dd>
                  </div>
                </dl>

                <div className="flex items-center gap-4 pt-2 border-t border-gray-50">
                  {contact.email && (
                    <a href={`mailto:${contact.email}`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-indigo-600 transition-colors">
                      <Mail size={15} /> {contact.email}
                    </a>
                  )}
                  {contact.phone && (
                    <a href={`tel:${contact.phone}`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-indigo-600 transition-colors">
                      <Phone size={15} /> {contact.phone}
                    </a>
                  )}
                  {contact.linkedinUrl && (
                    <a href={contact.linkedinUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-gray-600 hover:text-indigo-600 transition-colors">
                      <ExternalLink size={15} /> LinkedIn
                    </a>
                  )}
                </div>

                {contact.notes && (
                  <div className="pt-2 border-t border-gray-50">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400 mb-1">Notes</p>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{contact.notes}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <div>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-gray-800">Linked Opportunities</h2>
                <Button variant="ghost" size="sm" onClick={() => setShowLinkForm(v => !v)}>
                  <Plus size={14} />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {showLinkForm && (
                <div className="mb-4 pb-4 border-b border-gray-100 space-y-2">
                  <Select
                    options={unlinkableOptions}
                    value={linkOppId}
                    onChange={e => setLinkOppId(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={linkOpp} disabled={!linkOppId}>Link</Button>
                    <Button size="sm" variant="ghost" onClick={() => setShowLinkForm(false)}>Cancel</Button>
                  </div>
                </div>
              )}

              {linkedOpps.length === 0 ? (
                <p className="text-sm text-gray-400 py-2">No linked opportunities yet.</p>
              ) : (
                <div className="space-y-3">
                  {linkedOpps.map(o => (
                    <div key={o.id} className="flex items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <Link href={`/opportunities/${o.id}`} className="text-sm font-medium text-gray-800 hover:text-indigo-600 block truncate">
                          {o.name}
                        </Link>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-xs font-medium ${STAGE_COLORS[o.stage]}`}>
                            {o.stage.replace("_", " ")}
                          </span>
                          <span className="text-xs text-gray-400">{formatCurrency(o.arr ?? 0)}</span>
                        </div>
                      </div>
                      <button onClick={() => unlinkOpp(o.id)} className="text-gray-300 hover:text-red-500 flex-shrink-0 mt-0.5">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
