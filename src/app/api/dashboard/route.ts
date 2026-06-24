import { NextResponse } from "next/server";
import { db } from "@/db";
import { accounts, opportunities, activities } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  const allAccounts = await db.select().from(accounts);
  const allOpps = await db.select().from(opportunities);
  const recentActivities = await db.select().from(activities).orderBy(desc(activities.createdAt)).limit(10);

  const activeOpps = allOpps.filter(o => o.stage !== "closed_won" && o.stage !== "closed_lost");
  const pipelineArr = activeOpps.reduce((sum, o) => sum + (o.arr ?? 0) * ((o.probability ?? 0) / 100), 0);
  const totalArr = allAccounts.filter(a => a.stage === "customer").reduce((sum, a) => sum + (a.arr ?? 0), 0);

  const now = new Date();
  const in90Days = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const renewalRisk = allAccounts.filter(a =>
    a.stage === "customer" &&
    a.renewalDate &&
    a.renewalDate <= in90Days &&
    (a.healthScore ?? 100) < 70
  );

  const stageCounts: Record<string, { count: number; arr: number }> = {};
  for (const opp of activeOpps) {
    if (!stageCounts[opp.stage]) stageCounts[opp.stage] = { count: 0, arr: 0 };
    stageCounts[opp.stage].count++;
    stageCounts[opp.stage].arr += opp.arr ?? 0;
  }

  return NextResponse.json({
    totalAccounts: allAccounts.length,
    customers: allAccounts.filter(a => a.stage === "customer").length,
    totalArr,
    pipelineArr,
    activeOpps: activeOpps.length,
    wonThisQuarter: allOpps.filter(o => o.stage === "closed_won").length,
    renewalRisk: renewalRisk.length,
    stageCounts,
    recentActivities,
  });
}
