import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { accounts, contacts, opportunities, activities } from "@/db/schema";
import { eq } from "drizzle-orm";
import { now } from "@/lib/utils";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [account] = await db.select().from(accounts).where(eq(accounts.id, id));
  if (!account) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const accountContacts = await db.select().from(contacts).where(eq(contacts.accountId, id));
  const accountOpps = await db.select().from(opportunities).where(eq(opportunities.accountId, id));
  const accountActivities = await db.select().from(activities).where(eq(activities.accountId, id));

  return NextResponse.json({ account, contacts: accountContacts, opportunities: accountOpps, activities: accountActivities });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  await db.update(accounts)
    .set({ ...body, updatedAt: now() })
    .where(eq(accounts.id, id));

  const [row] = await db.select().from(accounts).where(eq(accounts.id, id));
  return NextResponse.json(row);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.delete(accounts).where(eq(accounts.id, id));
  return NextResponse.json({ ok: true });
}
