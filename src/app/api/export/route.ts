import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { accounts, contacts, opportunities } from "@/db/schema";
import { eq } from "drizzle-orm";

function toCSV(rows: Record<string, unknown>[]): string {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown) => {
    const s = v == null ? "" : String(v);
    return s.includes(",") || s.includes('"') || s.includes("\n")
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  };
  return [
    headers.join(","),
    ...rows.map(r => headers.map(h => escape(r[h])).join(",")),
  ].join("\n");
}

export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get("type");

  let csv = "";
  let filename = "export.csv";

  if (type === "accounts") {
    const rows = await db.select().from(accounts);
    csv = toCSV(rows.map(r => ({
      "Account Name": r.name,
      "Domain": r.domain ?? "",
      "Industry": r.industry ?? "",
      "Size": r.size ?? "",
      "ARR": r.arr ?? 0,
      "Health Score": r.healthScore ?? 50,
      "Stage": r.stage,
      "Renewal Date": r.renewalDate ?? "",
      "AE Owner": r.aeOwner ?? "",
      "CS Owner": r.csOwner ?? "",
      "Notes": r.notes ?? "",
    })));
    filename = "accounts.csv";
  }

  if (type === "contacts") {
    const rows = await db.select().from(contacts);
    const allAccounts = await db.select({ id: accounts.id, name: accounts.name }).from(accounts);
    const accountMap = Object.fromEntries(allAccounts.map(a => [a.id, a.name]));
    csv = toCSV(rows.map(r => ({
      "First Name": r.firstName,
      "Last Name": r.lastName,
      "Account Name": r.accountId ? (accountMap[r.accountId] ?? "") : "",
      "Title": r.title ?? "",
      "Email": r.email ?? "",
      "Phone": r.phone ?? "",
      "Role": r.role ?? "",
      "Engagement": r.engagementLevel ?? "",
      "LinkedIn": r.linkedinUrl ?? "",
      "Notes": r.notes ?? "",
    })));
    filename = "contacts.csv";
  }

  if (type === "opportunities") {
    const rows = await db.select().from(opportunities);
    const allAccounts = await db.select({ id: accounts.id, name: accounts.name }).from(accounts);
    const accountMap = Object.fromEntries(allAccounts.map(a => [a.id, a.name]));
    csv = toCSV(rows.map(r => ({
      "Opportunity Name": r.name,
      "Account Name": r.accountId ? (accountMap[r.accountId] ?? "") : "",
      "Type": r.type,
      "Stage": r.stage,
      "ARR": r.arr ?? 0,
      "Close Date": r.closeDate ?? "",
      "Probability": r.probability ?? 0,
      "AE Owner": r.aeOwner ?? "",
      "Identified Pain": r.qualIdentifiedPain ?? "",
      "Success Metrics": r.qualMetrics ?? "",
      "Economic Buyer": r.qualEconomicBuyer ?? "",
      "Decision Criteria": r.qualDecisionCriteria ?? "",
      "Decision Process": r.qualDecisionProcess ?? "",
      "Champion": r.qualChampion ?? "",
      "Competition": r.qualCompetition ?? "",
      "Notes": r.qualNotes ?? "",
    })));
    filename = "opportunities.csv";
  }

  if (!csv) return NextResponse.json({ error: "Unknown type" }, { status: 400 });

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
