import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { accounts, contacts, opportunities } from "@/db/schema";
import { newId, now } from "@/lib/utils";
import { ACCOUNT_MAP, CONTACT_MAP, OPPORTUNITY_MAP, mapRow, normalizeStage } from "@/lib/dynamics-map";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { type, rows }: { type: "accounts" | "contacts" | "opportunities"; rows: Record<string, string>[] } = body;

  const results = { imported: 0, skipped: 0, errors: [] as string[] };

  if (type === "accounts") {
    for (const raw of rows) {
      try {
        const r = mapRow(raw, ACCOUNT_MAP);
        if (!r.name) { results.skipped++; continue; }
        const ts = now();
        await db.insert(accounts).values({
          id: newId(),
          name: r.name,
          domain: r.domain ?? null,
          industry: r.industry ?? null,
          size: r.size ?? null,
          arr: r.arr ? parseFloat(r.arr.replace(/[^0-9.]/g, "")) : 0,
          healthScore: 50,
          stage: r.stage ? normalizeStage(r.stage) : "prospect",
          renewalDate: null,
          aeOwner: r.aeOwner ?? null,
          csOwner: null,
          notes: r.notes ?? null,
          createdAt: ts,
          updatedAt: ts,
        });
        results.imported++;
      } catch (e) {
        results.errors.push(String(e));
        results.skipped++;
      }
    }
  }

  if (type === "contacts") {
    // Build account name→id lookup
    const allAccounts = await db.select({ id: accounts.id, name: accounts.name }).from(accounts);
    const accountLookup = Object.fromEntries(allAccounts.map(a => [a.name.toLowerCase(), a.id]));

    for (const raw of rows) {
      try {
        const r = mapRow(raw, CONTACT_MAP);

        // Handle "Full Name" split
        if (!r.firstName && r._fullName) {
          const parts = r._fullName.trim().split(/\s+/);
          r.firstName = parts[0];
          r.lastName = parts.slice(1).join(" ") || "-";
        }

        if (!r.firstName || !r.lastName) { results.skipped++; continue; }

        const accountId = r._accountName
          ? (accountLookup[r._accountName.toLowerCase()] ?? null)
          : null;

        const ts = now();
        await db.insert(contacts).values({
          id: newId(),
          accountId,
          firstName: r.firstName,
          lastName: r.lastName,
          title: r.title ?? null,
          email: r.email ?? null,
          phone: r.phone ?? null,
          role: null,
          engagementLevel: "cold",
          linkedinUrl: null,
          notes: r.notes ?? null,
          createdAt: ts,
          updatedAt: ts,
        });
        results.imported++;
      } catch (e) {
        results.errors.push(String(e));
        results.skipped++;
      }
    }
  }

  if (type === "opportunities") {
    const allAccounts = await db.select({ id: accounts.id, name: accounts.name }).from(accounts);
    const accountLookup = Object.fromEntries(allAccounts.map(a => [a.name.toLowerCase(), a.id]));

    for (const raw of rows) {
      try {
        const r = mapRow(raw, OPPORTUNITY_MAP);
        if (!r.name) { results.skipped++; continue; }

        const accountId = r._accountName
          ? (accountLookup[r._accountName.toLowerCase()] ?? null)
          : null;

        let stage = r.stage ? normalizeStage(r.stage) : "discovery";
        const validStages = ["discovery", "qualification", "demo", "proposal", "negotiation", "closed_won", "closed_lost"];
        if (!validStages.includes(stage)) stage = "discovery";

        // Parse close date — handle MM/DD/YYYY and YYYY-MM-DD
        let closeDate: string | null = null;
        if (r.closeDate) {
          const d = new Date(r.closeDate);
          if (!isNaN(d.getTime())) closeDate = d.toISOString().split("T")[0];
        }

        const ts = now();
        await db.insert(opportunities).values({
          id: newId(),
          accountId,
          name: r.name,
          type: r.type?.toLowerCase().includes("renewal") ? "renewal"
            : r.type?.toLowerCase().includes("expansion") ? "expansion"
            : "new_logo",
          stage,
          arr: r.arr ? parseFloat(r.arr.replace(/[^0-9.]/g, "")) : 0,
          closeDate,
          probability: r.probability ? parseInt(r.probability) : 10,
          aeOwner: r.aeOwner ?? null,
          lossReason: null,
          qualMetrics: null, qualEconomicBuyer: null, qualDecisionCriteria: null,
          qualDecisionProcess: null, qualIdentifiedPain: null, qualChampion: null,
          qualCompetition: null, qualNotes: r.qualNotes ?? null,
          createdAt: ts,
          updatedAt: ts,
        });
        results.imported++;
      } catch (e) {
        results.errors.push(String(e));
        results.skipped++;
      }
    }
  }

  return NextResponse.json(results);
}
