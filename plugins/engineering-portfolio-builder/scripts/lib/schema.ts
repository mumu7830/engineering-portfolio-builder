import { z } from "zod";

const sourceList = z.array(z.string().min(1)).min(1);

export const publicationSchema = z
  .object({
    email: z.boolean().optional(),
    phone: z.boolean().optional(),
    location: z.boolean().optional(),
    portrait: z.boolean().optional(),
    wechatQr: z.boolean().optional(),
  })
  .default({});

export const profileSchema = z.object({
  name: z.string().min(1),
  title: z.string().min(1),
  summary: z.string().min(1),
  location: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(5).optional(),
  portrait: z.string().min(1).optional(),
  wechatQr: z.string().min(1).optional(),
  publication: publicationSchema,
});

const timelineItemSchema = z.object({
  id: z.string().min(1),
  organization: z.string().min(1),
  title: z.string().min(1),
  period: z.string().min(1),
  details: z.array(z.string().min(1)).default([]),
  sources: sourceList,
});

export const mediaAssetSchema = z.object({
  id: z.string().min(1),
  path: z.string().min(1),
  alt: z.string().min(1),
  caption: z.string().min(1),
  source: z.string().min(1),
  kind: z.enum(["portrait", "cad", "simulation", "diagram", "photo", "qr"]),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  crop: z
    .object({
      left: z.number().int().nonnegative(),
      top: z.number().int().nonnegative(),
      width: z.number().int().positive(),
      height: z.number().int().positive(),
    })
    .optional(),
  publicationApproved: z.boolean().default(false),
});

export const projectSectionSchema = z.object({
  kind: z.enum(["background", "problem", "action", "result"]),
  title: z.string().min(1).optional(),
  text: z.string().min(1),
  sources: sourceList,
  mediaIds: z.array(z.string().min(1)).default([]),
});

export const projectSchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().min(1),
  summary: z.string().min(1),
  role: z.string().min(1),
  period: z.string().min(1).optional(),
  tools: z.array(z.string().min(1)),
  tags: z.array(z.string().min(1)).default([]),
  heroMediaId: z.string().min(1).optional(),
  sections: z.array(projectSectionSchema).min(1),
});

export const portfolioSchema = z.object({
  profile: profileSchema,
  education: z.array(timelineItemSchema),
  experience: z.array(timelineItemSchema),
  skills: z.array(
    z.object({
      id: z.string().min(1),
      label: z.string().min(1),
      items: z.array(z.string().min(1)).min(1),
      sources: sourceList,
    }),
  ),
  media: z.array(mediaAssetSchema),
  projects: z.array(projectSchema),
  otherWork: z
    .array(
      z.object({
        id: z.string().min(1),
        title: z.string().min(1),
        summary: z.string().min(1),
        mediaId: z.string().min(1).optional(),
        sources: sourceList,
      }),
    )
    .default([]),
  unresolved: z
    .array(
      z.object({
        field: z.string().min(1),
        reason: z.string().min(1),
        sources: z.array(z.string().min(1)).min(1),
      }),
    )
    .default([]),
});

export type PortfolioData = z.infer<typeof portfolioSchema>;
export type Project = z.infer<typeof projectSchema>;
export type ProjectSection = z.infer<typeof projectSectionSchema>;
export type MediaAsset = z.infer<typeof mediaAssetSchema>;

export type ValidationIssue = {
  path: string;
  message: string;
  severity: "error" | "warning";
};

export function validatePortfolioData(
  input: unknown,
):
  | { success: true; data: PortfolioData; issues: ValidationIssue[] }
  | { success: false; issues: ValidationIssue[] } {
  const parsed = portfolioSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      issues: parsed.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
        severity: "error" as const,
      })),
    };
  }

  const mediaIds = new Set(parsed.data.media.map((media) => media.id));
  const issues: ValidationIssue[] = [];
  for (const [projectIndex, project] of parsed.data.projects.entries()) {
    const referenced = [
      ...(project.heroMediaId ? [project.heroMediaId] : []),
      ...project.sections.flatMap((section) => section.mediaIds),
    ];
    for (const mediaId of referenced) {
      if (!mediaIds.has(mediaId)) {
        issues.push({
          path: `projects.${projectIndex}.mediaIds`,
          message: `Unknown media id: ${mediaId}`,
          severity: "error",
        });
      }
    }
  }

  if (issues.length > 0) return { success: false, issues };
  return { success: true, data: parsed.data, issues: [] };
}
