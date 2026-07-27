---
name: experiment-loop
description: Runs and tracks the ML experiment loop - the dashboard and stages 1 through 5. Use when the user starts, resumes, or checks an experiment loop - "실험 루프 시작", "이어서 진행해줘", "지금 몇 단계야", "다음 단계 진행", "루프 상태 보여줘" - or when working through experiment design, tech design, implementation, running the experiment, or wrap-up. Reads state.json to find where the loop stands. For onboarding a new project use experiment-bootstrap; for writing reports use experiment-report; for recording anything into the wiki use experiment-wiki.
---

# Experiment Loop

Agentic loop for ML experiment automation. The main session controls the
loop; verification runs in subagents. This file stays thin: stage details
live in `references/` and are loaded only when entering a stage.

## On Invocation: Dashboard

1. Check onboarding: if `docs/index.md` does not exist, the project is not
   onboarded. Explain stage 0 and **invoke the `experiment-bootstrap` skill**.
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
| 0 bootstrap (once per project) | `experiment-bootstrap` skill | Layout + index.md + PRD exist; user confirms |
| 0.5 long-term plan (as needed) | references/long-term-plan.md | User approves multi-loop plan |
| 1 experiment design | references/experiment-design.md | User approves Experiment Design Doc |
| 2 tech design | references/tech-design.md | User approves Tech Design Spec + Implementation Plan |
| 3 implementation | references/implementation.md | All tasks done, tests pass, gate passed |
| 4 experiment | references/experiment.md | User reviewed the loop and project reports |
| 5 wrap-up | references/wrap-up.md | GC done, wiki verified, state closed |

Stages run 1→5 within a loop. Enter 0.5 from stage 1 when the user's
requirement doesn't fit one loop; if unsure, ask the user.

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

## Loop control

- **state.json is the authority, not the conversation.** Whenever you need to
  know where the loop stands, re-read
  `docs/agent/loops/<loop-id>/state.json`. Do not rely on what the conversation
  remembers — in a long session that memory is the first thing to go. Field
  spec: `../../shared/state.md`.
- **Side requests do not move the loop.** If the user asks for something
  outside the current stage, do it without touching `state.json`. When it is
  done, say in one line where the loop stands. Do not resume on your own — the
  user decides when to continue.
- Update `state.json` on every stage transition, escalation, and job start.

## Project Layout & Wiki

The docs tree, the knowledge/guidance split, the `loop-id` convention, and the
rules for which document a fact belongs in all live in the `experiment-wiki`
skill. **Invoke it** when you need them — do not restate them here.

## Templates

Copy the matching template from `../../shared/templates/` when creating a
document — see **Template compliance (binding)** under Shared Principles for
the rules (keep every section, fill each, remove all guidance markers, no
placeholders). Templates: `prd.md`,
`experiment-design-doc.md`, `tech-design-spec.md`, `task-spec.md`,
`implementation-plan.md`, `experiment-report.md`, `project-report.md`,
`experiment-ledger.md`, `code-map.md`, `artifact-map.md`, `decision-record.md`,
`human-feedback.md`, `loop-log.md`.
