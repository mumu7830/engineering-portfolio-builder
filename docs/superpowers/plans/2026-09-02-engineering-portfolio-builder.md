# Engineering Portfolio Builder Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and publish an installable Codex plugin that turns engineering resumes and supporting materials into three reviewed portfolio previews, a selected static site, a Tencent CloudBase deployment package, and a verified QR code.

**Architecture:** One orchestration skill controls evidence extraction, review, generation, and consent boundaries. Deterministic TypeScript tools own the shared data schema, privacy checks, template generation, static validation, ZIP creation, and QR verification; three React layouts consume the same JSON model.

**Tech Stack:** Codex plugin manifest, Markdown Skill, Node.js 20+, TypeScript, React, Vite, Vitest, Zod, Sharp, Archiver, QRCode, jsQR, PNGJS, Playwright-compatible browser verification, Tencent CloudBase static hosting.

**Spec:** `docs/superpowers/specs/2026-09-02-engineering-portfolio-builder-design.md`

## Global Constraints

- The public repository name and plugin manifest name are `engineering-portfolio-builder`.
- The included skill name is `building-engineering-portfolios`.
- Version 1 supports engineering and technical-career portfolios and Tencent CloudBase only.
- The repository is public and MIT licensed.
- Real resumes, portraits, project materials, contact data, QR codes, generated sites, deployment packages, and cloud credentials must never enter Git history.
- Every published factual claim must have source provenance or explicit user confirmation.
- Publication of personal data requires an action-time confirmation immediately before upload.
- The plugin must not purchase resources, enable renewal, request long-lived Tencent credentials, or store browser authentication data.
- A build is releasable only when plugin validation, unit tests, all three template builds, privacy scan, static package validation, QR decode verification, and a fresh local install pass.

---

### Task 1: Scaffold the Public Plugin Repository

**Files:**
- Create: `.agents/plugins/marketplace.json`
- Create: `plugins/engineering-portfolio-builder/.codex-plugin/plugin.json`
- Create: `plugins/engineering-portfolio-builder/skills/building-engineering-portfolios/agents/openai.yaml`
- Create: `.gitignore`
- Create: `LICENSE`
- Create: `package.json`
- Create: `pnpm-workspace.yaml`
- Test: `tests/repository-structure.test.ts`

**Interfaces:**
- Consumes: approved repository name and MIT licensing decision from the spec.
- Produces: a valid marketplace-backed plugin root and a pnpm workspace used by every later task.

- [ ] **Step 1: Write the failing repository structure test**

```ts
import { existsSync, readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";

describe("public plugin repository", () => {
  test("contains the required plugin and marketplace manifests", () => {
    expect(existsSync(".agents/plugins/marketplace.json")).toBe(true);
    expect(existsSync("plugins/engineering-portfolio-builder/.codex-plugin/plugin.json")).toBe(true);
  });

  test("ignores every private working artifact", () => {
    const ignore = readFileSync(".gitignore", "utf8");
    for (const entry of ["input/", "private/", "generated/", "dist/", "*.zip", ".env*"]) {
      expect(ignore).toContain(entry);
    }
  });
});
```

- [ ] **Step 2: Run the test and verify RED**

Run: `pnpm vitest run tests/repository-structure.test.ts`

Expected: FAIL because the repository and manifests do not exist.

- [ ] **Step 3: Scaffold the plugin and workspace**

Run the bundled plugin scaffold with repository-local output, skills, scripts, assets, and marketplace enabled. Keep the generated manifest schema intact, set description to “Build evidence-based engineering portfolio websites from resumes and supporting materials,” and use MIT licensing.

Create this root package contract:

```json
{
  "name": "engineering-portfolio-builder",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "vitest run",
    "build:fixtures": "tsx plugins/engineering-portfolio-builder/scripts/build-site.ts --input examples/fictional-engineer/portfolio-data.json --all",
    "check:privacy": "tsx plugins/engineering-portfolio-builder/scripts/scan-privacy.ts .",
    "validate": "pnpm test && pnpm build:fixtures && pnpm check:privacy"
  }
}
```

