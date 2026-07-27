---
name: experiment-report
description: Writes the ML experiment reports - this loop's experiment report and the whole-project report, in markdown and then self-contained HTML. Use whenever the user asks for a report or a results write-up, in any phrasing - "보고서 써줘", "실험 보고서 작성해줘", "결과 정리해줘", "리포트 만들어줘", "결과 문서로 만들어줘", "프로젝트 보고서 갱신해줘" - and whenever stage 4 of the experiment loop reaches its reporting step. Covers the required sections, the two-pass fill-then-extend method, HTML rendering, and the verification gates for both. Always use this skill instead of writing a report directly.
---

<!-- BEGIN shared-principles -->
## Core Principles

Paths below are relative to this skill's own directory.

- **Code grounding.** Docs are for fast context only. Read the actual code
  before judging, implementing, or verifying. When docs and code disagree,
  trust the code.
- **Claim-level sourcing.** Every claim in an agent-authored document cites its
  source file (and line where useful).
- **Template compliance (binding).** Create every document by copying its
  template from `../../shared/templates/`, never by writing freely. Keep every
  section heading unrenamed and in order, fill each with real content, delete
  every guidance comment and `FILL` marker, and meet stated quantities
  literally. "N/A" needs one sentence of why. The template is a floor, not a
  cap — additions are welcome. Full rules:
  `../../shared/template-compliance.md`. A deviation is a Major issue, not a
  stylistic one.
- **Always-read core.** On user input, always read `docs/glossary.md`,
  `docs/index.md`, every knowledge doc that `index.md` marks as always-read
  core, and `docs/agent/guidance/human-feedback.md`. Read these every time —
  judging whether you need them is exactly how known facts get skipped. Align
  the user's terms against the glossary, and ask them rather than guess when a
  term they used is ambiguous. Only then open what the specific task needs.
- **Log human input.** Append every human choice, instruction, correction, and
  stated preference to `docs/agent/loops/<loop-id>/loop-log.md` as it happens.
  Completeness beats polish.
- **Durable facts go to the wiki immediately.** The moment the user states a
  fact or constraint that stays true beyond this turn, invoke the
  `experiment-wiki` skill and write it to its home now — not at wrap-up. Then
  tell the user in one line where you saved it. If the user tells you something
  you should already know, that is proof the fact was never captured or is not
  being read: capture it right then, and fix why it was not read.
- **Escalation.** Stop, set `status: "escalated"` in `state.json`, record the
  question in `pending_decisions`, describe the situation to the user, and
  present 2-3 options.
- **Verification gates** run in subagents per
  `../../shared/verification-gate.md`. Subagents verify; they never execute the
  work. After a gate passes, summarize what was produced before moving on.
- **Language.** All docs and code in English. `docs/glossary.md` may contain
  Korean. Talk to the user in Korean (technical terms in English).
