# Experiment Report: <loop-id>

<!--
Writing principles:
- Audience: a non-data-scientist. They may not know ML jargon or what an
  evaluation metric means. On first use, explain each technical term and each
  metric in one plain sentence — what it measures, how to read it, and what
  counts as a good vs. bad value (e.g. "F1 (a 0-1 score balancing false alarms
  and misses; higher is better, 1.0 is perfect)"). Prefer plain words and avoid
  difficult ones — but do NOT force a necessary technical term into an
  inaccurate plain word; keep the correct term and gloss it.
- Detailed but easy, undergraduate-readable. Explain, don't just list.
- SELF-CONTAINED. A reader must understand the whole experiment from THIS
  report alone, without opening any code, config, or other document. Do not
  write "see the tech design" or "refer to train.py" as a substitute for
  explaining. When you cite a source file, it is evidence for a claim you have
  already spelled out here — not a pointer the reader must follow to understand.
  Restate the necessary context (what the data is, what the model does, what
  each metric means) inside the report.
- Every number cites its source output file (evidence, not a stand-in for
  explanation).
- No placeholders. Every section holds real content; if something is genuinely
  N/A, say so and why.

This markdown feeds the HTML report (see the "HTML rendering" section of the
experiment-report skill); the sections below map to its six tabs, plus setup
and acceptance-criteria for the verification gate.
-->

## Overview
<!-- Background: why this experiment exists. Problem definition in plain words.
     Data summary, experiment-history summary, headline accuracy and
     performance metrics. A reader should grasp the whole story from this
     section alone, then get the depth in later sections. -->

## Data
<!-- Collection: where the data came from and how. Preprocessing: every step,
     in order. Composition: sizes of train/val/test splits, class balance,
     key statistics. Sample data: at least a few real rows/examples shown
     inline so the reader sees what the data actually looks like. Define any
     dataset-specific terms. -->

## Model
<!-- For each model/approach tried: what it does, explained from scratch.
     Include pseudo code AND the key formulas (with each symbol defined).
     Include every prompt VERBATIM (original text, in a code block). A reader
     who has never seen the codebase should be able to understand the method
     from this section without opening any source file. -->

## Experiment History
<!-- A table of every experiment run: config/variant, key result, and a short
     takeaway per row. Follow the table with prose explaining what changed
     between runs and why, so the progression is a narrative, not just numbers. -->

## Error Analysis
<!-- At least 20-30 sampled cases, mixing wrong and correct. For each: input
     data, ground-truth answer, model output, side by side. Group by error
     type and explain the patterns you see — what fails, and a hypothesis for
     why. The samples are shown inline (not linked out). -->

## Serving & Cost
<!-- What it costs to actually run this in production, and how fast it is —
     measured this loop per the tech design spec's Serving Measurement Plan.

     For latency (p50 and p95), throughput, and cost, give three things each:
     the measured value, the target from the design doc's Constraints, and
     whether the target is met. A table works well here.

     State the measurement condition next to the numbers — hardware, batch
     size, concurrent requests, input length, request count. A latency figure
     without its condition cannot be reproduced or compared against the next
     loop's, so it does not count as measured.

     Cost is three separate figures; label each one "measured" or "estimated":
     per-request inference cost, this loop's one-off training/tuning cost, and
     the monthly running-cost estimate — and for the monthly figure, say what
     traffic volume it assumes.

     Explain each term plainly on first use, for a reader who does not know
     them (e.g. "p95 latency (the response time that 95 out of 100 requests
     come in under — the slow tail users notice; lower is better)").

     Every number cites its output file. If this loop measured no serving
     numbers, write "N/A" and repeat the one-sentence reason from the design
     doc — do not estimate figures to fill the section. -->

## Setup / Reproducibility
<!-- Commit hash, configs (values shown inline, not just a path), data
     versions, seeds, hardware/runtime. Enough that someone could reproduce
     the run from this section alone. -->

## Acceptance Criteria Check
<!-- Each acceptance criterion restated, then pass/fail with the concrete
     evidence (numbers + source file). -->

## Conclusions & Next Steps
<!-- What the results mean in plain words, whether the hypothesis held, and
     recommended follow-up. -->
