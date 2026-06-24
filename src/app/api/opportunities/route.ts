import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { opportunities } from "@/db/schema";
import { eq, desc, ne } from "drizzle-orm";
import { newId, now } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const accountId = req.nextUrl.searchParams.get("accountId");
  const active = req.nextUrl.searchParams.get("active");

  let rows = accountId
    ? await db.select().from(opportunities).where(eq(opportunities.accountId, accountId)).orderBy(desc(opportunities.updatedAt))
    : await db.select().from(opportunities).orderBy(desc(opportunities.updatedAt));

  if (active === "true") {
    rows = rows.filter(r => r.stage !== "closed_won" && r.stage !== "closed_lost");
  }

  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const id = newId();
  const ts = now();

  await db.insert(opportunities).values({
    id,
    accountId: body.accountId ?? null,
    name: body.name,
    type: body.type ?? "new_logo",
    stage: body.stage ?? "discovery",
    arr: body.arr ?? 0,
    closeDate: body.closeDate ?? null,
    probability: body.probability ?? 10,
    aeOwner: body.aeOwner ?? null,
    lossReason: body.lossReason ?? null,
    qualMetrics: body.qualMetrics ?? null,
    qualEconomicBuyer: body.qualEconomicBuyer ?? null,
    qualDecisionCriteria: body.qualDecisionCriteria ?? null,
    qualDecisionProcess: body.qualDecisionProcess ?? null,
    qualIdentifiedPain: body.qualIdentifiedPain ?? null,
    qualChampion: body.qualChampion ?? null,
    qualCompetition: body.qualCompetition ?? null,
    qualNotes: body.qualNotes ?? null,
    createdAt: ts,
    updatedAt: ts,
  });

  const [row] = await db.select().from(opportunities).where(eq(opportunities.id, id));
  return NextResponse.json(row, { status: 201 });
}