- [ ] **Step 4: Add private-data exclusions and MIT license**

The `.gitignore` must include:

```gitignore
node_modules/
input/
private/
generated/
dist/
coverage/
*.zip
.env*
*.pem
*.key
cloudbase.config.*
```

- [ ] **Step 5: Validate GREEN**

Run: `pnpm vitest run tests/repository-structure.test.ts`

Expected: PASS.

- [ ] **Step 6: Validate the plugin schema and commit**

Run the bundled `validate_plugin.py` against `plugins/engineering-portfolio-builder`, then commit:

```bash
git add .agents plugins package.json pnpm-workspace.yaml .gitignore LICENSE tests
git commit -m "chore: scaffold engineering portfolio plugin"
```

---

### Task 2: Define and Validate the Evidence-Based Portfolio Model

**Files:**
- Create: `plugins/engineering-portfolio-builder/scripts/lib/schema.ts`
- Create: `plugins/engineering-portfolio-builder/scripts/validate-data.ts`
- Test: `plugins/engineering-portfolio-builder/tests/schema.test.ts`
- Create: `examples/fictional-engineer/portfolio-data.json`

**Interfaces:**
- Consumes: raw or agent-normalized portfolio JSON.
- Produces: `PortfolioData`, `Project`, `ProjectSection`, `MediaAsset`, and `ValidationIssue` types plus `validatePortfolioData(input)`.

- [ ] **Step 1: Write failing schema tests**

```ts
import { describe, expect, test } from "vitest";
import { validatePortfolioData } from "../scripts/lib/schema.js";

describe("portfolio schema", () => {
  test("accepts a sourced engineering project", () => {
    const result = validatePortfolioData({
      profile: { name: "林工", title: "自动化工程师", publication: {} },
      education: [], experience: [], skills: [], media: [],
      projects: [{
        id: "sorting-cell", title: "视觉分拣单元", summary: "完成结构与节拍验证",
        role: "结构设计", tools: ["SolidWorks"],
        sections: [
          { kind: "background", text: "产线需要自动分拣。", sources: ["resume.docx#project-1"] },
          { kind: "problem", text: "空间与节拍受限。", sources: ["report.pdf#p3"] },
          { kind: "action", text: "建立装配与运动模型。", sources: ["report.pdf#p8"] },
          { kind: "result", text: "完成结构方案评审。", sources: ["slides.pptx#slide-12"] }
        ]
      }]
    });
    expect(result.success).toBe(true);
  });

  test("rejects an unsourced result claim", () => {
    const result = validatePortfolioData({
      profile: { name: "林工", title: "自动化工程师", publication: {} },
      education: [], experience: [], skills: [], media: [],
      projects: [{ id: "p", title: "项目", summary: "摘要", role: "设计", tools: [],
        sections: [{ kind: "result", text: "效率提升 60%", sources: [] }] }]
    });
    expect(result.success).toBe(false);
  });
});
```

- [ ] **Step 2: Verify RED**

Run: `pnpm vitest run plugins/engineering-portfolio-builder/tests/schema.test.ts`

Expected: FAIL because `schema.ts` is absent.

- [ ] **Step 3: Implement the minimal Zod schema**

Define discriminated project sections (`background`, `problem`, `action`, `result`), require non-empty `sources` for publishable claims, store `publication` flags separately from values, and export:

```ts
export type PortfolioData = z.infer<typeof portfolioSchema>;
export type ValidationIssue = { path: string; message: string; severity: "error" | "warning" };
export function validatePortfolioData(input: unknown):
  { success: true; data: PortfolioData; issues: ValidationIssue[] } |
  { success: false; issues: ValidationIssue[] };
```

- [ ] **Step 4: Add a completely fictional engineering fixture**

Use the fictional person “林知远,” fictional employers and schools, non-routable example contacts, generated geometric diagrams, and no material derived from any real user.

- [ ] **Step 5: Verify GREEN and commit**

Run: `pnpm vitest run plugins/engineering-portfolio-builder/tests/schema.test.ts`

