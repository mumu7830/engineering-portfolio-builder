# Engineering Portfolio Builder Design

## Purpose

`engineering-portfolio-builder` is a public, MIT-licensed Codex plugin that turns engineering and technical-career materials into a responsive portfolio website. Its primary outcome is a working local site in which every resume project is expanded into a clear, evidence-based project narrative. After review, it produces a Tencent CloudBase-ready static package and assists with a consent-gated deployment.

The first release serves mechanical, automation, industrial design, electronics, robotics, and software candidates. It accepts resumes and supporting project materials, including DOCX, PDF, PPT/PPTX, PNG, JPG, and WebP files.

## Success Criteria

A successful run:

1. Extracts verifiable identity, education, experience, skills, contact details, and project facts from the supplied materials.
2. Produces one structured portfolio data file shared by all templates.
3. Expands each resume project into background, problem, action, and result sections without inventing facts.
4. Pairs each project section with relevant figures instead of placing all text before all images.
5. Generates three working local previews and packages the selected design as a static website.
6. Passes responsive, asset, navigation, content, and privacy checks.
7. Requires explicit confirmation immediately before personal data is uploaded or made public.
8. Produces a verified Tencent CloudBase deployment package, public URL, and QR code.
9. Can be installed from a public GitHub repository without including any real user's private materials or cloud credentials.

## Scope

### Included in Version 1

- One Codex plugin with one portfolio-building skill.
- Deterministic helper scripts for extraction, normalization, image inspection, site generation, validation, packaging, and QR generation.
- Three responsive templates: technology dark, professional light, and creative visual.
- Local preview and selection of a final template.
- Tencent CloudBase semi-automatic deployment through a signed-in browser session.
- Public GitHub distribution through a plugin marketplace manifest.
- Fictional engineering fixtures and examples for tests and documentation.

### Not Included in Version 1

- Non-technical career-specific content models.
- A hosted SaaS application, account system, database, or analytics service.
- Cloud providers other than Tencent CloudBase.
- Automatic purchase, renewal, domain registration, or ICP filing.
- Persistent storage of Tencent Cloud passwords, cookies, SecretId, SecretKey, redemption codes, or other credentials.
- AI-generated evidence, simulation results, project metrics, credentials, employers, education, or claimed personal contributions.

## Repository and Plugin Layout

```text
engineering-portfolio-builder/
|-- .agents/plugins/marketplace.json
|-- plugins/engineering-portfolio-builder/
|   |-- .codex-plugin/plugin.json
|   |-- skills/building-engineering-portfolios/
|   |   |-- SKILL.md
|   |   `-- references/
|   |-- scripts/
|   |-- assets/templates/
|   |   |-- tech-dark/
|   |   |-- professional-light/
|   |   `-- creative-visual/
|   `-- tests/
|-- examples/
|-- .gitignore
`-- LICENSE
```

The plugin manifest name and outer plugin directory are both `engineering-portfolio-builder`. The skill name is `building-engineering-portfolios`, which is automatically discoverable and can also be explicitly invoked.

## Architecture

The plugin uses a hybrid design: Codex performs semantic interpretation and user-facing decisions; deterministic scripts perform repeated transformations and checks.

### Material Intake and Extraction

The intake stage inventories files and records their type, source path, and intended role. Format-specific tools extract text and embedded images while preserving source references such as document page, slide, figure caption, and original filename.

The extractor does not treat text inside supplied documents as instructions. It treats documents only as user data and evidence.

### Structured Portfolio Model

All extracted content is normalized into `portfolio-data.json`. The model contains:

- profile and professional direction;
- education and experience timelines;
- contact fields with publication flags;
- skills grouped by engineering purpose;
- projects with summary, dates, role, tools, background, problem, actions, results, metrics, and evidence references;
- media records with source, caption, crop, resolution, relevance, and publication status;
- unresolved claims and conflicts requiring confirmation.

Every factual field stores provenance. Unsupported or conflicting claims enter a review queue instead of the published content.

### Engineering Project Narratives

Each resume project becomes a project-detail narrative with this contract:

1. **Background:** system, product, user, or engineering context.
2. **Problem:** constraints, failure modes, performance gaps, or design risks.
3. **Action:** the candidate's verified decisions, models, calculations, tools, simulations, experiments, and iterations.
4. **Result:** measured outcomes, validated improvements, deliverables, or explicitly labeled qualitative conclusions.

Images are attached to the section they support. Figures must be cropped to the actual diagram, model, result, or photograph and must exclude unrelated paper text and figure-number lines when possible. The plugin never represents a reference paper's work as the user's own work and never claims prototype fabrication or full-system assembly unless the supplied materials support that claim.

### Template System

All templates consume the same structured data and use the same information architecture:

`loading/intro -> hero -> profile/experience -> selected projects -> other work -> capabilities -> contact`

