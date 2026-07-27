# Project Report

<!--
This is the WHOLE-PROJECT report, spanning every loop — not one loop's
experiment. A single evolving file: refreshed (overwritten) at each loop's
stage 4, always reflecting the project as it stands now. Its per-loop
counterpart is `experiment-report.md`.

Writing principles:
- Audience: a non-data-scientist decision-maker. They may not know ML jargon or
  what an evaluation metric means. On first use, explain each technical term and
  each metric in one plain sentence — what it measures, how to read it, and what
  counts as a good vs. bad value (e.g. "F1 (a 0-1 score balancing false alarms
  and misses; higher is better, 1.0 is perfect)"). Prefer plain words and avoid
  difficult ones — but do NOT force a necessary technical term into an
  inaccurate plain word; keep the correct term and gloss it.
- Summary first, depth later. The Executive Summary must stand alone; the
  technical appendix (Key Decisions, Technical Details) is for readers who want
  the how and why.
- Whole-project, not this loop. Every section spans all loops run so far. The
  Experiment Journey is the cross-loop story; do not just restate the current
  loop's report.
- SELF-CONTAINED. A reader understands the project from THIS report alone,
  without opening any code, config, or other document. Cited files are evidence
  for claims already spelled out here, not pointers the reader must follow.
- Every number cites its source (a loop's `experiment-report.md`, a metrics
  file, or the ledger).
- No placeholders. Every section holds real content; if something is genuinely
  N/A (e.g. first loop, no roadmap), say so and why.

Sources: `experiment-ledger.md` (cross-loop index), `long-term-plan.md` (if it
exists), the PRD in `docs/human/raw/` (including its **Serving Requirements**,
which the Serving & Cost section is judged against), `knowledge/decisions/`
(ADRs), the `knowledge/` topic docs (data/model/eval, and `serving.md` if it
exists), `artifact-map.md`, and — for the newest loop, whose ledger row is not
written until wrap-up — this loop's `experiment-report.md` directly.

First loop → say so; Journey and Roadmap then cover the single loop.
-->

## Executive Summary
<!-- Plain-language, stands alone. What the project is trying to achieve (from
     the PRD goals and success metrics), where it stands now against that goal,
     the single headline result to date, and a one-line status. No jargon
     without a gloss. -->

## Progress & Roadmap
<!-- The project's trajectory across loops. From `long-term-plan.md`: which
     loop-sized goals are done, in progress, and remaining, with dependencies.
     If there is no long-term plan, list the loops completed so far and what each
     aimed to do. -->

## Experiment Journey
<!-- The cross-loop story. A table of every experiment across ALL loops — loop,
     what it tried, key result, outcome (success/fail/mixed) — sourced from
     `experiment-ledger.md` and the cited loop reports, PLUS the current loop
     (take its row from this loop's just-written `experiment-report.md`, since
     the ledger is not updated until wrap-up). Follow the table with prose: how
     the project evolved, what each loop taught, why directions changed. Not a
     restatement of the current loop. -->

## Current Best & State
<!-- The best-performing approach/configuration to date and its metrics (cite
     the source loop report / metrics file), and the current state of the
     project — what is kept and reusable (from `artifact-map.md`: final
     checkpoints, datasets, eval outputs). -->

## Serving & Cost
<!-- Can this go to production, how fast is it, and what does it cost? Answer
     for the project as it stands now, across all loops.

     Take the current best approach (the one named in Current Best & State) and
     give, for latency (p50/p95), throughput, and cost: the measured value, the
     target from the PRD's Serving Requirements, and whether the target is met.
     State the measurement condition alongside — hardware, batch size,
     concurrent requests, input length. Numbers without it cannot be compared
     across loops.

     Cost is three figures, each labeled measured or estimated: per-request
     inference cost, the cumulative training/tuning cost across all loops so
     far, and the monthly running-cost estimate with the traffic volume it
     assumes.

     If more than one loop measured these, show how they moved — a small table
     of loop vs. figure makes progress (or regression) visible at a glance.

     Every number cites its source: the loop report it came from, a metrics
     file, or `knowledge/serving.md`. Explain each term plainly on first use.

     If the PRD says the project has no serving requirement, write "N/A" and
     one sentence of why. If it has one but no loop has measured yet, say that
     plainly — an unmeasured requirement is a real status a decision-maker
     needs, not a gap to paper over with estimates. -->

## Key Decisions
<!-- APPENDIX. The significant choices that shaped the project and why, distilled
     from `knowledge/decisions/` (ADRs): what was decided, the alternatives, and
     the consequence. Tag each with the loop it was made in. -->

## Technical Details
<!-- APPENDIX. A self-contained summary of the data, model/method, and
     evaluation setup as they stand now (from the `knowledge/` topic docs),
     restated inline so the report stands alone. Enough for a technical reader to
     understand how results were produced. -->

## Terms & Metrics
<!-- Plain-language glossary of the jargon and every metric used in this report
     — evaluation metrics AND serving metrics (p50/p95 latency, throughput, the
     cost figures): what each measures, how to read it, and what a good vs. bad
     value looks like. For the non-data-scientist reader. -->

## Next Steps
<!-- Where the project goes next: the next goal (from `long-term-plan.md` if it
     exists) and the recommendation flowing from the latest loop's conclusions.
     Plain words. -->