Expected: PASS.

```bash
git add plugins/engineering-portfolio-builder/scripts plugins/engineering-portfolio-builder/tests examples
git commit -m "feat: add sourced portfolio data model"
```

---

### Task 3: Add Privacy and Secret Scanning

**Files:**
- Create: `plugins/engineering-portfolio-builder/scripts/lib/privacy.ts`
- Create: `plugins/engineering-portfolio-builder/scripts/scan-privacy.ts`
- Test: `plugins/engineering-portfolio-builder/tests/privacy.test.ts`

**Interfaces:**
- Consumes: strings, `PortfolioData`, or a repository path.
- Produces: `scanText(text)`, `scanPortfolio(data)`, and CLI exit code 1 for blocked disclosures.

- [ ] **Step 1: Write failing privacy tests**

```ts
import { describe, expect, test } from "vitest";
import { scanText } from "../scripts/lib/privacy.js";

describe("privacy scanner", () => {
  test.each([
    ["手机号 13800138000", "phone"],
    ["邮箱 person@qq.com", "email"],
    ["TENCENTCLOUD_SECRETKEY=abc123456789", "secret"],
    ["-----BEGIN PRIVATE KEY-----", "private-key"]
  ])("detects %s", (text, kind) => {
    expect(scanText(text).map(i => i.kind)).toContain(kind);
  });

  test("does not flag reserved example domains", () => {
    expect(scanText("engineer@example.com")).toEqual([]);
  });
});
```

- [ ] **Step 2: Verify RED**

Run: `pnpm vitest run plugins/engineering-portfolio-builder/tests/privacy.test.ts`

Expected: FAIL because the scanner is absent.

- [ ] **Step 3: Implement the scanner and publication report**

Return issues shaped as:

```ts
export type PrivacyIssue = {
  kind: "phone" | "email" | "address" | "id-number" | "secret" | "private-key" | "wechat-qr";
  value: string;
  location?: string;
  blocked: boolean;
};
```

Redact matched values in console output. Permit example.com/example.org and explicitly fictional fixture paths. Treat real contact values as review-required, and secrets/private keys as always blocked.

- [ ] **Step 4: Verify GREEN and commit**

Run: `pnpm vitest run plugins/engineering-portfolio-builder/tests/privacy.test.ts`

Expected: PASS.

```bash
git add plugins/engineering-portfolio-builder/scripts plugins/engineering-portfolio-builder/tests
git commit -m "feat: add privacy and secret scanning"
```

---

### Task 4: Create the Skill Through a Failing Behavioral Contract

**Files:**
- Create: `plugins/engineering-portfolio-builder/tests/skill-contract.test.ts`
- Create: `plugins/engineering-portfolio-builder/tests/scenarios/*.md`
- Create: `plugins/engineering-portfolio-builder/skills/building-engineering-portfolios/SKILL.md`
- Create: `plugins/engineering-portfolio-builder/skills/building-engineering-portfolios/references/data-contract.md`
- Create: `plugins/engineering-portfolio-builder/skills/building-engineering-portfolios/references/cloudbase.md`

**Interfaces:**
- Consumes: a user request plus local resume/project materials.
- Produces: a staged workflow ending in local previews, selected static package, consent-gated CloudBase deployment, URL, and QR code.

- [ ] **Step 1: Write scenario fixtures before the Skill**

Create at least these scenarios:

```text
1. Resume claims “robot design” while a reference paper contains a fabricated prototype; expected: do not attribute fabrication to the user.
2. User says “publish quickly” and supplies phone, portrait, and WeChat QR; expected: show exact disclosure list and confirm immediately before upload.
3. A low-resolution paper screenshot includes body text and “Figure 4-2”; expected: crop to figure only or mark unresolved.
4. CloudBase console presents a paid upgrade or renewal; expected: stop and request authorization.
5. Resume lists a project with no supporting report; expected: expand only supported resume facts and label missing evidence.
```

- [ ] **Step 2: Write a contract test that fails without the Skill**

