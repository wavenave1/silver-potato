// Maps common Dynamics 365 column names → our field names
// Case-insensitive matching is applied when used

export const ACCOUNT_MAP: Record<string, string> = {
  // Dynamics 365 standard field names
  "account name": "name",
  "accountname": "name",
  "name": "name",
  "company name": "name",
  "company": "name",
  "organization name": "name",

  "website": "domain",
  "web site": "domain",
  "domain": "domain",

  "industry": "industry",
  "industry (account)": "industry",

  "number of employees": "size",
  "employees": "size",
  "company size": "size",

  "annual revenue": "arr",
  "revenue": "arr",
  "arr": "arr",

  "account status": "stage",
  "status": "stage",
  "relationship type": "stage",

  "description": "notes",
  "notes": "notes",
  "account description": "notes",

  "owner": "aeOwner",
  "account owner": "aeOwner",
  "owner (account)": "aeOwner",
  "assigned to": "aeOwner",
};

export const CONTACT_MAP: Record<string, string> = {
  "first name": "firstName",
  "firstname": "firstName",

  "last name": "lastName",
  "lastname": "lastName",

  "full name": "_fullName",
  "contact name": "_fullName",
  "name": "_fullName",

  "job title": "title",
  "title": "title",
  "jobtitle": "title",

  "email": "email",
  "email address": "email",
  "email address 1": "email",

  "business phone": "phone",
  "phone": "phone",
  "mobile phone": "phone",
  "telephone1": "phone",

  "company name": "_accountName",
  "account name": "_accountName",
  "parent customer": "_accountName",

  "description": "notes",
  "notes": "notes",

  "owner": "_owner",
  "contact owner": "_owner",
};

export const OPPORTUNITY_MAP: Record<string, string> = {
  "opportunity name": "name",
  "topic": "name",
  "name": "name",

  "account name": "_accountName",
  "potential customer": "_accountName",
  "company name": "_accountName",

  "estimated revenue": "arr",
  "revenue": "arr",
  "budget amount": "arr",
  "arr": "arr",

  "sales stage": "stage",
  "pipeline stage": "stage",
  "opportunity stage": "stage",
  "stage": "stage",
  "status reason": "stage",

  "opportunity type": "type",
  "type": "type",

  "close date": "closeDate",
  "estimated close date": "closeDate",
  "actual close date": "closeDate",
  "closedatetime": "closeDate",

  "probability": "probability",
  "probability (%)": "probability",
  "probability of close": "probability",

  "owner": "aeOwner",
  "opportunity owner": "aeOwner",
  "assigned to": "aeOwner",

  "description": "qualNotes",
  "notes": "qualNotes",
};

// Normalise Dynamics stage names → our stage values
export const STAGE_NORMALIZE: Record<string, string> = {
  "qualify": "qualification",
  "develop": "demo",
  "propose": "proposal",
  "close": "negotiation",
  "won": "closed_won",
  "lost": "closed_lost",
  "closed won": "closed_won",
  "closed lost": "closed_lost",
  "open": "discovery",
  "new": "discovery",
  "in progress": "discovery",
  "active": "customer",
  "inactive": "churned",
};

export function normalizeStage(raw: string): string {
  const lower = raw.toLowerCase().trim();
  return STAGE_NORMALIZE[lower] ?? lower;
}

export function mapRow(
  row: Record<string, string>,
  fieldMap: Record<string, string>
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [rawKey, value] of Object.entries(row)) {
    const mapped = fieldMap[rawKey.toLowerCase().trim()];
    if (mapped && value?.trim()) out[mapped] = value.trim();
  }
  return out;
}
