import type { PortfolioData } from "./schema.js";

export type PrivacyIssue = {
  kind:
    | "phone"
    | "email"
    | "address"
    | "id-number"
    | "secret"
    | "private-key"
    | "wechat-qr";
  value: string;
  location?: string;
  blocked: boolean;
};

const patterns: Array<{
  kind: PrivacyIssue["kind"];
  expression: RegExp;
  blocked: boolean;
}> = [
  { kind: "private-key", expression: /-----BEGIN [A-Z ]*PRIVATE KEY-----/g, blocked: true },
  {
    kind: "secret",
    expression:
      /(?:TENCENTCLOUD_)?(?:SECRET(?:ID|KEY)|API[_-]?KEY|ACCESS[_-]?TOKEN)\s*[:=]\s*["']?([A-Za-z0-9_+/=-]{8,})/gi,
    blocked: true,
  },
  { kind: "id-number", expression: /(?<!\d)\d{17}[\dXx](?!\d)/g, blocked: false },
  { kind: "phone", expression: /(?<!\d)1[3-9]\d{9}(?!\d)/g, blocked: false },
  {
    kind: "email",
    expression: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
    blocked: false,
  },
];

const safeExampleDomains = new Set(["example.com", "example.org", "example.net"]);

export function redactValue(value: string): string {
  if (value.length <= 4) return "*".repeat(value.length);
  if (value.length <= 6) return `${value.slice(0, 1)}${"*".repeat(value.length - 2)}${value.slice(-1)}`;
  return `${value.slice(0, 2)}${"*".repeat(value.length - 4)}${value.slice(-2)}`;
}

export function scanText(text: string, location?: string): PrivacyIssue[] {
  const issues: PrivacyIssue[] = [];
  for (const pattern of patterns) {
    pattern.expression.lastIndex = 0;
    for (const match of text.matchAll(pattern.expression)) {
      const value = match[0];
      if (pattern.kind === "email") {
        const domain = value.toLowerCase().split("@")[1];
        if (safeExampleDomains.has(domain)) continue;
      }
      issues.push({ kind: pattern.kind, value, location, blocked: pattern.blocked });
    }
  }
  return issues;
}

export function scanPortfolio(data: PortfolioData): PrivacyIssue[] {
  const issues = scanText(JSON.stringify(data));
  if (data.profile.wechatQr) {
    issues.push({
      kind: "wechat-qr",
      value: data.profile.wechatQr,
      location: "profile.wechatQr",
      blocked: false,
    });
  }
  for (const media of data.media) {
    if (media.kind === "qr") {
      issues.push({
        kind: "wechat-qr",
        value: media.path,
        location: `media.${media.id}`,
        blocked: false,
      });
    }
  }
  return issues;
}

export type PublicDisclosure = {
  fields: Array<{ field: "email" | "phone" | "location" | "portrait" | "wechatQr"; value: string }>;
  files: string[];
  confirmationRequired: true;
  confirmationScope: "next-upload-only";
};

export function createPublicDisclosure(data: PortfolioData): PublicDisclosure {
  const keys = ["email", "phone", "location", "portrait", "wechatQr"] as const;
  const fields = keys.flatMap((field) => {
    const value = data.profile[field];
    return data.profile.publication[field] && value ? [{ field, value }] : [];
  });
  return {
    fields,
    files: fields.filter(({ field }) => field === "portrait" || field === "wechatQr").map(({ value }) => value),
    confirmationRequired: true,
    confirmationScope: "next-upload-only",
  };
}
