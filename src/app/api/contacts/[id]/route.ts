import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { contacts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { now } from "@/lib/utils";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  await db.update(contacts).set({ ...body, updatedAt: now() }).where(eq(contacts.id, id));
  const [row] = await db.select().from(contacts).where(eq(contacts.id, id));
  return NextResponse.json(row);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.delete(contacts).where(eq(contacts.id, id));
  return NextResponse.json({ ok: true });
}