- **Plain language.** State the conclusion first, then a short reason. One idea
  per sentence; keep sentences short. Gloss a technical term the first time you
  use it. Prefer plain Korean over transliterated English (write "출처를 따라갈
  수 있는지", not "추적성"). Prefer concrete verbs over abstract nouns.
<!-- END shared-principles -->

# Experiment Reports

**Purpose:** produce the two reports and verify them before the user sees them.

## Must read first

If this skill was not invoked by the experiment loop (e.g. the user asked for
a report directly), determine the current loop from the most recent
`docs/agent/loops/*/state.json` — directories sort chronologically by name, so
the last one is the current loop.

- this loop's `experiment-design.md` — the acceptance criteria and the serving
  targets in its Constraints, which the reports judge results against;
- this loop's `tech-design-spec.md` — the metrics and thresholds;
- the actual output files the numbers come from (metrics files, logs);
- for the project report: `docs/agent/knowledge/experiment-ledger.md`,
  `docs/agent/knowledge/long-term-plan.md` (if it exists), the PRD in
  `docs/human/raw/` including its Serving Requirements,
  `docs/agent/knowledge/decisions/`, the `docs/agent/knowledge/` topic docs
  (data/model/eval, and `serving.md` if it exists).

## Report

This skill produces **two** reports, each written as markdown (the gated source)
then rendered to HTML: the **loop report** — this loop's experiment — and the
**project report** — the whole project across all loops. Produce both, then ask
the user to review them together.

### A. Loop report

1. Write `experiment-report.md` in the loop directory from
   `../../shared/templates/experiment-report.md`, grounded in actual outputs (metrics
   files, logs). Cite the source file for every claim. Two passes:
   1. **Fill the floor.** Complete every mandatory section of the template to
      the required depth — this is the non-negotiable baseline, not the goal.
   2. **Extend for the reader.** Then stop and ask: *what would help the user
      understand THIS experiment better?* Add whatever the standard sections
      miss — an extra comparison, a breakdown by slice, a failure taxonomy, a
      chart that makes a result obvious at a glance, a "what surprised us" note.
      The template is a floor, not a cap; adding beyond it is expected. Briefly
      say why each addition helps (one line) so the choice is deliberate, not
      decoration. Don't invent data — additions must come from the same outputs.
2. Verification gate (../../shared/verification-gate.md). It checks the report
   against the **same criteria it was written to** — the writing principles and
   per-section requirements in `../../shared/templates/experiment-report.md`, plus the
   Template compliance principle (every section filled to depth, no
   placeholders) — so the guidance and the gate never diverge. Flag any
   violation by severity (e.g. an unexplained metric or unglossed term, a
   section that defers understanding to code or another doc, a thin or
   placeholder section → Major). Plus these checks only the gate performs:
   - every number in the report traces to an output file;
   - each acceptance criterion is explicitly evaluated pass/fail;
   - **serving**: each serving target from the design doc's Constraints appears
     in Serving & Cost with its measured value, its measurement condition, and
     a met/not-met judgement; the three cost figures are present and each
     labeled measured or estimated, with the monthly estimate naming its
     assumed traffic. A number without its measurement condition, or an
     estimate presented as a measurement, is a Major issue. If the section says
     "N/A", the reason matches the design doc's — a section filled with
     estimates when the design doc planned measurement is a Major issue;
   - limitations are noted.
3. Render a self-contained HTML version into `docs/shared/<loop-id>-report.html`
   for the user, built from this loop's real outputs — follow the **HTML
   rendering** section below, then run its verification gate before handing over.

### B. Project report

The whole-project view, spanning every loop — refreshed each loop, not scoped to
this one. A single evolving file: overwrite it so it always reflects the project
as it stands now.

4. Write/refresh `docs/agent/knowledge/project-report.md` from
   `../../shared/templates/project-report.md`, grounded in the cross-loop sources (ledger,
   long-term plan, PRD, ADRs, knowledge topic docs, artifact map). **The ledger
   has no row for this loop until wrap-up — take the current loop's entry from
   the loop report you just wrote in step 1.** Same two passes as the loop
   report: fill the floor, then extend for the reader. Every section spans all
   loops; the Experiment Journey is the cross-loop story, not a restatement of
   this loop.
5. Verification gate (../../shared/verification-gate.md), same unified pattern: it
   checks against `../../shared/templates/project-report.md`'s writing principles and
   per-section requirements plus the Template compliance principle. Flag
   violations by severity. Plus these checks only the gate performs:
   - every number traces to its source (a loop's `experiment-report.md`, a
     metrics file, or the ledger);
   - the report genuinely spans the whole project across loops — not a copy or
     restatement of this single loop's report (→ Major if it is);
   - **serving**: Serving & Cost judges the current best approach against the
     PRD's Serving Requirements — measured value, target, met/not-met — with
     the measurement condition stated and all three cost figures labeled
     measured or estimated. If no loop has measured yet, the section says so
     plainly rather than filling in estimates (→ Major if it estimates instead).
     If the PRD has no serving requirement, "N/A" with the reason.
6. Render `docs/shared/project-report.html`, built from the project report's real
   content — follow the **HTML rendering** section below, then run its
   verification gate before handing over.

### Then

7. Request user review of **both** reports. If the experiment loop called this
   skill, set `status: awaiting_user_review`; otherwise just hand the reports
   to the user — a standalone invocation must not touch `state.json`, since
   that would move the loop's position without the loop asking for it.

## HTML rendering

How to render either markdown report into a polished, self-contained HTML page
for the user. Build it directly following the guidance below. Do not copy demo
data or a fixed example into the page — concrete placeholder numbers get left in
by mistake and mislead the reader. Every value must come from the markdown
report and its real outputs.

Which sections become tabs depends on the report: the **loop report** uses the
six tabs below; the **project report** presents its own template's sections
(Executive Summary, Progress & Roadmap, Experiment Journey, Current Best & State,
Serving & Cost, Key Decisions, Technical Details, Terms & Metrics, Next Steps) as
the tabs. All
other rules in this section — writing principles, design, charts, extend, gate —
apply to both unchanged.

### Writing principles

- Audience: a non-data-scientist who may not know ML jargon or evaluation
  metrics. On first use, explain each technical term and each metric in one plain
  sentence — what it measures, how to read it, and what a good vs. bad value is
  (e.g. "F1 (a 0-1 score balancing false alarms and misses; higher is better)").
  Avoid difficult words, but do NOT force a necessary technical term into an
  inaccurate plain word — keep the correct term and gloss it.
- Detailed but easy. Use jargon only when necessary, and gloss it the first time.
  An undergraduate should read it without effort.
- Self-contained in content: the reader understands the whole experiment from
  the report alone, without opening any code, config, or other document. Restate
  the needed context (data, method, metric meanings) inline. Cited files are
  evidence, not pointers the reader must follow to understand.
- Self-contained as a file: one `.html` that opens directly in a browser with no
  install step. Inline all CSS and JS; embed any image as a data URI. No external
  stylesheets, fonts, scripts, or CDN links — they may be blocked and the file
  must work offline.
- Ground every number and claim in the markdown report and its cited output
  files. The HTML presents the markdown report; it is not a new source.

### Tabs and their contents (loop report)

The loop report's six tabs: Overview, Data, Model, Experiment History, Error
Analysis, Serving & Cost. (The project report instead uses its template's
sections as tabs — see the intro above.)

- **Overview** — background, problem definition, headline metrics (as KPI
  tiles), one summarizing chart, and a result summary that states each
  acceptance criterion pass/fail.
- **Data** — collection, preprocessing, composition (split sizes in a table),
  and 3-5 real sample rows shown verbatim.
- **Model** — each model/method tried, explained plainly, with pseudocode,
  formulas (every symbol defined), and every prompt verbatim.
- **Experiment History** — the record of experiments **across loops**, not the
  training curve of a single run. One row per experiment/variant, covering this
  loop's runs **and** prior loops (source: `experiment-ledger.md` and the cited
  reports): what each tried (key config), its headline result, and outcome. A
  chart here compares experiments to each other (e.g. a metric per variant or
  across loops) — do **not** plot a single run's metric per epoch and call it
  history; that belongs in the Model/Overview discussion of one run, not here.
  Follow the table with prose on what changed between experiments and why.
  If this is the first loop, say so and show the single row.
