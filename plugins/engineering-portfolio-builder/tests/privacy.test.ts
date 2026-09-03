import { describe, expect, test } from "vitest";
import { redactValue, scanText } from "../scripts/lib/privacy.js";

describe("privacy scanner", () => {
  test.each([
    ["手机号 13800138000", "phone"],
    ["邮箱 person@qq.com", "email"],
    ["TENCENTCLOUD_SECRETKEY=abc123456789", "secret"],
    ["-----BEGIN PRIVATE KEY-----", "private-key"],
    ["身份证 110101199003074510", "id-number"],
  ])("detects protected value in %s", (text, kind) => {
    expect(scanText(text).map((issue) => issue.kind)).toContain(kind);
  });

  test("does not flag reserved example domains", () => {
    expect(scanText("engineer@example.com")).toEqual([]);
  });

  test("redacts detected values before logging", () => {
    expect(redactValue("13800138000")).toBe("13*******00");
  });
});
