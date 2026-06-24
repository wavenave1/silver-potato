import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { activities } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { newId, now } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const accountId = req.nextUrl.searchParams.get("accountId");
  const rows = accountId
    ? await db.select().from(activities).where(eq(activities.accountId, accountId)).orderBy(desc(activities.createdAt))
    : await db.select().from(activities).orderBy(desc(activities.createdAt));
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const id = newId();
  const ts = now();

  await db.insert(activities).values({
    id,
    accountId: body.accountId ?? null,
    contactId: body.contactId ?? null,
    opportunityId: body.opportunityId ?? null,
    type: body.type,
    subject: body.subject,
    body: body.body ?? null,
    outcome: body.outcome ?? null,
    nextStep: body.nextStep ?? null,
    dueDate: body.dueDate ?? null,
    completedAt: body.completedAt ?? null,
    owner: body.owner ?? null,
    createdAt: ts,
  });

  const [row] = await db.select().from(activities).where(eq(activities.id, id));
  return NextResponse.json(row, { status: 201 });
}
