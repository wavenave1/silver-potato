import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { opportunityContacts, contacts } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { now } from "@/lib/utils";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const links = await db
    .select({ contact: contacts })
    .from(opportunityContacts)
    .innerJoin(contacts, eq(opportunityContacts.contactId, contacts.id))
    .where(eq(opportunityContacts.opportunityId, id));
  return NextResponse.json(links.map(l => l.contact));
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { contactId } = await req.json();
  await db.insert(opportunityContacts).values({
    opportunityId: id,
    contactId,
    createdAt: now(),
  }).onConflictDoNothing();
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { contactId } = await req.json();
  await db.delete(opportunityContacts).where(
    and(eq(opportunityContacts.opportunityId, id), eq(opportunityContacts.contactId, contactId))
  );
  return NextResponse.json({ ok: true });
}