- **Error Analysis** — 20-30 real cases (mix of wrong and correct), each showing
  input, ground-truth answer, and model output at a glance, plus discussion of
  the error patterns.
- **Serving & Cost** — how fast it runs and what it costs, from the markdown
  report's Serving & Cost section. A table of measured value vs. target vs.
  met/not-met for latency (p50/p95), throughput, and the three cost figures.
  Put the measurement condition (hardware, batch size, concurrency, input
  length) in plain sight next to the table, not in a footnote — it is what
  makes the numbers mean anything. Gloss p50/p95, throughput, and each cost
  figure on first use, and mark every cost figure measured or estimated. If the
  loop measured none, the tab says so with the reason; do not fill it with
  estimates.

### Design

Design it like a senior frontend engineer, but keep it a system, not ad-hoc:

- **Color**: define a small set of CSS custom properties (an accent, ok/bad, and
  a categorical set for chart series); support light and dark via
  `prefers-color-scheme`. Use the categorical set for series, not hand-picked hex.
- **Type**: one system sans stack for text, one mono stack for code/prompts; a
  small fixed size scale — don't sprinkle new sizes.
- **Layout**: a centered column; cards and KPI tiles on a surface with a border
  and soft shadow; consistent spacing and radius. Wrap wide tables in a
  horizontally scrolling container so the page never scrolls sideways.

### Charts (inline SVG, no library)

Draw charts as hand-written inline SVG. Never add a charting library — a CDN
link will be blocked and break the file.

Pick the form by data: **bar** for comparing a metric across a few items
(variants, loops), **line** for a trend over an ordered axis, **table** when
exact values matter more than shape. If a chart doesn't help, use a table
instead of forcing one. Make sure each chart's x-axis is the thing being
compared — for Experiment History that is the experiment/variant, not epochs.

### Extend for the reader

The six tabs are the floor. Once they hold real content, stop and ask: *what
would make THIS result click for the user?* Then add it — a per-slice breakdown,
a before/after comparison, an extra table, a short callout of the one thing that
surprised you. Judge each addition by "does this help the reader understand?",
not by decoration — and never invent data; additions draw from the same output
files.

### HTML verification gate

Run the gate (../../shared/verification-gate.md) on each HTML page before handing
it to the user. It checks the **same criteria the HTML was built to** — every
requirement in the Writing principles, the report's tabs/sections, Design, and
Charts (audience readability, per-section depth, self-contained file; for the
loop report, cross-loop Experiment History; for the project report, a
genuinely whole-project view; for both, a Serving & Cost tab whose numbers carry
their measurement condition and are labeled measured or estimated) — so guidance
and gate stay one and the same. Flag any violation by severity. **Open the rendered file in a browser and look**; do
not judge from the source. Plus these checks only the gate performs:

- **Opens and renders**: loads with no console errors; every tab switches and
  shows content; every chart draws with real data (no empty SVG, no leftover
  demo numbers).
- **Numbers trace**: every figure and chart value matches the source markdown
  report and its cited output files.

**Done when:** both reports are written, both gates passed, and both HTML pages
render. Hand both to the user for review. If the experiment loop called this
skill, return control to stage 4 with `status: awaiting_user_review`.
