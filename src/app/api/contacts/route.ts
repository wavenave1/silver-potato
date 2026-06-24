import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { contacts } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { newId, now } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const accountId = req.nextUrl.searchParams.get("accountId");
  const rows = accountId
    ? await db.select().from(contacts).where(eq(contacts.accountId, accountId)).orderBy(desc(contacts.createdAt))
    : await db.select().from(contacts).orderBy(desc(contacts.createdAt));
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const id = newId();
  const ts = now();

  await db.insert(contacts).values({
    id,
    accountId: body.accountId ?? null,
    firstName: body.firstName,
    lastName: body.lastName,
    title: body.title ?? null,
    email: body.email ?? null,
    phone: body.phone ?? null,
    role: body.role ?? null,
    engagementLevel: body.engagementLevel ?? "cold",
    linkedinUrl: body.linkedinUrl ?? null,
    notes: body.notes ?? null,
    createdAt: ts,
    updatedAt: ts,
  });

  const [row] = await db.select().from(contacts).where(eq(contacts.id, id));
  return NextResponse.json(row, { status: 201 });
}
