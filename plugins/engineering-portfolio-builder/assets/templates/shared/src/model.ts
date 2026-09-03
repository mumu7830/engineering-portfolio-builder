export type TimelineItem = {
  id: string;
  organization: string;
  title: string;
  period: string;
  details: string[];
  sources: string[];
};

export type MediaAsset = {
  id: string;
  path: string;
  alt: string;
  caption: string;
  source: string;
  kind: "portrait" | "cad" | "simulation" | "diagram" | "photo" | "qr";
  width?: number;
  height?: number;
  publicationApproved?: boolean;
};

export type ProjectSection = {
  kind: "background" | "problem" | "action" | "result";
  title?: string;
  text: string;
  sources: string[];
  mediaIds?: string[];
};

export type Project = {
  id: string;
  title: string;
  summary: string;
  role: string;
  period?: string;
  tools: string[];
  tags?: string[];
  heroMediaId?: string;
  sections: ProjectSection[];
};

export type PortfolioData = {
  profile: {
    name: string;
    title: string;
    summary: string;
    location?: string;
    email?: string;
    phone?: string;
    portrait?: string;
    wechatQr?: string;
    publication?: Record<string, boolean>;
  };
  education: TimelineItem[];
  experience: TimelineItem[];
  skills: Array<{ id: string; label: string; items: string[]; sources: string[] }>;
  media: MediaAsset[];
  projects: Project[];
  otherWork?: Array<{ id: string; title: string; summary: string; mediaId?: string; sources: string[] }>;
  unresolved?: Array<{ field: string; reason: string; sources: string[] }>;
};