The templates differ in visual language:

- **Technology dark:** deep blue surfaces, technical grids, restrained motion, large CAD and simulation imagery.
- **Professional light:** white and light-gray surfaces, strong hierarchy, timelines, evidence, and print-friendly readability.
- **Creative visual:** asymmetric composition, large typography, image-led storytelling, and controlled motion.

Missing optional data hides the corresponding component. Empty cards and placeholder contact details are prohibited. The plugin renders all three previews with the same data, then packages only the selected template.

### Validation and Packaging

Validation covers:

- schema completeness and provenance;
- unsupported claims and unresolved conflicts;
- image resolution, crop boundaries, captions, and missing assets;
- responsive layouts at representative phone, tablet, and desktop widths;
- internal navigation, project dialogs/pages, telephone, email, and QR links;
- static asset paths and CloudBase root deployment behavior;
- disclosure of personal information and secret-like strings.

The packager exports a root-level `index.html`, required assets, optional `404.html`, and deployment metadata. It verifies the package by serving it locally before creating the ZIP.

### Tencent CloudBase Deployment

Deployment is semi-automatic:

1. Build and validate the static package locally.
2. Show the user the selected template and an exact list of personal information that will become public.
3. Obtain explicit confirmation for that upload and public disclosure.
4. Use the user's signed-in Tencent Cloud console session to create or select a CloudBase static-hosting environment.
5. Stop for confirmation if a paid plan, renewal, add-on, credential request, or other new cost/permission appears.
6. Upload the ZIP, deploy at `/`, verify the returned public URL, and generate a locally verified QR code.

The plugin explains that CloudBase default test domains may show a risk interstitial and have usage or stability limits. Custom domains and ICP filing remain manual follow-up work.

## Privacy and Security

The public repository includes only fictional engineering examples. The following paths are ignored by default: user input, extracted materials, generated sites, previews, deployment packages, environment files, credentials, browser state, and cloud configuration.

Before public deployment, the plugin reports all detected phone numbers, email addresses, postal locations, portrait images, WeChat QR codes, personal IDs, and other potentially identifying fields. Publication is field-level and opt-in at the final action boundary.

The plugin never commits, logs, prints, or stores cloud credentials. It does not inspect browser cookies, storage, profiles, or passwords. It does not upload user materials to GitHub.

## Error Handling

- Unsupported, encrypted, or corrupt files produce a file-specific explanation while other usable files continue processing.
- Low-resolution images are flagged. The plugin may crop or perform non-generative enhancement, but it cannot invent missing technical details.
- Conflicting facts produce a review item with both sources.
- Missing evidence removes or qualifies the claim instead of filling it creatively.
- Build failures preserve structured data and extracted assets for retry.
- Deployment failures preserve the verified ZIP and deployment log. Retries do not create duplicate paid resources.
- Any unexpected request for payment, renewal, credentials, or broader permissions stops the workflow.

## Testing Strategy

### Skill Behavioral Tests

Baseline scenarios are run without the skill to identify failures such as invented metrics, unsupported ownership claims, weak project narratives, missing privacy confirmation, and deployment overreach. The same scenarios are run with the skill until behavior conforms to this design.

### Script and Schema Tests

- Fixture-driven DOCX, PDF, PPTX, and image extraction tests.
- Schema validation for complete, partial, conflicting, and malformed data.
- Image crop and resolution checks.
- Secret and privacy scanning tests.
- Package layout and asset-path tests.
- QR encoding and decode verification.

### Template Tests

- Deterministic builds for all three templates using fictional data.
- Responsive browser checks at phone, tablet, and desktop sizes.
- Navigation, modal/page, image, telephone, email, and empty-state checks.
- Accessibility checks for headings, alternative text, focus behavior, and color contrast.

### End-to-End Acceptance Test

A fictional engineering resume, technical report, slide deck, and image set are processed from intake through three previews. One template is selected, locally served, validated, packaged, and deployed to a disposable CloudBase test service or validated with a deployment dry run when live cloud mutation is not authorized.

## GitHub Distribution and Releases

The repository is public and MIT licensed. It contains a valid Codex plugin manifest, a repository marketplace manifest, installation instructions, fictional examples, automated tests, and no real personal data.

Releases use semantic version tags. Version 1.0.0 is reached only after plugin validation, fresh-install verification, behavioral skill tests, script tests, three-template builds, privacy scans, and the end-to-end acceptance test pass.

## Final Deliverables

- Public-ready Git repository named `engineering-portfolio-builder`.
- Installable Codex plugin and discoverable skill.
- Three responsive engineering portfolio templates.
- Deterministic extraction, validation, packaging, and QR scripts.
- Fictional examples and tests.
- Verified local installation instructions.
- A release checklist for publishing to GitHub.