The test must require the Skill to contain searchable guidance for provenance, project background/problem/action/result, interleaved media, conflicting facts, privacy disclosure, action-time confirmation, CloudBase cost stops, local verification, and QR decode verification.

Run: `pnpm vitest run plugins/engineering-portfolio-builder/tests/skill-contract.test.ts`

Expected: FAIL because `SKILL.md` is absent.

- [ ] **Step 3: Write the minimal Skill and routed references**

Keep `SKILL.md` concise. Its frontmatter description starts with “Use when” and triggers on resume-to-portfolio, engineering project-site, technical-material, CloudBase portfolio, and project-story requests. The body routes to `data-contract.md` during normalization and `cloudbase.md` only during deployment.

The workflow contract is:

```text
inventory -> extract with provenance -> normalize -> review unresolved claims ->
render three previews -> validate -> select -> disclose personal fields ->
confirm upload -> deploy -> verify URL -> generate and decode QR
```

- [ ] **Step 4: Validate the Skill**

Run the bundled skill `quick_validate.py` and the contract test.

Expected: both PASS, with no scaffold placeholders.

- [ ] **Step 5: Commit**

```bash
git add plugins/engineering-portfolio-builder/skills plugins/engineering-portfolio-builder/tests
git commit -m "feat: add engineering portfolio skill"
```

---

### Task 5: Build the Shared Site Runtime and Technology-Dark Template

**Files:**
- Create: `plugins/engineering-portfolio-builder/assets/templates/shared/package.json`
- Create: `plugins/engineering-portfolio-builder/assets/templates/shared/src/model.ts`
- Create: `plugins/engineering-portfolio-builder/assets/templates/shared/src/components/*.tsx`
- Create: `plugins/engineering-portfolio-builder/assets/templates/tech-dark/src/App.tsx`
- Create: `plugins/engineering-portfolio-builder/assets/templates/tech-dark/src/theme.css`
- Test: `plugins/engineering-portfolio-builder/tests/template-tech-dark.test.tsx`

**Interfaces:**
- Consumes: validated `PortfolioData` serialized to `src/generated/portfolio-data.json`.
- Produces: `renderTechDark(data)` and a static Vite build with loading, hero, profile, experience, projects, other work, capabilities, and contact sections.

- [ ] **Step 1: Write a failing rendering test**

```tsx
import { render, screen } from "@testing-library/react";
import fixture from "../../../examples/fictional-engineer/portfolio-data.json";
import { TechDarkApp } from "../assets/templates/tech-dark/src/App";

test("renders sourced project sections next to their media", () => {
  render(<TechDarkApp data={fixture} />);
  expect(screen.getByRole("heading", { name: "视觉分拣单元" })).toBeVisible();
  expect(screen.getByText("项目背景")).toBeVisible();
  expect(screen.getByText("我的行动")).toBeVisible();
  expect(screen.queryByText("暂无内容")).not.toBeInTheDocument();
});
```

- [ ] **Step 2: Verify RED**

Run: `pnpm vitest run plugins/engineering-portfolio-builder/tests/template-tech-dark.test.tsx`

Expected: FAIL because the template does not exist.

- [ ] **Step 3: Implement shared semantic components and the dark layout**

Use data-driven components with no embedded personal values. Require meaningful image `alt`, keyboard-accessible project detail controls, and CSS variables for color and spacing. Use deep navy rather than pure black.

- [ ] **Step 4: Build and verify GREEN**

Run the component test and a production Vite build using the fictional fixture.

Expected: PASS and root-level `index.html` in the build output.

- [ ] **Step 5: Commit**

```bash
git add plugins/engineering-portfolio-builder/assets plugins/engineering-portfolio-builder/tests
git commit -m "feat: add technology dark portfolio template"
```

---

### Task 6: Add Professional-Light and Creative-Visual Layouts

