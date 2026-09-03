# Portfolio data contract

Read this reference while extracting and normalizing resume and project material.

## Source ledger

Assign each source a stable local identifier such as `resume.docx#project-2`, `report.pdf#p18`, `slides.pptx#slide-7`, or `image.png`. Keep original files private. Store only normalized public content and approved derived media in the generated site.

For every claim, record:

- the exact public-facing text;
- one or more source identifiers;
- status: `supported`, `user-confirmed`, `conflicting`, or `unresolved`;
- whether the claim concerns the candidate's role, action, result, metric, or ownership.

For every media asset, record:

- source identifier and page or slide;
- project and narrative section it supports;
- crop status and legibility;
- alternative text;
- publication approval.

## Project story

Each resume project gets four evidence-backed sections:

1. **Background** — context, system, and objective.
2. **Problem** — concrete engineering constraint or failure mode.
3. **Action** — what the candidate personally designed, modeled, calculated, simulated, tested, or coordinated.
4. **Result** — verified deliverable or outcome. Do not invent numeric improvement.

Place each approved figure immediately after or beside the section it proves. Prefer a clean source image over a screenshot. A paper screenshot must exclude body text, headers, footers, page numbers, and captions such as “Figure 4-2”. Do not use generative editing to create or alter technical evidence.

## Conflict and ownership rules

- User corrections override extracted wording, but preserve the superseded source entry in the local ledger.
- A reference thesis or paper describes its author's work unless the candidate's own source explicitly establishes participation.
- “Designed and simulated” does not imply “fabricated”, “assembled”, “commissioned”, or “deployed”.
- Tool names do not prove proficiency level. Results do not prove sole ownership.
- Missing evidence remains visible in the review report and is excluded from confident public claims.

## Publication fields

Publication is opt-in per field. Treat phone, personal email, precise location, portrait, signatures, document IDs, social handles, WeChat QR codes, and account identifiers as personal data. The disclosure shown before upload must enumerate the exact included fields and filenames, not a generic warning.

