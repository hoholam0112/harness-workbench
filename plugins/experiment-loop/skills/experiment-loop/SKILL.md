---
name: experiment-loop
description: Use when working on ML experiments in this project - starting or resuming an experiment loop, onboarding the project (bootstrap), designing experiments, tech design, implementation, running experiments, or wrapping up a loop. Acts as a dashboard for loop state.
---

# Experiment Loop

Agentic loop for ML experiment automation. The main session controls the
loop; verification runs in subagents. This file stays thin: stage details
live in `references/` and are loaded only when entering a stage.

## On Invocation: Dashboard

1. Check onboarding: if `docs/index.md` does not exist, the project is not
   onboarded. Explain stage 0 and load `references/bootstrap.md`.
2. Find the latest loop state: `docs/agent/loops/*/state.json` (directories sort
   chronologically by name). If none exists, offer: (a) start the first loop
   (stage 1), (b) run bootstrap (stage 0).
3. If state exists, summarize `loop_id`, `stage`, `status`, `current_task`,
   plus any `pending_decisions` and running `jobs`. Offer:
   (a) continue from the recorded point, (b) start a new loop,
   (c) re-enter a specific stage, (d) run bootstrap (stage 0). If the latest
   loop's `status` is `done`, the natural default is (b).
4. Always include the bootstrap option in the choices above, even when the
   project is already onboarded — it re-runs stage 0 to restructure docs,
   re-seed the wiki, refresh `CLAUDE.md`, or revisit MCP setup. It normally
   runs once per project, so confirm intent before restructuring existing docs.
5. Load the reference for the chosen stage and proceed.

## Stages

| Stage | Reference | Done when |
|-------|-----------|-----------|
| 0 bootstrap (once per project) | references/bootstrap.md | Layout + index.md + PRD exist; user confirms |
| 0.5 long-term plan (as needed) | references/long-term-plan.md | User approves multi-loop plan |
| 1 experiment design | references/experiment-design.md | User approves Experiment Design Doc |
| 2 tech design | references/tech-design.md | User approves Tech Design Spec + Implementation Plan |
| 3 implementation | references/implementation.md | All tasks done, tests pass, gate passed |
| 4 experiment | references/experiment.md | User reviewed the loop and project reports |
| 5 wrap-up | references/wrap-up.md | GC done, wiki verified, state closed |

Stages run 1→5 within a loop. Enter 0.5 from stage 1 when the user's
requirement doesn't fit one loop; if unsure, ask the user.

## Shared Principles (all stages)

- **Code grounding.** Docs are for fast context only. Read the actual code
  before judging, implementing, or verifying. When docs and code disagree,
  trust the code.
- **Claim-level sourcing.** Every claim in an agent-authored document cites
  its source file (and line where useful). Applies to all stages — design
  docs, specs, plans, reports, and wiki alike.
- **Template compliance (binding).** Every document in the Templates list is
  created by **copying its template file**, not by writing freely "inspired by"
  it. The template is a **mandatory floor, not a cap**: fill all of it, then add
  beyond it when that serves the reader. Non-negotiable:
  - Keep **every** section heading from the template, unrenamed and in order.
    Do not drop, rename, merge, or reorder the required sections. You **may**
    add extra sections, subsections, tables, or charts beyond the floor when
    they help the reader — additions are encouraged, never penalized.
  - Each template embeds its requirements as guidance (HTML comments, or `FILL`
    markers in the HTML report). Replace each one with real content, then delete
    the guidance marker. A finished document contains **no** template guidance
    text and **no** `FILL` marker.
  - Every section holds real content. No section may be empty, a restatement of
    its own heading, or a placeholder. If a section is genuinely not applicable,
    write "N/A" **and one sentence of why** — silence is not allowed.
  - Where a template states a quantity ("at least 20-30 cases", "sample rows"),
    meet it literally.
  This is enforced by the verification gate; a document that deviates from its
  template is a Major issue, not a stylistic one.
- **Progressive context loading, with an always-read core.** Don't load
  everything up front, but some context is read **every time**, not "if the task
  seems to need it" — judging need is exactly how known facts get skipped. On
  user input, always read: `docs/glossary.md` (align terminology; ask when a
  term is ambiguous), `docs/index.md`, and every knowledge doc `index.md` marks
  as **always-read core** (the must-know project facts and constraints). Only
  then open the additional documents the specific task needs.
