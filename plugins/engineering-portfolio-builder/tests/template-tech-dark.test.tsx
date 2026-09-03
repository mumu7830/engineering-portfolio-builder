// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, describe, expect, test } from "vitest";
import fixture from "../../../examples/fictional-engineer/portfolio-data.json";
import { TechDarkApp } from "../assets/templates/tech-dark/src/App.js";

afterEach(cleanup);

describe("technology-dark template", () => {
  test("renders a complete engineering portfolio from structured data", () => {
    render(<TechDarkApp data={fixture} />);

    expect(screen.getByRole("heading", { name: "视觉分拣自动化单元" })).toBeVisible();
    expect(screen.getAllByText("项目背景").length).toBeGreaterThan(0);
    expect(screen.getAllByText("我的行动").length).toBeGreaterThan(0);
    expect(screen.getByRole("heading", { name: "教育经历" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "专业能力" })).toBeVisible();
    expect(screen.queryByText("暂无内容")).not.toBeInTheDocument();
    expect(screen.getAllByRole("img")[0]).toHaveAttribute("alt");
  });

  test("project details can be toggled from the keyboard-accessible button", () => {
    render(<TechDarkApp data={fixture} />);
    const toggle = screen.getByRole("button", { name: /查看视觉分拣自动化单元详情/ });

    expect(toggle).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("设备需要同时满足机械臂可达性、输送节拍和维护空间要求。")).toBeVisible();
  });
});
