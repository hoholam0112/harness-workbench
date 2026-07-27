# Stage 4: Experiment

**Purpose:** run the experiment and report the results.

## Must read first

The **always-read core** (SKILL.md → "Progressive context loading, with an
always-read core"): `docs/glossary.md`, `docs/index.md`, the always-read core
knowledge docs, and `docs/agent/guidance/human-feedback.md`. Plus for this stage:

- this loop's `tech-design-spec.md` — the exact commands, metrics, and
  thresholds that decide each acceptance criterion, the **Serving Measurement
  Plan** this stage executes, and the progress-logging plan the stall check
  relies on;
- this loop's `experiment-design.md` — the acceptance criteria to evaluate, and
  the serving targets in its Constraints that the measured numbers are judged
  against;
- `docs/agent/knowledge/artifact-map.md` — where artifacts are stored and what
  to register;
- `templates/experiment-report.md` when writing the loop markdown report (the
  HTML version follows the **HTML rendering** section of this reference).

For the project report (see the **Project report** section), also read the
cross-loop sources: `docs/agent/knowledge/experiment-ledger.md`,
`docs/agent/knowledge/long-term-plan.md` (if it exists), the PRD in
`docs/human/raw/` (including its **Serving Requirements**),
`docs/agent/knowledge/decisions/`, the relevant `docs/agent/knowledge/` topic
docs (data/model/eval, and `serving.md` if it exists), and
`templates/project-report.md`.

## Execution

- Steps per the tech design: data preparation → training → evaluation →
  serving measurement. Run the serving measurement per the spec's **Serving
  Measurement Plan** — its command, under its stated condition, writing to its
  output file. Skip this step only when the plan says "N/A"; do not skip it
  because the accuracy results already look decided. Record the measurement
  condition alongside the numbers in the output file, so the report can cite
  both from one place.
- Run long jobs (anything that could outlive the session) in the background:

  ```
  mkdir -p docs/agent/loops/<loop-id>/logs
  nohup <command> > docs/agent/loops/<loop-id>/logs/<job>.log 2>&1 &
  ```

  Record in `state.json.jobs`: command, PID, log path, expected outputs.
- Record enough to reproduce every run: commit hash, configs, seeds, data
  versions. Keep the run config alongside its outputs.
- Store artifacts (checkpoints, prepared datasets, run outputs, plots) in the
  project's artifact location (see the artifact map). Register each significant
  artifact in `docs/agent/knowledge/artifact-map.md` when produced — path,
  type, this loop, approx size, purpose, retention (`keep`/`temp`), config
  source. This map, not git, tracks artifacts that are too large to commit.

## Monitor and continue

Don't block the session waiting on a job. Schedule a re-check on an interval;
between checks the session can do other work or idle. Each check reads the log
and the PID, decides one of the outcomes below, then re-schedules or moves on.

- Pick the interval from the job's own cadence — about the gap between the
  progress lines the code emits (see tech design / implementation), not
  shorter. A job that logs every ~10 min needs no 1-minute check.
- Use the harness's scheduled re-check mechanism (e.g. a monitor, a scheduled
  wake-up, or a recurring `/loop`) to drive it. On a plain shell, an outer
  polling loop serves the same role. Never hold the session in a blocking
  `sleep`.

Each check, decide from log + PID:

| Signal | Outcome |
|--------|---------|
| Expected outputs exist / log shows completion | **Complete** — verify outputs are non-empty and well-formed, record the run config and register artifacts, then continue to the next step. |
| PID alive, new progress line since last check | **Running** — re-schedule the next check. |
| PID alive, no new progress line for ~30 min | **Stalled** — escalate (`status: escalated`); don't kill or rerun on your own. |
| PID gone, outputs incomplete / log shows error | **Failed** — rerun once at most; if it fails again, escalate instead of retrying. |

Auto-continue only through the experiment's own steps (data preparation →
training → evaluation → serving measurement): when one completes, start the
next without waiting for the user. Stop for the user only at the report-review gate below, and at any
escalation.

**On session resume** (fresh session, jobs still in `state.json.jobs`): for
each job, check whether the PID is alive and still matches the recorded command
(PIDs get reused). If alive, resume monitoring. If gone, decide from the log
whether it finished or failed, then continue or rerun per the table above.
Update `state.json` (`stage`, `current_task`, `jobs`) after every transition so
the next check — or the next session — starts from the truth.

## Report

This stage produces **two** reports, each written as markdown (the gated source)
then rendered to HTML: the **loop report** — this loop's experiment — and the
**project report** — the whole project across all loops. Produce both, then ask
the user to review them together.

### A. Loop report

1. Write `experiment-report.md` in the loop directory from
   `templates/experiment-report.md`, grounded in actual outputs (metrics
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
2. Verification gate (references/verification-gate.md). It checks the report
   against the **same criteria it was written to** — the writing principles and
   per-section requirements in `templates/experiment-report.md`, plus the
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
   `templates/project-report.md`, grounded in the cross-loop sources (ledger,
   long-term plan, PRD, ADRs, knowledge topic docs, artifact map). **The ledger
   has no row for this loop until wrap-up — take the current loop's entry from
   the loop report you just wrote in step 1.** Same two passes as the loop
   report: fill the floor, then extend for the reader. Every section spans all
   loops; the Experiment Journey is the cross-loop story, not a restatement of
   this loop.
5. Verification gate (references/verification-gate.md), same unified pattern: it
   checks against `templates/project-report.md`'s writing principles and
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

7. Request user review of **both** reports (`status: awaiting_user_review`).

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

Run the gate (references/verification-gate.md) on each HTML page before handing
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

**Done when:** user has reviewed **both** reports (loop and project). Set state
to stage 5.
