# Experiment Design: <loop-id>

<!--
Writing principle: detailed but easy. Avoid hard words; use jargon only when
necessary. An undergraduate should be able to read this without effort.
-->

## Problem Definition
<!-- What question this loop answers -->

## Data
<!-- Datasets, versions, splits — verified against actual files -->

## External Research
<!-- Recent papers and open-source repos. Put full findings in a separate
     file; keep only a summary and references here -->

## Prior Error Review
<!-- Look back at the errors from previous loops before designing this one.
     Read the last loop's experiment report (its Error Analysis section) and
     any relevant knowledge/decision notes. Summarize the main error patterns
     found, and state which of them this loop tries to address (and which it
     deliberately leaves out). Cite the source report/section for each claim.
     If this is the first loop (no prior report), say so. -->

## Hypothesis
<!-- A falsifiable statement. Where relevant, tie it back to the prior errors
     above -->

## Search Space
<!-- The decisions behind what is varied, not just a final list. For each factor
     (models, hyperparameters, features): the candidate values/range and why,
     plus the run budget (how many runs, how searched). Mark which high-impact
     choices the user picked from offered options; for any value filled by a
     recommended default, give the reason. No material factor may be fixed
     without having offered the user the choice first. -->

## Evaluation Method
<!-- Metrics, baselines, protocol -->

## Constraints
<!-- Serving constraints FIRST, then everything else.

     Serving. Restate the PRD's Serving Requirements as concrete numbers (and
     the current measured state from `knowledge/serving.md` if it exists): the
     target latency p50/p95 and the condition they must hold under, the target
     throughput, and the per-request and monthly cost ceilings with the traffic
     the monthly figure assumes. Do not write "see the PRD" — the numbers go
     here, because stage 2 builds the measurement plan from this section.
     Then state what THIS loop does about them: which of these targets it
     measures, or — if it measures none — one sentence of why (e.g. this loop
     only changes data preparation and leaves the inference path untouched).
     If the PRD says the project has no serving, write "No serving" and repeat
     that one-sentence reason.

     Other constraints: compute budget, data availability and licensing,
     deadlines, legal issues. -->

## Acceptance Criteria
<!-- Conditions that make this loop a success (accuracy, completeness, ...) -->

## Out of Scope
<!-- Explicitly excluded from this loop -->
