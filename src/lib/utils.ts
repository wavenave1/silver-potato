import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { nanoid } from "nanoid";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function newId() {
  return nanoid();
}

export function now() {
  return new Date().toISOString();
}

export function formatCurrency(value: number) {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

export function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function daysUntil(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null;
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export const STAGE_COLORS: Record<string, string> = {
  discovery: "bg-blue-100 text-blue-700",
  qualification: "bg-purple-100 text-purple-700",
  demo: "bg-yellow-100 text-yellow-700",
  proposal: "bg-orange-100 text-orange-700",
  negotiation: "bg-pink-100 text-pink-700",
  closed_won: "bg-green-100 text-green-700",
  closed_lost: "bg-red-100 text-red-700",
  prospect: "bg-gray-100 text-gray-700",
  customer: "bg-emerald-100 text-emerald-700",
  churned: "bg-red-100 text-red-700",
};

export const OPPORTUNITY_STAGES = [
  { value: "discovery", label: "Discovery", probability: 10 },
  { value: "qualification", label: "Qualification", probability: 25 },
  { value: "demo", label: "Demo", probability: 40 },
  { value: "proposal", label: "Proposal", probability: 60 },
  { value: "negotiation", label: "Negotiation", probability: 80 },
  { value: "closed_won", label: "Closed Won", probability: 100 },
  { value: "closed_lost", label: "Closed Lost", probability: 0 },
];

export const CONTACT_ROLES = [
  { value: "economic_buyer", label: "Economic Buyer" },
  { value: "champion", label: "Champion" },
  { value: "technical_buyer", label: "Technical Buyer" },
  { value: "end_user", label: "End User" },
  { value: "blocker", label: "Blocker" },
  { value: "influencer", label: "Influencer" },
];
