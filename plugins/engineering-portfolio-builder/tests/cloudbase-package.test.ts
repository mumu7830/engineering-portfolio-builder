import { describe, expect, test } from "vitest";
import fixture from "../../../examples/fictional-engineer/portfolio-data.json";
import expected from "../../../examples/fictional-engineer/expected-public-disclosure.json";
import { createPublicDisclosure } from "../scripts/lib/privacy.js";
import { evaluateCloudBaseGate } from "../scripts/lib/cloudbase.js";
import { cloudBaseStaticHosting } from "../scripts/package-cloudbase.js";

describe("CloudBase publication boundary", () => {
  test("lists exact public personal fields and files before upload", () => {
    const data = structuredClone(fixture);
    Object.assign(data.profile, {
      portrait: "media/portrait-placeholder.svg",
      wechatQr: "media/wechat-placeholder.svg",
      publication: { email: true, location: true, portrait: true, wechatQr: true },
    });
    expect(createPublicDisclosure(data)).toEqual(expected);
  });

  test.each([
    { paidPlan: true },
    { automaticRenewal: true },
    { credentialPrompt: true },
    { broaderPermission: true },
  ])("stops for charge, renewal, credential, or broader permission prompts", (prompt) => {
    expect(evaluateCloudBaseGate(prompt)).toMatchObject({ allowed: false });
  });

  test("uses root-only static hosting values", () => {
    expect(cloudBaseStaticHosting).toEqual({
      installCommand: null,
      buildCommand: null,
      outputDirectory: "./",
      route: "/",
    });
  });
});
