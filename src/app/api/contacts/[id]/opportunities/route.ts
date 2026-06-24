import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { opportunityContacts, opportunities } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const links = await db
    .select({ opp: opportunities })
    .from(opportunityContacts)
    .innerJoin(opportunities, eq(opportunityContacts.opportunityId, opportunities.id))
    .where(eq(opportunityContacts.contactId, id));
  return NextResponse.json(links.map(l => l.opp));
}
