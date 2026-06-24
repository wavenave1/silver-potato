import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const accounts = sqliteTable("accounts", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  domain: text("domain"),
  industry: text("industry"),
  size: text("size"), // SMB, Mid-Market, Enterprise
  arr: real("arr").default(0), // Annual Recurring Revenue
  healthScore: integer("health_score").default(50), // 0-100
  stage: text("stage").notNull().default("prospect"), // prospect, customer, churned
  renewalDate: text("renewal_date"),
  csOwner: text("cs_owner"),
  aeOwner: text("ae_owner"),
  notes: text("notes"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const contacts = sqliteTable("contacts", {
  id: text("id").primaryKey(),
  accountId: text("account_id").references(() => accounts.id),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  title: text("title"),
  email: text("email"),
  phone: text("phone"),
  role: text("role"), // economic_buyer, champion, technical_buyer, blocker, end_user
  engagementLevel: text("engagement_level").default("cold"), // cold, warm, hot
  linkedinUrl: text("linkedin_url"),
  notes: text("notes"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const opportunities = sqliteTable("opportunities", {
  id: text("id").primaryKey(),
  accountId: text("account_id").references(() => accounts.id),
  name: text("name").notNull(),
  type: text("type").notNull().default("new_logo"), // new_logo, expansion, renewal
  stage: text("stage").notNull().default("discovery"),
  // stages: discovery, qualification, demo, proposal, negotiation, closed_won, closed_lost
  arr: real("arr").default(0),
  closeDate: text("close_date"),
  probability: integer("probability").default(10),
  aeOwner: text("ae_owner"),
  lossReason: text("loss_reason"),
  // Custom qualification fields (MEDDIC-inspired but flexible)
  qualMetrics: text("qual_metrics"),        // What business metrics matter to them?
  qualEconomicBuyer: text("qual_economic_buyer"), // Who controls budget?
  qualDecisionCriteria: text("qual_decision_criteria"),
  qualDecisionProcess: text("qual_decision_process"),
  qualIdentifiedPain: text("qual_identified_pain"),
  qualChampion: text("qual_champion"),
  qualCompetition: text("qual_competition"),
  qualNotes: text("qual_notes"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const opportunityContacts = sqliteTable("opportunity_contacts", {
  opportunityId: text("opportunity_id").notNull().references(() => opportunities.id),
  contactId: text("contact_id").notNull().references(() => contacts.id),
  createdAt: text("created_at").notNull(),
});

export const activities = sqliteTable("activities", {
  id: text("id").primaryKey(),
  accountId: text("account_id").references(() => accounts.id),
  contactId: text("contact_id").references(() => contacts.id),
  opportunityId: text("opportunity_id").references(() => opportunities.id),
  type: text("type").notNull(), // call, email, meeting, demo, note
  subject: text("subject").notNull(),
  body: text("body"),
  outcome: text("outcome"),
  nextStep: text("next_step"),
  dueDate: text("due_date"),
  completedAt: text("completed_at"),
  owner: text("owner"),
  createdAt: text("created_at").notNull(),
});