**Files:**
- Create: `plugins/engineering-portfolio-builder/assets/templates/professional-light/src/App.tsx`
- Create: `plugins/engineering-portfolio-builder/assets/templates/professional-light/src/theme.css`
- Create: `plugins/engineering-portfolio-builder/assets/templates/creative-visual/src/App.tsx`
- Create: `plugins/engineering-portfolio-builder/assets/templates/creative-visual/src/theme.css`
- Test: `plugins/engineering-portfolio-builder/tests/template-variants.test.tsx`

**Interfaces:**
- Consumes: shared semantic components and the same `PortfolioData`.
- Produces: two visually distinct layouts with the same content completeness and accessibility contract.

- [ ] **Step 1: Write failing variant tests**

Test that each variant renders every required section, omits empty modules, uses a distinct top-level template identifier, and keeps project text/media pairs in source order.

- [ ] **Step 2: Verify RED**

Run: `pnpm vitest run plugins/engineering-portfolio-builder/tests/template-variants.test.tsx`

Expected: FAIL because both variants are absent.

- [ ] **Step 3: Implement professional light**

Use white/light-gray surfaces, editorial typography, timeline-first experience, strong print readability, and restrained motion.

- [ ] **Step 4: Implement creative visual**

Use asymmetric grids, large typography, image-led project transitions, and reduced-motion fallbacks. Do not sacrifice reading order or mobile usability.

- [ ] **Step 5: Build all three and verify GREEN**

Run the variant tests and production builds for `tech-dark`, `professional-light`, and `creative-visual`.

Expected: all PASS and all build outputs contain the same project facts.

- [ ] **Step 6: Commit**

```bash
git add plugins/engineering-portfolio-builder/assets plugins/engineering-portfolio-builder/tests
git commit -m "feat: add light and creative portfolio templates"
```

---

### Task 7: Implement Preview, Build, Validation, and ZIP Packaging

**Files:**
- Create: `plugins/engineering-portfolio-builder/scripts/build-site.ts`
- Create: `plugins/engineering-portfolio-builder/scripts/validate-site.ts`
- Create: `plugins/engineering-portfolio-builder/scripts/package-cloudbase.ts`
- Create: `plugins/engineering-portfolio-builder/scripts/lib/paths.ts`
- Test: `plugins/engineering-portfolio-builder/tests/build-pipeline.test.ts`

**Interfaces:**
- Consumes: `--input <portfolio-data.json>`, `--template <name>` or `--all`, and `--output <directory>`.
- Produces: three preview folders or one selected static site plus `<slug>-cloudbase.zip`.

- [ ] **Step 1: Write failing pipeline tests**

Tests must assert path traversal is rejected, all three preview names are accepted, an unknown template fails clearly, a package contains root `index.html`, and every referenced asset exists inside the ZIP.

- [ ] **Step 2: Verify RED**

Run: `pnpm vitest run plugins/engineering-portfolio-builder/tests/build-pipeline.test.ts`

Expected: FAIL because the pipeline scripts are absent.

- [ ] **Step 3: Implement path-safe build orchestration**

Export:

```ts
export type TemplateName = "tech-dark" | "professional-light" | "creative-visual";
export async function buildSite(options: {
  input: string; template: TemplateName; output: string;
}): Promise<{ outputDir: string; indexPath: string }>;
```

Copy only validated data and approved media into a temporary template workspace, run the production build, then remove temporary source data.

- [ ] **Step 4: Implement static validation and CloudBase ZIP**

Validate HTML, links, local assets, case-sensitive paths, MIME extensions, maximum single-asset size, and root deployment. Archive the validated directory without adding a containing parent folder.

- [ ] **Step 5: Verify GREEN and commit**

Run the pipeline test and inspect ZIP entries.

Expected: PASS; first-level ZIP entries include `index.html` and `assets/`.

```bash
git add plugins/engineering-portfolio-builder/scripts plugins/engineering-portfolio-builder/tests
git commit -m "feat: add static build and CloudBase packaging"
```

---

### Task 8: Add Image QA and Verified QR Generation

**Files:**
- Create: `plugins/engineering-portfolio-builder/scripts/inspect-images.ts`
- Create: `plugins/engineering-portfolio-builder/scripts/generate-qr.ts`
- Test: `plugins/engineering-portfolio-builder/tests/media.test.ts`

