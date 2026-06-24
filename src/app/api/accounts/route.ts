import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { accounts } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { newId, now } from "@/lib/utils";

export async function GET() {
  const rows = await db.select().from(accounts).orderBy(desc(accounts.updatedAt));
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const id = newId();
  const ts = now();

  await db.insert(accounts).values({
    id,
    name: body.name,
    domain: body.domain ?? null,
    industry: body.industry ?? null,
    size: body.size ?? null,
    arr: body.arr ?? 0,
    healthScore: body.healthScore ?? 50,
    stage: body.stage ?? "prospect",
    renewalDate: body.renewalDate ?? null,
    csOwner: body.csOwner ?? null,
    aeOwner: body.aeOwner ?? null,
    notes: body.notes ?? null,
    createdAt: ts,
    updatedAt: ts,
  });

  const row = await db.select().from(accounts).where(eq(accounts.id, id));
  return NextResponse.json(row[0], { status: 201 });
}