- **Consult feedback before work.** Before starting any stage's work, read
  `docs/agent/guidance/human-feedback.md` and honor its rules — past
  corrections and stated preferences. This is part of the always-read core.
- **Log human input during the loop; consolidate at wrap-up.** As the loop
  runs, append every human choice (the option-questions and their answers),
  prompt instruction, correction, and stated preference to
  `docs/agent/loops/<loop-id>/loop-log.md` — a cheap, complete record
  (`templates/loop-log.md`). At wrap-up, distill it: significant decisions
  become ADRs in `docs/agent/knowledge/decisions/`
  (`templates/decision-record.md`), and corrections/preferences worth carrying
  forward go to `docs/agent/guidance/human-feedback.md`.
- **Capture durable facts on the spot — do NOT wait for wrap-up.** The loop log
  is a raw dump distilled later; that is too slow for a fact you must not forget.
  The moment the user states a **durable project fact or constraint** (about the
  data, the system, the goal, or a hard limit — anything that stays true beyond
  this turn), write it to its wiki home **immediately** (`knowledge/` per the
  "Which bucket?" rule in `references/llm-wiki.md`; a corrected/preferred way of
  working → `guidance/human-feedback.md`; a term → `docs/glossary.md`), cite its
  source, mark it always-read in `docs/index.md` if it is core, then tell the
  user in one line where you saved it. Logging it only to the loop log does not
  count — that is the gap that makes context get forgotten.
- **Repeating yourself is a bug signal.** If the user tells you something you
  should already know — restating a fact, re-explaining context, or correcting
  the same mistake twice — treat it as proof the fact was never captured or is
  not being read. Do not just apologize and move on: capture it to its wiki home
  right then (per the rule above), and if it was already written, fix why it
  wasn't read (wrong location, not marked always-read). Close the leak, not just
  the symptom.
- **Escalation.** Stop the loop, set `status: "escalated"`, record the
  question in `state.json.pending_decisions`, describe the situation to the
  user, and present 2-3 options.
- **Verification gates** run in subagents per
  `references/verification-gate.md`. After a stage's gate passes, summarize
  the stage's work to the user before moving on.
- **Language.** All docs and code in English. `docs/glossary.md` may contain
  Korean. Communicate with the user in Korean (technical terms in English).
- **Plain language.** When explaining to the user (before and after work,
  and at gate summaries), write so it reads without effort. Concretely:
  - State the conclusion first, then a short reason.
  - One idea per sentence; keep sentences short.
  - Use a technical term only when necessary, and add a short plain gloss the
    first time (e.g. "검증 게이트(결과물을 다시 검사하는 단계)").
  - Avoid transliterated English loanwords when a plain Korean word exists
    (write "출처를 따라갈 수 있는지", not "추적성"; "효과 큰 순서", not "레버리지 순").
  - Prefer concrete verbs over abstract nouns ("검사한다", not "검증을 수행한다").

## Project Layout & Wiki

The doc layout (`docs/` tree), the `knowledge/` vs `guidance/` split, and the
`loop-id` convention live in `references/llm-wiki.md` ("Layout — what goes
where"). The **LLM wiki** (`docs/agent/knowledge/`, ADRs in
`knowledge/decisions/`) keeps project context current across loops; its writing
principles and update procedure are in the same file, and it is maintained at
each loop's wrap-up (`references/wrap-up.md`).

## state.json

`docs/agent/loops/<loop-id>/state.json` is the minimum for resume-after-
interruption and handoff. Update it on every stage transition, escalation, and
job start. Full field spec: `references/state.md`.

## Templates

Copy the matching template when creating a document — see **Template compliance
(binding)** under Shared Principles for the rules (keep every section, fill each,
remove all guidance markers, no placeholders). Templates: `prd.md`,
`experiment-design-doc.md`, `tech-design-spec.md`, `task-spec.md`,
`implementation-plan.md`, `experiment-report.md`, `project-report.md`,
`experiment-ledger.md`, `code-map.md`, `artifact-map.md`, `decision-record.md`,
`human-feedback.md`, `loop-log.md`.