**Interfaces:**
- Consumes: approved media paths and a verified public URL.
- Produces: image-quality issues and a PNG QR whose decoded value exactly equals the URL.

- [ ] **Step 1: Write failing media tests**

Test detection of too-small images, extreme aspect ratios, missing files, and a QR round trip using `qrcode`, `pngjs`, and `jsqr`.

- [ ] **Step 2: Verify RED**

Run: `pnpm vitest run plugins/engineering-portfolio-builder/tests/media.test.ts`

Expected: FAIL because media tools are absent.

- [ ] **Step 3: Implement image inspection**

Use Sharp metadata. Return issues rather than silently upscaling technical figures. Permit cropping only through explicit crop coordinates stored in the media record.

- [ ] **Step 4: Implement QR generation with decode verification**

Generate a high-error-correction PNG with a white quiet zone. Decode the written file and fail if the decoded URL differs byte-for-byte from the requested URL.

- [ ] **Step 5: Verify GREEN and commit**

Run: `pnpm vitest run plugins/engineering-portfolio-builder/tests/media.test.ts`

Expected: PASS.

```bash
git add plugins/engineering-portfolio-builder/scripts plugins/engineering-portfolio-builder/tests
git commit -m "feat: add media QA and verified QR output"
```

---

### Task 9: Add Responsive and Accessibility Browser Checks

**Files:**
- Create: `plugins/engineering-portfolio-builder/tests/browser/portfolio.spec.ts`
- Create: `plugins/engineering-portfolio-builder/tests/browser/viewports.ts`
- Create: `playwright.config.ts`

**Interfaces:**
- Consumes: locally served builds for all three templates.
- Produces: responsive, interaction, navigation, image, and accessibility smoke-test results.

- [ ] **Step 1: Write failing browser checks**

For 390x844, 768x1024, and 1440x1000 viewports, assert no horizontal document overflow, hero/project/contact headings are visible, project detail opens by keyboard, every image loads, and reduced-motion mode disables non-essential animation.

- [ ] **Step 2: Verify RED**

Run: `pnpm playwright test plugins/engineering-portfolio-builder/tests/browser/portfolio.spec.ts`

Expected: FAIL until preview servers and template selectors are wired.

- [ ] **Step 3: Wire local preview servers and semantic selectors**

Use stable `data-testid` only for interactions that cannot be selected by role or accessible name. Do not add test-only state to production output.

- [ ] **Step 4: Verify GREEN and commit**

Run all browser tests across all templates.

Expected: PASS at every viewport.

```bash
git add playwright.config.ts plugins/engineering-portfolio-builder
git commit -m "test: verify responsive portfolio templates"
```

---

### Task 10: Document and Exercise the Consent-Gated CloudBase Flow

**Files:**
- Modify: `plugins/engineering-portfolio-builder/skills/building-engineering-portfolios/references/cloudbase.md`
- Create: `plugins/engineering-portfolio-builder/tests/cloudbase-package.test.ts`
- Create: `examples/fictional-engineer/expected-public-disclosure.json`

**Interfaces:**
- Consumes: validated ZIP, privacy report, signed-in Tencent Cloud console, and explicit user confirmation.
- Produces: deployment status, verified public URL, and QR; creates no stored credentials.

- [ ] **Step 1: Write failing deployment-boundary tests**

The contract must require an exact disclosure report before upload and must stop on paid plan, renewal, credential, or broader-permission prompts. The package test verifies CloudBase root deployment values: no install command, no build command, output `./`, route `/`.

- [ ] **Step 2: Verify RED**

Run: `pnpm vitest run plugins/engineering-portfolio-builder/tests/cloudbase-package.test.ts`

Expected: FAIL until the reference and deployment metadata are complete.

- [ ] **Step 3: Implement the CloudBase reference**

Document observable UI labels rather than brittle CSS selectors. Require use of a signed-in browser session, preserve user-selected free resources, stop on any new cost, and never inspect cookies or storage.

- [ ] **Step 4: Verify GREEN and commit**

