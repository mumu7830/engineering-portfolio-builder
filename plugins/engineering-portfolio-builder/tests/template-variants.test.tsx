// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";
import fixture from "../../../examples/fictional-engineer/portfolio-data.json";
import { ProfessionalLightApp } from "../assets/templates/professional-light/src/App.js";
import { CreativeVisualApp } from "../assets/templates/creative-visual/src/App.js";

afterEach(cleanup);

describe.each([
  ["professional-light", ProfessionalLightApp],
  ["creative-visual", CreativeVisualApp],
] as const)("%s template", (template, App) => {
  test("renders all required content in source order", () => {
    const { container } = render(<App data={fixture} />);

    expect(container.querySelector(`[data-template="${template}"]`)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "精选项目" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "教育经历" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "专业能力" })).toBeVisible();
    expect(screen.queryByText("暂无内容")).not.toBeInTheDocument();

    const projects = screen.getAllByRole("heading", { level: 3 }).filter((heading) =>
      ["视觉分拣自动化单元", "轻量化设备支架"].includes(heading.textContent ?? ""),
    );
    expect(projects.map((heading) => heading.textContent)).toEqual([
      "视觉分拣自动化单元",
      "轻量化设备支架",
    ]);
  });
});
