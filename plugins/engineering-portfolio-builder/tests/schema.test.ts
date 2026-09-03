import { describe, expect, test } from "vitest";
import fixture from "../../../examples/fictional-engineer/portfolio-data.json";
import { validatePortfolioData } from "../scripts/lib/schema.js";

const base = {
  profile: {
    name: "林知远",
    title: "自动化工程师",
    summary: "聚焦自动化设备结构与验证。",
    publication: {},
  },
  education: [],
  experience: [],
  skills: [],
  media: [],
};

describe("portfolio schema", () => {
  test("accepts a sourced engineering project", () => {
    const result = validatePortfolioData({
      ...base,
      projects: [
        {
          id: "sorting-cell",
          title: "视觉分拣单元",
          summary: "完成结构与节拍验证",
          role: "结构设计",
          tools: ["SolidWorks"],
          sections: [
            {
              kind: "background",
              text: "产线需要自动分拣。",
              sources: ["resume.docx#project-1"],
            },
            {
              kind: "problem",
              text: "空间与节拍受限。",
              sources: ["report.pdf#p3"],
            },
            {
              kind: "action",
              text: "建立装配与运动模型。",
              sources: ["report.pdf#p8"],
            },
            {
              kind: "result",
              text: "完成结构方案评审。",
              sources: ["slides.pptx#slide-12"],
            },
          ],
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  test("rejects an unsourced result claim", () => {
    const result = validatePortfolioData({
      ...base,
      projects: [
        {
          id: "p",
          title: "项目",
          summary: "摘要",
          role: "设计",
          tools: [],
          sections: [
            { kind: "result", text: "效率提升 60%", sources: [] },
          ],
        },
      ],
    });
    expect(result.success).toBe(false);
  });

  test("records contact publication independently from its value", () => {
    const result = validatePortfolioData({
      ...base,
      profile: {
        ...base.profile,
        email: "engineer@example.com",
        publication: { email: false },
      },
      projects: [],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.profile.publication.email).toBe(false);
    }
  });

  test("validates the public fictional fixture", () => {
    expect(validatePortfolioData(fixture).success).toBe(true);
  });
});