Run the CloudBase package and skill contract tests.

Expected: PASS.

```bash
git add plugins/engineering-portfolio-builder examples
git commit -m "docs: add safe CloudBase deployment workflow"
```

---

### Task 11: Complete End-to-End Validation and Public Documentation

**Files:**
- Create: `README.md`
- Create: `docs/usage.md`
- Create: `docs/privacy.md`
- Create: `.github/workflows/ci.yml`
- Create: `plugins/engineering-portfolio-builder/tests/e2e.test.ts`

**Interfaces:**
- Consumes: the finished plugin, fictional fixture, and clean installation directory.
- Produces: a documented, tested, GitHub-ready release candidate.

- [ ] **Step 1: Write the failing end-to-end test**

The test copies the fictional fixture into a temporary directory, validates it, renders all previews, selects `tech-dark`, validates the static output, scans it for private data, creates the CloudBase ZIP, generates a QR for an example URL, and decodes the QR.

- [ ] **Step 2: Verify RED**

Run: `pnpm vitest run plugins/engineering-portfolio-builder/tests/e2e.test.ts`

Expected: FAIL until every command is wired through the package scripts.

- [ ] **Step 3: Write user documentation**

README content must include:

- what the plugin builds;
- supported materials and intended users;
- three template previews using fictional data;
- GitHub/Codex installation steps;
- one natural-language invocation example;
- privacy and CloudBase cost boundaries;
- local development and test commands;
- MIT license.

- [ ] **Step 4: Add CI**

Use a pinned Node major, frozen pnpm lockfile, unit tests, three template builds, privacy scan, plugin validation, and package inspection. Do not run a live cloud deployment in CI.

- [ ] **Step 5: Verify GREEN**

Run:

```bash
pnpm install --frozen-lockfile
pnpm validate
pnpm vitest run plugins/engineering-portfolio-builder/tests/e2e.test.ts
```

Expected: all PASS with no warnings containing personal data.

- [ ] **Step 6: Commit**

```bash
git add README.md docs .github plugins package.json pnpm-lock.yaml
git commit -m "docs: prepare public plugin release"
```

---

### Task 12: Validate Fresh Installation and Publish to GitHub

**Files:**
- Modify only if validation exposes defects: plugin, marketplace, tests, or documentation files named by the failure.
- Create locally but do not commit: clean installation and generated test-output directories.

**Interfaces:**
- Consumes: clean Git history and a GitHub-authenticated user session.
- Produces: public GitHub repository, `v0.1.0` release tag, and verified Codex installation.

- [ ] **Step 1: Run repository privacy audit**

Scan both the working tree and `git rev-list --objects --all`. Confirm no real names, phone numbers, email addresses, QR codes, resumes, thesis files, Tencent environment IDs, redemption codes, credentials, or generated private sites appear anywhere in history.

- [ ] **Step 2: Validate plugin and marketplace manifests**

Run the bundled plugin validator, skill validator, JSON parsing, and the complete test suite.

Expected: all PASS.

- [ ] **Step 3: Test a fresh local installation**

Clone or copy the repository into a clean temporary directory, add its marketplace, install `engineering-portfolio-builder`, start a new Codex task, and verify the skill is discoverable by both natural-language and explicit invocation.

- [ ] **Step 4: Create the public GitHub repository**

Use the authenticated GitHub account, repository name `engineering-portfolio-builder`, visibility `public`, and no server-side starter files. Before the external write, verify the selected account and repository name. Push the local `main` branch.

- [ ] **Step 5: Tag the tested release candidate**

```bash
git tag -a v0.1.0 -m "engineering-portfolio-builder v0.1.0"
git push origin main --tags
```

- [ ] **Step 6: Verify the public repository and installation instructions**

Open the public repository while signed out or in a public browser context, confirm files render, confirm no private artifacts are present, and repeat the documented installation command from the public URL.

- [ ] **Step 7: Record release evidence**

Capture the final commit SHA, tag, CI result, plugin validation result, fresh-install result, and public GitHub URL in the release handoff.

