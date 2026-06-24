"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Building2, TrendingUp, DollarSign, AlertTriangle, Activity, Trophy } from "lucide-react";
import Link from "next/link";

const STAGES = ["discovery", "qualification", "demo", "proposal", "negotiation"];
const STAGE_LABELS: Record<string, string> = {
  discovery: "Discovery",
  qualification: "Qualification",
  demo: "Demo",
  proposal: "Proposal",
  negotiation: "Negotiation",
};

interface DashboardData {
  totalAccounts: number;
  customers: number;
  totalArr: number;
  pipelineArr: number;
  activeOpps: number;
  wonThisQuarter: number;
  renewalRisk: number;
  stageCounts: Record<string, { count: number; arr: number }>;
  recentActivities: Array<{ id: string; type: string; subject: string; createdAt: string; owner: string | null }>;
}

function StatCard({ label, value, icon: Icon, color, href }: {
  label: string; value: string; icon: React.ElementType; color: string; href?: string;
}) {
  const inner = (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="pt-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">{label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          </div>
          <div className={`p-2.5 rounded-lg ${color}`}>
            <Icon size={18} className="text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetch("/api/dashboard").then(r => r.json()).then(setData);
  }, []);

  if (!data) return (
    <div className="p-8">
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-48" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-28 bg-gray-200 rounded-xl" />)}
        </div>
      </div>
    </div>
  );

  const maxArr = Math.max(...STAGES.map(s => data.stageCounts[s]?.arr ?? 0), 1);

  return (
    <div className="p-4 md:p-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Sales Dashboard</h1>
        <p className="text-gray-500 mt-1">Your pipeline at a glance</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
        <StatCard label="Total ARR" value={formatCurrency(data.totalArr)} icon={DollarSign} color="bg-emerald-500" href="/accounts" />
        <StatCard label="Weighted Pipeline" value={formatCurrency(data.pipelineArr)} icon={TrendingUp} color="bg-indigo-500" href="/opportunities" />
        <StatCard label="Active Opportunities" value={String(data.activeOpps)} icon={Trophy} color="bg-blue-500" href="/opportunities" />
        <StatCard label="Customers" value={String(data.customers)} icon={Building2} color="bg-violet-500" href="/accounts" />
        <StatCard label="Won This Quarter" value={String(data.wonThisQuarter)} icon={Trophy} color="bg-green-500" href="/opportunities" />
        <StatCard
          label="Renewal Risk (90d)"
          value={String(data.renewalRisk)}
          icon={AlertTriangle}
          color={data.renewalRisk > 0 ? "bg-red-500" : "bg-gray-400"}
          href="/accounts"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-gray-900">Pipeline by Stage</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {STAGES.map(stage => {
                const s = data.stageCounts[stage];
                const arr = s?.arr ?? 0;
                const count = s?.count ?? 0;
                const pct = (arr / maxArr) * 100;
                return (
                  <div key={stage}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700 font-medium">{STAGE_LABELS[stage]}</span>
                      <span className="text-gray-500">{count} deal{count !== 1 ? "s" : ""} · {formatCurrency(arr)}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Recent Activity</h2>
              <Link href="/activities" className="text-sm text-indigo-600 hover:text-indigo-700">View all</Link>
            </div>
          </CardHeader>
          <CardContent>
            {data.recentActivities.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">No activities yet. Log your first call or meeting.</p>
            ) : (
              <div className="space-y-3">
                {data.recentActivities.map(a => (
                  <div key={a.id} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <Activity size={14} className="text-gray-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{a.subject}</p>
                      <p className="text-xs text-gray-400">{a.type} · {a.owner ?? "—"} · {new Date(a.createdAt).toLocaleDateString()}</p>
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
