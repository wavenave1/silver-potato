"use client";
import { useEffect, useRef, useState } from "react";
import { formatCurrency, STAGE_COLORS, OPPORTUNITY_STAGES } from "@/lib/utils";
import Link from "next/link";

type Opp = {
  id: string; name: string; accountId: string | null; type: string; stage: string;
  arr: number | null; closeDate: string | null; probability: number | null; aeOwner: string | null;
};

type Account = { id: string; name: string };

const TYPE_BADGE: Record<string, string> = {
  new_logo: "bg-blue-100 text-blue-600",
  expansion: "bg-violet-100 text-violet-600",
  renewal: "bg-amber-100 text-amber-600",
};

const ACTIVE_STAGES = OPPORTUNITY_STAGES.filter(s => s.value !== "closed_won" && s.value !== "closed_lost");

function daysLeft(dateStr: string | null | undefined): { label: string; urgent: boolean } | null {
  if (!dateStr) return null;
  const diff = Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
  if (diff < 0) return { label: `${Math.abs(diff)}d overdue`, urgent: true };
  if (diff === 0) return { label: "today", urgent: true };
  return { label: `${diff}d`, urgent: diff <= 14 };
}

export default function PipelinePage() {
  const [opps, setOpps] = useState<Opp[]>([]);
  const [accounts, setAccounts] = useState<Record<string, string>>({});
  const [dragging, setDragging] = useState<string | null>(null);
  const [overCol, setOverCol] = useState<string | null>(null);
  const dragOpp = useRef<Opp | null>(null);

  const load = () =>
    fetch("/api/opportunities?active=true").then(r => r.json()).then(setOpps);

  useEffect(() => { load(); }, []);
  useEffect(() => {
    fetch("/api/accounts").then(r => r.json()).then((list: Account[]) =>
      setAccounts(Object.fromEntries(list.map(a => [a.id, a.name])))
    );
  }, []);

  const moveOpp = async (oppId: string, newStage: string) => {
    const stage = OPPORTUNITY_STAGES.find(s => s.value === newStage);
    setOpps(prev => prev.map(o => o.id === oppId ? { ...o, stage: newStage, probability: stage?.probability ?? o.probability } : o));
    await fetch(`/api/opportunities/${oppId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage: newStage, probability: stage?.probability }),
    });
  };

  const onDragStart = (e: React.DragEvent, opp: Opp) => {
    dragOpp.current = opp;
    setDragging(opp.id);
    e.dataTransfer.effectAllowed = "move";
  };

  const onDragOver = (e: React.DragEvent, stage: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setOverCol(stage);
  };

  const onDrop = (e: React.DragEvent, stage: string) => {
    e.preventDefault();
    if (dragOpp.current && dragOpp.current.stage !== stage) {
      moveOpp(dragOpp.current.id, stage);
    }
    setDragging(null);
    setOverCol(null);
    dragOpp.current = null;
  };

  const onDragEnd = () => {
    setDragging(null);
    setOverCol(null);
    dragOpp.current = null;
  };

  const stageMap: Record<string, Opp[]> = {};
  for (const s of ACTIVE_STAGES) stageMap[s.value] = [];
  for (const o of opps) {
    if (stageMap[o.stage]) stageMap[o.stage].push(o);
  }

  const totalByStage = (stage: string) => stageMap[stage].reduce((s, o) => s + (o.arr ?? 0), 0);

  return (
    <div className="p-6 h-screen flex flex-col">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pipeline</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {opps.length} active deals · {formatCurrency(opps.reduce((s, o) => s + (o.arr ?? 0), 0))} total · drag cards to advance stages
          </p>
        </div>
        <Link href="/opportunities" className="text-sm text-indigo-600 hover:text-indigo-700">List view</Link>
      </div>

      <div className="flex gap-3 overflow-x-auto flex-1 pb-4">
        {ACTIVE_STAGES.map(({ value: stage, label }) => {
          const cards = stageMap[stage] ?? [];
          const isOver = overCol === stage;

          return (
            <div
              key={stage}
              className={`flex flex-col rounded-xl border-2 transition-colors flex-shrink-0 w-64 ${
                isOver ? "border-indigo-400 bg-indigo-50" : "border-gray-200 bg-gray-50"
              }`}
              onDragOver={e => onDragOver(e, stage)}
              onDrop={e => onDrop(e, stage)}
              onDragLeave={() => setOverCol(null)}
            >
              {/* Column header */}
              <div className="px-3 py-3 border-b border-gray-200">
                <div className="flex items-center justify-between mb-1">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${STAGE_COLORS[stage]}`}>
                    {label}
                  </span>
                  <span className="text-xs text-gray-400 font-medium">{cards.length}</span>
                </div>
                <p className="text-sm font-semibold text-gray-700">{formatCurrency(totalByStage(stage))}</p>
              </div>

              {/* Cards */}
              <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {cards.length === 0 && (
                  <div className={`h-16 rounded-lg border-2 border-dashed flex items-center justify-center transition-colors ${
                    isOver ? "border-indigo-300 bg-indigo-50" : "border-gray-200"
                  }`}>
                    <span className="text-xs text-gray-300">Drop here</span>
                  </div>
                )}
                {cards.map(opp => {
                  const dl = daysLeft(opp.closeDate);
                  const isDragging = dragging === opp.id;
                  return (
                    <div
                      key={opp.id}
                      draggable
                      onDragStart={e => onDragStart(e, opp)}
                      onDragEnd={onDragEnd}
                      className={`bg-white rounded-lg border p-3 cursor-grab active:cursor-grabbing shadow-sm transition-all select-none ${
                        isDragging ? "opacity-40 scale-95 border-indigo-300" : "border-gray-200 hover:border-indigo-300 hover:shadow-md"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <Link
                          href={`/opportunities/${opp.id}`}
                          className="text-sm font-semibold text-gray-900 hover:text-indigo-600 leading-tight line-clamp-2"
                          onClick={e => e.stopPropagation()}
                        >
                          {opp.name}
                        </Link>
                      </div>

                      {opp.accountId && (
                        <p className="text-xs text-gray-400 mb-2 truncate">
                          {accounts[opp.accountId] ?? ""}
                        </p>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-gray-800">{formatCurrency(opp.arr ?? 0)}</span>
                        <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-xs font-medium ${TYPE_BADGE[opp.type] ?? "bg-gray-100 text-gray-600"}`}>
                          {opp.type.replace("_", " ")}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-400">{opp.probability ?? 0}%</span>
                        {dl && (
                          <span className={`text-xs font-medium ${dl.urgent ? "text-red-600" : "text-gray-400"}`}>
                            {dl.label}
                          </span>
                        )}
                        {opp.aeOwner && (
                          <span className="text-xs text-gray-400 truncate max-w-[80px]">{opp.aeOwner}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
