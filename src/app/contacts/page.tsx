"use client";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { CONTACT_ROLES } from "@/lib/utils";
import { Plus, X, Mail, Phone } from "lucide-react";

type Contact = {
  id: string; accountId: string | null; firstName: string; lastName: string;
  title: string | null; email: string | null; phone: string | null;
  role: string | null; engagementLevel: string | null;
};

type Account = { id: string; name: string };

const ENGAGEMENT_COLORS: Record<string, string> = {
  hot: "bg-red-100 text-red-700",
  warm: "bg-orange-100 text-orange-700",
  cold: "bg-blue-100 text-blue-700",
};

const ROLE_COLORS: Record<string, string> = {
  economic_buyer: "bg-purple-100 text-purple-700",
  champion: "bg-green-100 text-green-700",
  technical_buyer: "bg-blue-100 text-blue-700",
  blocker: "bg-red-100 text-red-700",
  end_user: "bg-gray-100 text-gray-600",
  influencer: "bg-yellow-100 text-yellow-700",
};

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    firstName: "", lastName: "", accountId: "", title: "",
    email: "", phone: "", role: "", engagementLevel: "cold", notes: "",
  });

  const load = () => fetch("/api/contacts").then(r => r.json()).then(setContacts);
  useEffect(() => { load(); }, []);
  useEffect(() => { fetch("/api/accounts").then(r => r.json()).then(setAccounts); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, accountId: form.accountId || null }),
    });
    setForm({ firstName: "", lastName: "", accountId: "", title: "", email: "", phone: "", role: "", engagementLevel: "cold", notes: "" });
    setShowForm(false);
    load();
  };

  const accountOptions = [
    { value: "", label: "— No Account —" },
    ...accounts.map(a => ({ value: a.id, label: a.name })),
  ];

  const roleOptions = [
    { value: "", label: "— Role —" },
    ...CONTACT_ROLES,
  ];

  const engagementOptions = [
    { value: "cold", label: "Cold" },
    { value: "warm", label: "Warm" },
    { value: "hot", label: "Hot" },
  ];

  const filtered = contacts.filter(c =>
    `${c.firstName} ${c.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
    (c.email ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const accountMap = Object.fromEntries(accounts.map(a => [a.id, a.name]));

  return (
    <div className="p-8 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
          <p className="text-gray-500 mt-0.5">{contacts.length} total</p>
        </div>
        <Button onClick={() => setShowForm(true)}><Plus size={16} /> Add Contact</Button>
      </div>

      <div className="mb-4">
        <Input placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-sm" />
      </div>

      {showForm && (
        <Card className="mb-6 border-indigo-200">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">New Contact</h2>
              <button onClick={() => setShowForm(false)}><X size={18} className="text-gray-400 hover:text-gray-600" /></button>
            </div>
            <form onSubmit={submit} className="grid grid-cols-2 gap-4">
              <Input label="First Name *" value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} required />
              <Input label="Last Name *" value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} required />
              <Select label="Account" options={accountOptions} value={form.accountId} onChange={e => setForm(f => ({ ...f, accountId: e.target.value }))} />
              <Input label="Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              <Input label="Email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              <Input label="Phone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
              <Select label="Role" options={roleOptions} value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} />
              <Select label="Engagement" options={engagementOptions} value={form.engagementLevel} onChange={e => setForm(f => ({ ...f, engagementLevel: e.target.value }))} />
              <div className="col-span-2">
                <Textarea label="Notes" rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
              <div className="col-span-2 flex gap-3 justify-end">
                <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit">Save Contact</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Account</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Role</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Engagement</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Contact</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-400">No contacts yet.</td></tr>
            )}
            {filtered.map(c => (
              <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">{c.firstName} {c.lastName}</p>
                  {c.title && <p className="text-xs text-gray-400">{c.title}</p>}
                </td>
                <td className="px-4 py-3 text-gray-600">{c.accountId ? accountMap[c.accountId] ?? "—" : "—"}</td>
                <td className="px-4 py-3">
                  {c.role ? (
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${ROLE_COLORS[c.role] ?? "bg-gray-100 text-gray-600"}`}>
                      {c.role.replace(/_/g, " ")}
                    </span>
                  ) : <span className="text-gray-300">—</span>}
                </td>
                <td className="px-4 py-3">
                  {c.engagementLevel ? (
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${ENGAGEMENT_COLORS[c.engagementLevel] ?? "bg-gray-100 text-gray-700"}`}>
                      {c.engagementLevel}
                    </span>
                  ) : <span className="text-gray-300">—</span>}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {c.email && <a href={`mailto:${c.email}`} className="text-gray-400 hover:text-indigo-600"><Mail size={14} /></a>}
                    {c.phone && <a href={`tel:${c.phone}`} className="text-gray-400 hover:text-indigo-600"><Phone size={14} /></a>}
                    {!c.email && !c.phone && <span className="text-gray-300">—</span>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
